import type {
  Chat,
  Message,
  AppState,
  StorageData,
  ChatDisplayItem,
  StrategyType,
} from "@/types/chat";

export class StorageService {
  private readonly STORAGE_KEY = "upiichat-data";
  private readonly STORAGE_VERSION = 1;
  private cache: StorageData | null = null;

  private defaultAppState: AppState = {
    activeStrategy: "transformers",
    sidebarCollapsed: false, // Default to open for desktop
    activeChatId: null,
    theme: "dark",
    lastSyncTime: Date.now(),
  };

  private defaultData: StorageData = {
    chats: [],
    appState: this.defaultAppState,
    version: this.STORAGE_VERSION,
  };

  /**
   * Load data from localStorage with caching
   */
  private loadData(): StorageData {
    if (this.cache) return this.cache;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.cache = { ...this.defaultData };
        return this.cache;
      }

      const data = JSON.parse(stored) as StorageData;

      // Version migration if needed
      if (data.version !== this.STORAGE_VERSION) {
        this.cache = this.migrateData(data);
        return this.cache;
      }

      // Merge with defaults to ensure all properties exist
      this.cache = {
        ...this.defaultData,
        ...data,
        appState: { ...this.defaultAppState, ...data.appState },
      };

      // Ensure all chats have a messages array
      this.cache.chats = this.cache.chats.map((chat) => ({
        ...chat,
        messages: chat.messages || [],
      }));

      return this.cache;
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      this.cache = { ...this.defaultData };
      return this.cache;
    }
  }

  private saveData(): void {
    if (!this.cache) return;

    try {
      this.cache.appState.lastSyncTime = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));

      // Dispatch storage update event
      document.dispatchEvent(
        new CustomEvent("storage-updated", {
          detail: { data: this.cache },
        }),
      );
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }

  createChat(): Chat {
    const data = this.loadData();
    const now = Date.now();

    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: `Chat ${data.chats.length + 1}`, // Temporary title
      preview: "",
      timestamp: now,
      createdAt: now,
      isActive: true,
      messages: [],
      isEditable: true,
    };

    // Mark all other chats as inactive
    data.chats.forEach((chat) => (chat.isActive = false));

    // Add to beginning (most recent first)
    data.chats.unshift(newChat);
    data.appState.activeChatId = newChat.id;

    // Don't save yet - wait for first conversation
    return newChat;
  }

  addConversation(
    chatId: string,
    userMessage: string,
    assistantMessage: string,
  ): boolean {
    const data = this.loadData();
    const chat = data.chats.find((c) => c.id === chatId);

    if (!chat) return false;

    // Ensure messages array exists
    if (!chat.messages) {
      chat.messages = [];
    }

    const now = Date.now();

    // Create user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: userMessage,
      sender: "user",
      timestamp: now,
      strategy: data.appState.activeStrategy,
    };

    // Create assistant message
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      content: assistantMessage,
      sender: "assistant",
      timestamp: now + 1, // Slightly later
      strategy: data.appState.activeStrategy,
    };

    chat.messages.push(userMsg, assistantMsg);

    chat.timestamp = now;
    chat.preview =
      assistantMessage.substring(0, 100) +
      (assistantMessage.length > 100 ? "..." : "");

    if (chat.messages.length === 2) {
      chat.title =
        userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "");
    }

    this.moveToTop(chatId);

    this.saveData();

    document.dispatchEvent(
      new CustomEvent("conversation-added", {
        detail: { chatId, userMessage, assistantMessage },
      }),
    );

    return true;
  }

  private moveToTop(chatId: string): void {
    const data = this.loadData();
    const chatIndex = data.chats.findIndex((c) => c.id === chatId);

    if (chatIndex <= 0) return;

    const chat = data.chats[chatIndex];
    if (!chat) return;

    data.chats.splice(chatIndex, 1);

    data.chats.unshift(chat);

    document.dispatchEvent(
      new CustomEvent("sidebar-reorder", {
        detail: { movedChatId: chatId },
      }),
    );
  }

  getChat(chatId: string): Chat | null {
    const data = this.loadData();
    return data.chats.find((chat) => chat.id === chatId) || null;
  }

  getAllChats(): Chat[] {
    return this.loadData().chats;
  }

  getChatMessages(chatId: string): Message[] {
    const data = this.loadData();
    const chat = data.chats.find((c) => c.id === chatId);

    if (!chat || !chat.messages) return [];

    return chat.messages.sort((a, b) => a.timestamp - b.timestamp); // Chronological order
  }

  setActiveChat(chatId: string | null): void {
    const data = this.loadData();

    data.chats.forEach((chat) => {
      chat.isActive = chat.id === chatId;
    });

    data.appState.activeChatId = chatId;
    this.saveData();

    document.dispatchEvent(
      new CustomEvent("active-chat-changed", {
        detail: { chatId },
      }),
    );
  }

  getActiveChat(): string | null {
    return this.loadData().appState.activeChatId;
  }

  deleteChat(chatId: string): boolean {
    const data = this.loadData();
    const chatIndex = data.chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex === -1) return false;

    data.chats.splice(chatIndex, 1);

    if (data.appState.activeChatId === chatId) {
      data.appState.activeChatId =
        data.chats.length > 0 ? data.chats[0]?.id || null : null;
    }

    this.saveData();

    document.dispatchEvent(
      new CustomEvent("chat-deleted", {
        detail: { chatId },
      }),
    );

    return true;
  }

  /**
   * TODO: Handle chat title (for future 3-dots menu)
   */
  updateChatTitle(chatId: string, newTitle: string): boolean {
    const data = this.loadData();
    const chat = data.chats.find((c) => c.id === chatId);

    if (!chat) return false;

    chat.title = newTitle;
    this.saveData();

    return true;
  }

  getAppState(): AppState {
    return this.loadData().appState;
  }

  updateAppState(updates: Partial<AppState>): AppState {
    const data = this.loadData();
    data.appState = { ...data.appState, ...updates };
    this.saveData();

    // Dispatch app state change event
    document.dispatchEvent(
      new CustomEvent("app-state-changed", {
        detail: { appState: data.appState },
      }),
    );

    return data.appState;
  }

  getCurrentStrategy(): StrategyType {
    return this.loadData().appState.activeStrategy;
  }

  getSidebarCollapsed(): boolean {
    return this.loadData().appState.sidebarCollapsed;
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.updateAppState({ sidebarCollapsed: collapsed });
  }

  getChatsForDisplay(): ChatDisplayItem[] {
    const chats = this.getAllChats();

    return chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      preview: chat.preview,
      timeDisplay: this.formatTimeDisplay(chat.timestamp),
      isActive: chat.isActive,
      messageCount: chat.messages?.length || 0,
      isEditable: chat.isEditable,
    }));
  }

  private formatTimeDisplay(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;

    return new Date(timestamp).toLocaleDateString();
  }

  /**
   * Handle migration between versions
   */
  private migrateData(oldData: any): StorageData {
    // Handle migration from old structure to new structure
    const migratedChats: Chat[] = [];

    if (oldData.chats && Array.isArray(oldData.chats)) {
      for (const oldChat of oldData.chats) {
        // Create new chat structure with messages array
        const newChat: Chat = {
          id: oldChat.id || crypto.randomUUID(),
          title: oldChat.title || "Untitled Chat",
          preview: oldChat.preview || "",
          timestamp: oldChat.timestamp || Date.now(),
          createdAt: oldChat.createdAt || Date.now(),
          isActive: oldChat.isActive || false,
          messages: [],
          isEditable: oldChat.isEditable !== false, // Default to true
        };

        // If there are separate messages, migrate them to the chat
        if (oldData.messages && Array.isArray(oldData.messages)) {
          const chatMessages = oldData.messages
            .filter((msg: any) => msg.chatId === oldChat.id)
            .map((msg: any) => ({
              id: msg.id || crypto.randomUUID(),
              content: msg.content || "",
              sender: msg.sender || "user",
              timestamp: msg.timestamp || Date.now(),
              strategy: msg.strategy || "transformers",
            })) as Message[];

          newChat.messages = chatMessages.sort(
            (a: Message, b: Message) => a.timestamp - b.timestamp,
          );
        }

        migratedChats.push(newChat);
      }
    }

    return {
      chats: migratedChats,
      appState: { ...this.defaultAppState, ...oldData.appState },
      version: this.STORAGE_VERSION,
    };
  }

  handleAssistantError(chatId: string): void {
    document.dispatchEvent(
      new CustomEvent("assistant-error", {
        detail: {
          chatId,
          message: "Chat error, please reload again or try a new question",
        },
      }),
    );
  }

  // NOTE: The following methods are commented out for now, but can be enabled for additional functionality
  /**
   * Clear all data (for reset functionality)
   */
  // clearAllData(): void {
  //   localStorage.removeItem(this.STORAGE_KEY);
  //   this.cache = null;
  //   document.dispatchEvent(new CustomEvent("storage-cleared"));
  // }
  //
  // refreshData(): void {
  //   this.cache = null;
  //   this.loadData(); // This will reload and re-cache
  //   document.dispatchEvent(
  //     new CustomEvent("storage-updated", {
  //       detail: { action: "refresh" },
  //     }),
  //   );
  // }
  //
  // exportData(): string {
  //   return JSON.stringify(this.loadData(), null, 2);
  // }
  //
  // importData(jsonData: string): boolean {
  //   try {
  //     const data = JSON.parse(jsonData) as StorageData;
  //     this.cache = data;
  //     this.saveData();
  //     return true;
  //   } catch (error) {
  //     console.error("Error importing data:", error);
  //     return false;
  //   }
  // }
}

// Export singleton instance
export const storageService = new StorageService();

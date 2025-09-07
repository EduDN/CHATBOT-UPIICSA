export type Sender = "user" | "assistant";
export type StrategyType = "transformers" | "pyodide" | "qwen";

export interface Message {
  id: string;
  content: string;
  sender: Sender;
  timestamp: number;
  strategy?: StrategyType;
}

export interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  createdAt: number;
  isActive: boolean;
  messages: Message[];
  isEditable: boolean;
}

export interface AppState {
  activeStrategy: StrategyType;
  sidebarCollapsed: boolean;
  activeChatId: string | null;
  theme?: "light" | "dark";
  lastSyncTime?: number;
}

export interface StorageData {
  chats: Chat[];
  appState: AppState;
  version: number;
}

export interface ChatDisplayItem {
  id: string;
  title: string;
  preview: string;
  timeDisplay: string;
  isActive: boolean;
  messageCount: number;
  isEditable: boolean;
}

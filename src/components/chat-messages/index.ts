import { BaseComponent } from "@/components/core/base-component";
import template from "./template.html?raw";
import "@/components/chat-message"; // Importing the chat-message component to ensure it's registered
import style from "./style.css?inline";
import { Router } from "@/services/router";
import { storageService } from "@/services/store";
import type { Sender } from "@/types/chat";

class ChatMessages extends BaseComponent {
  private resizeObserver: ResizeObserver | null = null;
  private thinkingMessageElement: HTMLElement | undefined;
  private $ul: HTMLElement | null = null;
  private $slot: HTMLElement | null = null;
  private pendingUserMessage: string | null = null;

  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.resizeObserver = new ResizeObserver(() => this.scrollToBottom());
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    this.$ul =
      this.shadowRoot?.querySelector<HTMLUListElement>(".chat-messages") ||
      null;

    if (!this.$ul) {
      return;
    }
    this.$slot = this.$ul.querySelector("slot");
    this.resizeObserver?.observe(this.$ul);

    // Handle initial route on page load
    const currentRoute = window.location.pathname + window.location.search;
    this.handleRouteChanged(currentRoute);

    document.addEventListener("route-changed", (e) => {
      const { route } = (e as CustomEvent).detail as { route: string };
      this.handleRouteChanged(route);
    });

    document.addEventListener("message-sent", async (event) => {
      const customEvent = event as CustomEvent<{ text: string }>;
      const message = customEvent.detail.text;

      // Get current chat ID or create new chat
      let chatId = Router.getCurrentChatId();

      if (!chatId) {
        // Create new chat and navigate
        const newChat = storageService.createChat();
        chatId = newChat.id;
        Router.goToChat(chatId);
      } else {
        // Verify chat exists, create if not
        let chat = storageService.getChat(chatId);
        if (!chat) {
          const newChat = storageService.createChat();
          Router.goToChat(newChat.id);
          chatId = newChat.id;
        }
      }

      // Set as active chat
      storageService.setActiveChat(chatId);

      // Show user message immediately in UI
      this.addMessage(message, "user");

      // Store the user message temporarily (not saved to localStorage yet)
      this.pendingUserMessage = message;

      await new Promise((resolve) => setTimeout(resolve, 500));
      this.thinkingMessageElement = this.addMessage("Thinking...", "assistant");
      const p = this.thinkingMessageElement?.querySelector("p");

      if (!p) {
        return;
      }
      p?.classList.add("loading");

      this.dispatchEvent(
        new CustomEvent("question-asked", {
          bubbles: true,
          composed: true,
          detail: { question: message },
        }),
      );
    });

    document.addEventListener("assistant-answer", async (event) => {
      const customEvent = event as CustomEvent<{ answer: string }>;
      const answer = customEvent.detail.answer;
      const chatId = Router.getCurrentChatId();

      // Save the complete conversation to storage
      if (chatId && this.pendingUserMessage) {
        storageService.addConversation(chatId, this.pendingUserMessage, answer);
        this.pendingUserMessage = null;
      }

      const p = this.thinkingMessageElement?.querySelector("p");
      if (!p) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      p.classList.remove("loading");

      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

      const sanitizedHtml = answer.replace(urlRegex, (url) => {
        const properUrl = url.startsWith("www.") ? `https://${url}` : url;
        return `<a href="${properUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });

      p.innerHTML = sanitizedHtml;

      p.classList.add("typing-animation");
      this.thinkingMessageElement
        ?.querySelector("li")
        ?.classList.remove("brain");
      this.thinkingMessageElement?.querySelector("div")?.remove();

      p.addEventListener(
        "animationend",
        () => {
          this.thinkingMessageElement
            ?.querySelector("button")
            ?.classList.remove("hide");
          p.classList.remove("typing-animation");
          this.dispatchEvent(
            new CustomEvent("assistant-response-finished", {
              bubbles: true,
              composed: true,
            }),
          );
        },
        { once: true },
      );
    });

    // Handle assistant errors
    document.addEventListener("assistant-error", (event) => {
      const customEvent = event as CustomEvent<{ message: string }>;

      // Clear pending user message
      this.pendingUserMessage = null;

      this.removeThinkingMessage(customEvent);
    });
  }

  public removeThinkingMessage(
    customEvent?: CustomEvent<{
      message: string;
    }>,
  ): void {
    // Show error message
    if (this.thinkingMessageElement) {
      const p = this.thinkingMessageElement.querySelector("p");
      if (p) {
        p.classList.remove("loading");
        if (customEvent) {
          p.textContent = customEvent.detail.message;
        }
        this.thinkingMessageElement
          .querySelector("li")
          ?.classList.remove("brain");
        this.thinkingMessageElement.querySelector("div")?.remove();
      }
    }
  }

  public addMessage(
    message: string,
    sender: Sender,
    loadedChat?: boolean,
  ): HTMLElement | undefined {
    if (this.shadowRoot === null) {
      return;
    }

    const $chatMessageElement = document.createElement("chat-message");
    $chatMessageElement.dataset.sender = sender;

    const templateId =
      sender === "user"
        ? "#user-message-template"
        : "#assistant-message-template";

    if (!this.$ul) {
      return;
    }

    const $clone = this.getTemplate(templateId);
    if (!$clone) {
      return;
    }
    this.removeSlot(); // Remove the slot if it exists to avoid duplication

    const $paragraph = $clone.querySelector("p");
    const $sender = $clone.querySelector("span");
    if (!$paragraph) {
      return;
    }

    $paragraph.textContent = message;
    if ($sender) {
      $sender.textContent = sender === "user" ? "Y" : "A";
    }

    $chatMessageElement.appendChild($clone);

    // Handle loaded chat logic - only for assistant messages
    if (loadedChat && sender === "assistant") {
      // Remove thinking message if it exists
      this.removeThinkingMessage();

      // Find the message content and ensure proper structure
      const messageContent = $chatMessageElement.querySelector("li");
      if (messageContent) {
        // Remove brain class if it exists
        messageContent.classList.remove("brain");

        // Remove any spinner div
        const spinnerDiv = messageContent.querySelector("div");
        if (spinnerDiv) {
          spinnerDiv.remove();
        }

        // Find and show copy button with proper layout
        const copyButton = messageContent.querySelector("button");
        if (copyButton) {
          copyButton.classList.remove("hide");
        }

        // Ensure the paragraph doesn't have typing animation
        const paragraph = messageContent.querySelector("p");
        if (paragraph) {
          paragraph.classList.remove("typing-animation");
        }
      }
    }

    this.$ul.appendChild($chatMessageElement);

    return $chatMessageElement;
  }

  public scrollToBottom(): void {
    if (this.shadowRoot === null) {
      return;
    }

    const rootNode = this.shadowRoot.getRootNode() as ShadowRoot;
    const host = rootNode.host;
    host.scrollTop = host.scrollHeight;
  }

  protected override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
  }

  private removeSlot() {
    if (this.$slot) {
      this.$slot.remove();
      this.$slot = null;
    }
  }

  private getTemplate(templateId: string): DocumentFragment | undefined {
    if (this.shadowRoot === null) return;
    const $template =
      this.shadowRoot.querySelector<HTMLTemplateElement>(templateId);

    if (!$template || !this.$ul) {
      return;
    }

    return $template.content.cloneNode(true) as DocumentFragment;
  }

  private handleRouteChanged(_route: string) {
    if (Router.isOnHomeRoute()) {
      this.clearMessages();
      this.showInitialTemplate();
      storageService.setActiveChat(null);
    } else if (Router.isOnChatRoute()) {
      // Load the specific chat
      const chatId = Router.getCurrentChatId();
      if (chatId) {
        this.loadChatFromStorage(chatId);
      }
    }
  }

  private clearMessages(): void {
    if (!this.$ul) return;
    this.$ul.innerHTML = "";
  }

  private showInitialTemplate(): void {
    if (!this.$ul) return;

    const $initialTemplate = this.getTemplate("#initial-message-template");
    if (!$initialTemplate) return;

    this.$ul.appendChild($initialTemplate);
    this.$slot = this.$ul.querySelector("slot");
  }

  private loadChatFromStorage(chatId: string): void {
    const chat = storageService.getChat(chatId);
    if (!chat) {
      // Chat doesn't exist, redirect to home
      Router.goToRoute("/", true);
      return;
    }

    // Set as active chat
    storageService.setActiveChat(chatId);

    // Clear existing messages
    this.clearMessages();

    // Load messages from storage
    const messages = storageService.getChatMessages(chatId);
    // console.log("Loaded messages:", messages);
    messages.forEach((message) => {
      this.addMessage(message.content, message.sender, true);
    });
  }
}

customElements.define("chat-messages", ChatMessages);

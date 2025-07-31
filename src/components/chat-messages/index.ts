import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import "@/components/chat-message"; // Importing the chat-message component to ensure it's registered
import style from "./style.css?inline";
import { chatbotService } from "@/services/chatbot-service";

type Sender = "user" | "assistant";

class ChatMessages extends BaseComponent {
  private resizeObserver: ResizeObserver | null = null;
  private chatbotService = chatbotService; // Use the singleton instance
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.resizeObserver = new ResizeObserver(() => this.scrollToBottom());
  }
  protected override connectedCallback(): void {
    super.connectedCallback();
    const $ul =
      this.shadowRoot?.querySelector<HTMLUListElement>(".chat-messages");
    if (!$ul) {
      return;
    }
    this.resizeObserver?.observe($ul);
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    document.addEventListener("message-sent", async (event) => {
      const customEvent = event as CustomEvent<{ text: string }>;
      const message = customEvent.detail.text;

      this.addMessage(message, "user");

      await new Promise((resolve) => setTimeout(resolve, 500));
      const thinkingMessageElement = this.addMessage(
        "Thinking...",
        "assistant",
      );
      const p = thinkingMessageElement?.querySelector("p");

      if (!p) {
        return;
      }
      p?.classList.add("loading");

      const answer = await this.chatbotService.findAnswer(message);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      p.classList.remove("loading");

      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

      const sanitizedHtml = answer.replace(urlRegex, (url) => {
        const properUrl = url.startsWith("www.") ? `https:// ${url}` : url;
        return `<a href="${properUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });

      p.innerHTML = sanitizedHtml;

      p.classList.add("typing-animation");
      thinkingMessageElement?.querySelector("li")?.classList.remove("brain");
      thinkingMessageElement?.querySelector("div")?.remove();

      p.addEventListener(
        "animationend",
        () => {
          thinkingMessageElement
            ?.querySelector("button")
            ?.classList.remove("hide");
          p.classList.remove("typing-animation"); // Clean up the animation class
          document.dispatchEvent(
            new CustomEvent("assistant-response-finished"),
          );
        },
        { once: true },
      ); // { once: true } automatically removes the listener
    });
  }

  public addMessage(message: string, sender: Sender): HTMLElement | undefined {
    if (this.shadowRoot === null) {
      return;
    }

    const $chatMessageElement = document.createElement("chat-message");
    $chatMessageElement.dataset.sender = sender;
    const templateId =
      sender === "user"
        ? "#user-message-template"
        : "#assistant-message-template";

    const $template =
      this.shadowRoot.querySelector<HTMLTemplateElement>(templateId);
    const $ul =
      this.shadowRoot.querySelector<HTMLUListElement>(".chat-messages");

    if (!$template) {
      return;
    }

    const $clone = $template.content.cloneNode(true) as DocumentFragment;
    // const $clone = $template.content.cloneNode(true);
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

    if (!$ul) {
      return;
    }

    $ul.appendChild($chatMessageElement);

    // this.scrollToBottom();
    return $chatMessageElement;
  }

  public scrollToBottom(): void {
    if (this.shadowRoot === null) {
      return;
    }

    const rootNode = this.shadowRoot.getRootNode() as ShadowRoot;
    const host = rootNode.host;
    host.scrollTop = host.scrollHeight; // Scroll to the bottom of the chat messages
  }

  protected override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
  }
}

customElements.define("chat-messages", ChatMessages);

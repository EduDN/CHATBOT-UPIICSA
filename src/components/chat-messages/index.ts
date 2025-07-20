import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import "@/components/chat-message"; // Importing the chat-message component to ensure it's registered
import style from "./style.css?inline";

type Sender = "user" | "assistant";

class ChatMessages extends BaseComponent {
  private resizeObserver: ResizeObserver | null = null;
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.resizeObserver = new ResizeObserver(() => this.scrollToBottom());
  }
  protected override connectedCallback(): void {
    super.connectedCallback();
    console.log("ChatMessages component connected");
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
    document.addEventListener("message-sent", (event) => {
      const customEvent = event as CustomEvent<{ text: string }>;
      const message = customEvent.detail.text;

      this.addMessage(message, "user");
      setTimeout(() => {
        this.addMessage("Hi there", "assistant");
      }, 1000);
    });
  }

  public addMessage(message: string, sender: Sender): void {
    if (this.shadowRoot === null) {
      return;
    }

    const $chatMessageElement = document.createElement("chat-message");
    $chatMessageElement.dataset.sender = sender;
    const $template = this.shadowRoot.querySelector<HTMLTemplateElement>(
      "#user-message-template",
    );
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
  }

  public scrollToBottom(): void {
    if (this.shadowRoot === null) {
      return;
    }

    const rootNode = this.shadowRoot.getRootNode() as ShadowRoot;
    const host = rootNode.host;
    host.scrollTop = host.scrollHeight; // Scroll to the bottom of the chat messages
    console.log(host);
  }

  protected override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
  }
}

customElements.define("chat-messages", ChatMessages);

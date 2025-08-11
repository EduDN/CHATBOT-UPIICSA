import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import "@/components/chat-message"; // Importing the chat-message component to ensure it's registered
import style from "./style.css?inline";

type Sender = "user" | "assistant";

class ChatMessages extends BaseComponent {
  private resizeObserver: ResizeObserver | null = null;
  private thinkingMessageElement: HTMLElement | undefined;
  private $ul: HTMLElement | null = null;
  private $slot: HTMLElement | null = null;
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.resizeObserver = new ResizeObserver(() => this.scrollToBottom());
  }
  // protected override connectedCallback(): void {
  //   super.connectedCallback();
  // }

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
    console.log("slot", this.$slot);
    this.resizeObserver?.observe(this.$ul);

    document.addEventListener("message-sent", async (event) => {
      const customEvent = event as CustomEvent<{ text: string }>;
      const message = customEvent.detail.text;

      this.addMessage(message, "user");

      await new Promise((resolve) => setTimeout(resolve, 500));
      this.thinkingMessageElement = this.addMessage("Thinking...", "assistant");
      const p = this.thinkingMessageElement?.querySelector("p");

      if (!p) {
        return;
      }
      p?.classList.add("loading");

      console.log("Message sent event received:", message);
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
      console.log("Received answer from AI Worker:", customEvent.detail.answer);
      console.log("CustomEvent", customEvent);
      const p = this.thinkingMessageElement?.querySelector("p");
      if (!p) {
        return;
      }

      const answer = customEvent.detail.answer;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      p.classList.remove("loading");

      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

      const sanitizedHtml = answer.replace(urlRegex, (url) => {
        const properUrl = url.startsWith("www.") ? `https:// ${url}` : url;
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
          p.classList.remove("typing-animation"); // Clean up the animation class
          this.dispatchEvent(
            new CustomEvent("assistant-response-finished", {
              bubbles: true,
              composed: true,
            }),
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

    if (!$template || !this.$ul) {
      return;
    }

    this.removeSlot(); // Remove the slot if it exists to avoid duplication

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

    this.$ul.appendChild($chatMessageElement);

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

  private removeSlot() {
    if (this.$slot) {
      this.$slot.remove();
      this.$slot = null; // Reset the slot after removing it
    }
  }
}

customElements.define("chat-messages", ChatMessages);

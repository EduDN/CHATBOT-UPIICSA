import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ChatInput extends BaseComponent {
  private $inputElement: HTMLTextAreaElement | null = null;
  private $sendButton: HTMLButtonElement | null = null;
  private isSending = false;

  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    if (this.shadowRoot === null) {
      return;
    }
    this.$inputElement = this.shadowRoot?.querySelector("textarea");
    this.$sendButton = this.shadowRoot?.querySelector("button");

    // TODO: Check why this validation is not working
    // if (!this.inputElement && !this.sendButton) return;
    if (!this.$inputElement || !this.$sendButton) return;

    // Start in a disabled state
    this.disableInput("Iniciando...");

    document.addEventListener(
      "assistant-response-finished",
      () => this.enableInput,
    );
    document.addEventListener("app-ready", () => this.enableInput());

    this.$inputElement.addEventListener("input", () => {
      if (!this.$inputElement) return;

      this.$inputElement.style.height = "auto";
      this.$inputElement.style.height = `${this.$inputElement.scrollHeight}px`;
    });

    this.$sendButton.addEventListener("click", () => {
      if (this.$inputElement?.value.trim() === "") return;
      this.$sendButton?.blur(); // this will remove focus from the button
      this.sendMessage();
    });

    this.$inputElement.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      if (!this.$inputElement?.value.trim()) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey) {
        return;
      }

      event.preventDefault();
      this.sendMessage();
    });
  }

  public sendMessage(): void {
    if (this.isSending) return;

    if (!this.$inputElement || !this.$sendButton) return;

    const messageText = this.$inputElement.value.trim();
    if (messageText.trim() === "") return;

    this.dispatchEvent(
      new CustomEvent("message-sent", {
        bubbles: true,
        composed: true,
        detail: { text: messageText },
      }),
    );

    this.disableInput("Pensando...");

    // Clear the value
    this.$inputElement.rows = 1;
    this.$inputElement.dispatchEvent(new Event("input"));
  }

  private enableInput() {
    console.log("this", this);
    if (!this.$inputElement || !this.$sendButton) return;
    if (window.visualViewport?.width ?? 0 > 700) {
      this.$inputElement.focus();
    }
    console.log("Enabling input");
    this.$inputElement.disabled = false;
    this.$sendButton.disabled = false;
    this.$inputElement.value = "";
    this.$inputElement.placeholder = "Escribe tu pregunta";
  }

  private disableInput(placeholder = "Escribe tu pregunta") {
    if (!this.$inputElement || !this.$sendButton) return;
    console.log("Disabling input");
    this.$inputElement.disabled = true;
    this.$inputElement.value = "";
    this.$sendButton.disabled = true;
    this.$inputElement.placeholder = placeholder;
  }
}

customElements.define("chat-input", ChatInput);

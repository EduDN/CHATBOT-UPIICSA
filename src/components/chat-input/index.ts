import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ChatInput extends BaseComponent {
  private $inputElement: HTMLTextAreaElement | null = null;
  private $sendButton: HTMLButtonElement | null = null;

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

    // NOTE: Check why this validation is not working
    // if (!this.inputElement && !this.sendButton) return;
    if (!this.$inputElement || !this.$sendButton) return;

    this.$inputElement.addEventListener("input", () => {
      if (!this.$inputElement) return;

      // TODO: Check if this is necessary or if it's enough with the max-height
      // const remInPx = parseFloat(
      //   getComputedStyle(document.documentElement).fontSize,
      // );
      // const remHeight = remInPx * 10; // 10rem in pixels
      // const currentHeight = parseFloat(this.$inputElement.style.height) || 0;
      // if (this.$inputElement.value === "") {
      //   this.$inputElement.style.height = "auto";
      //   return;
      //  }
      // if (currentHeight > remHeight) {
      //   return;
      //  }

      this.$inputElement.style.height = "auto";
      this.$inputElement.style.height = `${this.$inputElement.scrollHeight}px`;
    });

    this.$sendButton.addEventListener("click", () => {
      if (this.$inputElement?.value.trim() === "") return;
      // this.sendMessage();
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
      // this.sendMessage();
    });
  }
}

customElements.define("chat-input", ChatInput);

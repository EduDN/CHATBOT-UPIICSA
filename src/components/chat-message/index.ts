import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ChatMessage extends BaseComponent {
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    const $button = this.querySelector("button");
    const $p = this.querySelector("p");
    if (!$button || !$p) {
      return;
    }

    $button.addEventListener("click", () => {
      $button.classList.add("is-active");

      setTimeout(() => {
        $button.classList.remove("is-active");
      }, 150);

      navigator.clipboard.writeText($p.textContent || "");
      $button.blur();
    });
  }
}

customElements.define("chat-message", ChatMessage);

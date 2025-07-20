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
    const $li = this.querySelector("li");
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {}
}

customElements.define("chat-message", ChatMessage);

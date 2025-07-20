import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import "@/components/chat-message"; // Importing the chat-message component to ensure it's registered
import style from "./style.css?inline";

class ChatMessages extends BaseComponent {
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
    console.log("ChatMessages component initialized");
  }
}

customElements.define("chat-messages", ChatMessages);

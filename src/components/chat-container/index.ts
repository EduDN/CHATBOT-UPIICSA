import { BaseComponent } from "@/components/core/base-component";
import template from "./template.html?raw";
// import style from "./style.css?inline";

class ChatContainer extends BaseComponent {
  constructor() {
    super();
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override setupEventListeners(): void {}
}

customElements.define("chat-container", ChatContainer);

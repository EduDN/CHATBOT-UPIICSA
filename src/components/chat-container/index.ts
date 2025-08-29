import { BaseComponent } from "@/components/core/base-component";
import { Router } from "@/services/router";
import template from "./template.html?raw";

class ChatContainer extends BaseComponent {
  protected override get htmlTemplate(): string {
    return template;
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    Router.init();
  }

  protected override setupEventListeners(): void {}
}

customElements.define("chat-container", ChatContainer);

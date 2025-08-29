import { BaseComponent } from "../core/base-component";

export interface ChatWindowProps {}

class ChatWindow extends BaseComponent {
  protected override connectedCallback(): void {}
}

customElements.define("chat-window", ChatWindow);

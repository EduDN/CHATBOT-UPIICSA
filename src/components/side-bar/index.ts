import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class Sidebar extends BaseComponent {
  private isCollapsed = true; // Start collapsed

  constructor() {
    super();
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    // Start in collapsed state
    this.classList.add("collapsed");
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    // Toggle sidebar
    this.shadowRoot
      ?.querySelector("#sidebar-toggle")
      ?.addEventListener("click", () => {
        this.toggleSidebar();
      });

    // New chat button
    this.shadowRoot
      ?.querySelector("#new-chat")
      ?.addEventListener("click", () => {
        this.createNewChat();
      });

    // Chat bubble clicks
    this.shadowRoot?.querySelectorAll(".chat-bubble").forEach((bubble) => {
      bubble.addEventListener("click", (e) => {
        const chatId = (e.currentTarget as HTMLElement).dataset.chatId;
        if (chatId) {
          this.selectChat(chatId);
        }
      });
    });
  }

  private toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.classList.toggle("collapsed", this.isCollapsed);
  }

  private createNewChat(): void {
    console.log("Creating new chat...");
    // TODO: Implement new chat creation
  }

  private selectChat(chatId: string): void {
    // Remove active class from all bubbles
    this.shadowRoot?.querySelectorAll(".chat-bubble").forEach((bubble) => {
      bubble.classList.remove("active");
    });

    // Add active class to selected bubble
    const selectedBubble = this.shadowRoot?.querySelector(
      `[data-chat-id="${chatId}"]`,
    );
    selectedBubble?.classList.add("active");

    console.log("Selected chat:", chatId);
    // TODO: Emit event to load chat
  }
}

customElements.define("side-bar", Sidebar);

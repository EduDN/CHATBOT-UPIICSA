import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class Sidebar extends BaseComponent {
  private isCollapsed = true; // Start collapsed
  private hoverCooldownTimeout: number | null = null;
  private isManuallyCollapsed = false;

  protected override connectedCallback(): void {
    super.connectedCallback();
    // Start in collapsed state
    this.classList.add("collapsed");
    this.setupHoverCooldown();
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
    
    // Always remove hover-expanded when toggling
    this.classList.remove("hover-expanded");

    if (this.isCollapsed) {
      this.isManuallyCollapsed = true;
      this.classList.add("manually-collapsed");
      
      if (this.hoverCooldownTimeout) {
        clearTimeout(this.hoverCooldownTimeout);
      }
    } else {
      this.isManuallyCollapsed = false;
      this.classList.remove("manually-collapsed");
    }
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

  private setupHoverCooldown(): void {
    // Listen for mouse leave on the entire chat-container
    const chatContainer = document.querySelector('chat-container');
    
    chatContainer?.addEventListener('mouseleave', () => {
      this.startHoverCooldown();
      // Remove hover-expanded class when leaving container
      this.classList.remove('hover-expanded');
    });

    // Also listen for mouse leave on sidebar itself
    this.addEventListener('mouseleave', () => {
      this.startHoverCooldown();
      this.classList.remove('hover-expanded');
    });

    // Add hover-expanded class when hovering over collapsed sidebar
    this.addEventListener('mouseenter', () => {
      if (this.isCollapsed && !this.isManuallyCollapsed) {
        this.classList.add('hover-expanded');
      }
    });

    // Remove hover-expanded class when leaving sidebar
    this.addEventListener('mouseleave', () => {
      this.classList.remove('hover-expanded');
    });
  }

  private startHoverCooldown(): void {
    // Only start cooldown if manually collapsed
    if (!this.isManuallyCollapsed) return;

    // Clear existing timeout
    if (this.hoverCooldownTimeout) {
      clearTimeout(this.hoverCooldownTimeout);
    }

    // Wait a bit, then re-enable hover
    this.hoverCooldownTimeout = window.setTimeout(() => {
      this.isManuallyCollapsed = false;
      this.classList.remove("manually-collapsed");
      this.hoverCooldownTimeout = null;
    }, 500); // 500ms cooldown before hover works again
  }

  protected override disconnectedCallback(): void {
    // Clean up timeout when component is removed
    if (this.hoverCooldownTimeout) {
      clearTimeout(this.hoverCooldownTimeout);
    }
    
    super.disconnectedCallback();
  }
}

customElements.define("side-bar", Sidebar);

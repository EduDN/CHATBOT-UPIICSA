import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class Sidebar extends BaseComponent {
  private isCollapsed = true; // Start collapsed
  private hoverCooldownTimeout: number | null = null;
  private isManuallyCollapsed = false;
  private isMobile = false;
  private $toggleButton: HTMLButtonElement | null = null;

  protected override connectedCallback(): void {
    // Add collapsed class immediately to prevent animation on load
    this.classList.add("collapsed");

    super.connectedCallback();
    // Initialize mode first
    this.initializeMode();
    this.setupHoverCooldown();
    this.setupModeHandling();
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    if (!this.shadowRoot) {
      return;
    }
    this.$toggleButton = this.shadowRoot?.querySelector(".toggle-btn");
    // Toggle sidebar
    this.shadowRoot
      ?.querySelector("#sidebar-toggle")
      ?.addEventListener("click", () => {
        this.toggleSidebar();
      });

    this.$toggleButton?.addEventListener("click", () => {
      if (this.isMobile) {
        this.toggleMobileSidebar();
      }
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

    // Mobile menu toggle handler
    document.addEventListener("toggle-mobile-sidebar", () => {
      if (this.isMobile) {
        this.toggleMobileSidebar();
      }
    });

    // Close mobile sidebar when clicking backdrop
    document.addEventListener("click", (e) => {
      const container = document.querySelector("chat-container");
      const target = e.target as HTMLElement;

      // Check if mobile sidebar is open and click is on backdrop (not on sidebar or header)
      if (
        this.isMobile &&
        container?.classList.contains("mobile-sidebar-open") &&
        !this.contains(target) &&
        !target.closest("chat-header") &&
        !target.closest("side-bar")
      ) {
        // Close mobile sidebar
        container.classList.remove("mobile-sidebar-open");
        this.classList.add("collapsed");
        this.isCollapsed = true;
      }
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

  private toggleMobileSidebar(): void {
    // In mobile mode, toggle the mobile overlay
    const container = document.querySelector("chat-container");
    if (container) {
      const isCurrentlyOpen = container.classList.contains(
        "mobile-sidebar-open",
      );

      if (isCurrentlyOpen) {
        // Close the sidebar - remove overlay and collapse content
        container.classList.remove("mobile-sidebar-open");
        this.classList.add("collapsed");
        this.isCollapsed = true;
        // document
        //   .querySelector("chat-container")
        //   ?.classList.remove("mobile-sidebar-open");
      } else {
        // Open the sidebar - add overlay and expand content
        container.classList.add("mobile-sidebar-open");
        this.classList.remove("collapsed");
        // document.querySelector('chat-container')?.classList.remove('mobile-sidebar-open');

        this.isCollapsed = false;
      }
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
    // Only setup hover behavior for desktop mode
    if (this.isMobile) return;

    // Listen for mouse leave on the entire chat-container
    const chatContainer = document.querySelector("chat-container");

    chatContainer?.addEventListener("mouseleave", () => {
      this.startHoverCooldown();
      // Remove hover-expanded class when leaving container
      this.classList.remove("hover-expanded");
    });

    // Also listen for mouse leave on sidebar itself
    this.addEventListener("mouseleave", () => {
      this.startHoverCooldown();
      this.classList.remove("hover-expanded");
    });

    // Add hover-expanded class when hovering over collapsed sidebar
    this.addEventListener("mouseenter", () => {
      if (this.isCollapsed && !this.isManuallyCollapsed && !this.isMobile) {
        this.classList.add("hover-expanded");
      }
    });

    // Remove hover-expanded class when leaving sidebar
    this.addEventListener("mouseleave", () => {
      this.classList.remove("hover-expanded");
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

  private checkMobile(): boolean {
    return window.innerWidth <= 700;
  }

  private initializeMode(): void {
    this.isMobile = this.checkMobile();

    if (this.isMobile) {
      this.classList.add("mobile-mode");
      this.classList.remove("desktop-mode");
      // Update container layout
      document.querySelector("chat-container")?.classList.add("mobile-layout");
    } else {
      this.classList.add("desktop-mode");
      this.classList.remove("mobile-mode");
      // Remove mobile layout from container
      document
        .querySelector("chat-container")
        ?.classList.remove("mobile-layout");
    }

    console.log(
      `Sidebar initialized in ${this.isMobile ? "mobile" : "desktop"} mode`,
    );
  }

  private setupModeHandling(): void {
    // Listen for window resize to update mode
    window.addEventListener("resize", () => {
      const wasMobile = this.isMobile;
      this.isMobile = this.checkMobile();

      // Only update if mode actually changed
      if (wasMobile !== this.isMobile) {
        console.log(`Mode changed to: ${this.isMobile ? "mobile" : "desktop"}`);
        this.initializeMode();

        // Reset sidebar state when switching modes
        if (this.isMobile) {
          // Mobile: start collapsed
          this.isCollapsed = true;
          this.classList.add("collapsed");
        } else {
          // Desktop: reset hover behavior
          this.isManuallyCollapsed = false;
          this.classList.remove("manually-collapsed");
        }
      }
    });
  }

  protected override disconnectedCallback(): void {
    // Clean up timeout when component is removed
    if (this.hoverCooldownTimeout) {
      clearTimeout(this.hoverCooldownTimeout);
    }

    // Clean up resize listener
    window.removeEventListener("resize", this.setupModeHandling);

    super.disconnectedCallback();
  }
}

customElements.define("side-bar", Sidebar);

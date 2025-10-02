import { BaseComponent } from "../../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "danger";
  action: () => void;
}

export interface MenuSeparator {
  type: "separator";
}

export type MenuItemConfig = MenuItem | MenuSeparator;

interface Position {
  x: number;
  y: number;
}

export class ActionMenu extends BaseComponent {
  private anchor: HTMLElement | null = null;
  private longPressTimer: number | null = null;
  private readonly LONG_PRESS_DURATION = 500; // 500 milliseconds

  constructor() {
    super();
  }

  private ensureRendered(): boolean {
    if (!this.shadowRoot) {
      this.render();
    }
    return !!this.shadowRoot?.querySelector("#menu-item-template");
  }

  static get observedAttributes() {
    return ["open"];
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners() {
    // Click outside to close - using composedPath like modal-window
    this.addEventListener("click", (event) => {
      const path = event.composedPath();
      const firstElementFromPath = path[0] as HTMLElement;
      if (firstElementFromPath.classList.contains("action-menu-backdrop")) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) {
        this.close();
      }
    });

    this.shadowRoot?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(".action-menu")) {
        e.stopPropagation();
      }
    });
  }

  private createMenuItem(item: MenuItem): HTMLElement {
    const template = this.shadowRoot?.querySelector(
      "#menu-item-template",
    ) as HTMLTemplateElement;

    if (!template || !template.content) {
      console.error("Menu item template not found");
      return document.createElement("div");
    }

    const menuItem = template.content.cloneNode(true) as DocumentFragment;
    const menuItemElement = menuItem.querySelector(".menu-item") as HTMLElement;

    // Set variant
    if (item.variant) {
      menuItemElement.setAttribute("data-variant", item.variant);
    }

    const id = `open${item.id}MenuModal`;
    menuItemElement.id = id;

    // Set icon
    if (item.icon) {
      const iconElement = menuItem.querySelector(
        ".menu-item-icon",
      ) as HTMLElement;
      iconElement.innerHTML = item.icon;
    }

    // Set text
    const textElement = menuItem.querySelector(
      ".menu-item-text",
    ) as HTMLElement;
    textElement.textContent = item.label;

    // Set up click handler
    menuItemElement.addEventListener("click", () => {
      item.action();
      this.close();
    });

    // Keyboard navigation
    menuItemElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.action();
        this.close();
      }
    });

    return menuItemElement;
  }

  private createSeparator(): HTMLElement {
    const template = this.shadowRoot?.querySelector(
      "#menu-separator-template",
    ) as HTMLTemplateElement;

    if (!template || !template.content) {
      console.error("Menu separator template not found");
      return document.createElement("div");
    }

    const separator = template.content.cloneNode(true) as DocumentFragment;
    return separator.querySelector(".menu-separator") as HTMLElement;
  }

  private calculatePosition(anchorElement: HTMLElement): Position {
    const rect = anchorElement.getBoundingClientRect();
    const menuWidth = 200;
    const menuHeight = 150;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile positioning strategy
      const sidebarWidth = Math.min((window.innerWidth / 2) * 0.833, 320 / 2); // Same as sidebar width
      const availableWidth = window.innerWidth - sidebarWidth;

      // Position menu in the available space to the right of sidebar
      let x = sidebarWidth + 16; // Start after sidebar with some padding
      let y = rect.top;

      // If not enough space on the right, center the menu in available area
      if (x + menuWidth > window.innerWidth) {
        x = sidebarWidth + (availableWidth - menuWidth) / 2;
      }

      // Ensure minimum spacing from screen edge
      if (x < sidebarWidth + 8) {
        x = sidebarWidth + 8;
      }

      // Keep menu within bounds
      if (x + menuWidth > window.innerWidth - 8) {
        x = window.innerWidth - menuWidth - 8;
      }

      // Vertical positioning
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 16;
      }

      if (y < 16) {
        y = 16;
      }

      return { x, y };
    }

    // Desktop positioning strategy (original logic)
    let x = rect.right + 8;
    let y = rect.top;

    if (x + menuWidth > window.innerWidth) {
      x = rect.left - menuWidth - 8; // Move to left side
    }

    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 16;
    }

    // Ensure menu doesn't go above viewport
    if (y < 16) {
      y = 16;
    }

    // Ensure menu doesn't go off left edge
    if (x < 16) {
      x = 16;
    }

    return { x, y };
  }

  public setupTrigger(
    element: HTMLElement,
    items: MenuItemConfig[],
    options: { longPress?: boolean } = {},
  ) {
    const { longPress = false } = options;

    if (longPress) {
      // Mobile long-press setup
      let startX: number, startY: number;

      element.addEventListener(
        "touchstart",
        (e) => {
          const touch = e.touches[0];
          if (!touch) return;

          startX = touch.clientX;
          startY = touch.clientY;

          this.longPressTimer = window.setTimeout(() => {
            e.preventDefault(); // Prevent any default touch behavior
            this.open(element, items);

            // Haptic feedback if available
            if ("vibrate" in navigator) {
              navigator.vibrate(50);
            }
          }, this.LONG_PRESS_DURATION);
        },
        { passive: false },
      );

      element.addEventListener("touchmove", (e) => {
        if (this.longPressTimer) {
          const touch = e.touches[0];
          if (!touch) return;

          const deltaX = Math.abs(touch.clientX - startX);
          const deltaY = Math.abs(touch.clientY - startY);

          // Cancel if moved too much (10px threshold)
          if (deltaX > 10 || deltaY > 10) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
          }
        }
      });

      element.addEventListener("touchend", () => {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      });

      // Prevent context menu on long press
      element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    } else {
      // Desktop click setup
      element.addEventListener("click", (e) => {
        e.stopPropagation();
        this.open(element, items);
      });
    }
  }

  public open(anchorElement: HTMLElement, items: MenuItemConfig[]) {
    this.anchor = anchorElement;

    // Portal to document body first to ensure proper rendering context
    if (this.parentElement !== document.body) {
      document.body.appendChild(this);
    }

    // Ensure the component is rendered before proceeding
    if (!this.ensureRendered()) {
      console.error("Failed to render action menu templates");
      return;
    }

    this.populateMenu(anchorElement, items);
  }

  private populateMenu(anchorElement: HTMLElement, items: MenuItemConfig[]) {
    // Clear existing menu items
    const menu = this.shadowRoot?.querySelector(".action-menu") as HTMLElement;
    const slot = menu?.querySelector("slot");
    if (slot) {
      slot.replaceChildren();
    } // Add menu items
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if ("type" in item && item.type === "separator") {
        fragment.appendChild(this.createSeparator());
      } else {
        fragment.appendChild(this.createMenuItem(item as MenuItem));
      }
    });

    slot?.appendChild(fragment);

    // Position menu
    const position = this.calculatePosition(anchorElement);
    if (menu) {
      menu.style.left = `${position.x}px`;
      menu.style.top = `${position.y}px`;
    }

    // Open menu
    this.setAttribute("open", "");

    // Focus first menu item for keyboard navigation
    setTimeout(() => {
      const firstMenuItem = menu?.querySelector(".menu-item") as HTMLElement;
      firstMenuItem?.focus();
    }, 100);

    // Emit event
    this.dispatchEvent(
      new CustomEvent("menu-opened", {
        detail: { anchor: anchorElement, items },
      }),
    );
  }

  public close() {
    this.removeAttribute("open");

    // Clean up
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.parentElement === document.body) {
        document.body.removeChild(this);
      }
    }, 200);

    // Emit event
    this.dispatchEvent(
      new CustomEvent("menu-closed", {
        detail: { anchor: this.anchor },
      }),
    );

    this.anchor = null;
  }
}

customElements.define("action-menu", ActionMenu);

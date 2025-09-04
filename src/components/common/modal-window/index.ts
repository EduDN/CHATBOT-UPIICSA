import { BaseComponent } from "@/components/core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ModalWindow extends BaseComponent {
  private triggerElement: HTMLElement | null = null;
  private $parentElement: HTMLElement | null = null;
  private boundOpenHandler: () => void = this.open.bind(this);
  private boundCloseHandler: () => void = this.close.bind(this);
  private boundEscapeHandler: (e: KeyboardEvent) => void =
    this.handleEscape.bind(this);

  constructor() {
    super();
    this.$parentElement = this.parentElement;
  }

  protected override connectedCallback(): void {
    super.connectedCallback();

    if (this.parentNode !== document.body) {
      document.body.appendChild(this);
    }
  }

  protected override setupEventListeners(): void {
    if (!this.shadowRoot) return;
    const triggerId = this.getAttribute("for");
    if (!triggerId) return;
    if (!this.$parentElement) return;
    this.triggerElement = this.$parentElement.querySelector<HTMLElement>(
      `#${triggerId}`,
    );
    if (!this.triggerElement) return;
    this.triggerElement.addEventListener("click", this.boundOpenHandler);

    const closeButtonSlot = this.shadowRoot.querySelector<HTMLSlotElement>(
      'slot[name="close-button"]',
    );
    if (closeButtonSlot) {
      const closeButtons = closeButtonSlot.assignedElements();
      closeButtons.forEach((button) =>
        button.addEventListener("click", this.boundCloseHandler),
      );
    }

    document.addEventListener("keydown", this.boundEscapeHandler);

    this.addEventListener("click", (event) => {
      const path = event.composedPath();
      if (path[0] === this) {
        this.close();
      }
    });
  }

  protected override disconnectedCallback() {
    if (this.triggerElement) {
      this.triggerElement.removeEventListener("click", this.boundOpenHandler);
    }

    if (this.shadowRoot) {
      const closeButtonSlot = this.shadowRoot.querySelector<HTMLSlotElement>(
        'slot[name="close-button"]',
      );
      if (closeButtonSlot) {
        const closeButtons = closeButtonSlot.assignedElements();
        closeButtons.forEach((button) =>
          button.removeEventListener("click", this.boundCloseHandler),
        );
      }
    }

    document.removeEventListener("keydown", this.boundEscapeHandler);
  }

  private open() {
    this.setAttribute("open", "");
  }

  private close() {
    this.removeAttribute("open");
    this.dispatchEvent(
      new CustomEvent("closed", { bubbles: true, composed: true }),
    );
  }

  private handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape" && this.hasAttribute("open")) {
      this.close();
    }
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }
}

customElements.define("modal-window", ModalWindow);

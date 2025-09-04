import { BaseComponent } from "@/components/core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ModalWindow extends BaseComponent {
  private triggerElement: HTMLElement | null = null;
  private boundEscapeHandler: (e: KeyboardEvent) => void = () => {};
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    if (this.parentNode !== document.body) {
      document.body.appendChild(this);
    }
  }

  protected override setupEventListeners(): void {
    if (!this.shadowRoot) return;

    const $trigger = this.getAttribute("for");
    const $parent = this.parentElement;
    if (!$trigger || !$parent) return;

    this.triggerElement = $parent.querySelector<HTMLElement>(`#${$trigger}`);

    if (this.triggerElement) {
      this.triggerElement.addEventListener("click", this.open.bind(this));
    }

    const closeButtonSlot = this.shadowRoot.querySelector<HTMLSlotElement>(
      'slot[name="close-button"]',
    );
    if (!closeButtonSlot) return;

    const closeButtons = closeButtonSlot.assignedElements();
    closeButtons.forEach((button) =>
      button.addEventListener("click", this.close.bind(this)),
    );

    this.boundEscapeHandler = this.handleEscape.bind(this);
    document.addEventListener("keydown", this.boundEscapeHandler);

    this.shadowRoot
      ?.querySelector(".modal-overlay")
      ?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
          this.close();
        }
      });

    document.addEventListener("click", (event) => {
      const path = event.composedPath();
      if (path[0] === this) {
        this.close();
      }
    });
  }
  protected override disconnectedCallback() {
    if (this.triggerElement) {
      this.triggerElement.removeEventListener("click", this.open);
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

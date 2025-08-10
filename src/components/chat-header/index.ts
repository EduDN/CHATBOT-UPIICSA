import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";

class ChatHeader extends BaseComponent {
  private $button: HTMLButtonElement | null = null;
  private $dropdown: HTMLDivElement | null = null;
  private $dropdownContent: HTMLDivElement | null = null;
  private $buttonText: HTMLParagraphElement | null = null;
  private $mobileMenuBtn: HTMLButtonElement | null = null;

  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }

  protected override setupEventListeners(): void {
    if (this.shadowRoot === null) {
      return;
    }
    this.$button = this.shadowRoot.querySelector(".dropdown-btn");
    this.$dropdown = this.shadowRoot.querySelector(".dropdown");
    this.$dropdownContent = this.shadowRoot.querySelector(".dropdown-content");
    this.$buttonText = this.shadowRoot.querySelector(".dropdown-btn p");
    this.$mobileMenuBtn = this.shadowRoot.querySelector(
      "#mobile-sidebar-toggle",
    );

    if (
      !this.$button ||
      !this.$dropdown ||
      !this.$dropdownContent ||
      !this.$buttonText
    ) {
      return;
    }

    // Mobile menu button handler
    this.$mobileMenuBtn?.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      document.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"));
    });

    // Listener for the dropdown button to ONLY toggle the dropdown
    this.$button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      this.$dropdownContent?.classList.toggle("show");
      this.$dropdown?.blur();
      this.$button?.blur();
      this.showCheckedState();
    });

    this.$dropdown.addEventListener("click", (e) => {
      console.log("Dropdown clicked");
      const target = e.target as HTMLElement;
      const selectedLi = target.closest("li");
      console.log("Clicked outside:", target.tagName);

      if (!this.$button || !this.$dropdownContent) {
        return;
      }

      if (selectedLi?.tagName === "LI") {
        const strategyKey = selectedLi.getAttribute("data-strategy");
        const selectedText = selectedLi.querySelector("p")?.textContent;

        if (this.$buttonText && selectedText) {
          this.$buttonText.textContent = selectedText;
        }

        if (strategyKey) {
          // --- Start Loading State ---
          this.$button?.blur();
          this.$button.disabled = true;

          this.setLoading(true);

          this.$dropdownContent?.classList.remove("show");
          document.dispatchEvent(
            new CustomEvent("strategy-changed", {
              detail: { strategy: strategyKey },
            }),
          );

          // --- End Loading State ---
          this.setLoading(false);
        }
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName !== "CHAT-HEADER") {
        this.$dropdownContent?.classList.remove("show");
      }
    });
  }

  private showCheckedState() {
    const activeClass = this.shadowRoot?.querySelector("li.active");
    activeClass?.classList.remove("active");
    const $buttonText = this.$buttonText?.textContent;

    const allLi = this.shadowRoot?.querySelectorAll("li");
    allLi?.forEach((li) => {
      const $p = li.querySelector("p");
      if (!$p || !$buttonText) {
        return;
      }

      if ($p.textContent === $buttonText) {
        li.classList.add("active");
      }
    });
  }

  private setLoading(isLoading: boolean): void {
    if (this.$button) {
      this.$button.disabled = isLoading;
      this.$button.classList.toggle("loading", isLoading);
    }
  }

  protected override disconnectedCallback(): void {
    this.$button = null;
    this.$dropdown = null;
    this.$dropdownContent = null;
    this.$buttonText = null;
    this.$mobileMenuBtn = null;
  }
}

customElements.define("chat-header", ChatHeader);

import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
import style from "./style.css?inline";
import { storageService } from "@/services/store";

class ChatHeader extends BaseComponent {
  private $button: HTMLButtonElement | null = null;
  private $dropdown: HTMLDivElement | null = null;
  private $dropdownContent: HTMLDivElement | null = null;
  private $buttonText: HTMLParagraphElement | null = null;
  private $mobileMenuBtn: HTMLButtonElement | null = null;
  private boundQwenModalHandler: (event: Event) => void;

  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.boundQwenModalHandler = this.handleQwenModalPortaled.bind(this);
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    this.handleInitStrategy();

    document.addEventListener("strategy-ready", () => {
      this.setLoading(false);
      if (this.$button) {
        this.$button.disabled = false;
      }
    });
    this.handleWebllmStrategy();
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

    this.$mobileMenuBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"));
    });

    this.$button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.$dropdownContent?.classList.toggle("show");
      this.$dropdown?.blur();
      this.$button?.blur();
      this.showCheckedState();
    });

    this.$dropdown.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const selectedLi = target.closest("li");

      if (!this.$button || !this.$dropdownContent) {
        return;
      }

      if (selectedLi?.tagName === "LI") {
        const strategyKey = selectedLi.getAttribute("data-strategy");
        const selectedText = selectedLi.querySelector("p")?.textContent;

        // Special handling for Qwen strategy - show warning modal first
        if (strategyKey === "qwen") {
          this.$dropdownContent.classList.remove("show");
          // The modal will handle the strategy change via the proceed button
          // Modal opens automatically because of the "for" attribute
          return;
        }

        if (this.$buttonText && selectedText) {
          this.$buttonText.textContent = selectedText;
        }

        if (strategyKey) {
          this.$button?.blur();
          this.$button.disabled = true;

          this.setLoading(true);

          this.$dropdownContent?.classList.remove("show");
          document.dispatchEvent(
            new CustomEvent("strategy-changed", {
              detail: { strategy: strategyKey },
            }),
          );

          // Loading state will be cleared when "strategy-ready" event fires
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

  private handleInitStrategy = () => {
    const { activeStrategy } = storageService.getAppState();

    const $currentButton = this.shadowRoot?.querySelector(
      `[data-strategy='${activeStrategy}']`,
    );

    if (!this.$buttonText || !$currentButton) {
      return;
    }
    const $contentStrategy =
      $currentButton?.querySelector("p")?.textContent || "";
    this.$buttonText.textContent = $contentStrategy;
    this.showCheckedState();
  };

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

  private handleWebllmStrategy(): void {
    const isWebGpuSupported = navigator.gpu !== undefined;
    if (!isWebGpuSupported) return;
    if (!this.$dropdownContent) return;

    const $template = this.getTemplate("#qwen-strategy-template");
    if (!$template) return;

    this.$dropdownContent.appendChild($template);

    // Set up modal event handlers after template is appended
    this.setupQwenModalHandlers();
  }

  private setupQwenModalHandlers(): void {
    // Listen for the specific modal-portaled event for the openQwenModal
    document.addEventListener(
      "modal-portaled-openQwenModal",
      this.boundQwenModalHandler,
    );
  }

  private handleQwenModalPortaled = (event: Event): void => {
    const customEvent = event as CustomEvent;
    const { modalElement } = customEvent.detail;
    const $proceedBtn = modalElement.querySelector("#qwen-proceed-btn");

    if (!$proceedBtn) return;
    $proceedBtn.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.handleQwenProceed();
      modalElement.removeAttribute("open");
    });
    const $cancelBtn = modalElement.querySelector("#qwen-cancel-btn");

    if ($cancelBtn) {
      $cancelBtn.addEventListener("click", (e: Event) => {
        e.preventDefault();
        this.handleQwenCancel();
        // Close the modal
        modalElement.removeAttribute("open");
      });
    } else {
      this.handleQwenCancel();
    }
  };

  private handleQwenProceed(): void {
    if (this.$buttonText) {
      this.$buttonText.textContent = "Qwen";
    }

    if (this.$button) {
      this.$button.blur();
      this.$button.disabled = true;
    }

    this.setLoading(true);

    // Dispatch the strategy change event
    document.dispatchEvent(
      new CustomEvent("strategy-changed", {
        detail: { strategy: "qwen" },
      }),
    );
  }

  private handleQwenCancel(): void {
    this.handleInitStrategy();
  }

  private getTemplate(templateId: string): DocumentFragment | undefined {
    if (this.shadowRoot === null) return;
    const $template =
      this.shadowRoot.querySelector<HTMLTemplateElement>(templateId);

    if (!$template || !this.$dropdownContent) {
      return;
    }

    return $template.content.cloneNode(true) as DocumentFragment;
  }

  private setLoading(isLoading: boolean): void {
    if (this.$button) {
      this.$button.disabled = isLoading;
      this.$button.classList.toggle("loading", isLoading);
    }
  }

  protected override disconnectedCallback(): void {
    document.removeEventListener(
      "modal-portaled-openQwenModal",
      this.boundQwenModalHandler,
    );

    this.$button = null;
    this.$dropdown = null;
    this.$dropdownContent = null;
    this.$buttonText = null;
    this.$mobileMenuBtn = null;
  }
}

customElements.define("chat-header", ChatHeader);

import reset from "@/styles/reset.css?inline";

const resetSheet = new CSSStyleSheet();
resetSheet.replaceSync(reset);

export class BaseComponent extends HTMLElement {
  private componentSheet = new CSSStyleSheet();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  protected connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  protected disconnectedCallback(): void {}
  protected adoptedCallback(): void {}

  /**
   * A dedicated place for adding event listeners.
   * Called automatically after the component is rendered.
   */
  protected setupEventListeners(): void {}

  /**
   * Getter for component-specific CSS styles.
   * Subclasses should override this.
   * @returns {string}
   */
  protected get cssStyles(): string {
    return "";
  }

  /**
   * Getter for the component's HTML structure.
   * Subclasses should override this.
   * @returns {string}
   */
  protected get htmlTemplate(): string {
    return "";
  }

  /**
   * The core render method. It now uses <template> and adoptedStyleSheets
   * for optimal performance. It's called automatically from connectedCallback.
   */
  protected render(): void {
    if (!this.shadowRoot) {
      this.innerHTML = `
            <style>
                ${reset}
                ${this.cssStyles}
            </style>
            ${this.htmlTemplate}
        `;
      return;
    }

    this.componentSheet.replaceSync(this.cssStyles);
    this.shadowRoot.adoptedStyleSheets = [resetSheet, this.componentSheet];

    const template = document.createElement("template");
    template.innerHTML = this.htmlTemplate;

    this.shadowRoot.innerHTML = ""; // Clear existing content
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

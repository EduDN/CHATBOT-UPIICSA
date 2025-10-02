import { BaseComponent } from '../../core/base-component';
import template from './template.html?raw';
import style from './style.css?inline';

interface SearchResult {
  id: string;
  question: string;
  answer: string;
}

export class SearchModal extends BaseComponent {
  private datasetItems: SearchResult[] = [];
  private filteredResults: SearchResult[] = [];
  private searchInput!: HTMLInputElement;
  private searchClear!: HTMLElement;
  private resultsContainer!: HTMLElement;
  private searchPlaceholder!: HTMLElement;
  private closeButton!: HTMLElement;
  private backdrop!: HTMLElement;
  private triggerElement: HTMLElement | null = null;
  private $parentElement: HTMLElement | null = null;
  private boundOpenHandler: () => void = this.open.bind(this);
  private boundCloseHandler: () => void = this.close.bind(this);
  private boundEscapeHandler: (e: KeyboardEvent) => void = this.handleEscape.bind(this);

  constructor() {
    super();
    this.$parentElement = this.parentElement;
    this.loadDataset();
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    
    if (this.parentNode !== document.body) {
      document.body.appendChild(this);
    }
    
    this.initializeElements();
    this.bindEvents();
    this.updateResults();
  }

  protected override setupEventListeners(): void {
    if (!this.shadowRoot) return;
    
    const triggerId = this.getAttribute("for");
    if (!triggerId) return;
    if (!this.$parentElement) return;
    
    this.triggerElement = this.$parentElement.querySelector<HTMLElement>(`#${triggerId}`);
    if (!this.triggerElement) return;
    
    this.triggerElement.addEventListener("click", this.boundOpenHandler);
    document.addEventListener("keydown", this.boundEscapeHandler);
  }

  protected override disconnectedCallback(): void {
    if (this.triggerElement) {
      this.triggerElement.removeEventListener("click", this.boundOpenHandler);
    }
    document.removeEventListener("keydown", this.boundEscapeHandler);
  }

  private initializeElements(): void {
    this.searchInput = this.shadowRoot!.querySelector(
      ".search-input",
    ) as HTMLInputElement;
    this.searchClear = this.shadowRoot!.querySelector(
      ".search-clear",
    ) as HTMLElement;
    this.resultsContainer = this.shadowRoot!.querySelector(
      ".search-results",
    ) as HTMLElement;
    this.searchPlaceholder = this.shadowRoot!.querySelector(
      ".search-placeholder",
    ) as HTMLElement;
    this.closeButton = this.shadowRoot!.querySelector(
      ".close-button",
    ) as HTMLElement;
    this.backdrop = this.shadowRoot!.querySelector(
      ".search-modal-backdrop",
    ) as HTMLElement;
  }

  private bindEvents(): void {
    // Search input events
    this.searchInput.addEventListener("input", () => this.handleSearch());
    this.searchInput.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Clear search
    this.searchClear.addEventListener("click", () => this.clearSearch());

    // Close modal events
    this.closeButton.addEventListener("click", this.boundCloseHandler);
    this.backdrop.addEventListener("click", this.boundCloseHandler);

    // Result item clicks (event delegation)
    this.resultsContainer.addEventListener("click", (e) =>
      this.handleResultClick(e),
    );
  }

  private handleEscape(e: KeyboardEvent): void {
    if (e.key === "Escape" && this.hasAttribute("open")) {
      this.close();
    }
  }

  private async loadDataset(): Promise<void> {
    try {
      const response = await fetch("/dataset.json");
      if (!response.ok) {
        throw new Error("Failed to load dataset");
      }

      const data = await response.json();

      // Transform dataset to our format
      this.datasetItems = data
        .map((item: any, index: number) => ({
          id: `result-${index}`,
          question: item.question || item.pregunta || "",
          answer: item.answer || item.respuesta || "",
        }))
        .filter((item: SearchResult) => item.question && item.answer);

      console.log(`Loaded ${this.datasetItems.length} questions from dataset`);

      // Update results if modal is already open
      if (this.hasAttribute("open")) {
        this.updateResults();
      }
    } catch (error) {
      console.error("Error loading dataset:", error);
      this.datasetItems = [];
    }
  }

  private handleSearch(): void {
    const query = this.normalizeText(this.searchInput.value.trim());

    if (!query) {
      this.filteredResults = [];
    } else {
      this.filteredResults = this.datasetItems.filter(
        (item) =>
          this.normalizeText(item.question).includes(query) ||
          this.normalizeText(item.answer).includes(query),
      );
    }

    this.updateResults();
    this.updateClearButton();
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
      .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus first result if available
      const firstResult = this.resultsContainer.querySelector(
        ".search-result-question",
      ) as HTMLElement;
      if (firstResult) {
        firstResult.focus();
      }
    }
  }

  private clearSearch(): void {
    this.searchInput.value = "";
    this.filteredResults = [];
    this.updateResults();
    this.updateClearButton();
    this.searchInput.focus();
  }

  private updateClearButton(): void {
    const hasValue = this.searchInput.value.trim().length > 0;
    this.searchClear.style.display = hasValue ? "flex" : "none";
  }

  private updateResults(): void {
    const hasQuery = this.searchInput.value.trim().length > 0;

    if (!hasQuery || this.filteredResults.length === 0) {
      this.showPlaceholder(hasQuery);
      return;
    }

    this.hidePlaceholder();
    this.renderResults();
  }

  private showPlaceholder(hasQuery: boolean): void {
    const title = this.searchPlaceholder.querySelector("h3")!;
    const description = this.searchPlaceholder.querySelector("p")!;

    if (hasQuery) {
      title.textContent = "No se encontraron resultados";
      description.textContent =
        "Intenta con diferentes palabras clave o términos más generales.";
    } else {
      title.textContent = "Busca en la base de conocimientos";
      description.textContent =
        "Escribe tu pregunta para encontrar respuestas de la base de datos de UPII.";
    }

    this.searchPlaceholder.style.display = "flex";
    this.clearResultsContainer();
  }

  private hidePlaceholder(): void {
    this.searchPlaceholder.style.display = "none";
  }

  private clearResultsContainer(): void {
    const existingResults = this.resultsContainer.querySelectorAll(
      ".search-result-item",
    );
    existingResults.forEach((result) => result.remove());
  }

  private renderResults(): void {
    this.clearResultsContainer();

    this.filteredResults.forEach((result) => {
      const resultElement = this.createResultElement(result);
      this.resultsContainer.appendChild(resultElement);
    });
  }

  private createResultElement(result: SearchResult): HTMLElement {
    const resultItem = document.createElement("div");
    resultItem.className = "search-result-item";
    resultItem.dataset.id = result.id;
    resultItem.dataset.expanded = "false";

    resultItem.innerHTML = `
      <div class="search-result-question" tabindex="0">
        <h4>${this.highlightQuery(result.question)}</h4>
        <svg class="search-result-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      <div class="search-result-answer">
        ${this.highlightQuery(result.answer)}
      </div>
    `;

    return resultItem;
  }

  private highlightQuery(text: string): string {
    const query = this.searchInput.value.trim();
    if (!query) return text;

    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");

    return text.replace(
      regex,
      '<mark style="background: var(--color-accent-primary); color: var(--color-text-primary); padding: 0 2px; border-radius: 2px;">$1</mark>',
    );
  }

  private handleResultClick(e: Event): void {
    const target = e.target as HTMLElement;
    const questionElement = target.closest(
      ".search-result-question",
    ) as HTMLElement;

    if (!questionElement) return;

    const resultItem = questionElement.closest(
      ".search-result-item",
    ) as HTMLElement;
    if (!resultItem) return;

    this.toggleResult(resultItem);
  }

  private toggleResult(resultItem: HTMLElement): void {
    const isExpanded = resultItem.dataset.expanded === "true";
    const newState = !isExpanded;

    resultItem.dataset.expanded = newState.toString();

    // Collapse other results (accordion behavior)
    if (newState) {
      const otherResults = this.resultsContainer.querySelectorAll(
        ".search-result-item",
      );
      otherResults.forEach((item) => {
        if (item !== resultItem) {
          item.setAttribute("data-expanded", "false");
        }
      });
    }
  }

  public open(): void {
    this.setAttribute("open", "");
    document.body.style.overflow = "hidden";

    // Focus search input after animation
    setTimeout(() => {
      this.searchInput.focus();
    }, 150);
  }

  public close(): void {
    this.removeAttribute("open");
    document.body.style.overflow = "";

    // Clear search when closing
    setTimeout(() => {
      this.clearSearch();
    }, 300);

    // Dispatch close event like modal-window
    this.dispatchEvent(
      new CustomEvent("closed", { bubbles: true, composed: true })
    );
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }
}

customElements.define("search-modal", SearchModal);

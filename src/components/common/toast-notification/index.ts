import { BaseComponent } from '../../core/base-component';
import template from './template.html?raw';
import style from './style.css?inline';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  showProgress?: boolean;
}

export class ToastNotification extends BaseComponent {
  private closeButton!: HTMLButtonElement;
  private titleElement!: HTMLElement;
  private messageElement!: HTMLElement;
  private iconElement!: HTMLElement;
  private progressElement?: HTMLElement;
  private autoCloseTimer?: number;
  private options: ToastOptions = {
    title: '',
    variant: 'info',
    duration: 5000,
    showProgress: true
  };

  constructor(options: ToastOptions) {
    super();
    this.options = { ...this.options, ...options };
  }

  protected override connectedCallback(): void {
    super.connectedCallback();
    this.initializeElements();
    this.setupContent();
    this.bindEvents();
    this.show();
  }

  private initializeElements(): void {
    this.closeButton = this.shadowRoot!.querySelector('.toast-close') as HTMLButtonElement;
    this.titleElement = this.shadowRoot!.querySelector('.toast-title') as HTMLElement;
    this.messageElement = this.shadowRoot!.querySelector('.toast-message') as HTMLElement;
    this.iconElement = this.shadowRoot!.querySelector('.toast-icon') as HTMLElement;
  }

  private setupContent(): void {
    // Set variant attribute
    if (this.options.variant) {
      this.setAttribute('variant', this.options.variant);
    }

    // Set title
    this.titleElement.textContent = this.options.title;

    // Set message (hide if not provided)
    if (this.options.message) {
      this.messageElement.textContent = this.options.message;
    } else {
      this.messageElement.style.display = 'none';
    }

    // Set icon based on variant
    this.setIcon();

    // Add progress bar if needed
    if (this.options.showProgress && this.options.duration && this.options.duration > 0) {
      this.addProgressBar();
    }
  }

  private setIcon(): void {
    const icons = {
      success: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      `,
      error: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `,
      warning: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="m12 17 .01 0"/>
        </svg>
      `,
      info: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      `
    };

    this.iconElement.innerHTML = icons[this.options.variant || 'info'];
  }

  private addProgressBar(): void {
    if (!this.options.duration || this.options.duration <= 0) return;

    this.progressElement = document.createElement('div');
    this.progressElement.className = 'toast-progress';
    this.progressElement.style.animationDuration = `${this.options.duration}ms`;
    
    const container = this.shadowRoot!.querySelector('.toast-container');
    container?.appendChild(this.progressElement);
  }

  private bindEvents(): void {
    // Close button
    this.closeButton.addEventListener('click', () => this.dismiss());

    // Auto-dismiss timer
    if (this.options.duration && this.options.duration > 0) {
      this.autoCloseTimer = window.setTimeout(() => {
        this.dismiss();
      }, this.options.duration);
    }

    // Pause auto-dismiss on hover
    if (this.autoCloseTimer) {
      let remainingTime = this.options.duration || 0;
      let startTime = Date.now();

      this.addEventListener('mouseenter', () => {
        if (this.autoCloseTimer) {
          clearTimeout(this.autoCloseTimer);
          remainingTime = remainingTime - (Date.now() - startTime);
          this.progressElement?.style.setProperty('animation-play-state', 'paused');
        }
      });

      this.addEventListener('mouseleave', () => {
        if (remainingTime > 0) {
          startTime = Date.now();
          this.autoCloseTimer = window.setTimeout(() => {
            this.dismiss();
          }, remainingTime);
          this.progressElement?.style.setProperty('animation-play-state', 'running');
        }
      });
    }
  }

  private show(): void {
    // Trigger reflow to ensure initial state is applied
    this.offsetHeight;
    
    // Show the toast
    this.setAttribute('visible', '');
  }

  public dismiss(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }

    this.setAttribute('hiding', '');

    // Remove after animation completes
    setTimeout(() => {
      this.remove();
      
      // Dispatch event for cleanup
      this.dispatchEvent(new CustomEvent('toast-dismissed', {
        bubbles: true,
        composed: true,
        detail: { toast: this }
      }));
    }, 300);
  }

  protected override get htmlTemplate(): string {
    return template;
  }

  protected override get cssStyles(): string {
    return style;
  }
}

customElements.define('toast-notification', ToastNotification);
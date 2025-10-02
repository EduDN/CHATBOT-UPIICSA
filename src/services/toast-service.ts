import { ToastNotification } from '../components/common/toast-notification';
import type { ToastOptions } from '../components/common/toast-notification';

class ToastService {
  private toasts: Set<ToastNotification> = new Set();
  private maxToasts = 5; // Maximum number of toasts to show at once

  /**
   * Show a success toast notification
   */
  public success(title: string, message?: string, options?: Partial<ToastOptions>): ToastNotification {
    return this.show({
      title,
      message,
      variant: 'success',
      ...options
    });
  }

  /**
   * Show an error toast notification
   */
  public error(title: string, message?: string, options?: Partial<ToastOptions>): ToastNotification {
    return this.show({
      title,
      message,
      variant: 'error',
      duration: 0, // Don't auto-dismiss errors by default
      ...options
    });
  }

  /**
   * Show a warning toast notification
   */
  public warning(title: string, message?: string, options?: Partial<ToastOptions>): ToastNotification {
    return this.show({
      title,
      message,
      variant: 'warning',
      duration: 7000, // Longer duration for warnings
      ...options
    });
  }

  /**
   * Show an info toast notification
   */
  public info(title: string, message?: string, options?: Partial<ToastOptions>): ToastNotification {
    return this.show({
      title,
      message,
      variant: 'info',
      ...options
    });
  }

  /**
   * Show a toast notification with custom options
   */
  public show(options: ToastOptions): ToastNotification {
    // Clean up any orphaned toast elements first
    this.cleanupOrphanedToasts();

    // Remove oldest toast if we're at the limit
    if (this.toasts.size >= this.maxToasts) {
      const oldestToast = this.toasts.values().next().value;
      if (oldestToast) {
        oldestToast.dismiss();
      }
    }

    // Create and show new toast
    const toast = new ToastNotification(options);
    this.toasts.add(toast);

    // Position the toast
    this.positionToast(toast);

    // Add to DOM
    document.body.appendChild(toast);

    // Handle cleanup when toast is dismissed
    toast.addEventListener('toast-dismissed', () => {
      this.toasts.delete(toast);
      this.repositionToasts();
      
      // Extra cleanup - ensure it's removed from DOM
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });

    return toast;
  }

  /**
   * Clean up any orphaned toast elements in the DOM
   */
  private cleanupOrphanedToasts(): void {
    const orphanedToasts = document.querySelectorAll('toast-notification');
    orphanedToasts.forEach(toast => {
      // Check if this toast is in our active toasts set
      let isActive = false;
      this.toasts.forEach(activeToast => {
        if (activeToast === toast) {
          isActive = true;
        }
      });
      
      // If not active, remove it
      if (!isActive) {
        toast.remove();
      }
    });
  }

  /**
   * Dismiss all active toasts
   */
  public dismissAll(): void {
    this.toasts.forEach(toast => toast.dismiss());
    this.toasts.clear();
    
    // Force cleanup of any remaining toast elements
    setTimeout(() => {
      this.cleanupOrphanedToasts();
    }, 350);
  }

  /**
   * Position a toast based on existing toasts
   */
  private positionToast(toast: ToastNotification): void {
    const index = this.toasts.size - 1;
    const offset = index * 80; // 80px spacing between toasts
    
    // Set initial position
    toast.style.setProperty('--toast-offset', `${offset}px`);
    
    // Apply positioning styles
    if (window.innerWidth <= 640) {
      // Mobile: stack vertically from top
      toast.style.top = `${1 + (offset / 10)}rem`;
    } else {
      // Desktop: stack vertically from top-right
      toast.style.top = `${1 + (offset / 10)}rem`;
    }
  }

  /**
   * Reposition all toasts after one is dismissed
   */
  private repositionToasts(): void {
    let index = 0;
    this.toasts.forEach(toast => {
      const offset = index * 80;
      
      if (window.innerWidth <= 640) {
        toast.style.top = `${1 + (offset / 10)}rem`;
      } else {
        toast.style.top = `${1 + (offset / 10)}rem`;
      }
      
      index++;
    });
  }

  /**
   * Get the number of active toasts
   */
  public get activeCount(): number {
    return this.toasts.size;
  }

  /**
   * Debug method to check for issues
   */
  public debug(): void {
    console.log('Active toasts in service:', this.toasts.size);
    console.log('Toast elements in DOM:', document.querySelectorAll('toast-notification').length);
    
    const toastElements = document.querySelectorAll('toast-notification');
    toastElements.forEach((element, index) => {
      console.log(`Toast ${index}:`, {
        visible: element.hasAttribute('visible'),
        hiding: element.hasAttribute('hiding'),
        pointerEvents: getComputedStyle(element).pointerEvents,
        zIndex: getComputedStyle(element).zIndex
      });
    });
  }
}

// Export singleton instance
export const toastService = new ToastService();
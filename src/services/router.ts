export class Router {
  private static currentRoute: string =
    window.location.pathname + window.location.search;

  static init(): void {
    window.addEventListener("popstate", () => {
      const url = window.location.pathname;
      const search = window.location.search;
      const fullPath = url + search;

      this.handleRoute(fullPath); // Pass full path
      document.dispatchEvent(
        new CustomEvent("route-changed", {
          detail: { route: fullPath },
        }),
      );
    });

    const fullPath = window.location.pathname + window.location.search;
    this.handleRoute(fullPath);
  }

  public static goToRoute(path: string, replace?: boolean): void {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }
    this.currentRoute = path; // Store full path now
    document.dispatchEvent(
      new CustomEvent("route-changed", {
        detail: { route: path },
      }),
    );
  }

  public static handleRoute(path: string): void {
    console.log("Current route:", this.currentRoute);
    console.log("Handling route:", path);

    if (this.currentRoute === path) {
      return; // Now compares full paths including query params
    }

    this.currentRoute = path;

    // Parse the path
    const [pathname, search] = path.split("?");

    if (pathname === "/") {
      return;
    }

    // Validate chat routes
    if (pathname === "/chat") {
      const urlParams = new URLSearchParams(search || "");
      const id = urlParams.get("id");
      const isValidId = this.isValidUUID(id || "");

      if (!isValidId) {
        this.goToRoute("/", true);
        return;
      }

      // Valid chat route - let components handle it
      return;
    }

    // Unknown route, redirect to home
    this.goToRoute("/", true);
  }

  /**
   * Get current chat ID from URL with built-in validation
   */
  public static getCurrentChatId(): string | null {
    if (window.location.pathname !== "/chat") {
      return null;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    return id && this.isValidUUID(id) ? id : null;
  }

  /**
   * Check if we're currently on a valid chat route
   */
  public static isOnChatRoute(): boolean {
    return (
      window.location.pathname === "/chat" && this.getCurrentChatId() !== null
    );
  }

  /**
   * Check if we're on home route
   */
  public static isOnHomeRoute(): boolean {
    const pathname = window.location.pathname;
    return pathname === "/" || pathname === "";
  }

  /**
   * Navigate to a specific chat (with validation)
   */
  public static goToChat(chatId: string): void {
    if (!this.isValidUUID(chatId)) {
      console.warn("Invalid chat ID provided:", chatId);
      this.goToRoute("/", true);
      return;
    }
    this.goToRoute(`/chat?id=${chatId}`);
  }

  private static isValidUUID(uuid: string): boolean {
    return (
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uuid,
      ) ||
      /^[0-9A-F]{8}-[0-9A-F]{4}-[5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        uuid,
      )
    );
  }
}

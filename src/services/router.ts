export class Router {
  private static currentRoute: string = window.location.pathname;

  static init(): void {
    window.addEventListener("popstate", () => {
      const url = window.location.pathname;
      const id = new URLSearchParams(window.location.search).get("id");
      const fullPath = id ? `${url}?id=${id}` : url;
      this.handleRoute(url);
      document.dispatchEvent(
        new CustomEvent("route-changed", {
          detail: { route: fullPath },
        }),
      );
    });

    const url = window.location.pathname;
    this.handleRoute(url);
  }

  public static goToRoute(path: string, replace?: boolean): void {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }
    this.currentRoute = path;
    document.dispatchEvent(
      new CustomEvent("route-changed", {
        detail: { route: path },
      }),
    );
  }

  public static handleRoute(path: string): void {
    if (this.currentRoute === path) {
      return;
    }

    this.currentRoute = path;

    if (this.currentRoute === "/") {
      // this.goToRoute("/");
      return;
    }

    const id = new URLSearchParams(window.location.search).get("id");
    const url = path.replaceAll("/", "");
    const isValidId = this.isValidUUID(id || "");

    if (!isValidId || url !== "chat") {
      this.goToRoute("/", true);
      return;
    }
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

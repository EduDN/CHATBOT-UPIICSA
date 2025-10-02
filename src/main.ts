import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";
import "@/components/side-bar";
import "@/components/chat-input";
import "@/components/chat-messages";
import "@/components/chat-header";
import "@/components/common/modal-window";
import "@/components/common/action-menu";
import "@/components/common/search-modal";
import "@/components/common/toast-notification";
import { storageService } from "@/services/store";
import { toastService } from "@/services/toast-service";
import { startTour } from "@/services/driver";

// Make services available globally for debugging
(window as any).toastService = toastService;
(window as any).storageService = storageService;

// TODO: fix service worker error
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/sw.js");
//   });
// }

const appState = storageService.getAppState();

const aiWorker = new Worker(
  new URL("./workers/ai-worker.ts", import.meta.url),
  { type: "module" },
);

aiWorker.onmessage = (event) => {
  const { status, answer, error } = event.data;

  if (status === "ready") {
    document.dispatchEvent(new CustomEvent("app-ready"));
    toastService.success(
      "UPIIChat listo",
      "El asistente IA está preparado para ayudarte.",
    );
  }
  if (status === "strategy-ready") {
    document.dispatchEvent(new CustomEvent("strategy-ready"));
    toastService.info(
      "Modelo cargado",
      "El modelo de IA está listo para responder tus preguntas.",
    );
  }
  if (status === "answer") {
    document.dispatchEvent(
      new CustomEvent("assistant-answer", { detail: { answer } }),
    );
  }
  if (status === "error") {
    console.error("Received error from AI Worker:", error);

    // Show error toast notification
    toastService.error(
      "Error del Asistente IA",
      error ||
        "Ocurrió un problema al procesar tu mensaje. Inténtalo de nuevo.",
    );
  }
};

aiWorker.postMessage({ type: "initialize" });
aiWorker.postMessage({
  type: "setStrategy",
  payload: { strategyKey: appState.activeStrategy },
});

document.addEventListener("strategy-changed", (event) => {
  const { strategy } = (event as CustomEvent).detail;

  // Save the new strategy to storage
  storageService.updateAppState({ activeStrategy: strategy });

  aiWorker.postMessage({
    type: "setStrategy",
    payload: { strategyKey: strategy },
  });
});

document.addEventListener("question-asked", (event) => {
  const { question } = (event as CustomEvent).detail;
  aiWorker.postMessage({ type: "findAnswer", payload: { question } });
});

// Wait for the DOM to be fully loaded before running the script
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <chat-container>
    <side-bar></side-bar>
    <!-- <chat-window class="main-content"> -->
    <main class="main-content">
      <chat-header>
        Header
      </chat-header>
        <chat-messages></chat-messages>
      <chat-input></chat-input>
    </main>
    <!-- </chat-window> -->
  </chat-container>
`;

  // Check if the visualViewport API is supported
  if (window.visualViewport) {
    const mainContent =
      document.querySelector<HTMLHtmlElement>(".main-content");

    if (!mainContent) {
      return;
    }

    // This function sets the container's height to the visible area's height
    const handleViewportResize = () => {
      // Get the current height of the visible area
      const viewportHeight = window?.visualViewport?.height;
      // Apply this height directly to the main content element
      mainContent.style.height = `${viewportHeight}px`;
    };

    // Run the function once on load
    handleViewportResize();

    // Add an event listener to run the function whenever the viewport resizes
    window.visualViewport.addEventListener("resize", handleViewportResize);
  }
  if (appState.tutorialCompleted) return;
  const chatInputElement = document.querySelector("chat-input");
  const chatSidebarElement = document.querySelector("side-bar");
  const chatHeaderElement = document.querySelector("chat-header");
  if (
    !chatInputElement?.shadowRoot ||
    !chatSidebarElement?.shadowRoot ||
    !chatHeaderElement?.shadowRoot
  )
    return;

  const $searchButton =
    chatInputElement.shadowRoot.querySelector<HTMLElement>("#searchButton");
  const $modelSelectElement =
    chatHeaderElement.shadowRoot.querySelector<HTMLElement>(".dropdown");
  const $newChatElement =
    chatSidebarElement.shadowRoot.querySelector<HTMLElement>("#new-chat");
  const $toggleMenuElement =
    chatSidebarElement.shadowRoot.querySelector<HTMLElement>("#sidebar-toggle");
  const $moreToolsElement =
    chatSidebarElement.shadowRoot.querySelector<HTMLElement>(
      "#openMoreToolsModal",
    );
  // const $settingsButtonElement =
  //   chatSidebarElement.shadowRoot.querySelector<HTMLElement>(
  //     "#openSettingsModal",
  //   );

  if (
    !$searchButton ||
    !$modelSelectElement ||
    !$newChatElement ||
    !$toggleMenuElement ||
    !$moreToolsElement
    // !$settingsButtonElement
  )
    return;

  // Start the tour once the app is ready
  startTour(
    $modelSelectElement,
    $searchButton,
    $newChatElement,
    $toggleMenuElement,
    $moreToolsElement,
    // $settingsButtonElement,
  );
});

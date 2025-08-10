import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";
import "@/components/side-bar";
import "@/components/chat-input";
import "@/components/chat-messages";
import "@/components/chat-header";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
const aiWorker = new Worker(
  new URL("./workers/ai-worker.ts", import.meta.url),
  { type: "module" },
);

aiWorker.onmessage = (event) => {
  const { status, answer, error } = event.data;

  if (status === "ready") {
    document.dispatchEvent(new CustomEvent("app-ready"));
  }
  if (status === "strategy-ready") {
    document.dispatchEvent(new CustomEvent("strategy-ready"));
  }
  if (status === "answer") {
    document.dispatchEvent(
      new CustomEvent("assistant-answer", { detail: { answer } }),
    );
  }
  if (status === "error") {
    console.error("Received error from AI Worker:", error);
    // TODO: display the error in the UI
  }
};

aiWorker.postMessage({ type: "initialize" });

document.addEventListener("strategy-changed", (event) => {
  const { strategy } = (event as CustomEvent).detail;
  aiWorker.postMessage({
    type: "setStrategy",
    payload: { strategyKey: strategy },
  });
});

document.addEventListener("question-asked", (event) => {
  console.log("Question asked event received:", event);
  const { question } = (event as CustomEvent).detail;
  aiWorker.postMessage({ type: "findAnswer", payload: { question } });
});

// Wait for the DOM to be fully loaded before running the script
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <chat-container>
    <!-- TODO: uncomment this later when we add the chat history feature-->
    <!-- <side-bar></side-bar> -->
    <chat-window class="main-content">
      <chat-header>
        Header
      </chat-header>
        <chat-messages>
        </chat-messages>
      <chat-input></chat-input>
    </chat-window>
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
});

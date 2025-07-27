import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";
import "@/components/side-bar";
import "@/components/chat-input";
import "@/components/chat-messages";
import "@/components/chat-header";

import { chatbotService } from "@/services/chatbot-service";
import { env } from "@xenova/transformers";

// Tell the library to NOT look for models locally.
env.allowLocalModels = false;
env.useBrowserCache = false;

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

chatbotService.initialize().then(() => {
  console.log("Chatbot service initialized and ready.");
  // Maybe dispatch an event to enable the chat input
  document.dispatchEvent(new CustomEvent("app-ready"));
});

// Wait for the DOM to be fully loaded before running the script
window.addEventListener("DOMContentLoaded", () => {
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

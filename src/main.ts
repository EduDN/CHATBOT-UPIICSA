import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";
import "@/components/side-bar";
import "@/components/chat-input";
import "@/components/chat-messages";
import { chatbotService } from "@/services/chatbot-service";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <chat-container>
    <side-bar></side-bar>
    <chat-window class="main-content">
      <header-chat>
        Header
      </header-chat>
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

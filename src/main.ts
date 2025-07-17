import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";
import "@/components/side-bar";
import "@/components/chat-input";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <chat-container>
    <side-bar></side-bar>
    <chat-window class="main-content">
      <header-chat>
        Header
      </header-chat>
      <div class="messages-content">
        <messages-container></messages-container>
        <chat-input></chat-input>
      </div>
    </chat-window>
  </chat-container>
`;

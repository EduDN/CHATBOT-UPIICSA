import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";
import "@/components/side-bar";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <chat-container>
    <side-bar></side-bar>
  </chat-container>
`;

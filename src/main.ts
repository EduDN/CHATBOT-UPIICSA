import "@/styles/global.css";
import "@/styles/reset.css";
import "@/components/chat-container";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <chat-container>
  </chat-container>
`;

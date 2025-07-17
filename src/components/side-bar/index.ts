import { BaseComponent } from "../core/base-component";
import template from "./template.html?raw";
// import style from "./style.css?inline";

class Sidebar extends BaseComponent {
  constructor() {
    super();
  }

  protected override get htmlTemplate(): string {
    return `<div class="sidebar">Sidebar Content</div>`;
  }

  protected override setupEventListeners(): void {
    console.log("Sidebar: Setting up event listeners.");
    // console.log("style", style);
    console.log("template", template);
  }
}

customElements.define("side-bar", Sidebar);

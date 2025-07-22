import { BaseComponent } from "../core/base-component";
// import template from "./template.html?raw";
// import style from "./style.css?inline";

class Sidebar extends BaseComponent {
  constructor() {
    super();
  }

  protected override get htmlTemplate(): string {
    return `<div class="sidebar">Sidebar Content</div>`;
  }

  protected override setupEventListeners(): void {}
}

customElements.define("side-bar", Sidebar);

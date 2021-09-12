import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-ag-button",
  styleUrl: "ch-grid-ag-button.scss",
  shadow: true,
})
export class ChGridAgButton {
  //Ag stands for "Action group"

  render() {
    return (
      <Host>
        <button>
          <slot></slot>
        </button>
      </Host>
    );
  }
}

import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-footer",
  styleUrl: "ch-grid-footer.scss",
  shadow: true,
})
export class ChGridFooter {
  render() {
    return (
      <Host>
        <footer>
          <slot></slot>
        </footer>
      </Host>
    );
  }
}

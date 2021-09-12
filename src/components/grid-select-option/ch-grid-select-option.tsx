import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-grid-select-option",
  styleUrl: "ch-grid-select-option.scss",
  shadow: true,
})
export class ChGridSelectOption {
  render() {
    return (
      <option>
        <slot></slot>
      </option>
    );
  }
}

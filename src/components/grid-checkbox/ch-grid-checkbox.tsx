import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-grid-checkbox",
  styleUrl: "ch-grid-checkbox.scss",
  shadow: true,
})
export class ChGridCheckbox {
  /*******************
  PROPS
  ********************/

  /**
   * Whether the checkbox is checked or not
   */
  @Prop() checked: boolean = false;

  render() {
    return (
      <Host>
        <input type="checkbox" checked={this.checked}></input>
      </Host>
    );
  }
}

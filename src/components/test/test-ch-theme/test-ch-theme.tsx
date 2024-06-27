import { Component, h, Host } from "@stencil/core";

@Component({
  shadow: false,
  styleUrl: "test-ch-theme.css",
  tag: "ch-test-theme"
})
export class ChTestChTheme {
  render() {
    return (
      <Host>
        <div class="box box--red">red border</div>
        <br />
        <div class="box box--green">green border</div>
        <ch-theme name="my-theme"></ch-theme>
      </Host>
    );
  }
}

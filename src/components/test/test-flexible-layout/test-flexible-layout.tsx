import { Component, Prop, h } from "@stencil/core";
import { FlexibleLayout } from "../../flexible-layout/types";
// import { defaultLayout, layout2, layoutRenders } from "./renders";
import { layout2, layoutRenders } from "./renders";

@Component({
  shadow: false,
  styleUrl: "test-flexible-layout.scss",
  tag: "ch-test-flexible-layout"
})
export class ChTestFlexibleLayout {
  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layout: FlexibleLayout = layout2;

  render() {
    return (
      <ch-flexible-layout-render
        layout={this.layout}
        renders={layoutRenders}
      ></ch-flexible-layout-render>
    );
  }
}

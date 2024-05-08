import { Component, Prop, h } from "@stencil/core";
import { FlexibleLayout } from "../../flexible-layout/internal/flexible-layout/types";
// import { defaultLayout, layout2, layoutRenders } from "./renders";
import { layout3, layoutRenders } from "./renders";

@Component({
  shadow: false,
  styleUrl: "test-flexible-layout.scss",
  tag: "ch-test-flexible-layout"
})
export class ChTestFlexibleLayout {
  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly model: FlexibleLayout = layout3;

  render() {
    return (
      <ch-flexible-layout-render
        model={this.model}
        renders={layoutRenders}
      ></ch-flexible-layout-render>
    );
  }
}

import { Component, Prop, h } from "@stencil/core";
import { FlexibleLayoutModel } from "../../flexible-layout/internal/flexible-layout/types";
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
  @Prop() readonly model: FlexibleLayoutModel = layout3;

  /**
   * Specifies the design system used. Only for testing purposes.
   */
  @Prop() readonly designSystem!: "mercury" | "unanimo";

  render() {
    return (
      <ch-flexible-layout-render
        class="flexible-layout"
        closeButton
        contain="size"
        dragOutside
        model={this.model}
        renders={layoutRenders(this.designSystem)}
        sortable
      ></ch-flexible-layout-render>
    );
  }
}

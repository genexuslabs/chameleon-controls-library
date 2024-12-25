import { Component, Prop, h } from "@stencil/core";
import { FlexibleLayoutModel } from "../../flexible-layout/internal/flexible-layout/types";
// import { defaultLayout, layout2, layoutRenders } from "./renders";
import { layout3, layoutRenders, MENU_BAR, TOOLBOX } from "./renders";
import { panelToolbox } from "../../../showcase/assets/components/action-list/models";
import { GXWebModel } from "../../../showcase/assets/components/action-group/models";

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
      >
        <ch-action-group-render
          slot={MENU_BAR}
          key={MENU_BAR}
          model={GXWebModel}
        ></ch-action-group-render>
        <ch-action-list-render
          slot={TOOLBOX}
          key={TOOLBOX}
          class="list-box list-box-secondary"
          model={panelToolbox}
        ></ch-action-list-render>
      </ch-flexible-layout-render>
    );
  }
}

import { Component, h, Prop } from "@stencil/core";
import { FlexibleLayoutModel } from "../../flexible-layout/internal/flexible-layout/types";
// import { defaultLayout, layout2, layoutRenders } from "./renders";
import { GXWebModel } from "../../../showcase/assets/components/action-group/models";
import { panelToolbox } from "../../../showcase/assets/components/action-list/models";
import { layout3, layoutRenders, MENU_BAR, TOOLBOX } from "./renders";

const casoGerman = true;

const INFO_PANEL_1 = "info-panel-1";
const INFO_PANEL_2 = "info-panel-2";
const PERSON_MANAGER_WIDGET = "person-manager-content";

const SIDEBAR_LEAF_ID = "sidebar";
const CENTER_LEAF_ID = "center";

const GERMAN_LAYOUT_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SIDEBAR_LEAF_ID,
      size: "280px",
      type: "tabbed",
      selectedWidgetId: INFO_PANEL_1,
      tabListPosition: "block-start",
      widgets: [
        { id: INFO_PANEL_1, name: "Overview" },
        { id: INFO_PANEL_2, name: "Details" }
      ]
    },
    {
      id: CENTER_LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: PERSON_MANAGER_WIDGET, slot: true },
      overflow: "auto"
    }
  ]
};
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
    return casoGerman ? (
      <ch-flexible-layout-render
        class="flexible-layout"
        closeButton
        contain="size"
        dragOutside
        model={GERMAN_LAYOUT_MODEL}
        renders={layoutRenders(this.designSystem)}
        sortable
        slottedWidgets={true}
      >
        <div slot={INFO_PANEL_1}>Overview panel content 2</div>
        <div slot={INFO_PANEL_2}>Details panel content</div>
        <div slot={PERSON_MANAGER_WIDGET} class="center-content">
          Person manager content
        </div>
      </ch-flexible-layout-render>
    ) : (
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
          class="action-group dropdown dropdown-secondary elevation-2"
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

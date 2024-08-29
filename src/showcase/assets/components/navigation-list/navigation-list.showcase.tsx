import { h } from "@stencil/core";
import { ChNavigationListRender } from "../../../../components/navigation-list/navigation-list-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { unanimoShowcase } from "./models";

const state: Partial<Mutable<ChNavigationListRender>> = {};

const render = () => (
  <div class="tab-test-main-wrapper">
    <ch-navigation-list-render
      class="navigation-list"
      autoGrow={state.autoGrow}
      expandableButton={state.expandableButton}
      expandableButtonPosition={state.expandableButtonPosition}
      expanded={state.expanded}
      model={state.model}
      selectedItemIndicator={state.selectedItemIndicator}
      showCaptionOnCollapse={state.showCaptionOnCollapse}
    ></ch-navigation-list-render>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChNavigationListRender>
> = [
  {
    caption: "Models",
    properties: [
      {
        id: "model",
        accessibleName: "Model",
        type: "enum",
        values: [{ caption: "Unanimo Showcase", value: unanimoShowcase }],
        value: unanimoShowcase
      }
    ]
  },
  {
    caption: "Properties",
    properties: [
      {
        id: "autoGrow",
        caption: "Auto Grow",
        value: false,
        type: "boolean"
      },
      {
        id: "expanded",
        caption: "Expanded",
        value: true,
        type: "boolean"
      },
      {
        id: "expandableButton",
        caption: "Expandable button",
        type: "enum",
        values: [
          { caption: "Decorative", value: "decorative" },
          { caption: "No", value: "no" }
        ],
        value: "decorative"
      },
      {
        id: "expandableButtonPosition",
        caption: "Expandable button position",
        type: "enum",
        render: "radio-group",
        values: [
          { caption: "Before", value: "before" },
          { caption: "After", value: "after" }
        ],
        value: "before"
      },
      {
        id: "selectedItemIndicator",
        caption: "Selected Item Indicator",
        value: true,
        type: "boolean"
      },
      {
        id: "showCaptionOnCollapse",
        caption: "Show Caption On Collapse",
        type: "enum",
        render: "radio-group",
        values: [
          { caption: "Inline", value: "inline" },
          { caption: "Tooltip", value: "tooltip" }
        ],
        value: "inline"
      }
    ]
  }
];

export const navigationListShowcaseStory: ShowcaseStory<
  Mutable<ChNavigationListRender>
> = {
  properties: showcaseRenderProperties,
  // markupWithUIModel: {
  //   uiModel: simpleModel2,
  //   uiModelType: "TabModel",
  //   render: `<ch-tab-render
  //         accessibleName={<accessibleName>}
  //         class="tab"
  //         model={this.#controlUIModel}
  //         selectedId={<initial selected id (optional)>}
  //         onSelectedItemChange={this.#handleSelectedItemChange}
  //       >
  //         {renderedItems.has("item1") && (
  //           <div slot="item1">
  //             Content of the item 1
  //             <label>
  //               Any text
  //               <input type="text" />
  //             </label>
  //           </div>
  //         )}

  //         {renderedItems.has("item2") && (
  //           <div slot="item2">Content of the item 2</div>
  //         )}

  //         {renderedItems.has("item3") && (
  //           <div slot="item3">Content of the item 3</div>
  //         )}

  //         {renderedItems.has("item4") && (
  //           <div slot="item4">Content of the item 4</div>
  //         )}
  //       </ch-tab-render>`
  // },
  render: render,
  state: state
};

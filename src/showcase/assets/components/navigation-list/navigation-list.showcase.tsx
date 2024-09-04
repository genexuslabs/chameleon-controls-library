import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { unanimoShowcase } from "./models";
import { ChNavigationListRenderCustomEvent } from "../../../../components";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<HTMLChNavigationListRenderElement> = {};

// The current implementation of the showcase navigates when the hash of the
// URL changes
const preventNavigation = (
  event: ChNavigationListRenderCustomEvent<PointerEvent>
) => event.detail.preventDefault();

const render = () => (
  <div class="tab-test-main-wrapper">
    <ch-navigation-list-render
      class="navigation-list navigation-list-secondary"
      autoGrow={state.autoGrow}
      expandableButton={state.expandableButton}
      expandableButtonPosition={state.expandableButtonPosition}
      expanded={state.expanded}
      model={state.model}
      selectedItemIndicator={state.selectedItemIndicator}
      showCaptionOnCollapse={state.showCaptionOnCollapse}
      tooltipDelay={state.tooltipDelay}
      onHyperlinkClick={preventNavigation}
    ></ch-navigation-list-render>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChNavigationListRenderElement> =
  [
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
        },
        {
          id: "tooltipDelay",
          caption: "Tooltip Delay",
          value: 100,
          type: "number"
        }
      ]
    }
  ];

export const navigationListShowcaseStory: ShowcaseStory<HTMLChNavigationListRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "NavigationListModel",
      render: () => `<ch-navigation-list-render${renderBooleanPropertyOrEmpty(
        "autoGrow",
        state
      )}
          expandableButton="${state.expandableButton}"
          expandableButtonPosition="${state.expandableButtonPosition}"
          class="navigation-list navigation-list-secondary"${renderBooleanPropertyOrEmpty(
            "expanded",
            state
          )}
          model={this.#controlUIModel}${renderBooleanPropertyOrEmpty(
            "selectedItemIndicator",
            state
          )}
          showCaptionOnCollapse="${state.showCaptionOnCollapse}"
          tooltipDelay={${state.tooltipDelay}}
        ></ch-navigation-list-render>`
    },
    render: render,
    state: state
  };

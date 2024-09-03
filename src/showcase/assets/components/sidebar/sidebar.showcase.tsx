import { forceUpdate, h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseRenderPropertyStyleValues,
  ShowcaseStory
} from "../types";
import { ChNavigationListRenderCustomEvent } from "../../../../components";
import { unanimoShowcase } from "../navigation-list/models";

const state: Partial<
  HTMLChSidebarElement &
    HTMLChNavigationListRenderElement & {
      customVars: ShowcaseRenderPropertyStyleValues;
    }
> = {};

// The current implementation of the showcase navigates when the hash of the
// URL changes
const preventNavigation = (
  event: ChNavigationListRenderCustomEvent<PointerEvent>
) => event.detail.preventDefault();

const handleExpandedChange = () => {
  state.expanded = !state.expanded;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  forceUpdate(document.querySelector("ch-showcase"));
};

const render = () => (
  <ch-sidebar
    class="sidebar"
    expandButtonAccessibleName={state.expandButtonAccessibleName}
    expandButtonCaption={state.expandButtonCaption}
    expanded={state.expanded}
    showExpandButton={state.showExpandButton}
    onExpandedChange={handleExpandedChange}
    // showIndicator={state.showIndicator}
    // value={state.value}
  >
    <div class="ch-showcase-sidebar-layout">
      <h2
        class="heading-4"
        style={!state.expanded ? { opacity: "0" } : undefined}
      >
        Menu title
      </h2>

      <ch-navigation-list-render
        class="navigation-list navigation-list-primary"
        autoGrow={state.autoGrow}
        expandableButton={state.expandableButton}
        expandableButtonPosition={state.expandableButtonPosition}
        model={state.model}
        selectedItemIndicator={state.selectedItemIndicator}
        showCaptionOnCollapse={state.showCaptionOnCollapse}
        onHyperlinkClick={preventNavigation}
      ></ch-navigation-list-render>
    </div>
  </ch-sidebar>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  HTMLChSidebarElement & HTMLChNavigationListRenderElement
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
        id: "expanded",
        caption: "Expanded",
        value: false,
        type: "boolean"
      },
      {
        id: "expandButtonCaption",
        caption: "Expand Button Caption",
        value: "Expand",
        type: "string"
      },
      {
        id: "expandButtonAccessibleName",
        caption: "Expand Button Accessible Name",
        value: "",
        type: "string"
      },
      {
        id: "showExpandButton",
        caption: "Show Expand Button",
        value: true,
        type: "boolean"
      }
    ]
  },
  {
    caption: "Navigation List Properties",
    properties: [
      {
        id: "autoGrow",
        caption: "Auto Grow",
        value: false,
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
        value: "tooltip"
      }
    ]
  },
  {
    caption: "Styles",
    properties: [
      {
        id: "customVars",
        type: "style",
        properties: [
          {
            id: "--ch-sidebar-inline-size--collapsed",
            caption: "--ch-sidebar-inline-size--collapsed",
            value: 80,
            render: "input",
            type: "number"
          }
        ]
      }
    ]
  }
];

export const sidebarShowcaseStory: ShowcaseStory<
  HTMLChSidebarElement & HTMLChNavigationListRenderElement
> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};

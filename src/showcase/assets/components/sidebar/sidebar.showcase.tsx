import { h } from "@stencil/core";
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

const render = () => (
  <ch-sidebar
    class="sidebar"
    expandButtonAccessibleName={state.expandButtonAccessibleName}
    expandButtonCaption={state.expandButtonCaption}
    expanded={state.expanded}
    showExpandButton={state.showExpandButton}
    // showIndicator={state.showIndicator}
    // value={state.value}
  >
    <ch-navigation-list-render
      class="navigation-list navigation-list-secondary"
      autoGrow={state.autoGrow}
      expandableButton={state.expandableButton}
      expandableButtonPosition={state.expandableButtonPosition}
      expanded={state.expanded}
      model={state.model}
      selectedItemIndicator={state.selectedItemIndicator}
      showCaptionOnCollapse={state.showCaptionOnCollapse}
      onHyperlinkClick={preventNavigation}
    ></ch-navigation-list-render>
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
        value: true,
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

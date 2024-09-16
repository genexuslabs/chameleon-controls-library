import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { unanimoShowcase } from "./models";
import { ChNavigationListRenderCustomEvent } from "../../../../components";
import { renderShowcaseProperties } from "../utils";
import { NavigationListHyperlinkClickEvent } from "../../../../components/navigation-list/types";

const state: Partial<HTMLChNavigationListRenderElement> = {};

// The current implementation of the showcase navigates when the hash of the
// URL changes
const preventNavigation = (
  event: ChNavigationListRenderCustomEvent<NavigationListHyperlinkClickEvent>
) => event.detail.event.preventDefault();

const render = () => (
  <div class="tab-test-main-wrapper">
    <ch-navigation-list-render
      class="navigation-list navigation-list-secondary"
      autoGrow={state.autoGrow}
      expandableButton={state.expandableButton}
      expandableButtonPosition={state.expandableButtonPosition}
      expanded={state.expanded}
      model={state.model}
      selectedLinkIndicator={state.selectedLinkIndicator}
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
            { caption: "Start", value: "start" },
            { caption: "End", value: "end" }
          ],
          value: "start"
        },
        {
          id: "selectedLinkIndicator",
          caption: "Selected Link Indicator",
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

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChNavigationListRenderElement>[] =
  [
    { name: "autoGrow", defaultValue: false, type: "boolean" },
    {
      name: "class",
      fixed: true,
      value: "navigation-list navigation-list-secondary",
      type: "string"
    },
    { name: "expandableButton", defaultValue: "decorative", type: "string" },
    { name: "expandableButtonPosition", defaultValue: "start", type: "string" },
    { name: "expanded", defaultValue: true, type: "boolean" },
    { name: "model", fixed: true, value: "controlUIModel", type: "function" },
    {
      name: "selectedLink",
      fixed: true,
      value: "selectedLink",
      type: "function"
    },
    { name: "selectedLinkIndicator", defaultValue: false, type: "boolean" },
    { name: "showCaptionOnCollapse", defaultValue: "inline", type: "string" },
    { name: "tooltipDelay", defaultValue: 100, type: "number" },
    {
      name: "buttonClick",
      fixed: true,
      value: "handleButtonClick",
      type: "event"
    },
    {
      name: "hyperlinkClick",
      fixed: true,
      value: "handleHyperlinkClick",
      type: "event"
    }
  ];

export const navigationListShowcaseStory: ShowcaseStory<HTMLChNavigationListRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "NavigationListModel",
      render: {
        react: () => `<ChNavigationListRender${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
      ></ChNavigationListRender>`,

        stencil: () => `<ch-navigation-list-render${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        ></ch-navigation-list-render>`
      }
    },
    render: render,
    state: state
  };

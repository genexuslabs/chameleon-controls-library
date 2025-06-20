import { h } from "@stencil/core";
import { kbExplorerModel } from "../tree-view/models";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";
import {
  GXWebModel,
  eagerLargeModel,
  simpleModel1,
  simpleModel2
} from "./models";

const state: Partial<HTMLChActionMenuRenderElement> = {};

const render = () => (
  <div class="dropdown-test-main-wrapper">
    <ch-action-menu-render
      class="dropdown dropdown-secondary"
      blockAlign={state.blockAlign}
      buttonAccessibleName={state.buttonAccessibleName}
      disabled={state.disabled}
      expanded={state.expanded}
      inlineAlign={state.inlineAlign}
      model={state.model}
      positionTry={state.positionTry}
    >
      Expand menu
      <ch-tree-view-render
        slot="tree"
        class="tree-view tree-view-secondary"
        model={kbExplorerModel}
        style={{ minBlockSize: "300px", minInlineSize: "300px" }}
      ></ch-tree-view-render>
    </ch-action-menu-render>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChActionMenuRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Simple model 1", value: simpleModel1 },
            { caption: "Simple model 2", value: simpleModel2 },
            { caption: "GX Web Model", value: GXWebModel },
            { caption: "Eager Large Tree (10x20x20)", value: eagerLargeModel }
          ],
          value: simpleModel1
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "buttonAccessibleName",
          caption: "Button Accessible Name",
          value: "Action",
          type: "string"
        },
        {
          id: "blockAlign",
          caption: "Block Align",
          value: "outside-end",
          type: "enum",
          values: [
            {
              value: "outside-start",
              caption: "outside-start"
            },
            {
              value: "inside-start",
              caption: "inside-start"
            },
            { value: "center", caption: "center" },
            {
              value: "inside-end",
              caption: "inside-end"
            },
            {
              value: "outside-end",
              caption: "outside-end"
            }
          ]
        },
        {
          id: "inlineAlign",
          caption: "Inline Align",
          value: "inside-start",
          type: "enum",
          values: [
            {
              value: "outside-start",
              caption: "outside-start"
            },
            {
              value: "inside-start",
              caption: "inside-start"
            },
            { value: "center", caption: "center" },
            {
              value: "inside-end",
              caption: "inside-end"
            },
            {
              value: "outside-end",
              caption: "outside-end"
            }
          ]
        },
        {
          id: "positionTry",
          caption: "Position Try",
          value: "none",
          type: "enum",
          values: [
            {
              value: "flip-block",
              caption: "flip-block"
            },
            {
              value: "flip-inline",
              caption: "flip-inline"
            },
            {
              value: "none",
              caption: "none"
            }
          ]
        },
        {
          id: "disabled",
          caption: "Disabled",
          value: false,
          type: "boolean"
        },
        {
          id: "expanded",
          caption: "Expanded",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChActionMenuRenderElement>[] =
  [
    { name: "buttonAccessibleName", defaultValue: undefined, type: "string" },
    { name: "blockAlign", defaultValue: "outside-end", type: "string" },
    { name: "class", fixed: true, value: "dropdown", type: "string" },
    { name: "inlineAlign", defaultValue: "center", type: "string" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "expanded", defaultValue: false, type: "boolean" },
    { name: "model", fixed: true, value: "controlUIModel", type: "string" },
    { name: "positionTry", defaultValue: "none", type: "string" },
    {
      name: "buttonClick",
      fixed: true,
      value: "handleButtonClick",
      type: "event"
    },
    {
      name: "expandedChange",
      fixed: true,
      value: "syncExpandedState",
      type: "event"
    },
    {
      name: "hyperlinkClick",
      fixed: true,
      value: "navigateInApp",
      type: "event"
    }
  ];

export const actionMenuShowcaseStory: ShowcaseStory<HTMLChActionMenuRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "ComboBoxModel",
      render: {
        react: () => `<ChActionMenuRender${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
      ></ChActionMenuRender>`,

        stencil: () => `<ch-action-menu-render${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        ></ch-action-menu-render>`
      }
    },
    render: render,
    state: state
  };

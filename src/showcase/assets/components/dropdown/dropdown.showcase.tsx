import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import {
  GXWebModel,
  eagerLargeModel,
  simpleModel1,
  simpleModel2
} from "./models";
import { kbExplorerModel } from "../tree-view/models";

const state: Partial<HTMLChDropdownRenderElement> = {};

const render = () => (
  <div class="dropdown-test-main-wrapper">
    <fieldset class="fieldset-test">
      <legend class="label field-legend-test">Primary</legend>

      <ch-dropdown-render
        class="dropdown dropdown-primary"
        blockAlign={state.blockAlign}
        buttonAccessibleName={state.buttonAccessibleName}
        disabled={state.disabled}
        inlineAlign={state.inlineAlign}
        model={state.model}
      >
        Action
        <div
          slot="tree"
          style={{ minBlockSize: "300px", minInlineSize: "300px" }}
        >
          <ch-tree-view-render
            class="tree-view tree-view-secondary"
            model={kbExplorerModel}
          ></ch-tree-view-render>
        </div>
      </ch-dropdown-render>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="label field-legend-test">Secondary</legend>

      <ch-dropdown-render
        class="dropdown dropdown-secondary"
        blockAlign={state.blockAlign}
        buttonAccessibleName={state.buttonAccessibleName}
        disabled={state.disabled}
        inlineAlign={state.inlineAlign}
        model={state.model}
      >
        John Doe
        <div slot="tree" style={{ minBlockSize: "300px" }}>
          <ch-tree-view-render
            class="tree-view tree-view-secondary"
            model={kbExplorerModel}
          ></ch-tree-view-render>
        </div>
      </ch-dropdown-render>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChDropdownRenderElement> =
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
          id: "inlineAlign",
          caption: "Inline Align",
          value: "center",
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
          id: "disabled",
          caption: "Disabled",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

export const dropdownShowcaseStory: ShowcaseStory<HTMLChDropdownRenderElement> =
  {
    properties: showcaseRenderProperties,
    render: render,
    state: state
  };

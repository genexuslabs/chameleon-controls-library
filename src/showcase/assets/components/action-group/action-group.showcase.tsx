import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { GXWebModel, eagerLargeModel, modelMinimal } from "./models";

const state: Partial<HTMLChActionGroupRenderElement> = {};

const render = () => (
  <div class="action-group-test-main-wrapper">
    <div class="fieldset-test">
      <legend class="label field-legend-test">Primary</legend>

      <ch-action-group-render
        cssClass="dropdown-primary"
        model={state.model}
        // moreActionsDropdownPosition={state.moreActionsDropdownPosition}
      ></ch-action-group-render>
    </div>

    <div class="fieldset-test">
      <legend class="label field-legend-test">Secondary</legend>

      <ch-action-group-render
        cssClass="dropdown-secondary"
        model={state.model}
        // moreActionsDropdownPosition={state.moreActionsDropdownPosition}
      ></ch-action-group-render>
    </div>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChActionGroupRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Simple model", value: modelMinimal },
            { caption: "GX Web Model", value: GXWebModel },
            { caption: "Eager Large Tree (10x20x20)", value: eagerLargeModel }
          ],
          value: modelMinimal
        }
      ]
    },
    {
      caption: "Properties",
      properties: []
    }
  ];

export const actionGroupShowcaseStory: ShowcaseStory<HTMLChActionGroupRenderElement> =
  {
    properties: showcaseRenderProperties,
    render: render,
    state: state
  };

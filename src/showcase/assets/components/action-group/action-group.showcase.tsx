import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { GXWebModel, eagerLargeModel, modelMinimal } from "./models";

const state: Partial<HTMLChActionGroupRenderElement> = {};

const render = () => (
  <div class="action-group-test-main-wrapper">
    <div class="fieldset-test">
      <legend class="form-input__label field-legend-test">Primary</legend>

      <ch-action-group-render
        cssClass="dropdown-primary"
        model={state.model}
        moreActionsDropdownPosition={state.moreActionsDropdownPosition}
      ></ch-action-group-render>
    </div>

    <div class="fieldset-test">
      <legend class="form-input__label field-legend-test">Secondary</legend>

      <ch-action-group-render
        cssClass="dropdown-secondary"
        model={state.model}
        moreActionsDropdownPosition={state.moreActionsDropdownPosition}
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
      properties: [
        {
          id: "moreActionsDropdownPosition",
          caption: "More Actions Dropdown Position",
          value: "Center_OutsideEnd",
          type: "enum",
          values: [
            {
              value: "OutsideStart_OutsideStart",
              caption: "OutsideStart_OutsideStart"
            },
            {
              value: "InsideStart_OutsideStart",
              caption: "InsideStart_OutsideStart"
            },
            { value: "Center_OutsideStart", caption: "Center_OutsideStart" },
            {
              value: "InsideEnd_OutsideStart",
              caption: "InsideEnd_OutsideStart"
            },
            {
              value: "OutsideEnd_OutsideStart",
              caption: "OutsideEnd_OutsideStart"
            },
            {
              value: "OutsideStart_InsideStart",
              caption: "OutsideStart_InsideStart"
            },
            {
              value: "OutsideEnd_InsideStart",
              caption: "OutsideEnd_InsideStart"
            },
            { value: "OutsideStart_Center", caption: "OutsideStart_Center" },
            { value: "OutsideEnd_Center", caption: "OutsideEnd_Center" },
            {
              value: "OutsideStart_InsideEnd",
              caption: "OutsideStart_InsideEnd"
            },
            { value: "OutsideEnd_InsideEnd", caption: "OutsideEnd_InsideEnd" },
            {
              value: "OutsideStart_OutsideEnd",
              caption: "OutsideStart_OutsideEnd"
            },
            {
              value: "InsideStart_OutsideEnd",
              caption: "InsideStart_OutsideEnd"
            },
            { value: "Center_OutsideEnd", caption: "Center_OutsideEnd" },
            { value: "InsideEnd_OutsideEnd", caption: "InsideEnd_OutsideEnd" },
            { value: "OutsideEnd_OutsideEnd", caption: "OutsideEnd_OutsideEnd" }
          ]
        }
      ]
    }
  ];

export const actionGroupShowcaseStory: ShowcaseStory<HTMLChActionGroupRenderElement> =
  {
    properties: showcaseRenderProperties,
    render: render,
    state: state
  };

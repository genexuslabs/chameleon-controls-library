import { h } from "@stencil/core";
import { ChDropdownRender } from "../../../../components/dropdown/dropdown-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../showcase/types";
import { Mutable } from "../../../../common/types";
import {
  GXWebModel,
  eagerLargeModel,
  simpleModel1,
  simpleModel2
} from "./models";

const state: Partial<Mutable<ChDropdownRender>> = {};

const render = () => (
  <div class="dropdown-test-main-wrapper">
    <fieldset>
      <legend class="form-input__label field-legend-test">Primary</legend>

      <ch-dropdown-render
        cssClass="dropdown-primary"
        buttonAccessibleName={state.buttonAccessibleName}
        position={state.position}
        model={state.model}
      >
        <div slot="action">Action</div>
      </ch-dropdown-render>
    </fieldset>

    <fieldset>
      <legend class="form-input__label field-legend-test">Secondary</legend>

      <ch-dropdown-render
        cssClass="dropdown-secondary"
        buttonAccessibleName={state.buttonAccessibleName}
        position={state.position}
        model={state.model}
      >
        <div slot="action">John Doe</div>
      </ch-dropdown-render>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChDropdownRender>
> = [
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
        id: "position",
        caption: "Position",
        value: "Center_OutsideEnd",
        type: "enum",
        values: [
          {
            value: "OutsideStart_OutsideStart",
            caption: "OutsideStart_OutsideStart"
          },
          { value: "Center_OutsideStart", caption: "Center_OutsideStart" },
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

export const dropdownShowcaseStory: ShowcaseStory<Mutable<ChDropdownRender>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};

import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseRenderProperty,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";
import {
  canvasSimple2Model,
  canvasSimple3Model,
  canvasSimpleModel
} from "./models";
import { CanvasPositionLimit } from "../../../../components";
import { CanvasGridSettingsDots } from "../../../../components/canvas/types";

const state: Partial<HTMLChCanvasElement> = {};

const render = () => (
  <ch-canvas
    class="canvas"
    contextPositionLimit={state.contextPositionLimit}
    drawGrid={state.drawGrid}
    gridSettings={state.gridSettings}
    model={state.model}
  ></ch-canvas>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChCanvasElement> =
  [
    {
      caption: "Model",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          value: canvasSimple3Model,
          values: [
            { caption: "Simple model", value: canvasSimpleModel },
            { caption: "Simple model 2", value: canvasSimple2Model },
            { caption: "Simple model 3", value: canvasSimple3Model }
          ]
        }
      ]
    },
    {
      caption: "Position",
      properties: [
        {
          id: "contextPositionLimit",
          caption: "Context Position Limit",
          type: "object",
          render: "independent-properties",
          properties: [
            {
              id: "scaleLowerBound",
              caption: "Scale Lower Bound",
              value: 0.1,
              type: "number"
            },
            {
              id: "scaleUpperBound",
              caption: "Scale Upper Bound",
              value: 5,
              type: "number"
            }
          ] satisfies ShowcaseRenderProperty<CanvasPositionLimit>[]
        }
      ]
    },
    {
      caption: "Grid",
      properties: [
        {
          id: "drawGrid",
          caption: "Draw Grid",
          type: "boolean",
          value: true
        },
        {
          id: "gridSettings",
          caption: "Options",
          type: "object",
          render: "independent-properties",
          properties: [
            {
              id: "type",
              caption: "Type",
              value: "mesh",
              values: [
                { caption: "Mesh", value: "mesh" },
                { caption: "Dots", value: "dots" }
              ],
              type: "enum"
            },
            {
              id: "color",
              caption: "Color",
              value: "#000", // rgb(199,199,199)
              type: "string"
            },
            // TODO: Does not work.
            // {
            //   id: "size",
            //   caption: "Size",
            //   value: 40,
            //   type: "number"
            // },
            {
              id: "dotSize",
              caption: "Dot Size",
              value: 2,
              type: "number"
            }
          ] satisfies ShowcaseRenderProperty<CanvasGridSettingsDots>[]
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChCanvasElement>[] =
  [];

export const canvasShowcaseStory: ShowcaseStory<HTMLChCanvasElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChCanvas${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChCanvas>`,

    stencil: () => `<ch-canvas${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-canvas>`
  },
  render: render,
  state: state
};

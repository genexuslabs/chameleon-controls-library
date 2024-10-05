import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";
import {
  canvasSimple2Model,
  canvasSimple3Model,
  canvasSimpleModel
} from "./models";

const state: Partial<HTMLChCanvasElement> = {};

const render = () => <ch-canvas class="canvas" model={state.model}></ch-canvas>;

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChCanvasElement> =
  [
    {
      caption: "Model",
      properties: [
        {
          id: "model",
          caption: "Model",
          type: "enum",
          value: canvasSimple3Model,
          values: [
            { caption: "Simple model", value: canvasSimpleModel },
            { caption: "Simple model 2", value: canvasSimple2Model },
            { caption: "Simple model 3", value: canvasSimple3Model }
          ]
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

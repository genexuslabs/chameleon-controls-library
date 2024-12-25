import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { basicModel1, model2 } from "./models";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChSegmentedControlRenderElement> = {};

const render = () => (
  <div class="segmented-control-test-main-wrapper">
    <ch-segmented-control-render
      model={state.model}
    ></ch-segmented-control-render>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChSegmentedControlRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Model 1", value: basicModel1 },
            { caption: "Model 2", value: model2 }
          ],
          value: basicModel1
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChSegmentedControlRenderElement>[] =
  [
    {
      name: "class",
      fixed: true,
      value: "segmented-control",
      type: "string"
    },

    { name: "model", fixed: true, value: "controlUIModel", type: "function" }
  ];

export const segmentedControlShowcaseStory: ShowcaseStory<HTMLChSegmentedControlRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "SegmentedControlModel",
      render: {
        react: () => `<ChSegmentedControlRender${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
      >
      </ChSegmentedControlRender>`,

        stencil: () => `<ch-segmented-control-render${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        >
        </ch-segmented-control-render>`
      }
    },
    render: render,
    state: state
  };

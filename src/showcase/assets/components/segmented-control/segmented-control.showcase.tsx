import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { basicModel1, model2 } from "./models";

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

export const segmentedControlShowcaseStory: ShowcaseStory<HTMLChSegmentedControlRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "SegmentedControlModel",
      render: () => `<ch-segmented-control-render
          class="segmented-control"
          model={this.#controlUIModel}
        >
        </ch-segmented-control-render>`
    },
    render: render,
    state: state
  };

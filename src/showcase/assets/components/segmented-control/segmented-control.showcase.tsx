import { h } from "@stencil/core";
import { ChSegmentedControl } from "../../../../components/segmented-control/segmented-control-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { basicModel1, model2 } from "./models";

const state: Partial<Mutable<ChSegmentedControl>> = {};

const render = () => (
  <div class="segmented-control-test-main-wrapper">
    <ch-segmented-control-render
      model={state.model}
    ></ch-segmented-control-render>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChSegmentedControl>
> = [
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

export const segmentedControlShowcaseStory: ShowcaseStory<
  Mutable<ChSegmentedControl>
> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModel: basicModel1,
    uiModelType: "SegmentedControlModel",
    render: `<ch-segmented-control-render
          class="segmented-control"
          model={this.#controlUIModel}
        >
        </ch-segmented-control-render>`
  },
  render: render,
  state: state
};

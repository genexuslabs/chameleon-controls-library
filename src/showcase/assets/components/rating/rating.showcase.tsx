import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChRatingElement> = {};

const render = () => (
  <ch-rating
    class="rating"
    accessibleName={state.accessibleName}
    disabled={state.disabled}
    value={state.value}
    stars={state.stars}
    step={state.step}
  ></ch-rating>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChRatingElement> =
  [
    {
      caption: "Model",
      properties: [
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: undefined,
          type: "string"
        },
        {
          id: "value",
          caption: "Value",
          value: 0,
          type: "number"
        },
        {
          id: "stars",
          caption: "Stars",
          value: 5,
          type: "number"
        },
        {
          id: "step",
          caption: "Step",
          value: 1,
          type: "number"
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

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChRatingElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "value", defaultValue: 0, type: "number" },
    { name: "stars", defaultValue: 5, type: "number" },
    { name: "step", defaultValue: 1, type: "number" }
  ];

export const ratingShowcaseStory: ShowcaseStory<HTMLChRatingElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChRating${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChRating>`,

    stencil: () => `<ch-rating${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-rating>`
  },
  render: render,
  state: state
};

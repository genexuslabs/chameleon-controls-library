import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChSliderElement> = {};

const render = () => (
  <div class="checkbox-test-main-wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">No label</legend>

      <ch-slider
        accessibleName={state.accessibleName}
        class="slider slider-primary"
        disabled={state.disabled}
        maxValue={state.maxValue}
        minValue={state.minValue}
        showValue={state.showValue}
        step={state.step}
        value={state.value}
      ></ch-slider>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>

      <label class="label" htmlFor="slider-2">
        Label for slider 2
      </label>
      <ch-slider
        id="slider-2"
        accessibleName={state.accessibleName}
        class="slider slider-primary"
        disabled={state.disabled}
        maxValue={state.maxValue}
        minValue={state.minValue}
        showValue={state.showValue}
        step={state.step}
        value={state.value}
      ></ch-slider>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>

      <label class="label" htmlFor="slider-3">
        Label for slider 3
        <ch-slider
          id="slider-3"
          accessibleName={state.accessibleName}
          class="slider slider-primary"
          disabled={state.disabled}
          maxValue={state.maxValue}
          minValue={state.minValue}
          showValue={state.showValue}
          step={state.step}
          value={state.value}
        ></ch-slider>
      </label>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChSliderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "value",
          caption: "Value",
          value: 2,
          type: "number"
        },
        {
          id: "maxValue",
          caption: "Max Value",
          value: 5,
          type: "number"
        },
        {
          id: "minValue",
          caption: "Min Value",
          value: 0,
          type: "number"
        },
        {
          id: "step",
          caption: "Step",
          value: 0.1,
          type: "number"
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: "Option",
          type: "string"
        },
        {
          id: "disabled",
          caption: "Disabled",
          value: false,
          type: "boolean"
        },
        {
          id: "showValue",
          caption: "Show Value (not supported yet)",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChSliderElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    {
      name: "class",
      fixed: true,
      value: "slider",
      type: "string"
    },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "maxValue", defaultValue: 5, type: "number" },
    { name: "minValue", defaultValue: 0, type: "number" },
    { name: "step", defaultValue: 1, type: "number" },
    { name: "value", defaultValue: 0, type: "number" },
    { name: "input", fixed: true, value: "handleInput", type: "event" }
  ];

export const sliderShowcaseStory: ShowcaseStory<HTMLChSliderElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChSlider${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChSlider>`,

    stencil: () => `<ch-slider${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-slider>`
  },
  render: render,
  state: state
};

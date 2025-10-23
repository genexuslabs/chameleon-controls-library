import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChColorPickerElement> = {};

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChColorPickerElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "value",
          caption: "Value",
          value: "#3070ca",
          type: "string",
          render: "input"
        },
        {
          id: "alphaSliderStep",
          caption: "alphaSliderStep",
          value: 1,
          type: "number",
          render: "input"
        },
        {
          id: "colorFieldStep",
          caption: "colorFieldStep",
          value: 1,
          type: "number",
          render: "input"
        },
        {
          id: "hueSliderStep",
          caption: "hueSliderStep",
          value: 1,
          type: "number",
          render: "input"
        },
        {
          id: "showColorFormatSelector",
          caption: "Show Color Format Selector",
          value: true,
          type: "boolean",
          render: "checkbox"
        },
        {
          id: "showColorPreview",
          caption: "Show Color Preview",
          value: true,
          type: "boolean",
          render: "checkbox"
        },
        {
          id: "showHueSlider",
          caption: "Show Hue Slider",
          value: true,
          type: "boolean",
          render: "checkbox"
        },
        {
          id: "showAlphaSlider",
          caption: "Show Alpha Slider",
          value: true,
          type: "boolean",
          render: "checkbox"
        },
        {
          id: "showColorPalette",
          caption: "Show Color Palette",
          value: true,
          type: "boolean",
          render: "checkbox"
        },
        {
          id: "disabled",
          caption: "Disabled",
          value: false,
          type: "boolean"
        },
        {
          id: "readonly",
          caption: "Readonly",
          value: false,
          type: "boolean"
        }
      ]
    },
    {
      caption: "Color Palette Array",
      properties: [
        {
          id: "colorPalette",
          caption: "Color Palette (comma separated)",
          value: "#ff0000, #00ff00, #0000ff, #ffff00, #ff00ff",
          type: "string",
          render: "input"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChColorPickerElement>[] =
  [
    { name: "alphaSliderStep", defaultValue: 1, type: "number" },
    { name: "colorFieldStep", defaultValue: 1, type: "number" },
    { name: "hueSliderStep", defaultValue: 1, type: "number" },
    { name: "showColorFormatSelector", defaultValue: false, type: "boolean" },
    { name: "showColorPreviewSelector", defaultValue: false, type: "boolean" },
    { name: "showHueSlider", defaultValue: false, type: "boolean" },
    { name: "showAlphaSlider", defaultValue: false, type: "boolean" },
    { name: "showColorPalette", defaultValue: false, type: "boolean" },
    { name: "value", defaultValue: "#3070ca", type: "string" },
    { name: "Disabled", defaultValue: false, type: "boolean" },
    { name: "Readonly", defaultValue: false, type: "boolean" }
  ];

const render = () => {
  const colorPaletteArray = state.colorPalette
    ? (state.colorPalette as unknown as string)
        .split(",")
        .map(color => color.trim())
        .filter(Boolean)
    : ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

  return (
    <ch-color-picker
      alphaSliderStep={state.alphaSliderStep}
      colorFieldStep={state.colorFieldStep}
      colorPalette={colorPaletteArray}
      disabled={state.disabled}
      readonly={state.readonly}
      hueSliderStep={state.hueSliderStep}
      showColorPreview={state.showColorPreview}
      showHueSlider={state.showHueSlider}
      showAlphaSlider={state.showAlphaSlider}
      showColorPalette={state.showColorPalette}
      showColorFormatSelector={state.showColorFormatSelector}
      value={state.value}
    ></ch-color-picker>
  );
};

export const colorPickerShowcaseStory: ShowcaseStory<HTMLChColorPickerElement> =
  {
    properties: showcaseRenderProperties,
    markupWithoutUIModel: {
      react: () =>
        `<ChColorPicker${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
/>`,

      stencil: () =>
        `<ch-color-picker${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
></ch-color-picker>`
    },
    render: render,
    state: state
  };

import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChColorFieldElement> = {};

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChColorFieldElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: undefined,
          type: "string"
        },
        {
          id: "baseColor",
          caption: "Base Color",
          value: "#FF0000", // Default value
          type: "string"
        },
        {
          id: "colorFormat",
          caption: "Color Format",
          value: "RGB", // Default value
          type: "string"
        },
        {
          id: "height",
          caption: "Height",
          value: 200, // Default value
          type: "number"
        },
        {
          id: "selectedColor",
          caption: "Selected Color",
          value: "#FF0000", // Default value
          type: "string"
        },
        {
          id: "width",
          caption: "Width",
          value: 300, // Default value
          type: "number"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChColorFieldElement>[] =
  [
    { name: "accessibleName", defaultValue: "Color Field", type: "string" },
    { name: "baseColor", defaultValue: "#FF0000", type: "string" },
    { name: "colorFormat", defaultValue: "RGB", type: "string" },
    { name: "height", defaultValue: 200, type: "number" },
    { name: "selectedColor", defaultValue: "#FF0000", type: "string" },
    { name: "width", defaultValue: 300, type: "number" }
  ];

const render = () => (
  <ch-color-field
    accessibleName={state.accessibleName}
    baseColor={state.baseColor}
    colorFormat={state.colorFormat}
    height={state.height}
    selectedColor={state.selectedColor}
    width={state.width}
  ></ch-color-field>
);

export const colorFieldShowcaseStory: ShowcaseStory<HTMLChColorFieldElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () =>
      `<ChColorField${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}></ChColorField>`,

    stencil: () =>
      `<ch-color-field${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}></ch-color-field>`
  },
  render: render,
  state: state
};

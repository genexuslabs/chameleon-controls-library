import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChQrElement> = {};

const render = () => (
  <ch-qr
    class="qr"
    accessibleName={state.accessibleName}
    background={state.background}
    errorCorrectionLevel={state.errorCorrectionLevel}
    fill={state.fill}
    radius={state.radius}
    value={state.value}
    size={state.size}
  ></ch-qr>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChQrElement> = [
  {
    caption: "Model",
    properties: [
      {
        id: "value",
        caption: "Value",
        value: "https://gx-chameleon.netlify.app",
        type: "string"
      },
      {
        id: "accessibleName",
        caption: "Accessible Name",
        value: undefined,
        type: "string"
      },
      {
        id: "errorCorrectionLevel",
        caption: "Error Correction Level",
        value: "High",
        values: [
          { caption: "Low (7%)", value: "Low" },
          { caption: "Medium (15%)", value: "Medium" },
          { caption: "Quartile (25%)", value: "Quartile" },
          { caption: "High (30%)", value: "High" }
        ],
        type: "enum"
      }
    ]
  },
  {
    caption: "Customization",
    properties: [
      {
        id: "background",
        caption: "Background",
        value: "white",
        type: "string"
      },
      {
        id: "fill",
        caption: "Fill",
        value: "black",
        type: "string"
      },
      {
        id: "radius",
        caption: "Radius",
        value: 0,
        type: "number"
      },
      {
        id: "size",
        caption: "Size",
        value: 128,
        type: "number"
      }
    ]
  }
];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChQrElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    { name: "background", defaultValue: "white", type: "string" },
    { name: "errorCorrectionLevel", defaultValue: "High", type: "string" },
    { name: "fill", defaultValue: "black", type: "string" },
    { name: "radius", defaultValue: 0, type: "number" },
    { name: "size", defaultValue: 128, type: "number" },
    { name: "value", defaultValue: undefined, type: "string" }
  ];

export const qrShowcaseStory: ShowcaseStory<HTMLChQrElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChQr${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChQr>`,

    stencil: () => `<ch-qr${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-qr>`
  },
  render: render,
  state: state
};

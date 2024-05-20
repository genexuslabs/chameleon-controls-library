import { h } from "@stencil/core";
import { ChQr } from "../../../../components/qr/qr";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";

const state: Partial<Mutable<ChQr>> = {};

const render = () => (
  <ch-qr
    class="qr"
    background={state.background}
    errorCorrectionLevel={state.errorCorrectionLevel}
    fill={state.fill}
    radius={state.radius}
    value={state.value}
    size={state.size}
  ></ch-qr>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChQr>> = [
  {
    caption: "Properties",
    properties: [
      {
        id: "value",
        caption: "Value",
        value: "",
        type: "string"
      },
      {
        id: "errorCorrectionLevel",
        caption: "Error Correction Level",
        value: "H",
        values: [
          { caption: "L", value: "L" },
          { caption: "M", value: "M" },
          { caption: "H", value: "H" },
          { caption: "Q", value: "Q" }
        ],
        type: "enum"
      },
      {
        id: "background",
        caption: "Background",
        value: "transparent",
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

export const qrShowcaseStory: ShowcaseStory<Mutable<ChQr>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};

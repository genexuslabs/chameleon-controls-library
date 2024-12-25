import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplateFrameWork,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  layout1,
  layout2,
  layout3,
  layout4,
  layout5,
  layout6,
  layout7,
  layout8
} from "./models";
import {
  insertSpacesAtTheBeginningExceptForTheFirstLine,
  renderShowcaseProperties,
  showcaseTemplateClassProperty
} from "../utils";

const state: Partial<HTMLChLayoutSplitterElement> = {};

const render = () => (
  <ch-layout-splitter model={state.model}>
    <div
      slot="start-component"
      class="components"
      style={{
        "background-color":
          "var(--colors-foundation__purple--10, var(--mer-color__neutral-gray--900))"
      }}
    >
      <label htmlFor="start">Start</label>
      <ch-edit id="start" class="input" type="text"></ch-edit>
    </div>
    <div
      slot="end-component"
      class="components"
      style={{
        "background-color":
          "var(--colors-foundation__orange--200, var(--mer-color__tinted-red--60))"
      }}
    >
      <label htmlFor="end">End</label>
      <ch-edit id="end" class="input" type="text"></ch-edit>
    </div>

    <div
      slot="end-end-component"
      class="components"
      style={{
        "background-color":
          "color-mix(in srgb, var(--icon__error),transparent 60%)"
      }}
    >
      <label htmlFor="end-end">End End</label>
      <ch-edit id="end-end" class="input" type="text"></ch-edit>
    </div>

    <div
      slot="center-2-component"
      class="components"
      style={{
        "background-color":
          "var(--accents__disabled, var(--mer-color__neutral-gray--700))"
      }}
    >
      <label htmlFor="center-2">Center 2</label>
      <ch-edit id="center-2" class="input" type="text"></ch-edit>
    </div>

    <div
      slot="center-component"
      class="components"
      style={{
        "background-color":
          "var(--alert-warning__background-color, var(--mer-color__neutral-gray--600))"
      }}
    >
      <label htmlFor="center">Center</label>
      <ch-edit id="center" class="input" type="text"></ch-edit>
    </div>
  </ch-layout-splitter>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChLayoutSplitterElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Layout 1", value: layout1 },
            { caption: "Layout 2", value: layout2 },
            { caption: "Layout 3", value: layout3 },
            { caption: "Layout 4", value: layout4 },
            { caption: "Layout 5", value: layout5 },
            { caption: "Layout 6", value: layout6 },
            { caption: "Layout 7", value: layout7 },
            { caption: "Layout 8", value: layout8 }
          ],
          value: layout7
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChLayoutSplitterElement>[] =
  [
    { name: "class", fixed: true, value: "layout-splitter", type: "string" },
    { name: "model", fixed: true, value: "controlUIModel", type: "function" }
  ];

const lightDOMMarkup = (
  framework: ShowcaseTemplateFrameWork
) => `<div slot="start-component">
  <label htmlFor="start">Start</label>
  <ch-edit id="start" ${showcaseTemplateClassProperty(
    framework,
    "input"
  )} type="text"></ch-edit>
</div>

<div slot="end-component">
  <label htmlFor="end">End</label>
  <ch-edit id="end" ${showcaseTemplateClassProperty(
    framework,
    "input"
  )} type="text"></ch-edit>
</div>

<div slot="end-end-component">
  <label htmlFor="end-end">End End</label>
  <ch-edit id="end-end" ${showcaseTemplateClassProperty(
    framework,
    "input"
  )} type="text"></ch-edit>
</div>

<div slot="center-2-component">
  <label htmlFor="center-2">Center 2</label>
  <ch-edit id="center-2" ${showcaseTemplateClassProperty(
    framework,
    "input"
  )} type="text"></ch-edit>
</div>

<div slot="center-component">
  <label htmlFor="center">Center</label>
  <ch-edit id="center" ${showcaseTemplateClassProperty(
    framework,
    "input"
  )} type="text"></ch-edit>
</div>`;

const lightDOMMarkupReact = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("react"),
  8
);

const lightDOMMarkupStencil = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("stencil"),
  10
);

export const layoutSplitterShowcaseStory: ShowcaseStory<HTMLChLayoutSplitterElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "LayoutSplitterModel",
      render: {
        react: () => `<ChLayoutSplitter${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
      >
        ${lightDOMMarkupReact}
      </ChLayoutSplitter>`,

        stencil: () => `<ch-layout-splitter${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        >
          ${lightDOMMarkupStencil}
        </ch-layout-splitter>`
      }
    },
    render: render,
    state: state
  };

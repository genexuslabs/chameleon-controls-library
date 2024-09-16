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
        "background-color": "var(--colors-foundation__purple--10)"
      }}
    >
      Start
      <input class="form-input" type="text" />
    </div>
    <div
      slot="end-component"
      class="components"
      style={{
        "background-color": "var(--colors-foundation__orange--200)"
      }}
    >
      End
      <input class="form-input" type="text" />
    </div>

    <div
      slot="end-end-component"
      class="components"
      style={{
        "background-color":
          "color-mix(in srgb, var(--icon__error),transparent 60%)"
      }}
    >
      End End
      <input class="form-input" type="text" />
    </div>

    <div
      slot="center-2-component"
      class="components"
      style={{ "background-color": "var(--accents__disabled)" }}
    >
      Center 2
      <input class="form-input" type="text" />
    </div>

    <div
      slot="center-component"
      class="components"
      style={{
        "background-color": "var(--alert-warning__background-color)"
      }}
    >
      Center
      <input class="form-input" type="text" />
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
          value: layout2
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
  Start
  <input ${showcaseTemplateClassProperty(
    framework,
    "form-input"
  )} type="text" />
</div>

<div slot="end-component">
  End
  <input ${showcaseTemplateClassProperty(
    framework,
    "form-input"
  )} type="text" />
</div>

<div slot="end-end-component">
  End End
  <input ${showcaseTemplateClassProperty(
    framework,
    "form-input"
  )} type="text" />
</div>

<div slot="center-2-component">
  Center 2
  <input ${showcaseTemplateClassProperty(
    framework,
    "form-input"
  )} type="text" />
</div>

<div slot="center-component">
  Center
  <input ${showcaseTemplateClassProperty(
    framework,
    "form-input"
  )} type="text" />
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

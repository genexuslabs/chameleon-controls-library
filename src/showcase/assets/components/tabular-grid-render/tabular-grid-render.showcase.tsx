import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplateFrameWork,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  insertSpacesAtTheBeginningExceptForTheFirstLine,
  renderShowcaseProperties
} from "../utils";
import {
  basicModel,
  groupModel,
  propertyGridModel,
  treeGridModel
} from "./models";

const state: Partial<HTMLChTabularGridRenderElement> = {};

const render = () => (
  <ch-tabular-grid-render model={state.model}></ch-tabular-grid-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChTabularGridRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Basic", value: basicModel },
            { caption: "Group", value: groupModel },
            { caption: "TreeGrid", value: treeGridModel },
            { caption: "PropertyGrid", value: propertyGridModel }
          ],
          value: basicModel
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChTabularGridRenderElement>[] =
  [{ name: "model", fixed: true, value: "controlUIModel", type: "function" }];

const lightDOMMarkup = (_framework: ShowcaseTemplateFrameWork) => ``;

const lightDOMMarkupReact = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("react"),
  8
);

const lightDOMMarkupStencil = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("stencil"),
  10
);

export const tabularGridRenderShowcaseStory: ShowcaseStory<HTMLChTabularGridRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "TabularGridModel",
      render: {
        react: () => `<ChTabularGridRender${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
        >
          ${lightDOMMarkupReact}
        </ChTabRender>`,

        stencil: () => `<ch-tabular-grid-render${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
          >
            ${lightDOMMarkupStencil}
          </ch-tab-render>`
      }
    },
    render: render,
    state: state
  };

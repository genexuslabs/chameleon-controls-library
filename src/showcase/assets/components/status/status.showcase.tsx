import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChStatusElement> = {};

const render = () => (
  <ch-status
    accessibleName={state.accessibleName}
    loadingRegionRef={state.loadingRegionRef}
  >
    <slot>Loading...</slot>
  </ch-status>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChStatusElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: undefined,
          type: "string"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChStatusElement>[] =
  [{ name: "accessibleName", defaultValue: undefined, type: "string" }];

export const statusShowcaseStory: ShowcaseStory<HTMLChStatusElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () =>
      `<ChStatus${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}></ChStatus>`,

    stencil: () =>
      `<ch-status${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}></ch-status>`
  },
  render: render,
  state: state
};

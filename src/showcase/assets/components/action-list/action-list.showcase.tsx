import { h } from "@stencil/core";
import { ChActionListRender } from "../../../../components/action-list/action-list-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import {
  GitHubChangesModel,
  GitHubHistoryModel,
  agentTickets,
  panelToolbox,
  recentKBs
} from "./models";

const state: Partial<Mutable<ChActionListRender>> = {};

const render = () => (
  <ch-action-list-render
    class="action-list-secondary"
    checkbox={state.checkbox}
    checked={state.checked}
    editableItems={state.editableItems}
    model={state.model}
  ></ch-action-list-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChActionListRender>
> = [
  {
    caption: "Models",
    properties: [
      {
        id: "model",
        accessibleName: "Model",
        type: "enum",
        values: [
          { caption: "GitHub History", value: GitHubHistoryModel },
          { caption: "GitHub History 2", value: GitHubChangesModel },
          { caption: "Agent Tickets", value: agentTickets },
          { caption: "Recent KBs", value: recentKBs },
          { caption: "Panel Toolbox", value: panelToolbox }
        ],
        value: GitHubHistoryModel
      }
    ]
  },
  {
    caption: "Properties",
    columns: 2,
    properties: [
      { id: "checkbox", caption: "Checkbox", value: false, type: "boolean" },
      { id: "checked", caption: "Checked", value: false, type: "boolean" },

      {
        id: "editableItems",
        caption: "Editable Items",
        value: true,
        type: "boolean"
      }
    ]
  }
  // {
  //   caption: "Filters",
  //   columns: 2,
  //   properties: [
  //     {
  //       id: "filterType",
  //       caption: "Filter Type",
  //       value: "none",
  //       type: "enum",
  //       values: [
  //         { caption: "None", value: "none" },
  //         { caption: "Caption", value: "caption" },
  //         { caption: "Metadata", value: "metadata" },
  //         { caption: "Checked", value: "checked" },
  //         { caption: "Unchecked", value: "unchecked" },
  //         { caption: "List", value: "list" }
  //       ]
  //     },
  //     {
  //       id: "filterDebounce",
  //       caption: "Filter Debounce",
  //       value: 250,
  //       type: "number"
  //     },
  //     {
  //       id: "filter",
  //       columnSpan: 2,
  //       caption: "Filter",
  //       value: "",
  //       type: "string"
  //     }
  //   ]
  // }
];

// Hide matches and show non-matches

export const actionListShowcaseStory: ShowcaseStory<
  Mutable<ChActionListRender>
> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};

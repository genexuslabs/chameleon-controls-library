import { h } from "@stencil/core";
import { ChActionListRender } from "../../../../components/action-list/action-list-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import {
  GitHubChangesModel,
  GitHubHistoryModel,
  GxEAINotifications,
  GxEAIRecentChats,
  agentTickets,
  keyboardNavigation,
  panelToolbox,
  recentKBs
} from "./models";

const state: Partial<Mutable<ChActionListRender>> = {};

const render = () => (
  <ch-action-list-render
    class="list-box-secondary list-box"
    checkbox={state.checkbox}
    checked={state.checked}
    selection={state.selection}
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
          { caption: "Panel Toolbox", value: panelToolbox },
          { caption: "GX EAI recent chats", value: GxEAIRecentChats },
          { caption: "GX EAI notifications", value: GxEAINotifications },
          { caption: "Keyboard Navigation", value: keyboardNavigation }
        ],
        value: keyboardNavigation
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
      },
      {
        id: "selection",
        caption: "Selection",
        value: "disabled",
        columnSpan: 2,
        type: "enum",
        render: "radio-group",
        values: [
          {
            value: "disabled",
            caption: "Disabled"
          },
          {
            value: "multiple",
            caption: "multiple"
          },
          { value: "single", caption: "Single" }
        ]
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

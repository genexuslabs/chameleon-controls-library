import { h } from "@stencil/core";
import {
  ShowcaseRender,
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  chatCallbacks,
  longChatRecord,
  chatTranslations,
  codeFixerRecord
} from "./callbacks";
// import { mercuryChatMessageRender } from "./mercury-code-render";
import { renderShowcaseProperties } from "../utils";
import { dataTypeInGeneXus } from "../combo-box/models";

const state: Partial<HTMLChChatElement> = {};

const render: ShowcaseRender = designSystem => (
  <ch-chat
    autoScroll={state.autoScroll}
    callbacks={chatCallbacks}
    class="chat"
    generatingResponse={false}
    loadingState={state.loadingState}
    markdownTheme={
      designSystem === "unanimo"
        ? "unanimo/markdown-viewer"
        : "mercury/markdown-viewer"
    }
    newUserMessageAlignment={state.newUserMessageAlignment}
    newUserMessageScrollBehavior={state.newUserMessageScrollBehavior}
    // renderItem={
    //   designSystem === "unanimo"
    //     ? undefined
    //     : mercuryChatMessageRender("mercury/markdown-viewer")
    // }
    items={state.items}
    showAdditionalContent={state.showAdditionalContent}
    showSendInputAdditionalContentAfter={
      state.showSendInputAdditionalContentAfter
    }
    showSendInputAdditionalContentBefore={
      state.showSendInputAdditionalContentBefore
    }
    translations={chatTranslations}
  >
    <div slot="additional-content">
      Custom content that is rendered when the chat renders content
    </div>
    {state.showSendInputAdditionalContentBefore && (
      <button
        slot="send-input-additional-content-before"
        class="button-primary"
      >
        Action
      </button>
    )}

    {state.showSendInputAdditionalContentAfter && (
      <ch-combo-box-render
        slot="send-input-additional-content-after"
        accessibleName="Data Types"
        class="combo-box"
        model={dataTypeInGeneXus}
      ></ch-combo-box-render>
    )}
  </ch-chat>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChChatElement> = [
  {
    caption: "Items",
    properties: [
      {
        id: "items",
        accessibleName: "Items",
        values: [
          {
            caption: "GeneXus Enterprise AI Playground",
            value: longChatRecord
          },
          { caption: "Code Fixer", value: codeFixerRecord }
        ],
        value: codeFixerRecord,
        type: "enum"
      }
    ]
  },
  {
    caption: "Properties",
    properties: [
      {
        id: "loadingState",
        caption: "Loading State",
        values: [
          { caption: "initial", value: "initial" },
          { caption: "loading", value: "loading" },
          {
            caption: "more-data-to-fetch",
            value: "more-data-to-fetch"
          },
          { caption: "all-records-loaded", value: "all-records-loaded" }
        ],
        value: "all-records-loaded",
        type: "enum"
      },
      {
        id: "newUserMessageAlignment",
        caption: "New User Message Alignment",
        values: [
          { caption: "Start", value: "start" },
          { caption: "End", value: "end" }
        ],
        value: "start",
        render: "radio-group",
        type: "enum"
      },
      {
        id: "newUserMessageScrollBehavior",
        caption: "New User Message Scroll Behavior",
        values: [
          { caption: "Instant", value: "instant" },
          { caption: "Smooth", value: "smooth" }
        ],
        value: "instant",
        render: "radio-group",
        type: "enum"
      },
      {
        id: "autoScroll",
        caption: "Auto Scroll",
        values: [
          { caption: "Never", value: "never" },
          { caption: "At scroll end", value: "at-scroll-end" }
        ],
        value: "at-scroll-end",
        render: "radio-group",
        type: "enum"
      },
      {
        id: "showAdditionalContent",
        caption: "Show Additional Content",
        value: false,
        type: "boolean"
      },
      {
        id: "showSendInputAdditionalContentBefore",
        caption: "Show Send Input Additional Content Before",
        value: false,
        type: "boolean"
      },
      {
        id: "showSendInputAdditionalContentAfter",
        caption: "Show Send Input Additional Content After",
        value: false,
        type: "boolean"
      }
    ]
  }
];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChChatElement>[] =
  [
    { name: "class", fixed: true, value: "chat", type: "string" },
    {
      name: "newUserMessageAlignment",
      defaultValue: "end",
      type: "string"
    },
    {
      name: "newUserMessageScrollBehavior",
      defaultValue: "instant",
      type: "string"
    },
    {
      name: "autoScroll",
      defaultValue: "at-scroll-end",
      type: "string"
    },
    {
      name: "items",
      fixed: true,
      value: "controlUIModel",
      type: "function"
    },
    {
      name: "loadingState",
      defaultValue: "initial",
      type: "string"
    },
    {
      name: "showAdditionalContent",
      defaultValue: false,
      type: "boolean"
    },
    {
      name: "showSendInputAdditionalContent",
      defaultValue: false,
      type: "boolean"
    }
  ];

export const chatShowcaseStory: ShowcaseStory<HTMLChChatElement> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModelType: "ChatMessage[]",
    uiModel: () => state.items,
    render: {
      react: () => `<ChChat${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}
      >${
        state.showAdditionalContent
          ? '\n        <div slot="additional-content">Your content here...</div>\n      '
          : ""
      }${
        state.showSendInputAdditionalContentBefore
          ? '\n        <div slot="send-input-additional-content-before">Your content here...</div>\n      '
          : ""
      }${
        state.showSendInputAdditionalContentAfter
          ? '\n        <div slot="send-input-additional-content-after">Your content here...</div>\n      '
          : ""
      }</ChChat>`,

      stencil: () => `<ch-chat${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}
        >${
          state.showAdditionalContent
            ? '\n          <div slot="additional-content">Your content here...</div>\n        '
            : ""
        }${
        state.showSendInputAdditionalContentBefore
          ? '\n          <div slot="send-input-additional-content-before">Your content here...</div>\n        '
          : ""
      }${
        state.showSendInputAdditionalContentAfter
          ? '\n          <div slot="send-input-additional-content-after">Your content here...</div>\n        '
          : ""
      }</ch-chat>`
    }
  },
  render: render,
  state: state
};

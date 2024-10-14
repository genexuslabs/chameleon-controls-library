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
import { mercuryChatMessageRender } from "./mercury-code-render";
import { renderShowcaseProperties } from "../utils";
import { MimeTypes } from "../../../../common/mime-type/mime-types";

const state: Partial<HTMLChChatElement> = {};

const supportedMimeTypes: MimeTypes[] = [
  "application/javascript",
  "image/svg+xml",
  "image/png",
  "image/jpeg"
];

const render: ShowcaseRender = designSystem => (
  <ch-chat
    callbacks={chatCallbacks}
    class="chat"
    generatingResponse={false}
    loadingState="more-data-to-fetch"
    markdownTheme={
      designSystem === "unanimo"
        ? "unanimo/markdown-viewer"
        : "mercury/markdown-viewer"
    }
    renderItem={
      designSystem === "unanimo"
        ? undefined
        : mercuryChatMessageRender("mercury/markdown-viewer")
    }
    isMobile={false}
    items={state.items}
    supportedMimeTypes={supportedMimeTypes}
    translations={chatTranslations}
    upload={state.upload}
  ></ch-chat>
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
        value: longChatRecord,
        type: "enum"
      }
    ]
  },
  {
    caption: "Upload",
    properties: [
      {
        id: "upload",
        caption: "Upload",
        type: "boolean",
        value: false
      }
    ]
  }
  // {
  //   caption: "Properties",
  //   properties: [
  //     {
  //       id: "accessibleName",
  //       caption: "Accessible Name",
  //       value: undefined,
  //       type: "string"
  //     }
  //   ]
  // }
];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChChatElement>[] =
  [
    { name: "class", fixed: true, value: "chat", type: "string" },
    {
      name: "items",
      fixed: true,
      value: "controlUIModel",
      type: "function"
    },
    {
      name: "upload",
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
      ></ChChat>`,

      stencil: () => `<ch-chat${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}
        ></ch-chat>`
    }
  },
  render: render,
  state: state
};

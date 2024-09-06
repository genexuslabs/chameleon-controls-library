import { h } from "@stencil/core";
import {
  ShowcaseRender,
  ShowcaseRenderProperties,
  ShowcaseStory
} from "../types";
import {
  chatCallbacks,
  longChatRecord,
  chatTranslations,
  codeFixerRecord
} from "./callbacks";
import { mercuryChatMessageRender } from "./mercury-code-render";

const state: Partial<HTMLChChatElement> = {};

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
    translations={chatTranslations}
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

export const chatShowcaseStory: ShowcaseStory<HTMLChChatElement> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModelType: "ChatMessage[]",
    uiModel: () => state.items,
    render: () => `<ch-chat
    class="chat"
    items={this.#controlUIModel}
  ></ch-chat>`
  },
  render: render,
  state: state
};

import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";
import { chatCallbacks, longChatRecord, chatTranslations } from "./callbacks";

const render = () => (
  <ch-chat
    callbacks={chatCallbacks}
    class="chat"
    generatingResponse={false}
    loadingState="more-data-to-fetch"
    markdownTheme={undefined}
    isMobile={false}
    items={longChatRecord}
    translations={chatTranslations}
  ></ch-chat>
);

export const chatShowcaseStory: ShowcaseCustomStory = {
  render: render
};

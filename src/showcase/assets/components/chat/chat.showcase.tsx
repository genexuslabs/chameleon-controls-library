import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";
import { chatCallbacks, chatRecord, chatTranslations } from "./callbacks";

const render = () => (
  <ch-chat
    callbacks={chatCallbacks}
    class="chat"
    generatingResponse={false}
    loadingState="more-data-to-fetch"
    isMobile={false}
    record={chatRecord}
    translations={chatTranslations}
  ></ch-chat>
);

export const chatShowcaseStory: ShowcaseCustomStory = {
  render: render
};

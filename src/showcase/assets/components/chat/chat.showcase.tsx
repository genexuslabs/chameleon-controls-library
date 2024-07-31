import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";
import { chatCallbacks, chatTranslations } from "./callbacks";

const render = () => (
  <ch-chat
    callbacks={chatCallbacks}
    generatingResponse={false}
    initialLoad={false}
    isMobile={false}
    translations={chatTranslations}
  ></ch-chat>
);

export const chatShowcaseStory: ShowcaseCustomStory = {
  render: render
};

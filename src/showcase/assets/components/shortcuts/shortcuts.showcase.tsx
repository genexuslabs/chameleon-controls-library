import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";

const render = () => (
  <iframe src="/showcase/pages/shortcuts.html" frameborder="0"></iframe>
);

export const shortcutsShowcaseStory: ShowcaseCustomStory = {
  render: render
};

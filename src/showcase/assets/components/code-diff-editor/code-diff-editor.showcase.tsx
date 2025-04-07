import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";

const render = () => (
  <iframe src="/showcase/pages/code-diff-editor.html" frameborder="0"></iframe>
);

export const codeDiffEditorShowcaseStory: ShowcaseCustomStory = {
  render: render
};

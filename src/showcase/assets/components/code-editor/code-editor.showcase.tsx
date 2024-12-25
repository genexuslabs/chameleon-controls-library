import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";

const render = () => (
  <iframe src="/showcase/pages/code-editor.html" frameborder="0"></iframe>
);

export const codeEditorShowcaseStory: ShowcaseCustomStory = {
  render: render
};

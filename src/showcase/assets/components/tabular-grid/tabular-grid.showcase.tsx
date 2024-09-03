import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";

const render = () => (
  <iframe src="/showcase/pages/tabular-grid.html" frameborder="0"></iframe>
);

export const tabularGridShowcaseStory: ShowcaseCustomStory = {
  render: render
};

import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";

const render = () => (
  <iframe src="/showcase/pages/paginator.html" frameborder="0"></iframe>
);

export const paginatorShowcaseStory: ShowcaseCustomStory = {
  render: render
};

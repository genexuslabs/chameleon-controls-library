import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";

const render = (designSystem: "mercury" | "unanimo") => (
  <ch-test-flexible-layout
    designSystem={designSystem}
  ></ch-test-flexible-layout>
);

export const flexibleLayoutShowcaseStory: ShowcaseCustomStory = {
  render: render
};

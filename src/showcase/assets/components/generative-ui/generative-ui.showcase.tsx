import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "../types";
import { samples, updateModels } from "./models";

const render = () => (
  <ch-generative-ui
    samples={samples}
    updateModelsCallback={updateModels}
  ></ch-generative-ui>
);

export const generativeUIShowcaseStory: ShowcaseCustomStory = {
  render: render
};

import { h } from "@stencil/core";
import { ShowcaseCustomStory, ShowcaseRender } from "../types";
import { updateShowcase } from "../utils";
import { markdownReadmeModel } from "./models";

let initialMarkdown = markdownReadmeModel;

let textareaRef: HTMLTextAreaElement;

const handleValueChange = () => {
  initialMarkdown = textareaRef.value;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const render: ShowcaseRender = () => (
  <div class="markdown-test-main-wrapper">
    <div class="markdown-test-properties"></div>

    <textarea
      aria-label="Markdown content"
      class="input"
      value={initialMarkdown}
      onInput={handleValueChange}
      ref={el => (textareaRef = el)}
    ></textarea>
    <ch-math-viewer value={initialMarkdown}></ch-math-viewer>
  </div>
);

export const mathViewerShowcaseStory: ShowcaseCustomStory = {
  render: render
};

import { h } from "@stencil/core";
import { ShowcaseCustomStory, ShowcaseRender } from "../types";
import { updateShowcase } from "../utils";
import { markdownReadmeModel } from "./models";

let initialMarkdown = markdownReadmeModel;
let rawHTMLEnabled = "false";
let showIndicator = "false";

console.log(rawHTMLEnabled, showIndicator);

let checkboxRawHTMLRef: HTMLChCheckboxElement;
let checkboxIndicatorRef: HTMLChCheckboxElement;
let textareaRef: HTMLTextAreaElement;

const handleValueChange = () => {
  initialMarkdown = textareaRef.value;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const handleCheckboxValueChange = () => {
  rawHTMLEnabled = checkboxRawHTMLRef.value;
  showIndicator = checkboxIndicatorRef.value;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const render: ShowcaseRender = () => (
  <div class="markdown-test-main-wrapper">
    <div class="markdown-test-properties">
      <ch-checkbox
        caption="Raw HTML enabled"
        class="checkbox"
        checkedValue="true"
        onInput={handleCheckboxValueChange}
        ref={el => (checkboxRawHTMLRef = el)}
      ></ch-checkbox>

      <ch-checkbox
        caption="Show indicator"
        class="checkbox"
        checkedValue="true"
        onInput={handleCheckboxValueChange}
        ref={el => (checkboxIndicatorRef = el)}
      ></ch-checkbox>
    </div>

    <textarea
      aria-label="Markdown content"
      class="input"
      value={initialMarkdown}
      onInput={handleValueChange}
      ref={el => (textareaRef = el)}
    ></textarea>
    <ch-latex-viewer
      fontsBaseUrl="/assets/fonts/"
      value={initialMarkdown}
    ></ch-latex-viewer>
  </div>
);

export const latexViewerShowcaseStory: ShowcaseCustomStory = {
  render: render
};

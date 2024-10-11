import { forceUpdate, h } from "@stencil/core";
import { ShowcaseCustomStory, ShowcaseRender } from "../types";
import { markdownReadmeModel } from "./models";

let initialMarkdown = markdownReadmeModel;
let rawHTMLEnabled = "false";
let showIndicator = "false";

let checkboxRef: HTMLChCheckboxElement;
let textareaRef: HTMLTextAreaElement;

const handleValueChange = () => {
  initialMarkdown = textareaRef.value;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = textareaRef.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const handleCheckboxValueChange = () => {
  rawHTMLEnabled = checkboxRef.value;
  showIndicator = checkboxRef.value;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = checkboxRef.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const render: ShowcaseRender = designSystem => (
  <div class="markdown-test-main-wrapper">
    <div class="markdown-test-properties">
      <ch-checkbox
        caption="Raw HTML enabled"
        class="checkbox"
        checkedValue="true"
        onInput={handleCheckboxValueChange}
        ref={el => (checkboxRef = el)}
      ></ch-checkbox>

      <ch-checkbox
        caption="Show indicator"
        class="checkbox"
        checkedValue="true"
        onInput={handleCheckboxValueChange}
        ref={el => (checkboxRef = el)}
      ></ch-checkbox>
    </div>

    <textarea
      aria-label="Markdown content"
      class="form-input"
      value={initialMarkdown}
      onInput={handleValueChange}
      ref={el => (textareaRef = el)}
    ></textarea>
    <ch-markdown-viewer
      key={designSystem}
      class="markdown"
      theme={
        designSystem === "unanimo"
          ? "unanimo/markdown-viewer"
          : "mercury/markdown-viewer"
      }
      value={initialMarkdown}
      rawHtml={rawHTMLEnabled === "true"}
      showIndicator={showIndicator === "true"}
    ></ch-markdown-viewer>
  </div>
);

export const markdownShowcaseStory: ShowcaseCustomStory = {
  render: render
};

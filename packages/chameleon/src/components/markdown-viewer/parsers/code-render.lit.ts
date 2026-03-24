import { html } from "lit";
import { MarkdownViewerCodeRender } from "./types";

export const defaultCodeRender: MarkdownViewerCodeRender = options =>
  html`<ch-code
    .language=${options.language}
    .lastNestedChildClass=${options.lastNestedChildClass}
    .showIndicator=${options.showIndicator}
    .value=${options.plainText}
  ></ch-code>`;

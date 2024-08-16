import { h } from "@stencil/core";
import { MarkdownViewerCodeRender } from "./types";

export const defaultCodeRender: MarkdownViewerCodeRender = options => (
  <ch-code
    language={options.language}
    lastNestedChildClass={options.lastNestedChildClass}
    showIndicator={options.showIndicator}
    value={options.plainText}
  ></ch-code>
);

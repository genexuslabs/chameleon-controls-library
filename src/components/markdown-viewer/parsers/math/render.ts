import { html } from "lit";
import { MarkdownViewerExtensionRender } from "../types";
import { ExtendedContentMapping } from "./types";

export const render = {
  blockMath: element =>
    html`<ch-math-viewer
      display-mode="block"
      .value=${
        // The final replace is a WA because the parser doesn't remove the final backslash
        element.value
      }
    ></ch-math-viewer>`,

  inlineMath: element =>
    html`<ch-math-viewer
      display-mode="inline"
      .value=${
        // The final replace is a WA because the parser doesn't remove the final backslash
        element.value
      }
    ></ch-math-viewer>`
} as const satisfies MarkdownViewerExtensionRender<ExtendedContentMapping>;

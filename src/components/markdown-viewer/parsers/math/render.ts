import { html } from "lit";
import { MarkdownViewerExtensionRender } from "../types";
import { ExtendedContentMapping } from "./types";

export const render = {
  blockMath: element =>
    html`<ch-math-viewer
      .displayMode=${true}
      .value=${
        // The final replace is a WA because the parser doesn't remove the final backslash
        element.value.replace(/\\$/, "")
      }
    ></ch-math-viewer>`,

  inlineMath: element =>
    html`<ch-math-viewer
      .displayMode=${false}
      .value=${
        // The final replace is a WA because the parser doesn't remove the final backslash
        element.value.replace(/\\$/, "")
      }
    ></ch-math-viewer>`
} as const satisfies MarkdownViewerExtensionRender<ExtendedContentMapping>;

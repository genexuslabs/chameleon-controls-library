import { h } from "@stencil/core";
import { MarkdownCodeRender, MarkdownCodeRenderOptions } from "./types";

export const defaultCodeRender: MarkdownCodeRender = (
  options: MarkdownCodeRenderOptions
): any => (
  <pre part="pre">
    <code
      class={{
        [`hljs language-${options.language}`]: true,
        [options.lastNestedChildClass]: options.addLastNestedChildClassInHost
      }}
      part={`code language-${options.language}`}
    >
      {options.renderedContent}
    </code>
  </pre>
);

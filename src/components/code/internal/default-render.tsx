import { h } from "@stencil/core";
import { CodeRender, CodeRenderOptions } from "./types";

export const defaultCodeRender: CodeRender = (
  options: CodeRenderOptions
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

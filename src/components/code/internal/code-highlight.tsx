import { h } from "@stencil/core";
import { Element as HElement, Text as HText, Root as HRoot } from "hast";

import {
  getActualLanguageWithoutAlias,
  parseCodeToHAST,
  registerLanguage
} from "@genexus/markdown-parser/dist/parse-code.js";
import { MarkdownCodeRender, MarkdownCodeRenderOptions } from "./types";

type LastNestedChild = HRoot | HElement | undefined;

const checkIfIsLastNestedChild = (
  element: HElement,
  lastNestedChild: LastNestedChild
): boolean => element === lastNestedChild;

const codeToJSXDictionary = {
  element: (
    element: HElement,
    lastNestedChildClass: string,
    lastNestedChild: LastNestedChild
  ) => {
    const className = element.properties.className as string[];

    const addLastNestedChildClass = checkIfIsLastNestedChild(
      element,
      lastNestedChild
    );
    const highlightJSClasses = className ? className.join(" ") : undefined;

    return (
      <span
        class={{
          [highlightJSClasses]: !!highlightJSClasses,
          [lastNestedChildClass]: addLastNestedChildClass
        }}
      >
        {renderCodeChildren(element, lastNestedChildClass, lastNestedChild)}
      </span>
    );
  },

  text: (element: HText) => element.value
};

function renderCodeChildren(
  element: HRoot | HElement,
  lastNestedChildClass: string,
  lastNestedChild: LastNestedChild
) {
  return element.children.map(child =>
    codeToJSXDictionary[child.type](
      child,
      lastNestedChildClass,
      lastNestedChild
    )
  );
}

const findLastNestedChild = (elementWithChildren: HRoot | HElement) => {
  const lastChild = elementWithChildren.children.at(-1);

  // The last element have children. We must check its sub children
  if ((lastChild as HElement).children?.length > 0) {
    return findLastNestedChild(lastChild as HElement);
  }

  return elementWithChildren;
};

export const parseCodeToJSX = async (
  code: string,
  language: string,
  shouldFindLastNestedChild: boolean,
  lastNestedChildClass: string
): Promise<{ renderedCode: any; lastNestedChildIsRoot: boolean }> => {
  const actualLanguage = getActualLanguageWithoutAlias(language);

  // Register the language
  await registerLanguage(actualLanguage);

  const tree: HRoot = parseCodeToHAST(actualLanguage, code);

  // Find last nested child
  const lastNestedChild: LastNestedChild = shouldFindLastNestedChild
    ? findLastNestedChild(tree)
    : undefined;

  return {
    renderedCode: renderCodeChildren(
      tree,
      lastNestedChildClass,
      lastNestedChild
    ),
    lastNestedChildIsRoot: tree === lastNestedChild
  };
};

export const defaultCodeRender: MarkdownCodeRender = (
  options: MarkdownCodeRenderOptions
): any => (
  <pre>
    <code
      class={{
        [`hljs language-${options.language}`]: true,
        [options.lastNestedChildClass]: options.addLastNestedChildClassInHost
      }}
    >
      <div class="code-block__content">{options.renderedContent}</div>
    </code>
  </pre>
);

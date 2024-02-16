import { h } from "@stencil/core";
import { Element as HElement, Text as HText, Root as HRoot } from "hast";

import {
  getActualLanguageWithoutAlias,
  parseCodeToHAST,
  registerLanguage
} from "@genexus/markdown-parser/dist/parse-code.js";
import { MarkdownCodeRender } from "./types";
import { LAST_NESTED_CHILD_CLASS } from "./markdown-to-jsx";

let lastNestedChild: HRoot | HElement;

const checkAndGetLastNestedChildClass = (
  element: HElement
): string | undefined =>
  element === lastNestedChild ? LAST_NESTED_CHILD_CLASS : undefined;

const codeToJSXDictionary = {
  element: (element: HElement) => {
    const className = element.properties.className as string[];

    const lastNestedChildClass = checkAndGetLastNestedChildClass(element);
    const highlightJSClasses = className ? className.join(" ") : undefined;

    return (
      <span
        class={{
          [highlightJSClasses]: !!highlightJSClasses,
          [lastNestedChildClass]: !!lastNestedChildClass
        }}
      >
        {renderCodeChildren(element)}
      </span>
    );
  },

  text: (element: HText) => element.value
};

function renderCodeChildren(element: HElement) {
  return element.children.map(child => codeToJSXDictionary[child.type](child));
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
  renderCode: MarkdownCodeRender,
  isLastNestedChild: boolean
) => {
  const actualLanguage = getActualLanguageWithoutAlias(language || "txt");

  // Register the language
  await registerLanguage(actualLanguage);

  const tree: HRoot = parseCodeToHAST(actualLanguage, code);
  lastNestedChild = undefined; // Reset last nested child

  // Find last nested child
  if (isLastNestedChild) {
    lastNestedChild = findLastNestedChild(tree);
  }

  const nestedChildIsCodeTag = isLastNestedChild && tree === lastNestedChild;

  return renderCode(
    language,
    nestedChildIsCodeTag,
    tree.children.map(child => codeToJSXDictionary[child.type](child))
  );
};

export const defaultCodeRender: MarkdownCodeRender = (
  language,
  nestedChildIsCodeTag,
  content
): any => (
  <pre>
    <code
      class={{
        [`hljs language-${language}`]: true,
        [LAST_NESTED_CHILD_CLASS]: nestedChildIsCodeTag
      }}
    >
      {content}
    </code>
  </pre>
);

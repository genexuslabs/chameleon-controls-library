import type {
  Root as HRoot,
  RootContent as HRootContent,
  RootContentMap as HRootContentMap
} from "hast";
import { html, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { mapDefinedValues } from "../../../utilities/mapping/map-defined-values";

// type LastNestedChild = HRoot | HElement | undefined;

// const checkIfIsLastNestedChild = (
//   element: HElement,
//   lastNestedChild: LastNestedChild
// ): boolean => element === lastNestedChild;

// const codeToJSXDictionary = {
//   element: (
//     element: HElement,
//     lastNestedChildClass: string,
//     lastNestedChild: LastNestedChild
//   ) => {
//     const className = element.properties.className as string[];

//     const addLastNestedChildClass = checkIfIsLastNestedChild(
//       element,
//       lastNestedChild
//     );
//     const highlightJSClasses = className ? className.join(" ") : "";

//     return html`<span
//       class=${classMap({
//         [highlightJSClasses]: !!highlightJSClasses,
//         [lastNestedChildClass]: addLastNestedChildClass
//       })}
//     >
//       ${renderCodeChildren(element, lastNestedChildClass, lastNestedChild)}
//     </span>`;
//   },

//   text: (element: HText) => html`${element.value}`
// };

// function renderCodeChildren(
//   element: HRoot | HElement
//   // lastNestedChildClass: string,
//   // lastNestedChild: LastNestedChild
// ): (TemplateResult | undefined)[] {
//   return element.children.map(child =>
//     child.type !== "comment" && child.type !== "doctype"
//       ? codeToJSXDictionary[child.type](
//           child as never
//           // lastNestedChildClass,
//           // lastNestedChild
//         )
//       : undefined
//   );
// }

const hastElementToRenderDictionary = {
  comment: () => undefined,
  doctype: () => undefined,
  element: element => {
    const firstChildren = element.children[0];

    if (!firstChildren) {
      return undefined;
    }

    const renderedContent =
      element.children.length === 1 && element.children[0].type === "text"
        ? element.children[0].value
        : renderContent(element.children);

    return html`<span style=${ifDefined(element.properties.style ?? undefined)}
      >${renderedContent}</span
    >`;
  },

  text: element => element.value
} as const satisfies {
  [key in keyof HRootContentMap]: (
    element: HRootContentMap[key]
  ) => TemplateResult<1> | string | undefined | TemplateResult;
};

// type ValueOrArray<T> = T | T[];

function renderContent(
  children: HRootContent[]
):
  | (TemplateResult<1> | string | undefined | TemplateResult)[]
  | TemplateResult<1>
  | string
  | undefined
  | TemplateResult {
  return children.length === 1
    ? hastElementToRenderDictionary[children[0].type](children[0] as never)
    : mapDefinedValues(children, child =>
        hastElementToRenderDictionary[child.type](child as never)
      );
}

// const findLastNestedChild = (elementWithChildren: HRoot | HElement) => {
//   const lastChild = elementWithChildren.children.at(-1);

//   // The last element have children. We must check its sub children
//   if ((lastChild as HElement).children?.length > 0) {
//     return findLastNestedChild(lastChild as HElement);
//   }

//   return elementWithChildren;
// };

export const renderHast = (
  tree: HRoot
  // shouldFindLastNestedChild: boolean,
  // lastNestedChildClass: string
) => {
  const firstChild = tree.children[0];

  // Avoid <pre> tag
  if (firstChild && firstChild.type === "element") {
    const firstNestedChild = firstChild.children[0];

    // Avoid <code> tag
    if (firstNestedChild.type === "element") {
      return renderContent(firstNestedChild.children);
    }
  }

  return undefined;
};

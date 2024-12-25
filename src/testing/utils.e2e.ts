import { E2EPage } from "@stencil/core/testing";

export const delayTest = (value: number) =>
  new Promise(resolve => setTimeout(resolve, value));

/**
 *
 * @param elementToCheckSelector A CSS selector that contains the piercing separator ">>>" to cross shadow boundaries.
 * For example, "ch-edit >>> input"
 */
export const isActiveElement = async (
  page: E2EPage,
  elementToCheckSelector: string
) =>
  await page.evaluate(elementToCheckSelector => {
    const SEPARATE_BY_PIERCING = /\s*>>>\s*/;

    function focusComposedPath(): HTMLElement[] {
      const composedPath = [];
      let root: Document | ShadowRoot = document;

      while (root && root.activeElement) {
        composedPath.push(root.activeElement);
        root = root.activeElement.shadowRoot;
      }

      return composedPath.reverse();
    }

    const selectorDividedByShadowBoundaries =
      elementToCheckSelector.split(SEPARATE_BY_PIERCING);

    let elementToCheck = document.querySelector(
      selectorDividedByShadowBoundaries[0]
    );

    for (
      let index = 1;
      index < selectorDividedByShadowBoundaries.length;
      index++
    ) {
      const selector = selectorDividedByShadowBoundaries[index];
      elementToCheck = elementToCheck.shadowRoot.querySelector(selector);
    }

    const activeElement = focusComposedPath()[0];

    return activeElement === elementToCheck;
  }, elementToCheckSelector);

export const getTestDefaultDescription = (
  propName: string,
  propValue: any,
  propValueDesc: string
) =>
  `the "${propName}" property should be ${
    typeof propValue === "string" ? `"${propValueDesc}"` : propValueDesc
  } by default`;

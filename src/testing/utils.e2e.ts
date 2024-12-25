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

export const checkBorderBoxBoxSizing = (page: E2EPage) =>
  page.evaluate(() => {
    const allElements: string[] = [];
    const lightDOMElements = document.querySelectorAll("*");

    const getAllShadowDOMElements = (parent: HTMLElement) => {
      const elementBoxSizing = getComputedStyle(parent).boxSizing;
      const elementBeforeBoxSizing = getComputedStyle(
        parent,
        "::before"
      ).boxSizing;
      const elementAfterBoxSizing = getComputedStyle(
        parent,
        "::after"
      ).boxSizing;

      if (elementBoxSizing !== "border-box") {
        // eslint-disable-next-line no-console
        console.error(
          "The " +
            parent.tagName.toLowerCase() +
            " element does not have box-sizing: border-box"
        );
      }
      if (elementBeforeBoxSizing !== "border-box") {
        // eslint-disable-next-line no-console
        console.error(
          "The " +
            parent.tagName.toLowerCase() +
            "::before element does not have box-sizing: border-box"
        );
      }
      if (elementAfterBoxSizing !== "border-box") {
        // eslint-disable-next-line no-console
        console.error(
          "The " +
            parent.tagName.toLowerCase() +
            "::after element does not have box-sizing: border-box"
        );
      }

      allElements.push(elementBoxSizing);
      allElements.push(elementBeforeBoxSizing);
      allElements.push(elementAfterBoxSizing);

      if (parent.shadowRoot) {
        parent.shadowRoot
          .querySelectorAll("*")
          .forEach(getAllShadowDOMElements);
      }
    };

    lightDOMElements.forEach((lightDOMElement: HTMLElement) => {
      if (lightDOMElement.tagName.toLowerCase().startsWith("ch-")) {
        getAllShadowDOMElements(lightDOMElement);
      }
    });

    return allElements.every(boxSizing => boxSizing === "border-box");
  });

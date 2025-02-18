import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import type { JSX } from "../components";
import type { ChameleonControlsTagName } from "../common/types";

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

const getBasicTestDescription = (
  propertyName: string,
  propertyValue: string | undefined | null | number | boolean
) =>
  `the "${propertyName}" property should be ${
    typeof propertyValue === "string" ? `"${propertyValue}"` : propertyValue
  } by default`;

export const testDefaultProperties = <T extends ChameleonControlsTagName>(
  tag: T,
  properties: Required<{
    [key in keyof JSX.IntrinsicElements[T]]: JSX.IntrinsicElements[T][key];
  }>
) =>
  describe(`[${tag}][basic]`, () => {
    let page: E2EPage;
    let componentRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<${tag}></${tag}>`,
        failOnConsoleError: true
      });

      componentRef = await page.find(tag);
    });

    Object.keys(properties).forEach(propertyName =>
      it(
        getBasicTestDescription(propertyName, properties[propertyName]),
        async () =>
          expect(await componentRef.getProperty(propertyName)).toBe(
            properties[propertyName]
          )
      )
    );
  });

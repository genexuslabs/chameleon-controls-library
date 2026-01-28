import { html, unsafeStatic } from "lit/static-html.js";

import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type {
  ChameleonControls,
  ChameleonControlsTagName
} from "../typings/chameleon-components";
import { defineCustomElements } from "../utilities/bootstrap/define-custom-elements";
import { KasstorElement } from "../utilities/decorators/Component";

export const delayTest = (value: number) =>
  new Promise(resolve => setTimeout(resolve, value));

// // /**
// //  *
// //  * @param elementToCheckSelector A CSS selector that contains the piercing separator ">>>" to cross shadow boundaries.
// //  * For example, "ch-edit >>> input"
// //  */
// // export const isActiveElement = async (
// //   page: E2EPage,
// //   elementToCheckSelector: string
// // ) =>
// //   await page.evaluate(elementToCheckSelector => {
// //     const SEPARATE_BY_PIERCING = /\s*>>>\s*/;

// //     function focusComposedPath(): HTMLElement[] {
// //       const composedPath = [];
// //       let root: Document | ShadowRoot = document;

// //       while (root && root.activeElement) {
// //         composedPath.push(root.activeElement);
// //         root = root.activeElement.shadowRoot;
// //       }

// //       return composedPath.reverse();
// //     }

// //     const selectorDividedByShadowBoundaries =
// //       elementToCheckSelector.split(SEPARATE_BY_PIERCING);

// //     let elementToCheck = document.querySelector(
// //       selectorDividedByShadowBoundaries[0]
// //     );

// //     for (
// //       let index = 1;
// //       index < selectorDividedByShadowBoundaries.length;
// //       index++
// //     ) {
// //       const selector = selectorDividedByShadowBoundaries[index];
// //       elementToCheck = elementToCheck.shadowRoot.querySelector(selector);
// //     }

// //     const activeElement = focusComposedPath()[0];

// //     return activeElement === elementToCheck;
// //   }, elementToCheckSelector);

const getBasicTestDescription = (
  propertyName: string,
  propertyValue:
    | string
    | undefined
    | null
    | number
    | boolean
    | Record<string, unknown>
) =>
  `the "${propertyName}" property should be ${
    typeof propertyValue === "string"
      ? `"${propertyValue}"`
      : JSON.stringify(propertyValue)
  } by default`;

export const testDefaultProperties = <T extends ChameleonControlsTagName>(
  tag: T,
  properties: Omit<
    Required<{
      [key in keyof ChameleonControls[T]]: ChameleonControls[T][key];
    }>,
    | keyof KasstorElement
    // Omit event emitter and JSX renders. TODO: JSX renders should not be defined as default properties (see ch-chat example)
    | `on${string}`
    | "render"
    | "willUpdate"
    | "valueChanged"
    | "firstUpdated"
    | "updated"
  >
) =>
  describe(`[${tag}][interface defaults]`, () => {
    let componentRef: ChameleonControls[T];

    beforeEach(async () => {
      defineCustomElements();

      render(html`<${unsafeStatic(tag)}></${unsafeStatic(tag)}>`);

      // Wait for the element to be defined
      if (!customElements.get(tag)) {
        await customElements.whenDefined(tag);
      }

      componentRef = document.querySelector(tag)!;
      await componentRef.updateComplete;
    });

    Object.keys(properties).forEach(propertyName =>
      it(
        getBasicTestDescription(
          propertyName,
          properties[propertyName as never]
        ),
        () =>
          expect(
            componentRef[propertyName as keyof ChameleonControls[T]]
          ).toEqual(properties[propertyName as never])
      )
    );
  });

export const testDefaultCssProperties = (
  tag: ChameleonControlsTagName,
  properties: Record<string, string>
) =>
  describe(`[${tag}][basic]`, () => {
    beforeEach(() => {
      render(html`<${unsafeStatic(tag)}></${unsafeStatic(tag)}>`);
    });

    Object.keys(properties).forEach(propertyName =>
      it(`should have "${propertyName}: ${properties[propertyName]}" by default`, () =>
        expect(
          getComputedStyle(document.querySelector(tag)!).getPropertyValue(
            propertyName
          )
        ).toBe(properties[propertyName]))
    );
  });


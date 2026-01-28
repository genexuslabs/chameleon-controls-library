import { html, unsafeStatic } from "lit/static-html.js";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";
import type {
  ChameleonControls,
  ChameleonControlsTagName
} from "../../typings/chameleon-components";
import type { ArgumentTypes } from "../../typings/types";
import { disableAccessibilityReports } from "../../utilities/analysis/reports";
import { defineCustomElements } from "../../utilities/bootstrap/define-custom-elements";
import type { ComponentShadowRootOptions } from "../../utilities/decorators/Component/types";
import { testDefaultProperties } from "../utils.e2e";

import "../../components/navigation-list/internal/navigation-list-item/navigation-list-item.lit";
import "../../components/segmented-control/internal/segmented-control-item/segmented-control-item.lit";

disableAccessibilityReports();

/**
 * Basic test for validating default values of the interfaces.
 * We also validate that components have Shadow DOM, their config for the
 * shadow root and for the Component decorator.
 */
export const testBasicInterfaceChecks = <T extends ChameleonControlsTagName>(
  tag: T,
  properties: ArgumentTypes<typeof testDefaultProperties<T>>[1],
  options?: {
    shadow?: ComponentShadowRootOptions | false;
  }
) => {
  testDefaultProperties(tag, properties);

  describe(`[${tag}][shadow root settings]`, () => {
    let componentRef: ChameleonControls[T];
    const { shadow: shadowOptions } = options ?? {};

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

    if (shadowOptions === false) {
      it("should not have Shadow DOM", () =>
        expect(componentRef.shadowRoot).toBeNull());
    }
    // With Shadow DOM
    else {
      const { delegatesFocus, formAssociated, mode } = shadowOptions ?? {};

      it("should have Shadow DOM", () =>
        expect(componentRef.shadowRoot).toBeTruthy());

      it(`should have formAssociated === ${formAssociated}`, () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((componentRef.constructor as any).formAssociated).toBe(
          formAssociated
        ));

      it(`should have delegatesFocus === ${delegatesFocus ?? false}`, () =>
        expect(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (componentRef.constructor as any).shadowRootOptions.delegatesFocus
        ).toBe(delegatesFocus ?? false));

      it(`should have mode === ${mode ?? "open"}`, () =>
        expect(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (componentRef.constructor as any).shadowRootOptions.mode
        ).toBe(mode ?? "open"));
    }
  });
};


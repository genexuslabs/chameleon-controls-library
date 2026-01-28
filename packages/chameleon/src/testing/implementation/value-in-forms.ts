import { html, type TemplateResult } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import { nothing } from "lit";
import type { ChameleonControls } from "../../typings/chameleon-components";

import "../../components/checkbox/checkbox.lit";
import "../../components/progress/progress.lit";
import "../../components/radio-group/radio-group-render.lit";
import "../../components/slider/slider.lit";

const FORM_ENTRY = "component";

export type ComponentsWithValueProperty = Exclude<
  {
    [K in keyof ChameleonControls]: ChameleonControls[K] extends {
      value: unknown;
    }
      ? K
      : never;
  }[keyof ChameleonControls],
  "ch-qr"
>;

const templateByComponentMapping = {
  "ch-checkbox": (addName, disabled, value) =>
    html`<form>
      <ch-checkbox
        name="${addName ? FORM_ENTRY : nothing}"
        .disabled=${disabled}
        .value=${value}
      ></ch-checkbox>
    </form>`,

  "ch-progress": (addName, disabled, value) =>
    html`<form>
      <ch-progress
        name="${addName ? FORM_ENTRY : nothing}"
        .disabled=${disabled}
        .value=${value}
      ></ch-progress>
    </form>`,

  "ch-radio-group-render": (addName, disabled, value) =>
    html`<form>
      <ch-radio-group-render
        name="${addName ? FORM_ENTRY : nothing}"
        .disabled=${disabled}
        .value=${value}
      ></ch-radio-group-render>
    </form>`,

  "ch-slider": (addName, disabled, value) =>
    html`<form>
      <ch-slider
        name="${addName ? FORM_ENTRY : nothing}"
        .disabled=${disabled}
        .value=${value}
      ></ch-slider>
    </form>`
} satisfies {
  [key in ComponentsWithValueProperty]: (
    addName: boolean,
    disabled: boolean,
    value: ChameleonControls[key]["value"]
  ) => TemplateResult;
};

export const testValueInForms = <T extends ComponentsWithValueProperty>(
  tag: T,
  initialRenderValues: {
    initialInterfaceValue: ChameleonControls[T]["value"];
    initialExpectedValue: ChameleonControls[T]["value"];
    runtimeInterfaceValue: ChameleonControls[T]["value"];
    runtimeExpectedValue: ChameleonControls[T]["value"];
  }[],
  internalInputSelector: "input" | "textarea" | undefined
) => {
  const getValueInForm = (formRef: HTMLFormElement) =>
    Object.fromEntries(new FormData(formRef).entries())[FORM_ENTRY];

  const getInternalInputValue = (tagRef: ChameleonControls[T]) =>
    tagRef.shadowRoot!.querySelector(internalInputSelector!)!.value;

  const expectDefinedInForm = (
    formRef: HTMLFormElement,
    tagRef: ChameleonControls[T],
    interfaceValue: ChameleonControls[T]["value"],
    expectedValue: ChameleonControls[T]["value"]
  ) => {
    expect(tagRef.value).toBe(interfaceValue);
    expect(getValueInForm(formRef)).toBe(expectedValue?.toString());

    if (internalInputSelector) {
      expect(getInternalInputValue(tagRef)).toBe(expectedValue?.toString());
    }
  };

  const expectUndefinedInForm = (
    formRef: HTMLFormElement,
    tagRef: ChameleonControls[T],
    interfaceValue: ChameleonControls[T]["value"],
    expectedValue: ChameleonControls[T]["value"]
  ) => {
    expect(tagRef.value).toBe(interfaceValue);
    expect(getValueInForm(formRef)).toBeUndefined();

    if (internalInputSelector) {
      expect(getInternalInputValue(tagRef)).toBe(expectedValue?.toString());
    }
  };

  describe(`[${tag}][value in forms][initial render]`, () => {
    let formRef: HTMLFormElement;
    let tagRef: ChameleonControls[T];

    afterEach(cleanup);

    const renderTemplate = async <T extends ComponentsWithValueProperty>(
      addName: boolean,
      disabled: boolean,
      value: ChameleonControls[T]["value"]
    ) => {
      render(
        // TODO: The "value as never" should be typed correctly
        templateByComponentMapping[tag](addName, disabled, value as never)
      );

      formRef = document.querySelector("form")!;
      tagRef = document.querySelector(tag)!;
      await tagRef.updateComplete;
    };

    initialRenderValues.forEach(
      ({ initialInterfaceValue, initialExpectedValue }) => {
        it(`[with name attr][disabled = false] should set the value ${initialExpectedValue} in the form when using the value ${initialInterfaceValue} in the interface`, async () => {
          await renderTemplate(true, false, initialInterfaceValue);
          expectDefinedInForm(
            formRef,
            tagRef,
            initialInterfaceValue,
            initialExpectedValue
          );
        });

        it(`[with name attr][disabled = true] should not set any value in the form (because it's disabled), when using the value ${initialInterfaceValue} in the interface`, async () => {
          await renderTemplate(true, true, initialInterfaceValue);
          expectUndefinedInForm(
            formRef,
            tagRef,
            initialInterfaceValue,
            initialExpectedValue
          );
        });

        it(`[without name attr][disabled = false] should not set any value in the form (because it doesn't have name), when using the value ${initialInterfaceValue} in the interface`, async () => {
          await renderTemplate(false, false, initialInterfaceValue);
          expectUndefinedInForm(
            formRef,
            tagRef,
            initialInterfaceValue,
            initialExpectedValue
          );
        });

        it(`[without name attr][disabled = true] should not set any value in the form (because it doesn't have name and it's disabled), when using the value ${initialInterfaceValue} in the interface`, async () => {
          await renderTemplate(false, true, initialInterfaceValue);
          expectUndefinedInForm(
            formRef,
            tagRef,
            initialInterfaceValue,
            initialExpectedValue
          );
        });

        // The ch-progress does not implement the disabled property
        if (tag !== "ch-progress") {
          it(`[with name attr][disabled = false -> true] should not set any value in the form (because the disabled was changed to true), when using the value ${initialInterfaceValue} in the interface`, async () => {
            await renderTemplate(true, false, initialInterfaceValue);
            (
              tagRef as ChameleonControls[Exclude<typeof tag, "ch-progress">]
            ).disabled = true;
            await tagRef.updateComplete;

            expectUndefinedInForm(
              formRef,
              tagRef,
              initialInterfaceValue,
              initialExpectedValue
            );
          });

          it(`[with name attr][disabled = true -> false] should set the value ${initialExpectedValue} in the form (because the disabled was changed to false), when using the value ${initialInterfaceValue} in the interface`, async () => {
            await renderTemplate(true, false, initialInterfaceValue);
            (
              tagRef as ChameleonControls[Exclude<typeof tag, "ch-progress">]
            ).disabled = false;
            await tagRef.updateComplete;

            expectDefinedInForm(
              formRef,
              tagRef,
              initialInterfaceValue,
              initialExpectedValue
            );
          });
        }
      }
    );
  });

  describe(`[${tag}][value in forms][runtime update]`, () => {
    let formRef: HTMLFormElement;
    let tagRef: ChameleonControls[T];

    const renderTemplate = async <T extends ComponentsWithValueProperty>(
      addName: boolean,
      disabled: boolean,
      value: ChameleonControls[T]["value"]
    ) => {
      render(
        // TODO: The "value as never" should be typed correctly
        templateByComponentMapping[tag](addName, disabled, value as never)
      );

      formRef = document.querySelector("form")!;
      tagRef = document.querySelector(tag)!;
      await tagRef.updateComplete;
    };

    initialRenderValues.forEach(
      ({
        initialInterfaceValue,
        runtimeInterfaceValue,
        runtimeExpectedValue
      }) => {
        it(`[with name attr][disabled = false] should set the value ${runtimeExpectedValue} in the form when setting in runtime the value ${runtimeInterfaceValue} in the interface`, async () => {
          await renderTemplate(true, false, initialInterfaceValue);
          tagRef.value = runtimeInterfaceValue;
          await tagRef.updateComplete;
          expectDefinedInForm(
            formRef,
            tagRef,
            runtimeInterfaceValue,
            runtimeExpectedValue
          );
        });

        it(`[with name attr][disabled = true] should not set any value in the form (because it's disabled), when setting in runtime the value ${runtimeInterfaceValue} in the interface`, async () => {
          await renderTemplate(true, true, initialInterfaceValue);
          tagRef.value = runtimeInterfaceValue;
          await tagRef.updateComplete;
          expectUndefinedInForm(
            formRef,
            tagRef,
            runtimeInterfaceValue,
            runtimeExpectedValue
          );
        });

        it(`[without name attr][disabled = false] should not set any value in the form (because it doesn't have name), when setting in runtime the value ${runtimeInterfaceValue} in the interface`, async () => {
          await renderTemplate(false, false, initialInterfaceValue);
          tagRef.value = runtimeInterfaceValue;
          await tagRef.updateComplete;
          expectUndefinedInForm(
            formRef,
            tagRef,
            runtimeInterfaceValue,
            runtimeExpectedValue
          );
        });

        it(`[without name attr][disabled = true] should not set any value in the form (because it doesn't have name and it's disabled), when setting in runtime the value ${runtimeInterfaceValue} in the interface`, async () => {
          await renderTemplate(false, true, initialInterfaceValue);
          tagRef.value = runtimeInterfaceValue;
          await tagRef.updateComplete;
          expectUndefinedInForm(
            formRef,
            tagRef,
            runtimeInterfaceValue,
            runtimeExpectedValue
          );
        });

        // The ch-progress does not implement the disabled property
        if (tag !== "ch-progress") {
          it(`[with name attr][disabled = false -> true] should not set any value in the form (because the disabled was changed to true), when setting in runtime the value ${runtimeInterfaceValue} in the interface`, async () => {
            await renderTemplate(true, false, initialInterfaceValue);
            tagRef.value = runtimeInterfaceValue;
            (
              tagRef as ChameleonControls[Exclude<typeof tag, "ch-progress">]
            ).disabled = true;
            await tagRef.updateComplete;

            expectUndefinedInForm(
              formRef,
              tagRef,
              runtimeInterfaceValue,
              runtimeExpectedValue
            );
          });

          it(`[with name attr][disabled = true -> false] should set the value ${runtimeExpectedValue} in the form (because the disabled was changed to false), when setting in runtime the value ${runtimeInterfaceValue} in the interface`, async () => {
            await renderTemplate(true, false, initialInterfaceValue);
            (
              tagRef as ChameleonControls[Exclude<typeof tag, "ch-progress">]
            ).disabled = false;
            tagRef.value = runtimeInterfaceValue;

            await tagRef.updateComplete;

            expectDefinedInForm(
              formRef,
              tagRef,
              runtimeInterfaceValue,
              runtimeExpectedValue
            );
          });
        }
      }
    );
  });
};

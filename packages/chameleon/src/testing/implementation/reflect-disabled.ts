import { html, type TemplateResult } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import type { ChameleonPublicControls } from "../../typings/chameleon-components";

export type ComponentsWithDisabledProperty = {
  [K in keyof ChameleonPublicControls]: ChameleonPublicControls[K] extends {
    disabled: unknown;
  }
    ? K
    : never;
}[keyof ChameleonPublicControls];

const templateByComponentMapping = {
  "ch-radio-group-render": disabled =>
    html`<ch-radio-group-render
        class="component"
        .disabled=${disabled}
      ></ch-radio-group-render>
      <style>
        .component {
          background-color: rgb(0, 0, 255);
        }
        .component[disabled] {
          background-color: rgb(255, 0, 0);
        }
      </style>`,

  "ch-slider": disabled =>
    html`<ch-slider class="component" .disabled=${disabled}></ch-slider>
      <style>
        .component {
          background-color: rgb(0, 0, 255);
        }
        .component[disabled] {
          background-color: rgb(255, 0, 0);
        }
      </style>`
} satisfies {
  [key in ComponentsWithDisabledProperty]: (
    disabled: boolean | undefined | null
  ) => TemplateResult;
};

export const testDisabledReflect = <T extends ComponentsWithDisabledProperty>(
  tag: T,
  internalInputSelector: "input" | "textarea" | undefined
) => {
  const getInternalInputRef = (tagRef: ChameleonPublicControls[T]) =>
    tagRef.shadowRoot!.querySelector(internalInputSelector!)!;

  const expectNotDisabled = (tagRef: ChameleonPublicControls[T]) => {
    const { backgroundColor, pointerEvents } = getComputedStyle(tagRef);

    expect(tagRef.getAttribute("disabled")).toBeNull();
    expect(backgroundColor).toBe("rgb(0, 0, 255)");
    expect(pointerEvents).toBe("auto");

    if (internalInputSelector) {
      expect(getInternalInputRef(tagRef).disabled).toBe(false);
      expect(getInternalInputRef(tagRef).getAttribute("disabled")).toBeNull();
    }
  };

  const expectDisabled = (tagRef: ChameleonPublicControls[T]) => {
    const { backgroundColor, pointerEvents } = getComputedStyle(tagRef);

    expect(tagRef.getAttribute("disabled")).toBe("");
    expect(backgroundColor).toBe("rgb(255, 0, 0)");
    expect(pointerEvents).toBe("none");

    if (internalInputSelector) {
      expect(getInternalInputRef(tagRef).disabled).toBe(true);
      expect(getInternalInputRef(tagRef).getAttribute("disabled")).toBe("");
    }
  };

  describe(`[${tag}][reflect disabled][initial render]`, () => {
    let tagRef: ChameleonPublicControls[T];

    afterEach(cleanup);

    const renderTemplate = async (disabled: boolean | undefined | null) => {
      render(templateByComponentMapping[tag](disabled));

      tagRef = document.querySelector(tag)!;
      await tagRef.updateComplete;
    };

    it(`should not reflect the "disabled = undefined" property`, async () => {
      await renderTemplate(undefined);
      expectNotDisabled(tagRef);
    });

    it(`should not reflect the "disabled = null" property`, async () => {
      await renderTemplate(null);
      expectNotDisabled(tagRef);
    });

    it(`should not reflect the "disabled = false" property`, async () => {
      await renderTemplate(false);
      expectNotDisabled(tagRef);
    });

    it(`should reflect the "disabled = true" property`, async () => {
      await renderTemplate(true);
      expectDisabled(tagRef);
    });
  });

  describe(`[${tag}][reflect disabled][runtime update]`, () => {
    let tagRef: ChameleonPublicControls[T];

    afterEach(cleanup);

    const renderTemplate = async (disabled: boolean | undefined | null) => {
      render(templateByComponentMapping[tag](disabled));

      tagRef = document.querySelector(tag)!;
      await tagRef.updateComplete;
    };

    it(`should not reflect the "disabled = undefined" property when it is set at runtime (coming from "disabled = true")`, async () => {
      await renderTemplate(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tagRef as any).disabled = undefined;
      await tagRef.updateComplete;
      expectNotDisabled(tagRef);
    });

    it(`should not reflect the "disabled = null" property when it is set at runtime (coming from "disabled = true")`, async () => {
      await renderTemplate(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tagRef as any).disabled = null;
      await tagRef.updateComplete;
      expectNotDisabled(tagRef);
    });

    it(`should not reflect the "disabled = false" property when it is set at runtime (coming from "disabled = true")`, async () => {
      await renderTemplate(true);
      tagRef.disabled = false;
      await tagRef.updateComplete;
      expectNotDisabled(tagRef);
    });

    it(`should reflect the "disabled = true" property when it is set at runtime (coming from "disabled = undefined")`, async () => {
      await renderTemplate(undefined);
      tagRef.disabled = true;
      await tagRef.updateComplete;
      expectDisabled(tagRef);
    });

    it(`should reflect the "disabled = true" property when it is set at runtime (coming from "disabled = null")`, async () => {
      await renderTemplate(null);
      tagRef.disabled = true;
      await tagRef.updateComplete;
      expectDisabled(tagRef);
    });

    it(`should reflect the "disabled = true" property when it is set at runtime (coming from "disabled = false")`, async () => {
      await renderTemplate(false);
      tagRef.disabled = true;
      await tagRef.updateComplete;
      expectDisabled(tagRef);
    });

    it.todo(
      "should remove the internal disabled attribute when switching from true to false in the interface"
    );
  });
};

// describe("[ch-slider][disabled]", () => {
//   let formRef: HTMLFormElement;
//   let sliderRef: ChSlider;

//   beforeEach(async () => {
//     render(getTemplate(false));
//     sliderRef = document.querySelector("ch-slider")!;
//     formRef = document.querySelector("form")!;
//   });

//   // Utility as a WA since the "toHaveAttribute" function from puppeteer does
//   // not work properly
//   const checkValues = async (
//     value: number,
//     disabled: boolean | undefined | null
//   ) => {
//     expect(sliderRef.value).toBe(value);

//     const formData = Object.fromEntries(new FormData(formRef).entries());
//     const disabledSliderAttr = sliderRef.getAttribute("disabled");
//     const disabledInputAttr = sliderRef
//       .shadowRoot!.querySelector("input")!
//       .getAttribute("disabled");
//     const pointerEventsStyle = getComputedStyle(sliderRef).pointerEvents;

//     if (disabled) {
//       expect(disabledSliderAttr).toBe("");
//       expect(disabledInputAttr).toBe("");
//       expect(formData[FORM_ENTRY]).toBe(undefined);
//       expect(pointerEventsStyle).toBe("none");
//     } else {
//       expect(disabledSliderAttr).toBeNull();
//       expect(disabledInputAttr).toBeNull();
//       expect(formData[FORM_ENTRY]).toBe(value.toString()); // TODO: Should this be a string???
//       expect(pointerEventsStyle).toBe("auto");
//     }
//   };

//   it("should have disabled = false by default", async () => {
//     await checkValues(0, false);
//   });

//   // it('should not reflect the "disabled = undefined" property', async () => {
//   //   await sliderRef.setProperty("disabled", undefined);
//   //   await page.waitForChanges();
//   //   await checkValues(0, false);
//   // });

//   // it('should not reflect the "disabled = null" property', async () => {
//   //   await sliderRef.setProperty("disabled", null);
//   //   await page.waitForChanges();
//   //   await checkValues(0, false);
//   // });

//   // it('should reflect the "disabled = true" property to allow customizing the control when it\'s disabled', async () => {
//   //   await sliderRef.setProperty("disabled", true);
//   //   await page.waitForChanges();
//   //   await checkValues(0, true);
//   // });

//   // it('should reflect the "disabled = true" property if it\'s set by default with true', async () => {
//   //   await page.setContent(getTemplate(true));
//   //   await page.waitForChanges();
//   //   await checkValues(0, true);
//   // });

//   // it('should remove the "disabled" attr when switching from disabled = "true" to "false"', async () => {
//   //   await sliderRef.setProperty("disabled", true);
//   //   await page.waitForChanges();
//   //   await checkValues(0, true);

//   //   await sliderRef.setProperty("disabled", false);
//   //   await page.waitForChanges();
//   //   await checkValues(0, false);
//   // });

//   // it("should not submit the value if disabled", async () => {
//   //   await sliderRef.setProperty("disabled", true);
//   //   await sliderRef.setProperty("value", 4);
//   //   await page.waitForChanges();
//   //   await checkValues(4, true);
//   // });

//   // it('should submit the value when switching from disabled = "true" to "false"', async () => {
//   //   await sliderRef.setProperty("disabled", true);
//   //   await sliderRef.setProperty("value", 4);
//   //   await page.waitForChanges();
//   //   await checkValues(4, true);

//   //   await sliderRef.setProperty("disabled", false);
//   //   await page.waitForChanges();
//   //   await checkValues(4, false);

//   //   await sliderRef.setProperty("value", 2);
//   //   await page.waitForChanges();
//   //   await checkValues(2, false);

//   //   await sliderRef.setProperty("value", 0);
//   //   await page.waitForChanges();
//   //   await checkValues(0, false); // TODO: Check if the value should be undefined or not
//   // });

//   // it("should properly style the control when disabled and when it is not", async () => {
//   //   expect((await sliderRef.getComputedStyle()).backgroundColor).toBe(
//   //     "rgb(0, 0, 255)"
//   //   );

//   //   await sliderRef.setProperty("disabled", true);
//   //   await page.waitForChanges();
//   //   expect((await sliderRef.getComputedStyle()).backgroundColor).toBe(
//   //     "rgb(255, 0, 0)"
//   //   );

//   //   await sliderRef.setProperty("disabled", false);
//   //   await page.waitForChanges();
//   //   expect((await sliderRef.getComputedStyle()).backgroundColor).toBe(
//   //     "rgb(0, 0, 255)"
//   //   );
//   // });

//   it.todo("should not fire the input event if disabled");

//   it.todo("should not fire the change event if disabled");

//   it.todo("should not be focusable if disabled");
// });


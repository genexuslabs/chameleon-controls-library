import { html, nothing, type TemplateResult } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChameleonControls } from "../../typings/chameleon-components";

import "../../components/checkbox/checkbox.lit";
import "../../components/progress/progress.lit";
import "../../components/slider/slider.lit";

const COMPONENT_ID = "component";
const ACCESSIBLE_NAME = "accessible-name";
const LABEL_CAPTION = "label-caption";

const ACCESSIBLE_NAME_ARRAY = [undefined, ACCESSIBLE_NAME] as const;
const LABEL_TYPE_ARRAY = ["id-for", "parent"] as const;
const DISABLED_AND_READONLY_ARRAY = [
  [false, false],
  [false, true],
  [true, false],
  [true, true]
] as const;

export type ComponentsWithAccessibleNameAndValueProperty = Exclude<
  {
    [K in keyof ChameleonControls]: ChameleonControls[K] extends {
      accessibleName: string | undefined;
      value: unknown;
    }
      ? K
      : never;
  }[keyof ChameleonControls],
  // TODO: Should the ch-qr work in forms???
  "ch-qr"
>;

const templateByComponentMapping = {
  "ch-checkbox": (accessibleName, disabled, readonly) =>
    html`<ch-checkbox
      id=${COMPONENT_ID}
      .accessibleName=${accessibleName ?? nothing}
      .disabled=${disabled}
      .readonly=${readonly}
    ></ch-checkbox>`,

  // TODO: Don't run these tests using disabled or readonly
  "ch-progress": (accessibleName, disabled, readonly) =>
    html`<ch-progress
      id=${COMPONENT_ID}
      .accessibleName=${accessibleName ?? nothing}
      .disabled=${disabled}
      .readonly=${readonly}
    ></ch-progress>`,

  // TODO: Find the way to support label in the ch-radio-group-render
  // "ch-radio-group-render": (disabled, readonly) =>
  //   html`<form>
  //     <ch-radio-group-render
  //       name="${addName ? FORM_ENTRY : nothing}"
  //       .disabled=${disabled}
  //       .value=${value}
  //     ></ch-radio-group-render>
  //   </form>`,

  "ch-slider": (accessibleName, disabled, readonly) =>
    html`<ch-slider
      id=${COMPONENT_ID}
      .accessibleName=${accessibleName ?? nothing}
      .disabled=${disabled}
      .readonly=${readonly}
    ></ch-slider>`
} satisfies {
  [key in ComponentsWithAccessibleNameAndValueProperty]: (
    accessibleName: string | undefined,
    disabled: boolean,
    readonly: boolean
  ) => TemplateResult;
};

const labelRenderMapping = {
  "id-for": (labelCaption, child) =>
    html`<label for=${COMPONENT_ID}>${labelCaption}</label>${child}`,

  parent: (labelCaption, child) => html`<label>${labelCaption}${child}</label>`,

  none: (_, child) => child
} satisfies {
  [key in "id-for" | "parent" | "none"]: (
    labelCaption: string | undefined,
    child: TemplateResult
  ) => TemplateResult;
};

export const testAccessibleNameWithElementInternals = <
  T extends ComponentsWithAccessibleNameAndValueProperty
>(
  tag: T,
  internalInputSelector: "input" | "textarea" | undefined
) => {
  const getHostOrInternalInputAriaLabelAttr = (tagRef: ChameleonControls[T]) =>
    internalInputSelector
      ? tagRef
          .shadowRoot!.querySelector(internalInputSelector)!
          .getAttribute("aria-label")
      : tagRef.getAttribute("aria-label");

  const descriptionPrefix = (
    disabled: boolean,
    readonly: boolean,
    accessibleName: string | undefined
  ) =>
    `[disabled = ${disabled}][readonly = ${readonly}][accessibleName = ${accessibleName ? `"${accessibleName}"` : undefined}]`;

  describe(`[${tag}][accessibleName and label variants][initial render]`, () => {
    let tagRef: ChameleonControls[T];

    afterEach(cleanup);

    DISABLED_AND_READONLY_ARRAY.forEach(([disabled, readonly]) =>
      ACCESSIBLE_NAME_ARRAY.forEach(accessibleName => {
        const prefix = descriptionPrefix(disabled, readonly, accessibleName);

        const renderTemplate = async (
          accessibleName: string | undefined,
          label: "id-for" | "parent" | "none",
          labelCaption?: string
        ) => {
          render(
            labelRenderMapping[label](
              labelCaption,
              templateByComponentMapping[tag](
                accessibleName,
                disabled,
                readonly
              )
            )
          );

          tagRef = document.querySelector(tag)!;
          await tagRef.updateComplete;
        };

        if (accessibleName === undefined) {
          it(`${prefix}[label = "none"] should not have an aria-label`, async () => {
            await renderTemplate(accessibleName, "none");
            expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBeNull();
          });

          // Cases for "id-for" and "parent" labels
          LABEL_TYPE_ARRAY.forEach(labelType => {
            it(`${prefix}[label = "${labelType}"][labelCaption = ${undefined}] should not have an aria-label`, async () => {
              await renderTemplate(accessibleName, labelType, undefined);
              expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBeNull();
            });

            it(`${prefix}[label = "${labelType}"][labelCaption = "${LABEL_CAPTION}"] should set aria-label = "${LABEL_CAPTION}" since it has a visible label`, async () => {
              await renderTemplate(accessibleName, labelType, LABEL_CAPTION);
              expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBe(
                LABEL_CAPTION
              );
            });
          });
        }
        // With accessibleName
        else {
          it(`${prefix}[label = "none"] should set aria-label = "${accessibleName}" since it doesn't have a visible label`, async () => {
            await renderTemplate(accessibleName, "none");
            expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBe(
              accessibleName
            );
          });

          // Cases for "id-for" and "parent" labels
          LABEL_TYPE_ARRAY.forEach(labelType => {
            it(`${prefix}[label = "${labelType}"][labelCaption = ${undefined}] should set aria-label = "${accessibleName}" since the visible label doesn't have a caption`, async () => {
              await renderTemplate(accessibleName, labelType, undefined);
              expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBe(
                accessibleName
              );
            });

            it(`${prefix}[label = "${labelType}"][labelCaption = "${LABEL_CAPTION}"] should set aria-label = "${LABEL_CAPTION}" since it has a visible label and the visible label has priority over the accessibleName`, async () => {
              await renderTemplate(accessibleName, labelType, LABEL_CAPTION);
              expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBe(
                LABEL_CAPTION
              );
            });

            it(`${prefix}[label = "${labelType}"][labelCaption = "${ACCESSIBLE_NAME}"] should set aria-label = "${ACCESSIBLE_NAME}"`, async () => {
              await renderTemplate(accessibleName, labelType, ACCESSIBLE_NAME);
              expect(getHostOrInternalInputAriaLabelAttr(tagRef)).toBe(
                ACCESSIBLE_NAME
              );
            });
          });
        }
      })
    );
  });
};

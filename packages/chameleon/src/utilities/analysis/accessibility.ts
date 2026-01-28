/* eslint-disable no-console */
import { DEV_MODE } from "../../development-flags";
import type { ChameleonControlsTagName } from "../../typings/chameleon-components";
import {
  checkAccessibilityReports,
  defineChameleonReportsIfNecessary
} from "./reports";

// Side effect
if (DEV_MODE) {
  defineChameleonReportsIfNecessary();
}

// TODO: We should take into account the case where the label caption is
// downloaded lazy, because the label is translated but the component is
// rendered first to reduce the LCP. In that case, the label is empty, but
// after a couple of ms the caption is set

const howToSetALabel = (
  tag: ChameleonControlsTagName,
  actualLabel: boolean
) => `This is the third most common WCAG accessibility issue (https://webaim.org/projects/million/#wcag_div). Please bind this component with ${
  actualLabel ? "an actual label" : "a label"
} to solve this accessibility issue.

If the component has a visible label, do the following:
  <label for="unique-id">
    Label for the element
  </label>
  <${tag} id="unique-id"></${tag}>

If there is no visible label, do the following:
  <${tag} accessibleName="Label for the element"></${tag}>

Element that causes this issue:`;

export const externalLabelAndAccessibleNameIsSet = (
  tag: ChameleonControlsTagName,
  externalLabel: string,
  accessibleName: string
) =>
  `The label "${externalLabel}" is already used for the "${tag}" component, but also the accessibleName property is set with "${accessibleName}".
Only the visible label will be used for the element, so the accessibleName property binding can be removed.

Element that causes this issue:`;

export const noLabelsAreSet = (tag: ChameleonControlsTagName) =>
  `The "${tag}" component doesn't have a label set. ${howToSetALabel(
    tag,
    false
  )}`;

export const allLabelsAreEmpty = (tag: ChameleonControlsTagName) =>
  `All labels for the "${tag}" component are empty, so there is no real label for it. ${howToSetALabel(
    tag,
    true
  )}`;

export const analyzeLabelExistence = /* @__PURE__ */ <
  T extends ChameleonControlsTagName
>(
  elementRef: HTMLElementTagNameMap[T],
  tag: T,
  labels: NodeList | null,
  externalLabel: string | undefined,
  accessibleName: string | undefined
) => {
  if (!checkAccessibilityReports()) {
    return;
  }

  const actualAccessibleNameProperty =
    !accessibleName || accessibleName.trim() === ""
      ? undefined
      : accessibleName;

  if (
    externalLabel !== undefined &&
    actualAccessibleNameProperty !== undefined
  ) {
    return console.warn(
      externalLabelAndAccessibleNameIsSet(tag, externalLabel, accessibleName!),
      elementRef
    );
  }

  if ((!labels || labels.length === 0) && !accessibleName) {
    return console.warn(noLabelsAreSet(tag), elementRef);
  }

  if (
    actualAccessibleNameProperty === undefined &&
    externalLabel === undefined
  ) {
    console.warn(allLabelsAreEmpty(tag), elementRef);
  }
};

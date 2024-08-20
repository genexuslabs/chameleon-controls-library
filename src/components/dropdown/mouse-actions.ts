import { ChameleonControlsTagName } from "../../common/types";
import { DropdownItemModelExtended } from "./types";

const DROPDOWN_TAG_NAME = "ch-dropdown" satisfies ChameleonControlsTagName;

/**
 * @returns The model to update the expanded value or undefined if the click
 * was not performed on any valid item.
 */
export const getDropdownModelInEvent = (
  event: PointerEvent | MouseEvent
): DropdownItemModelExtended | undefined => {
  const composedPath = event.composedPath();
  const buttonIndex = composedPath.findIndex(
    el =>
      (el as HTMLElement).tagName &&
      (el as HTMLElement).tagName.toLowerCase() === "button"
  );

  if (buttonIndex === -1) {
    return undefined;
  }
  const shadowRoot = composedPath[buttonIndex + 1];

  if (
    !shadowRoot ||
    !(shadowRoot instanceof ShadowRoot) ||
    shadowRoot.host.tagName.toLowerCase() !== DROPDOWN_TAG_NAME
  ) {
    return undefined;
  }

  event.stopPropagation();
  return (shadowRoot.host as HTMLChDropdownElement).model;
};

import {
  DropdownInfoInEvent,
  DropdownItemActionableModel,
  DropdownItemModel
} from "../types";
import { ChameleonControlsTagName } from "../../../common/types";
import { focusComposedPath } from "../../common/helpers";

export const WINDOW_ID = "window";
export const DROPDOWN_RENDER_TAG_NAME =
  "ch-dropdown-render" satisfies ChameleonControlsTagName;

export const DROPDOWN_TAG_NAME =
  "ch-dropdown" satisfies ChameleonControlsTagName;

export const DROPDOWN_SLOT_TAG_NAME = "slot";

const FIRST_DROPDOWN = `:scope>${DROPDOWN_TAG_NAME}` as const;
const LAST_DROPDOWN = `:scope>${DROPDOWN_TAG_NAME}:last-of-type` as const;

export const dropdownItemIsActionable = (
  itemUIModel: DropdownItemModel
): itemUIModel is DropdownItemActionableModel =>
  !itemUIModel.type || itemUIModel.type === "actionable";

export const dropdownItemActionableIsExpandable = (
  itemUIModel: DropdownItemActionableModel
) => itemUIModel.items !== undefined;

export const dropdownItemIsHyperlink = (
  itemUIModel: DropdownItemActionableModel
) => !!itemUIModel.link?.url;

export const getShadowRootOfEvent = (
  event: KeyboardEvent | MouseEvent | PointerEvent
) => {
  const composedPath = event.composedPath();
  const buttonIndex = composedPath.findIndex(el => {
    const tagName = ((el as HTMLElement).tagName ?? "").toLowerCase();

    return tagName === "button" || tagName === "a";
  });

  // The click event was not provoked by a button
  if (buttonIndex === -1) {
    return undefined;
  }
  const shadowRoot = composedPath[buttonIndex + 1];

  return shadowRoot instanceof ShadowRoot ? shadowRoot : undefined;
};

/**
 * @returns The model to update the expanded value or undefined if the click
 * was not performed on any valid item.
 */
export const getDropdownInfoInEvent = (
  event: KeyboardEvent | MouseEvent | PointerEvent
): DropdownInfoInEvent | typeof DROPDOWN_RENDER_TAG_NAME | undefined => {
  const shadowRoot = getShadowRootOfEvent(event);
  if (!shadowRoot) {
    return undefined;
  }

  const parentTagName = shadowRoot.host.tagName.toLowerCase();

  // The button does not belong to a ch-dropdown or ch-dropdown-render element
  if (
    parentTagName !== DROPDOWN_TAG_NAME &&
    parentTagName !== DROPDOWN_RENDER_TAG_NAME
  ) {
    return undefined;
  }
  event.stopPropagation();

  return parentTagName === DROPDOWN_RENDER_TAG_NAME
    ? DROPDOWN_RENDER_TAG_NAME
    : {
        ref: shadowRoot.host as HTMLChDropdownElement,
        model: (shadowRoot.host as HTMLChDropdownElement).model
      };
};

export const focusFirstDropdownItem = (
  dropdown: HTMLChPopoverElement | HTMLChDropdownElement
) => (dropdown.querySelector(FIRST_DROPDOWN) as HTMLChDropdownElement)?.focus();

export const focusDropdownLastItem = (
  dropdown: HTMLChPopoverElement | HTMLChDropdownElement
) => (dropdown.querySelector(LAST_DROPDOWN) as HTMLChDropdownElement)?.focus();

const getSiblingType = (
  nextSibling: Element
): typeof DROPDOWN_TAG_NAME | typeof DROPDOWN_SLOT_TAG_NAME | undefined => {
  const tagName = (nextSibling as HTMLElement).tagName?.toLowerCase();

  if (tagName === DROPDOWN_TAG_NAME) {
    return DROPDOWN_TAG_NAME;
  }

  return tagName === DROPDOWN_SLOT_TAG_NAME
    ? DROPDOWN_SLOT_TAG_NAME
    : undefined;
};

const findPreviousSibling = (element: Element) =>
  element.previousElementSibling;
const findNextSibling = (element: Element) => element.nextElementSibling;

export const focusNextElement = (
  dropdownInfo: DropdownInfoInEvent,
  findMode: "previous" | "next"
) => {
  const findFunction =
    findMode === "previous" ? findPreviousSibling : findNextSibling;

  let nextSibling = findFunction(dropdownInfo.ref);

  while (nextSibling) {
    const siblingType = getSiblingType(nextSibling);

    // Keyboard navigation must be avoided if the next element is a slot
    if (siblingType === DROPDOWN_SLOT_TAG_NAME) {
      return;
    }

    if (
      siblingType === DROPDOWN_TAG_NAME &&
      !(nextSibling as HTMLChDropdownElement).disabled
    ) {
      return (nextSibling as HTMLChDropdownElement).focus();
    }

    nextSibling = findFunction(nextSibling);
  }
};

export const dropdownElementIsFocused = (dropdownRef: HTMLChDropdownElement) =>
  dropdownRef === focusComposedPath()[1];

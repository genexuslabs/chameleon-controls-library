import {
  DropdownItemActionable,
  DropdownItemModel,
  DropdownItemModelExtended
} from "../types";
import { ChameleonControlsTagName } from "../../../common/types";

export const WINDOW_ID = "window";
export const DROPDOWN_RENDER_TAG_NAME =
  "ch-dropdown-render" satisfies ChameleonControlsTagName;
const DROPDOWN_TAG_NAME = "ch-dropdown" satisfies ChameleonControlsTagName;

export const dropdownItemIsActionable = (
  itemUIModel: DropdownItemModel
): itemUIModel is DropdownItemActionable =>
  !itemUIModel.type || itemUIModel.type === "actionable";

export const dropdownItemActionableIsExpandable = (
  itemUIModel: DropdownItemActionable
) => itemUIModel.items !== undefined;

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
export const getDropdownModelInEvent = (
  event: MouseEvent | PointerEvent
): DropdownItemModelExtended | typeof DROPDOWN_RENDER_TAG_NAME | undefined => {
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
    : (shadowRoot.host as HTMLChDropdownElement).model;
};

// Keys
// type DropDownKeyDownEvents =
//   | typeof KEY_CODES.ARROW_UP
//   | typeof KEY_CODES.ARROW_RIGHT
//   | typeof KEY_CODES.ARROW_DOWN
//   | typeof KEY_CODES.ARROW_LEFT
//   | typeof KEY_CODES.HOME
//   | typeof KEY_CODES.END
//   | typeof KEY_CODES.ESCAPE;

// const DROPDOWN_TAG_NAME = "ch-dropdown";
// const FIRST_DROPDOWN = `:scope>${DROPDOWN_TAG_NAME}` as const;
// const LAST_DROPDOWN = `:scope>${DROPDOWN_TAG_NAME}:last-of-type` as const;

// const elementIsDropdown = (element: Element) =>
//   element?.tagName?.toLowerCase() === DROPDOWN_TAG_NAME;

// const getFocusedDropdown = (event: KeyboardEvent) =>
//   event.target as HTMLChDropdownElement;

// // First level
// const getDropdownFirstItem = (dropdown: HTMLChDropdownElement) =>
//   dropdown.querySelector(FIRST_DROPDOWN) as HTMLChDropdownElement;

// const getDropdownLastItem = (dropdown: HTMLChDropdownElement) =>
//   dropdown.querySelector(LAST_DROPDOWN) as HTMLChDropdownElement;

// // Sibling
// const getFirstSiblingItem = (sibling: HTMLChDropdownElement) =>
//   sibling.parentElement.querySelector(FIRST_DROPDOWN) as HTMLChDropdownElement;

// const getLastSiblingItem = (dropdown: HTMLChDropdownElement) =>
//   dropdown.parentElement.querySelector(LAST_DROPDOWN) as HTMLChDropdownElement;

// export const dropdownKeyEventsDictionary: {
//   [key in DropDownKeyDownEvents]: (event?: KeyboardEvent) => void;
// } = {
//   [KEY_CODES.ARROW_DOWN]: event => {
//     const focusedElement = getFocusedDropdown(event);
//     if (!elementIsDropdown(focusedElement)) {
//       return;
//     }
//     event.preventDefault(); // Prevent window's scroll

//     if (focusedElement.level === -1) {
//       getDropdownFirstItem(focusedElement).focusElement();
//       return;
//     }

//     // The focus was in a subitem. Focus the next subitem
//     let nextSiblingToFocus =
//       focusedElement.nextElementSibling as HTMLChDropdownElement;

//     if (!elementIsDropdown(nextSiblingToFocus)) {
//       nextSiblingToFocus = getFirstSiblingItem(focusedElement);
//     }
//     nextSiblingToFocus.focusElement();
//   },

//   [KEY_CODES.ARROW_UP]: event => {
//     const focusedElement = getFocusedDropdown(event);
//     if (!elementIsDropdown(focusedElement)) {
//       return;
//     }
//     event.preventDefault(); // Prevent window's scroll

//     if (focusedElement.level === -1) {
//       getDropdownLastItem(focusedElement).focusElement();
//       return;
//     }

//     // The focus was in a subitem. Focus the next subitem
//     let nextSiblingToFocus =
//       focusedElement.previousElementSibling as HTMLChDropdownElement;

//     if (!elementIsDropdown(nextSiblingToFocus)) {
//       nextSiblingToFocus = getLastSiblingItem(focusedElement);
//     }
//     nextSiblingToFocus.focusElement();
//   },

//   [KEY_CODES.ARROW_RIGHT]: async event => {
//     const focusedElement = getFocusedDropdown(event);
//     if (!elementIsDropdown(focusedElement)) {
//       return;
//     }
//     event.preventDefault(); // Prevent window's scroll

//     if (focusedElement.level === -1) {
//       return;
//     }

//     await focusedElement.expandDropdown();

//     // Wait until the dropdown content has been rendered
//     requestAnimationFrame(() => {
//       getDropdownFirstItem(focusedElement).focusElement();
//     });
//   },

//   [KEY_CODES.ARROW_LEFT]: async event => {
//     const focusedElement = getFocusedDropdown(event);
//     if (!elementIsDropdown(focusedElement)) {
//       return;
//     }
//     event.preventDefault(); // Prevent window's scroll

//     if (focusedElement.level === -1) {
//       return;
//     }

//     const parentDropdown =
//       focusedElement.parentElement as HTMLChDropdownElement;

//     await parentDropdown.collapseDropdown();
//     parentDropdown.focusElement();
//   },

//   [KEY_CODES.HOME]: event => {
//     const focusedElement = getFocusedDropdown(event);
//     if (!elementIsDropdown(focusedElement)) {
//       return;
//     }
//     event.preventDefault(); // Prevent window's scroll

//     getFirstSiblingItem(focusedElement).focusElement();
//   },

//   [KEY_CODES.END]: event => {
//     const focusedElement = getFocusedDropdown(event);
//     if (!elementIsDropdown(focusedElement)) {
//       return;
//     }
//     event.preventDefault(); // Prevent window's scroll

//     getLastSiblingItem(focusedElement).focusElement();
//   },

//   [KEY_CODES.ESCAPE]: () => {
//     // this.#closeDropdown();
//     // this.#returnFocusToButton();
//   }
// };

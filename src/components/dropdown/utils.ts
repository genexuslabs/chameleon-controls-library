import { KEY_CODES } from "../../common/reserverd-names";

// Keys
type DropDownKeyDownEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END
  | typeof KEY_CODES.ESCAPE;

const DROPDOWN_TAG_NAME = "ch-dropdown";
const FIRST_DROPDOWN = `:scope>${DROPDOWN_TAG_NAME}` as const;
const LAST_DROPDOWN = `:scope>${DROPDOWN_TAG_NAME}:last-of-type` as const;

const elementIsDropdown = (element: Element) =>
  element?.tagName?.toLowerCase() === DROPDOWN_TAG_NAME;

const getFocusedDropdown = (event: KeyboardEvent) =>
  event.target as HTMLChDropdownElement;

// First level
const getDropdownFirstItem = (dropdown: HTMLChDropdownElement) =>
  dropdown.querySelector(FIRST_DROPDOWN) as HTMLChDropdownElement;

const getDropdownLastItem = (dropdown: HTMLChDropdownElement) =>
  dropdown.querySelector(LAST_DROPDOWN) as HTMLChDropdownElement;

// Sibling
const getFirstSiblingItem = (sibling: HTMLChDropdownElement) =>
  sibling.parentElement.querySelector(FIRST_DROPDOWN) as HTMLChDropdownElement;

const getLastSiblingItem = (dropdown: HTMLChDropdownElement) =>
  dropdown.parentElement.querySelector(LAST_DROPDOWN) as HTMLChDropdownElement;

export const dropdownKeyEventsDictionary: {
  [key in DropDownKeyDownEvents]: (event?: KeyboardEvent) => void;
} = {
  [KEY_CODES.ARROW_DOWN]: event => {
    const focusedElement = getFocusedDropdown(event);
    if (!elementIsDropdown(focusedElement)) {
      return;
    }
    event.preventDefault(); // Prevent window's scroll

    if (focusedElement.level === -1) {
      getDropdownFirstItem(focusedElement).focusElement();
      return;
    }

    // The focus was in a subitem. Focus the next subitem
    let nextSiblingToFocus =
      focusedElement.nextElementSibling as HTMLChDropdownElement;

    if (!elementIsDropdown(nextSiblingToFocus)) {
      nextSiblingToFocus = getFirstSiblingItem(focusedElement);
    }
    nextSiblingToFocus.focusElement();
  },

  [KEY_CODES.ARROW_UP]: event => {
    const focusedElement = getFocusedDropdown(event);
    if (!elementIsDropdown(focusedElement)) {
      return;
    }
    event.preventDefault(); // Prevent window's scroll

    if (focusedElement.level === -1) {
      getDropdownLastItem(focusedElement).focusElement();
      return;
    }

    // The focus was in a subitem. Focus the next subitem
    let nextSiblingToFocus =
      focusedElement.previousElementSibling as HTMLChDropdownElement;

    if (!elementIsDropdown(nextSiblingToFocus)) {
      nextSiblingToFocus = getLastSiblingItem(focusedElement);
    }
    nextSiblingToFocus.focusElement();
  },

  [KEY_CODES.ARROW_RIGHT]: async event => {
    const focusedElement = getFocusedDropdown(event);
    if (!elementIsDropdown(focusedElement)) {
      return;
    }
    event.preventDefault(); // Prevent window's scroll

    if (focusedElement.level === -1) {
      return;
    }

    await focusedElement.expandDropdown();

    // Wait until the dropdown content has been rendered
    requestAnimationFrame(() => {
      getDropdownFirstItem(focusedElement).focusElement();
    });
  },

  [KEY_CODES.ARROW_LEFT]: async event => {
    const focusedElement = getFocusedDropdown(event);
    if (!elementIsDropdown(focusedElement)) {
      return;
    }
    event.preventDefault(); // Prevent window's scroll

    if (focusedElement.level === -1) {
      return;
    }

    const parentDropdown =
      focusedElement.parentElement as HTMLChDropdownElement;

    await parentDropdown.collapseDropdown();
    parentDropdown.focusElement();
  },

  [KEY_CODES.HOME]: event => {
    const focusedElement = getFocusedDropdown(event);
    if (!elementIsDropdown(focusedElement)) {
      return;
    }
    event.preventDefault(); // Prevent window's scroll

    getFirstSiblingItem(focusedElement).focusElement();
  },

  [KEY_CODES.END]: event => {
    const focusedElement = getFocusedDropdown(event);
    if (!elementIsDropdown(focusedElement)) {
      return;
    }
    event.preventDefault(); // Prevent window's scroll

    getLastSiblingItem(focusedElement).focusElement();
  },

  [KEY_CODES.ESCAPE]: () => {
    // this.#closeDropdown();
    // this.#returnFocusToButton();
  }
};

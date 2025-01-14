import { KEY_CODES } from "../../../common/reserved-names";
import { DropdownKeyboardActionResult } from "../types";
import {
  dropdownElementIsFocused,
  dropdownItemActionableIsExpandable,
  focusDropdownLastItem,
  focusFirstDropdownItem,
  getDropdownInfoInEvent,
  siblingIsDropdown
} from "./utils";

type DropDownKeyDownEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END;

export const dropdownKeyEventsDictionary: Record<
  DropDownKeyDownEvents,
  (
    event: KeyboardEvent,
    popoverRef: HTMLChPopoverElement
  ) => void | DropdownKeyboardActionResult
> = {
  [KEY_CODES.ARROW_UP]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (!dropdownInfo) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    if (dropdownInfo === "ch-dropdown-render") {
      return focusDropdownLastItem(popoverRef);
    }
    let previousSibling = dropdownInfo.ref.previousElementSibling;

    while (previousSibling) {
      if (siblingIsDropdown(previousSibling)) {
        return (previousSibling as HTMLChDropdownElement).focus();
      }

      previousSibling = previousSibling.previousElementSibling;
    }
  },

  [KEY_CODES.ARROW_DOWN]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (!dropdownInfo) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    if (dropdownInfo === "ch-dropdown-render") {
      return focusFirstDropdownItem(popoverRef);
    }
    let nextSibling = dropdownInfo.ref.nextElementSibling;

    while (nextSibling) {
      if (siblingIsDropdown(nextSibling)) {
        return (nextSibling as HTMLChDropdownElement).focus();
      }

      nextSibling = nextSibling.nextElementSibling;
    }
  },

  [KEY_CODES.ARROW_RIGHT]: event => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (
      !dropdownInfo ||
      dropdownInfo === "ch-dropdown-render" ||
      !dropdownItemActionableIsExpandable(dropdownInfo.model.item)
    ) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    if (dropdownInfo.model.item.expanded) {
      return focusFirstDropdownItem(dropdownInfo.ref);
    }

    dropdownInfo.model.focusFirstItemAfterExpand = true;

    return {
      newExpanded: true,
      model: dropdownInfo.model
    };
  },

  [KEY_CODES.ARROW_LEFT]: event => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (
      !dropdownInfo ||
      dropdownInfo === "ch-dropdown-render" ||
      !dropdownInfo.model.parentItem
    ) {
      return undefined;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    dropdownInfo.model.parentItem.focusAfterCollapse = true;

    return {
      newExpanded: false,
      model: dropdownInfo.model.parentItem
    };
  },

  [KEY_CODES.HOME]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (!dropdownInfo) {
      return;
    }

    if (dropdownInfo === "ch-dropdown-render") {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusFirstDropdownItem(popoverRef);
    }

    if (dropdownElementIsFocused(dropdownInfo.ref)) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusFirstDropdownItem(
        dropdownInfo.ref.parentElement as HTMLChDropdownElement
      );
    }
  },

  [KEY_CODES.END]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (!dropdownInfo) {
      return;
    }

    if (dropdownInfo === "ch-dropdown-render") {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusDropdownLastItem(popoverRef);
    }

    if (dropdownElementIsFocused(dropdownInfo.ref)) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusDropdownLastItem(
        dropdownInfo.ref.parentElement as HTMLChDropdownElement
      );
    }
  }
};

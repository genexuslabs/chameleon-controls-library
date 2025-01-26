import { KEY_CODES } from "../../../common/reserved-names";
import {
  DropdownItemActionableModel,
  DropdownKeyboardActionResult
} from "../types";
import { getDropdownItemMetadata } from "./parse-model";
import {
  dropdownElementIsFocused,
  dropdownItemActionableIsExpandable,
  focusDropdownLastItem,
  focusFirstDropdownItem,
  focusNextElement,
  getDropdownInfoInEvent
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

    if (dropdownInfo === undefined) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    return dropdownInfo === "ch-dropdown-render"
      ? focusDropdownLastItem(popoverRef)
      : focusNextElement(dropdownInfo, "previous");
  },

  [KEY_CODES.ARROW_DOWN]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (dropdownInfo === undefined) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    return dropdownInfo === "ch-dropdown-render"
      ? focusFirstDropdownItem(popoverRef)
      : focusNextElement(dropdownInfo, "next");
  },

  [KEY_CODES.ARROW_RIGHT]: event => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (
      dropdownInfo === undefined ||
      dropdownInfo === "ch-dropdown-render" ||
      !dropdownItemActionableIsExpandable(
        dropdownInfo.model as DropdownItemActionableModel
      )
    ) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    if (dropdownInfo.model.expanded) {
      return focusFirstDropdownItem(dropdownInfo.ref);
    }

    getDropdownItemMetadata(dropdownInfo.model).focusFirstItemAfterExpand =
      true;

    return {
      newExpanded: true,
      model: dropdownInfo.model
    };
  },

  [KEY_CODES.ARROW_LEFT]: event => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (dropdownInfo === undefined || dropdownInfo === "ch-dropdown-render") {
      return undefined;
    }
    const itemMetadata = getDropdownItemMetadata(dropdownInfo.model);

    if (!itemMetadata.parentItem) {
      return undefined;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    // Focus the parent after collapse
    getDropdownItemMetadata(itemMetadata.parentItem).focusAfterCollapse = true;

    return {
      newExpanded: false,
      model: itemMetadata.parentItem
    };
  },

  [KEY_CODES.HOME]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (dropdownInfo === undefined) {
      return;
    }

    if (dropdownInfo === "ch-dropdown-render") {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusFirstDropdownItem(popoverRef);
    }

    // TODO: Is this function necessary?
    if (dropdownElementIsFocused(dropdownInfo.ref)) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusFirstDropdownItem(
        dropdownInfo.ref.parentElement as HTMLChDropdownElement
      );
    }
  },

  [KEY_CODES.END]: (event, popoverRef) => {
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (dropdownInfo === undefined) {
      return;
    }

    if (dropdownInfo === "ch-dropdown-render") {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusDropdownLastItem(popoverRef);
    }

    // TODO: Is this function necessary?
    if (dropdownElementIsFocused(dropdownInfo.ref)) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusDropdownLastItem(
        dropdownInfo.ref.parentElement as HTMLChDropdownElement
      );
    }
  }
};
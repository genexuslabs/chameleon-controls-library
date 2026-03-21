import { KEY_CODES } from "../../../common/reserved-names";
import {
  ActionMenuItemActionableModel,
  ActionMenuKeyboardActionResult
} from "../types";
import { getActionMenuItemMetadata } from "./parse-model";
import {
  ACTION_MENU_RENDER_TAG_NAME,
  actionMenuElementIsFocused,
  actionMenuItemActionableIsExpandable,
  focusActionMenuLastItem,
  focusFirstActionMenuItem,
  focusNextElement,
  getActionMenuInfoInEvent
} from "./utils";

type ActionMenuKeyDownEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END;

export const actionMenuKeyEventsDictionary: Record<
  ActionMenuKeyDownEvents,
  (
    event: KeyboardEvent,
    popoverRef: HTMLChPopoverElement
  ) => void | ActionMenuKeyboardActionResult
> = {
  [KEY_CODES.ARROW_UP]: (event, popoverRef) => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (actionMenuInfo === undefined) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    return actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME
      ? focusActionMenuLastItem(popoverRef)
      : focusNextElement(actionMenuInfo, "previous");
  },

  [KEY_CODES.ARROW_DOWN]: (event, popoverRef) => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (actionMenuInfo === undefined) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    return actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME
      ? focusFirstActionMenuItem(popoverRef)
      : focusNextElement(actionMenuInfo, "next");
  },

  [KEY_CODES.ARROW_RIGHT]: event => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (
      actionMenuInfo === undefined ||
      actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME ||
      !actionMenuItemActionableIsExpandable(
        actionMenuInfo.model as ActionMenuItemActionableModel
      )
    ) {
      return;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    if (actionMenuInfo.model.expanded) {
      return focusFirstActionMenuItem(actionMenuInfo.ref);
    }

    getActionMenuItemMetadata(actionMenuInfo.model).focusFirstItemAfterExpand =
      true;

    return {
      newExpanded: true,
      model: actionMenuInfo.model
    };
  },

  [KEY_CODES.ARROW_LEFT]: event => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (
      actionMenuInfo === undefined ||
      actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME
    ) {
      return undefined;
    }
    const itemMetadata = getActionMenuItemMetadata(actionMenuInfo.model);

    if (!itemMetadata.parentItem) {
      return undefined;
    }
    event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this

    // Focus the parent after collapse
    getActionMenuItemMetadata(itemMetadata.parentItem).focusAfterCollapse =
      true;

    return {
      newExpanded: false,
      model: itemMetadata.parentItem
    };
  },

  [KEY_CODES.HOME]: (event, popoverRef) => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (actionMenuInfo === undefined) {
      return;
    }

    if (actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusFirstActionMenuItem(popoverRef);
    }

    // TODO: Is this function necessary?
    if (actionMenuElementIsFocused(actionMenuInfo.ref)) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusFirstActionMenuItem(
        actionMenuInfo.ref.parentElement as HTMLChActionMenuElement
      );
    }
  },

  [KEY_CODES.END]: (event, popoverRef) => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (actionMenuInfo === undefined) {
      return;
    }

    if (actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusActionMenuLastItem(popoverRef);
    }

    // TODO: Is this function necessary?
    if (actionMenuElementIsFocused(actionMenuInfo.ref)) {
      event.preventDefault(); // Prevent page scroll. TODO: Add a unit test for this
      return focusActionMenuLastItem(
        actionMenuInfo.ref.parentElement as HTMLChActionMenuElement
      );
    }
  }
};

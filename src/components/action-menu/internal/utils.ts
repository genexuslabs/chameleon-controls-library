import {
  ActionMenuInfoInEvent,
  ActionMenuItemActionableModel,
  ActionMenuItemModel
} from "../types";
import { ChameleonControlsTagName } from "../../../common/types";
import { focusComposedPath } from "../../common/helpers";

export const WINDOW_ID = "window";
export const ACTION_MENU_RENDER_TAG_NAME =
  "ch-action-menu-render" satisfies ChameleonControlsTagName;

export const ACTION_MENU_TAG_NAME =
  "ch-action-menu" satisfies ChameleonControlsTagName;

export const ACTION_MENU_SLOT_TAG_NAME = "slot";

const FIRST_ACTION_MENU = `:scope>${ACTION_MENU_TAG_NAME}` as const;
const LAST_ACTION_MENU = `:scope>${ACTION_MENU_TAG_NAME}:last-of-type` as const;

export const actionMenuItemIsActionable = (
  itemUIModel: ActionMenuItemModel
): itemUIModel is ActionMenuItemActionableModel =>
  !itemUIModel.type || itemUIModel.type === "actionable";

export const actionMenuItemActionableIsExpandable = (
  itemUIModel: ActionMenuItemActionableModel
) => itemUIModel.items !== undefined;

export const actionMenuItemIsHyperlink = (
  itemUIModel: ActionMenuItemActionableModel
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
export const getActionMenuInfoInEvent = (
  event: KeyboardEvent | MouseEvent | PointerEvent
): ActionMenuInfoInEvent | typeof ACTION_MENU_RENDER_TAG_NAME | undefined => {
  const shadowRoot = getShadowRootOfEvent(event);
  if (!shadowRoot) {
    return undefined;
  }

  const parentTagName = shadowRoot.host.tagName.toLowerCase();

  // The button does not belong to a ch-action-menu or ch-action-menu-render element
  if (
    parentTagName !== ACTION_MENU_TAG_NAME &&
    parentTagName !== ACTION_MENU_RENDER_TAG_NAME
  ) {
    return undefined;
  }
  event.stopPropagation();

  return parentTagName === ACTION_MENU_RENDER_TAG_NAME
    ? ACTION_MENU_RENDER_TAG_NAME
    : {
        ref: shadowRoot.host as HTMLChActionMenuElement,
        model: (shadowRoot.host as HTMLChActionMenuElement).model
      };
};

export const focusFirstActionMenuItem = (
  actionMenuRef: HTMLChPopoverElement | HTMLChActionMenuElement
) =>
  (
    actionMenuRef.querySelector(FIRST_ACTION_MENU) as HTMLChActionMenuElement
  )?.focus();

export const focusActionMenuLastItem = (
  actionMenuRef: HTMLChPopoverElement | HTMLChActionMenuElement
) =>
  (
    actionMenuRef.querySelector(LAST_ACTION_MENU) as HTMLChActionMenuElement
  )?.focus();

const getSiblingType = (
  nextSibling: Element
):
  | typeof ACTION_MENU_TAG_NAME
  | typeof ACTION_MENU_SLOT_TAG_NAME
  | undefined => {
  const tagName = (nextSibling as HTMLElement).tagName?.toLowerCase();

  if (tagName === ACTION_MENU_TAG_NAME) {
    return ACTION_MENU_TAG_NAME;
  }

  return tagName === ACTION_MENU_SLOT_TAG_NAME
    ? ACTION_MENU_SLOT_TAG_NAME
    : undefined;
};

const findPreviousSibling = (element: Element) =>
  element.previousElementSibling;
const findNextSibling = (element: Element) => element.nextElementSibling;

export const focusNextElement = (
  actionMenuInfo: ActionMenuInfoInEvent,
  findMode: "previous" | "next"
) => {
  const findFunction =
    findMode === "previous" ? findPreviousSibling : findNextSibling;

  let nextSibling = findFunction(actionMenuInfo.ref);

  while (nextSibling) {
    const siblingType = getSiblingType(nextSibling);

    // Keyboard navigation must be avoided if the next element is a slot
    if (siblingType === ACTION_MENU_SLOT_TAG_NAME) {
      return;
    }

    if (
      siblingType === ACTION_MENU_TAG_NAME &&
      !(nextSibling as HTMLChActionMenuElement).disabled
    ) {
      return (nextSibling as HTMLChActionMenuElement).focus();
    }

    nextSibling = findFunction(nextSibling);
  }
};

export const actionMenuElementIsFocused = (
  actionMenuRef: HTMLChActionMenuElement
) => actionMenuRef === focusComposedPath()[1];

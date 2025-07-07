import { GxImageMultiState, ImageRender, ItemLink } from "../../common/types";
import { ChPopoverAlign } from "../popover/types";

export type ActionMenuModel = ActionMenuItemModel[];

export type ActionMenuItemModel =
  | ActionMenuItemActionableModel
  // | DropdownItemGroup
  | ActionMenuItemSeparatorModel
  | ActionMenuItemSlotModel;

export type DropdownItemType =
  | ActionMenuItemTypeActionable
  // | DropdownItemTypeGroup
  | ActionMenuItemTypeSeparator
  | ActionMenuItemTypeSlot;

export type ActionMenuItemTypeActionable = "actionable";
// export type DropdownItemTypeGroup = "group";
export type ActionMenuItemTypeSeparator = "separator";
export type ActionMenuItemTypeSlot = "slot";

export type ActionMenuItemTypeMapping = {
  actionable: ActionMenuItemActionableModel;
  separator: ActionMenuItemSeparatorModel;
  slot: ActionMenuItemSlotModel;
};

export type ActionMenuItemActionableModel = {
  id?: string;
  caption: string;
  disabled?: boolean;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;

  // TODO: Test using different expanded values on the initial load
  expanded?: boolean;

  items?: ActionMenuModel;
  itemsBlockAlign?: ChPopoverAlign;
  itemsInlineAlign?: ChPopoverAlign;
  link?: ItemLink;
  parts?: string;

  /**
   * Specifies an alternative position to try when the popover overflows the
   * window.
   *
   * By default, this property takes to value of the `ch-action-menu-render`,
   * which by default is `"none"`
   */
  positionTry?: "flip-block" | "flip-inline" | "none";

  shortcut?: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  type?: ActionMenuItemTypeActionable;
};

export type ActionMenuItemSeparatorModel = {
  id?: string;
  parts?: string;
  type: ActionMenuItemTypeSeparator;
};

export type ActionMenuItemSlotModel = {
  id: string;
  type: ActionMenuItemTypeSlot;
};

export type ActionMenuExpandedChangeEvent = {
  item: ActionMenuItemActionableModel;
  expanded: boolean;
};

export type ActionMenuHyperlinkClickEvent = {
  event: PointerEvent;
  item: ActionMenuItemActionableModel;
};

export type ActionMenuImagePathCallback = (
  item: ActionMenuItemActionableModel,
  iconDirection: "start" | "end"
) => GxImageMultiState | undefined;

// - - - - - - - - - - - - - - - - - - - -
//             Internal types
// - - - - - - - - - - - - - - - - - - - -
export type ActionMenuItemModelMetadata = {
  parentItem: ActionMenuItemActionableModel | undefined;
  focusFirstItemAfterExpand?: boolean;
  focusAfterCollapse?: boolean;
};

export type ActionMenuInfoInEvent = {
  model: ActionMenuItemActionableModel;
  ref: HTMLChActionMenuElement;
};

export type ActionMenuKeyboardActionResult = {
  newExpanded: boolean;
  model: ActionMenuItemActionableModel;
};

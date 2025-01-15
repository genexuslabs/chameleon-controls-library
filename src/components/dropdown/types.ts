import { ImageRender } from "../../common/types";
import { ChPopoverAlign } from "../popover/types";

export type DropdownModel = DropdownItemModel[];

export type DropdownItemModel =
  | DropdownItemActionableModel
  // | DropdownItemGroup
  | DropdownItemSeparatorModel
  | DropdownItemSlotModel;

export type DropdownItemType =
  | DropdownItemTypeActionable
  // | DropdownItemTypeGroup
  | DropdownItemTypeSeparator
  | DropdownItemTypeSlot;

export type DropdownItemTypeActionable = "actionable";
// export type DropdownItemTypeGroup = "group";
export type DropdownItemTypeSeparator = "separator";
export type DropdownItemTypeSlot = "slot";

export type DropdownItemTypeMapping = {
  actionable: DropdownItemActionableModel;
  separator: DropdownItemSeparatorModel;
  slot: DropdownItemSlotModel;
};

export type DropdownItemActionableModel = {
  id?: string;
  caption: string;
  disabled?: boolean;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;

  // TODO: Test using different expanded values on the initial load
  expanded?: boolean;

  items?: DropdownModel;
  itemsBlockAlign?: ChPopoverAlign;
  itemsInlineAlign?: ChPopoverAlign;
  link?: Link;
  parts?: string;
  shortcut?: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  type?: DropdownItemTypeActionable;
};

export type DropdownItemSeparatorModel = {
  id?: string;
  part?: string;
  type: DropdownItemTypeSeparator;
};

export type DropdownItemSlotModel = {
  id: string;
  type: DropdownItemTypeSlot;
};

type Link = {
  url: string;
};

export type DropdownExpandedChangeEvent = {
  item: DropdownItemActionableModel;
  expanded: boolean;
};

export type DropdownHyperlinkClickEvent = {
  event: PointerEvent;
  item: DropdownItemActionableModel;
};

// - - - - - - - - - - - - - - - - - - - -
//             Internal model
// - - - - - - - - - - - - - - - - - - - -
export type DropdownModelExtended = DropdownItemModelExtended[];

export type DropdownItemModelExtended = {
  item:
    | DropdownItemActionableModel
    | DropdownItemSeparatorModel
    | DropdownItemSlotModel;
  items?: DropdownModelExtended;
  parentItem: DropdownItemModelExtended | undefined;
  focusFirstItemAfterExpand?: boolean;
  focusAfterCollapse?: boolean;
};

export type DropdownInfoInEvent = {
  model: DropdownItemModelExtended;
  ref: HTMLChDropdownElement;
};

export type DropdownKeyboardActionResult = {
  newExpanded: boolean;
  model: DropdownItemModelExtended;
};

import { ImageRender } from "../../common/types";
import { ChPopoverAlign } from "../popover/types";

export type DropdownModel = DropdownItemModel[];

export type DropdownItemModel =
  | DropdownItemActionable
  // | DropdownItemGroup
  | DropdownItemSeparator
  | DropdownItemSlot;

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
  actionable: DropdownItemActionable;
  separator: DropdownItemSeparator;
  slot: DropdownItemSlot;
};

export type DropdownItemActionable = {
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

export type DropdownItemSeparator = {
  id?: string;
  part?: string;
  type: DropdownItemTypeSeparator;
};

export type DropdownItemSlot = {
  id: string;
  type: DropdownItemTypeSlot;
};

type Link = {
  url: string;
};

export type DropdownExpandedChangeEvent = {
  item: DropdownItemActionable;
  expanded: boolean;
};

// - - - - - - - - - - - - - - - - - - - -
//             Internal model
// - - - - - - - - - - - - - - - - - - - -
export type DropdownModelExtended = DropdownItemModelExtended[];

export type DropdownItemModelExtended = {
  item: DropdownItemActionable;
  items?: DropdownModelExtended;
  parentItem: DropdownItemModelExtended | undefined;
};

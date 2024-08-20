import { ImageRender } from "../../common/types";
import { DropdownPosition } from "./internal/dropdown/types";

export type DropdownModel = DropdownItemModel[];

export type DropdownItemType =
  | DropdownItemTypeActionable
  | DropdownItemTypeGroup
  | DropdownItemTypeSeparator;

export type DropdownItemTypeActionable = "actionable";
export type DropdownItemTypeGroup = "group";
export type DropdownItemTypeSeparator = "separator";

export type DropdownItemModel =
  | DropdownItemActionable
  // | DropdownItemGroup
  | DropdownItemSeparator;

export type DropdownItemActionable = {
  id?: string;
  caption: string;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;

  // TODO: Test using different expanded values on the initial load
  expanded?: boolean;

  items?: DropdownModel;
  itemsPosition?: DropdownPosition;
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

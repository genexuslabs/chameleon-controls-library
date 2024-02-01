import { DropdownPosition } from "../../dropdown/types";

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImgSrc?: string;
  items?: DropdownItemModel[];
  itemsPosition?: DropdownPosition;
  link?: Link;
  separatorClass?: string;
  shortcut?: string;
  startImgSrc?: string;
  showSeparator?: boolean;

  /**
   * Only used for performance reasons. It is not used as public property
   */
  wasExpanded?: boolean;
};

type Link = {
  url: string;
};

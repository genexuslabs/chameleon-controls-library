import { DropdownPosition } from "../../dropdown/types";

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImage?: string;
  items?: DropdownItemModel[];
  itemsPosition?: DropdownPosition;
  link?: Link;
  shortcut?: string;
  startImage?: string;

  /**
   * Only used for performance reasons. It is not used as public property
   */
  wasExpanded?: boolean;
};

type Link = {
  url: string;
};

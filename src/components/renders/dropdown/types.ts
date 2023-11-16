import { DropdownPosition } from "../../dropdown/types";

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImage?: string;
  items?: DropdownItemModel[];
  itemsPosition?: DropdownPosition;
  link?: Link;
  startImage?: string;
};

type Link = {
  url: string;
};

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImage?: string;
  items: DropdownItemModel[];
  target?: string;
  startImage?: string;
  showSeparator?: boolean;
  separatorClass?: string;
};

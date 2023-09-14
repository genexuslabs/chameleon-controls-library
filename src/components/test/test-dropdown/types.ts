export type DropdownItemModel = {
  id?: string;
  class?: string;
  leftIcon?: string;
  rightIcon?: string;
  items: DropdownItemModel[];
  target?: string;
  title: string;
  showSeparator?: boolean;
  separatorClass?: string;
};

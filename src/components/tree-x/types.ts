export type TreeXModel = {
  items: TreeXItemModel[];
  multiSelection?: boolean;
  showLines?: boolean;
};

export type TreeXItemModel = {
  id: string;
  caption: string;
  checkbox?: boolean;
  checked?: boolean;
  cssClass?: string;
  disabled?: boolean;
  expanded?: boolean;
  lazy?: boolean;
  leaf?: boolean;
  leftImgSrc?: string;
  items?: TreeXItemModel[];
  rightImgSrc?: string;
  selected?: boolean;
  showExpandableButton?: boolean;
  toggleCheckboxes?: boolean;
};

export type CheckedTreeItemInfo = {
  id: string;
  caption: string;
  selected: boolean;
};

export type ExpandedTreeItemInfo = {
  id: string;
  expanded: boolean;
};

export type TreeXListItemSelectedInfo = {
  ctrlKeyPressed: boolean;
  expanded: boolean;
  goToReference: boolean;
  id: string;
  itemRef: HTMLChTreeXListItemElement;
  parentId: string;
  selected: boolean;
};

export type TreeXItemDragStartInfo = {
  elem: HTMLChTreeXListItemElement;
  dataTransfer: DataTransfer;
};

export type TreeXItemDropInfo = {
  dropItemId: string;
  dataTransfer: DataTransfer;
};

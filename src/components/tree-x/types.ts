import { GxDataTransferInfo } from "../../common/types";

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
  class?: string;
  disabled?: boolean;
  dragDisabled?: boolean;
  dropDisabled?: boolean;
  expanded?: boolean;
  lazy?: boolean;
  leaf?: boolean;
  leftImgSrc?: string;
  indeterminate?: boolean;
  items?: TreeXItemModel[];
  metadata?: string;
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

export type TreeXListItemExpandedInfo = {
  id: string;
  expanded: boolean;
};

export type TreeXListItemSelectedInfo = {
  ctrlKeyPressed: boolean;
  expanded: boolean;
  goToReference: boolean;
  id: string;
  itemRef: HTMLChTreeXListItemElement;
  metadata: string;
  parentId: string;
  selected: boolean;
};

export type TreeXListItemNewCaption = {
  id: string;
  caption: string;
};

export type TreeXItemDragStartInfo = {
  elem: HTMLChTreeXListItemElement;
  dragEvent: DragEvent;
};

export type TreeXLines = "all" | "last" | "none";

export type TreeXDataTransferInfo = {
  newContainer: GxDataTransferInfo;
  draggedItems: GxDataTransferInfo[];
  draggingSelectedItems: boolean;
  dropInTheSameTree: boolean;
};

export type TreeXDropCheckInfo = {
  newContainer: GxDataTransferInfo;
  draggedItems: GxDataTransferInfo[];
};

export type TreeXDroppableZoneState = "checking" | "invalid" | "valid";

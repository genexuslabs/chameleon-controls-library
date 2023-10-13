import { GxDataTransferInfo } from "../../../common/types";

export type TreeXItemModel = {
  id: string;
  caption: string;
  checkbox?: boolean;
  checked?: boolean;
  class?: string;
  disabled?: boolean;
  downloading?: boolean;
  dragDisabled?: boolean;
  dropDisabled?: boolean;
  editable?: boolean;
  expanded?: boolean;
  lazy?: boolean;
  leaf?: boolean;
  leftImgSrc?: string;
  indeterminate?: boolean;
  items?: TreeXItemModel[];
  metadata?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;
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

export type TreeXListItemCheckedInfo = {
  id: string;
  checked: boolean;
  indeterminate: boolean;
};

export type TreeXListItemSelectedInfo = {
  ctrlKeyPressed: boolean;
  expanded: boolean;
  id: string;
  itemRef: HTMLChTreeXListItemElement;
  metadata: string;
  parentId: string;
  selected: boolean;
};

export type TreeXListItemOpenReferenceInfo = {
  id: string;
  leaf: boolean;
  metadata: string;
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

export type TreeXItemContextMenu = {
  id: string;
  itemRef: HTMLChTreeXListItemElement;
  metadata: string;
  contextmenuEvent: PointerEvent;
};

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

export type TreeXDroppableZoneState =
  | "checking"
  | "invalid"
  | "temporal-invalid"
  | "valid";

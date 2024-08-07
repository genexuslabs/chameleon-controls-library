import { GxDataTransferInfo } from "../../../../common/types";

export type CheckedTreeItemInfo = {
  id: string;
  caption: string;
  selected: boolean;
};

export type TreeViewItemExpandedInfo = {
  id: string;
  expanded: boolean;
};

export type TreeViewItemCheckedInfo = {
  id: string;
  checked: boolean;
  indeterminate: boolean;
};

export type TreeViewItemSelected = {
  ctrlKeyPressed: boolean;
  expanded: boolean;
  id: string;
  metadata: string;
  parentId: string;
  selected: boolean;
};

export type TreeViewItemSelectedInfo = Pick<
  TreeViewItemSelected,
  "id" | "expanded" | "metadata" | "parentId"
>;

export type TreeViewItemOpenReferenceInfo = {
  id: string;
  leaf: boolean;
  metadata: string;
};

export type TreeViewItemNewCaption = {
  id: string;
  caption: string;
};

export type TreeViewItemDragStartInfo = {
  elem: HTMLChTreeViewItemElement;
  dragEvent: DragEvent;
};

export type TreeViewLines = "all" | "last" | "none";

export type TreeViewItemContextMenu = {
  id: string;
  itemRef: HTMLChTreeViewItemElement;
  metadata: string;
  contextmenuEvent: PointerEvent;
};

export type TreeViewDataTransferInfo = {
  newContainer: GxDataTransferInfo;
  draggedItems: GxDataTransferInfo[];
  draggingSelectedItems: boolean;
  dropInTheSameTree: boolean;
  dropType: TreeViewDropType;
};

export type TreeViewDropCheckInfo = {
  newContainer: GxDataTransferInfo;
  draggedItems: GxDataTransferInfo[];
  dropType: TreeViewDropType;
};

export type TreeViewDroppableZoneState =
  | "checking"
  | "invalid"
  | "temporal-invalid"
  | "valid";

export type TreeViewDropType = "above" | "after" | "before";

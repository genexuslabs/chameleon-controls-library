import { GxDataTransferInfo } from "../../../common/types";

export type TreeViewItemModel = {
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
  expandableButton?: "action" | "decorative" | "no";

  /**
   * Used by the tree view to decide which is the last item in the list when
   * filters are applied.
   */
  lastItemId?: string;

  lazy?: boolean;
  leaf?: boolean;
  leftImgSrc?: string;
  indeterminate?: boolean;
  items?: TreeViewItemModel[];
  metadata?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;

  /**
   * `false` to not render the item.
   */
  render?: boolean;
  rightImgSrc?: string;
  selected?: boolean;
  toggleCheckboxes?: boolean;
};

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
};

export type TreeViewDropCheckInfo = {
  newContainer: GxDataTransferInfo;
  draggedItems: GxDataTransferInfo[];
};

export type TreeViewDroppableZoneState =
  | "checking"
  | "invalid"
  | "temporal-invalid"
  | "valid";

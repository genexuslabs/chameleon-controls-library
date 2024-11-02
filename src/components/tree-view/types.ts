import { GxImageMultiState } from "../../common/types";
import { ImageRender } from "../../components";

export type TreeViewModel = TreeViewItemModel[];

export type TreeViewItemModel = {
  id: string;
  caption: string;
  checkbox?: boolean;
  checked?: boolean;
  disabled?: boolean;
  downloading?: boolean;
  dragDisabled?: boolean;
  dropDisabled?: boolean;
  editable?: boolean;
  expanded?: boolean;
  endImgSrc?: string;
  endImgType?: ImageRender;

  /**
   * Used by the tree view to decide which is the last item in the list when
   * filters are applied.
   */
  lastItemId?: string;

  lazy?: boolean;
  leaf?: boolean;

  indeterminate?: boolean;
  items?: TreeViewModel;
  metadata?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;

  /**
   * Specifies a set of parts to use in every DOM element of the item.
   */
  parts?: string;

  /**
   * `false` to not render the item.
   */
  render?: boolean;
  selected?: boolean;
  startImgSrc?: string;
  startImgType?: ImageRender;
  toggleCheckboxes?: boolean;
};

export type TreeViewItemModelExtended = {
  parentItem: TreeViewItemModel;
  item: TreeViewItemModel;
};

export type TreeViewOperationStatus = {
  success: boolean;
};

export type TreeViewOperationStatusModifyCaption = TreeViewOperationStatus & {
  errorMessage: string;
};

export type TreeViewFilterOptions = {
  /**
   * When applying a new filter, expand the matches.
   */
  autoExpand?: boolean;

  // /**
  //  * Don't render unmatched items.
  //  */
  // hideUnmatchedItems?: boolean;

  /**
   * `true` to render the items that don't satisfy the predicate condition and
   * hide the items that satisfy the predicate.
   */
  hideMatchesAndShowNonMatches?: boolean;

  /**
   * Only works if `regularExpression` is not used.
   */
  highlightMatchedItems?: boolean;

  /**
   * Determine if the filter takes into account the camel casing.
   * Only works if `regularExpression !== true`
   */
  matchCase?: boolean;
};

export type TreeViewFilterType =
  | "checked"
  | "unchecked"
  | "caption"
  | "list"
  | "metadata"
  | "none";

export type TreeViewFilterInfo = {
  filter: string | RegExp | undefined;
  filterOptions: TreeViewFilterOptions;
  filterSet: Set<string>;
  defaultCheckbox: boolean;
  defaultChecked: boolean;
};

export type TreeViewRemoveItemsResult = {
  atLeastOneElement: boolean;
  atLeastOneCheckbox: boolean;
  atLeastOneSelected: boolean;
};

export type LazyLoadTreeItemsCallback = (
  treeItemId: string
) => Promise<TreeViewItemModel[]>;

export type TreeViewImagePathCallback = (
  item: TreeViewItemModel,
  iconDirection: "start" | "end"
) => string | TreeViewItemImageMultiState | undefined;

export type TreeViewItemImageMultiState = {
  default: GxImageMultiState;
  expanded?: GxImageMultiState;
};

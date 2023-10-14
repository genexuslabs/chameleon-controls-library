import { TreeXItemModel } from "../tree-view/tree-x/types";

export type TreeXItemModelExtended = {
  parentItem: TreeXItemModel;
  item: TreeXItemModel;
};

export type TreeXOperationStatus = {
  success: boolean;
};

export type TreeXOperationStatusModifyCaption = TreeXOperationStatus & {
  errorMessage: string;
};

export type TreeXFilterOptions = {
  /**
   * When applying a new filter, expand the matches.
   */
  autoExpand?: boolean;

  /**
   * Don't render unmatched items.
   */
  hideUnmatchedItems?: boolean;

  /**
   * Only works if `regularExpression` is not used.
   */
  highlightMatchedItems?: boolean;

  /**
   * Determine whether the filter works as a regular expression.
   */
  regularExpression?: boolean;
};

export type TreeXFilterType =
  | "checked"
  | "unchecked"
  | "caption"
  | "metadata"
  | "id-list"
  | "none";

export type TreeXFilterInfo = {
  filter: string;
  filterOptions: TreeXFilterOptions;
  filterList: string[];
  defaultCheckbox: boolean;
  defaultChecked: boolean;
};

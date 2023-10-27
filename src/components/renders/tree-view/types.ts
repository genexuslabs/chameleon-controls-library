import { TreeViewItemModel } from "../../tree-view/tree-view/types";

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

  /**
   * Determine if the filter takes into account the camel casing.
   * Only works if `regularExpression !== true`
   */
  camelCase?: boolean;

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

export type TreeViewFilterType =
  | "checked"
  | "unchecked"
  | "caption"
  | "metadata"
  | "id-list"
  | "none";

export type TreeViewFilterInfo = {
  filter: string;
  filterOptions: TreeViewFilterOptions;
  filterList: string[];
  defaultCheckbox: boolean;
  defaultChecked: boolean;
};

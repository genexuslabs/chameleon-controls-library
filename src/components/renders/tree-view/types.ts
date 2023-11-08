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
  filterSet: Set<string>;
  defaultCheckbox: boolean;
  defaultChecked: boolean;
};

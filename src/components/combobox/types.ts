import { ImageRender } from "../../common/types";

export type ComboBoxItemModel = ComboBoxItemGroup | ComboBoxItemLeaf;

export type ComboBoxItemLeaf = {
  caption: string;
  disabled?: boolean;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  value: string;
};

export type ComboBoxItemGroup = ComboBoxItemLeaf & {
  items: ComboBoxItemLeaf[];
};

export type ComboBoxFilterOptions = {
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

export type ComboBoxFilterType = "caption" | "list" | "value" | "none";

export type ComboBoxFilterInfo = {
  filter: string;
  filterOptions: ComboBoxFilterOptions;
  filterSet: Set<string>;
};

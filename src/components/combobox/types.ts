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
  expandable?: boolean;
  expanded?: boolean;
  items: ComboBoxItemLeaf[];
};

export type ComboBoxFilterOptions = {
  /**
   * `true` if the items of the combo-box are already filtered and the control
   * does not have to apply any transformation to process the filter value.
   * The utility of this property is to support filters on the server.
   *
   * If not specified, it defaults to `false`
   */
  alreadyProcessed?: boolean;

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

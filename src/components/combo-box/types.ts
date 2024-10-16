import {
  GxImageMultiState,
  GxImageMultiStateEnd,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";

export type ComboBoxModel = ComboBoxItemModel[];

export type ComboBoxItemModel = ComboBoxItemGroup | ComboBoxItemLeaf;

export type ComboBoxItemModelExtended = {
  item: ComboBoxItemModel;
  index: ComboBoxSelectedIndex;
};

export type ComboBoxItemImagesModel = {
  start?: GxImageMultiStateStart;
  end?: GxImageMultiStateEnd;
};

export type ComboBoxSelectedIndex =
  | {
      type: "not-exists";
    }
  | {
      type: "nested";
      firstLevelIndex: number;
      secondLevelIndex: number;
    }
  | {
      type: "first-level";
      firstLevelIndex: number;
    };

export type ComboBoxItemLeaf = {
  caption?: string;
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

export type ComboBoxSuggestOptions = {
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
   * @status Not yet implemented.
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
   * @status Not yet implemented.
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

  /**
   *
   */
  strict?: boolean;
};

export type ComboBoxSuggestInfo = {
  filter: string;
  options: ComboBoxSuggestOptions;
};

export type ComboBoxImagePathCallback = (
  item: ComboBoxItemModel,
  iconDirection: "start" | "end"
) => GxImageMultiState | undefined;

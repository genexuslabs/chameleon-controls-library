import type { ItemLink } from "../../typings/hyperlinks";
import type { ImageRender } from "../../typings/multi-state-images";
import type ChNavigationListRender from "./navigation-list-render.lit";
import type { NAVIGATION_LIST_ITEM_WAS_EXPANDED } from "./utils";

export type NavigationListModel = NavigationListItemModel[];

export type NavigationListItemModel = {
  id?: string;
  caption: string;
  disabled?: boolean;
  expanded?: boolean;
  metadata?: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  link?: ItemLink;
  items?: NavigationListModel;
  [NAVIGATION_LIST_ITEM_WAS_EXPANDED]?: boolean;
};

export type NavigationListHyperlinkClickEvent = {
  item: NavigationListItemModel;
};

export type NavigationListSharedState = {
  /**
   * Specifies what kind of expandable button is displayed in the items by
   * default.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  expandableButton: ChNavigationListRender["expandableButton"];

  /**
   * Specifies the position of the expandable button in reference of the action
   * element of the items
   *  - `"start"`: Expandable button is placed before the action element.
   *  - `"end"`: Expandable button is placed after the action element.
   */
  expandableButtonPosition: ChNavigationListRender["expandableButtonPosition"];

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  getImagePathCallback: ChNavigationListRender["getImagePathCallback"];

  /**
   * Specifies if the navigation-list parent is expanded or collapsed.
   */
  navigationListExpanded: ChNavigationListRender["expanded"];

  /**
   * Specifies if the selected item indicator is displayed when the item is
   * selected. Only applies when the `link` property is defined.
   */
  selectedLinkIndicator: ChNavigationListRender["selectedLinkIndicator"];

  selectedLink: ChNavigationListRender["selectedLink"];

  /**
   * Specifies how the caption will be displayed when the navigation-list
   * parent is collapsed
   */
  showCaptionOnCollapse: ChNavigationListRender["showCaptionOnCollapse"];

  /**
   * Specifies the delay (in ms) for the tooltip to be displayed.
   */
  tooltipDelay: ChNavigationListRender["tooltipDelay"];
};


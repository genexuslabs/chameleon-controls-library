import {
  CssContainProperty,
  CssOverflowProperty,
  ImageRender
} from "../../common/types";

export type TabListPosition =
  | "block-start"
  | "inline-end"
  | "block-end"
  | "inline-start";

export type TabModel = TabItemModel[];

export type TabItemModel = {
  id: string;

  accessibleName?: string;

  // TODO: Rename to caption???
  name?: string;

  /**
   * Same as the contain CSS property. This property indicates that an item
   * and its contents are, as much as possible, independent from the rest of
   * the document tree. Containment enables isolating a subsection of the DOM,
   * providing performance benefits by limiting calculations of layout, style,
   * paint, size, or any combination to a DOM subtree rather than the entire
   * page.
   * Containment can also be used to scope CSS counters and quotes.
   *
   * By default, this property takes to value of the ch-tab-render.
   */
  contain?: CssContainProperty;

  /**
   * `true` to display a close button for the tab.
   */
  closeButton?: boolean;

  disabled?: boolean;

  /**
   * Same as the overflow CSS property. This property sets the desired behavior
   * when content does not fit in the widget's padding box (overflows) in the
   * horizontal and/or vertical direction.
   *
   * By default, this property takes to value of the ch-tab-render.
   */
  overflow?:
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}`;

  startImgSrc?: string;

  /**
   * Specifies how the image will be rendered. Defaults to `"background"`.
   */
  startImgType?: ImageRender;
  wasRendered?: boolean;
};

export type TabItemCloseInfo = {
  itemId: string;
  itemIndex: number;
};

export type TabSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
};

export type TabElementSize = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

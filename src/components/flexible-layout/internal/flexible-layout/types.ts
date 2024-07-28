import {
  AccessibleRole,
  CssContainProperty,
  ImageRender
} from "../../../../common/types";
import {
  LayoutSplitterModel,
  LayoutSplitterGroupModel,
  LayoutSplitterLeafModel,
  LayoutSplitterItemRemoveResult
} from "../../../layout-splitter/types";

// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type ViewType =
  | "inlineStart"
  | "main"
  | "inlineEnd"
  | "blockEnd"
  | "blockStart";
export type ViewAccessibleRole = Exclude<AccessibleRole, "article" | "list">;

/*
 * TODO: For some reason, this type does not work when is applied to an object,
 * and the "main" or "blockStart" keys are defined
 */
// export type FlexibleLayout = {
//   [key: string]: FlexibleLayoutAside | FlexibleLayoutFooter;
//   blockStart?: FlexibleLayoutHeader;
//   inlineStart?: FlexibleLayoutAside;
//   main?: FlexibleLayoutMain;
//   inlineEnd?: FlexibleLayoutAside;
//   blockEnd?: FlexibleLayoutFooter;
// };
export type FlexibleLayoutModel = Omit<LayoutSplitterModel, "items"> & {
  items: FlexibleLayoutItemModel[];
};

export type FlexibleLayoutItemModel =
  | FlexibleLayoutGroupModel
  | FlexibleLayoutLeafModel;

export type FlexibleLayoutLeafModel = LayoutSplitterLeafModel & {
  accessibleRole?: ViewAccessibleRole;
} & FlexibleLayoutLeafConfiguration;

export type FlexibleLayoutLeafConfiguration =
  | FlexibleLayoutLeafConfigurationTabbed
  | FlexibleLayoutLeafConfigurationSingleContent;

export type FlexibleLayoutLeafConfigurationTabbed = {
  closeButtonHidden?: boolean;

  /**
   * When the control is sortable, the items can be dragged outside of the
   * tab-list. This property lets you specify if this behavior is disabled.
   * If not specified, defaults to `false`
   */
  dragOutsideDisabled?: boolean;

  selectedWidgetId?: string;
  showCaptions?: boolean;

  /**
   * `true` to enable sorting the tab buttons by dragging them in the tab-list.
   * If sortable !== true, the tab buttons can not be dragged out either.
   * If not specified, defaults to `true`
   */
  sortable?: boolean;

  /** `true` to not render the tab captions of the view. */
  tabCaptionHidden?: boolean;

  tabDirection: FlexibleLayoutLeafTabDirection;

  /**
   * Specifies whether the tab is displayed before or after of its content.
   * If not specified, defaults to `"start"`
   */
  tabPosition?: FlexibleLayoutLeafTabPosition;
  type: Extract<FlexibleLayoutLeafType, "tabbed">;
  widgets: FlexibleLayoutWidget[];
};

export type FlexibleLayoutLeafConfigurationSingleContent = {
  type: Extract<FlexibleLayoutLeafType, "single-content">;
  widget: FlexibleLayoutWidget;
} & FlexibleLayoutWidgetRender;

export type FlexibleLayoutLeafType = "tabbed" | "single-content";

export type FlexibleLayoutLeafTabDirection = "block" | "inline";
export type FlexibleLayoutLeafTabPosition = "start" | "end";

export type FlexibleLayoutGroupModel = Omit<
  LayoutSplitterGroupModel,
  "items"
> & {
  accessibleRole?: ViewAccessibleRole;
  items: FlexibleLayoutItemModel[];
};

export type FlexibleLayoutWidgetExtended = {
  parentLeafId: string;
  info: FlexibleLayoutWidget;
};

export type FlexibleLayoutWidget = {
  /**
   * If `true` a div will be rendered as a parent wrapper for the widget render.
   * Only use `false` in StencilJS contexts where the `slot={widgetId}` and
   * `key={widgetId}` must be added.
   */
  addWrapper?: boolean;

  /**
   * If `true` when a widget is closed its render state and DOM nodes won't be
   * destroyed. Defaults to `false`.
   */
  conserveRenderState?: boolean;
  id: string;
  name: string;

  startImgSrc?: string;

  /**
   * Specifies how the image will be rendered. Defaults to `"background"`.
   */
  startImgType?: ImageRender;
  wasRendered?: boolean;
} & FlexibleLayoutWidgetRender;

type FlexibleLayoutWidgetRender = {
  /**
   * Same as the contain CSS property. This property indicates that an widget
   * and its contents are, as much as possible, independent from the rest of
   * the document tree. Containment enables isolating a subsection of the DOM,
   * providing performance benefits by limiting calculations of layout, style,
   * paint, size, or any combination to a DOM subtree rather than the entire
   * page.
   * Containment can also be used to scope CSS counters and quotes.
   *
   * By default, this property takes to value of the ch-flexible-layout-render.
   */
  contain?: CssContainProperty;

  /**
   * Specifies the render of the widget. If not specified, the id of the widget
   * will be used as the `renderId`.
   */
  renderId?: string;
};

export type FlexibleLayoutItemBase = {
  id: string;
  name: string;
};

export type FlexibleLayoutRenders = {
  [key: string]: (widgetInfo: FlexibleLayoutWidget) => any;
};

// - - - - - - - - - - - - - - - - - - - -
//          Model used internally
// - - - - - - - - - - - - - - - - - - - -
export type FlexibleLayoutItemExtended<
  T extends FlexibleLayoutGroupModel | FlexibleLayoutLeafModel,
  R extends FlexibleLayoutLeafType
> = T extends FlexibleLayoutLeafModel
  ? {
      item: FlexibleLayoutLeafModel;
      parentItem: FlexibleLayoutGroupModel;
      leafInfo: FlexibleLayoutLeafInfo<R>;
    }
  : {
      item: FlexibleLayoutGroupModel;
      parentItem: FlexibleLayoutGroupModel;
    };

export type FlexibleLayoutLeafInfo<T extends FlexibleLayoutLeafType> = {
  /**
   * Same as the leaf id (item.id).
   */
  id: string;

  exportParts: string;
} & (T extends "tabbed"
  ? Required<FlexibleLayoutLeafConfigurationTabbed>
  : FlexibleLayoutLeafConfigurationSingleContent);

// - - - - - - - - - - - - - - - - - - - -
//               Event info
// - - - - - - - - - - - - - - - - - - - -
export type ViewItemCloseInfo = {
  itemId: string;
  itemIndex: number;
  viewId: string;
};

export type ViewSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
  viewId: string;
};

export type FlexibleLayoutViewRemoveResult = Omit<
  LayoutSplitterItemRemoveResult,
  "fixedSizesSumDecrement"
>;

// - - - - - - - - - - - - - - - - - - - -
//               Interfaces
// - - - - - - - - - - - - - - - - - - - -
export interface DraggableView {
  endDragPreview: () => Promise<void>;

  /**
   * Returns the info associated to the draggable views.
   */
  getDraggableViews: () => Promise<DraggableViewInfo>;

  promoteDragPreviewToTopLayer: () => Promise<void>;
}

export type DraggableViewInfo = {
  mainView: HTMLElement;
  pageView: HTMLElement;
  tabListView: HTMLElement;
};

export type DraggableViewExtendedInfo = {
  abortController: AbortController;
  mainView: HTMLElement;
  pageView: HTMLElement;
  tabListView: HTMLElement;
  viewId: string;
};

export type WidgetDragInfo = {
  index: number;
  viewId: string;
};

export type WidgetDropInfo = {
  viewIdTarget: string;
  dropAreaTarget: DroppableArea;
};

export type WidgetReorderInfo = WidgetDragInfo & WidgetDropInfo;

export type FlexibleLayoutWidgetCloseInfo = {
  widgetId: string;
  viewId: string;
};

export type DroppableArea =
  | "block-start"
  | "block-end"
  | "inline-start"
  | "inline-end"
  | "center";

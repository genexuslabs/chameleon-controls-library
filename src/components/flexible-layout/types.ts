import { AccessibleRole, ImageRender } from "../../common/types";
import {
  LayoutSplitterDistribution,
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionLeaf,
  LayoutSplitterItemRemoveResult
} from "../layout-splitter/types";
import { ListType } from "../list/types";

// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type ViewType = ListType | "blockStart";
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
export type FlexibleLayout = Omit<LayoutSplitterDistribution, "items"> & {
  items: FlexibleLayoutItem[];
};

export type FlexibleLayoutItem = FlexibleLayoutGroup | FlexibleLayoutLeaf;

export type FlexibleLayoutLeaf = LayoutSplitterDistributionLeaf & {
  accessibleRole?: ViewAccessibleRole;
} & FlexibleLayoutLeafConfiguration;

export type FlexibleLayoutLeafConfiguration =
  | FlexibleLayoutLeafConfigurationTabbed
  | FlexibleLayoutLeafConfigurationSingleContent;

export type FlexibleLayoutLeafConfigurationTabbed = {
  closeButtonHidden?: boolean;
  selectedWidgetId?: string;
  showCaptions?: boolean;
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

export type FlexibleLayoutGroup = Omit<
  LayoutSplitterDistributionGroup,
  "items"
> & {
  accessibleRole?: ViewAccessibleRole;
  items: FlexibleLayoutItem[];
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

  startImageSrc?: string;

  /**
   * Specifies how the image will be rendered. Defaults to `"pseudo-element"`.
   */
  startImageType?: ImageRender;
  wasRendered?: boolean;
} & FlexibleLayoutWidgetRender;

type FlexibleLayoutWidgetRender = {
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
  T extends FlexibleLayoutGroup | FlexibleLayoutLeaf,
  R extends FlexibleLayoutLeafType
> = T extends FlexibleLayoutLeaf
  ? {
      item: FlexibleLayoutLeaf;
      parentItem: FlexibleLayoutGroup;
      leafInfo: FlexibleLayoutLeafInfo<R>;
    }
  : {
      item: FlexibleLayoutGroup;
      parentItem: FlexibleLayoutGroup;
    };

export type FlexibleLayoutLeafInfo<T extends FlexibleLayoutLeafType> = {
  /**
   * Same as the leaf id (item.id).
   */
  id: string;

  exportParts: string;
} & (T extends "tabbed"
  ? FlexibleLayoutLeafConfigurationTabbed
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

export type DroppableArea =
  | "block-start"
  | "block-end"
  | "inline-start"
  | "inline-end"
  | "center";

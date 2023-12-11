import {
  LayoutSplitterDistribution,
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionLeaf
} from "../../layout-splitter/types";
import { tabTypeToPart } from "../../tab/utils";
import {
  FlexibleLayout,
  FlexibleLayoutGroup,
  FlexibleLayoutItem,
  FlexibleLayoutLeaf,
  FlexibleLayoutView,
  FlexibleLayoutWidget,
  ViewType
} from "../types";

let lastViewId = 0;

export const getViewId = () => `view-${lastViewId++}`;

export const mapWidgetsToView = (
  widgets: FlexibleLayoutWidget[],
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  renderedWidgets: Set<string>,
  viewType: ViewType
): string => {
  // Get a new id for the view
  const viewId = getViewId();

  if (viewType === "blockStart") {
    // Store widgets in the Map
    viewsInfo.set(viewId, {
      id: viewId,
      type: viewType,
      renderedWidgets: null, // Won't be used to render the "blockStart" ViewType
      exportParts: "",
      widgets: widgets
    });

    // Add the widgets to the blockStart section
    widgets.forEach(widget => {
      blockStartWidgets.add(widget.id);
    });

    return viewId;
  }

  const exportParts = tabTypeToPart[viewType](widgets);
  const renderedWidgetsInView: Set<string> = new Set();
  let existSelectedItem = false;

  widgets.forEach(widget => {
    if (widget.selected || widget.wasRendered) {
      // Ensure proper initialization
      widget.wasRendered = true;

      renderedWidgetsInView.add(widget.id);
      renderedWidgets.add(widget.id);
      existSelectedItem = true;
    }
  });

  // If there is no widget selected by default, select one
  if (!existSelectedItem) {
    const defaultSelectedWidget =
      viewType === "main" || viewType === "blockEnd"
        ? widgets[widgets.length - 1]
        : widgets[0];

    defaultSelectedWidget.selected = true;
    defaultSelectedWidget.wasRendered = true;

    renderedWidgetsInView.add(defaultSelectedWidget.id);
    renderedWidgets.add(defaultSelectedWidget.id);
  }

  // Store widgets in the Map
  viewsInfo.set(viewId, {
    id: viewId,
    type: viewType,
    renderedWidgets: renderedWidgetsInView,
    exportParts,
    widgets: widgets
  });

  return viewId;
};

const getItemsModel = (
  flexibleItems: FlexibleLayoutItem[],
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  renderedWidgets: Set<string>
): LayoutSplitterDistributionItem[] =>
  flexibleItems.map(item => {
    // Group
    if ((item as FlexibleLayoutGroup).items != null) {
      const group = item as FlexibleLayoutGroup;

      const splitterGroup: LayoutSplitterDistributionGroup = {
        direction: group.direction,
        items: getItemsModel(
          group.items,
          viewsInfo,
          blockStartWidgets,
          renderedWidgets
        ),
        size: group.size
      };

      if (item.hideDragBar) {
        splitterGroup.hideDragBar = true;
      }

      return splitterGroup;
    }

    // Leaf
    const leaf = item as FlexibleLayoutLeaf;

    const viewId = mapWidgetsToView(
      leaf.widgets,
      viewsInfo,
      blockStartWidgets,
      renderedWidgets,
      leaf.viewType
    );

    const splitterLeaf: LayoutSplitterDistributionLeaf = {
      id: viewId,
      size: leaf.size,
      fixedOffsetSize: leaf.fixedOffsetSize
    };

    if (item.hideDragBar) {
      splitterLeaf.hideDragBar = true;
    }

    return splitterLeaf;
  });

export const getLayoutModel = (
  flexibleLayout: FlexibleLayout,
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  renderedWidgets: Set<string>
): LayoutSplitterDistribution => ({
  direction: flexibleLayout.direction,
  items: getItemsModel(
    flexibleLayout.items,
    viewsInfo,
    blockStartWidgets,
    renderedWidgets
  )
});

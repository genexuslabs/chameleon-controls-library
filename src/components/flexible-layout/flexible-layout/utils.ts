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
  FlexibleLayoutView
} from "../types";

let lastViewId = 0;

export const getViewId = () => `view-${lastViewId++}`;

export const mapWidgetsToView = (
  flexibleLayoutLeaf: FlexibleLayoutLeaf,
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  renderedWidgets: Set<string>
): string => {
  // Get a new id for the view
  const viewId = getViewId();

  let selectedWidgetId = flexibleLayoutLeaf.selectedWidgetId;
  const viewType = flexibleLayoutLeaf.viewType;
  const widgets = flexibleLayoutLeaf.widgets;

  if (viewType === "blockStart") {
    // Store widgets in the Map
    viewsInfo.set(viewId, {
      id: viewId,
      type: viewType,
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

  widgets.forEach(widget => {
    if (widget.wasRendered || selectedWidgetId === widget.id) {
      // Ensure proper initialization
      widget.wasRendered = true;

      renderedWidgets.add(widget.id);
    }
  });

  // If there is no widget selected by default, select one
  if (selectedWidgetId == null) {
    const selectedWidget =
      widgets[
        viewType === "main" || viewType === "blockEnd" ? widgets.length - 1 : 0
      ];
    selectedWidgetId = selectedWidget.id;
    selectedWidget.wasRendered = true;

    renderedWidgets.add(selectedWidgetId);
  }

  // Store widgets in the Map
  viewsInfo.set(viewId, {
    id: viewId,
    exportParts,
    selectedWidgetId: selectedWidgetId,
    type: viewType,
    widgets: widgets
  });

  return viewId;
};

const getItemsModel = (
  flexibleItems: FlexibleLayoutItem[],
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  layoutSplitterParts: Set<string>,
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
          layoutSplitterParts,
          renderedWidgets
        ),
        size: group.size
      };

      // Custom behaviors
      addCustomBehavior(item, splitterGroup, layoutSplitterParts);

      return splitterGroup;
    }

    // Leaf
    const leaf = item as FlexibleLayoutLeaf;

    const viewId = mapWidgetsToView(
      leaf,
      viewsInfo,
      blockStartWidgets,
      renderedWidgets
    );

    const splitterLeaf: LayoutSplitterDistributionLeaf = {
      id: viewId,
      size: leaf.size,
      fixedOffsetSize: leaf.fixedOffsetSize
    };

    // Custom behaviors
    addCustomBehavior(item, splitterLeaf, layoutSplitterParts);

    return splitterLeaf;
  });

function addCustomBehavior(
  item: FlexibleLayoutItem,
  splitterItem: LayoutSplitterDistributionItem,
  layoutSplitterParts: Set<string>
) {
  if (item.hideDragBar) {
    splitterItem.hideDragBar = true;
  }
  if (item.dragBarPart != null) {
    splitterItem.dragBarPart = item.dragBarPart;
    layoutSplitterParts.add(item.dragBarPart);
  }
}

export const getLayoutModel = (
  flexibleLayout: FlexibleLayout,
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>
): LayoutSplitterDistribution => ({
  direction: flexibleLayout.direction,
  items: getItemsModel(
    flexibleLayout.items,
    viewsInfo,
    blockStartWidgets,
    layoutSplitterParts,
    renderedWidgets
  )
});

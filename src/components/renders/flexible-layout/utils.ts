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
} from "../../flexible-layout/types";

let lastViewId = 0;

export const ROOT_VIEW: null = null;

export const getViewId = () => `view-${lastViewId++}`;

export const mapWidgetsToView = (
  flexibleLayoutLeaf: FlexibleLayoutLeaf,
  itemRefIndex: number,
  parentDistributionRef: LayoutSplitterDistributionGroup,
  parentItemRef: FlexibleLayoutGroup,
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
      itemRef: flexibleLayoutLeaf,
      itemRefIndex: itemRefIndex,
      parentDistributionRef: parentDistributionRef,
      parentItemRef: parentItemRef,
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
    itemRef: flexibleLayoutLeaf,
    itemRefIndex: itemRefIndex,
    parentDistributionRef: parentDistributionRef,
    parentItemRef: parentItemRef,
    exportParts,
    selectedWidgetId: selectedWidgetId,
    type: viewType,
    widgets: widgets
  });

  return viewId;
};

const getItemsModel = (
  flexibleItems: FlexibleLayoutItem[],
  parentItemRef: FlexibleLayoutGroup,
  parentDistributionRef: LayoutSplitterDistributionGroup,
  viewsInfo: Map<string, FlexibleLayoutView>,
  blockStartWidgets: Set<string>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>
): LayoutSplitterDistributionItem[] =>
  flexibleItems.map((item, itemIndex) => {
    // Group
    if ((item as FlexibleLayoutGroup).items != null) {
      const group = item as FlexibleLayoutGroup;

      // Necessary to have the reference before the getItemsModel call
      const splitterGroup: LayoutSplitterDistributionGroup = {
        direction: group.direction,
        size: group.size
      } as any;

      splitterGroup.items = getItemsModel(
        group.items,
        group,
        splitterGroup,
        viewsInfo,
        blockStartWidgets,
        layoutSplitterParts,
        renderedWidgets
      );

      // Custom behaviors
      addCustomBehavior(item, splitterGroup, layoutSplitterParts);

      return splitterGroup;
    }

    // Leaf
    const leaf = item as FlexibleLayoutLeaf;

    const viewId = mapWidgetsToView(
      leaf,
      itemIndex,
      parentDistributionRef,
      parentItemRef,
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
    ROOT_VIEW,
    ROOT_VIEW,
    viewsInfo,
    blockStartWidgets,
    layoutSplitterParts,
    renderedWidgets
  )
});

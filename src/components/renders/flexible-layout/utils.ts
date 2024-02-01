/* eslint-disable @typescript-eslint/no-unused-vars */
import { tabTypeToPart } from "../../list/utils";
import {
  FlexibleLayout,
  FlexibleLayoutGroup,
  FlexibleLayoutItem,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeaf,
  FlexibleLayoutLeafInfo
} from "../../flexible-layout/types";

export const ROOT_VIEW: null = null;

export const createAndSetViewInfo = (
  flexibleLayoutLeaf: FlexibleLayoutLeaf,
  blockStartWidgets: Set<string>,
  renderedWidgets: Set<string>
): FlexibleLayoutLeafInfo => {
  let selectedWidgetId = flexibleLayoutLeaf.selectedWidgetId;
  const viewId = flexibleLayoutLeaf.id;
  const viewType = flexibleLayoutLeaf.viewType;
  const widgets = flexibleLayoutLeaf.widgets;

  if (viewType === "blockStart") {
    // Add the widgets to the blockStart section
    widgets.forEach(widget => {
      blockStartWidgets.add(widget.id);
    });

    return {
      id: viewId,
      type: viewType,
      exportParts: "",
      widgets: widgets
    };
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

  return {
    id: viewId,
    exportParts,
    closeButtonHidden: flexibleLayoutLeaf.closeButtonHidden ?? false,
    selectedWidgetId: selectedWidgetId,
    showCaptions: flexibleLayoutLeaf.showCaptions ?? true,
    type: viewType,
    widgets: widgets
  };
};

const addCustomBehavior = (
  item: FlexibleLayoutItem,
  layoutSplitterParts: Set<string>
) => {
  if (item.dragBar?.part) {
    layoutSplitterParts.add(item.dragBar?.part);
  }
};

export const addNewViewToInfo = (
  leaf: FlexibleLayoutLeaf,
  parentItem: FlexibleLayoutGroup,
  itemsInfo: Map<string, FlexibleLayoutItemExtended<FlexibleLayoutItem>>,
  blockStartWidgets: Set<string>,
  renderedWidgets: Set<string>
) => {
  const flexibleItemExtended: FlexibleLayoutItemExtended<FlexibleLayoutLeaf> = {
    item: leaf,
    parentItem: parentItem,
    view: createAndSetViewInfo(leaf, blockStartWidgets, renderedWidgets)
  };

  itemsInfo.set(leaf.id, flexibleItemExtended);
};

const updateFlexibleSubModels = (
  flexibleLayoutItems: FlexibleLayoutItem[],
  itemsInfo: Map<string, FlexibleLayoutItemExtended<FlexibleLayoutItem>>,
  blockStartWidgets: Set<string>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>,
  parentItem: FlexibleLayoutGroup
) => {
  flexibleLayoutItems.forEach(flexibleItem => {
    // Group
    if ((flexibleItem as FlexibleLayoutGroup).items != null) {
      const group = flexibleItem as FlexibleLayoutGroup;

      const flexibleItemExtended: FlexibleLayoutItemExtended<FlexibleLayoutGroup> =
        {
          item: group,
          parentItem: parentItem
        };
      itemsInfo.set(group.id, flexibleItemExtended);

      layoutSplitterParts.add(group.id);

      updateFlexibleSubModels(
        group.items, // Subitems
        itemsInfo,
        blockStartWidgets,
        layoutSplitterParts,
        renderedWidgets,
        group
      );
    }
    // Leaf
    else {
      addNewViewToInfo(
        flexibleItem as FlexibleLayoutLeaf,
        parentItem,
        itemsInfo,
        blockStartWidgets,
        renderedWidgets
      );
    }

    // Custom behaviors
    addCustomBehavior(flexibleItem, layoutSplitterParts);
  });
};

export const updateFlexibleModels = (
  flexibleLayout: FlexibleLayout,
  itemsInfo: Map<string, FlexibleLayoutItemExtended<FlexibleLayoutItem>>,
  blockStartWidgets: Set<string>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>
) =>
  updateFlexibleSubModels(
    flexibleLayout.items,
    itemsInfo,
    blockStartWidgets,
    layoutSplitterParts,
    renderedWidgets,
    ROOT_VIEW // Root item
  );

export const getViewInfo = (
  itemsInfo: Map<string, FlexibleLayoutItemExtended<FlexibleLayoutItem>>,
  viewId: string
): FlexibleLayoutLeafInfo =>
  (itemsInfo.get(viewId) as FlexibleLayoutItemExtended<FlexibleLayoutLeaf>)
    .view;

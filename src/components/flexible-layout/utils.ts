/* eslint-disable @typescript-eslint/no-unused-vars */
import { tabTypeToPart } from "../tab/utils";
import {
  FlexibleLayoutModel,
  FlexibleLayoutGroupModel,
  FlexibleLayoutItemModel,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeafModel,
  FlexibleLayoutLeafInfo,
  FlexibleLayoutLeafType,
  FlexibleLayoutWidgetExtended
} from "./internal/flexible-layout/types";
import { ROOT_VIEW } from "../../common/utils";
import { Build } from "@stencil/core";

// Aliases
type ItemExtended = FlexibleLayoutItemExtended<
  FlexibleLayoutItemModel,
  FlexibleLayoutLeafType
>;

type LeafExtended = FlexibleLayoutItemExtended<
  FlexibleLayoutLeafModel,
  FlexibleLayoutLeafType
>;

type GroupExtended = FlexibleLayoutItemExtended<
  FlexibleLayoutGroupModel,
  FlexibleLayoutLeafType
>;

export const createAndSetLeafInfo = (
  flexibleLayoutLeaf: FlexibleLayoutLeafModel,
  renderedWidgets: Set<string>,
  widgetsInfo: Map<string, FlexibleLayoutWidgetExtended>
): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType> => {
  const leafId = flexibleLayoutLeaf.id;
  const leafType = flexibleLayoutLeaf.type;

  if (leafType === "single-content") {
    const widget = flexibleLayoutLeaf.widget;

    // Mark the widget as rendered
    renderedWidgets.add(widget.id);

    // Store the widget info
    widgetsInfo.set(leafId, { parentLeafId: leafId, info: widget });

    return {
      id: leafId,
      type: leafType,
      exportParts: "",
      widget: widget
    };
  }

  let selectedWidgetId = flexibleLayoutLeaf.selectedWidgetId;
  const widgets = flexibleLayoutLeaf.widgets;
  const tabOrientation = flexibleLayoutLeaf.tabDirection;
  const tabPosition = flexibleLayoutLeaf.tabPosition;

  const exportParts =
    tabTypeToPart[
      `${tabOrientation}-${
        tabPosition ?? "start"
      }` as keyof typeof tabTypeToPart
    ](widgets);

  widgets.forEach(widget => {
    if (widget.wasRendered || selectedWidgetId === widget.id) {
      // Ensure proper initialization
      widget.wasRendered = true;

      renderedWidgets.add(widget.id);
    }

    // Store the widget info
    widgetsInfo.set(widget.id, { parentLeafId: leafId, info: widget });
  });

  if (Build.isDev) {
    if (widgets.length === 0) {
      console.warn(`The view "${leafId}" does not have any widget.`);
    }
  }

  // If there is no widget selected by default, select one
  if (selectedWidgetId == null && widgets.length > 0) {
    const selectedWidget =
      widgets[tabOrientation === "block" ? widgets.length - 1 : 0];
    selectedWidgetId = selectedWidget.id;
    selectedWidget.wasRendered = true;

    // Mark the widget as rendered
    renderedWidgets.add(selectedWidgetId);
  }

  return {
    id: leafId,
    exportParts,
    closeButtonHidden: flexibleLayoutLeaf.closeButtonHidden ?? false,
    dragOutsideDisabled: flexibleLayoutLeaf.dragOutsideDisabled ?? false,
    selectedWidgetId: selectedWidgetId,
    showCaptions: flexibleLayoutLeaf.showCaptions ?? true,
    sortable: flexibleLayoutLeaf.sortable ?? true,
    tabDirection: tabOrientation,
    tabButtonHidden: flexibleLayoutLeaf.tabButtonHidden ?? false,
    tabPosition: flexibleLayoutLeaf.tabPosition,
    type: leafType,
    widgets: widgets
  };
};

const addCustomBehavior = (
  item: FlexibleLayoutItemModel,
  layoutSplitterParts: Set<string>
) => {
  if (item.dragBar?.part) {
    layoutSplitterParts.add(item.dragBar?.part);
  }
};

export const addNewLeafToInfo = (
  leaf: FlexibleLayoutLeafModel,
  parentItem: FlexibleLayoutGroupModel,
  itemsInfo: Map<string, ItemExtended>,
  renderedWidgets: Set<string>,
  widgetsInfo: Map<string, FlexibleLayoutWidgetExtended>
) => {
  const flexibleLeafExtended: LeafExtended = {
    item: leaf,
    parentItem: parentItem,
    leafInfo: createAndSetLeafInfo(leaf, renderedWidgets, widgetsInfo)
  };

  itemsInfo.set(leaf.id, flexibleLeafExtended);
};

const updateFlexibleSubModels = (
  flexibleLayoutItems: FlexibleLayoutItemModel[],
  itemsInfo: Map<string, ItemExtended>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>,
  widgetsInfo: Map<string, FlexibleLayoutWidgetExtended>,
  parentItem: FlexibleLayoutGroupModel
) => {
  flexibleLayoutItems.forEach(flexibleItem => {
    // Group
    if ((flexibleItem as FlexibleLayoutGroupModel).items != null) {
      const group = flexibleItem as FlexibleLayoutGroupModel;

      const flexibleItemExtended: GroupExtended = {
        item: group,
        parentItem: parentItem
      };
      itemsInfo.set(group.id, flexibleItemExtended);

      layoutSplitterParts.add(group.id);

      updateFlexibleSubModels(
        group.items, // Subitems
        itemsInfo,
        layoutSplitterParts,
        renderedWidgets,
        widgetsInfo,
        group
      );
    }
    // Leaf
    else {
      addNewLeafToInfo(
        flexibleItem as FlexibleLayoutLeafModel,
        parentItem,
        itemsInfo,
        renderedWidgets,
        widgetsInfo
      );
    }

    // Custom behaviors
    addCustomBehavior(flexibleItem, layoutSplitterParts);
  });
};

export const updateFlexibleModels = (
  flexibleLayout: FlexibleLayoutModel,
  itemsInfo: Map<string, ItemExtended>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>,
  widgetsInfo: Map<string, FlexibleLayoutWidgetExtended>
) =>
  updateFlexibleSubModels(
    flexibleLayout.items,
    itemsInfo,
    layoutSplitterParts,
    renderedWidgets,
    widgetsInfo,
    ROOT_VIEW // Root item
  );

export const getLeafInfo = (
  itemsInfo: Map<string, ItemExtended>,
  leafId: string
): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType> =>
  (itemsInfo.get(leafId) as LeafExtended).leafInfo;

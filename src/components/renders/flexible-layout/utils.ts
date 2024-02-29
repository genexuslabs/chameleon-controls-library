/* eslint-disable @typescript-eslint/no-unused-vars */
import { tabTypeToPart } from "../../list/utils";
import {
  FlexibleLayout,
  FlexibleLayoutGroup,
  FlexibleLayoutItem,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeaf,
  FlexibleLayoutLeafInfo,
  FlexibleLayoutLeafType
} from "../../flexible-layout/types";
import { ROOT_VIEW } from "../../../common/utils";

// Aliases
type ItemExtended = FlexibleLayoutItemExtended<
  FlexibleLayoutItem,
  FlexibleLayoutLeafType
>;

type LeafExtended = FlexibleLayoutItemExtended<
  FlexibleLayoutLeaf,
  FlexibleLayoutLeafType
>;

type GroupExtended = FlexibleLayoutItemExtended<
  FlexibleLayoutGroup,
  FlexibleLayoutLeafType
>;

export const createAndSetLeafInfo = (
  flexibleLayoutLeaf: FlexibleLayoutLeaf,
  renderedWidgets: Set<string>
): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType> => {
  const leafId = flexibleLayoutLeaf.id;
  const leafType = flexibleLayoutLeaf.type;

  if (leafType === "single-content") {
    // Mark the widget as rendered
    renderedWidgets.add(leafId);

    return {
      id: leafId,
      type: leafType,
      exportParts: ""
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
  });

  // If there is no widget selected by default, select one
  if (selectedWidgetId == null) {
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
    selectedWidgetId: selectedWidgetId,
    showCaptions: flexibleLayoutLeaf.showCaptions ?? true,
    tabDirection: tabOrientation,
    tabPosition: flexibleLayoutLeaf.tabPosition,
    type: leafType,
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

export const addNewLeafToInfo = (
  leaf: FlexibleLayoutLeaf,
  parentItem: FlexibleLayoutGroup,
  itemsInfo: Map<string, ItemExtended>,
  renderedWidgets: Set<string>
) => {
  const flexibleLeafExtended: LeafExtended = {
    item: leaf,
    parentItem: parentItem,
    leafInfo: createAndSetLeafInfo(leaf, renderedWidgets)
  };

  itemsInfo.set(leaf.id, flexibleLeafExtended);
};

const updateFlexibleSubModels = (
  flexibleLayoutItems: FlexibleLayoutItem[],
  itemsInfo: Map<string, ItemExtended>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>,
  parentItem: FlexibleLayoutGroup
) => {
  flexibleLayoutItems.forEach(flexibleItem => {
    // Group
    if ((flexibleItem as FlexibleLayoutGroup).items != null) {
      const group = flexibleItem as FlexibleLayoutGroup;

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
        group
      );
    }
    // Leaf
    else {
      addNewLeafToInfo(
        flexibleItem as FlexibleLayoutLeaf,
        parentItem,
        itemsInfo,
        renderedWidgets
      );
    }

    // Custom behaviors
    addCustomBehavior(flexibleItem, layoutSplitterParts);
  });
};

export const updateFlexibleModels = (
  flexibleLayout: FlexibleLayout,
  itemsInfo: Map<string, ItemExtended>,
  layoutSplitterParts: Set<string>,
  renderedWidgets: Set<string>
) =>
  updateFlexibleSubModels(
    flexibleLayout.items,
    itemsInfo,
    layoutSplitterParts,
    renderedWidgets,
    ROOT_VIEW // Root item
  );

export const getLeafInfo = (
  itemsInfo: Map<string, ItemExtended>,
  leafId: string
): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType> =>
  (itemsInfo.get(leafId) as LeafExtended).leafInfo;

import {
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionLeaf
} from "../../layout-splitter/types";
import { TabType } from "../../tab/types";
import { tabTypeToPart } from "../../tab/utils";
import {
  FlexibleLayoutDistribution,
  FlexibleLayoutGroup,
  FlexibleLayoutItem,
  FlexibleLayoutLeaf,
  FlexibleLayoutSplitterModel,
  FlexibleLayoutView,
  FlexibleLayoutWidget
} from "../types";

let lastViewId = 0;

export const getViewId = () => `view-${lastViewId++}`;

export const mapWidgetsToView = (
  exportParts: string,
  widgets: FlexibleLayoutWidget[],
  viewsInfo: Map<string, FlexibleLayoutView>,
  renderedWidgets: Set<string>,
  viewType: TabType,
  viewId?: string
): string => {
  // Get a new id for the view
  const actualViewId = viewId ?? getViewId();

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
  viewsInfo.set(actualViewId, {
    renderedWidgets: renderedWidgetsInView,
    exportParts,
    widgets: widgets
  });

  return actualViewId;
};

export const flexibleLayoutDistributionToLayoutSplitter = (
  flexibleLayout: FlexibleLayoutDistribution,
  viewType: TabType,
  viewsInfo: Map<string, FlexibleLayoutView>,
  renderedWidgets: Set<string>
): FlexibleLayoutSplitterModel => {
  const views: Set<string> = new Set();

  const layoutSplitter = getLayoutSplitterItems(
    flexibleLayout.items,
    views,
    viewType,
    viewsInfo,
    renderedWidgets
  );

  return {
    model: {
      direction: flexibleLayout.direction,
      items: layoutSplitter
    },
    views: views
  };
};

function getLayoutSplitterItems(
  flexibleLayoutItems: FlexibleLayoutItem[],
  views: Set<string>,
  viewType: TabType,
  viewsInfo: Map<string, FlexibleLayoutView>,
  renderedWidgets: Set<string>
): LayoutSplitterDistributionItem[] {
  const layoutSplitterItems: LayoutSplitterDistributionItem[] = [];

  flexibleLayoutItems.forEach(item => {
    // Group
    if ((item as FlexibleLayoutGroup).items != null) {
      const splitterGroup: LayoutSplitterDistributionGroup = {
        direction: (item as FlexibleLayoutGroup).direction,
        items: getLayoutSplitterItems(
          (item as FlexibleLayoutGroup).items,
          views,
          viewType,
          viewsInfo,
          renderedWidgets
        ),
        size: (item as FlexibleLayoutGroup).size
      };

      layoutSplitterItems.push(splitterGroup);
    }
    // Leaf
    else {
      const viewId = mapWidgetsToView(
        tabTypeToPart[viewType]((item as FlexibleLayoutLeaf).widgets),
        (item as FlexibleLayoutLeaf).widgets,
        viewsInfo,
        renderedWidgets,
        viewType
      );
      views.add(viewId);

      const splitterLeaf: LayoutSplitterDistributionLeaf = {
        id: viewId,
        size: (item as FlexibleLayoutLeaf).size,
        fixedOffsetSize: (item as FlexibleLayoutLeaf).fixedOffsetSize
      };
      layoutSplitterItems.push(splitterLeaf);
    }
  });

  return layoutSplitterItems;
}

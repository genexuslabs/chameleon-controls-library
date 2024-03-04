import { Component, Method, Prop, Watch, forceUpdate, h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutItem,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeaf,
  FlexibleLayoutRenders,
  FlexibleLayoutLeafInfo,
  ViewItemCloseInfo,
  ViewSelectedItemInfo,
  WidgetReorderInfo,
  FlexibleLayoutViewRemoveResult,
  FlexibleLayoutGroup,
  DroppableArea,
  FlexibleLayoutWidget,
  FlexibleLayoutLeafType
} from "../../flexible-layout/types";
import { ChFlexibleLayoutCustomEvent } from "../../../components";
import { removeElement } from "../../../common/array";
import { addNewLeafToInfo, getLeafInfo, updateFlexibleModels } from "./utils";

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

const GENERATE_GUID = () => {
  let currentDate = new Date().getTime();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    let randomNumber = Math.random() * 16; // random number in range 0 to 16
    randomNumber = (currentDate + randomNumber) % 16 | 0;
    currentDate = Math.floor(currentDate / 16);

    return (c === "x" ? randomNumber : (randomNumber & 0x3) | 0x8).toString(16);
  });
};

@Component({
  shadow: false,
  styleUrl: "flexible-layout-render.scss",
  tag: "ch-flexible-layout-render"
})
export class ChFlexibleLayoutRender {
  /**
   * This Set provides optimizations to not render items that were never
   * shown on the screen.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #renderedWidgets: Set<string> = new Set();

  #widgetsInfo: Map<string, FlexibleLayoutWidget> = new Map();

  #itemsInfo: Map<string, ItemExtended> = new Map();

  #layoutSplitterParts = "";

  // Refs
  #flexibleLayoutRef: HTMLChFlexibleLayoutElement;

  /**
   * A CSS class to set as the `ch-flexible-layout` element class.
   */
  @Prop() readonly cssClass: string = "flexible-layout";

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layout: FlexibleLayout;
  @Watch("layout")
  handleLayoutChange(newLayout: FlexibleLayout) {
    this.#updateFlexibleModels(newLayout);
  }

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly renders: FlexibleLayoutRenders;

  /**
   * Add a view with widgets to render. The view will take the half space of
   * the sibling view that its added with.
   */
  @Method()
  async addSiblingView(
    parentGroup: string,
    siblingItem: string,
    placedInTheSibling: "before" | "after",
    viewInfo: FlexibleLayoutLeaf,
    takeHalfTheSpaceOfTheSiblingItem: boolean
  ): Promise<boolean> {
    const success = await this.#flexibleLayoutRef.addSiblingView(
      parentGroup,
      siblingItem,
      placedInTheSibling,
      viewInfo,
      takeHalfTheSpaceOfTheSiblingItem
    );

    if (!success) {
      return false;
    }

    addNewLeafToInfo(
      viewInfo,
      this.#itemsInfo.get(parentGroup).item as FlexibleLayoutGroup,
      this.#itemsInfo,
      this.#renderedWidgets,
      this.#widgetsInfo
    );

    // Queue re-render
    forceUpdate(this);
    return true;
  }

  /**
   * Removes a view and optionally all its rendered widget from the render.
   * The reserved space will be given to the closest view.
   */
  @Method()
  async removeView(
    leafId: string,
    removeRenderedWidgets: boolean
  ): Promise<FlexibleLayoutViewRemoveResult> {
    const itemInfo = this.#itemsInfo.get(leafId);

    if (!itemInfo) {
      return { success: false, reconnectedSubtree: undefined };
    }
    const leafInfoToRemove = (itemInfo as LeafExtended).leafInfo;

    // The item is not a leaf (it's a group) or is not "tabbed".
    if (
      leafInfoToRemove == null ||
      leafInfoToRemove.type === "single-content"
    ) {
      return { success: false, reconnectedSubtree: undefined };
    }

    const result = await this.#flexibleLayoutRef.removeView(leafId);

    if (!result.success) {
      return result;
    }

    // Update view info, since it got renamed
    const reconnectedSubtree = result.reconnectedSubtree;

    if (reconnectedSubtree) {
      // - - - - - - - - - - - - - - - - - - - - - - - - -
      // INPUT MODEL:
      //                       secondParentItem
      //                              / \
      //                           /       \
      //                        /             \
      //     (Id x) reconnectedSubtree  Other items...
      //                       / \
      //                    /       \
      //                 /             \
      // (Id y) viewToRemoveInfo  (Id z) nodeToRemove
      //                                     / \
      //                                  /       \
      //                              subtree or widgets
      //
      //
      // OUTPUT MODEL:
      //                  secondParentItem
      //                         / \
      //                      /       \
      //                   /             \
      // (Id x) reconnectedSubtree  Other items...
      //                / \
      //             /       \
      //         subtree or widgets
      // - - - - - - - - - - - - - - - - - - - - - - - - -

      const nodeToRemoveUIModel = this.#itemsInfo.get(
        reconnectedSubtree.nodeToRemove
      );

      // The node to reconnect is still a group. We must reconnect its children
      if ((nodeToRemoveUIModel as LeafExtended).leafInfo == null) {
        const itemsOfNodeToRemove = (nodeToRemoveUIModel as GroupExtended).item
          .items;

        const nodeToReconnectUIModel = this.#itemsInfo.get(
          reconnectedSubtree.nodeToReconnect
        ) as GroupExtended;

        // Reconnect the parent of the removedNode subtree
        itemsOfNodeToRemove.forEach(itemToUpdateItsParent => {
          this.#itemsInfo.get(itemToUpdateItsParent.id).parentItem =
            nodeToReconnectUIModel.item;
        });
      }
      // The node to reconnect is a leaf
      else {
        const nodeToReconnectUIModel = this.#itemsInfo.get(
          reconnectedSubtree.nodeToReconnect
        ) as LeafExtended;

        // Add view information
        nodeToReconnectUIModel.leafInfo = (
          nodeToRemoveUIModel as LeafExtended
        ).leafInfo;

        // Update view id
        nodeToReconnectUIModel.leafInfo.id = reconnectedSubtree.nodeToReconnect;
      }

      // Delete the old item
      this.#itemsInfo.delete(reconnectedSubtree.nodeToRemove);
    }

    // Remove rendered widgets
    if (removeRenderedWidgets) {
      leafInfoToRemove.widgets.forEach(widget => {
        this.#renderedWidgets.delete(widget.id);
      });
    }

    // Delete the view
    this.#itemsInfo.delete(leafId);

    // Queue re-renders
    forceUpdate(this);
    return result;
  }

  #updateFlexibleModels = (layout: FlexibleLayout) => {
    // Empty layout
    if (layout == null) {
      return;
    }

    const layoutSplitterPartsSet: Set<string> = new Set();

    updateFlexibleModels(
      layout,
      this.#itemsInfo,
      layoutSplitterPartsSet,
      this.#renderedWidgets,
      this.#widgetsInfo
    );

    this.#layoutSplitterParts = [...layoutSplitterPartsSet.values()].join(",");
  };

  #getLeafInfo = (
    leafId: string
  ): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType> =>
    getLeafInfo(this.#itemsInfo, leafId);

  #handleLeafSelectedWidgetChange = (
    event: ChFlexibleLayoutCustomEvent<ViewSelectedItemInfo>
  ) => {
    event.stopPropagation();

    const selectedItemInfo = event.detail;
    const leafInfo = this.#getLeafInfo(
      selectedItemInfo.viewId
    ) as FlexibleLayoutLeafInfo<"tabbed">;

    // Mark the item as rendered
    this.#renderedWidgets.add(selectedItemInfo.newSelectedId);

    // Mark the item as rendered
    const newSelectedItem = leafInfo.widgets[selectedItemInfo.newSelectedIndex];
    newSelectedItem.wasRendered = true;

    // Select the new item
    this.#updateSelectedWidget(leafInfo, selectedItemInfo.newSelectedId);

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  };

  #handleLeafWidgetClose = (
    event: ChFlexibleLayoutCustomEvent<ViewItemCloseInfo>
  ) => {
    event.stopPropagation();

    const itemCloseInfo = event.detail;
    const viewInfo = this.#getLeafInfo(
      itemCloseInfo.viewId
    ) as FlexibleLayoutLeafInfo<"tabbed">;

    // Last item from the view. Destroy the view and adjust the layout
    if (viewInfo.widgets.length === 1) {
      this.removeView(viewInfo.id, true);
      return;
    }

    const viewWidgets = viewInfo.widgets;
    const widgetsCount = viewWidgets.length;
    const itemIndex = itemCloseInfo.itemIndex;
    const itemUIModel = viewWidgets[itemIndex];

    // If the item was selected, select another item
    if (itemUIModel.id === viewInfo.selectedWidgetId) {
      const newSelectedItem =
        itemIndex === widgetsCount - 1 // If it's the last item
          ? viewWidgets[widgetsCount - 2] // Select the previous
          : viewWidgets[itemIndex + 1]; // Otherwise, select the next

      this.#renderedWidgets.add(newSelectedItem.id);

      // Mark the item as selected and rendered
      this.#updateSelectedWidget(viewInfo, newSelectedItem.id);
      newSelectedItem.wasRendered = true;
    }

    this.#removeWidget(viewInfo, itemIndex);

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  };

  #removeWidget = (
    viewInfo: FlexibleLayoutLeafInfo<"tabbed">,
    itemIndex: number,
    skipRenderRemoval = false
  ) => {
    // Remove the item from the view
    const itemUIModel = removeElement(viewInfo.widgets, itemIndex);
    this.#flexibleLayoutRef.removeItemPageInView(viewInfo.id, itemUIModel.id);

    // Remove the item from the flexible-layout-render to optimize resources
    if (itemUIModel.conserveRenderState !== true && !skipRenderRemoval) {
      this.#renderedWidgets.delete(itemUIModel.id);
      this.#widgetsInfo.delete(itemUIModel.id);

      // TODO: Remove item in this.layout???
    }
  };

  #updateSelectedWidget = (
    leafInfo: FlexibleLayoutLeafInfo<"tabbed">,
    selectedId: string
  ) => {
    leafInfo.selectedWidgetId = selectedId;
  };

  /**
   * This handler can only be triggered by "tabbed" leafs.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #handleLeafWidgetReorder = async (
    event: ChFlexibleLayoutCustomEvent<WidgetReorderInfo>
  ) => {
    const reorderInfo = event.detail;
    const leafId = reorderInfo.viewId;
    const viewIdTarget = reorderInfo.viewIdTarget;
    const dropAreaTarget = reorderInfo.dropAreaTarget;

    const leafInfo = this.#getLeafInfo(
      leafId
    ) as FlexibleLayoutLeafInfo<"tabbed">;

    // Dropping in the same view. Nothing to change
    if (
      leafId === viewIdTarget &&
      (dropAreaTarget === "center" || leafInfo.widgets.length === 1)
    ) {
      return;
    }

    const viewTargetInfo = this.#getLeafInfo(
      viewIdTarget
    ) as FlexibleLayoutLeafInfo<"tabbed">;
    const widgetIndex = reorderInfo.index;
    const widgetToMove = leafInfo.widgets[widgetIndex];

    // Mark the item as rendered, because the drag does not have to trigger item
    // selection (which trigger item rendering)
    this.#renderedWidgets.add(widgetToMove.id);
    widgetToMove.wasRendered = true;

    // The drop does not create a new view
    if (dropAreaTarget === "center") {
      viewTargetInfo.widgets.push(widgetToMove);

      // Update the selected widget in the target view
      this.#updateSelectedWidget(viewTargetInfo, widgetToMove.id);
    } else {
      await this.#handleViewItemReorderCreateView(
        widgetToMove,
        viewTargetInfo,
        dropAreaTarget
      );
    }

    // Remove the view, since it has no more items
    if (leafInfo.widgets.length === 1) {
      await this.removeView(leafId, false);

      // Refresh reference to force re-render
      // this.#layoutSplitterModels = { ...this.#layoutSplitterModels }; // TODO: UPDATE THIS
    }
    // Remove the item in the view that belongs
    else {
      // Select the previous item if the removed item was selected
      if (leafInfo.selectedWidgetId === widgetToMove.id) {
        const newSelectedIndex = widgetIndex === 0 ? 1 : widgetIndex - 1;
        const newSelectedItem = leafInfo.widgets[newSelectedIndex];

        // Mark the item as rendered
        this.#renderedWidgets.add(newSelectedItem.id);
        newSelectedItem.wasRendered = true;

        // Mark the item as selected
        this.#updateSelectedWidget(leafInfo, newSelectedItem.id);
      }

      // Remove the item from the view
      this.#removeWidget(leafInfo, widgetIndex, true);

      // Queue re-renders
      forceUpdate(this); // Update rendered items
      // forceUpdate(this.#flexibleLayoutRef);
    }

    // this.#flexibleLayoutRef.refreshLayout();
  };

  #handleViewItemReorderCreateView = async (
    widget: FlexibleLayoutWidget,
    viewTargetInfo: FlexibleLayoutLeafInfo<"tabbed">,
    dropAreaTarget: DroppableArea
  ) => {
    // Implementation note: If the direction matches the dropAreaTarget
    // (for example, dropAreaTarget === "block-start" and parent direction === "row")
    // we can use addSiblingView

    // const viewUIModel = this.#itemsInfo.get(
    //   viewId
    // ) as FlexibleLayoutItemExtended<FlexibleLayoutLeaf>;
    const viewTargetUIModel = this.#itemsInfo.get(
      viewTargetInfo.id
    ) as FlexibleLayoutItemExtended<FlexibleLayoutLeaf, "tabbed">;
    const viewTargetParentInfo = viewTargetUIModel.parentItem; // TODO: CHECK FOR ROOT NODE <------------------

    const newLeafToAddId = GENERATE_GUID();
    const newLeafToAdd: FlexibleLayoutLeaf = {
      id: newLeafToAddId,
      selectedWidgetId: widget.id,
      size: undefined,
      tabDirection: viewTargetUIModel.leafInfo.tabDirection,
      type: "tabbed",
      widgets: [widget],
      dragBar: {
        size: viewTargetUIModel.item.dragBar?.size,
        part: viewTargetUIModel.item.dragBar?.part // TODO: IMPROVE THIS
      }
    };

    const viewTargetIsContainedInAGroupWithTheSameDirection =
      (viewTargetParentInfo.direction === "rows" &&
        (dropAreaTarget === "block-start" || dropAreaTarget === "block-end")) ||
      (viewTargetParentInfo.direction === "columns" &&
        (dropAreaTarget === "inline-start" || dropAreaTarget === "inline-end"));

    // Add a sibling
    if (viewTargetIsContainedInAGroupWithTheSameDirection) {
      await this.addSiblingView(
        viewTargetParentInfo.id,
        viewTargetInfo.id,
        dropAreaTarget === "block-start" || dropAreaTarget === "inline-start"
          ? "before"
          : "after",
        newLeafToAdd,
        true
      );
    }

    // The current target must be modified to be a group
    else {
      // TODO: Add implementation
    }

    // VERIFY THE PARENT NODE
    // HANDLE NEW VIEW CREATION
    // CHECK IF THE PREVIOUS VIEW HAS ONLY ONE ITEM TO REUSE ITS VIEW ID?
  };

  #renderWidget = (widgetId: string) => {
    const widgetInfo = this.#widgetsInfo.get(widgetId);

    return (
      <div
        key={widgetId}
        slot={widgetId}
        class="ch-flexible-layout-render-slot"
      >
        {this.renders[widgetInfo.renderId ?? widgetId](widgetInfo)}
      </div>
    );
  };

  componentWillLoad() {
    this.#updateFlexibleModels(this.layout);
  }

  render() {
    // Check render against the "layout" property
    if (this.layout == null) {
      return "";
    }

    return (
      <ch-flexible-layout
        class={this.cssClass || null}
        layout={this.layout}
        layoutSplitterParts={this.#layoutSplitterParts}
        itemsInfo={this.#itemsInfo}
        onViewItemClose={this.#handleLeafWidgetClose}
        onViewItemReorder={this.#handleLeafWidgetReorder}
        onSelectedViewItemChange={this.#handleLeafSelectedWidgetChange}
        ref={el => (this.#flexibleLayoutRef = el)}
      >
        {[...this.#renderedWidgets.values()].map(this.#renderWidget)}
      </ch-flexible-layout>
    );
  }
}

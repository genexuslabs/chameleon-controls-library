import {
  Component,
  Event,
  EventEmitter,
  Method,
  Prop,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import {
  FlexibleLayoutModel,
  FlexibleLayoutItemModel,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeafModel,
  FlexibleLayoutRenders,
  FlexibleLayoutLeafInfo,
  ViewItemCloseInfo,
  ViewSelectedItemInfo,
  WidgetReorderInfo,
  FlexibleLayoutViewRemoveResult,
  FlexibleLayoutGroupModel,
  DroppableArea,
  FlexibleLayoutWidget,
  FlexibleLayoutLeafType,
  FlexibleLayoutWidgetExtended,
  FlexibleLayoutWidgetCloseInfo,
  FlexibleLayoutLeafConfigurationTabbed
} from "./internal/flexible-layout/types";
import { ChFlexibleLayoutCustomEvent } from "../../components";
import { removeElement } from "../../common/array";
import { addNewLeafToInfo, getLeafInfo, updateFlexibleModels } from "./utils";
import { CssContainProperty, CssOverflowProperty } from "../../common/types";

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

  #widgetsInfo: Map<string, FlexibleLayoutWidgetExtended> = new Map();

  #itemsInfo: Map<string, ItemExtended> = new Map();

  #layoutSplitterParts = "";

  // Refs
  #flexibleLayoutRef: HTMLChFlexibleLayoutElement;

  /**
   * Same as the contain CSS property. This property indicates that an widget
   * and its contents are, as much as possible, independent from the rest of the
   * document tree. Containment enables isolating a subsection of the DOM,
   * providing performance benefits by limiting calculations of layout, style,
   * paint, size, or any combination to a DOM subtree rather than the entire
   * page.
   * Containment can also be used to scope CSS counters and quotes.
   */
  @Prop() readonly contain: CssContainProperty = "none";

  /**
   * A CSS class to set as the `ch-flexible-layout` element class.
   */
  @Prop() readonly cssClass: string = "flexible-layout";

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly model: FlexibleLayoutModel;
  @Watch("model")
  modelChanged(newModel: FlexibleLayoutModel) {
    this.#updateFlexibleModels(newModel);
  }

  /**
   * Same as the overflow CSS property. This property sets the desired behavior
   * when content does not fit in the widget's padding box (overflows) in the
   * horizontal and/or vertical direction.
   */
  @Prop() readonly overflowBehavior:
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}` = "visible";

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly renders: FlexibleLayoutRenders;

  /**
   * Emitted when the user pressed the close button in a widget.
   */
  @Event() widgetClose: EventEmitter<FlexibleLayoutWidgetCloseInfo>;

  /**
   * Add a view with widgets to render. The view will take the half space of
   * the sibling view that its added with.
   */
  @Method()
  async addSiblingView(
    parentGroup: string,
    siblingItem: string,
    placedInTheSibling: "before" | "after",
    viewInfo: FlexibleLayoutLeafModel,
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
      this.#itemsInfo.get(parentGroup).item as FlexibleLayoutGroupModel,
      this.#itemsInfo,
      this.#renderedWidgets,
      this.#widgetsInfo
    );

    // Queue re-render
    forceUpdate(this);
    return true;
  }

  /**
   * Add a widget in a `"tabbed"` type leaf.
   * Only works if the parent leaf is `"tabbed"` type.
   * If a widget with the same ID already exists, this method has not effect.
   *
   * To add a widget in a `"single-content"` type leaf, use the
   * `addSiblingView` method.
   */
  @Method()
  async addWidget(
    leafId: string,
    widget: FlexibleLayoutWidget,
    selectWidget = true
  ) {
    const leafUIModel = this.#itemsInfo.get(leafId) as LeafExtended;

    if (
      !leafUIModel ||
      leafUIModel.leafInfo == null ||
      leafUIModel.leafInfo.type === "single-content" ||
      this.#widgetsInfo.has(widget.id)
    ) {
      return;
    }

    leafUIModel.leafInfo.widgets.push(widget);
    this.#widgetsInfo.set(widget.id, { parentLeafId: leafId, info: widget });

    if (selectWidget) {
      this.#updateSelectedWidget(leafUIModel.leafInfo, widget);

      // Queue re-renders
      forceUpdate(this);
      forceUpdate(this.#flexibleLayoutRef);
    } else {
      // Queue re-render for the specific leaf
      this.#flexibleLayoutRef.refreshLeaf(leafId);
    }
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

    // The leaf didn't exist
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
      //        (Id x) nodeToReconnect  Other items...
      //                       / \
      //                    /       \
      //                 /             \
      // (Id y) leafInfoToRemove  (Id z) nodeToRemove
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
      //    (Id x) nodeToReconnect  Other items...
      //                / \
      //             /       \
      //         subtree or widgets
      // - - - - - - - - - - - - - - - - - - - - - - - - -

      const nodeToRemoveUIModel = this.#itemsInfo.get(
        reconnectedSubtree.nodeToRemove
      );

      // The node to reconnect is still a group (since the nodeToRemove is a group).
      // We must reconnect the nodeToRemove's children
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
      // The node to reconnect is a leaf, since the nodeToRemove is a leaf
      else {
        const nodeToReconnectUIModel = this.#itemsInfo.get(
          reconnectedSubtree.nodeToReconnect
        ) as LeafExtended;

        // Add leaf information
        nodeToReconnectUIModel.leafInfo = (
          nodeToRemoveUIModel as LeafExtended
        ).leafInfo;
        const nodeToReconnectLeafInfo = nodeToReconnectUIModel.leafInfo;

        // Update leaf id
        nodeToReconnectLeafInfo.id = reconnectedSubtree.nodeToReconnect;

        const widgetsToUpdateParentLeafId: FlexibleLayoutWidget[] =
          nodeToReconnectLeafInfo.type === "single-content"
            ? [nodeToReconnectLeafInfo.widget]
            : nodeToReconnectLeafInfo.widgets;

        // Update the parent leaf id in the reconnected widgets
        widgetsToUpdateParentLeafId.forEach(widget => {
          const widgetUIModel = this.#widgetsInfo.get(widget.id);
          widgetUIModel.parentLeafId = nodeToReconnectLeafInfo.id;
        });
      }

      // Delete the old item
      this.#itemsInfo.delete(reconnectedSubtree.nodeToRemove);
    }

    // Remove rendered widgets
    if (removeRenderedWidgets) {
      leafInfoToRemove.widgets.forEach(this.#deleteRenderedWidget);
    }

    // Delete the view
    this.#itemsInfo.delete(leafId);

    // Queue re-renders
    forceUpdate(this);
    return result;
  }

  /**
   * Remove a widget from a `"tabbed"` type leaf.
   * Only works if the parent leaf is `"tabbed"` type.
   *
   * To remove a widget from a `"single-content"` type leaf, use the
   * `removeView` method.
   */
  @Method()
  async removeWidget(widgetId: string) {
    const widgetUIModel = this.#widgetsInfo.get(widgetId);

    if (!widgetUIModel) {
      return;
    }
    const leafInfo = this.#getLeafInfo(widgetUIModel.parentLeafId);

    if (leafInfo.type === "single-content") {
      return;
    }

    this.#checkViewStateToRemoveWidget(
      leafInfo,
      widgetUIModel.info,
      leafInfo.widgets.findIndex(widget => widget.id === widgetId) // Find the index of the widget
    );
  }

  /**
   * Update the selected widget from a `"tabbed"` type leaf.
   * Only works if the parent leaf is `"tabbed"` type.
   */
  @Method()
  async updateSelectedWidget(
    parentLeafId: string,
    newSelectedWidgetId: string
  ) {
    const widgetUIModel = this.#widgetsInfo.get(newSelectedWidgetId);

    if (!widgetUIModel || widgetUIModel.parentLeafId !== parentLeafId) {
      return;
    }
    const parentLeafInfo = this.#getLeafInfo(widgetUIModel.parentLeafId);

    if (
      parentLeafInfo.type === "single-content" ||
      parentLeafInfo.selectedWidgetId === newSelectedWidgetId
    ) {
      return;
    }

    // Select the new item
    this.#updateSelectedWidget(parentLeafInfo, widgetUIModel.info);

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  }

  /**
   * Given the viewId, it updates the info of the view if the view is a leaf.
   * The `type` of the properties argument must match the `type` of the view to
   * update.
   */
  @Method()
  async updateViewInfo(
    viewId: string,
    // TODO: Add support to update sticky at runtime
    properties: Partial<
      Omit<
        FlexibleLayoutLeafConfigurationTabbed,
        "selectedWidgetId" | "widget" | "widgets"
      >
    >
  ) {
    const viewUIModel = this.#itemsInfo.get(viewId) as LeafExtended;

    if (
      !viewUIModel ||
      !viewUIModel.leafInfo ||
      viewUIModel.item.type !== properties.type
    ) {
      return;
    }

    for (const key in properties) {
      // TODO: Avoid property duplication. Share the memory between the
      // `leafInfo` member and the `item` member
      viewUIModel.item[key] = properties[key];
      viewUIModel.leafInfo[key] = properties[key];
    }

    // Queue re-renders
    forceUpdate(this);
    this.#flexibleLayoutRef.refreshLeaf(viewUIModel.item.id);
  }

  /**
   * Update the widget info.
   */
  @Method()
  async updateWidgetInfo(
    widgetId: string,
    properties: Partial<Omit<FlexibleLayoutWidget, "id" | "wasRendered">>
  ) {
    const widgetUIModel = this.#widgetsInfo.get(widgetId);

    if (!widgetUIModel) {
      return;
    }
    const widgetInfo = widgetUIModel.info;

    Object.entries(properties).forEach(([key, value]) => {
      widgetInfo[key] = value;
    });

    // Queue re-renders
    forceUpdate(this);
    this.#flexibleLayoutRef.refreshLeaf(widgetUIModel.parentLeafId);
  }

  #updateFlexibleModels = (layout: FlexibleLayoutModel) => {
    // Partially delete the previous state
    this.#itemsInfo.clear();
    this.#widgetsInfo.clear();

    // Empty layout
    if (layout == null) {
      this.#renderedWidgets.clear();
      return;
    }

    const layoutSplitterPartsSet: Set<string> = new Set();
    const newRenderedWidgets: Set<string> = new Set(); // Temporal Set to store the new rendered widgets

    updateFlexibleModels(
      layout,
      this.#itemsInfo,
      layoutSplitterPartsSet,
      newRenderedWidgets,
      this.#widgetsInfo
    );

    // Add the previous rendered widgets if they are still in the new layout
    this.#widgetsInfo.forEach(widget => {
      if (this.#renderedWidgets.has(widget.info.id)) {
        newRenderedWidgets.add(widget.info.id);
      }
    });

    this.#renderedWidgets = newRenderedWidgets;
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
    const newSelectedItem = leafInfo.widgets[selectedItemInfo.newSelectedIndex];

    // Select the new item
    this.#updateSelectedWidget(leafInfo, newSelectedItem);

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  };

  #handleLeafWidgetClose = (
    event: ChFlexibleLayoutCustomEvent<ViewItemCloseInfo>
  ) => {
    event.stopPropagation();
    const itemCloseInfo = event.detail;

    const eventInfo = this.widgetClose.emit({
      widgetId: itemCloseInfo.itemId,
      viewId: itemCloseInfo.viewId
    });

    if (eventInfo.defaultPrevented) {
      event.preventDefault();
      return;
    }

    const viewInfo = this.#getLeafInfo(
      itemCloseInfo.viewId
    ) as FlexibleLayoutLeafInfo<"tabbed">;

    const widgetIndex = itemCloseInfo.itemIndex;
    const widgetInfo = viewInfo.widgets[widgetIndex];

    this.#checkViewStateToRemoveWidget(viewInfo, widgetInfo, widgetIndex);
  };

  #checkViewStateToRemoveWidget = (
    viewInfo: FlexibleLayoutLeafInfo<"tabbed">,
    widgetInfo: FlexibleLayoutWidget,
    widgetIndex: number
  ) => {
    // Last item from the view. Destroy the view and adjust the layout
    if (viewInfo.widgets.length === 1) {
      this.removeView(viewInfo.id, true);
      return;
    }

    const viewWidgets = viewInfo.widgets;
    const widgetsCount = viewInfo.widgets.length;

    // If the item was selected, select another item
    if (widgetInfo.id === viewInfo.selectedWidgetId) {
      const newSelectedItem =
        widgetIndex === widgetsCount - 1 // If it's the last item
          ? viewWidgets[widgetsCount - 2] // Select the previous
          : viewWidgets[widgetIndex + 1]; // Otherwise, select the next

      // Mark the item as selected and rendered
      this.#updateSelectedWidget(viewInfo, newSelectedItem);
    }

    this.#removeWidget(viewInfo, widgetIndex);

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  };

  /**
   * @param skipRenderRemoval Useful to determine if the render of the widget must not be destroyed.
   * Used when the widget of the leaf must be reconnected in another parent
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #removeWidget = (
    leafInfo: FlexibleLayoutLeafInfo<"tabbed">,
    itemIndex: number,
    skipRenderRemoval = false
  ) => {
    // Remove the item from the view
    const widgetInfo = removeElement(leafInfo.widgets, itemIndex);
    this.#flexibleLayoutRef.removeItemPageInView(leafInfo.id, widgetInfo.id);

    // Remove the item from the flexible-layout-render to optimize resources
    if (!skipRenderRemoval) {
      this.#deleteRenderedWidget(widgetInfo);
    }
  };

  #deleteRenderedWidget = (widgetInfo: FlexibleLayoutWidget) => {
    if (widgetInfo.conserveRenderState === true) {
      return;
    }

    // Remove the item from the flexible-layout-render to optimize resources
    this.#renderedWidgets.delete(widgetInfo.id);
    this.#widgetsInfo.delete(widgetInfo.id);
  };

  #updateSelectedWidget = (
    leafInfo: FlexibleLayoutLeafInfo<"tabbed">,
    widget: FlexibleLayoutWidget
  ) => {
    // Mark the item as rendered
    this.#renderedWidgets.add(widget.id);

    // Mark the item as rendered
    widget.wasRendered = true;

    const leafUIModel = this.#itemsInfo.get(leafInfo.id)
      .item as FlexibleLayoutLeafConfigurationTabbed;

    // TODO: This is a WA to fix the selectedWidgetId update. The leafInfo
    // member should share memory with the leaf to avoid these issues
    leafUIModel.selectedWidgetId = widget.id;

    leafInfo.selectedWidgetId = widget.id;
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
    const leafIdTarget = reorderInfo.viewIdTarget;
    const dropAreaTarget = reorderInfo.dropAreaTarget;

    const leafInfo = this.#getLeafInfo(
      leafId
    ) as FlexibleLayoutLeafInfo<"tabbed">;

    // Dropping in the same view. Nothing to change
    if (
      leafId === leafIdTarget &&
      (dropAreaTarget === "center" || leafInfo.widgets.length === 1)
    ) {
      return;
    }

    const leafTargetInfo = this.#getLeafInfo(
      leafIdTarget
    ) as FlexibleLayoutLeafInfo<"tabbed">;
    const widgetIndex = reorderInfo.index;
    const widgetToMove = leafInfo.widgets[widgetIndex];

    // Update parent leaf id in the widget to move
    this.#widgetsInfo.get(widgetToMove.id).parentLeafId = leafIdTarget;

    // Mark the item as rendered, because the drag does not have to trigger item
    // selection (which trigger item rendering)
    this.#renderedWidgets.add(widgetToMove.id);
    widgetToMove.wasRendered = true;

    // The drop does not create a new view
    if (dropAreaTarget === "center") {
      leafTargetInfo.widgets.push(widgetToMove);

      // Update the selected widget in the target view
      this.#updateSelectedWidget(leafTargetInfo, widgetToMove);
    } else {
      await this.#handleViewItemReorderCreateView(
        widgetToMove,
        leafTargetInfo,
        dropAreaTarget
      );
    }

    // Remove the view, since it has no more items, but don't destroy the
    // render of the widget, since the widget is only moved
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

        // Mark the item as selected and rendered
        this.#updateSelectedWidget(leafInfo, newSelectedItem);
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
    ) as FlexibleLayoutItemExtended<FlexibleLayoutLeafModel, "tabbed">;
    const viewTargetParentInfo = viewTargetUIModel.parentItem; // TODO: CHECK FOR ROOT NODE <------------------

    const newLeafToAddId = GENERATE_GUID();
    const newLeafToAdd: FlexibleLayoutLeafModel = {
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
    const widgetInfo = this.#widgetsInfo.get(widgetId).info;
    const widgetRender = this.renders[widgetInfo.renderId ?? widgetId];

    if (!widgetRender) {
      console.error(
        `Could not find a render for the "${widgetId}" widget. The render "${
          widgetInfo.renderId ?? widgetId
        }" does not exists in the "renders" property.`
      );
      return;
    }

    return widgetInfo.addWrapper ? (
      <div
        key={widgetId}
        slot={widgetId}
        class="ch-flexible-layout-render-slot"
      >
        {widgetRender(widgetInfo)}
      </div>
    ) : (
      widgetRender(widgetInfo)
    );
  };

  componentWillLoad() {
    this.#updateFlexibleModels(this.model);
  }

  render() {
    // Check render against the "layout" property
    if (this.model == null) {
      return "";
    }

    return (
      <ch-flexible-layout
        contain={this.contain}
        class={this.cssClass || null}
        model={this.model}
        layoutSplitterParts={this.#layoutSplitterParts}
        itemsInfo={this.#itemsInfo}
        overflowBehavior={this.overflowBehavior}
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

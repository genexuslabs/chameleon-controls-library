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
  FlexibleLayoutViewRemoveResult
} from "../../flexible-layout/types";
import { ChFlexibleLayoutCustomEvent } from "../../../components";
import { removeElement } from "../../../common/array";
import { getViewInfo, updateFlexibleModels } from "./utils";

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

  #blockStartWidgets: Set<string> = new Set();

  #itemsInfo: Map<string, FlexibleLayoutItemExtended<FlexibleLayoutItem>> =
    new Map();

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
   * Removes a view and optionally all its rendered widget from the render.
   * The reserved space will be given to the closest view.
   */
  @Method()
  async removeView(
    viewId: string,
    removeRenderedWidgets: boolean
  ): Promise<FlexibleLayoutViewRemoveResult> {
    const itemInfo = this.#itemsInfo.get(viewId);

    if (!itemInfo) {
      return { success: false, renamedItems: [] };
    }
    const viewInfo = (
      itemInfo as FlexibleLayoutItemExtended<FlexibleLayoutLeaf>
    ).view;

    // The item is not a view (leaf). It's a group.
    if (viewInfo == null) {
      return { success: false, renamedItems: [] };
    }

    const success = await this.#flexibleLayoutRef.removeView(viewId);

    if (!success) {
      return { success: false, renamedItems: [] };
    }

    // Update view info, since it got renamed
    const renamedItems = success.renamedItems;
    renamedItems.forEach(renamedItem => {
      const oldItemUIModel = this.#itemsInfo.get(
        renamedItem.oldId
      ) as FlexibleLayoutItemExtended<FlexibleLayoutLeaf>;

      if (oldItemUIModel.view != null) {
        const newItemUIModel = this.#itemsInfo.get(
          renamedItem.newId
        ) as FlexibleLayoutItemExtended<FlexibleLayoutLeaf>;

        // Add view information
        newItemUIModel.view = oldItemUIModel.view;

        // Update view id
        newItemUIModel.view.id = renamedItem.newId;
      }

      // Delete the old item
      this.#itemsInfo.delete(renamedItem.oldId);
    });

    // console.log(this.#itemsInfo);

    // Remove rendered widgets
    if (removeRenderedWidgets) {
      viewInfo.widgets.forEach(widget => {
        this.#renderedWidgets.delete(widget.id);
      });
    }

    // Delete the view
    this.#itemsInfo.delete(viewId);

    // Queue re-renders
    forceUpdate(this);
    return success;
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
      this.#blockStartWidgets,
      layoutSplitterPartsSet,
      this.#renderedWidgets
    );

    this.#layoutSplitterParts = [...layoutSplitterPartsSet.values()].join(",");
  };

  #getViewInfo = (viewId: string) => getViewInfo(this.#itemsInfo, viewId);

  #handleViewItemChange = (
    event: ChFlexibleLayoutCustomEvent<ViewSelectedItemInfo>
  ) => {
    event.stopPropagation();

    const selectedItemInfo = event.detail;
    const viewInfo = this.#getViewInfo(selectedItemInfo.viewId);

    // Mark the item as rendered
    this.#renderedWidgets.add(selectedItemInfo.newSelectedId);

    // Mark the item as rendered
    const newSelectedItem = viewInfo.widgets[selectedItemInfo.newSelectedIndex];
    newSelectedItem.wasRendered = true;

    // Select the new item
    this.#updateSelectedWidget(viewInfo, selectedItemInfo.newSelectedId);

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  };

  #handleViewItemClose = (
    event: ChFlexibleLayoutCustomEvent<ViewItemCloseInfo>
  ) => {
    event.stopPropagation();

    const itemCloseInfo = event.detail;
    const viewInfo = this.#getViewInfo(itemCloseInfo.viewId);

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
    viewInfo: FlexibleLayoutLeafInfo,
    itemIndex: number,
    skipRenderRemoval = false
  ) => {
    // Remove the item from the view
    const itemUIModel = removeElement(viewInfo.widgets, itemIndex);
    this.#flexibleLayoutRef.removeItemPageInView(viewInfo.id, itemUIModel.id);

    // Remove the item from the flexible-layout-render to optimize resources
    if (itemUIModel.conserveRenderState !== true && !skipRenderRemoval) {
      this.#renderedWidgets.delete(itemUIModel.id);

      // TODO: Remove item in this.layout???
    }
  };

  #updateSelectedWidget = (
    viewInfo: FlexibleLayoutLeafInfo,
    selectedId: string
  ) => {
    viewInfo.selectedWidgetId = selectedId;
  };

  #handleViewItemReorder = (
    event: ChFlexibleLayoutCustomEvent<WidgetReorderInfo>
  ) => {
    const reorderInfo = event.detail;
    const viewId = reorderInfo.viewId;
    const viewIdTarget = reorderInfo.viewIdTarget;
    const dropAreaTarget = reorderInfo.dropAreaTarget;

    const viewInfo = this.#getViewInfo(viewId);

    // Dropping in the same view. Nothing to change
    if (
      viewId === viewIdTarget &&
      (dropAreaTarget === "center" || viewInfo.widgets.length === 1)
    ) {
      return;
    }

    const viewTargetInfo = this.#getViewInfo(viewIdTarget);
    const itemIndex = reorderInfo.index;
    const itemInfo = viewInfo.widgets[itemIndex];

    // Mark the item as rendered, because the drag does not have to trigger item
    // selection (which trigger item rendering)
    this.#renderedWidgets.add(itemInfo.id);
    itemInfo.wasRendered = true;

    // Update the selected widget in the target view
    this.#updateSelectedWidget(viewTargetInfo, itemInfo.id);

    // The drop does not create a new view
    if (dropAreaTarget === "center") {
      viewTargetInfo.widgets.push(itemInfo);
    } else {
      // HANDLE NEW VIEW CREATION
      // CHECK IF THE PREVIOUS VIEW HAS ONLY ONE ITEM TO REUSE ITS VIEW ID?
    }

    // Remove the view, since it has no more items
    if (viewInfo.widgets.length === 1) {
      this.removeView(viewId, false);

      // Refresh reference to force re-render
      // this.#layoutSplitterModels = { ...this.#layoutSplitterModels }; // TODO: UPDATE THIS
    }
    // Remove the item in the view that belongs
    else {
      // Select the previous item if the remove item was selected
      if (viewInfo.selectedWidgetId === itemInfo.id) {
        const newSelectedIndex = itemIndex === 0 ? 1 : itemIndex - 1;
        const newSelectedItem = viewInfo.widgets[newSelectedIndex];

        // Mark the item as rendered
        this.#renderedWidgets.add(newSelectedItem.id);
        newSelectedItem.wasRendered = true;

        // Mark the item as selected
        this.#updateSelectedWidget(viewInfo, newSelectedItem.id);
      }

      // TODO: UPDATE THE SELECTED INTERNAL INDEX IN THE TAB ???
      // Remove the item from the view
      this.#removeWidget(viewInfo, itemIndex, true);
    }

    // Queue re-renders
    // forceUpdate(this);
    // this.#flexibleLayoutRef.refreshLayout();
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
        layoutModel={this.layout}
        layoutSplitterParts={this.#layoutSplitterParts}
        itemsInfo={this.#itemsInfo}
        onViewItemClose={this.#handleViewItemClose}
        onViewItemReorder={this.#handleViewItemReorder}
        onSelectedViewItemChange={this.#handleViewItemChange}
        ref={el => (this.#flexibleLayoutRef = el)}
      >
        {[...this.#blockStartWidgets].map(widgetId => this.renders[widgetId]())}

        {[...this.#renderedWidgets.values()].map(widget => (
          <div
            key={widget}
            slot={widget}
            class="ch-flexible-layout-render-slot"
          >
            {this.renders[widget]()}
          </div>
        ))}
      </ch-flexible-layout>
    );
  }
}

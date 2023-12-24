import { Component, Prop, Watch, forceUpdate, h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutRenders,
  FlexibleLayoutView,
  ViewItemCloseInfo,
  ViewSelectedItemInfo
} from "../../flexible-layout/types";
import { getLayoutModel } from "../../flexible-layout/flexible-layout/utils";
import { ChFlexibleLayoutCustomEvent } from "../../../components";
import { LayoutSplitterDistribution } from "../../layout-splitter/types";
import { removeElement } from "../../../common/array";

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
  private renderedWidgets: Set<string> = new Set();

  private blockStartWidgets: Set<string> = new Set();

  private viewsInfo: Map<string, FlexibleLayoutView> = new Map();

  private layoutSplitterModels: LayoutSplitterDistribution;

  private layoutSplitterParts = "";

  // Refs
  private flexibleLayoutRef: HTMLChFlexibleLayoutElement;

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
    this.setLayoutSplitterModels(newLayout);
  }

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly renders: FlexibleLayoutRenders;

  private setLayoutSplitterModels(layout: FlexibleLayout) {
    // Empty layout
    if (layout == null) {
      // Reset layout
      this.layoutSplitterModels = { direction: "columns", items: [] };

      return;
    }

    const layoutSplitterPartsSet: Set<string> = new Set();

    this.layoutSplitterModels = getLayoutModel(
      layout,
      this.viewsInfo,
      this.blockStartWidgets,
      layoutSplitterPartsSet,
      this.renderedWidgets
    );

    this.layoutSplitterParts = [...layoutSplitterPartsSet.values()].join(",");
  }

  private handleViewItemChange = (
    event: ChFlexibleLayoutCustomEvent<ViewSelectedItemInfo>
  ) => {
    event.stopPropagation();

    const selectedItemInfo = event.detail;
    const viewInfo = this.viewsInfo.get(selectedItemInfo.viewId);

    // Mark the item as rendered
    this.renderedWidgets.add(selectedItemInfo.newSelectedId);
    viewInfo.renderedWidgets.add(selectedItemInfo.newSelectedId);

    // Mark the item as selected, displayed and rendered
    const newSelectedItem = viewInfo.widgets[selectedItemInfo.newSelectedIndex];
    newSelectedItem.selected = true;
    newSelectedItem.wasRendered = true;

    // Unselected the previous item
    if (selectedItemInfo.lastSelectedIndex !== -1) {
      const previousSelectedItem =
        viewInfo.widgets[selectedItemInfo.lastSelectedIndex];

      previousSelectedItem.selected = false;
    }

    // Shallow copy the widgets to ensure the flexible layout re-renders the view
    viewInfo.widgets = [...viewInfo.widgets];

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.flexibleLayoutRef);
  };

  private handleViewItemClose = (
    event: ChFlexibleLayoutCustomEvent<ViewItemCloseInfo>
  ) => {
    event.stopPropagation();

    const itemCloseInfo = event.detail;
    const viewInfo = this.viewsInfo.get(itemCloseInfo.viewId);

    // Last item from the view. Destroy the view and adjust the layout
    if (viewInfo.widgets.length === 1) {
      // TODO: Add implementation
      return;
    }

    const viewWidgets = viewInfo.widgets;
    const widgetsCount = viewWidgets.length;
    const itemUIModel = viewWidgets[itemCloseInfo.itemIndex];

    // If the item was selected, select another item
    if (itemUIModel.selected) {
      const newSelectedItem =
        itemCloseInfo.itemIndex === widgetsCount - 1 // If it's the last item
          ? viewWidgets[widgetsCount - 2] // Select the previous
          : viewWidgets[itemCloseInfo.itemIndex + 1]; // Otherwise, select the next

      this.renderedWidgets.add(newSelectedItem.id);
      viewInfo.renderedWidgets.add(newSelectedItem.id);

      // Mark the item as selected and rendered
      newSelectedItem.selected = true;
      newSelectedItem.wasRendered = true;
    }

    // Remove the item render from the view, but not from the flexible-layout-render
    // This way will help us to easily recover the item state
    viewInfo.renderedWidgets.delete(itemCloseInfo.itemId);
    removeElement(viewWidgets, itemCloseInfo.itemIndex);

    // Shallow copy the widgets to ensure the flexible layout re-renders the view
    viewInfo.widgets = [...viewInfo.widgets];

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.flexibleLayoutRef);
  };

  componentWillLoad() {
    this.setLayoutSplitterModels(this.layout);
  }

  render() {
    // Check render against the "layout" property
    if (this.layout == null) {
      return "";
    }

    return (
      <ch-flexible-layout
        class={this.cssClass || null}
        layoutModel={this.layoutSplitterModels}
        layoutSplitterParts={this.layoutSplitterParts}
        viewsInfo={this.viewsInfo}
        onViewItemClose={this.handleViewItemClose}
        onSelectedViewItemChange={this.handleViewItemChange}
        ref={el => (this.flexibleLayoutRef = el)}
      >
        {[...this.blockStartWidgets].map(widgetId => this.renders[widgetId]())}

        {[...this.renderedWidgets.values()].map(widget => (
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

import { Component, Prop, Watch, forceUpdate, h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutRenders,
  FlexibleLayoutView,
  ViewItemCloseInfo,
  ViewSelectedItemInfo
} from "../../flexible-layout/types";
import { getLayoutModel } from "./utils";
import { ChFlexibleLayoutCustomEvent } from "../../../components";
import { LayoutSplitterDistribution } from "../../layout-splitter/types";

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

  #viewsInfo: Map<string, FlexibleLayoutView> = new Map();

  #layoutSplitterModels: LayoutSplitterDistribution;

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
      this.#layoutSplitterModels = { direction: "columns", items: [] };

      return;
    }

    const layoutSplitterPartsSet: Set<string> = new Set();

    this.#layoutSplitterModels = getLayoutModel(
      layout,
      this.#viewsInfo,
      this.#blockStartWidgets,
      layoutSplitterPartsSet,
      this.#renderedWidgets
    );

    this.#layoutSplitterParts = [...layoutSplitterPartsSet.values()].join(",");
  }

  #handleViewItemChange = (
    event: ChFlexibleLayoutCustomEvent<ViewSelectedItemInfo>
  ) => {
    event.stopPropagation();

    const selectedItemInfo = event.detail;
    const viewInfo = this.#viewsInfo.get(selectedItemInfo.viewId);

    // Mark the item as rendered
    this.#renderedWidgets.add(selectedItemInfo.newSelectedId);

    // Mark the item as rendered
    const newSelectedItem = viewInfo.widgets[selectedItemInfo.newSelectedIndex];
    newSelectedItem.wasRendered = true;

    // Unselected the previous item
    viewInfo.selectedWidgetId = selectedItemInfo.newSelectedId;

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
  };

  #handleViewItemClose = (
    event: ChFlexibleLayoutCustomEvent<ViewItemCloseInfo>
  ) => {
    event.stopPropagation();

    const itemCloseInfo = event.detail;
    const viewInfo = this.#viewsInfo.get(itemCloseInfo.viewId);

    // Last item from the view. Destroy the view and adjust the layout
    if (viewInfo.widgets.length === 1) {
      // TODO: Add implementation
      return;
    }

    const viewWidgets = viewInfo.widgets;
    const widgetsCount = viewWidgets.length;
    const itemUIModel = viewWidgets[itemCloseInfo.itemIndex];

    // If the item was selected, select another item
    if (itemUIModel.id === viewInfo.selectedWidgetId) {
      const newSelectedItem =
        itemCloseInfo.itemIndex === widgetsCount - 1 // If it's the last item
          ? viewWidgets[widgetsCount - 2] // Select the previous
          : viewWidgets[itemCloseInfo.itemIndex + 1]; // Otherwise, select the next

      this.#renderedWidgets.add(newSelectedItem.id);

      // Mark the item as selected and rendered
      viewInfo.selectedWidgetId = newSelectedItem.id;
      newSelectedItem.wasRendered = true;
    }

    // Remove the item render from the view, but not from the flexible-layout-render
    // This way will help us to easily recover the item state
    this.#flexibleLayoutRef.removeItemInView(
      viewInfo.id,
      itemCloseInfo.itemIndex
    );

    // Queue re-renders
    forceUpdate(this);
    forceUpdate(this.#flexibleLayoutRef);
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
        layoutModel={this.#layoutSplitterModels}
        layoutSplitterParts={this.#layoutSplitterParts}
        viewsInfo={this.#viewsInfo}
        onViewItemClose={this.#handleViewItemClose}
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

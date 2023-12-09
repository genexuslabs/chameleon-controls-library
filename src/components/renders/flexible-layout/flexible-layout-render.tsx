import { Component, Prop, Watch, forceUpdate, h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutDistribution,
  FlexibleLayoutRenders,
  FlexibleLayoutSplitterModel,
  FlexibleLayoutView,
  FlexibleLayoutWidget,
  ViewSelectedItemInfo
} from "../../flexible-layout/types";
import { TabType } from "../../tab/types";
import {
  flexibleLayoutDistributionToLayoutSplitter,
  mapWidgetsToView
} from "../../flexible-layout/flexible-layout/utils";
import { tabTypeToPart } from "../../tab/utils";
import { ChFlexibleLayoutCustomEvent } from "../../../components";

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

  private viewsInfo: Map<string, FlexibleLayoutView> = new Map();

  private layoutSplitterModels: {
    [key in keyof FlexibleLayout]: FlexibleLayoutSplitterModel;
  } = {};

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
    // Reset layout
    this.layoutSplitterModels = {};

    // Empty layout
    if (layout == null) {
      return;
    }

    Object.entries(layout).forEach(
      ([key, value]: [
        key: keyof FlexibleLayout,
        value: {
          distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[]; // TODO: Add a type for this expression,
          viewType: TabType;
        }
      ]) => this.setLayoutSplitter(key, value)
    );
  }

  private setLayoutSplitter(
    key: keyof FlexibleLayout,
    value: {
      distribution: FlexibleLayoutWidget[] | FlexibleLayoutDistribution;
      viewType: TabType;
    }
  ) {
    if (!value || key === "blockStart") {
      return;
    }

    // The group has a distribution divided into multiples sections
    if ((value.distribution as FlexibleLayoutDistribution).direction != null) {
      const layoutSplitter = flexibleLayoutDistributionToLayoutSplitter(
        value.distribution as FlexibleLayoutDistribution,
        value.viewType,
        this.viewsInfo,
        this.renderedWidgets
      );

      this.layoutSplitterModels[key] = layoutSplitter;
    }
    // The group has only one section
    else {
      // Store view info
      mapWidgetsToView(
        tabTypeToPart[key](value.distribution as FlexibleLayoutWidget[]),
        value.distribution as FlexibleLayoutWidget[],
        this.viewsInfo,
        this.renderedWidgets,
        key, // ViewType
        key // Forced key
      );

      // Store the forced key
      this.layoutSplitterModels[key] = {
        views: new Set([key])
      };
    }
  }

  private handleViewItemChange = (
    event: ChFlexibleLayoutCustomEvent<ViewSelectedItemInfo>
  ) => {
    event.stopPropagation();

    const selectedItemInfo = event.detail;
    const viewInfo = this.viewsInfo.get(selectedItemInfo.viewId);

    // Mark the item as rendered
    this.renderedWidgets.add(selectedItemInfo.newSelectedId);
    viewInfo.renderedWidgets.add(selectedItemInfo.newSelectedId); // Esto debería ser un set para evitar duplicados

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
        viewsInfo={this.viewsInfo}
        onSelectedViewItemChange={this.handleViewItemChange}
        ref={el => (this.flexibleLayoutRef = el)}
      >
        {this.layout?.blockStart?.items != null &&
          this.layout.blockStart.items.map(widget => (
            <ch-flexible-layout-item
              key={widget.id}
              addSlot={false}
              itemId={widget.id}
            >
              {this.renders[widget.id]()}
            </ch-flexible-layout-item>
          ))}

        {[...this.renderedWidgets.values()].map(widget => (
          <ch-flexible-layout-item key={widget} addSlot={true} itemId={widget}>
            {this.renders[widget]()}
          </ch-flexible-layout-item>
        ))}
      </ch-flexible-layout>
    );
  }
}

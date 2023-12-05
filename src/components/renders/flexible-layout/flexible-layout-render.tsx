import { Component, Listen, Prop, State, Watch, h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutDisplayedItems,
  FlexibleLayoutGroupSelectedItemInfo,
  FlexibleLayoutItem,
  FlexibleLayoutItemBase,
  FlexibleLayoutRenders
} from "../../flexible-layout/types";
import { ChFlexibleLayoutGroupCustomEvent } from "../../../components";
import { flexibleLayoutGroupMap } from "../../flexible-layout/utils";

const getSelectedItem = (
  items: FlexibleLayoutItem[]
): FlexibleLayoutItem | undefined => items.find(item => item.selected);

const initializeRenderedItems = (
  flexibleLayout: FlexibleLayout,
  displayedItems: FlexibleLayoutDisplayedItems,
  renderedItems: Set<string>
) => {
  const layouts: {
    items: FlexibleLayoutItem[];
    group: keyof FlexibleLayout;
    defaultSelected: "first" | "last";
  }[] = [
    {
      items: flexibleLayout.inlineStart,
      group: "inlineStart",
      defaultSelected: "first"
    },
    {
      items: flexibleLayout.main,
      group: "inlineStart",
      defaultSelected: "last"
    },
    {
      items: flexibleLayout.inlineEnd,
      group: "inlineStart",
      defaultSelected: "first"
    },
    {
      items: flexibleLayout.blockEnd,
      group: "inlineStart",
      defaultSelected: "last"
    }
  ];

  // Mark selected items to be rendered
  layouts.forEach(layout => {
    const items = layout.items;

    if (items?.length > 0) {
      let selectedElement = getSelectedItem(items);

      // Select default item, if there is no item selected
      if (!selectedElement) {
        selectedElement =
          layout.defaultSelected === "first"
            ? items[0]
            : items[items.length - 1];
        selectedElement.selected = true;
      }

      selectedElement.displayed = true;
      selectedElement.wasRendered = true;
      displayedItems[layout.group].push(selectedElement.id);
      renderedItems.add(selectedElement.id);
    }
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
  private renderedItems: Set<string> = new Set();

  /**
   * Specifies the items in the flexible layout that must be rendered.
   */
  @State() displayedItems: FlexibleLayoutDisplayedItems = {
    blockStart: [],
    inlineStart: [],
    main: [],
    inlineEnd: [],
    blockEnd: []
  };

  /**
   * A CSS class to set as the `ch-flexible-layout` element class.
   */
  @Prop() readonly cssClass: string = "flexible-layout";

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop({ mutable: true }) layout: FlexibleLayout;
  @Watch("layout")
  handleLayoutChange(newLayout: FlexibleLayout) {
    initializeRenderedItems(newLayout, this.displayedItems, this.renderedItems);
  }

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly renders: FlexibleLayoutRenders;

  @Listen("selectedItemChange")
  handleItemSelectedChange(
    event: ChFlexibleLayoutGroupCustomEvent<FlexibleLayoutGroupSelectedItemInfo>
  ) {
    const detail = event.detail;
    const group = flexibleLayoutGroupMap[detail.group];

    // Mark the item as selected, displayed and rendered
    const newSelectedItem = this.layout[group][detail.newSelectedIndex];
    newSelectedItem.displayed = true;
    newSelectedItem.selected = true;
    newSelectedItem.wasRendered = true;

    // Mark as displayed the item in the render
    this.displayedItems[group] = [detail.newSelectedId];

    // Mark as rendered the item
    this.renderedItems.add(detail.newSelectedId);

    // Unselected the previous item
    if (detail.lastSelectedIndex !== -1) {
      const previousSelectedItem = this.layout[group][detail.lastSelectedIndex];

      previousSelectedItem.displayed = false;
      previousSelectedItem.selected = false;
    }

    // Force re-render by updating the reference
    this.displayedItems = { ...this.displayedItems };

    // Force re-render in ch-flexible-layout-group element by updating the reference
    this.layout[group] = [...this.layout[group]];
  }

  /**
   * Render items that are marked to be rendered in the `renderedItems` Set
   */
  private renderBlockStartItems = (items: FlexibleLayoutItemBase[]) =>
    items.map(item => (
      <ch-flexible-layout-item key={item.id} addSlot={false} itemId={item.id}>
        {this.renders[item.id]()}
      </ch-flexible-layout-item>
    ));

  /**
   * Render items that are marked to be rendered in the `renderedItems` Set
   */
  private renderOtherTypeItems = (items: FlexibleLayoutItem[]) =>
    items.map(
      item =>
        this.renderedItems.has(item.id) && (
          <ch-flexible-layout-item key={item.id} itemId={item.id}>
            {this.renders[item.id]()}
          </ch-flexible-layout-item>
        )
    );

  componentWillLoad() {
    if (this.layout == null) {
      return;
    }
    initializeRenderedItems(
      this.layout,
      this.displayedItems,
      this.renderedItems
    );
  }

  render() {
    const layout = this.layout;

    if (layout == null) {
      return "";
    }

    return (
      <ch-flexible-layout
        class={this.cssClass || null}
        displayedItems={this.displayedItems}
        layout={this.layout}
      >
        {layout.blockStart != null && // Top
          this.renderBlockStartItems(layout.blockStart)}

        {layout.inlineStart != null && // Left
          this.renderOtherTypeItems(layout.inlineStart)}

        {layout.main != null && // Main
          this.renderOtherTypeItems(layout.main)}

        {layout.inlineEnd != null && // Right
          this.renderOtherTypeItems(layout.inlineEnd)}

        {layout.blockEnd != null && // Bottom
          this.renderOtherTypeItems(layout.blockEnd)}
      </ch-flexible-layout>
    );
  }
}

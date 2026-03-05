import {
  Component,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import { removeElement } from "../../common/array";
import { CssContainProperty, CssOverflowProperty } from "../../common/types";
import { ChFlexibleLayoutCustomEvent } from "../../components";
import { ThemeModel } from "../theme/theme-types";
import {
  DroppableArea,
  FlexibleLayoutGroupModel,
  FlexibleLayoutItemExtended,
  FlexibleLayoutItemModel,
  FlexibleLayoutLeafConfigurationTabbed,
  FlexibleLayoutLeafInfo,
  FlexibleLayoutLeafModel,
  FlexibleLayoutLeafType,
  FlexibleLayoutModel,
  FlexibleLayoutRenderedWidgets,
  FlexibleLayoutRenders,
  FlexibleLayoutViewRemoveResult,
  FlexibleLayoutWidget,
  FlexibleLayoutWidgetCloseInfo,
  FlexibleLayoutWidgetExtended,
  ViewItemCloseInfo,
  ViewSelectedItemInfo,
  WidgetReorderInfo
} from "./internal/flexible-layout/types";
import { addNewLeafToInfo, getLeafInfo, updateFlexibleModels } from "./utils";

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

/**
 * The `ch-flexible-layout-render` component is a high-level shell for building IDE-style dock layouts composed of lightweight, modular widgets.
 *
 * @remarks
 * ## Features
 *  - Hierarchical model of groups and leaves, where each leaf can host a single widget or a tabbed collection of widgets.
 *  - Coordinates `ch-flexible-layout` and `ch-layout-splitter` primitives for draggable, resizable, and reorderable views.
 *  - Add, remove, and reorder widgets and views at runtime via public methods.
 *  - Slotted widget mode (`slottedWidgets`) projects widget content from outside the component via named slots.
 *  - Close button support for tabbed leaves.
 *  - Configurable CSS containment and overflow per widget.
 *  - Theme support via the `theme` property.
 *  - Emits `renderedWidgetsChange` whenever the set of visible widgets changes, enabling host apps to lazy-mount or unmount content.
 *
 * ## Use when
 *  - Building a complex, multi-pane workspace (code editors, dashboards, admin panels) where users can rearrange, close, and add views at runtime.
 *  - Building IDE-like or dashboard interfaces with multiple movable, resizable widget panes.
 *
 * ## Do not use when
 *  - Building simple, static layouts -- prefer `ch-layout-splitter` or CSS Grid instead.
 *  - A simple fixed two-panel layout is sufficient -- prefer `ch-layout-splitter` directly.
 *
 * ## Accessibility
 *  - Tab reordering in `"tabbed"` leaves supports keyboard-initiated drag via the inner `ch-tab` component.
 *  - Focus management is delegated to the underlying `ch-flexible-layout` and `ch-tab` primitives.
 *  - Close actions are cancelable through the `widgetClose` event, allowing confirmation dialogs before removal.
 *
 * @part droppable-area - The overlay surface rendered over the layout when a widget is being dragged, enabling drop-zone detection.
 * @part leaf - The container element for a leaf node (either a single-widget view or a tabbed widget group).
 *
 * @status experimental
 *
 * @slot {widgetId} - Named slot for each widget. Each widget gets a named slot whose name equals the widget's `id`. Slots are only projected when `slottedWidgets` is `true` (or the individual widget's `slot` property is `true`) and the widget is currently visible.
 */
@Component({
  shadow: true,
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
  #lastRenderedWidgets = new Set();

  #widgetsInfo: Map<string, FlexibleLayoutWidgetExtended> = new Map();

  #itemsInfo: Map<string, ItemExtended> = new Map();

  #layoutSplitterParts: Set<string> = new Set();

  // Refs
  #flexibleLayoutRef: HTMLChFlexibleLayoutElement;

  /**
   * `true` to display a close button for the `"tabbed"` type leafs.
   * When a close button is clicked, the `widgetClose` event is emitted.
   * The close can be prevented by calling `event.preventDefault()`.
   * Has no effect on `"single-content"` type leaves.
   */
  @Prop() readonly closeButton: boolean = false;

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
   * When the `"tabbed"` type leaves are sortable, the items can be dragged
   * outside of their tab-list into a different leaf's drop zone.
   *
   * This property lets you specify if this behavior is enabled.
   * Requires `sortable` to be `true`; otherwise this property has no effect.
   */
  @Prop() readonly dragOutside: boolean = false;

  /**
   * Specifies the distribution of the items in the flexible layout.
   * The model is a tree of groups and leaves describing the hierarchical
   * pane structure. When set to `null` or `undefined`, the component renders
   * nothing.
   *
   * Changing this property at runtime fully rebuilds the internal state.
   * Previously rendered widgets that still exist in the new model will
   * keep their render state; widgets removed from the model are discarded.
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
  @Prop() readonly overflow:
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}` = "visible";

  /**
   * A dictionary mapping render IDs to render functions.
   * Each function receives a `FlexibleLayoutWidget` and returns a JSX element
   * to display inside the widget's container.
   *
   * When a widget's `renderId` is set, the component looks up this dictionary
   * using that ID; otherwise it falls back to the widget's `id`.
   * If no matching render is found, an error is logged to the console.
   *
   * Not used for slotted widgets (those projected via named slots).
   */
  @Prop() readonly renders: FlexibleLayoutRenders;

  /**
   * `true` to enable sorting the tab buttons in the `"tabbed"` type leaves
   * by dragging them in the tab-list.
   *
   * If `false`, the tab buttons cannot be dragged out either, regardless
   * of the `dragOutside` property value.
   */
  @Prop() readonly sortable: boolean = false;

  /**
   * Specifies whether widgets are rendered outside of the
   * `ch-flexible-layout-render` by default by projecting a named slot.
   *
   * When `true`, each visible widget is rendered as a `<slot name="{widgetId}">`
   * so the host application can provide content from outside the shadow DOM.
   * Individual widgets can override this default via their own `slot` property.
   */
  @Prop() readonly slottedWidgets: boolean = false;

  /**
   * Specifies the theme to be used for rendering the control.
   * If `undefined`, no theme will be applied.
   */
  @Prop() readonly theme: ThemeModel | undefined;

  /**
   * Emitted when the user presses the close button on a widget tab.
   * The event is cancelable: calling `event.preventDefault()` prevents the
   * widget from being removed, allowing the host to show a confirmation
   * dialog or perform cleanup before removal.
   *
   * Payload contains `widgetId` and `viewId` identifying the closed widget.
   */
  @Event() widgetClose: EventEmitter<FlexibleLayoutWidgetCloseInfo>;

  /**
   * Emitted every time the set of rendered widgets changes (after each
   * render cycle). The payload contains two arrays:
   *  - `rendered`: widget IDs rendered internally by the component.
   *  - `slotted`: widget IDs projected via named slots.
   *
   * Not emitted when the rendered set is identical to the previous cycle.
   * Not cancelable.
   */
  @Event() renderedWidgetsChange: EventEmitter<FlexibleLayoutRenderedWidgets>;

  /**
   * Adds a new leaf view as a sibling of an existing item within a group.
   * The new view takes half the space of the specified sibling when
   * `takeHalfTheSpaceOfTheSiblingItem` is `true`.
   *
   * Returns `true` if the view was added successfully, `false` if the
   * parent group or sibling item was not found.
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
   * Adds a widget to an existing `"tabbed"` type leaf.
   * Only works if the parent leaf is `"tabbed"` type; no-ops for
   * `"single-content"` leaves.
   * If a widget with the same ID already exists, this method has no effect.
   *
   * By default, the newly added widget is selected (`selectWidget = true`).
   * Set `selectWidget` to `false` to add the widget without switching to it.
   *
   * To add a widget in a `"single-content"` type leaf, use the
   * `addSiblingView` method instead.
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
   * Removes a leaf view and optionally all its rendered widgets.
   * The space freed by the removed view is given to the closest sibling.
   *
   * Only works on `"tabbed"` type leaves. Returns `{ success: false }` if
   * the leaf does not exist or is `"single-content"` type.
   *
   * When `removeRenderedWidgets` is `true`, widget render state is
   * destroyed (unless the widget has `conserveRenderState === true`).
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
   * Removes a widget from a `"tabbed"` type leaf by its widget ID.
   * Only works if the parent leaf is `"tabbed"` type; no-ops otherwise.
   *
   * If the removed widget was the only one in the leaf, the entire view
   * is destroyed via `removeView`. If it was the selected widget, the
   * adjacent widget is automatically selected.
   *
   * To remove a widget from a `"single-content"` type leaf, use the
   * `removeView` method instead.
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
   * Updates the selected (visible) widget in a `"tabbed"` type leaf.
   * Only works if the parent leaf is `"tabbed"` type and the specified
   * widget belongs to that leaf. No-ops if the widget is already selected,
   * the widget is not found, or the leaf is `"single-content"` type.
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
   * Updates leaf-level configuration properties (e.g., `tabListPosition`,
   * `dragBar`) for the view identified by `viewId`.
   *
   * The `type` field in the `properties` argument must match the leaf's
   * current type; otherwise the update is silently skipped.
   * The `selectedWidgetId`, `widget`, and `widgets` fields cannot be
   * changed through this method.
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
   * Updates metadata properties on an existing widget (e.g., `name`,
   * `startImgSrc`, `slot`). The `id` and `wasRendered` fields cannot be
   * changed. No-ops if the widget is not found.
   *
   * Triggers a re-render of both the widget container and its parent leaf.
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

    this.#layoutSplitterParts.clear();
    const newRenderedWidgets: Set<string> = new Set(); // Temporal Set to store the new rendered widgets

    updateFlexibleModels(
      layout,
      this.#itemsInfo,
      this.#layoutSplitterParts,
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

    // Remove the item from the ch-flexible-layout-render to optimize resources
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
      tabListPosition: viewTargetUIModel.leafInfo.tabListPosition,
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

    if (this.#widgetIsSlotted(widgetInfo)) {
      return <slot key={widgetId} name={widgetId} slot={widgetId} />;
    }

    const renderId = widgetInfo.renderId ?? widgetId;
    const widgetRender = this.renders[renderId];

    if (!widgetRender) {
      console.error(
        `Could not find a render for the "${widgetId}" widget. The render "${renderId}" does not exists in the "renders" property.`
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

  #widgetIsSlotted = (widgetInfo: FlexibleLayoutWidget) =>
    widgetInfo.slot ?? this.slottedWidgets;

  #checkToEmitRenderedWidgetsChange = () => {
    if (
      this.#lastRenderedWidgets.size === this.#renderedWidgets.size &&
      this.#lastRenderedWidgets.size === 0
    ) {
      return;
    }

    // If the Sets have different sizes, we can ensure that the event must be
    // emitted. If not, we should check if both Sets have the same items.
    let shouldEmitRenderedWidgetsChange =
      this.#lastRenderedWidgets.size !== this.#renderedWidgets.size;
    const rendered: string[] = [];
    const slotted: string[] = [];

    // In the same loop, prepare the event detail while checking to emit the event
    this.#renderedWidgets.forEach(widgetId => {
      const widgetInfo = this.#widgetsInfo.get(widgetId)!.info;

      if (this.#widgetIsSlotted(widgetInfo)) {
        slotted.push(widgetId);
      } else {
        rendered.push(widgetId);
      }

      shouldEmitRenderedWidgetsChange ||=
        !this.#lastRenderedWidgets.has(widgetId);
    });

    if (shouldEmitRenderedWidgetsChange) {
      this.renderedWidgetsChange.emit({ rendered, slotted });
    }

    // Update the Set using the new rendered widgets, without sharing the reference
    this.#lastRenderedWidgets = new Set(this.#renderedWidgets);
  };

  componentWillLoad() {
    this.#updateFlexibleModels(this.model);
  }

  componentDidRender() {
    this.#checkToEmitRenderedWidgetsChange();
  }

  render() {
    // Check render against the "layout" property
    if (this.model == null) {
      return "";
    }

    return (
      <Host>
        {this.theme && <ch-theme model={this.theme}></ch-theme>}

        <ch-flexible-layout
          closeButton={this.closeButton}
          contain={this.contain}
          dragOutside={this.dragOutside}
          model={this.model}
          layoutSplitterParts={this.#layoutSplitterParts}
          itemsInfo={this.#itemsInfo}
          overflow={this.overflow}
          sortable={this.sortable}
          onViewItemClose={this.#handleLeafWidgetClose}
          onViewItemReorder={this.#handleLeafWidgetReorder}
          onSelectedViewItemChange={this.#handleLeafSelectedWidgetChange}
          ref={el => (this.#flexibleLayoutRef = el)}
        >
          {[...this.#renderedWidgets.values()].map(this.#renderWidget)}
        </ch-flexible-layout>
      </Host>
    );
  }
}

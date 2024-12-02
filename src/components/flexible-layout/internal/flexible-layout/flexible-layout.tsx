import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  Prop,
  State,
  forceUpdate,
  h
} from "@stencil/core";
import {
  DraggableView,
  DraggableViewExtendedInfo,
  FlexibleLayoutModel,
  FlexibleLayoutItemModel,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeafModel,
  FlexibleLayoutLeafInfo,
  FlexibleLayoutLeafType,
  FlexibleLayoutViewRemoveResult,
  ViewItemCloseInfo,
  ViewSelectedItemInfo,
  WidgetDragInfo,
  WidgetReorderInfo
} from "./types";

// import { mouseEventModifierKey } from "../../common/helpers";

import { TabItemCloseInfo, TabSelectedItemInfo } from "../../../tab/types";
import { ChTabRenderCustomEvent } from "../../../../components";
import {
  getWidgetDropInfo,
  handleWidgetDrag,
  removeDroppableAreaStyles
} from "./utils";
import { getLeafInfo } from "../../utils";
import { isRTL } from "../../../../common/utils";
import {
  CssContainProperty,
  CssOverflowProperty
} from "../../../../common/types";
import { DEFAULT_TAB_LIST_POSITION } from "../../../tab/utils";
import {
  FLEXIBLE_LAYOUT_PARTS_DICTIONARY,
  LAYOUT_SPLITTER_PARTS_DICTIONARY,
  TAB_EXPORT_PARTS,
  TAB_PARTS_DICTIONARY
} from "../../../../common/reserved-names";

const LEAF_SELECTOR = (id: string) => `[id="${id}"]`;

// Keys
const ESCAPE_KEY = "Escape";
// const KEY_B = "KeyB";

@Component({
  shadow: true,
  styleUrl: "flexible-layout.scss",
  tag: "ch-flexible-layout"
})
export class ChFlexibleLayout {
  #exportParts: string;
  #layoutSplitterExportParts: string;
  #leafs: FlexibleLayoutLeafInfo<FlexibleLayoutLeafType>[] = [];

  #draggableViews: DraggableViewExtendedInfo[];

  #dragInfo: WidgetDragInfo;
  #viewsOutOfDroppableZoneController: AbortController; // Allocated at runtime to reduce memory usage

  // Refs
  #draggedViewRef: DraggableView;
  #droppableAreaRef: HTMLDivElement;
  #layoutSplitterRef: HTMLChLayoutSplitterElement;

  @Element() el: HTMLChFlexibleLayoutElement;

  @State() dragBarDisabled = false;

  /**
   * `true` to display a close button for the `"tabbed"` type leafs.
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
   * When the "tabbed" type leafs are sortable, the items can be dragged
   * outside of its tab-list.
   *
   * This property lets you specify if this behavior is enabled.
   */
  @Prop() readonly dragOutside: boolean = false;

  /**
   * Specifies the information of each view displayed.
   */
  @Prop() readonly itemsInfo: Map<
    string,
    FlexibleLayoutItemExtended<FlexibleLayoutItemModel, FlexibleLayoutLeafType>
  >;

  /**
   * Specifies additional parts to export.
   */
  @Prop() readonly layoutSplitterParts: Set<string>;

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly model: FlexibleLayoutModel;

  /**
   * Same as the overflow CSS property. This property sets the desired behavior
   * when content does not fit in the widget's padding box (overflows) in the
   * horizontal and/or vertical direction.
   */
  @Prop() readonly overflow:
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}` = "visible";

  /**
   * `true` to enable sorting the tab buttons in the `"tabbed"` type leafs by
   * dragging them in the tab-list.
   *
   * If `false`, the tab buttons can not be dragged out either.
   */
  @Prop() readonly sortable: boolean = false;

  /**
   * Fired when a item of a view request to be closed.
   */
  @Event() viewItemClose: EventEmitter<ViewItemCloseInfo>;

  /**
   * Fired when the selected item change.
   */
  @Event() selectedViewItemChange: EventEmitter<ViewSelectedItemInfo>;

  /**
   * Fired when a widget is dragged and dropped into a view.
   */
  @Event() viewItemReorder: EventEmitter<WidgetReorderInfo>;

  /**
   *
   */
  @Method()
  async addSiblingView(
    parentGroup: string,
    siblingItem: string,
    placedInTheSibling: "before" | "after",
    viewInfo: FlexibleLayoutLeafModel,
    takeHalfTheSpaceOfTheSiblingItem: boolean
  ): Promise<boolean> {
    const result = await this.#layoutSplitterRef.addSiblingLeaf(
      parentGroup,
      siblingItem,
      placedInTheSibling,
      viewInfo,
      takeHalfTheSpaceOfTheSiblingItem
    );

    if (result.success) {
      // Queue re-renders
      forceUpdate(this);
    }

    return result.success;
  }

  /**
   * Schedules a new render for a leaf even if no state changed.
   */
  @Method()
  async refreshLeaf(leafId: string) {
    const leafRef = this.el.shadowRoot.querySelector(LEAF_SELECTOR(leafId));

    if (!leafRef) {
      return;
    }

    forceUpdate(leafRef);
  }

  /**
   * Removes the view that is identified by the given ID.
   * The layout is rearranged depending on the state of the removed view.
   */
  @Method()
  async removeView(itemId: string): Promise<FlexibleLayoutViewRemoveResult> {
    const result = await this.#layoutSplitterRef.removeItem(itemId);

    if (result.success) {
      // Queue re-renders
      forceUpdate(this);
    }

    return {
      success: result.success,
      reconnectedSubtree: result.reconnectedSubtree
    };
  }

  /**
   * Given the view ID and the item id, remove the page of the item from the view.
   */
  @Method()
  async removeItemPageInView(
    viewId: string,
    itemId: string,
    forceRerender = true
  ) {
    const viewInfo = this.#getLeafInfo(viewId);
    if (!viewInfo) {
      return;
    }

    const viewRef = this.el.shadowRoot.querySelector(
      LEAF_SELECTOR(viewInfo.id)
    ) as HTMLChTabRenderElement;
    await viewRef.removePage(itemId, forceRerender);
  }

  @Listen("itemClose")
  handleItemClose(event: ChTabRenderCustomEvent<TabItemCloseInfo>) {
    const viewRef = event.composedPath()[0] as HTMLChTabRenderElement;

    if (
      viewRef.tagName.toLowerCase() !== "ch-tab-render" ||
      viewRef.getRootNode() !== this.el.shadowRoot
    ) {
      return;
    }
    event.stopPropagation();

    // Add the view id to properly update the render
    const eventDetail: ViewItemCloseInfo = {
      ...event.detail,
      viewId: viewRef.id
    };

    const eventInfo = this.viewItemClose.emit(eventDetail);

    // Prevent the tab closing
    if (eventInfo.defaultPrevented) {
      event.preventDefault();
    }
  }

  #getLeafInfo = (
    leafId: string
  ): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType> =>
    getLeafInfo(this.itemsInfo, leafId);

  #getAllLeafs = (): FlexibleLayoutLeafInfo<FlexibleLayoutLeafType>[] => {
    const views: FlexibleLayoutLeafInfo<FlexibleLayoutLeafType>[] = [];

    this.itemsInfo.forEach(item => {
      const itemView = (
        item as FlexibleLayoutItemExtended<
          FlexibleLayoutLeafModel,
          FlexibleLayoutLeafType
        >
      ).leafInfo;

      if (itemView != null) {
        views.push(itemView);
      }
    });

    return views;
  };

  // @Listen("keydown", { target: "document" })
  // handleKeyDownEvent(event: KeyboardEvent) {
  // if (
  //   !mouseEventModifierKey(event) ||
  //   event.code !== KEY_B ||
  //   this.layout.inlineStart == null
  // ) {
  //   return;
  // }
  // event.stopPropagation();
  // event.preventDefault();

  // this.layout.inlineStart.expanded = !(
  //   this.layout.inlineStart.expanded ?? true
  // );
  //   forceUpdate(this);
  // }

  // private handleMainGroupExpand = () => {
  //   // if (this.layout.inlineStart) {
  //   //   this.layout.inlineStart.expanded = false;
  //   // }

  //   // if (this.layout.inlineEnd) {
  //   //   this.layout.inlineEnd.expanded = false;
  //   // }

  //   // if (this.layout.blockEnd) {
  //   //   this.layout.blockEnd.expanded = false;
  //   // }

  //   forceUpdate(this);
  // };

  #handleItemChange =
    (viewId: string) =>
    (event: ChTabRenderCustomEvent<TabSelectedItemInfo>) => {
      // Check if the selected item change event comes from a tab of the
      // shadowroot, instead of a tab of the light DOM (case where a view has a
      // "nested" ch-tab-render control)
      if ((event.target as HTMLElement).getRootNode() !== this.el.shadowRoot) {
        return;
      }

      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewSelectedItemInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.selectedViewItemChange.emit(eventInfo);
    };

  #handleDragStart =
    (viewId: string) => async (event: ChTabRenderCustomEvent<number>) => {
      event.stopPropagation();

      // We MUST store the reference before the Promise.allSettle, otherwise
      // the event target will be the flexible-layout control
      this.#draggedViewRef = event.target;

      const views = [...this.el.shadowRoot.querySelectorAll("ch-tab-render")];

      this.#dragInfo = {
        index: event.detail,
        viewId: viewId
      };

      // Get all draggable views
      const draggableViewsResult = await Promise.allSettled(
        views.map(view => view.getDraggableViews())
      );

      // Allocate memory
      this.#draggableViews = [];

      // Add handlers to manage droppable areas
      draggableViewsResult.forEach((draggableViewResult, index) => {
        if (draggableViewResult.status === "fulfilled") {
          const draggableView = draggableViewResult.value;
          const abortController = new AbortController(); // Necessary to remove the event listener

          const extendedDraggableView = {
            ...draggableView,
            viewId: views[index].id, // All views have an id in the DOM
            abortController: abortController
          };

          this.#draggableViews.push(extendedDraggableView);

          const RTL = isRTL();

          draggableView.mainView.addEventListener(
            "mousemove",
            handleWidgetDrag(
              extendedDraggableView,
              this.#droppableAreaRef,
              RTL
            ),
            { capture: true, passive: true, signal: abortController.signal }
          );

          // Remove pointer events to not interfere on the mousemove event
          extendedDraggableView.tabListView.style.pointerEvents = "none";
          extendedDraggableView.pageView.style.pointerEvents = "none";
        }
      });

      document.addEventListener("mouseup", this.#handleWidgetDragEnd, {
        passive: true
      });
      document.addEventListener("keydown", this.#handleWidgetDragEndKeydown, {
        passive: true
      });

      // Removes view when they are out of a droppable area
      this.#viewsOutOfDroppableZoneController = new AbortController();
      document.addEventListener(
        "mousemove",
        () => removeDroppableAreaStyles(this.#droppableAreaRef),
        {
          passive: true,
          signal: this.#viewsOutOfDroppableZoneController.signal
        }
      );

      // Show droppable area
      this.#droppableAreaRef.showPopover(); // Layer 1

      // After that, promote the drag preview to the second layer
      this.#draggedViewRef.promoteDragPreviewToTopLayer(); // Layer 2

      // Disable drag bars in layout-splitter to improve the drag experience
      this.dragBarDisabled = true;
    };

  #handleWidgetDragEndKeydown = (event: KeyboardEvent) => {
    if (event.code !== ESCAPE_KEY) {
      return;
    }

    event.preventDefault();

    // Cancels the drop by removing the drop info
    removeDroppableAreaStyles(this.#droppableAreaRef);

    this.#handleWidgetDragEnd();
    this.#draggedViewRef.endDragPreview();
  };

  #handleWidgetDragEnd = () => {
    // Remove mousemove handlers
    this.#draggableViews.forEach(draggableView => {
      draggableView.abortController.abort();

      // Reset pointer events
      draggableView.tabListView.style.pointerEvents = null;
      draggableView.pageView.style.pointerEvents = null;
    });

    // Remove mouseup and keydown handlers
    document.removeEventListener("mouseup", this.#handleWidgetDragEnd);
    document.removeEventListener("keydown", this.#handleWidgetDragEndKeydown);
    this.#viewsOutOfDroppableZoneController.abort();

    // Check if must update the view due to a drop
    const dropInfo = getWidgetDropInfo();

    if (dropInfo) {
      this.viewItemReorder.emit({ ...this.#dragInfo, ...dropInfo });
    }

    // Hide droppable area
    this.#droppableAreaRef.hidePopover();
    removeDroppableAreaStyles(this.#droppableAreaRef);

    // Free the memory
    this.#draggableViews = undefined;
    this.#dragInfo = undefined;

    // Re-enable drag bars
    this.dragBarDisabled = false;
  };

  #computePartsToExport = () => {
    const exportPartsSet = new Set<string>([
      ...Object.values(TAB_PARTS_DICTIONARY)
    ]);
    exportPartsSet.add(FLEXIBLE_LAYOUT_PARTS_DICTIONARY.DROPPABLE_AREA);
    exportPartsSet.add(FLEXIBLE_LAYOUT_PARTS_DICTIONARY.LEAF);
    exportPartsSet.add(LAYOUT_SPLITTER_PARTS_DICTIONARY.BAR);

    // TODO: Test items that have a part with spaces
    this.layoutSplitterParts.forEach(part => exportPartsSet.add(part));

    // TODO: Revisit this algorithm to simplify definition of exportparts
    this.#leafs.forEach(leaf => {
      if (leaf.type === "tabbed") {
        exportPartsSet.add(leaf.id);
        exportPartsSet.add(leaf.tabListPosition ?? DEFAULT_TAB_LIST_POSITION);
        leaf.widgets.forEach(({ id }) => exportPartsSet.add(id));
      }
    });

    this.#exportParts = [...exportPartsSet.keys()].join(",");

    this.#layoutSplitterExportParts = [
      ...this.layoutSplitterParts.keys(),
      LAYOUT_SPLITTER_PARTS_DICTIONARY.BAR
    ].join(",");
  };

  #renderTab = (viewInfo: FlexibleLayoutLeafInfo<"tabbed">) => {
    const dragOutsideEnabled = viewInfo.dragOutside ?? this.dragOutside;
    const sortableEnabled = viewInfo.sortable ?? this.sortable;
    const tabListPosition =
      viewInfo.tabListPosition ?? DEFAULT_TAB_LIST_POSITION;

    return (
      <ch-tab-render
        id={viewInfo.id}
        key={viewInfo.id}
        slot={viewInfo.id}
        contain={this.contain}
        // TODO: Add hostParts property in the ch-tab-render
        part={`${FLEXIBLE_LAYOUT_PARTS_DICTIONARY.LEAF} ${tabListPosition} ${viewInfo.id}`}
        // TODO: Find a better way to avoid this mapping on every render
        exportparts={`${TAB_EXPORT_PARTS},${tabListPosition},${viewInfo.widgets
          .map(({ id }) => id)
          .join(",")}`}
        closeButton={viewInfo.closeButton ?? this.closeButton}
        disabled={viewInfo.disabled}
        dragOutside={dragOutsideEnabled}
        model={viewInfo.widgets}
        overflow={this.overflow}
        selectedId={viewInfo.selectedWidgetId}
        showCaptions={viewInfo.showCaptions}
        sortable={sortableEnabled}
        tabButtonHidden={viewInfo.tabButtonHidden}
        tabListPosition={tabListPosition}
        // onExpandMainGroup={tabType === "main" ? this.handleMainGroupExpand : null}
        onItemDragStart={
          dragOutsideEnabled && sortableEnabled
            ? this.#handleDragStart(viewInfo.id)
            : undefined
        }
        onSelectedItemChange={this.#handleItemChange(viewInfo.id)}
      >
        {viewInfo.widgets.map(
          widget =>
            widget.wasRendered && <slot name={widget.id} slot={widget.id} />
        )}
      </ch-tab-render>
    );
  };

  #renderView = <T extends FlexibleLayoutLeafType>(
    leaf: FlexibleLayoutLeafInfo<T>
  ) =>
    leaf.type === "single-content" ? (
      <slot key={leaf.id} slot={leaf.id} name={leaf.id} />
    ) : (
      this.#renderTab(leaf)
    );

  componentWillRender() {
    this.#leafs = this.#getAllLeafs();

    // TODO: Find a better life cycle to run this?
    this.#computePartsToExport();
  }

  render() {
    const layoutModel = this.model;

    if (layoutModel == null) {
      return "";
    }

    return (
      <Host exportparts={this.#exportParts}>
        <ch-layout-splitter
          dragBarDisabled={this.dragBarDisabled}
          model={layoutModel}
          exportparts={this.#layoutSplitterExportParts}
          ref={el => (this.#layoutSplitterRef = el)}
        >
          {this.#leafs.map(this.#renderView)}
        </ch-layout-splitter>

        <div
          aria-hidden="true"
          class="droppable-area"
          part={FLEXIBLE_LAYOUT_PARTS_DICTIONARY.DROPPABLE_AREA}
          popover="manual"
          ref={el => (this.#droppableAreaRef = el)}
        ></div>
      </Host>
    );
  }
}

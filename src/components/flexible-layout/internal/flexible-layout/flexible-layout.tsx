import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  forceUpdate,
  h
} from "@stencil/core";
import {
  DraggableView,
  DraggableViewExtendedInfo,
  FlexibleLayout,
  FlexibleLayoutItem,
  FlexibleLayoutItemExtended,
  FlexibleLayoutLeaf,
  FlexibleLayoutLeafInfo,
  FlexibleLayoutLeafType,
  FlexibleLayoutViewRemoveResult,
  ViewItemCloseInfo,
  ViewSelectedItemInfo,
  WidgetDragInfo,
  WidgetReorderInfo
} from "./types";

// import { mouseEventModifierKey } from "../../common/helpers";

import { ListItemCloseInfo, ListSelectedItemInfo } from "../../../list/types";
import { ChListCustomEvent } from "../../../../components";
import {
  getWidgetDropInfo,
  handleWidgetDrag,
  removeDroppableAreaStyles
} from "./utils";
import { getLeafInfo } from "../../utils";
import { isRTL } from "../../../../common/utils";

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
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layout: FlexibleLayout;

  /**
   * Specifies additional parts to export.
   */
  @Prop() readonly layoutSplitterParts: string;

  /**
   * Specifies the information of each view displayed.
   */
  @Prop() readonly itemsInfo: Map<
    string,
    FlexibleLayoutItemExtended<FlexibleLayoutItem, FlexibleLayoutLeafType>
  >;

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
    viewInfo: FlexibleLayoutLeaf,
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
      `ch-list[id='${viewInfo.id}']`
    ) as HTMLChListElement;
    await viewRef.removePage(itemId, forceRerender);
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
          FlexibleLayoutLeaf,
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

  private handleItemChange =
    (viewId: string) => (event: ChListCustomEvent<ListSelectedItemInfo>) => {
      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewSelectedItemInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.selectedViewItemChange.emit(eventInfo);
    };

  private handleItemClose =
    (viewId: string) => (event: ChListCustomEvent<ListItemCloseInfo>) => {
      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewItemCloseInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.viewItemClose.emit(eventInfo);
    };

  private handleDragStart =
    (viewId: string) => async (event: ChListCustomEvent<number>) => {
      event.stopPropagation();

      // We MUST store the reference before the Promise.allSettle, otherwise
      // the event target will be the flexible-layout control
      this.#draggedViewRef = event.target;

      const views = [...this.el.shadowRoot.querySelectorAll("ch-list")];

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

  private renderTab = (viewInfo: FlexibleLayoutLeafInfo<"tabbed">) => (
    <ch-list
      id={viewInfo.id}
      key={viewInfo.id}
      slot={viewInfo.id}
      class={{
        [`ch-list-${viewInfo.tabDirection}--end`]:
          viewInfo.tabPosition === "end"
      }}
      part={`leaf ${viewInfo.tabDirection} ${viewInfo.tabPosition ?? "start"} ${
        viewInfo.id
      }`}
      exportparts={viewInfo.exportParts}
      closeButtonHidden={viewInfo.closeButtonHidden}
      dragOutsideDisabled={viewInfo.dragOutsideDisabled}
      direction={viewInfo.tabDirection}
      items={viewInfo.widgets}
      selectedId={viewInfo.selectedWidgetId}
      showCaptions={viewInfo.showCaptions}
      sortable={viewInfo.sortable}
      // onExpandMainGroup={tabType === "main" ? this.handleMainGroupExpand : null}
      onItemClose={this.handleItemClose(viewInfo.id)}
      onItemDragStart={this.handleDragStart(viewInfo.id)}
      onSelectedItemChange={this.handleItemChange(viewInfo.id)}
    >
      {viewInfo.widgets.map(
        widget =>
          widget.wasRendered && <slot name={widget.id} slot={widget.id} />
      )}
    </ch-list>
  );

  private renderView = <T extends FlexibleLayoutLeafType>(
    leaf: FlexibleLayoutLeafInfo<T>
  ) =>
    leaf.type === "single-content" ? (
      <slot key={leaf.id} slot={leaf.id} name={leaf.id} />
    ) : (
      this.renderTab(leaf)
    );

  render() {
    const layoutModel = this.layout;

    if (layoutModel == null) {
      return "";
    }

    return (
      <Host>
        <ch-layout-splitter
          dragBarDisabled={this.dragBarDisabled}
          layout={layoutModel}
          exportparts={"bar," + this.layoutSplitterParts}
          ref={el => (this.#layoutSplitterRef = el)}
        >
          {this.#getAllLeafs().map(this.renderView)}
        </ch-layout-splitter>

        <div
          aria-hidden="true"
          class="droppable-area"
          part="droppable-area"
          popover="manual"
          ref={el => (this.#droppableAreaRef = el)}
        ></div>
      </Host>
    );
  }
}

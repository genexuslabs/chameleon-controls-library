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
  FlexibleLayoutView,
  ViewItemCloseInfo,
  ViewSelectedItemInfo,
  WidgetDragInfo,
  WidgetReorderInfo
} from "../types";

// import { mouseEventModifierKey } from "../../common/helpers";

import {
  TabItemCloseInfo,
  TabSelectedItemInfo,
  TabType
} from "../../tab/types";
import { ChTabCustomEvent } from "../../../components";
import { LayoutSplitterDistribution } from "../../layout-splitter/types";
import {
  getWidgetDropInfo,
  handleWidgetDrag,
  removeDroppableAreaStyles
} from "../utils";

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

  @Element() el: HTMLChFlexibleLayoutElement;

  @State() dragBarDisabled = false;

  /**
   * Specifies the distribution of the items in the flexible layout.
   */
  @Prop() readonly layoutModel: LayoutSplitterDistribution;

  /**
   * Specifies additional parts to export.
   */
  @Prop() readonly layoutSplitterParts: string;

  /**
   * Specifies the information of each view displayed.
   */
  @Prop() readonly viewsInfo: Map<string, FlexibleLayoutView> = new Map();

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
   * Given the view ID and the item index, remove the item from the view
   */
  @Method()
  async removeItemInView(viewId: string, index: number, forceRerender = true) {
    const viewInfo = this.viewsInfo.get(viewId);
    if (!viewInfo) {
      return;
    }

    const viewRef = this.el.shadowRoot.querySelector(
      `ch-tab[id='${viewInfo.id}']`
    ) as HTMLChTabElement;
    await viewRef.removeItem(index, forceRerender);
  }

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

  private handleMainGroupExpand = () => {
    // if (this.layout.inlineStart) {
    //   this.layout.inlineStart.expanded = false;
    // }

    // if (this.layout.inlineEnd) {
    //   this.layout.inlineEnd.expanded = false;
    // }

    // if (this.layout.blockEnd) {
    //   this.layout.blockEnd.expanded = false;
    // }

    forceUpdate(this);
  };

  private handleItemChange =
    (viewId: string) => (event: ChTabCustomEvent<TabSelectedItemInfo>) => {
      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewSelectedItemInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.selectedViewItemChange.emit(eventInfo);
    };

  private handleItemClose =
    (viewId: string) => (event: ChTabCustomEvent<TabItemCloseInfo>) => {
      event.stopPropagation();

      // Add the view id to properly update the render
      const eventInfo: ViewItemCloseInfo = {
        ...event.detail,
        viewId: viewId
      };

      this.viewItemClose.emit(eventInfo);
    };

  private handleDragStart =
    (viewId: string) => async (event: ChTabCustomEvent<number>) => {
      event.stopPropagation();

      // We MUST store the reference before the Promise.allSettle, otherwise
      // the event target will be the flexible-layout control
      this.#draggedViewRef = event.target;

      const views = [...this.el.shadowRoot.querySelectorAll("ch-tab")];

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

          draggableView.mainView.addEventListener(
            "mousemove",
            handleWidgetDrag(extendedDraggableView, this.#droppableAreaRef),
            { capture: true, passive: true, signal: abortController.signal }
          );
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

  private renderTab = (tabType: TabType, viewInfo: FlexibleLayoutView) => (
    <ch-tab
      id={viewInfo.id}
      key={viewInfo.id}
      slot={viewInfo.id}
      exportparts={viewInfo.exportParts}
      items={viewInfo.widgets}
      selectedId={viewInfo.selectedWidgetId}
      type={tabType}
      onExpandMainGroup={tabType === "main" ? this.handleMainGroupExpand : null}
      onItemClose={this.handleItemClose(viewInfo.id)}
      onItemDragStart={this.handleDragStart(viewInfo.id)}
      onSelectedItemChange={this.handleItemChange(viewInfo.id)}
    >
      {viewInfo.widgets.map(
        widget =>
          widget.wasRendered && <slot name={widget.id} slot={widget.id} />
      )}
    </ch-tab>
  );

  private renderView = (view: FlexibleLayoutView) =>
    view.type === "blockStart" ? (
      <header key={view.id} slot={view.id}>
        <slot />
      </header>
    ) : (
      this.renderTab(view.type, view)
    );

  render() {
    const layoutModel = this.layoutModel;

    if (layoutModel == null) {
      return "";
    }

    return (
      <Host>
        <ch-layout-splitter
          dragBarDisabled={this.dragBarDisabled}
          layout={layoutModel}
          exportparts={"bar," + this.layoutSplitterParts}
        >
          {[...this.viewsInfo.values()].map(this.renderView)}
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

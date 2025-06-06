import {
  Component,
  Element,
  Host,
  Method,
  Prop,
  State,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import {
  DragBarMouseDownEventInfo,
  GroupExtended,
  ItemExtended,
  LayoutSplitterDirection,
  LayoutSplitterModel,
  LayoutSplitterGroupModel,
  LayoutSplitterItemModel,
  LayoutSplitterLeafModel,
  LayoutSplitterItemAddResult,
  LayoutSplitterItemRemoveResult,
  LayoutSplitterSticky
} from "./types";
import {
  FIXED_SIZES_SUM_CUSTOM_VAR,
  fixAndUpdateLayoutModel,
  getMousePosition,
  sizesToGridTemplate,
  updateComponentsAndDragBar
} from "./utils";
import {
  ROOT_VIEW,
  addCursorInDocument,
  isRTL,
  removePointerEventsInDocumentBody,
  resetCursorInDocument,
  resetPointerEventsInDocumentBody
} from "../../common/utils";
import { NO_FIXED_SIZES_TO_UPDATE, removeItem } from "./remove-item";
import { addSiblingLeaf } from "./add-sibling-item";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { LAYOUT_SPLITTER_PARTS_DICTIONARY } from "../../common/reserved-names";

type Group = LayoutSplitterGroupModel;
type Item = LayoutSplitterItemModel;

const GRID_TEMPLATE_DIRECTION_CUSTOM_VAR = "--ch-layout-splitter__distribution";
const STICKY_BLOCK_START_PROP = "inset-block-start";
const STICKY_BLOCK_END_PROP = "inset-block-end";
const STICKY_INLINE_START_PROP = "inset-inline-start";
const STICKY_INLINE_END_PROP = "inset-inline-end";

const DIRECTION_CLASS = (direction: LayoutSplitterDirection) =>
  `group direction--${direction}`;

const TEMPLATE_STYLE = (
  items: Item[],
  itemsInfo: Map<string, ItemExtended>,
  fixedSizesSum: number,
  sticky?: LayoutSplitterSticky
) => ({
  [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(
    items,
    itemsInfo,
    items.length - 1
  ),
  [FIXED_SIZES_SUM_CUSTOM_VAR]: `${fixedSizesSum}px`,
  [STICKY_BLOCK_START_PROP]: sticky?.blockStart,
  [STICKY_BLOCK_END_PROP]: sticky?.blockEnd,
  [STICKY_INLINE_START_PROP]: sticky?.inlineStart,
  [STICKY_INLINE_END_PROP]: sticky?.inlineEnd
});

const getAriaControls = (layoutItems: Item[], index: number) =>
  `${layoutItems[index].id} ${layoutItems[index + 1].id}`;

// Key codes
const ARROW_UP = "ArrowUp";
const ARROW_RIGHT = "ArrowRight";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";

/**
 * @part bar - The bar that divides two columns or two rows
 */
@Component({
  shadow: true,
  styleUrl: "layout-splitter.scss",
  tag: "ch-layout-splitter"
})
export class ChLayoutSplitter implements ChComponent {
  // Sync computations with frames
  #dragRAF: SyncWithRAF; // Don't allocate memory until needed when dragging

  #mouseDownInfo: DragBarMouseDownEventInfo;
  #lastMousePosition: number;
  #newMousePosition: number;

  #fixedSizesSumRoot: number;

  // Distribution of elements
  #itemsInfo: Map<string, ItemExtended> = new Map();

  @Element() el: HTMLChLayoutSplitterElement;

  @State() dragging = false;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @Prop() readonly barAccessibleName: string = "Resize";

  /**
   * This attribute lets you specify if the resize operation is disabled in all
   * drag bars. If `true`, the drag bars are disabled.
   */
  @Prop() readonly dragBarDisabled: boolean = false;

  /**
   * Specifies the resizing increment (in pixel) that is applied when using the
   * keyboard to resize a drag bar.
   */
  @Prop() readonly incrementWithKeyboard: number = 2;

  /**
   * Specifies the list of component that are displayed. Each component will be
   * separated via a drag bar.
   */
  @Prop() readonly model: LayoutSplitterModel = {
    id: "root",
    direction: "columns",
    items: []
  };
  @Watch("model")
  modelChanged(newModel: LayoutSplitterModel) {
    this.#updateLayoutInfo(newModel);
  }

  /**
   * Schedules a new render of the control even if no state changed.
   */
  @Method()
  async refreshLayout() {
    forceUpdate(this);
  }

  /**
   *
   */
  @Method()
  async addSiblingLeaf(
    parentGroup: string,
    siblingItem: string,
    placedInTheSibling: "before" | "after",
    leafInfo: LayoutSplitterLeafModel,
    takeHalfTheSpaceOfTheSiblingItem: boolean
  ): Promise<LayoutSplitterItemAddResult> {
    const result = addSiblingLeaf(
      parentGroup,
      siblingItem,
      placedInTheSibling,
      leafInfo,
      this.#itemsInfo,
      takeHalfTheSpaceOfTheSiblingItem
    );

    if (result.success) {
      const fixedSizesSumIncrement = result.fixedSizesSumIncrement;

      // The fixesSizesSum of the parent must be updated
      if (fixedSizesSumIncrement) {
        const parentItem = this.#itemsInfo.get(parentGroup).parentItem;

        if (parentItem === ROOT_VIEW) {
          this.#fixedSizesSumRoot += fixedSizesSumIncrement;
        } else {
          (this.#itemsInfo.get(parentItem.id) as GroupExtended).fixedSizesSum +=
            fixedSizesSumIncrement;
        }
      }

      // Queue re-renders
      forceUpdate(this);
    }

    return result;
  }

  /**
   * Removes the item that is identified by the given ID.
   * The layout is rearranged depending on the state of the removed item.
   */
  @Method()
  async removeItem(itemId: string): Promise<LayoutSplitterItemRemoveResult> {
    const parentItem = this.#itemsInfo.get(itemId).parentItem;
    const result = removeItem(itemId, this.#itemsInfo);

    if (result.success) {
      const fixedSizesSumDecrement = result.fixedSizesSumDecrement;

      // The fixesSizesSum of the parent must be updated
      if (fixedSizesSumDecrement !== NO_FIXED_SIZES_TO_UPDATE) {
        if (parentItem === ROOT_VIEW) {
          this.#fixedSizesSumRoot -= fixedSizesSumDecrement;
        } else {
          (this.#itemsInfo.get(parentItem.id) as GroupExtended).fixedSizesSum -=
            fixedSizesSumDecrement;
        }
      }

      // Queue re-renders
      forceUpdate(this);
    }

    return result;
  }

  #handleBarDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.#newMousePosition = getMousePosition(
      event,
      this.#mouseDownInfo.direction
    );

    this.#mouseDownInfo.mouseEvent = event;

    this.#dragRAF.perform(this.#handleBarDragRAF);
  };

  #handleBarDragRAF = (incrementInPx?: number) => {
    updateComponentsAndDragBar(
      this.#mouseDownInfo,
      this.#itemsInfo,
      incrementInPx ?? this.#newMousePosition - this.#lastMousePosition, // Increment in px
      GRID_TEMPLATE_DIRECTION_CUSTOM_VAR
    );

    // Sync new position with last
    this.#lastMousePosition = this.#newMousePosition;
  };

  // Handler to remove mouse down
  #removeMouseMoveHandler = () => {
    document.removeEventListener("mousemove", this.#handleBarDrag, {
      capture: true
    });
  };

  // Remove mousemove and mouseup handlers when mouseup
  #mouseUpHandler = () => {
    this.dragging = false;

    // Cancel RAF to prevent access to undefined references
    if (this.#dragRAF) {
      this.#dragRAF.cancel();
    }

    // Remove handlers and state after finishing the resize
    this.#removeMouseMoveHandler();
    resetCursorInDocument();

    // Add again pointer-events
    resetPointerEventsInDocumentBody();

    document.removeEventListener("mouseup", this.#mouseUpHandler, {
      capture: true
    });
  };

  #initializeDragBarValuesForResizeProcessing = (
    direction: LayoutSplitterDirection,
    index: number,
    layoutItems: Item[],
    event: Event
  ) => {
    // Initialize the values needed for drag processing
    const dragBar = event.target as HTMLElement;
    const dragBarContainer = dragBar.parentElement;

    this.#mouseDownInfo = {
      container: dragBarContainer,
      containerSize:
        direction === "columns"
          ? dragBarContainer.clientWidth
          : dragBarContainer.clientHeight,
      direction: direction,
      dragBar: dragBar,
      fixedSizesSumRoot: this.#fixedSizesSumRoot,
      itemStartId: layoutItems[index].id,
      itemEndId: layoutItems[index + 1].id,
      layoutItems: layoutItems,
      mouseEvent: undefined, // MouseEvent is initialized as undefined, since this object is used for the keyboard event
      RTL: isRTL()
    };
  };

  #mouseDownHandler =
    (direction: LayoutSplitterDirection, index: number, layoutItems: Item[]) =>
    (event: MouseEvent) => {
      this.dragging = true;

      // Necessary to prevent selecting the inner image (or other elements) of
      // the bar item when the mouse is down
      event.preventDefault();

      this.#dragRAF ??= new SyncWithRAF();

      this.#initializeDragBarValuesForResizeProcessing(
        direction,
        index,
        layoutItems,
        event
      );

      // Set mouse cursor in the document
      addCursorInDocument(direction === "columns" ? "ew-resize" : "ns-resize");

      // Remove pointer-events during drag
      removePointerEventsInDocumentBody();

      // Mouse position
      const currentMousePosition = getMousePosition(event, direction);
      this.#lastMousePosition = currentMousePosition;
      this.#newMousePosition = currentMousePosition; // Also updated in mouse move

      // Add listeners
      document.addEventListener("mousemove", this.#handleBarDrag, {
        capture: true
      });
      document.addEventListener("mouseup", this.#mouseUpHandler, {
        capture: true,
        passive: true
      });
    };

  #handleResize =
    (direction: LayoutSplitterDirection, index: number, layoutItems: Item[]) =>
    (event: KeyboardEvent) => {
      if (
        (direction === "rows" &&
          event.code !== ARROW_UP &&
          event.code !== ARROW_DOWN) ||
        (direction === "columns" &&
          event.code !== ARROW_LEFT &&
          event.code !== ARROW_RIGHT)
      ) {
        return;
      }

      // Prevent scroll
      event.preventDefault();

      this.#initializeDragBarValuesForResizeProcessing(
        direction,
        index,
        layoutItems,
        event
      );

      const positiveIncrement =
        event.code === ARROW_RIGHT || event.code === ARROW_DOWN;

      this.#handleBarDragRAF(
        positiveIncrement
          ? this.incrementWithKeyboard
          : -this.incrementWithKeyboard
      );
    };

  #renderItem = (
    direction: LayoutSplitterDirection,
    lastComponentIndex: number,
    layoutItems: Item[],
    item: Item,
    index: number
  ) => {
    const itemUIModel = this.#itemsInfo.get(item.id);
    const isSticky = !!item.sticky;

    return [
      (item as Group).items ? (
        <div
          id={item.id}
          class={{
            [DIRECTION_CLASS((item as Group).direction)]: true,
            sticky: isSticky
          }}
          part={item.id}
          style={TEMPLATE_STYLE(
            (item as Group).items,
            this.#itemsInfo,
            (itemUIModel as GroupExtended).fixedSizesSum,
            item.sticky
          )}
        >
          {this.#renderItems(
            (item as Group).direction,
            (item as Group).items,
            (item as Group).items.length - 1
          )}
        </div>
      ) : (
        <div
          id={item.id}
          class={{ leaf: true, sticky: isSticky }}
          style={
            isSticky
              ? {
                  [STICKY_BLOCK_START_PROP]: item.sticky?.blockStart,
                  [STICKY_BLOCK_END_PROP]: item.sticky?.blockEnd,
                  [STICKY_INLINE_START_PROP]: item.sticky?.inlineStart,
                  [STICKY_INLINE_END_PROP]: item.sticky?.inlineEnd
                }
              : undefined
          }
        >
          <slot key={item.id} name={item.id} />
        </div>
      ),

      item.dragBar?.hidden !== true && index !== lastComponentIndex && (
        <div
          // - - - Accessibility - - -
          role="separator"
          aria-controls={getAriaControls(layoutItems, index)}
          aria-disabled={this.dragBarDisabled ? "true" : null}
          aria-label={this.barAccessibleName}
          aria-orientation={direction === "columns" ? "vertical" : "horizontal"}
          aria-valuetext={itemUIModel.actualSize}
          // TODO: Add aria-valuenow
          title={this.barAccessibleName}
          tabindex="0"
          // - - - - - - - - - - - - -
          class="bar"
          part={
            item.dragBar?.part
              ? `${LAYOUT_SPLITTER_PARTS_DICTIONARY.BAR} ${item.dragBar.part}`
              : LAYOUT_SPLITTER_PARTS_DICTIONARY.BAR
          }
          style={
            item.dragBar?.size ? { "--size": `${item.dragBar.size}px` } : null
          }
          onKeyDown={
            !this.dragBarDisabled
              ? this.#handleResize(direction, index, layoutItems)
              : null
          }
          onMouseDown={
            !this.dragBarDisabled
              ? this.#mouseDownHandler(direction, index, layoutItems)
              : null
          }
        ></div>
      )
    ];
  };

  #renderItems = (
    direction: LayoutSplitterDirection,
    layoutItems: Item[],
    lastComponentIndex: number
  ) =>
    layoutItems.map((item, index) =>
      this.#renderItem(direction, lastComponentIndex, layoutItems, item, index)
    );

  #updateLayoutInfo = (layout: LayoutSplitterModel) => {
    // Clear old information
    this.#itemsInfo.clear();

    if (layout?.items?.length > 0) {
      this.#fixedSizesSumRoot = fixAndUpdateLayoutModel(
        layout,
        this.#itemsInfo
      );
    }
  };

  connectedCallback() {
    this.#updateLayoutInfo(this.model);
  }

  disconnectedCallback() {
    // Defensive programming. Make sure all event listeners are removed correctly
    this.#mouseUpHandler();
  }

  render() {
    const layoutModel = this.model;

    if (layoutModel?.items == null) {
      return "";
    }

    return (
      // TODO: Add unit test for checking that the dialog is not closed when
      // a layout-splitter's bar is dragged
      // TODO: We should also add a dummy node in the ch-dialog or something
      // like that to not close the dialog when the mouse is released outside
      // of the ch-layout-splitter but inside the ch-dialog
      <Host class={this.dragging ? "ch-layout-splitter--dragging" : undefined}>
        <div
          class={DIRECTION_CLASS(layoutModel.direction)}
          style={TEMPLATE_STYLE(
            layoutModel.items,
            this.#itemsInfo,
            this.#fixedSizesSumRoot
          )}
        >
          {this.#renderItems(
            layoutModel.direction,
            layoutModel.items,
            layoutModel.items.length - 1
          )}
        </div>
      </Host>
    );
  }
}

import {
  Component,
  Element,
  Method,
  Prop,
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
  LayoutSplitterDistribution,
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionLeaf,
  LayoutSplitterItemAddResult,
  LayoutSplitterItemRemoveResult
} from "./types";
import {
  FIXED_SIZES_SUM_CUSTOM_VAR,
  fixAndUpdateLayoutModel,
  getMousePosition,
  hasMinSize,
  sizesToGridTemplate,
  updateComponentsAndDragBar
} from "./utils";
import { ROOT_VIEW, isRTL } from "../../common/utils";
import { NO_FIXED_SIZES_TO_UPDATE, removeItem } from "./remove-item";
import { addSiblingLeaf } from "./add-sibling-item";
import { SyncWithRAF } from "../../common/sync-with-frames";

type Group = LayoutSplitterDistributionGroup;
type Item = LayoutSplitterDistributionItem;

const RESIZING_CLASS = "gx-layout-splitter--resizing";
const GRID_TEMPLATE_DIRECTION_CUSTOM_VAR = "--ch-layout-splitter__distribution";

const DIRECTION_CLASS = (direction: LayoutSplitterDirection) =>
  `group direction--${direction}`;

const TEMPLATE_STYLE = (
  items: Item[],
  itemsInfo: Map<string, ItemExtended>,
  fixedSizesSum: number
) => ({
  [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(
    items,
    itemsInfo,
    items.length - 1
  ),
  [FIXED_SIZES_SUM_CUSTOM_VAR]: `${fixedSizesSum}px`
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
  @Prop() readonly layout: LayoutSplitterDistribution = {
    id: "root",
    direction: "columns",
    items: []
  };
  @Watch("layout")
  handleComponentsChange(newLayout: LayoutSplitterDistribution) {
    this.updateLayoutInfo(newLayout);
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
    leafInfo: LayoutSplitterDistributionLeaf,
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

  #addResizingStyle = () => this.el.classList.add(RESIZING_CLASS);
  #removeResizingStyle = () => this.el.classList.remove(RESIZING_CLASS);

  // Remove mousemove and mouseup handlers when mouseup
  #mouseUpHandler = () => {
    // Cancel RAF to prevent access to undefined references
    if (this.#dragRAF) {
      this.#dragRAF.cancel();
    }

    this.#removeMouseMoveHandler();

    document.removeEventListener("mouseup", this.#mouseUpHandler, {
      capture: true
    });

    // Add again pointer-events
    this.#removeResizingStyle();
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

    // Remove pointer-events during drag
    this.#addResizingStyle();
  };

  #mouseDownHandler =
    (direction: LayoutSplitterDirection, index: number, layoutItems: Item[]) =>
    (event: MouseEvent) => {
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

    return [
      (item as Group).items ? (
        <div
          id={item.id}
          class={DIRECTION_CLASS((item as Group).direction)}
          part={item.id}
          style={TEMPLATE_STYLE(
            (item as Group).items,
            this.#itemsInfo,
            (itemUIModel as GroupExtended).fixedSizesSum
          )}
        >
          {this.#renderItems(
            (item as Group).direction,
            (item as Group).items,
            (item as Group).items.length - 1
          )}
        </div>
      ) : (
        <div id={item.id} class={hasMinSize(item) ? "leaf--rendered" : "leaf"}>
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
          title={this.barAccessibleName}
          tabindex="0"
          // - - - - - - - - - - - - -
          class="bar"
          part={item.dragBar?.part ? `bar ${item.dragBar.part}` : "bar"}
          style={
            item.dragBar?.size ? { "--size": `${item.dragBar.size}px` } : null
          }
          onKeyDown={
            !this.dragBarDisabled
              ? this.#handleResize(direction, index, layoutItems)
              : null
          }
          onKeyUp={this.#removeResizingStyle}
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

  private updateLayoutInfo(layout: LayoutSplitterDistribution) {
    // Clear old information
    this.#itemsInfo.clear();

    if (layout?.items?.length > 0) {
      this.#fixedSizesSumRoot = fixAndUpdateLayoutModel(
        layout,
        this.#itemsInfo
      );

      // console.log(this.#itemsInfo);
    }
  }

  connectedCallback() {
    this.updateLayoutInfo(this.layout);
  }

  disconnectedCallback() {
    // Defensive programming. Make sure all event listeners are removed correctly
    this.#mouseUpHandler();
  }

  render() {
    const layoutModel = this.layout;

    if (layoutModel?.items == null) {
      return "";
    }

    return (
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
    );
  }
}

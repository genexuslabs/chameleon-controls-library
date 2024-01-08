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
  LayoutSplitterDirection,
  LayoutSplitterDistribution,
  LayoutSplitterDistributionGroup,
  LayoutSplitterDistributionItem,
  LayoutSplitterDistributionItemExtended,
  LayoutSplitterItemRemoveResult
} from "./types";
import {
  fixAndUpdateLayoutModel,
  getMousePosition,
  sizesToGridTemplate,
  updateComponentsAndDragBar
} from "./utils";
import { isRTL } from "../../common/utils";
import { removeItem } from "./remove-item";

const RESIZING_CLASS = "gx-layout-splitter--resizing";
const GRID_TEMPLATE_DIRECTION_CUSTOM_VAR = "--ch-layout-splitter__distribution";

const DIRECTION_CLASS = (direction: LayoutSplitterDirection) =>
  `group direction--${direction}`;

const TEMPLATE_STYLE = (
  items: LayoutSplitterDistributionItem[],
  itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  >
) => ({
  [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(
    items,
    itemsInfo,
    items.length - 1
  )
});

const getAriaControls = (
  layoutItems: LayoutSplitterDistributionItem[],
  index: number
) => `${layoutItems[index].id} ${layoutItems[index + 1].id}`;

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
  #needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  #mouseDownInfo: DragBarMouseDownEventInfo;
  #lastMousePosition: number;
  #newMousePosition: number;

  #fixedSizesSumRoot: number;

  // Distribution of elements
  #itemsInfo: Map<
    string,
    LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>
  > = new Map();

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
   * Removes the item that is identified by the given ID.
   * The layout is rearranged depending on the state of the removed item.
   */
  @Method()
  async removeItem(viewId: string): Promise<LayoutSplitterItemRemoveResult> {
    const result = removeItem(viewId, this.#itemsInfo);

    if (result.success) {
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

    this.#handleBarDragRAF();
  };

  #handleBarDragRAF = (incrementInPx?: number) => {
    if (!this.#needForRAF) {
      return;
    }
    this.#needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.#needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      updateComponentsAndDragBar(
        this.#mouseDownInfo,
        this.#itemsInfo,
        incrementInPx ?? this.#newMousePosition - this.#lastMousePosition, // Increment in px
        GRID_TEMPLATE_DIRECTION_CUSTOM_VAR
      );

      // Sync new position with last
      this.#lastMousePosition = this.#newMousePosition;
    });
  };

  // Handler to remove mouse down
  #removeMouseMoveHandler = () => {
    document.removeEventListener("mousemove", this.#handleBarDrag, {
      capture: true
    });
  };

  // Remove mousemove and mouseup handlers when mouseup
  #mouseUpHandler = () => {
    this.#removeMouseMoveHandler();

    document.removeEventListener("mouseup", this.#mouseUpHandler, {
      capture: true
    });

    // Add again pointer-events
    this.el.classList.remove(RESIZING_CLASS);
  };

  #initializeDragBarValuesForResizeProcessing = (
    direction: LayoutSplitterDirection,
    index: number,
    fixedSizesSum: number,
    layoutItems: LayoutSplitterDistributionItem[],
    event: Event
  ) => {
    // Initialize the values needed for drag processing
    const dragBarContainer = (event.target as HTMLElement).parentElement;

    this.#mouseDownInfo = {
      container: dragBarContainer,
      containerSize:
        direction === "columns"
          ? dragBarContainer.clientWidth
          : dragBarContainer.clientHeight,
      direction: direction,
      fixedSizesSum: fixedSizesSum,
      itemStartId: layoutItems[index].id,
      itemEndId: layoutItems[index + 1].id,
      layoutItems: layoutItems,
      RTL: isRTL()
    };

    // Remove pointer-events during drag
    this.el.classList.add(RESIZING_CLASS);
  };

  #mouseDownHandler =
    (
      direction: LayoutSplitterDirection,
      index: number,
      fixedSizesSum: number,
      layoutItems: LayoutSplitterDistributionItem[]
    ) =>
    (event: MouseEvent) => {
      // Necessary to prevent selecting the inner image (or other elements) of
      // the bar item when the mouse is down
      event.preventDefault();

      this.#initializeDragBarValuesForResizeProcessing(
        direction,
        index,
        fixedSizesSum,
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
    (
      direction: LayoutSplitterDirection,
      index: number,
      fixedSizesSum: number,
      layoutItems: LayoutSplitterDistributionItem[]
    ) =>
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
        fixedSizesSum,
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

  #renderItems = (
    direction: LayoutSplitterDirection,
    fixedSizesSum: number,
    layoutItems: LayoutSplitterDistributionItem[]
  ) => {
    const lastComponentIndex = layoutItems.length - 1;

    return layoutItems.map((item, index) => [
      (item as LayoutSplitterDistributionGroup).items ? (
        <div
          id={item.id}
          class={DIRECTION_CLASS(
            (item as LayoutSplitterDistributionGroup).direction
          )}
          style={TEMPLATE_STYLE(
            (item as LayoutSplitterDistributionGroup).items,
            this.#itemsInfo
          )}
        >
          {this.#renderItems(
            (item as LayoutSplitterDistributionGroup).direction,
            (
              this.#itemsInfo.get(
                item.id
              ) as LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionGroup>
            ).fixedSizesSum,
            (item as LayoutSplitterDistributionGroup).items
          )}
        </div>
      ) : (
        <div id={item.id} class="leaf">
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
              ? this.#handleResize(direction, index, fixedSizesSum, layoutItems)
              : null
          }
          onMouseDown={
            !this.dragBarDisabled
              ? this.#mouseDownHandler(
                  direction,
                  index,
                  fixedSizesSum,
                  layoutItems
                )
              : null
          }
        ></div>
      )
    ]);
  };

  private updateLayoutInfo(layout: LayoutSplitterDistribution) {
    // Clear old information
    this.#itemsInfo.clear();

    if (layout?.items?.length > 0) {
      this.#fixedSizesSumRoot = fixAndUpdateLayoutModel(
        layout,
        this.#itemsInfo
      );

      console.log(this.#itemsInfo);
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
        style={TEMPLATE_STYLE(layoutModel.items, this.#itemsInfo)}
      >
        {this.#renderItems(
          layoutModel.direction,
          this.#fixedSizesSumRoot,
          layoutModel.items
        )}
      </div>
    );
  }
}

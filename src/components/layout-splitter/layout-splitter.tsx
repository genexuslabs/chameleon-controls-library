import { Component, Element, Prop, Watch, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import {
  DragBarMouseDownEventInfo,
  LayoutSplitterDirection,
  LayoutSplitterDistribution,
  LayoutSplitterModel,
  LayoutSplitterModelGroup,
  LayoutSplitterModelItem,
  LayoutSplitterModelLeaf
} from "./types";
import {
  getLayoutModel,
  getMousePosition,
  sizesToGridTemplate,
  updateComponentsAndDragBar
} from "./utils";
import { isRTL } from "../../common/utils";

const RESIZING_CLASS = "gx-layout-splitter--resizing";
const DRAG_BAR_POSITION_CUSTOM_VAR = "--ch-drag-bar__start-position";
const GRID_TEMPLATE_DIRECTION_CUSTOM_VAR =
  "--ch-layout-splitter__grid-template-direction";

const DIRECTION_CLASS = (direction: LayoutSplitterDirection) =>
  `group direction--${direction}`;

const TEMPLATE_STYLE = (items: LayoutSplitterModelItem[]) => ({
  [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(items)
});

const getItemIndex = (indexPrefix: string, index: number) =>
  `${indexPrefix}${index}`;

const getAriaControls = (indexPrefix: string, index: number) =>
  `${indexPrefix}${index} ${indexPrefix}${index + 1}`; // Based on getItemIndex

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

  // Distribution of elements
  #layoutModel: LayoutSplitterModel;

  @Element() el: HTMLChLayoutSplitterElement;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @Prop() readonly barAccessibleName: string = "Resize";

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
    direction: "columns",
    items: []
  };
  @Watch("layout")
  handleComponentsChange(newLayout: LayoutSplitterDistribution) {
    this.updateLayoutInfo(newLayout);
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
        incrementInPx ?? this.#newMousePosition - this.#lastMousePosition, // Increment in px
        DRAG_BAR_POSITION_CUSTOM_VAR,
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
    layoutItems: LayoutSplitterModelItem[],
    event: Event
  ) => {
    // Initialize the values needed for drag processing
    const dragBar = event.target as HTMLElement;
    const dragBarContainer = dragBar.parentElement;

    this.#mouseDownInfo = {
      direction: direction,
      dragBar: dragBar,
      dragBarContainer: dragBarContainer,
      dragBarContainerSize:
        direction === "columns"
          ? dragBarContainer.clientWidth
          : dragBarContainer.clientHeight,
      fixedSizesSum: fixedSizesSum,
      index: index,
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
      layoutItems: LayoutSplitterModelItem[]
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
        capture: true
      });
    };

  #handleResize =
    (
      direction: LayoutSplitterDirection,
      index: number,
      fixedSizesSum: number,
      layoutItems: LayoutSplitterModelItem[]
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
    indexPrefix: string,
    layoutItems: LayoutSplitterModelItem[]
  ) => {
    const lastComponentIndex = layoutItems.length - 1;

    return layoutItems.map((item, index) => [
      (item as LayoutSplitterModelGroup).items ? (
        <div
          id={getItemIndex(indexPrefix, index)}
          class={DIRECTION_CLASS((item as LayoutSplitterModelGroup).direction)}
          style={TEMPLATE_STYLE((item as LayoutSplitterModelGroup).items)}
        >
          {this.#renderItems(
            (item as LayoutSplitterModelGroup).direction,
            (item as LayoutSplitterModelGroup).fixedSizesSum,
            getItemIndex(indexPrefix, index),
            (item as LayoutSplitterModelGroup).items
          )}
        </div>
      ) : (
        <div id={getItemIndex(indexPrefix, index)} class="leaf">
          <slot
            key={(item as LayoutSplitterModelLeaf).id}
            name={(item as LayoutSplitterModelLeaf).id}
          />
        </div>
      ),

      !item.hideDragBar && index !== lastComponentIndex && (
        <div
          // - - - Accessibility - - -
          role="separator"
          aria-controls={getAriaControls(indexPrefix, index)}
          aria-label={this.barAccessibleName}
          aria-orientation={direction === "columns" ? "vertical" : "horizontal"}
          title={this.barAccessibleName}
          tabindex="0"
          // - - - - - - - - - - - - -
          class="bar"
          part={item.dragBarPart ? `bar ${item.dragBarPart}` : "bar"}
          style={{
            [DRAG_BAR_POSITION_CUSTOM_VAR]: `calc(${item.dragBarPosition})`
          }}
          onKeyDown={this.#handleResize(
            direction,
            index,
            fixedSizesSum,
            layoutItems
          )}
          onMouseDown={this.#mouseDownHandler(
            direction,
            index,
            fixedSizesSum,
            layoutItems
          )}
        ></div>
      )
    ]);
  };

  private updateLayoutInfo(layout: LayoutSplitterDistribution) {
    if (layout?.items?.length > 0) {
      this.#layoutModel = getLayoutModel(layout);
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
    const layoutModel = this.#layoutModel;

    if (layoutModel?.items == null) {
      return "";
    }

    return (
      <div
        class={DIRECTION_CLASS(layoutModel.direction)}
        style={TEMPLATE_STYLE(layoutModel.items)}
      >
        {this.#renderItems(
          layoutModel.direction,
          layoutModel.fixedSizesSum,
          "item",
          layoutModel.items
        )}
      </div>
    );
  }
}

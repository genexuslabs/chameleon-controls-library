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

/**
 * @part bar - The bar that divides two columns or two rows
 */
@Component({
  shadow: true,
  styleUrl: "layout-splitter.scss",
  tag: "ch-layout-splitter"
})
export class ChLayoutSplitter implements ChComponent {
  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  private mouseDownInfo: DragBarMouseDownEventInfo;

  // Distribution of elements
  private layoutModel: LayoutSplitterModel;

  @Element() el: HTMLChLayoutSplitterElement;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @Prop() readonly barAccessibleName: string = "";

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

  private handleBarDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.mouseDownInfo.newPosition = getMousePosition(
      event,
      this.mouseDownInfo.direction
    );

    if (!this.needForRAF) {
      return;
    }
    this.needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      updateComponentsAndDragBar(
        this.mouseDownInfo,
        DRAG_BAR_POSITION_CUSTOM_VAR,
        GRID_TEMPLATE_DIRECTION_CUSTOM_VAR
      );

      // Sync new position with last
      this.mouseDownInfo.lastPosition = this.mouseDownInfo.newPosition;
    });
  };

  // Handler to remove mouse down
  private removeMouseMoveHandler = () => {
    document.removeEventListener("mousemove", this.handleBarDrag, {
      capture: true
    });
  };

  // Remove mousemove and mouseup handlers when mouseup
  private mouseUpHandler = () => {
    this.removeMouseMoveHandler();

    document.removeEventListener("mouseup", this.mouseUpHandler, {
      capture: true
    });

    // Add again pointer-events
    this.el.classList.remove(RESIZING_CLASS);
  };

  private mouseDownHandler =
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

      // Initialize the values needed for drag processing
      const dragBar = event.target as HTMLElement;
      const dragBarContainer = dragBar.parentElement;
      const currentMousePosition = getMousePosition(event, direction);

      this.mouseDownInfo = {
        direction: direction,
        dragBar: dragBar,
        dragBarContainer: dragBarContainer,
        dragBarContainerSize:
          direction === "columns"
            ? dragBarContainer.clientWidth
            : dragBarContainer.clientHeight,
        fixedSizesSum: fixedSizesSum,
        index: index,
        lastPosition: currentMousePosition,
        layoutItems: layoutItems,
        newPosition: currentMousePosition, // Also updated in mouse move
        RTL: isRTL()
      };

      // Remove pointer-events during drag
      this.el.classList.add(RESIZING_CLASS);

      // Add listeners
      document.addEventListener("mousemove", this.handleBarDrag, {
        capture: true
      });
      document.addEventListener("mouseup", this.mouseUpHandler, {
        capture: true
      });
    };

  private renderItems = (
    direction: LayoutSplitterDirection,
    fixedSizesSum: number,
    layoutItems: LayoutSplitterModelItem[]
  ) => {
    const lastComponentIndex = layoutItems.length - 1;

    return layoutItems.map((item, index) => [
      (item as LayoutSplitterModelGroup).items ? (
        <div
          class={{
            container: true,
            [`direction--${(item as LayoutSplitterModelGroup).direction}`]: true
          }}
          style={{
            [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(
              (item as LayoutSplitterModelGroup).items
            )
          }}
        >
          {this.renderItems(
            (item as LayoutSplitterModelGroup).direction,
            (item as LayoutSplitterModelGroup).fixedSizesSum,
            (item as LayoutSplitterModelGroup).items
          )}
        </div>
      ) : (
        <slot
          key={(item as LayoutSplitterModelLeaf).id}
          name={(item as LayoutSplitterModelLeaf).id}
        />
      ),

      index !== lastComponentIndex && (
        <div
          aria-label={this.barAccessibleName}
          title={this.barAccessibleName}
          class="bar"
          part="bar"
          style={{
            [DRAG_BAR_POSITION_CUSTOM_VAR]: `calc(${item.dragBarPosition})`
          }}
          onMouseDown={this.mouseDownHandler(
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
      this.layoutModel = getLayoutModel(layout);
    }
  }

  connectedCallback() {
    this.updateLayoutInfo(this.layout);
  }

  disconnectedCallback() {
    // Defensive programming. Make sure all event listeners are removed correctly
    this.mouseUpHandler();
  }

  render() {
    if (this.layoutModel == null) {
      return "";
    }

    return (
      <div
        class={{
          container: true,
          [`direction--${this.layoutModel.direction}`]: true
        }}
        style={{
          [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(
            this.layoutModel.items
          )
        }}
      >
        {this.layout?.items != null &&
          this.renderItems(
            this.layoutModel.direction,
            this.layoutModel.fixedSizesSum,
            this.layoutModel.items
          )}
      </div>
    );
  }
}

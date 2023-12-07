import { Component, Element, Prop, Watch, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import {
  DragBarMouseDownEventInfo,
  LayoutSplitterDistribution,
  LayoutSplitterDragBarPosition,
  LayoutSplitterSize
} from "./types";
import {
  getMousePosition,
  setSizesAndDragBarPosition,
  updateComponentsAndDragBar
} from "./utils";
import { isRTL } from "../../common/utils";

const DRAG_BAR_POSITION_CUSTOM_VAR = "--ch-drag-bar__start-position";
const GRID_TEMPLATE_DIRECTION_CUSTOM_VAR =
  "--ch-layout-splitter__grid-template-direction";

/**
 * @part bar - The bar of the drag-bar control that divides the start and end components
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
  private sizes: LayoutSplitterSize[] = [];
  private dragBarPositions: LayoutSplitterDragBarPosition[] = [];

  private fixedSizesSum: number;

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
    this.sizes = [];
    this.dragBarPositions = [];

    if (newLayout?.items?.length > 0) {
      this.updateLayoutInfo(newLayout);
    }
  }

  /**
   * Specifies the direction in which the components will be placed
   */
  @Prop({ reflect: true }) readonly direction: "rows" | "columns" = "columns";

  private handleBarDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.mouseDownInfo.newPosition = getMousePosition(
      event,
      this.mouseDownInfo.layout.direction
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
  };

  private mouseDownHandler =
    (
      index: number,
      dragBarPositions: LayoutSplitterDragBarPosition[],
      fixedSizesSum: number,
      layout: LayoutSplitterDistribution,
      sizes: LayoutSplitterSize[]
    ) =>
    (event: MouseEvent) => {
      // Necessary to prevent selecting the inner image (or other elements) of
      // the bar item when the mouse is down
      event.preventDefault();

      // Initialize the values needed for drag processing
      const dragBarContainer = (event.target as HTMLElement).parentElement;

      this.mouseDownInfo = {
        dragBar: event.target as HTMLElement,
        dragBarContainer: dragBarContainer,
        dragBarContainerSize:
          layout.direction === "columns"
            ? dragBarContainer.clientWidth
            : dragBarContainer.clientHeight,
        dragBarPositions: dragBarPositions,
        fixedSizesSum: fixedSizesSum,
        index: index,
        lastPosition: getMousePosition(event, layout.direction),
        layout: layout,
        newPosition: getMousePosition(event, layout.direction), // Also updated in mouse move
        RTL: isRTL(),
        sizes: sizes
      };

      // Add listeners
      document.addEventListener("mousemove", this.handleBarDrag, {
        capture: true
      });
      document.addEventListener("mouseup", this.mouseUpHandler, {
        capture: true
      });
    };

  private renderItems = (
    dragBarPositions: LayoutSplitterDragBarPosition[],
    fixedSizesSum: number,
    layout: LayoutSplitterDistribution,
    sizes: LayoutSplitterSize[]
  ) => {
    const lastComponentIndex = layout.items.length - 1;

    return layout.items.map((component, index) => [
      component.subLayout ? (
        <div
          class={{
            container: true,
            [`direction--${component.subLayout.direction}`]: true
          }}
          style={{
            [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: this.sizes[index].subLayout
              .map(item => item.size)
              .join(" ")
          }}
        >
          {this.renderItems(
            dragBarPositions[index].subLayout,
            sizes[index].subLayoutFixedSizesSum,
            component.subLayout,
            sizes[index].subLayout
          )}
        </div>
      ) : (
        <slot key={component.id} name={component.id} />
      ),

      index !== lastComponentIndex && (
        <div
          aria-label={this.barAccessibleName}
          title={this.barAccessibleName}
          class="bar"
          part="bar"
          style={{
            [DRAG_BAR_POSITION_CUSTOM_VAR]: `calc(${dragBarPositions[index].position})`
          }}
          onMouseDown={this.mouseDownHandler(
            index,
            dragBarPositions,
            fixedSizesSum,
            layout,
            sizes
          )}
        ></div>
      )
    ]);
  };

  private updateLayoutInfo(layout: LayoutSplitterDistribution) {
    const { dragBarPositionsSubLayout, subLayout, subLayoutFixedSizesSum } =
      setSizesAndDragBarPosition(layout);

    this.fixedSizesSum = subLayoutFixedSizesSum;
    this.dragBarPositions = dragBarPositionsSubLayout;
    this.sizes = subLayout;
  }

  connectedCallback() {
    if (this.layout?.items?.length > 0) {
      this.updateLayoutInfo(this.layout);
    }
  }

  disconnectedCallback() {
    // Defensive programming. Make sure all event listeners are removed correctly
    this.mouseUpHandler();
  }

  render() {
    return (
      <div
        class={{
          container: true,
          [`direction--${this.layout.direction}`]: true
        }}
        style={{
          [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: this.sizes
            .map(item => item.size)
            .join(" ")
        }}
      >
        {this.layout?.items != null &&
          this.renderItems(
            this.dragBarPositions,
            this.fixedSizesSum,
            this.layout,
            this.sizes
          )}
      </div>
    );
  }
}

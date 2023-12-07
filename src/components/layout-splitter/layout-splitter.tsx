import { Component, Element, Host, Prop, Watch, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { DragBarComponent, DragBarMouseDownEventInfo } from "./types";
import {
  getMousePosition,
  setSizesAndDragBarPosition,
  updateComponentsAndDragBar
} from "./utils";
import { isRTL } from "../../common/utils";

const DRAG_BAR_POSITION_CUSTOM_VAR = "--ch-drag-bar__start-position";

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
  private sizes: string[] = [];
  private dragBarPositions: string[] = [];

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
  @Prop() readonly components: DragBarComponent[] = [];
  @Watch("components")
  handleComponentsChange(newValue: DragBarComponent[]) {
    this.sizes = [];
    this.dragBarPositions = [];

    if (newValue == null || newValue.length === 0) {
      return;
    }

    this.fixedSizesSum = setSizesAndDragBarPosition(
      this.components,
      this.sizes,
      this.dragBarPositions
    );
  }

  private handleBarDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.mouseDownInfo.newPosition = getMousePosition(event);

    if (!this.needForRAF) {
      return;
    }
    this.needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      updateComponentsAndDragBar(
        this.mouseDownInfo,
        this.components,
        this.sizes,
        this.dragBarPositions,
        this.fixedSizesSum,
        DRAG_BAR_POSITION_CUSTOM_VAR
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

  private mouseDownHandler = (index: number) => (event: MouseEvent) => {
    // Necessary to prevent selecting the inner image (or other elements) of
    // the bar item when the mouse is down
    event.preventDefault();

    // Initialize the mouse position, drag bar index and drag bar element
    this.mouseDownInfo.dragBar = event.target as HTMLElement;
    this.mouseDownInfo.index = index;
    this.mouseDownInfo.lastPosition = getMousePosition(event);
    this.mouseDownInfo.RTL = isRTL();

    // Add listeners
    document.addEventListener("mousemove", this.handleBarDrag, {
      capture: true
    });
    document.addEventListener("mouseup", this.mouseUpHandler, {
      capture: true
    });
  };

  connectedCallback() {
    if (this.components?.length > 0) {
      this.fixedSizesSum = setSizesAndDragBarPosition(
        this.components,
        this.sizes,
        this.dragBarPositions
      );
    }

    // Initialize mouseDown event info
    this.mouseDownInfo = {
      dragBar: null,
      dragBarContainer: this.el,
      index: -1,
      lastPosition: -1,
      newPosition: -1,
      RTL: isRTL()
    };
  }

  disconnectedCallback() {
    // Defensive programming. Make sure all event listeners are removed correctly
    this.mouseUpHandler();
  }

  render() {
    const lastComponentIndex = this.components.length - 1;

    return (
      <Host
        style={{
          "grid-template-columns": this.sizes.join(" ")
        }}
      >
        {this.components.map((component, index) => [
          <slot key={component.id} name={component.id} />,

          index !== lastComponentIndex && (
            <div
              aria-label={this.barAccessibleName}
              title={this.barAccessibleName}
              class="bar"
              part="bar"
              style={{
                [DRAG_BAR_POSITION_CUSTOM_VAR]: `calc(${this.dragBarPositions[index]})`
              }}
              onMouseDown={this.mouseDownHandler(index)}
            ></div>
          )
        ])}
      </Host>
    );
  }
}

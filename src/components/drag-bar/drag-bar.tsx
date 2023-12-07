import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { DragBarComponent, DragBarMouseDownEventInfo } from "./types";
import {
  getMousePosition,
  setSizesAndDragBarPosition,
  updateComponentsAndDragBar
} from "./utils";

const DRAG_BAR_POSITION_CUSTOM_VAR = "--ch-drag-bar__inset-inline-start";

/**
 * @part bar - The bar of the drag-bar control that divides the start and end components
 */
@Component({
  shadow: true,
  styleUrl: "drag-bar.scss",
  tag: "ch-drag-bar"
})
export class DragBar implements ChComponent {
  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  private rtlWatcher: MutationObserver;

  private mouseDownInfo: DragBarMouseDownEventInfo;

  // Distribution of elements
  private sizes: string[] = [];
  private dragBarPositions: string[] = [];

  private fixedSizesSum: number;

  @Element() el: HTMLChDragBarElement;

  /**
   * Determine the language direction.
   */
  @State() isRTLDirection = false;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @Prop() readonly barAccessibleName: string = "";

  /**
   * Specifies the list of component that are displayed. Each component will be
   * separated via a drag bar.
   */
  @Prop() readonly components: DragBarComponent[] = [
    { id: "start-component", size: "3fr" },
    { id: "end-end-component", size: "2fr" },
    { id: "center-component", size: "200px" },
    { id: "end-component", size: "180px" }
  ];

  // { id: "start-component", size: "0.7fr" },
  // { id: "center-component", size: "0.1fr" },
  // { id: "end-component", size: "80px" },
  // { id: "end-end-component", size: "0.2fr" }

  // { id: "start-component", size: "3fr" },
  // { id: "center-component", size: "1fr" },
  // { id: "end-component", size: "80px" },
  // { id: "end-end-component", size: "2fr" }

  /**
   * A CSS class to set as the `ch-next-drag-bar` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   * Specifies the initial width of the start component
   */
  @Prop() readonly startComponentInitialWidth: string = "50%";

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

  connectedCallback() {
    this.rtlWatcher = new MutationObserver(mutations => {
      this.isRTLDirection = (mutations[0].target as Document).dir === "rtl";
    });

    // Watch changes in the dir attribute of the html tag
    this.rtlWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
      childList: false,
      subtree: false
    });

    // Initialize the value, since the observer won't do it
    this.isRTLDirection = document.documentElement.dir === "rtl";

    this.fixedSizesSum = setSizesAndDragBarPosition(
      this.components,
      this.sizes,
      this.dragBarPositions
    );

    // Initialize mouseDown event info
    this.mouseDownInfo = {
      dragBar: null,
      dragBarContainer: this.el,
      index: -1,
      lastPosition: -1,
      newPosition: -1
    };
  }

  private mouseDownHandler = (index: number) => (event: MouseEvent) => {
    // Necessary to prevent selecting the inner image (or other elements) of
    // the bar item when the mouse is down
    event.preventDefault();

    // Initialize the mouse position, drag bar index and drag bar element
    this.mouseDownInfo.lastPosition = getMousePosition(event);
    this.mouseDownInfo.index = index;
    this.mouseDownInfo.dragBar = event.target as HTMLElement;

    // Handler to remove mouse down
    const removeMouseMoveHandler = () => {
      document.removeEventListener("mousemove", this.handleBarDrag, {
        capture: true
      });
    };

    // Remove mousemove and mouseup handlers when mouseup
    const mouseUpHandler = () => {
      removeMouseMoveHandler();

      document.removeEventListener("mouseup", mouseUpHandler, {
        capture: true
      });
    };

    // Add listeners
    document.addEventListener("mousemove", this.handleBarDrag, {
      capture: true
    });
    document.addEventListener("mouseup", mouseUpHandler, { capture: true });
  };

  disconnectedCallback() {
    if (this.rtlWatcher) {
      this.rtlWatcher.disconnect();
      this.rtlWatcher = null;
    }
  }

  render() {
    const lastComponentIndex = this.components.length - 1;

    return (
      <Host
        class={this.cssClass || undefined}
        style={{
          "grid-template-columns": this.sizes.join(" ")
        }}
      >
        {this.components.map((component, index) => [
          <slot name={component.id} />,

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

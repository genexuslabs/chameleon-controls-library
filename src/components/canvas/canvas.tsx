import { Component, Element, Host, Prop, State, Watch, h } from "@stencil/core";
import {
  CanvasGridSettings,
  CanvasItemModel,
  CanvasModel,
  CanvasPosition,
  CanvasPositionLimit
} from "./types";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { drawCanvas } from "./draw/draw";
import { handleCanvasWheel } from "./handlers/wheel";
import {
  DEFAULT_GRID_SETTINGS_TYPE,
  DEFAULT_SCALE_LOWER_BOUND_LIMIT,
  DEFAULT_SCALE_UPPER_BOUND_LIMIT,
  getLimitedScaleValue
} from "./utils";
import { handleMouseMoveWithoutDrag } from "./handlers/mouse-move";

@Component({
  shadow: true,
  styleUrl: "canvas.scss",
  tag: "ch-canvas"
})
export class ChCanvas {
  // Observers and sync with frames
  #syncWithRAFMouseWheel: SyncWithRAF = new SyncWithRAF();
  #syncWithRAFMouseMove: SyncWithRAF = new SyncWithRAF();
  #resizeObserver: ResizeObserver | undefined; // Allocated at runtime to save resources

  #canvasWidth: number;
  #canvasHeight: number;

  #shouldUpdateCanvasDraw: boolean = false;
  #itemOver: CanvasItemModel | null = null;

  // Events
  #dragStartX: number;
  #dragStartY: number;
  #lastMouseMoveDragEvent: MouseEvent;
  #lastMouseMoveWithoutDragEvent: MouseEvent;
  #lastWheelEvent: WheelEvent;

  // Refs
  #canvasContext: CanvasRenderingContext2D;
  #canvasRef: HTMLCanvasElement;

  @Element() el!: HTMLChCanvasElement;

  @State() dragging = false;
  @State() hoveringItem = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * Specifies the position of the context (originX, originY and scale).
   */
  @Prop() readonly contextPosition: CanvasPosition = {
    scale: 1,
    originX: 0,
    originY: 0
  };
  @Watch("contextPosition")
  contextPositionChanged() {
    this.#shouldUpdateCanvasDraw = true;
  }

  /**
   * Specifies the value limits for the `contextPosition` property.
   */
  @Prop() readonly contextPositionLimit?: CanvasPositionLimit = {
    scaleLowerBound: DEFAULT_SCALE_LOWER_BOUND_LIMIT,
    scaleUpperBound: DEFAULT_SCALE_UPPER_BOUND_LIMIT
  };
  @Watch("contextPositionLimit")
  contextPositionLimitChanged() {
    this.contextPosition.scale = getLimitedScaleValue(
      this.contextPosition.scale,
      this.el
    );
    this.#shouldUpdateCanvasDraw = true;
  }

  /**
   * Specifies if a grid must be displayed as a background for the canvas.
   */
  @Prop() readonly drawGrid?: boolean = false;
  @Watch("drawGrid")
  drawGridChanged() {
    this.#shouldUpdateCanvasDraw = true;
  }

  /**
   *
   */
  @Prop() readonly gridSettings: CanvasGridSettings = {
    size: 50,
    color: "#000",
    type: DEFAULT_GRID_SETTINGS_TYPE
  };
  @Watch("gridSettings")
  gridSettingsChanged() {
    this.#shouldUpdateCanvasDraw = true;
  }

  /**
   * Specifies the model of control.
   */
  @Prop() readonly model: CanvasModel;
  @Watch("model")
  modelChanged() {
    this.#shouldUpdateCanvasDraw = true;
  }

  #updateCanvasSize = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const dialogRect = this.el.getBoundingClientRect();

    this.#canvasWidth = dialogRect.width;
    this.#canvasHeight = dialogRect.height;

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    if (this.#canvasRef) {
      this.#canvasRef.width = this.#canvasWidth;
      this.#canvasRef.height = this.#canvasHeight;
      this.#drawCanvas();
    }
  };

  #drawCanvas = () =>
    drawCanvas(
      this.el,
      this.#canvasContext,
      this.#itemOver,
      this.#canvasWidth,
      this.#canvasHeight
    );

  #setCanvasSizeWatcher = () => {
    this.#resizeObserver ??= new ResizeObserver(this.#updateCanvasSize);
    this.#resizeObserver.observe(this.el);
  };

  #handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.#lastWheelEvent = event;

    this.#syncWithRAFMouseWheel.perform(() => {
      handleCanvasWheel(this.el, this.#lastWheelEvent);
      this.#drawCanvas();
    });
  };

  #handleMouseDown = (event: MouseEvent) => {
    this.dragging = true;

    this.#dragStartX = event.clientX - this.contextPosition.originX;
    this.#dragStartY = event.clientY - this.contextPosition.originY;
  };

  #handleMouseMoveDragging = (event: MouseEvent) => {
    this.#lastMouseMoveDragEvent = event;
    this.#syncWithRAFMouseMove.perform(() => {
      this.contextPosition.originX =
        this.#lastMouseMoveDragEvent.clientX - this.#dragStartX;
      this.contextPosition.originY =
        this.#lastMouseMoveDragEvent.clientY - this.#dragStartY;

      this.#drawCanvas();
    });
  };

  #handleMouseMoveWithoutDrag = (event: MouseEvent) => {
    this.#lastMouseMoveWithoutDragEvent = event;

    this.#syncWithRAFMouseMove.perform(() => {
      const newItemOver = handleMouseMoveWithoutDrag(
        this.el,
        this.#lastMouseMoveWithoutDragEvent
      );

      this.hoveringItem = newItemOver !== null;

      if (this.#itemOver !== newItemOver) {
        this.#itemOver = newItemOver;
        this.#drawCanvas();
      }
    });
  };

  #handleCancelDrag = () => {
    this.dragging = false;
  };

  connectedCallback() {
    this.#setCanvasSizeWatcher();
  }

  componentWillRender() {
    if (this.#shouldUpdateCanvasDraw) {
      this.#shouldUpdateCanvasDraw = false;
      this.#drawCanvas();
    }
  }

  componentDidLoad() {
    this.#canvasContext = this.#canvasRef.getContext("2d");
    this.#updateCanvasSize();
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;

    this.#syncWithRAFMouseWheel?.cancel();
    this.#syncWithRAFMouseMove?.cancel();
    this.#syncWithRAFMouseWheel = undefined;
    this.#syncWithRAFMouseMove = undefined;
  }

  render() {
    return (
      <Host>
        <canvas
          aria-label={this.accessibleName}
          class={this.hoveringItem ? "hovering-item" : null}
          // Don't add the width and height bindings using the #canvasWidth and
          // #canvasHeight variables
          onMouseDown={!this.dragging && this.#handleMouseDown}
          onMouseMove={
            this.dragging
              ? this.#handleMouseMoveDragging
              : this.#handleMouseMoveWithoutDrag
          }
          onMouseUp={this.dragging && this.#handleCancelDrag}
          onMouseLeave={this.dragging && this.#handleCancelDrag}
          onWheel={!this.dragging && this.#handleWheel}
          ref={el => (this.#canvasRef = el)}
        ></canvas>
      </Host>
    );
  }
}

import { Component, Element, Host, Prop, State, Watch, h } from "@stencil/core";
import { CanvasModel, CanvasPosition } from "./types";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { drawCanvas } from "./draw/draw";
import { handleCanvasWheel } from "./handlers/wheel";

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

  // Events
  #dragStartX: number;
  #dragStartY: number;
  #lastMouseMoveEvent: MouseEvent;
  #lastWheelEvent: WheelEvent;

  // Refs
  #canvasContext: CanvasRenderingContext2D;
  #canvasRef: HTMLCanvasElement;

  @Element() el!: HTMLChCanvasElement;

  @State() dragging = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * Specifies the position of the context (originX, originY and scale).
   */
  @Prop() readonly contextPosition?: CanvasPosition = {
    scale: 1,
    originX: 0,
    originY: 0
  };
  @Watch("contextPosition")
  contextPositionChanged() {
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
      this.#canvasContext,
      this.contextPosition,
      this.model,
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

  #handleMouseMove = (event: MouseEvent) => {
    this.#lastMouseMoveEvent = event;
    this.#syncWithRAFMouseMove.perform(() => {
      this.contextPosition.originX =
        this.#lastMouseMoveEvent.clientX - this.#dragStartX;
      this.contextPosition.originY =
        this.#lastMouseMoveEvent.clientY - this.#dragStartY;

      this.#drawCanvas();
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
    this.#drawCanvas();
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
          width={this.#canvasWidth}
          height={this.#canvasHeight}
          onMouseDown={!this.dragging && this.#handleMouseDown}
          onMouseMove={this.dragging && this.#handleMouseMove}
          onMouseUp={this.dragging && this.#handleCancelDrag}
          onMouseLeave={this.dragging && this.#handleCancelDrag}
          onWheel={!this.dragging && this.#handleWheel}
          ref={el => (this.#canvasRef = el)}
        ></canvas>
      </Host>
    );
  }
}

import { Component, Element, Host, Prop, Watch, h } from "@stencil/core";
import { CanvasModel } from "./types";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { drawCanvas } from "./draw/draw";

@Component({
  shadow: true,
  styleUrl: "canvas.scss",
  tag: "ch-canvas"
})
export class ChCanvas {
  // Allocated at runtime to save resources
  #syncWithRAFMouseDrag: SyncWithRAF | undefined;
  #resizeObserver: ResizeObserver | undefined;

  #canvasWidth: number;
  #canvasHeight: number;

  // Refs
  #canvasContext: CanvasRenderingContext2D;
  #canvasRef: HTMLCanvasElement;

  @Element() el!: HTMLChCanvasElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   *
   */
  @Prop() readonly model: CanvasModel;
  @Watch("model")
  modelChanged() {
    this.#drawCanvas();
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
      this.model,
      this.#canvasWidth,
      this.#canvasHeight
    );

  #setCanvasSizeWatcher = () => {
    this.#resizeObserver ??= new ResizeObserver(this.#updateCanvasSize);
    this.#resizeObserver.observe(this.el);
  };

  connectedCallback() {
    this.#setCanvasSizeWatcher();
  }

  componentDidLoad() {
    this.#canvasContext = this.#canvasRef.getContext("2d");
    this.#drawCanvas();
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;

    this.#syncWithRAFMouseDrag?.cancel();
    this.#syncWithRAFMouseDrag = undefined;
  }

  render() {
    return (
      <Host>
        <canvas
          aria-label={this.accessibleName}
          width={this.#canvasWidth}
          height={this.#canvasHeight}
          ref={el => (this.#canvasRef = el)}
        ></canvas>
      </Host>
    );
  }
}

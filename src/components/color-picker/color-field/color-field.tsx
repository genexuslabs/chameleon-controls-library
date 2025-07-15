import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import {
  COLOR_PICKER_PARTS_DICTIONARY,
  KEY_CODES
} from "../../../common/reserved-names";
import {
  ColorFormat,
  isValidColor,
  isValidColorFormat,
  parseRgba,
  rgbToHex,
  rgbToHsl,
  rgbToHsla
} from "../utils";

@Component({
  tag: "ch-color-field",
  styleUrl: "color-field.scss",
  formAssociated: true,
  shadow: { delegatesFocus: true }
})
export class ChColorField {
  /**
   *  Accessible name for assistive technologies
   */
  @Prop() readonly accessibleName: string;

  /**
   *  Base color for the gradient
   */
  @Prop({ mutable: true }) baseColor: string;

  @Watch("baseColor")
  baseColorChanged() {
    // Validate the base color
    if (!isValidColor(this.baseColor)) {
      console.warn(
        `Invalid base color: ${this.baseColor}. Defaulting to "#000000"`
      );
      this.baseColor = "#000000";
    }
    this.#drawColorField();
  }

  // el AttachInternals()

  /**
   *  Color format
   */
  @Prop({ mutable: true }) colorFormat: ColorFormat;

  @Watch("colorFormat")
  colorFormatChanged() {
    // Validate the format color
    if (!isValidColorFormat(this.colorFormat)) {
      console.warn(
        `Invalid color format: ${this.colorFormat}. Defaulting to "RGB".`
      );
      this.colorFormat = "RGB";
    }
  }

  /**
   * Height of the canvas
   */
  @Prop() readonly height: number;

  /**
   * Selected color
   */
  @Prop({ mutable: true }) selectedColor: string;

  /**
   * Width of the canvas
   */
  @Prop() readonly width: number;

  /**
   * Emit the new color value
   */
  @Event() input: EventEmitter<string>;

  #currentX: number = 0;
  #currentY: number = 0;
  #canvasRef: HTMLCanvasElement;
  #resizeObserver: ResizeObserver;
  #statusMessage: string = "";

  #drawColorField = (): void => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    const { width, height } = this.#canvasRef;

    // Horizontal gradients from white to the base color
    const horizontalGradient = ctx.createLinearGradient(0, 0, width, 0);
    horizontalGradient.addColorStop(0, "rgb(255, 255, 255)");
    horizontalGradient.addColorStop(1, this.baseColor);
    ctx.fillStyle = horizontalGradient;
    ctx.fillRect(0, 0, width, height);

    // Vertical gradient from transparent black to opaque black
    const verticalGradient = ctx.createLinearGradient(0, 1, 0, height);
    verticalGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    verticalGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = verticalGradient;
    ctx.fillRect(0, 0, width, height);

    this.#drawMarker();
  };

  #drawMarker = (): void => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });

    // Marker for the current position on canvas
    const RADIO_SIZE = 3;
    const MARKER_COLOR = "rgb(255, 255, 255)";
    const MARKER_WIDTH = 2;

    ctx.beginPath();
    ctx.arc(this.#currentX, this.#currentY, RADIO_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = this.#getColorFromCanvas();
    ctx.fill();
    ctx.strokeStyle = MARKER_COLOR;
    ctx.lineWidth = MARKER_WIDTH;
    ctx.stroke();
  };

  #formatColor = (color: string): string => {
    const rgba = parseRgba(color);
    if (this.colorFormat === "HEX") {
      return rgbToHex(color);
    }
    if (this.colorFormat === "HSL") {
      return rgbToHsl(color);
    }
    if (this.colorFormat === "HSLA") {
      return rgbToHsla(color);
    }
    if (this.colorFormat === "RGB") {
      return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
    }
    // Default color as RGBA
    return color;
  };

  #handleCanvasClick = (event: MouseEvent) => {
    const rect = this.#canvasRef.getBoundingClientRect();
    this.#currentX = event.clientX - rect.left; // X position on the canvas
    this.#currentY = event.clientY - rect.top; // Y position on the canvas

    this.selectedColor = this.#getColorFromCanvas();
    console.log("picked: ", this.selectedColor);

    const formattedColor = this.#formatColor(this.selectedColor);
    this.input.emit(formattedColor);

    console.log("formatted color to: ", formattedColor);
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    console.log(
      "current position\n X: ",
      this.#currentX,
      "Y: ",
      this.#currentY
    );
    console.log(event.key);
    switch (event.key) {
      case KEY_CODES.ARROW_UP:
        this.#currentY -= 5;
        if (this.#currentY < 0) {
          this.#currentY = 0;
        }
        this.#drawColorField();
        event.preventDefault();
        break;
      case KEY_CODES.ARROW_DOWN:
        this.#currentY += 5;
        if (this.#currentY > this.height) {
          this.#currentY = this.height;
        }
        this.#drawColorField();
        event.preventDefault();
        break;
      case KEY_CODES.ARROW_LEFT:
        this.#currentX -= 5;
        if (this.#currentX < 0) {
          this.#currentX = 0;
        }
        this.#drawColorField();
        event.preventDefault();
        break;
      case KEY_CODES.ARROW_RIGHT:
        this.#currentX += 5;
        if (this.#currentX > this.width) {
          this.#currentX = this.width;
        }
        this.#drawColorField();
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  #getColorFromCanvas = (): string => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return this.baseColor;
    }

    const imageData = ctx.getImageData(this.#currentX, this.#currentY, 1, 1);
    const [r, g, b, a] = imageData.data;

    this.#statusMessage = `Current position: X: ${this.#currentX}, Y: ${
      this.#currentY
    }. Selected color: ${this.selectedColor}.`;

    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  };

  connectedCallback() {
    // Validate the base color
    if (!isValidColor(this.baseColor)) {
      console.warn(
        `Invalid base color: ${this.baseColor}. Defaulting to "#000000".`
      );
      this.baseColor = "#000000";
    }
  }

  componentDidLoad() {
    this.#drawColorField();

    // Initialize ResizeObserver
    this.#resizeObserver = new ResizeObserver(() => {
      this.#drawColorField();
    });

    // Observe the canvas for size changes
    this.#resizeObserver.observe(this.#canvasRef);
  }

  disconnectedCallback() {
    // Disconnect the observer when the component is unloaded
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }
  }

  render() {
    return (
      <Host aria-describedby role="application">
        <canvas
          aria-label={this.accessibleName}
          height={this.height}
          onClick={this.#handleCanvasClick}
          onKeyDown={this.#handleKeyDown}
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FIELD}
          ref={el => (this.#canvasRef = el as HTMLCanvasElement)}
          role="application"
          tabindex="0"
          width={this.width}
        ></canvas>
        {/* marker */}
        <div></div>
        <ch-status accessibleName="Informative message for color selection">
          <div id="colorFeedback" hidden>
            {this.#statusMessage}
          </div>
        </ch-status>
      </Host>
    );
  }
}

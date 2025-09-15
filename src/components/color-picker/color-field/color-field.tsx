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
import { SyncWithRAF } from "../../../common/sync-with-frames";
import {
  ColorFormat,
  ColorVariants,
  isValidColor,
  isValidColorFormat,
  parseRgba,
  rgbToHex,
  rgbToHsl,
  rgbToHsla
} from "../utils";
import { CURRENT_X, CURRENT_Y, SELECTED_COLOR } from "./constants";
import { ColorFieldTranslations } from "./translations";

@Component({
  tag: "ch-color-field",
  styleUrl: "color-field.scss",
  formAssociated: true,
  shadow: { delegatesFocus: true }
})
export class ChColorField {
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

  /**
   *  Color format
   */
  @Prop({ mutable: true }) colorFormat: ColorFormat;

  @Watch("colorFormat")
  colorFormatChanged() {
    // Validate the format color
    if (!isValidColorFormat(this.colorFormat)) {
      console.warn(
        `Invalid color format: ${this.colorFormat}. Defaulting to "rgb".`
      );
      this.colorFormat = "rgb";
    }
  }

  /**
   * Step to navigate on the canvas
   */
  @Prop() readonly step: number = 1;

  /**
   * Selected color
   */
  @Prop({ mutable: true }) selectedColor: ColorVariants;

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: ColorFieldTranslations = {
    accessibleName: {
      label: "Color field",
      description: "2D color selector",
      statusLabel: "Color information",
      statusMessage: `Current position: X: ${CURRENT_X}, Y: ${CURRENT_Y}. Selected color: ${SELECTED_COLOR}`
    }
  };

  /**
   * Emit the new color value
   */
  @Event() input: EventEmitter<string>;

  #currentX: number = 0;
  #currentY: number = 0;
  #canvasRef: HTMLCanvasElement;
  #markerRef: HTMLDivElement;
  #resizeObserver: ResizeObserver;
  #isDragging: boolean = false;
  #resizeRAF: SyncWithRAF = new SyncWithRAF();
  #dragRAF: SyncWithRAF = new SyncWithRAF();

  #updateCanvasSize = (): void => {
    if (this.#canvasRef) {
      this.#canvasRef.width = this.#canvasRef.clientWidth;
      this.#canvasRef.height = this.#canvasRef.clientHeight;
      this.#drawColorField();
    }
  };

  #drawColorField = (): void => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    const { width, height } = this.#canvasRef;

    // Horizontal gradients from white to the base color
    const horizontalGradient = ctx.createLinearGradient(1, 0, width, 0);
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
    if (this.#markerRef) {
      this.#markerRef.style.left = `${this.#currentX}px`;
      this.#markerRef.style.top = `${this.#currentY}px`;
    }
  };

  #getFormattedColor = (colorObject: ColorVariants): string => {
    return colorObject[this.colorFormat];
  };

  #updateCoordinates = (event: MouseEvent): void => {
    const rect = this.#canvasRef.getBoundingClientRect();
    const canvasWidth = this.#canvasRef.width;
    const canvasHeight = this.#canvasRef.height;

    // Clamp coordinates to valid pixel range (0 to width-1, 0 to height-1)
    this.#currentX = Math.max(
      0,
      Math.min(canvasWidth - 1, event.clientX - rect.left)
    );
    this.#currentY = Math.max(
      0,
      Math.min(canvasHeight - 1, event.clientY - rect.top)
    );

    this.selectedColor = this.#getColorFromCanvas();
    this.#drawMarker();
  };

  #handleCanvasClick = (event: MouseEvent) => {
    this.#updateCoordinates(event);
    this.input.emit(this.#getFormattedColor(this.selectedColor));
  };

  #handleMouseDown = (event: MouseEvent) => {
    this.#isDragging = true;
    this.#updateCoordinates(event);
  };

  #handleMouseMove = (event: MouseEvent) => {
    if (this.#isDragging) {
      this.#dragRAF.perform(
        () => {
          this.#updateCoordinates(event);
        },
        () => {
          // Store coordinates immediately for responsiveness with proper clamping
          const rect = this.#canvasRef.getBoundingClientRect();
          const canvasWidth = this.#canvasRef.width;
          const canvasHeight = this.#canvasRef.height;

          this.#currentX = Math.max(
            0,
            Math.min(canvasWidth - 1, event.clientX - rect.left)
          );
          this.#currentY = Math.max(
            0,
            Math.min(canvasHeight - 1, event.clientY - rect.top)
          );
        }
      );
    }
  };

  #handleMouseUp = () => {
    if (this.#isDragging) {
      this.#isDragging = false;
      this.input.emit(this.#getFormattedColor(this.selectedColor));
    }
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    const canvasHeight = this.#canvasRef?.height || 0;
    const canvasWidth = this.#canvasRef?.width || 0;

    switch (event.key) {
      case KEY_CODES.ARROW_UP:
        this.#currentY -= this.step;
        if (this.#currentY < 0) {
          this.#currentY = 0;
        }
        this.#drawMarker();
        event.preventDefault();
        break;
      case KEY_CODES.ARROW_DOWN:
        this.#currentY += this.step;
        if (this.#currentY >= canvasHeight) {
          this.#currentY = canvasHeight - 1;
        }
        this.#drawMarker();
        event.preventDefault();
        break;
      case KEY_CODES.ARROW_LEFT:
        this.#currentX -= this.step;
        if (this.#currentX < 0) {
          this.#currentX = 0;
        }
        this.#drawMarker();
        event.preventDefault();
        break;
      case KEY_CODES.ARROW_RIGHT:
        this.#currentX += this.step;
        if (this.#currentX >= canvasWidth) {
          this.#currentX = canvasWidth - 1;
        }
        this.#drawMarker();
        event.preventDefault();
        break;
      default:
        break;
    }
    this.selectedColor = this.#getColorFromCanvas();
  };

  #getColorFromCanvas = (): ColorVariants => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      // Return a fallback ColorVariants object using the base color
      const fallbackRgba = parseRgba(this.baseColor) || {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      };
      const fallbackData = [
        fallbackRgba.r,
        fallbackRgba.g,
        fallbackRgba.b,
        fallbackRgba.a
      ];

      return {
        rgb: `rgb(${fallbackRgba.r}, ${fallbackRgba.g}, ${fallbackRgba.b})`,
        rgba: `rgba(${fallbackRgba.r}, ${fallbackRgba.g}, ${fallbackRgba.b}, ${fallbackRgba.a})`,
        hex: rgbToHex(fallbackData),
        hsl: rgbToHsl(fallbackData),
        hsla: rgbToHsla(fallbackData)
      };
    }

    const imageData = ctx.getImageData(this.#currentX, this.#currentY, 1, 1);
    const [r, g, b, a] = imageData.data;

    return {
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r},${g}, ${b}, ${a})`,
      hex: rgbToHex(imageData.data),
      hsl: rgbToHsl(imageData.data),
      hsla: rgbToHsla(imageData.data)
    };
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
    this.#updateCanvasSize();

    // Initialize ResizeObserver with RAF optimization
    this.#resizeObserver = new ResizeObserver(() => {
      this.#resizeRAF.perform(() => {
        this.#updateCanvasSize();
      });
    });

    // Observe the canvas for size changes
    this.#resizeObserver.observe(this.#canvasRef);
  }

  disconnectedCallback() {
    // Disconnect the observer when the component is unloaded
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }

    // Cancel pending RAF operations
    this.#resizeRAF.cancel();
    this.#dragRAF.cancel();
  }

  render() {
    const { accessibleName } = this.translations;
    return (
      <Host>
        <canvas
          aria-label={accessibleName.label}
          aria-roledescription={accessibleName.description}
          aria-describedby="color-information"
          onClick={this.#handleCanvasClick}
          onKeyDown={this.#handleKeyDown}
          onMouseDown={this.#handleMouseDown}
          onMouseMove={this.#handleMouseMove}
          onMouseUp={this.#handleMouseUp}
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FIELD}
          ref={el => (this.#canvasRef = el as HTMLCanvasElement)}
          role="application"
          tabindex="0"
        ></canvas>
        <div
          class="marker"
          part={COLOR_PICKER_PARTS_DICTIONARY.MARKER}
          ref={el => {
            this.#markerRef = el as HTMLDivElement;
          }}
        ></div>
        <ch-status
          id="color-information"
          accessibleName={accessibleName.statusLabel}
        >
          <div id="colorFeedback" hidden>
            {accessibleName.statusMessage
              .replace(CURRENT_X, this.#currentX.toString())
              .replace(CURRENT_Y, this.#currentY.toString())
              .replace(
                SELECTED_COLOR,
                this.#getFormattedColor(this.selectedColor)
              )}
          </div>
        </ch-status>
      </Host>
    );
  }
}

import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";
import {
  COLOR_PICKER_PARTS_DICTIONARY,
  KEY_CODES
} from "../../../common/reserved-names";
import { SyncWithRAF } from "../../../common/sync-with-frames";
import { ColorVariants, parseColor } from "../utils";
import {
  CURRENT_X,
  CURRENT_Y,
  HEX,
  HEX_VALUE,
  HSL,
  HSL_VALUE,
  HSV,
  HSV_VALUE,
  POSITION,
  RGB,
  RGB_VALUE
} from "./constants";
import { ColorFieldTranslations } from "./translations";

@Component({
  tag: "ch-color-field",
  styleUrl: "color-field.scss",
  formAssociated: true,
  shadow: { delegatesFocus: true }
})
export class ChColorField {
  /**
   * Step to navigate on the canvas.
   */
  @Prop() readonly step: number = 1;

  /**
   * Selected color.
   */
  @Prop({ mutable: true }) selectedColor: string;

  @Watch("selectedColor")
  selectedColorChanged() {
    if (this.selectedColor) {
      try {
        this.colorVariants = parseColor(this.selectedColor);
        this.#updateMarkerPosition();
        this.#drawColorField();
        this.#updateStatusMessage();
      } catch (error) {
        console.warn(`Invalid selected color: ${this.selectedColor}`, error);
        // Set default color variants
        this.colorVariants = parseColor("#000000");
        this.#updateMarkerPosition();
        this.#drawColorField();
        this.#updateStatusMessage();
      }
    }
  }

  /**
   * Internal state to store the color variants.
   */
  @State() private colorVariants: ColorVariants;

  /**
   * Internal state to store the current status message.
   */
  @State() private statusMessage: string = "";

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: ColorFieldTranslations = {
    accessibleName: {
      description: "2D color selector",
      label: "Color field",
      statusLabel: "Color information",
      statusMessage: `${POSITION}: X: ${CURRENT_X}, Y: ${CURRENT_Y}. ${RGB}: ${RGB_VALUE}. ${HSL}: ${HSL_VALUE}. ${HSV}: ${HSV_VALUE}. ${HEX}: ${HEX_VALUE}`
    },
    colorFormats: {
      position: "Position",
      hex: "HEX",
      hsl: "HSL",
      hsv: "HSV",
      rgb: "RGB"
    }
  };

  /**
   * Emit the new color value.
   */
  @Event() input: EventEmitter<ColorVariants>;

  #canvasRef: HTMLCanvasElement;
  #colorPickedVariants: ColorVariants;
  #currentX: number = 0;
  #currentY: number = 0;
  #dragRAF: SyncWithRAF = new SyncWithRAF();
  #isDragging: boolean = false;
  #markerRef: HTMLDivElement;
  #resizeObserver: ResizeObserver;
  #resizeRAF: SyncWithRAF = new SyncWithRAF();

  #getStatusMessage = (): string => {
    const currentColor = this.#colorPickedVariants || this.colorVariants;
    const { colorFormats } = this.translations;

    if (!currentColor) {
      return "";
    }

    return this.translations.accessibleName.statusMessage
      .replace(POSITION, colorFormats.position)
      .replace(CURRENT_X, Math.round(this.#currentX).toString())
      .replace(CURRENT_Y, Math.round(this.#currentY).toString())
      .replace(RGB, colorFormats.rgb)
      .replace(RGB_VALUE, currentColor.rgb || "")
      .replace(HSL, colorFormats.hsl)
      .replace(HSL_VALUE, currentColor.hsl || "")
      .replace(HSV, colorFormats.hsv)
      .replace(
        HSV_VALUE,
        currentColor.hsv
          ? `${currentColor.hsv.h}°, ${currentColor.hsv.s}%, ${currentColor.hsv.v}%`
          : ""
      )
      .replace(HEX, colorFormats.hex)
      .replace(HEX_VALUE, currentColor.hex || "");
  };

  // Debounce function for status updates.
  // Prevents excessive screen reader announcements during continuous interactions
  // like dragging or rapid keyboard navigation. This improves accessibility by
  // reducing "noise" for users with assistive technologies.
  #debounce(fn: () => void, delay: number) {
    let timeoutId: number;
    return () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(fn, delay);
    };
  }

  // Debounced status update for continuous interactions.
  // Uses a 300ms delay to batch status updates during drag operations
  // and keyboard navigation, preventing screen readers from being
  // overwhelmed with rapid announcements.
  #debouncedUpdateStatus = this.#debounce(() => {
    this.statusMessage = this.#getStatusMessage();
  }, 300);

  #updateStatusMessage = (immediate = false): void => {
    if (immediate) {
      this.statusMessage = this.#getStatusMessage();
    } else {
      this.#debouncedUpdateStatus();
    }
  };

  #updateCanvasSize = (): void => {
    if (this.#canvasRef) {
      this.#canvasRef.width = this.#canvasRef.clientWidth;
      this.#canvasRef.height = this.#canvasRef.clientHeight;
      this.#drawColorField();
    }
  };

  #drawColorField = (): void => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx || !this.colorVariants) {
      return;
    }

    const { width, height } = this.#canvasRef;

    // Get the hue from the current color (HSV model)
    const hsvValues = this.colorVariants.hsv;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Create horizontal gradient from white to pure hue (saturation gradient)
    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
    saturationGradient.addColorStop(0, `hsl(${hsvValues.h}, 0%, 100%)`);
    saturationGradient.addColorStop(1, `hsl(${hsvValues.h}, 100%, 50%)`);

    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);

    // Apply vertical gradient from transparent to black (value gradient)
    const valueGradient = ctx.createLinearGradient(0, 0, 0, height);
    valueGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    valueGradient.addColorStop(1, "rgba(0, 0, 0, 1)");

    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = valueGradient;
    ctx.fillRect(0, 0, width, height);

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";

    this.#drawMarker();
  };

  #drawMarker = (): void => {
    if (this.#markerRef) {
      this.#markerRef.style.left = `${this.#currentX}px`;
      this.#markerRef.style.top = `${this.#currentY}px`;
    }
  };

  #updateMarkerPosition = (): void => {
    if (!this.colorVariants || !this.#canvasRef) {
      return;
    }

    // Use HSV for marker positioning
    const hsvValues = this.colorVariants.hsv;
    // X represents saturation (0-100%)
    this.#currentX = (hsvValues.s / 100) * this.#canvasRef.width;
    // Y represents value (0% value = bottom, 100% value = top)
    this.#currentY = ((100 - hsvValues.v) / 100) * this.#canvasRef.height;
    this.#drawMarker();
  };

  #updateCoordinates = (event: MouseEvent): void => {
    const rect = this.#canvasRef.getBoundingClientRect();
    const canvasHeight = this.#canvasRef.height;
    const canvasWidth = this.#canvasRef.width;

    // Ensure valid pixel range
    this.#currentX = Math.max(
      0,
      Math.min(canvasWidth, event.clientX - rect.left)
    );
    this.#currentY = Math.max(
      0,
      Math.min(canvasHeight, event.clientY - rect.top)
    );

    this.#colorPickedVariants = this.#getColorFromCanvas();
    this.#drawMarker();
    // Use debounced update for drag operations
    this.#updateStatusMessage();
  };

  #handleCanvasClick = (event: MouseEvent) => {
    this.#updateCoordinates(event);
    // Immediate update for single clicks
    this.#updateStatusMessage(true);
    this.input.emit(this.#colorPickedVariants);
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
          const canvasHeight = this.#canvasRef.height;
          const canvasWidth = this.#canvasRef.width;

          this.#currentX = Math.max(
            0,
            Math.min(canvasWidth, event.clientX - rect.left)
          );
          this.#currentY = Math.max(
            0,
            Math.min(canvasHeight, event.clientY - rect.top)
          );
        }
      );
    }
  };

  #handleMouseUp = () => {
    if (this.#isDragging) {
      this.#isDragging = false;
      this.input.emit(this.#colorPickedVariants);
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
          this.#currentY = canvasHeight;
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
          this.#currentX = canvasWidth;
        }
        this.#drawMarker();
        event.preventDefault();
        break;
      default:
        break;
    }
    this.#colorPickedVariants = this.#getColorFromCanvas();
    this.#updateStatusMessage();
    this.input.emit(this.#colorPickedVariants);
  };

  #getColorFromCanvas = (): ColorVariants => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      // Return fallback color variants
      return parseColor("#000000");
    }

    // Ensure coordinates are within valid pixel range for getImageData
    const x = Math.min(this.#currentX, this.#canvasRef.width - 1);
    const y = Math.min(this.#currentY, this.#canvasRef.height - 1);

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b, a] = imageData.data;

    return parseColor(`rgba(${r}, ${g}, ${b}, ${a / 255})`);
  };

  componentWillLoad() {
    // Initialize with default color if no selectedColor is provided
    this.selectedColor ||= "#000000";

    // Initialize colorVariants before component loads to avoid state change on load
    if (this.selectedColor) {
      try {
        this.colorVariants = parseColor(this.selectedColor);
      } catch (error) {
        console.warn(`Invalid selected color: ${this.selectedColor}`, error);
        this.colorVariants = parseColor("#000000");
      }
    }
  }

  componentDidLoad() {
    this.#updateCanvasSize();
    this.#updateMarkerPosition();
    this.#updateStatusMessage();

    // Initialize ResizeObserver with RAF optimization
    this.#resizeObserver = new ResizeObserver(() => {
      this.#resizeRAF.perform(() => {
        this.#updateCanvasSize();
        this.#updateMarkerPosition();
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
          onMouseDown={this.#handleMouseDown}
          onMouseMove={this.#handleMouseMove}
          onMouseUp={this.#handleMouseUp}
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FIELD}
          ref={el => (this.#canvasRef = el as HTMLCanvasElement)}
          role="application"
        ></canvas>
        <div
          class="marker"
          onKeyDown={this.#handleKeyDown}
          part={COLOR_PICKER_PARTS_DICTIONARY.MARKER}
          tabindex="0"
          ref={el => {
            this.#markerRef = el as HTMLDivElement;
          }}
        ></div>
        <ch-status
          accessibleName={accessibleName.statusLabel}
          id="color-information"
        >
          <div hidden>{this.statusMessage}</div>
        </ch-status>
      </Host>
    );
  }
}

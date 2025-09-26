import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";
import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../../common/analysis/accessibility";
import {
  COLOR_PICKER_PARTS_DICTIONARY,
  KEY_CODES
} from "../../../common/reserved-names";
import { SyncWithRAF } from "../../../common/sync-with-frames";
import { ColorFormat, ColorVariants } from "../../../common/types";
import { getColorFormat } from "../utils/color-format";
import { fromStringToColorVariants } from "../utils/color-variants";
import { ColorFieldTranslations } from "./translations";

type KeyEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT;

@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "color-field.scss",
  tag: "ch-color-field"
})
export class ChColorField {
  #canvasRef: HTMLCanvasElement;
  #colorPickedVariants: ColorVariants;
  #colorFormat: ColorFormat = "hex";
  #currentX: number = 0;
  #currentY: number = 0;
  #dragRAF: SyncWithRAF;
  #isDragging: boolean = false;
  #markerRef: HTMLDivElement;
  #resizeObserver: ResizeObserver;
  #resizeRAF: SyncWithRAF = new SyncWithRAF();
  #isUserAction: boolean = false;

  #keyEvents: {
    [key in KeyEvents]: (event: KeyboardEvent) => void;
  } = {
    [KEY_CODES.ARROW_UP]: ev => {
      this.#currentY -= this.step;
      if (this.#currentY < 0) {
        this.#currentY = 0;
      }
      this.#drawMarker();
      this.#emitColorChange();
      ev.preventDefault();
    },

    [KEY_CODES.ARROW_DOWN]: ev => {
      this.#currentY += this.step;
      const canvasHeight = this.#canvasRef?.height || 0;
      if (this.#currentY >= canvasHeight) {
        this.#currentY = canvasHeight;
      }
      this.#drawMarker();
      this.#emitColorChange();
      ev.preventDefault();
    },

    [KEY_CODES.ARROW_LEFT]: ev => {
      this.#currentX -= this.step;
      if (this.#currentX < 0) {
        this.#currentX = 0;
      }
      this.#drawMarker();
      this.#emitColorChange();
      ev.preventDefault();
    },

    [KEY_CODES.ARROW_RIGHT]: ev => {
      this.#currentX += this.step;
      const canvasWidth = this.#canvasRef?.width || 0;
      if (this.#currentX >= canvasWidth) {
        this.#currentX = canvasWidth;
      }
      this.#drawMarker();
      this.#emitColorChange();
      ev.preventDefault();
    }
  };

  @AttachInternals() internals: ElementInternals;

  @Element() el: HTMLChColorFieldElement;

  /**
   * Internal state to store the color variants.
   */
  @State() private colorVariants: ColorVariants;

  /**
   * Step to navigate on the canvas.
   */
  @Prop() readonly step: number = 1;

  /**
   * Specifies if the color field is disabled.
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * Specifies if the color field is readonly.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: ColorFieldTranslations = {
    accessibleName: {
      description: "2D color selector",
      label: "Color field"
    }
  };

  /**
   * Selected color value.
   */
  @Prop({ mutable: true }) value: string = "#000";

  @Watch("value")
  valueChanged(newValue: string, oldValue: string) {
    if (this.#isUserAction) {
      this.internals.setFormValue(this.value);
      this.#isUserAction = false;
      return;
    }

    this.#handleExternalValueChange(newValue, oldValue);
  }

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   *
   * It contains the new value (in all variants) of the color-field.
   */
  @Event() input: EventEmitter<ColorVariants>;

  #applyValidColor = (value: string, colorVariants: ColorVariants): void => {
    this.colorVariants = colorVariants;

    const format = getColorFormat(value);
    if (format) {
      this.#colorFormat = format;
    }

    this.#updateMarkerPosition();
    this.#drawColorField();
    this.internals.setFormValue(value);
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

  #emitColorChange = (): void => {
    this.#colorPickedVariants = this.#getColorFromCanvas();
    const newValue = this.#getColorInOriginalFormat(this.#colorPickedVariants);

    this.#isUserAction = true;
    this.value = newValue;

    this.internals.setFormValue(newValue);
    this.input.emit(this.#colorPickedVariants);
  };

  #getColorInOriginalFormat = (colorVariants: ColorVariants): string => {
    switch (this.#colorFormat) {
      case "rgb":
        return colorVariants.rgb;
      case "rgba":
        return colorVariants.rgba;
      case "hsl":
        return colorVariants.hsl;
      case "hsla":
        return colorVariants.hsla;
      case "hex":
      default:
        return colorVariants.hex;
    }
  };

  #getColorFromCanvas = (): ColorVariants => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      // Return fallback color variants
      return fromStringToColorVariants("#000000");
    }

    // Ensure coordinates are within valid pixel range for getImageData
    const x = Math.min(this.#currentX, this.#canvasRef.width - 1);
    const y = Math.min(this.#currentY, this.#canvasRef.height - 1);

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b, a] = imageData.data;

    return fromStringToColorVariants(`rgba(${r}, ${g}, ${b}, ${a / 255})`);
  };

  #handleCanvasClick = (event: MouseEvent) => {
    if (!this.#isDragging) {
      this.#updateCoordinates(event);
      this.#emitColorChange();
    }
  };

  #handleExternalValueChange = (newValue: string, oldValue: string): void => {
    if (!newValue) {
      this.#revertToOldValue(oldValue);
      return;
    }

    const colorVariants = fromStringToColorVariants(newValue);

    if (!colorVariants) {
      this.#revertToOldValue(oldValue);
      return;
    }

    this.#applyValidColor(newValue, colorVariants);
  };

  #handleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    this.#dragRAF ??= new SyncWithRAF();

    this.#updateCoordinates(event);

    // Add listeners to document for better drag experience
    document.addEventListener("mousemove", this.#handleMouseMove, {
      capture: true
    });
    document.addEventListener("mouseup", this.#handleMouseUp, {
      capture: true,
      passive: true
    });
  };

  #handleMouseMove = (event: MouseEvent) => {
    this.#isDragging ||= true;
    if (this.#dragRAF) {
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
      this.#emitColorChange();
    }
    // Remove listeners
    document.removeEventListener("mousemove", this.#handleMouseMove, {
      capture: true
    });
    document.removeEventListener("mouseup", this.#handleMouseUp, {
      capture: true
    });

    // Free up memory by setting dragRAF to undefined
    this.#dragRAF?.cancel();
    this.#dragRAF = undefined;
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    const keyEventHandler = this.#keyEvents[event.code];
    if (!keyEventHandler) {
      return;
    }
    keyEventHandler(event);
  };

  #updateCanvasSize = (): void => {
    if (this.#canvasRef) {
      this.#canvasRef.width = this.#canvasRef.clientWidth;
      this.#canvasRef.height = this.#canvasRef.clientHeight;
      this.#drawColorField();
    }
  };

  #revertToOldValue = (oldValue: string): void => {
    const fallbackValue = oldValue || "#000";

    this.#isUserAction = true;
    this.value = fallbackValue;
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
  };

  componentWillLoad() {
    // Initialize colorVariants before component loads to avoid state change on load
    if (this.value) {
      try {
        this.colorVariants = fromStringToColorVariants(this.value);
        const format = getColorFormat(this.value);

        if (format) {
          this.#colorFormat = format;
        }
      } catch (error) {
        console.warn(`Invalid value color: ${this.value}`, error);
        this.colorVariants = fromStringToColorVariants("#000000");
        this.#colorFormat = "hex";
      }
    }
  }

  connectedCallback() {
    // Accessibility
    this.internals.setFormValue(this.value);
    const labels = this.internals.labels;
    const accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-color-field",
      labels,
      accessibleNameFromExternalLabel,
      this.translations.accessibleName.label
    );
  }

  componentDidLoad() {
    this.#updateCanvasSize();
    this.#updateMarkerPosition();

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
    this.#dragRAF?.cancel();

    // Clean up event listeners
    document.removeEventListener("mousemove", this.#handleMouseMove, {
      capture: true
    });
    document.removeEventListener("mouseup", this.#handleMouseUp, {
      capture: true
    });
  }

  render() {
    const { accessibleName } = this.translations;
    const isInteractive = !this.disabled && !this.readonly;

    return (
      <Host
        aria-label={accessibleName.label}
        aria-roledescription={accessibleName.description}
      >
        <canvas
          aria-disabled={this.disabled ? "true" : null}
          aria-readonly={this.readonly ? "true" : null}
          onClick={isInteractive ? this.#handleCanvasClick : null}
          onMouseDown={isInteractive ? this.#handleMouseDown : null}
          onKeyDown={isInteractive ? this.#handleKeyDown : null}
          ref={el => (this.#canvasRef = el as HTMLCanvasElement)}
          role="application"
          tabindex={isInteractive ? "0" : "-1"}
        ></canvas>
        <div
          class="marker"
          part={COLOR_PICKER_PARTS_DICTIONARY.MARKER}
          ref={el => {
            this.#markerRef = el as HTMLDivElement;
          }}
        ></div>
      </Host>
    );
  }
}

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
import { tokenMap } from "../../../common/utils";
import { getColorFormat } from "../utils/color-format";
import { fromStringToColorVariants } from "../utils/color-variants";

type KeyEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT;

const DEFAULT_COLOR_FORMAT = "hex" satisfies ColorFormat;
const FALLBACK_COLOR = "#000000" satisfies ColorVariants["hex"];

@Component({
  formAssociated: true,
  shadow: true,
  styleUrl: "color-field.scss",
  tag: "ch-color-field"
})
export class ChColorField {
  #colorPickedVariants: ColorVariants;
  #colorFormat: ColorFormat = DEFAULT_COLOR_FORMAT;
  #currentX: number = 0;
  #currentY: number = 0;
  #isDragging: boolean = false;
  #isUserAction: boolean = false;

  // Observers
  #dragRAF: SyncWithRAF | undefined;
  #resizeObserver: ResizeObserver | undefined;
  #resizeRAF: SyncWithRAF = new SyncWithRAF();

  // DOM refs
  #canvasRef: HTMLCanvasElement;
  #markerRef: HTMLDivElement;

  #keyEvents: {
    [key in KeyEvents]: (event: KeyboardEvent) => void;
  } = {
    [KEY_CODES.ARROW_UP]: ev => {
      this.#currentY -= this.step;
      // The marker is crossing the top edge, don't let it go over the edge
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
      // The marker is crossing the bottom edge, don't let it go over the edge
      if (this.#currentY >= canvasHeight) {
        this.#currentY = canvasHeight;
      }
      this.#drawMarker();
      this.#emitColorChange();
      ev.preventDefault();
    },

    [KEY_CODES.ARROW_LEFT]: ev => {
      this.#currentX -= this.step;
      // The marker is crossing the left edge, don't let it go over the edge
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
      // The marker is crossing the right edge, don't let it go over the edge
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
   * Step size in pixels for keyboard navigation on the canvas.
   * Determines how many pixels the marker moves when using arrow keys.
   * Default = 1.
   */
  @Prop() readonly step: number = 1;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string = "Color field";

  /**
   * Specifies a readable description for the component’s role, primarily
   * used by assistive technologies to give users more context about the
   * component's purpose or behavior.
   */
  @Prop() readonly accessibleRoleDescription: string = "2D color field";

  /**
   * The current value of the `ch-color-field` component, representing a color
   * in one of the following formats:
   *   - HEX
   *   - HSL
   *   - RGB
   * This value determines the selected color and can be updated by the user.
   *
   * @example // HEX format
   * value = "#FF00AA"
   * @example // HSL format
   * value = "hsl(120, 100%, 25%)"
   * @example // RGB format
   * value = "rgb(255, 125, 50)"
   */
  @Prop({ mutable: true }) value: string = FALLBACK_COLOR;

  @Watch("value")
  valueChanged(newValue: string, oldValue: string) {
    this.internals.setFormValue(this.value);

    if (this.#isUserAction) {
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

  #getColorInOriginalFormat = (
    colorVariants: Omit<ColorVariants, "hsv">
  ): string => colorVariants[this.#colorFormat ?? DEFAULT_COLOR_FORMAT];

  #getColorFromCanvas = (): ColorVariants => {
    const ctx = this.#canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      // Return fallback color variants
      return fromStringToColorVariants(FALLBACK_COLOR);
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
    const fallbackValue = oldValue || FALLBACK_COLOR;

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
        this.colorVariants = fromStringToColorVariants(FALLBACK_COLOR);
        this.#colorFormat = DEFAULT_COLOR_FORMAT;
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
      this.accessibleName
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
    // Disconnect the observer when the component is unloaded and clean up the reference
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = undefined;
    }

    // Cancel pending RAF operations
    this.#resizeRAF.cancel();
    this.#dragRAF?.cancel();

    // Clean up RAF references
    this.#resizeRAF = undefined;
    this.#dragRAF = undefined;

    // Clean up event listeners
    document.removeEventListener("mousemove", this.#handleMouseMove, {
      capture: true
    });
    document.removeEventListener("mouseup", this.#handleMouseUp, {
      capture: true
    });
  }

  render() {
    const isInteractive = !this.disabled && !this.readonly;

    return (
      <Host
        role="application"
        aria-disabled={this.disabled ? "true" : null}
        aria-label={this.accessibleName}
        aria-readonly={this.readonly ? "true" : null}
        aria-roledescription={this.accessibleRoleDescription}
        onKeyDown={isInteractive ? this.#handleKeyDown : null}
        tabindex={!this.disabled ? "0" : null}
      >
        <canvas
          aria-hidden="true"
          onClick={isInteractive ? this.#handleCanvasClick : null}
          onMouseDown={isInteractive ? this.#handleMouseDown : null}
          ref={el => (this.#canvasRef = el as HTMLCanvasElement)}
        ></canvas>
        <div
          class="marker"
          part={tokenMap({
            [COLOR_PICKER_PARTS_DICTIONARY.MARKER]: true,
            [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
          })}
          ref={el => {
            this.#markerRef = el as HTMLDivElement;
          }}
        ></div>
      </Host>
    );
  }
}

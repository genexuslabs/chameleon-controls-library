import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
  Watch
} from "@stencil/core";
import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";
import {
  COLOR_PICKER_PARTS_DICTIONARY,
  COMBO_BOX_EXPORT_PARTS
} from "../../common/reserved-names";
import { ColorFormat, ColorVariants } from "../../common/types";
import { tokenMap } from "../../common/utils";
import { ChColorFieldCustomEvent } from "../../components";
import {
  DEFAULT_COLOR_FORMAT,
  FALLBACK_COLOR,
  HSL_REGEX,
  RGB_REGEX,
  RGBA_REGEX,
  SELECTED_COLOR
} from "./constants";
import { ColorPickerTranslations } from "./translations";
import { ColorPickerControlsOrder } from "./types";
import { getColorFormat } from "./utils/color-format";
import { fromStringToColorVariants } from "./utils/color-variants";
import { fromHsvToRgb } from "./utils/converters/hsv-to-rgb";
import { fromHsvStringToHsvColor } from "./utils/parsers/hsv";

@Component({
  formAssociated: true,
  shadow: true,
  styleUrl: "color-picker.scss",
  tag: "ch-color-picker"
})
export class ChColorPicker {
  #colorFormat: ColorFormat = DEFAULT_COLOR_FORMAT;

  @AttachInternals() internals: ElementInternals;

  @Element() el: HTMLChColorPickerElement;

  /**
   * Stores all color format variants (rgb, hex, hsl, hsv) of the current color
   */
  @State() private colorVariants: ColorVariants;

  /**
   * Currently selected format in the color format selector dropdown
   */
  @State() private selectedColorFormat: ColorFormat = DEFAULT_COLOR_FORMAT;

  /**
   * Internal state containing an array of controls to render based on visibility props
   */
  @State() controlsToRender: Array<{
    name: string;
    render: () => Element;
  }> = [];

  /**
   * Specifies a short string that authors associate with an element
   * to provide users of assistive technologies with a label for the element.
   */
  @Prop() readonly accessibleName?: string | undefined;

  /**
   * Specifies the step size in pixels for the alpha slider.
   * Default = 1.
   */
  @Prop() readonly alphaSliderStep: number = 1;

  /**
   * Specifies the step size in pixels for the alpha slider.
   * Default = 1.
   */
  @Prop() readonly hueSliderStep: number = 1;

  /**
   * Specifies the step size in pixels for keyboard navigation on the color field.
   * Default = 1.
   */
  @Prop() readonly colorFieldStep: number = 1;

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
   * Specifies the order for the controls.
   */
  @Prop() readonly order: ColorPickerControlsOrder = {
    colorField: 1,
    colorPreview: 2,
    hueSlider: 3,
    alphaSlider: 4,
    colorFormatSelector: 5,
    colorPalette: 6
  };

  @Watch("order")
  orderChanged() {
    this.#initializeControls();
  }

  /**
   * Shows/hides the hue slider control.
   * Allows users to select the color hue (0-360 degrees).
   */
  @Prop() readonly showHueSlider: boolean = false;

  /**
   * Shows/hides the alpha (transparency) slider.
   * Allows users to adjust color opacity from 0% (transparent) to 100% (opaque).
   */
  @Prop() readonly showAlphaSlider: boolean = false;

  /**
   * Shows/hides the color format selector dropdown and associated input fields.
   * When enabled, users can switch between HEX, RGB, HSL, and HSV formats
   * and input color values directly.
   */
  @Prop() readonly showColorFormatSelector: boolean = false;

  /**
   * Shows/hides the current color preview box.
   * Displays the currently selected color with proper transparency pattern for alpha values.
   */
  @Prop() readonly showColorPreview: boolean = false;

  /**
   * Shows/hides the color palette section.
   * Displays a customizable grid of color swatches for quick selection.
   */
  @Prop() readonly showColorPalette: boolean = false;

  /**
   * Array of colors to display in the color palette.
   * Can be used for recent colors, preset colors, brand colors, or any custom palette.
   * Accepts any valid CSS color format (hex, rgb, hsl, etc.).
   */
  @Prop() readonly colorPalette: string[] = [];

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: ColorPickerTranslations = {
    accessibleName: {
      lightnessChannelInput: "Lightness",
      hueChannelInput: "Hue",
      saturationChannelInput: "Saturation",
      valueChannelInput: "Value",
      alphaChannelInput: "Alpha",
      redChannelInput: "Red",
      greenChannelInput: "Green",
      blueChannelInput: "Blue",
      hexadecimalInput: "Hexadecimal color",
      colorFormatOptions: "Color format options",
      colorFieldControl: "Color field",
      colorFieldDescription: "2d color field",
      hueSliderControl: "Hue Slider",
      alphaSliderControl: "Alpha Slider",
      colorPaletteButton: `Selected color ${SELECTED_COLOR}`,
      currentColorPreview: `Current color: ${SELECTED_COLOR}`
    },
    text: {
      colorFieldLabel: "",
      colorPaletteSection: "Color Palette",
      colorFormatSelector: "Color Format",
      currentColorPreviewText: "Color Preview",
      hueChannelLabel: "Hue",
      alphaChannelLabel: "Alpha",
      hexadecimalFormat: "HEX",
      rgbColorFormat: "RGB",
      hslColorFormat: "HSL",
      hsvColorFormat: "HSV",
      redChannelInputLabel: "R",
      greenChannelInputLabel: "G",
      blueChannelInputLabel: "B",
      hueChannelInputLabel: "H",
      saturationChannelInputLabel: "S",
      lightnessChannelInputLabel: "L",
      valueChannelInputLabel: "V"
    }
  };

  /**
   * The current value of the `ch-color-picker` component, representing a color
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
  valueChanged(newValue: string) {
    this.internals.setFormValue(this.value);

    this.#handleExternalValueChange(newValue);
  }

  /**
   * The `input` event is emitted whenever the color value changes.
   * The event detail contains the color in all available formats for convenience.
   */
  @Event() input: EventEmitter<ColorVariants>;

  componentWillLoad() {
    this.#initializeColorVariants();
  }

  connectedCallback(): void {
    this.#initializeControls();

    // Accessibility
    this.internals.setFormValue(this.value);
    const labels = this.internals.labels;
    const accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-color-picker",
      labels,
      accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

  // Initializes color variants from the current value or fallback
  #initializeColorVariants = (): void => {
    const colorVariants = fromStringToColorVariants(this.value);
    if (colorVariants) {
      this.colorVariants = colorVariants;
      const format = getColorFormat(this.value);
      if (format) {
        this.#colorFormat = format;
      }
    } else {
      this.colorVariants = fromStringToColorVariants(FALLBACK_COLOR);
      this.#colorFormat = DEFAULT_COLOR_FORMAT;
    }
  };

  // Emits color change event and updates the value
  #emitColorChange = (): void => {
    const newValue = this.#getColorInOriginalFormat(this.colorVariants);

    if (this.value !== newValue) {
      this.value = newValue;
    }

    this.internals.setFormValue(newValue);
    this.input.emit(this.colorVariants);
  };

  // Gets the color value in the original format that was set
  #getColorInOriginalFormat = (colorVariants: ColorVariants): string =>
    colorVariants[this.#colorFormat ?? DEFAULT_COLOR_FORMAT];

  // Initializes the controls array based on visibility props and order
  #initializeControls = (): void => {
    const controls: Array<{
      name: string;
      render: () => Element;
    }> = [
      {
        name: "colorField",
        render: () => this.#renderColorField()
      },
      {
        name: "colorPreview",
        render: () => this.showColorPreview && this.#renderColorPreview()
      },
      {
        name: "alphaSlider",
        render: () => this.showAlphaSlider && this.#renderAlphaSlider()
      },
      {
        name: "hueSlider",
        render: () => this.showHueSlider && this.#renderHueSlider()
      },
      {
        name: "colorPalette",
        render: () => this.showColorPalette && this.#renderColorPalette()
      },
      {
        name: "colorFormatSelector",
        render: () =>
          this.showColorFormatSelector && this.#renderColorFormatSelector()
      }
    ];

    // Sort controls by their order value
    controls.sort((a, b) => {
      const orderA =
        this.order[a.name as keyof ColorPickerControlsOrder] ??
        Number.MAX_SAFE_INTEGER;
      const orderB =
        this.order[b.name as keyof ColorPickerControlsOrder] ??
        Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    this.controlsToRender = controls;
  };

  // Handles color field change events
  #handleColorFieldChange = (
    event: ChColorFieldCustomEvent<ColorVariants> | InputEvent
  ): void => {
    this.colorVariants = event.detail as ColorVariants;
    this.#emitColorChange();
  };

  // Handles external value changes
  #handleExternalValueChange = (newValue: string): void => {
    const currentValue = this.#getColorInOriginalFormat(this.colorVariants);
    if (currentValue === newValue) {
      return;
    }

    const colorVariants = fromStringToColorVariants(newValue);
    if (colorVariants) {
      this.colorVariants = colorVariants;
      const format = getColorFormat(newValue);
      if (format) {
        this.#colorFormat = format;
      }
    }
  };

  // Handles hue slider change events
  #handleHueChange = (event: CustomEvent<number>): void => {
    const newHue = event.detail;

    // Parse HSV string to get individual values
    const hsvValues = fromHsvStringToHsvColor(this.colorVariants.hsv);
    if (!hsvValues) {
      return;
    }

    const { s: saturation, v: brightness } = hsvValues;

    const rgb = fromHsvToRgb(newHue, saturation, brightness);
    const newColorVariants = fromStringToColorVariants(
      `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`
    );

    if (newColorVariants) {
      this.colorVariants = newColorVariants;
      this.#emitColorChange();
    }
  };

  // Handles alpha slider change events
  #handleAlphaChange = (event: CustomEvent<number>): void => {
    const rgbMatch = this.colorVariants.rgb.match(RGB_REGEX);
    if (!rgbMatch) {
      return;
    }

    const [, r, g, b] = rgbMatch;
    const newAlpha = event.detail / 100;

    const newColorVariants = fromStringToColorVariants(
      `rgba(${r}, ${g}, ${b}, ${newAlpha})`
    );

    if (newColorVariants) {
      this.colorVariants = newColorVariants;
      this.#emitColorChange();
    }
  };

  // Handles color palette button clicks
  #handleColorPaletteButtonClick = (event: Event): void => {
    const button = event.target as HTMLButtonElement;
    const color = button.value;

    if (color) {
      this.#handleColorPaletteClick(color);
    }
  };

  // Handles color palette selection
  #handleColorPaletteClick = (color: string): void => {
    const colorVariants = fromStringToColorVariants(color);
    if (colorVariants) {
      this.colorVariants = colorVariants;
      const format = getColorFormat(color);
      if (format) {
        this.#colorFormat = format;
      }
      this.#emitColorChange();
    }
  };

  // Handles color format selector changes
  #handleFormatChange = (event: CustomEvent<string>): void => {
    const newFormat = event.detail as ColorFormat;
    this.selectedColorFormat = newFormat;

    const newValue = this.colorVariants[newFormat];
    this.#colorFormat = newFormat;
    this.value = newValue.toString();
    this.#emitColorChange();
  };

  // Handles hex input changes
  #handleHexInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    const colorVariants = fromStringToColorVariants(newValue);
    if (colorVariants) {
      this.colorVariants = colorVariants;
      this.#colorFormat = "hex";
      this.#emitColorChange();
    }
  };

  // Handles RGB channel input changes
  #handleRgbInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const channel = input.dataset.channel as "r" | "g" | "b";
    const value = parseInt(input.value) || 0;

    if (!channel) {
      return;
    }

    // Clamp value between 0-255
    const clampedValue = Math.max(0, Math.min(255, value));

    // Get current RGB values
    const rgbMatch = this.colorVariants.rgb.match(RGB_REGEX);
    if (!rgbMatch) {
      return;
    }

    let [, r, g, b] = rgbMatch.map(Number);

    // Update the changed channel
    if (channel === "r") {
      r = clampedValue;
    } else if (channel === "g") {
      g = clampedValue;
    } else if (channel === "b") {
      b = clampedValue;
    }

    const newColorVariants = fromStringToColorVariants(`rgb(${r}, ${g}, ${b})`);
    if (newColorVariants) {
      this.colorVariants = newColorVariants;
      this.#emitColorChange();
    }
  };

  // Handles HSL channel input changes
  #handleHslInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const channel = input.dataset.channel as "h" | "s" | "l";
    const value = parseFloat(input.value) || 0;

    if (!channel) {
      return;
    }

    // Get current HSL values
    const hslMatch = this.colorVariants.hsl.match(HSL_REGEX);
    if (!hslMatch) {
      return;
    }

    let [, h, s, l] = hslMatch.map(Number);

    // Update the changed channel with appropriate clamping
    if (channel === "h") {
      h = Math.max(0, Math.min(360, value));
    } else if (channel === "s") {
      s = Math.max(0, Math.min(100, value));
    } else if (channel === "l") {
      l = Math.max(0, Math.min(100, value));
    }

    const newColorVariants = fromStringToColorVariants(
      `hsl(${h}, ${s}%, ${l}%)`
    );
    if (newColorVariants) {
      this.colorVariants = newColorVariants;
      this.#emitColorChange();
    }
  };

  // Handles HSV channel input changes
  #handleHsvInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const channel = input.dataset.channel as "h" | "s" | "v";
    const value = parseFloat(input.value) || 0;

    if (!channel) {
      return;
    }

    // Parse HSV string to get individual values
    const hsvValues = fromHsvStringToHsvColor(this.colorVariants.hsv);
    if (!hsvValues) {
      return;
    }
    const { h, s, v } = hsvValues;

    let newH = h,
      newS = s,
      newV = v;

    // Update the changed channel with appropriate clamping
    if (channel === "h") {
      newH = Math.max(0, Math.min(360, value));
    } else if (channel === "s") {
      newS = Math.max(0, Math.min(100, value));
    } else if (channel === "v") {
      newV = Math.max(0, Math.min(100, value));
    }

    const rgb = fromHsvToRgb(newH, newS, newV);
    const newColorVariants = fromStringToColorVariants(
      `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`
    );

    if (newColorVariants) {
      this.colorVariants = newColorVariants;
      this.#emitColorChange();
    }
  };

  // Handles alpha input changes
  #handleAlphaInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    const alphaValue = Math.max(0, Math.min(100, value)) / 100;

    // Get current RGB values
    const rgbMatch = this.colorVariants.rgb.match(RGB_REGEX);
    if (!rgbMatch) {
      return;
    }

    const [, r, g, b] = rgbMatch;
    const newColorVariants = fromStringToColorVariants(
      `rgba(${r}, ${g}, ${b}, ${alphaValue})`
    );

    if (newColorVariants) {
      this.colorVariants = newColorVariants;
      this.#emitColorChange();
    }
  };

  // Renders the color field component
  #renderColorField = (): Element => {
    // Use the current color value from colorVariants
    const currentColorValue = this.#getColorInOriginalFormat(
      this.colorVariants
    );
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="color-field-container"
        part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FIELD_CONTAINER}
      >
        {text.colorFieldLabel && (
          <label
            htmlFor="color-field"
            part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FIELD_LABEL}
          >
            {text.colorFieldLabel}
          </label>
        )}
        <ch-color-field
          id="color-field"
          class="color-picker-field"
          disabled={this.disabled}
          readonly={this.readonly}
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FIELD}
          value={currentColorValue}
          step={this.colorFieldStep}
          accessibleName={accessibleName.colorFieldControl}
          accessibleRoleDescription={accessibleName.colorFieldDescription}
          onInput={
            !this.disabled && !this.readonly
              ? this.#handleColorFieldChange
              : undefined
          }
        ></ch-color-field>
      </div>
    );
  };

  // Renders the hue slider component
  #renderHueSlider = (): Element => {
    // Parse HSV string to get individual values
    const hsvValues = fromHsvStringToHsvColor(this.colorVariants.hsv);
    const { h: hueValue } = hsvValues;
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="slider-group"
        part={tokenMap({
          [COLOR_PICKER_PARTS_DICTIONARY.HUE_SLIDER_GROUP]: true,
          [COLOR_PICKER_PARTS_DICTIONARY.SLIDER_GROUP]: true
        })}
      >
        {text.hueChannelLabel && (
          <label
            htmlFor="hue-slider"
            part={COLOR_PICKER_PARTS_DICTIONARY.HUE_SLIDER_LABEL}
          >
            {text.hueChannelLabel}
          </label>
        )}
        <ch-slider
          id="hue-slider"
          accessibleName={
            !text.hueChannelLabel ? accessibleName.hueSliderControl : undefined
          }
          disabled={this.disabled}
          class="hue-slider"
          showValue={true}
          step={this.hueSliderStep}
          value={hueValue}
          part={COLOR_PICKER_PARTS_DICTIONARY.HUE_SLIDER}
          exportparts="track:slider-track,thumb:slider-thumb"
          minValue={0}
          maxValue={360}
          onChange={!this.disabled ? this.#handleHueChange : undefined}
        ></ch-slider>
      </div>
    );
  };

  // Renders the alpha slider component
  #renderAlphaSlider = (): Element => {
    const alphaMatch = this.colorVariants.rgba.match(RGBA_REGEX);
    const alphaValue = alphaMatch ? parseFloat(alphaMatch[1]) * 100 : 100;
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="slider-group"
        part={tokenMap({
          [COLOR_PICKER_PARTS_DICTIONARY.ALPHA_SLIDER_GROUP]: true,
          [COLOR_PICKER_PARTS_DICTIONARY.SLIDER_GROUP]: true
        })}
      >
        {text.alphaChannelLabel && (
          <label
            htmlFor="alpha-slider"
            part={COLOR_PICKER_PARTS_DICTIONARY.ALPHA_SLIDER_LABEL}
          >
            {text.alphaChannelLabel}
          </label>
        )}
        <ch-slider
          id="alpha-slider"
          accessibleName={
            !text.alphaChannelLabel
              ? accessibleName.alphaSliderControl
              : undefined
          }
          disabled={this.disabled}
          class="alpha-slider"
          showValue={true}
          step={this.alphaSliderStep}
          value={alphaValue}
          part={COLOR_PICKER_PARTS_DICTIONARY.ALPHA_SLIDER}
          minValue={0}
          maxValue={100}
          onChange={!this.disabled ? this.#handleAlphaChange : undefined}
        ></ch-slider>
      </div>
    );
  };

  // Renders the color preview component
  #renderColorPreview = () => {
    const alphaMatch = this.colorVariants.rgba.match(/rgba\(.*,\s*([\d.]+)\)/);
    const hasTransparency = alphaMatch && parseFloat(alphaMatch[1]) < 1;
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="color-preview-container"
        part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_PREVIEW_CONTAINER}
      >
        {text.currentColorPreviewText && (
          <span part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_PREVIEW_TEXT}>
            {text.currentColorPreviewText}
          </span>
        )}
        <div
          id="color-preview"
          class={{
            "color-preview": true,
            "color-preview--transparent": hasTransparency
          }}
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_PREVIEW}
          style={{ backgroundColor: this.colorVariants.rgba }}
          role="img"
          aria-label={accessibleName.currentColorPreview.replace(
            SELECTED_COLOR,
            this.value
          )}
        ></div>
      </div>
    );
  };

  // Renders the color palette grid
  #renderColorPalette = (): Element => {
    const { accessibleName, text } = this.translations;

    return (
      <div class="color-palette-container">
        {text.colorPaletteSection && (
          <label
            id="color-palette-label"
            part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_PALETTES_LABEL}
          >
            {text.colorPaletteSection}
          </label>
        )}
        <div
          class="color-palette-grid"
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_PALETTES_GRID}
          role="group"
          aria-labelledby="color-palette-label"
        >
          <ul>
            {this.colorPalette.map(color => (
              <li>
                <button
                  class="color-palette-button"
                  disabled={this.disabled}
                  style={{ backgroundColor: color }}
                  value={color}
                  onClick={this.#handleColorPaletteButtonClick}
                  aria-label={accessibleName.colorPaletteButton.replace(
                    SELECTED_COLOR,
                    color
                  )}
                  part={tokenMap({
                    [COLOR_PICKER_PARTS_DICTIONARY.COLOR_PALETTE_BUTTON]: true,
                    [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
                    [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
                  })}
                  type="button"
                ></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Renders the format selector header with combo box
  #renderFormatSelectorHeader = (): Element => {
    const { accessibleName, text } = this.translations;
    const formatOptions = [
      { value: "hex", caption: text.hexadecimalFormat },
      { value: "rgb", caption: text.rgbColorFormat },
      { value: "hsl", caption: text.hslColorFormat },
      { value: "hsv", caption: text.hsvColorFormat }
    ];

    return (
      <div
        class="format-selector-header"
        part={COLOR_PICKER_PARTS_DICTIONARY.FORMAT_SELECTOR_HEADER}
      >
        {text.colorFormatSelector && (
          <label
            htmlFor="color-format-combo"
            part={COLOR_PICKER_PARTS_DICTIONARY.FORMAT_SELECTOR_LABEL}
          >
            {text.colorFormatSelector}
          </label>
        )}
        <ch-combo-box-render
          id="color-format-combo"
          name="color-format-combo"
          model={formatOptions}
          accessibleName={accessibleName.colorFormatOptions}
          disabled={this.disabled}
          readonly={this.readonly}
          exportparts={COMBO_BOX_EXPORT_PARTS}
          hostParts={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FORMAT__COMBO_BOX}
          value={this.selectedColorFormat}
          onChange={!this.disabled ? this.#handleFormatChange : undefined}
        />
      </div>
    );
  };

  // Renders the hex input group
  #renderHexInput = (): Element => {
    // Note: We are using an <input> instead of <ch-edit> for the hexadecimal input field
    // because the validation pattern was preventing changes to the input when deleting or modifying it.
    // TODO: Review and determine if changes should be made to <ch-edit>
    // to better handle validation and allow for a smoother user experience. (AGE052-32)
    if (this.selectedColorFormat !== "hex") {
      return null;
    }
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="hex-input-group"
        part={COLOR_PICKER_PARTS_DICTIONARY.HEX_INPUT_GROUP}
      >
        {text.hexadecimalFormat && (
          <label
            htmlFor="hex-input"
            part={COLOR_PICKER_PARTS_DICTIONARY.HEX_INPUT_LABEL}
          >
            {text.hexadecimalFormat}
          </label>
        )}
        <input
          id="hex-input"
          type="text"
          aria-label={
            !text.hexadecimalFormat
              ? accessibleName.hexadecimalInput
              : undefined
          }
          aria-disabled={this.disabled ? "true" : null}
          aria-readonly={this.readonly ? "true" : null}
          disabled={this.disabled}
          readonly={this.readonly}
          value={this.colorVariants.hex}
          onInput={
            !this.disabled && !this.readonly
              ? this.#handleHexInputChange
              : undefined
          }
          pattern="^#[0-9A-Fa-f]{6}$"
          maxLength={7}
          part={tokenMap({
            [COLOR_PICKER_PARTS_DICTIONARY.HEX_INPUT]: true,
            [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
          })}
        />
      </div>
    );
  };

  // Renders the RGB input group
  #renderRgbInputs = (): Element => {
    // Note: We are using <input> instead of <ch-edit> for this case
    // because the current implementation does not enforce the max and min
    // constraints as expected, which could lead to potential user input errors.
    // TODO: Review and determine how to enhance <ch-edit> to properly handle
    // max and min validation, ensuring a smoother user experience. (AGE052-33)
    if (this.selectedColorFormat !== "rgb") {
      return null;
    }

    const rgbMatch = this.colorVariants.rgb.match(RGB_REGEX);
    if (!rgbMatch) {
      return null;
    }
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="rgb-inputs-group"
        part={COLOR_PICKER_PARTS_DICTIONARY.RGB_INPUTS_GROUP}
      >
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.RGB_R_GROUP}
        >
          {text.redChannelInputLabel && (
            <label
              htmlFor="rgb-red"
              part={COLOR_PICKER_PARTS_DICTIONARY.RGB_R_LABEL}
            >
              {text.redChannelInputLabel}
            </label>
          )}
          <input
            id="rgb-red"
            data-channel="r"
            type="number"
            aria-label={
              !text.redChannelInputLabel
                ? accessibleName.redChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleRgbInputChange
                : undefined
            }
            min={0}
            max={255}
            value={rgbMatch[1]}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.RGB_R_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
        </div>
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.RGB_G_GROUP}
        >
          {text.greenChannelInputLabel && (
            <label
              htmlFor="rgb-green"
              part={COLOR_PICKER_PARTS_DICTIONARY.RGB_G_LABEL}
            >
              {text.greenChannelInputLabel}
            </label>
          )}
          <input
            id="rgb-green"
            data-channel="g"
            type="number"
            aria-label={
              !text.greenChannelInputLabel
                ? accessibleName.greenChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleRgbInputChange
                : undefined
            }
            min={0}
            max={255}
            value={rgbMatch[2]}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.RGB_G_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
        </div>
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.RGB_B_GROUP}
        >
          {text.blueChannelInputLabel && (
            <label
              htmlFor="rgb-blue"
              part={COLOR_PICKER_PARTS_DICTIONARY.RGB_B_LABEL}
            >
              {text.blueChannelInputLabel}
            </label>
          )}
          <input
            id="rgb-blue"
            data-channel="b"
            type="number"
            aria-label={
              !text.blueChannelInputLabel
                ? accessibleName.blueChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleRgbInputChange
                : undefined
            }
            min={0}
            max={255}
            value={rgbMatch[3]}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.RGB_B_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
        </div>
      </div>
    );
  };

  // Renders the HSL input group
  #renderHslInputs = (): Element => {
    // Note: We are using <input> instead of <ch-edit> for this case
    // because the current implementation does not enforce the max and min
    // constraints as expected, which could lead to potential user input errors.
    // TODO: Review and determine how to enhance <ch-edit> to properly handle
    // max and min validation, ensuring a smoother user experience. (AGE052-33)
    if (this.selectedColorFormat !== "hsl") {
      return null;
    }

    const hslMatch = this.colorVariants.hsl.match(HSL_REGEX);
    if (!hslMatch) {
      return null;
    }
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="hsl-inputs-group"
        part={COLOR_PICKER_PARTS_DICTIONARY.HSL_INPUTS_GROUP}
      >
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.HSL_H_GROUP}
        >
          {text.hueChannelInputLabel && (
            <label
              htmlFor="hsl-h"
              part={COLOR_PICKER_PARTS_DICTIONARY.HSL_H_LABEL}
            >
              {text.hueChannelInputLabel}
            </label>
          )}
          <input
            id="hsl-h"
            data-channel="h"
            type="number"
            aria-label={
              !text.hueChannelInputLabel
                ? accessibleName.hueChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleHslInputChange
                : undefined
            }
            min={0}
            max={360}
            value={Math.round(parseFloat(hslMatch[1]))}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.HSL_H_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
        </div>
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.HSL_S_GROUP}
        >
          {text.saturationChannelInputLabel && (
            <label
              htmlFor="hsl-s"
              part={COLOR_PICKER_PARTS_DICTIONARY.HSL_S_LABEL}
            >
              {text.saturationChannelInputLabel}
            </label>
          )}
          <input
            id="hsl-s"
            data-channel="s"
            type="number"
            aria-label={
              !text.saturationChannelInputLabel
                ? accessibleName.saturationChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleHslInputChange
                : undefined
            }
            min={0}
            max={100}
            value={Math.round(parseFloat(hslMatch[2]))}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.HSL_S_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
          <span part={COLOR_PICKER_PARTS_DICTIONARY.HSL_S_SUFFIX}>%</span>
        </div>
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.HSL_L_GROUP}
        >
          {text.lightnessChannelInputLabel && (
            <label
              htmlFor="hsl-l"
              part={COLOR_PICKER_PARTS_DICTIONARY.HSL_L_LABEL}
            >
              {text.lightnessChannelInputLabel}
            </label>
          )}
          <input
            id="hsl-l"
            data-channel="l"
            type="number"
            aria-label={
              !text.lightnessChannelInputLabel
                ? accessibleName.lightnessChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleHslInputChange
                : undefined
            }
            min={0}
            max={100}
            value={Math.round(parseFloat(hslMatch[3]))}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.HSL_L_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
          <span part={COLOR_PICKER_PARTS_DICTIONARY.HSL_L_SUFFIX}>%</span>
        </div>
      </div>
    );
  };

  // Renders the HSV input group
  #renderHsvInputs = (): Element => {
    // Note: We are using <input> instead of <ch-edit> for this case
    // because the current implementation does not enforce the max and min
    // constraints as expected, which could lead to potential user input errors.
    // TODO: Review and determine how to enhance <ch-edit> to properly handle
    // max and min validation, ensuring a smoother user experience. (AGE052-33)
    if (this.selectedColorFormat !== "hsv") {
      return null;
    }
    const { accessibleName, text } = this.translations;

    // Parse HSV string to get individual values
    const hsvValues = fromHsvStringToHsvColor(this.colorVariants.hsv);
    const { h: hsvH, s: hsvS, v: hsvV } = hsvValues;

    return (
      <div
        class="hsv-inputs-group"
        part={COLOR_PICKER_PARTS_DICTIONARY.HSV_INPUTS_GROUP}
      >
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.HSV_H_GROUP}
        >
          {text.hueChannelInputLabel && (
            <label
              htmlFor="hsv-h"
              part={COLOR_PICKER_PARTS_DICTIONARY.HSV_H_LABEL}
            >
              {text.hueChannelInputLabel}
            </label>
          )}
          <input
            id="hsv-h"
            data-channel="h"
            type="number"
            aria-label={
              !text.hueChannelInputLabel
                ? accessibleName.hueChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleHsvInputChange
                : undefined
            }
            min={0}
            max={360}
            value={Math.round(hsvH)}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.HSV_H_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
        </div>
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.HSV_S_GROUP}
        >
          {text.saturationChannelInputLabel && (
            <label
              htmlFor="hsv-s"
              part={COLOR_PICKER_PARTS_DICTIONARY.HSV_S_LABEL}
            >
              {text.saturationChannelInputLabel}
            </label>
          )}
          <input
            id="hsv-s"
            data-channel="s"
            type="number"
            aria-label={
              !text.saturationChannelInputLabel
                ? accessibleName.saturationChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleHsvInputChange
                : undefined
            }
            min={0}
            max={100}
            value={Math.round(hsvS)}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.HSV_S_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
          <span part={COLOR_PICKER_PARTS_DICTIONARY.HSV_S_SUFFIX}>%</span>
        </div>
        <div
          class="input-group"
          part={COLOR_PICKER_PARTS_DICTIONARY.HSV_V_GROUP}
        >
          {text.valueChannelInputLabel && (
            <label
              htmlFor="hsv-v"
              part={COLOR_PICKER_PARTS_DICTIONARY.HSV_V_LABEL}
            >
              {text.valueChannelInputLabel}
            </label>
          )}
          <input
            id="hsv-v"
            data-channel="v"
            type="number"
            aria-label={
              !text.valueChannelInputLabel
                ? accessibleName.valueChannelInput
                : undefined
            }
            aria-disabled={this.disabled ? "true" : null}
            aria-readonly={this.readonly ? "true" : null}
            disabled={this.disabled}
            readonly={this.readonly}
            onInput={
              !this.disabled && !this.readonly
                ? this.#handleHsvInputChange
                : undefined
            }
            min={0}
            max={100}
            value={Math.round(hsvV)}
            part={tokenMap({
              [COLOR_PICKER_PARTS_DICTIONARY.HSV_V_INPUT]: true,
              [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
            })}
          />
          <span part={COLOR_PICKER_PARTS_DICTIONARY.HSV_V_SUFFIX}>%</span>
        </div>
      </div>
    );
  };

  // Renders the alpha input group
  #renderAlphaInput = (): Element => {
    // Note: We are using an <input> instead of <ch-edit> for this case
    // because the current implementation does not enforce the max and min
    // constraints as expected, which could lead to potential user input errors.
    // TODO: Review and determine how to enhance <ch-edit> to properly handle
    // max and min validation, ensuring a smoother user experience. (AGE052-33)
    const alphaMatch = this.colorVariants.rgba.match(RGBA_REGEX);
    const alphaValue = alphaMatch ? parseFloat(alphaMatch[1]) * 100 : 100;
    const { accessibleName, text } = this.translations;

    return (
      <div
        class="alpha-input-group"
        part={COLOR_PICKER_PARTS_DICTIONARY.ALPHA_INPUT_GROUP}
      >
        {text.alphaChannelLabel && (
          <label
            htmlFor="alpha-input"
            part={COLOR_PICKER_PARTS_DICTIONARY.ALPHA_INPUT_LABEL}
          >
            {text.alphaChannelLabel}
          </label>
        )}
        <input
          id="alpha-input"
          type="number"
          aria-label={
            !text.alphaChannelLabel
              ? accessibleName.alphaChannelInput
              : undefined
          }
          aria-disabled={this.disabled ? "true" : null}
          aria-readonly={this.readonly ? "true" : null}
          disabled={this.disabled}
          readonly={this.readonly}
          onInput={
            !this.disabled && !this.readonly
              ? this.#handleAlphaInputChange
              : undefined
          }
          min={0}
          max={100}
          value={Math.round(alphaValue)}
          part={tokenMap({
            [COLOR_PICKER_PARTS_DICTIONARY.ALPHA_INPUT]: true,
            [COLOR_PICKER_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [COLOR_PICKER_PARTS_DICTIONARY.READONLY]: this.readonly
          })}
        />
        <span part={COLOR_PICKER_PARTS_DICTIONARY.ALPHA_SUFFIX}>%</span>
      </div>
    );
  };

  // Renders the color format selector with inputs
  #renderColorFormatSelector = (): Element => {
    return (
      <div
        class="color-format-selector"
        part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_FORMAT_SELECTOR}
      >
        {this.#renderFormatSelectorHeader()}
        <div
          class="color-inputs"
          part={COLOR_PICKER_PARTS_DICTIONARY.COLOR_INPUTS}
        >
          {this.#renderHexInput()}
          {this.#renderRgbInputs()}
          {this.#renderHslInputs()}
          {this.#renderHsvInputs()}
          {this.#renderAlphaInput()}
        </div>
      </div>
    );
  };

  render() {
    return (
      <Host aria-label={this.accessibleName}>
        {this.controlsToRender.map(control => control.render())}
      </Host>
    );
  }
}

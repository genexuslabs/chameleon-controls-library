import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";

import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";
import { AccessibleNameComponent } from "../../common/interfaces";
import { SyncWithRAF } from "../../common/sync-with-frames";

const DEFAULT_PERCENTAGE_VALUE_WHEN_MIN_EQUALS_MAX = 0;

/**
 * The `ch-slider` component is a range input that lets users select a numeric value by dragging a thumb along a track between a configurable minimum and maximum.
 *
 * @remarks
 * ## Features
 *  - Configurable minimum, maximum, and step values.
 *  - Optional value bubble display on interaction.
 *  - Visual track split into selected and unselected portions.
 *  - Form-associated via `ElementInternals`.
 *
 * ## Use when
 *  - Continuous or stepped numeric adjustments are needed, such as volume controls, price ranges, or thresholds.
 *  - The relative position within a range is meaningful (e.g., volume, opacity, zoom level).
 *  - An approximate value is acceptable (e.g., price range filter).
 *
 * ## Do not use when
 *  - A star-based discrete rating is needed — prefer `ch-rating` instead.
 *  - Precise numeric entry is required — prefer `ch-edit` with `type="number"` instead.
 *  - An exact numeric value is required — combine with or replace with `ch-edit` with `type="number"`.
 *  - The range is very small (2–3 discrete steps) — prefer `ch-radio-group-render`.
 *  - The range is extremely large (e.g., 0–1,000,000) and precision matters — use `ch-edit` instead.
 *  - Increments are qualitative (e.g., Small/Medium/Large) — prefer `ch-radio-group-render`.
 *
 * ## Slots
 *  - No slots. All content is rendered internally.
 *
 * ## Accessibility
 *  - Form-associated via `ElementInternals` — participates in native form validation and submission.
 *  - Delegates focus into the shadow DOM (`delegatesFocus: true`).
 *  - Uses a native `<input type="range">` which provides built-in keyboard support: Arrow keys increment/decrement by `step`, Page Up/Down for larger jumps, Home/End to jump to min/max.
 *  - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.
 *  - The decorative track overlay is hidden from assistive technology with `aria-hidden`.
 *
 * @status developer-preview
 *
 * @part track - The track of the slider element.
 * @part thumb - The thumb of the slider element.
 *
 * @part track__selected - Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.
 * @part track__unselected - Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value.
 *
 * @part disabled - Present in all parts when the control is disabled (`disabled` === `true`).
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "slider.scss",
  tag: "ch-slider"
})
export class ChSlider implements AccessibleNameComponent {
  #accessibleNameFromExternalLabel: string | undefined;
  #lastModifiedValue = 0;
  #valuePositionRAF = new SyncWithRAF();

  @AttachInternals() internals: ElementInternals;

  @Element() el: HTMLChSliderElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * This attribute allows you specify if the element is disabled.
   * If disabled, it will not trigger any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This attribute lets you specify maximum value of the slider.
   * If `maxValue` is less than `minValue`, it is silently raised to
   * `minValue` (`Math.max(minValue, maxValue)` is applied internally).
   */
  @Prop() readonly maxValue: number = 5;

  /**
   * This attribute lets you specify minimum value of the slider.
   */
  @Prop() readonly minValue: number = 0;

  /**
   * This attribute lets you indicate whether the control should display a
   * bubble with the current value upon interaction.
   *
   * @status not-yet-implemented - This prop is declared but no bubble is
   * currently rendered.
   */
  @Prop() readonly showValue: boolean = false;

  /**
   * This attribute lets you specify the step of the slider.
   *
   * This attribute is useful when the values of the slider can only take some
   * discrete values. For example, if valid values are `[10, 20, 30]` set the
   * `minValue` to `10`, the maxValue to `30`, and the step to `10`. If the
   * step is `0`, the any intermediate value is valid.
   */
  @Prop() readonly step: number = 1;

  /**
   * The value of the control.
   * The `@Watch` handler syncs the value with
   * `ElementInternals.setFormValue()` on every change.
   */
  @Prop({ mutable: true }) value: number = 0;
  @Watch("value")
  valueChanged(newValue: number) {
    // Update form value
    this.internals.setFormValue(newValue.toString());
  }

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user (e.g. on mouseup / touchend). Not debounced.
   */
  @Event() change: EventEmitter<number>;

  /**
   * The `input` event is fired on every drag step as the user moves the
   * thumb. Updates are batched through `requestAnimationFrame` for
   * performance.
   */
  @Event() input: EventEmitter<number>;

  #handleChange = (event: UIEvent) => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;

    // Toggle the value property
    this.value = Number(value);

    this.change.emit(this.value);
  };

  #handleInput = (event: UIEvent) => {
    event.stopPropagation();

    // Update the last value modified by the user interaction
    this.#lastModifiedValue = Number((event.target as HTMLInputElement).value);

    this.#valuePositionRAF.perform(this.#updateValue);
  };

  #updateValue = () => {
    this.value = this.#lastModifiedValue;
    this.input.emit(this.#lastModifiedValue);
  };

  #ensureValueIsInBetween = (
    minValue: number,
    value: number,
    maxValue: number
  ) => Math.min(Math.max(minValue, value), maxValue);

  #getValuePercentage = (
    minValue: number,
    value: number,
    maxValue: number
  ): number => {
    const selectedValue = (value - minValue) / (maxValue - minValue);

    return selectedValue * 100;
  };

  disconnectedCallback() {
    this.#valuePositionRAF.cancel();
  }

  connectedCallback() {
    // Set form value
    this.internals.setFormValue(this.value.toString());

    // Accessibility
    this.internals.setFormValue(this.value?.toString());
    const labels = this.internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-slider",
      labels,
      this.#accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

  render() {
    const actualMaxValue = Math.max(this.minValue, this.maxValue);
    const actualValue = this.#ensureValueIsInBetween(
      this.minValue,
      this.value,
      actualMaxValue
    );

    const valueInPercentage =
      this.minValue < actualMaxValue
        ? this.#getValuePercentage(this.minValue, actualValue, actualMaxValue)
        : DEFAULT_PERCENTAGE_VALUE_WHEN_MIN_EQUALS_MAX;

    return (
      <Host>
        <div class="position-absolute-wrapper">
          <input
            aria-label={
              this.#accessibleNameFromExternalLabel ?? this.accessibleName
            }
            class="slider"
            disabled={this.disabled}
            type="range"
            min={this.minValue}
            max={actualMaxValue}
            step={this.step}
            value={actualValue}
            onChange={!this.disabled ? this.#handleChange : undefined}
            onInput={!this.disabled ? this.#handleInput : undefined}
          />

          <div
            class="track"
            part={`track${this.disabled ? " disabled" : ""}`}
            aria-hidden="true"
          >
            <div
              class="track__selected"
              part={`track__selected${this.disabled ? " disabled" : ""}`}
              style={{ "--slider-selected-value": `${valueInPercentage}%` }}
            ></div>
            <div
              class="track__unselected"
              part={`track__unselected${this.disabled ? " disabled" : ""}`}
              style={{
                "--slider-unselected-value": `${100 - valueInPercentage}%`
              }}
            ></div>
          </div>

          <div
            class="thumb"
            part={`thumb${this.disabled ? " disabled" : ""}`}
            style={{
              "--slider-thumb-position": `${valueInPercentage}%`,
              "--slider-value": `${valueInPercentage / 100}`
            }}
          ></div>
        </div>
      </Host>
    );
  }
}

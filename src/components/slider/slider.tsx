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

import { AccessibleNameComponent } from "../../common/interfaces";
import { SyncWithRAF } from "../../common/sync-with-frames";
import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";

const DEFAULT_PERCENTAGE_VALUE_WHEN_MIN_EQUALS_MAX = 0;

/**
 * The slider control is a input where the user selects a value from within a given range.
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
   */
  @Prop() readonly maxValue: number = 5;

  /**
   * This attribute lets you specify minimum value of the slider.
   */
  @Prop() readonly minValue: number = 0;

  /**
   * This attribute lets you indicate whether the control should display a
   * bubble with the current value upon interaction.
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
   */
  @Prop({ mutable: true }) value: number = 0;
  @Watch("value")
  valueChanged(newValue: number) {
    // Update form value
    this.internals.setFormValue(newValue.toString());
  }

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user.
   */
  @Event() change: EventEmitter<number>;

  /**
   * The `input` event is fired synchronously when the value is changed.
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

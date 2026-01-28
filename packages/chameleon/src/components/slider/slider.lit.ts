import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { DEV_MODE, IS_SERVER } from "../../development-flags";
import { analyzeLabelExistence } from "../../utilities/analysis/accessibility";
import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";
import { SyncWithRAF } from "../../utilities/sync-with-frames";

import styles from "./slider.scss?inline";

const DEFAULT_PERCENTAGE_VALUE_WHEN_MIN_EQUALS_MAX = 0;
const NumberPropType = { type: Number };

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
  shadow: { delegatesFocus: true, formAssociated: true },
  styles,
  tag: "ch-slider"
})
export class ChSlider extends KasstorElement {
  #accessibleNameFromExternalLabel: string | undefined;
  #lastModifiedValue = 0;

  /**
   * Useful for throttling the input event when the slider is updated by using
   * the pointer. In this case, the internal input event is fired as fast as it
   * can compute (for example, 400 times by second), but the host only needs to
   * process the event as fast as the refresh rate goes.
   */
  #valuePositionRAF = new SyncWithRAF();

  #internals = this.attachInternals();

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName:
    | string
    | undefined;

  /**
   * This attribute allows you specify if the element is disabled.
   * If disabled, it will not trigger any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * This attribute lets you specify maximum value of the slider.
   */
  @property(NumberPropType) maxValue: number = 5;

  /**
   * This attribute lets you specify minimum value of the slider.
   */
  @property(NumberPropType) minValue: number = 0;

  /**
   * Specifies the `name` of the component when used in a form.
   */
  @property({ noAccessor: true }) name: string | undefined;

  /**
   * This attribute lets you indicate whether the control should display a
   * bubble with the current value upon interaction.
   */
  @property({ type: Boolean }) showValue: boolean = false;

  /**
   * This attribute lets you specify the step of the slider.
   *
   * This attribute is useful when the values of the slider can only take some
   * discrete values. For example, if valid values are `[10, 20, 30]` set the
   * `minValue` to `10`, the maxValue to `30`, and the step to `10`. If the
   * step is `0`, the any intermediate value is valid.
   */
  @property(NumberPropType) step: number = 1;

  /**
   * The value of the control.
   */
  @property(NumberPropType) value: number = 0;
  @Observe("value")
  protected valueChanged() {
    this.#updateFormValue();
  }

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user.
   */
  @Event() protected change!: EventEmitter<number>;

  /**
   * The `input` event is fired synchronously when the value is changed.
   */
  @Event() protected input!: EventEmitter<number>;

  createPepe = () => {};

  createPepe2 = (): string => "";

  /**
   * asdasd
   *
   * asdasd123123
   * asd.1.23--
   * @param param1
   * @param param2 - 13123 adsasd the `change` asdasd
   * @returns 123123asd
   */
  createPaa = (param1: string, param2: string): string => "";

  #handleChange = (event: UIEvent) => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;

    // Toggle the value property
    this.value = Number(value);

    this.change.emit(this.value);
  };

  #handleInput = (event: UIEvent) => {
    event.stopPropagation();

    // Store the last value modified by the user interaction
    this.#lastModifiedValue = Number((event.target as HTMLInputElement).value);

    // Throttle the input event for pointer devices
    this.#valuePositionRAF.perform(this.#updateValue);
  };

  #updateValue = () => {
    this.value = this.#lastModifiedValue;

    // We update the form value here, instead of waiting the Watch decorator
    // callback to ensure the form has the value set when the input event is
    // listened
    this.#updateFormValue();

    this.input.emit(this.#lastModifiedValue);
  };

  #getActualValue = (maxValue?: number) =>
    Math.min(
      Math.max(this.minValue, this.value),
      maxValue ?? this.#computeMaxValue()
    );

  #computeMaxValue = () => Math.max(this.minValue, this.maxValue);

  #getValuePercentage = (
    minValue: number,
    value: number,
    maxValue: number
  ): number => {
    const selectedValue = (value - minValue) / (maxValue - minValue);

    return selectedValue * 100;
  };

  #updateFormValue = () =>
    this.#internals.setFormValue(this.#getActualValue().toString());

  protected override firstWillUpdate() {
    if (IS_SERVER) {
      return;
    }

    // Accessibility
    this.#updateFormValue();
    const labels = this.#internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue in dev mode
    if (DEV_MODE) {
      analyzeLabelExistence(
        this,
        "ch-slider",
        labels,
        this.#accessibleNameFromExternalLabel,
        this.accessibleName
      );
    }
  }

  override disconnectedCallback() {
    this.#valuePositionRAF.cancel();
    super.disconnectedCallback();
  }

  override render() {
    const actualMaxValue = this.#computeMaxValue();
    const actualValue = this.#getActualValue(actualMaxValue);

    const valueInPercentage =
      this.minValue < actualMaxValue
        ? this.#getValuePercentage(this.minValue, actualValue, actualMaxValue)
        : DEFAULT_PERCENTAGE_VALUE_WHEN_MIN_EQUALS_MAX;

    return html`<div class="position-absolute-wrapper">
      <input
        .ariaLabel=${
          // TODO: Add a unit test for this with SSR. We have to use a property
          // binding instead of an attribute one, because Lit wouldn't properly
          // hydrate this attribute when the ch-slider is SSRed
          this.#accessibleNameFromExternalLabel ??
          (this.accessibleName || nothing)
        }
        class="slider"
        .disabled=${this.disabled}
        type="range"
        min=${this.minValue}
        max=${actualMaxValue}
        step=${this.step}
        value=${actualValue}
        @change=${!this.disabled ? this.#handleChange : null}
        @input=${!this.disabled ? this.#handleInput : null}
      />

      <div
        class="track"
        part=${`track${this.disabled ? " disabled" : ""}`}
        aria-hidden="true"
      >
        <div
          class="track__selected"
          part=${`track__selected${this.disabled ? " disabled" : ""}`}
          style=${`--slider-selected-value: ${valueInPercentage}%`}
        ></div>
        <div
          class="track__unselected"
          part=${`track__unselected${this.disabled ? " disabled" : ""}`}
          style=${`--slider-unselected-value: ${100 - valueInPercentage}%`}
        ></div>
      </div>

      <div
        class="thumb"
        part=${`thumb${this.disabled ? " disabled" : ""}`}
        style=${`--slider-thumb-position: ${valueInPercentage}%; --slider-value: ${valueInPercentage / 100}`}
      ></div>
    </div>`;
  }
}

export default ChSlider;

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChSliderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSliderElement;
  }

  /** Type of the `ch-slider`'s `change` event. */
  // prettier-ignore
  type HTMLChSliderElementChangeEvent = HTMLChSliderElementCustomEvent<
    HTMLChSliderElementEventMap["change"]
  >;

  /** Type of the `ch-slider`'s `input` event. */
  // prettier-ignore
  type HTMLChSliderElementInputEvent = HTMLChSliderElementCustomEvent<
    HTMLChSliderElementEventMap["input"]
  >;

  interface HTMLChSliderElementEventMap {
    change: number;
    input: number;
  }

  interface HTMLChSliderElementEventTypes {
    change: HTMLChSliderElementChangeEvent;
    input: HTMLChSliderElementInputEvent;
  }

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
   *
   * @fires change The `change` event is emitted when a change to the element's value is
   *   committed by the user.
   * @fires input The `input` event is fired synchronously when the value is changed.
   */
  // prettier-ignore
  interface HTMLChSliderElement extends ChSlider {
    // Extend the ChSlider class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChSliderElementEventTypes>(type: K, listener: (this: HTMLChSliderElement, ev: HTMLChSliderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChSliderElementEventTypes>(type: K, listener: (this: HTMLChSliderElement, ev: HTMLChSliderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-slider": HTMLChSliderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-slider": HTMLChSliderElement;
  }
}


import {
  Component,
  Element,
  h,
  Prop,
  AttachInternals,
  Watch
} from "@stencil/core";
import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";

/**
 * @status experimental
 */
@Component({
  formAssociated: true,
  tag: "ch-rating",
  styleUrl: "rating.scss",
  shadow: { delegatesFocus: true }
})
export class ChRating {
  #accessibleNameFromExternalLabel: string | undefined;
  #starsArray: number[] = [];

  @AttachInternals() internals: ElementInternals;

  @Element() el!: HTMLChRatingElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * This attribute allows you specify if the element is disabled.
   * If disabled, it will not trigger any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This property determine the number of stars displayed.
   */
  @Prop() readonly stars: number = 5;
  @Watch("stars")
  startsChanged() {
    this.#computeArray();
  }

  /**
   * This attribute lets you specify the step of the rating. It accepts
   * non-integer values like 0.5, 0.2, 0.01 and so on.
   */
  @Prop() readonly step: number = 1;

  /**
   * The current value displayed by the component.
   */
  @Prop({ mutable: true }) value: number = 0;

  #computeArray = () => {
    this.#starsArray = [...Array(Math.max(0, this.stars)).keys()];
  };

  #syncValue = (event: InputEvent) => {
    this.value = Number((event.target as HTMLInputElement).value);
  };

  connectedCallback() {
    // Accessibility
    this.internals.setFormValue(this.value?.toString());
    const labels = this.internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    this.#computeArray();

    // Report any accessibility issue. // TODO: It should take into account the "caption" properties
    analyzeLabelExistence(
      this.el,
      "ch-rating",
      labels,
      this.#accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

  render() {
    // Max value should not be negative
    const calculatedMaxValue = Math.max(this.stars, 0);

    const calculatedValue = Math.min(
      Math.max(this.value, 0), // At least 0
      calculatedMaxValue // At most this.maxValue
    );

    return (
      <div class="container" part="stars-container">
        <input
          aria-label={
            this.#accessibleNameFromExternalLabel || this.accessibleName || null
          }
          type="range"
          disabled={this.disabled}
          min="0"
          max={calculatedMaxValue}
          step={this.step}
          value={calculatedValue}
          onInput={this.#syncValue}
        />

        {this.#starsArray.map(index => (
          <div
            key={index}
            aria-hidden="true"
            class="star"
            part="star"
            style={{
              "--start-selected-value": `${Math.min(
                Math.max(0, calculatedValue - index),
                1
              )}`
            }}
          ></div>
        ))}
      </div>
    );
  }
}

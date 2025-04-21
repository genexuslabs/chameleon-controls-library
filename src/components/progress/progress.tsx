import {
  AttachInternals,
  Component,
  Element,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { forceCSSMinMax } from "../../common/utils";
import {
  PROGRESS_MAX_VALUE,
  PROGRESS_MIN_VALUE,
  PROGRESS_VALUE
} from "./constants";
import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";

const ARIA_DESCRIBEDBY = "aria-describedby";
const ARIA_BUSY = "aria-busy";

const SEPARATE_BY_COMMA_REGEX = /\s*,\s*/;

let autoId = 0;

/**
 * The ch-progress is an element that displays the progress status for tasks
 * that take a long time.
 *
 * It implements all accessibility behaviors for determinate and indeterminate
 * progress. It also supports referencing a region to describe its progress.
 *
 * @status experimental
 */
@Component({
  formAssociated: true,
  shadow: true,
  styleUrl: "progress.scss",
  tag: "ch-progress"
})
export class ChProgress {
  // Create a unique ID for the control
  #progressId: string = `ch-progress-${autoId++}`;

  @AttachInternals() internals: ElementInternals;

  @Element() el!: HTMLChProgressElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string | undefined;

  /**
   * Assistive technologies often present the `value` as a percentage. If this
   * would not be accurate use this property to make the progress bar value
   * understandable.
   *
   * @example
   * accessibleValueText = `Downloading ${PROGRESS_VALUE} MB of ${PROGRESS_MAX_VALUE} MB`
   */
  @Prop() readonly accessibleValueText?: string | undefined;

  /**
   * Specifies whether the progress is indeterminate or not. In other words, it
   * indicates that an activity is ongoing with no indication of how long it is
   * expected to take.
   *
   * If `true`, the `max`, `min` and `value` properties won't be taken into
   * account.
   */
  @Prop({ reflect: true }) readonly indeterminate?: boolean = false;

  /**
   * Specifies the maximum value of progress. In other words, how much work the
   * task indicated by the progress component requires.
   *
   * This property is not used if indeterminate === true.
   */
  @Prop() readonly max?: number = 100;

  /**
   * Specifies the minimum value of progress.
   *
   * This property is not used if indeterminate === true.
   */
  @Prop() readonly min?: number = 0;

  /**
   * This property specifies how the progress will be render.
   *  - `"custom"`: Useful for making custom renders of the progress. The
   *    control doesn't render anything and only projects the content of the
   *    default slot. Besides that, all specified properties are still used to
   *    implement the control's accessibility.
   */
  @Prop() readonly renderType: "custom" | string = "custom";

  /**
   * If the control is describing the loading progress of a particular region
   * of a page, set this property with the reference of the loading region.
   * This will set the `aria-describedby` and `aria-busy` attributes on the
   * loading region to improve the accessibility while the control is in
   * progress.
   *
   * When the control detects that is no longer in progress (aka it is removed
   * from the DOM or value === maxValue with indeterminate === false), it will
   * remove the `aria-busy` attribute and update (or remove if necessary) the
   * `aria-describedby` attribute.
   *
   * If an ID is set prior to the control's first render, the control will use
   * this ID for the `aria-describedby`. Otherwise, the control will compute a
   * unique ID for this matter.
   *
   * **Important**: If you are using Shadow DOM, take into account that the
   * `loadingRegionRef` must be in the same Shadow Tree as this control.
   * Otherwise, the `aria-describedby` binding won't work, since the control ID
   * is not visible for the `loadingRegionRef`.
   */
  @Prop() readonly loadingRegionRef?: HTMLElement | undefined;
  @Watch("loadingRegionRef")
  regionLoadingRefChanged(_, oldValue: HTMLElement | undefined) {
    this.#removeAriaBusyAndAriaDescribedByInRegion(oldValue);
  }

  /**
   * Specifies the current value of the component. In other words, how much of
   * the task that has been completed.
   *
   * This property is not used if indeterminate === true.
   */
  @Prop() readonly value?: number = 0;

  #getControlId = () => this.el.id ?? this.#progressId;

  #getMaxValue = () => Math.max(this.min, this.max);

  /**
   * The controls doesn't have completed its progress if it is indeterminate or
   * the current value is lesser than the max value.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #isInProgress = () =>
    this.indeterminate ||
    forceCSSMinMax(this.value, this.min, this.max) < this.#getMaxValue();

  #regionHasAriaDescribedByWithProgressId = () =>
    (this.loadingRegionRef.getAttribute(ARIA_DESCRIBEDBY) ?? "").includes(
      this.#getControlId()
    );

  #setAriaBusyAndAriaDescribedByInRegion = () => {
    if (
      !this.loadingRegionRef ||
      this.#regionHasAriaDescribedByWithProgressId()
    ) {
      return;
    }

    const controlId = this.#getControlId();
    const ariaDescribedByValue =
      this.loadingRegionRef.getAttribute(ARIA_DESCRIBEDBY) ?? "";

    this.loadingRegionRef.setAttribute(ARIA_BUSY, "true");
    this.loadingRegionRef.setAttribute(
      ARIA_DESCRIBEDBY,
      // Checks if the ariaDescribedBy has a value and appends the ID if
      // necessary
      ariaDescribedByValue === ""
        ? controlId
        : `${ariaDescribedByValue},${controlId}`
    );
  };

  #removeAriaBusyAndAriaDescribedByInRegion = (
    regionLoadingRef: HTMLElement | undefined
  ) => {
    if (!regionLoadingRef) {
      return;
    }

    regionLoadingRef.removeAttribute(ARIA_BUSY);

    if (this.#regionHasAriaDescribedByWithProgressId()) {
      const controlId = this.#getControlId();

      const ariaDescribedByValuesWithoutControlId = regionLoadingRef
        .getAttribute(ARIA_DESCRIBEDBY)!
        .split(SEPARATE_BY_COMMA_REGEX)
        .filter(id => id === controlId);

      // If the control ID was the only value for the aria-describedby, there
      // is no need to keep in the DOM the aria-describedby
      if (ariaDescribedByValuesWithoutControlId.length === 0) {
        regionLoadingRef.removeAttribute(ARIA_DESCRIBEDBY);
      }
      // There are more values for the aria-describedby, keep the other values
      else {
        regionLoadingRef.setAttribute(
          ARIA_DESCRIBEDBY,
          ariaDescribedByValuesWithoutControlId.join(",")
        );
      }
    }
  };

  #customRender = () => <slot></slot>;

  #renderDictionary = {
    custom: this.#customRender
  };

  connectedCallback() {
    // Set the unique ID if it was not already set in the Host
    this.el.id ??= this.#progressId;

    this.el.setAttribute("role", "progressbar");

    const labels = this.internals.labels;
    const accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-progress",
      labels,
      accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

  componentWillRender() {
    // We must set the aria-busy="true" and aria-describedby="controlId"
    // attributes in the loadingRegionRef to improve the accessibility
    if (this.#isInProgress()) {
      this.#setAriaBusyAndAriaDescribedByInRegion();
    } else {
      this.#removeAriaBusyAndAriaDescribedByInRegion(this.loadingRegionRef);
    }
  }

  disconnectedCallback() {
    this.#removeAriaBusyAndAriaDescribedByInRegion(this.loadingRegionRef);
  }

  render() {
    // TODO: Add a unit test for checking that the progress still works when
    // passing an invalid renderType. It should default to the custom render.
    const progressRender =
      this.#renderDictionary[this.renderType] ?? this.#customRender;

    const actualMinValue =
      // aria-valuemin is 0 by default
      this.indeterminate || this.min === 0 ? undefined : `${this.min}`;

    const actualValue = this.indeterminate
      ? undefined
      : `${forceCSSMinMax(this.value, this.min, this.max)}`;

    const actualMaxValue =
      // aria-valuemax is 100 by default
      this.indeterminate || (this.max === 100 && this.min <= this.max)
        ? undefined
        : `${this.#getMaxValue()}`;

    return (
      <Host
        aria-label={this.accessibleName}
        aria-valuemin={actualMinValue}
        aria-valuemax={actualMaxValue}
        aria-valuenow={this.accessibleValueText ? undefined : actualValue}
        aria-valuetext={
          this.indeterminate || !this.accessibleValueText
            ? undefined
            : this.accessibleValueText
                .replace(PROGRESS_MIN_VALUE, actualMinValue)
                .replace(PROGRESS_MAX_VALUE, actualMaxValue)
                .replace(PROGRESS_VALUE, actualValue)
        }
      >
        {progressRender()}
      </Host>
    );
  }
}

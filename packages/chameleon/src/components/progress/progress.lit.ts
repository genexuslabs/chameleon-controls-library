import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators.js";

import { DEV_MODE } from "../../development-flags";
import { analyzeLabelExistence } from "../../utilities/analysis/accessibility";
import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";
import { forceCSSMinMax } from "../../utilities/force-css-min-max";
import { Host } from "../../utilities/host/host";
import {
  PROGRESS_MAX_VALUE,
  PROGRESS_MIN_VALUE,
  PROGRESS_VALUE
} from "./constants";

import styles from "./progress.scss?inline";

const NUMBER_TYPE_PROP = { type: Number };

const ARIA_DESCRIBED_BY = "aria-describedby";
const ARIA_BUSY = "aria-busy";

const SEPARATE_BY_COMMA_REGEX = /\s*,\s*/;
const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 100;

const customRender = () => html`<slot></slot>`;

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
  shadow: { formAssociated: true },
  styles,
  tag: "ch-progress"
})
export class ChProgress extends KasstorElement {
  // Create a unique ID for the control
  #progressId: string = `ch-progress-${autoId++}`;

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
   * Assistive technologies often present the `value` as a percentage. If this
   * would not be accurate use this property to make the progress bar value
   * understandable.
   *
   * @example
   * accessibleValueText = `Downloading ${PROGRESS_VALUE} MB of ${PROGRESS_MAX_VALUE} MB`
   */
  @property({ attribute: "accessible-value-text" }) accessibleValueText:
    | string
    | undefined;

  /**
   * Specifies whether the progress is indeterminate or not. In other words, it
   * indicates that an activity is ongoing with no indication of how long it is
   * expected to take.
   *
   * If `true`, the `max`, `min` and `value` properties won't be taken into
   * account.
   */
  @property({ reflect: true, type: Boolean }) indeterminate: boolean = false;

  /**
   * Specifies the maximum value of progress. In other words, how much work the
   * task indicated by the progress component requires.
   *
   * This property is not used if indeterminate === true.
   */
  @property(NUMBER_TYPE_PROP) max: number = DEFAULT_MAX_VALUE;

  /**
   * Specifies the minimum value of progress.
   *
   * This property is not used if indeterminate === true.
   */
  @property(NUMBER_TYPE_PROP) min: number = DEFAULT_MIN_VALUE;

  /**
   * Specifies the `name` of the component when used in a form.
   */
  @property({ noAccessor: true }) name: string | undefined;

  /**
   * This property specifies how the progress will be render.
   *  - `"custom"`: Useful for making custom renders of the progress. The
   *    control doesn't render anything and only projects the content of the
   *    default slot. Besides that, all specified properties are still used to
   *    implement the control's accessibility.
   */
  @property({ attribute: "render-type" }) renderType: "custom" | string =
    "custom";

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
  @property({ attribute: false }) loadingRegionRef: HTMLElement | undefined;
  @Observe("loadingRegionRef")
  protected regionLoadingRefChanged(
    _: unknown,
    oldValue: HTMLElement | undefined
  ) {
    this.#removeAriaBusyAndAriaDescribedByInRegion(oldValue);
  }

  /**
   * Specifies the current value of the component. In other words, how much of
   * the task that has been completed.
   *
   * This property is not used if indeterminate === true.
   */
  @property(NUMBER_TYPE_PROP) value: number = DEFAULT_MIN_VALUE;

  #getControlId = () => this.id ?? this.#progressId;

  #getMaxValue = () => Math.max(this.min, this.max);

  /**
   * The controls doesn't have completed its progress if it is indeterminate or
   * the current value is lesser than the max value.
   */
  #isInProgress = () =>
    this.indeterminate ||
    forceCSSMinMax(this.value, this.min, this.max) < this.#getMaxValue();

  #regionHasAriaDescribedByWithProgressId = () =>
    (this.loadingRegionRef!.getAttribute(ARIA_DESCRIBED_BY) ?? "").includes(
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
      this.loadingRegionRef.getAttribute(ARIA_DESCRIBED_BY) ?? "";

    this.loadingRegionRef.setAttribute(ARIA_BUSY, "true");
    this.loadingRegionRef.setAttribute(
      ARIA_DESCRIBED_BY,
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
        .getAttribute(ARIA_DESCRIBED_BY)!
        .split(SEPARATE_BY_COMMA_REGEX)
        .filter(id => id === controlId);

      // If the control ID was the only value for the aria-describedby, there
      // is no need to keep in the DOM the aria-describedby
      if (ariaDescribedByValuesWithoutControlId.length === 0) {
        regionLoadingRef.removeAttribute(ARIA_DESCRIBED_BY);
      }
      // There are more values for the aria-describedby, keep the other values
      else {
        regionLoadingRef.setAttribute(
          ARIA_DESCRIBED_BY,
          ariaDescribedByValuesWithoutControlId.join(",")
        );
      }
    }
  };

  #renderDictionary = {
    custom: customRender
  };

  override connectedCallback() {
    super.connectedCallback();

    // Set the unique ID if it was not already set in the Host
    this.id ??= this.#progressId;

    this.setAttribute("role", "progressbar");

    const labels = this.#internals.labels;
    const accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue in dev mode
    if (DEV_MODE) {
      analyzeLabelExistence(
        this,
        "ch-progress",
        labels,
        accessibleNameFromExternalLabel,
        this.accessibleName
      );
    }
  }

  override willUpdate() {
    // We must set the aria-busy="true" and aria-describedby="controlId"
    // attributes in the loadingRegionRef to improve the accessibility
    if (this.#isInProgress()) {
      this.#setAriaBusyAndAriaDescribedByInRegion();
    } else {
      this.#removeAriaBusyAndAriaDescribedByInRegion(this.loadingRegionRef);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#removeAriaBusyAndAriaDescribedByInRegion(this.loadingRegionRef);
  }

  override render() {
    // TODO: Add a unit test for checking that the progress still works when
    // passing an invalid renderType. It should default to the custom render.
    const progressRender =
      this.#renderDictionary[this.renderType as "custom"] ?? customRender;

    const actualMinValue =
      // aria-valuemin is 0 by default
      this.indeterminate || this.min === DEFAULT_MIN_VALUE
        ? undefined
        : `${this.min}`;

    const actualValue = this.indeterminate
      ? undefined
      : `${forceCSSMinMax(this.value, this.min, this.max)}`;

    const actualMaxValue =
      // aria-valuemax is 100 by default
      this.indeterminate ||
      (this.max === DEFAULT_MAX_VALUE && this.min <= this.max)
        ? undefined
        : `${this.#getMaxValue()}`;

    Host(this, {
      properties: {
        // TODO: We should not set the accessibleName if it was a visible label
        ariaLabel: this.accessibleName,
        ariaValueMin: actualMinValue,
        ariaValueMax: actualMaxValue,
        ariaValueNow: this.accessibleValueText ? undefined : actualValue,
        ariaValueText:
          this.indeterminate || !this.accessibleValueText
            ? undefined
            : this.accessibleValueText
                .replace(
                  PROGRESS_MIN_VALUE,
                  actualMinValue ?? `${DEFAULT_MIN_VALUE}`
                )
                .replace(
                  PROGRESS_MAX_VALUE,
                  actualMaxValue ?? `${DEFAULT_MAX_VALUE}`
                )
                .replace(PROGRESS_VALUE, actualValue!)
      }
    });

    return progressRender();
  }
}

export default ChProgress;

declare global {
  interface HTMLElementTagNameMap {
    "ch-progress": ChProgress;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChProgressElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChProgressElement;
  }

  /**
   * The ch-progress is an element that displays the progress status for tasks
   * that take a long time.
   *
   * It implements all accessibility behaviors for determinate and indeterminate
   * progress. It also supports referencing a region to describe its progress.
   *
   * @status experimental
   */// prettier-ignore
  interface HTMLChProgressElement extends ChProgress {
    // Extend the ChProgress class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-progress": HTMLChProgressElement;
  }

  interface HTMLElementTagNameMap {
    "ch-progress": HTMLChProgressElement;
  }
}


import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Prop
} from "@stencil/core";

const REGEX_TO_REPLACE_PERCENTAGE = /%/g;
const REGEX_TO_TEST_DIP = /^\d+(dip)?$/;
const REGEX_TO_TEST_PERCENTAGE = /^\d+(%)?$/;

/**
 * The `ch-intersection-observer` component is a declarative wrapper around the native `IntersectionObserver` API that emits events when slotted content crosses visibility thresholds.
 *
 * @remarks
 * ## Features
 *  - Observes element visibility relative to a specified root element or the browser viewport.
 *  - Configurable visibility thresholds as comma-separated percentages (e.g., `"25%,50%,75%"`).
 *  - Root margins in device-independent pixels (dip) or percentages to expand or contract the intersection area.
 *  - Emits an `intersectionUpdate` event with full `IntersectionObserverEntry` details.
 *  - Automatically disconnects the observer when the component is removed from the DOM.
 *  - The host renders with `display: contents`, so it does not affect layout.
 *
 * ## Use when
 *  - Triggering actions when an element scrolls into or out of view.
 *  - Implementing lazy loading of images or components that should only load when scrolled into view.
 *  - Triggering animations or data fetching when an element enters the viewport.
 *
 * ## Do not use when
 *  - You need to observe element resizing — use a `ResizeObserver` instead.
 *  - Continuous scroll position tracking is needed — use a scroll event listener instead.
 *  - The target element uses `display: contents` — the observer skips elements with that display value and looks for the first descendant that has a box.
 *
 * ## Slots
 *  - `content`: The element to be observed for intersection changes. The observer targets the first child element whose computed `display` is not `contents`.
 *
 * ## Accessibility
 *  - This component is purely behavioral and renders no visible UI of its own. It has no keyboard or ARIA implications.
 *
 * @status experimental
 *
 * @slot content - The element to be observed for intersection changes.
 */
@Component({
  tag: "ch-intersection-observer",
  styleUrl: "intersection-observer.scss",
  shadow: true
})
export class IntersectionObserverControl {
  private defaultThreshold: Array<number> = [0];
  private observer: IntersectionObserver;
  private rootElement: HTMLElement;
  private rootMarginString = "";

  @Element() element: HTMLChIntersectionObserverElement;

  /**
   * Bottom margin around the root element. Accepts a device-independent pixel
   * value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g.,
   * `"10%"`). Invalid values default to `"0px"`.
   *
   * Init-only — changes after `componentDidLoad` have no effect.
   */
  @Prop() readonly bottomMargin: string;

  /**
   * Left margin around the root element. Accepts a device-independent pixel
   * value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g.,
   * `"10%"`). Invalid values default to `"0px"`.
   *
   * Init-only — changes after `componentDidLoad` have no effect.
   */
  @Prop() readonly leftMargin: string;

  /**
   * Right margin around the root element. Accepts a device-independent pixel
   * value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g.,
   * `"10%"`). Invalid values default to `"0px"`.
   *
   * Init-only — changes after `componentDidLoad` have no effect.
   */
  @Prop() readonly rightMargin: string;

  /**
   * The DOM ID of the element to use as the intersection root (viewport).
   * The element is resolved via `document.getElementById`. If not specified or
   * if the ID does not match any element, the browser viewport is used.
   *
   * Init-only — changes after `componentDidLoad` have no effect.
   */
  @Prop() readonly root: string;

  /**
   * Comma-separated percentage values representing the visibility thresholds
   * at which the `intersectionUpdate` event fires. Each value must be a
   * number optionally followed by `%` (e.g., `"25%,50%,75%"`). Values
   * exceeding 100% are ignored. If not specified, defaults to `[0]` (fires
   * as soon as even one pixel is visible).
   *
   * Init-only — changes after `componentDidLoad` have no effect.
   */
  @Prop() readonly threshold: string;

  /**
   * Top margin around the root element. Accepts a device-independent pixel
   * value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g.,
   * `"10%"`). Invalid values default to `"0px"`.
   *
   * Init-only — changes after `componentDidLoad` have no effect.
   */
  @Prop() readonly topMargin: string;

  /**
   * Emitted whenever the observed element crosses one of the visibility
   * thresholds specified by the `threshold` property. The event payload is
   * the first `IntersectionObserverEntry` from the observer callback, which
   * contains the intersection ratio, bounding rectangles, and visibility
   * state.
   *
   * Not cancelable. Emitted synchronously within the `IntersectionObserver`
   * callback.
   */
  @Event() intersectionUpdate: EventEmitter<IntersectionObserverEntry>;

  /**
   * Used to check that the passed value is a valid device-independent-pixel (dip)
   * value, and transform the dip to `px` value.
   * @example
   * Input: "200dip" Output: "200px"
   * Input: "50%" Output: "0px"
   * @param percentValue Represent the given dip value
   * @returns When is a valid dip value returns the value converted to pixels. Otherwise returns "0px".
   */
  private checkValidDipValue(dipValue: string) {
    return REGEX_TO_TEST_DIP.test(dipValue)
      ? this.convertDipToPxValue(dipValue)
      : "0px";
  }

  /**
   * Used to check that the passed value is a valid percentage. @example: "200%"
   * @param percentValue : Represent the given percentage value
   * @returns When is a valid percentage value returns the value, otherwise returns "0px"
   */
  private checkValidPercentValue(percentValue: string) {
    return REGEX_TO_TEST_PERCENTAGE.test(percentValue) ? percentValue : "0px";
  }

  /**
   * @todo TODO: Simplify this implementation
   * Transform the given dip value to pixels
   * @param dipValue Represent the given dip value @example "10dip"
   * @returns Returns the given value converted to px @example "10px"
   */
  private convertDipToPxValue(dipValue: string) {
    const aux = dipValue.replace("dip", "px");
    return aux.split(" ").join("");
  }

  /**
   * Convert the given percentages string representing a threshold value in decimal value
   * @param threshold Threshold string representation @example: "10%"
   * @returns Decimal value between 0 and 1 @example: 0.1
   */
  private convertThresholdValueToNumber(threshold: string) {
    if (REGEX_TO_TEST_PERCENTAGE.test(threshold)) {
      return Number(threshold.replace(REGEX_TO_REPLACE_PERCENTAGE, "")) / 100;
    }

    return 0;
  }

  /**
   * Create a valid Javascript IntersectionObserver API threshold  options value
   * @param threshold Threshold string representation @example: "10%,30%,40%"
   * @returns Valid array of numbers in the range between 0 and 1 @example: [0.1, 0.3, 0.4]
   */
  private parseThreshold(threshold: string): number[] {
    if (!threshold) {
      return [0];
    }

    const finalThresholds: number[] = [];
    const thresholdsToParse = threshold.split(",");

    thresholdsToParse.forEach(thresholdValue => {
      const convertedNumber =
        this.convertThresholdValueToNumber(thresholdValue);

      if (convertedNumber <= 1) {
        finalThresholds.push(convertedNumber);
      }
    });
    return finalThresholds;
  }

  /**
   * Initialize intersection observer with its options and start observing
   */
  private setIntersectionObserver() {
    const options: IntersectionObserverInit = {
      root: this.rootElement,
      rootMargin: this.rootMarginString,
      threshold: this.defaultThreshold
    };
    this.observer = new IntersectionObserver(entries => {
      this.intersectionUpdate.emit(entries[0]);
    }, options);

    const childElement = this.getChildElement();

    if (childElement) {
      this.observer.observe(childElement);
    }
  }

  /**
   * @returns The first child element that its display CSS property is different from `contents`
   */
  private getChildElement() {
    let childElement = this.element.firstElementChild as HTMLElement;

    while (
      childElement &&
      getComputedStyle(childElement).display === "contents"
    ) {
      childElement = childElement.firstElementChild as HTMLElement;
    }
    return childElement;
  }

  /**
   * Transform the given initial intersection-observer component properties
   * into Javascript IntersectionObserver API options valid values.
   */
  private setIntersectionObserverOptionsFromProperties() {
    if (this.root) {
      this.rootElement = document.getElementById(this.root);
    }
    this.rootMarginString = [
      this.validatePosition(this.topMargin),
      this.validatePosition(this.leftMargin),
      this.validatePosition(this.bottomMargin),
      this.validatePosition(this.rightMargin)
    ].join(" ");

    this.defaultThreshold = this.parseThreshold(this.threshold);
  }

  /**
   * Check that the given string value is a valid percentage or device
   * independent pixel (dip) value.
   * @param position Represent the given dip or px value
   */
  private validatePosition(position: string) {
    if (position && position.endsWith("dip")) {
      return this.checkValidDipValue(position);
    }
    return this.checkValidPercentValue(position);
  }

  componentDidLoad() {
    this.setIntersectionObserverOptionsFromProperties();
    this.setIntersectionObserver();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  render() {
    return <slot name="content" />;
  }
}

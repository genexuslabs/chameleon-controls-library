import {
  Component,
  h,
  EventEmitter,
  Event,
  Element,
  Host,
  Prop
} from "@stencil/core";

const REGEX_TO_REPLACE_PERCENTAGE = /%/g;
const REGEX_TO_TEST_DIP = /^\d+(dip)?$/;
const REGEX_TO_TEST_PERCENTAGE = /^\d+(%)?$/;

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
   * Bottom margin around the root element
   */
  @Prop() readonly bottomMargin: string;

  /**
   * A CSS class to set as the gx-intersection-observer element class
   */
  @Prop() readonly cssClass: string;

  /**
   * Left margin around the root element
   */
  @Prop() readonly leftMargin: string;

  /**
   * Right margin around the root element
   */
  @Prop() readonly rightMargin: string;

  /**
   *  Set the ID of the component that is used as the viewport, default is the browser.
   */
  @Prop() readonly root: string;

  /**
   * Numeric values representing percentages of the target element which are visible.
   */
  @Prop() readonly threshold: string;

  /**
   * Top margin around the root element
   */
  @Prop() readonly topMargin: string;

  /**
   * Emitted whenever the control reaches a threshold specified by the threshold property
   * @param IntersectionObserverEntry Details of intersection object.
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

    this.observer.observe(this.element);
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
    return (
      <Host
        class={{
          [this.cssClass]: !!this.cssClass
        }}
      >
        <slot name="content" />
      </Host>
    );
  }
}

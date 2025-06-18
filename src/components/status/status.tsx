import {
  AttachInternals,
  Component,
  Element,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";

const ARIA_BUSY = "aria-busy";
const ARIA_DESCRIBEDBY = "aria-describedby";

let autoId = 0;

/**
 * The ch-status is an element that provides a loading indicator.
 * It informs the loading state in various parts of the user interface,
 * such as buttons, overlays, and other elements.
 *
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "status.scss",
  tag: "ch-status"
})
export class ChStatus {
  // Create a unique ID for the control
  #statusId: string = `ch-status-${autoId++}`;

  @AttachInternals() internals: ElementInternals;

  @Element() el!: HTMLChStatusElement;

  /**
   * Specifies a short string that authors associate with an element
   * to provide users of assistive technologies with a label for the element.
   */
  @Prop() readonly accessibleName?: string | undefined;

  /**
   * If the control is describing the loading progress of a particular region
   * of a page, set this property with the reference of the loading region.
   * This will set the `aria-describedby` and `aria-busy` attributes on the
   * loading region to improve accessibility while the control is in progress.
   */
  @Prop() readonly loadingRegionRef?: HTMLElement | undefined;

  @Watch("loadingRegionRef")
  regionLoadingRefChanged(_, oldValue: HTMLElement | undefined) {
    this.#removeAriaBusyAndAriaDescribedByInRegion(oldValue);
  }

  #setAriaBusyAndAriaDescribedByInRegion = () => {
    if (!this.loadingRegionRef) {
      return;
    }

    this.loadingRegionRef.setAttribute(ARIA_BUSY, "true");
    this.loadingRegionRef.setAttribute(ARIA_DESCRIBEDBY, this.#statusId);
  };

  #removeAriaBusyAndAriaDescribedByInRegion = (
    regionLoadingRef: HTMLElement | undefined
  ) => {
    if (!regionLoadingRef) {
      return;
    }

    regionLoadingRef.removeAttribute(ARIA_BUSY);
    regionLoadingRef.removeAttribute(ARIA_DESCRIBEDBY);
  };

  componentWillRender() {
    // Check if the component should be active based on external conditions
    if (this.loadingRegionRef) {
      this.#setAriaBusyAndAriaDescribedByInRegion();
    } else {
      this.#removeAriaBusyAndAriaDescribedByInRegion(this.loadingRegionRef);
    }
  }

  disconnectedCallback() {
    this.#removeAriaBusyAndAriaDescribedByInRegion(this.loadingRegionRef);
  }

  render() {
    return (
      <Host
        role="status"
        aria-live="polite"
        aria-label={this.accessibleName}
        id={this.#statusId}
      >
        <slot></slot>
      </Host>
    );
  }
}

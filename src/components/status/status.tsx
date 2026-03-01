import {
  AttachInternals,
  Component,
  Element,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";

const ARIA_BUSY = "aria-busy";
const ARIA_DESCRIBEDBY = "aria-describedby";

let autoId = 0;

/**
 * The `ch-status` component provides a lightweight loading indicator that
 * communicates an ongoing process to both visual users and assistive
 * technologies.
 *
 * @remarks
 * ## Features
 *  - Sets `role="status"` and `aria-live="polite"` for non-interrupting screen reader announcements.
 *  - Automatic `aria-busy` and `aria-describedby` management on a referenced loading region.
 *  - Cleans up ARIA attributes when removed from the DOM.
 *  - Designed for use inside buttons, overlays, table cells, and any region needing a simple "busy" signal.
 *
 * ## Use when
 *  - You need an indeterminate loading state without numeric progress (e.g., a spinner on a button).
 *  - A region of the page is loading and no progress percentage is available (spinner pattern).
 *  - An operation is running in the background and the user should be aware without being interrupted.
 *
 * ## Do not use when
 *  - You have tasks with measurable progress -- prefer `ch-progress` instead.
 *  - Actual progress percentage is known — prefer `ch-progress` with determinate mode instead.
 *
 * ## Accessibility
 *  - The host has `role="status"` and `aria-live="polite"` for non-interrupting announcements to assistive technology.
 *  - Resolves its accessible name from the `accessibleName` property.
 *  - Can automatically set `aria-busy` and `aria-describedby` on a referenced loading region element.
 *
 * @status experimental
 *
 * @slot - Default slot. Use it to project custom visual content such as a spinner icon or loading text.
 */
@Component({
  formAssociated: true,
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
   * loading region to improve accessibility while the control is in rendered.
   *
   * When the control detects that is no longer in rendered (aka it is removed
   * from the DOM), it will remove the `aria-busy` attribute and update (or
   * remove if necessary) the`aria-describedby` attribute.
   *
   * If an ID is set prior to the component's first render, the ch-status will use
   * this ID for the `aria-describedby`. Otherwise, the ch-status will compute a
   * unique ID for this matter.
   *
   * **Important**: If you are using Shadow DOM, take into account that the
   * `loadingRegionRef` must be in the same Shadow Tree as the ch-status.
   * Otherwise, the `aria-describedby` binding won't work, since the control ID
   * is not visible for the `loadingRegionRef`.
   */
  @Prop() readonly loadingRegionRef?: HTMLElement | undefined;

  @Watch("loadingRegionRef")
  regionLoadingRefChanged(_, oldValue: HTMLElement | undefined) {
    this.#removeAriaBusyAndAriaDescribedByInRegion(oldValue);
  }

  #getControlId = () => this.el.id ?? this.#statusId;

  #setAriaBusyAndAriaDescribedByInRegion = () => {
    if (!this.loadingRegionRef) {
      return;
    }

    this.loadingRegionRef.setAttribute(ARIA_BUSY, "true");
    this.loadingRegionRef.setAttribute(ARIA_DESCRIBEDBY, this.#getControlId());
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

  connectedCallback() {
    // Set the unique ID if it was not already set in the Host
    this.el.id ??= this.#statusId;

    this.el.setAttribute("role", "status");
    this.el.setAttribute("aria-live", "polite");

    const labels = this.internals.labels;
    const accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-status",
      labels,
      accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

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
      <Host aria-label={this.accessibleName}>
        <slot></slot>
      </Host>
    );
  }
}

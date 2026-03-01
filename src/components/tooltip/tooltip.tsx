import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { focusComposedPath } from "../common/helpers";
import { ChPopoverAlign } from "../popover/types";

const LISTENER_CONFIG = {
  passive: true
} as const satisfies AddEventListenerOptions;

const ARIA_DESCRIBED_BY = "aria-describedby";
const ARIA_LABEL = "aria-label";
const TOOLTIP = "tooltip";

let autoId = 0;

/**
 * The `ch-tooltip` component displays supplementary information in a small overlay that appears on hover or focus of a trigger element, following the WAI-ARIA tooltip pattern.
 *
 * @remarks
 * ## Features
 *  - Configurable block and inline alignment via `ch-popover`.
 *  - Display delay.
 *  - Automatic `aria-describedby` / `aria-label` management on the action element.
 *  - Three trigger modes: internal button (omit `actionElement`), parent element (`actionElement = null`), or external `HTMLButtonElement` reference.
 *  - Respects `focus-visible` semantics: stays visible while keyboard-focused even after mouse leaves.
 *  - Dismisses on outside click.
 *
 * ## Use when
 *  - You need short, non-interactive contextual hints attached to a trigger element.
 *  - Labelling icon-only buttons where the icon's meaning may be ambiguous.
 *  - Providing keyboard shortcut reminders or supplementary context that aids but does not block the user.
 *
 * ## Do not use when
 *  - You need richer overlay content that the user interacts with -- use `ch-popover` directly instead.
 *  - The information is ESSENTIAL — tooltips are invisible to touch device users and disappear on mobile; always use visible labels for required information.
 *  - The content includes interactive elements (links, buttons) — prefer `ch-popover`.
 *  - The target is a disabled element — disabled elements cannot receive focus, making the tooltip inaccessible.
 *  - The content is longer than 1–2 short sentences — use `ch-popover` instead.
 *
 * ## Accessibility
 *  - The host receives `role="tooltip"` when visible and `aria-hidden="true"` when hidden.
 *  - Automatically manages `aria-describedby` on the action element, linking it to the tooltip content.
 *  - Follows focus-visible semantics: the tooltip remains visible on keyboard focus even after the mouse leaves.
 *  - Supports configurable `aria-label` on the action element via `actionElementAccessibleName`.
 *
 * @status experimental
 *
 * @part action - The internally rendered `<button>` that acts as the tooltip trigger. Only present when `actionElement` is `undefined` (i.e., the action lives inside the shadow DOM).
 * @part window - The `ch-popover` element that contains the tooltip content. Only present while the tooltip is visible.
 *
 * @slot action - Content projected inside the internal trigger button. Rendered when `actionElement` is `undefined`.
 * @slot - Default slot. The tooltip content displayed inside the popover window.
 */
@Component({
  tag: "ch-tooltip",
  styleUrl: "tooltip.scss",
  shadow: true
})
export class ChTooltip implements ComponentInterface {
  #tooltipId: string;

  #addListenersForTheActionElement = true;
  #actualActionElement: HTMLButtonElement;

  // Refs
  #innerActionRef: HTMLButtonElement | undefined;

  @Element() el!: HTMLChTooltipElement;

  /**
   * Specifies if the popover is visible.
   */
  @State() visible = false;
  @Watch("visible")
  visibleChanged(isVisible: boolean) {
    if (isVisible) {
      this.#removeDisplayListeners();
      this.#addListenersToHidePopover();
    } else {
      this.#removeHideListeners();
      this.#addListenersToDisplayPopover();
    }
  }

  /**
   * Specifies a reference for the action that opens the tooltip.
   *
   * If `undefined`, a button on the tooltip will be rendered and the slot
   * "action" can be used to display the content of the action.
   *
   * If `null`, the parentElement will be used as the action reference.
   */
  @Prop() readonly actionElement?: HTMLButtonElement | undefined | null;
  @Watch("actionElement")
  actionElementChanged() {
    this.#removeAllListeners();
    this.#addListenersForTheActionElement = true;

    // We have to remove the aria-describedby and aria-label first, because the
    // actionElement can transition from null to the actual parentElement,
    // which in the end is the "same action element"
    this.#removeAriaLabelInActionElement();
    this.#removeAriaDescribedByInActionElement();
  }

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the actionElement. This property is necessary to provide a label when
   * the tooltip is not displayed.
   */
  @Prop() readonly actionElementAccessibleName: string | undefined;
  @Watch("actionElementAccessibleName")
  actionElementAccessibleNameChanged() {
    if (this.actionElementAccessibleName) {
      this.#addAriaLabelToTheActionElement();
    } else {
      this.#removeAriaLabelInActionElement();
    }
  }

  /**
   * Specifies the block alignment of the window.
   */
  @Prop() readonly blockAlign: ChPopoverAlign = "outside-end";

  /**
   * Specifies the delay (in ms) for the tooltip to be displayed.
   */
  @Prop() readonly delay: number = 100;

  /**
   * Specifies the inline alignment of the window.
   */
  @Prop() readonly inlineAlign: ChPopoverAlign = "center";

  #handleEnter = () => {
    this.visible = true;
  };

  #handleLeave = () => {
    const focusedWithFocusVisible =
      focusComposedPath()[0] === this.#getActionElement() &&
      this.#actualActionElement.matches(":focus-visible");

    // Only remove the tooltip if the action element is not focused with
    // "focus-visible". If focused, "mouseleave" should not dismiss the tooltip
    if (!focusedWithFocusVisible) {
      this.visible = false;
    }
  };

  #addListenersToDisplayPopover = () => {
    this.#actualActionElement.addEventListener(
      "focus",
      this.#handleEnter,
      LISTENER_CONFIG
    );
    this.#actualActionElement.addEventListener(
      "mouseenter",
      this.#handleEnter,
      LISTENER_CONFIG
    );
  };

  #addListenersToHidePopover = () => {
    this.#actualActionElement.addEventListener(
      "focusout",
      this.#handleLeave,
      LISTENER_CONFIG
    );
    this.#actualActionElement.addEventListener(
      "mouseleave",
      this.#handleLeave,
      LISTENER_CONFIG
    );
  };

  #removeDisplayListeners = () => {
    this.#actualActionElement?.removeEventListener("focus", this.#handleEnter);
    this.#actualActionElement?.removeEventListener(
      "mouseenter",
      this.#handleEnter
    );
  };

  #removeHideListeners = () => {
    this.#actualActionElement?.removeEventListener(
      "focusout",
      this.#handleLeave
    );
    this.#actualActionElement?.removeEventListener(
      "mouseleave",
      this.#handleLeave
    );
  };

  #addAriaDescribedByToTheActionElement = () =>
    this.#actualActionElement?.setAttribute(ARIA_DESCRIBED_BY, this.#tooltipId);

  #addAriaLabelToTheActionElement = () => {
    if (this.actionElementAccessibleName) {
      this.#actualActionElement?.setAttribute(
        ARIA_LABEL,
        this.actionElementAccessibleName
      );
    }
  };

  #removeAriaDescribedByInActionElement = () =>
    this.#actualActionElement?.removeAttribute(ARIA_DESCRIBED_BY);

  #removeAriaLabelInActionElement = () =>
    this.#actualActionElement?.removeAttribute(ARIA_LABEL);

  #getActionElement = (): HTMLButtonElement => {
    if (this.actionElement === null) {
      return this.el.parentElement as HTMLButtonElement;
    }

    return this.actionElement ?? this.#innerActionRef;
  };

  #removeAllListeners = () => {
    this.#removeDisplayListeners();
    this.#removeHideListeners();
  };

  #actionIsInsideShadow = () => this.actionElement === undefined;

  connectedCallback() {
    this.#tooltipId ??= `ch-tooltip-${autoId++}`;
  }

  componentDidRender() {
    if (this.#addListenersForTheActionElement) {
      this.#addListenersForTheActionElement = false;
      this.#actualActionElement = this.#getActionElement();

      this.#addListenersToDisplayPopover();
      this.#addAriaDescribedByToTheActionElement();
      this.#addAriaLabelToTheActionElement();
    }
  }

  disconnectedCallback() {
    this.#removeAllListeners();
    this.#removeAriaDescribedByInActionElement();
    this.#removeAriaLabelInActionElement();
  }

  render() {
    const actionInsideShadow = this.#actionIsInsideShadow();

    return (
      <Host
        id={!actionInsideShadow ? this.#tooltipId : undefined}
        role={!actionInsideShadow ? TOOLTIP : undefined}
        aria-hidden={!actionInsideShadow && !this.visible ? "true" : undefined}
      >
        {actionInsideShadow && (
          <button
            part="action"
            type="button"
            ref={el => (this.#innerActionRef = el)}
          >
            <slot name="action"></slot>
          </button>
        )}

        {this.visible && (
          <ch-popover
            id={actionInsideShadow ? this.#tooltipId : undefined}
            role={actionInsideShadow ? TOOLTIP : undefined}
            style={{
              "--ch-tooltip-delay": `${this.delay}ms`
            }}
            part="window"
            // Don't use #actualActionElement. On the first render is not defined
            actionElement={this.#getActionElement()}
            blockAlign={this.blockAlign}
            closeOnClickOutside
            show
            inlineAlign={this.inlineAlign}
            mode="manual"
            // We need to sync the visible state when the popover is closed by an
            // user interaction (click outside)
            onPopoverClosed={this.#handleLeave}
          >
            <slot />
          </ch-popover>
        )}
      </Host>
    );
  }
}

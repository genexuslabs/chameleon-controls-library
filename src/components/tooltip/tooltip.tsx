import {
  Component,
  ComponentInterface,
  Element,
  Host,
  h,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { ChPopoverAlign } from "../popover/types";
import { focusComposedPath } from "../common/helpers";

const LISTENER_CONFIG = {
  passive: true
} as const satisfies AddEventListenerOptions;

const ARIA_DESCRIBED_BY = "aria-describedby";
const ARIA_LABEL = "aria-label";
const TOOLTIP = "tooltip";

let autoId = 0;

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
  actionElementChanged(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _,
    oldActionElement: HTMLButtonElement | undefined | null
  ) {
    this.#removeAllListeners();
    this.#addListenersForTheActionElement = true;

    // We have to remove the aria-describedby and aria-label first, because the
    // actionElement can transition from null to the actual parentElement,
    // which in the end is the "same action element"
    this.#removeAriaLabelInActionElement(oldActionElement);
    this.#removeAriaDescribedByInActionElement(oldActionElement);

    this.#addAriaDescribedByToTheActionElement();
    this.#addAriaLabelToTheActionElement();
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
    this.#getActionElement()?.setAttribute(ARIA_DESCRIBED_BY, this.#tooltipId);

  #addAriaLabelToTheActionElement = () => {
    if (this.actionElementAccessibleName) {
      this.#getActionElement()?.setAttribute(
        ARIA_LABEL,
        this.actionElementAccessibleName
      );
    }
  };

  #removeAriaDescribedByInActionElement = (actionElement?: HTMLButtonElement) =>
    this.#getActionElement(actionElement)?.removeAttribute(ARIA_DESCRIBED_BY);

  #removeAriaLabelInActionElement = (actionElement?: HTMLButtonElement) =>
    this.#getActionElement(actionElement)?.removeAttribute(ARIA_LABEL);

  #getActionElement = (
    actionElement?: HTMLButtonElement
  ): HTMLButtonElement => {
    const actualActionElement = actionElement ?? this.actionElement;

    if (actualActionElement === null) {
      return this.el.parentElement as HTMLButtonElement;
    }

    return actualActionElement ?? this.#innerActionRef;
  };

  #removeAllListeners = () => {
    this.#removeDisplayListeners();
    this.#removeHideListeners();
  };

  #actionIsInsideShadow = () => this.actionElement === undefined;

  connectedCallback() {
    this.#tooltipId ??= `ch-tooltip-${autoId++}`;
  }

  componentDidLoad() {
    this.#addAriaDescribedByToTheActionElement();
    this.#addAriaLabelToTheActionElement();
  }

  componentDidRender() {
    if (this.#addListenersForTheActionElement) {
      this.#addListenersForTheActionElement = false;
      this.#actualActionElement = this.#getActionElement();

      this.#addListenersToDisplayPopover();
    }
  }

  disconnectedCallback() {
    this.#removeAllListeners();
    this.#removeAriaDescribedByInActionElement();
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

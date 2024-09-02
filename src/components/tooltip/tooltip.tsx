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

const LISTENER_CONFIG = {
  passive: true
} as const satisfies AddEventListenerOptions;

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
  actionElementChanged() {
    this.#removeAllListeners();
    this.#addListenersForTheActionElement = true;
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
    this.visible = false;
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

  connectedCallback() {
    this.#tooltipId ??= `ch-tooltip-${autoId++}`;
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
  }

  render() {
    const actionInsideShadow = this.actionElement === undefined;

    return (
      <Host
        id={!actionInsideShadow ? this.#tooltipId : undefined}
        role={!actionInsideShadow ? "tooltip" : undefined}
      >
        {actionInsideShadow && (
          <button
            aria-describedby={this.#tooltipId}
            part="action"
            type="button"
            ref={el => (this.#innerActionRef = el)}
          >
            <slot name="action"></slot>
          </button>
        )}

        <ch-popover
          id={actionInsideShadow ? this.#tooltipId : undefined}
          role={actionInsideShadow ? "tooltip" : undefined}
          class={this.visible ? "visible" : undefined}
          style={{
            "--ch-tooltip-delay": `${this.delay}ms`
          }}
          part="window"
          // Don't use #actualActionElement. On the first render is not defined
          actionElement={this.#getActionElement()}
          blockAlign={this.blockAlign}
          closeOnClickOutside
          hidden={!this.visible}
          inlineAlign={this.inlineAlign}
          mode="manual"
        >
          <slot />
        </ch-popover>
      </Host>
    );
  }
}

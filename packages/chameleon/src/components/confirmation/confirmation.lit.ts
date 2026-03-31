import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import { CONFIRMATION_PARTS_DICTIONARY } from "./constants";
import type {
  ConfirmationApproval,
  ConfirmationApproveEvent,
  ConfirmationRejectEvent,
  ConfirmationState
} from "./types";
import { getContainerParts, getMessageType, shouldShowActions } from "./utils";

import styles from "./confirmation.scss?inline";

/**
 * The `ch-confirmation` component provides a flexible system for displaying tool approval requests
 * and their outcomes. Perfect for showing users when AI tools require approval before execution,
 * and displaying the approval status afterward.
 *
 * @remarks
 * ## Features
 *  - Context-based state management for approval workflow.
 *  - Conditional rendering based on approval state.
 *  - Support for approval-requested, approval-responded, output-denied, and output-available states.
 *  - Keyboard navigation and accessibility support.
 *  - Theme-aware with automatic dark mode support.
 *  - White-label design: minimal styling, fully customizable via CSS parts.
 *
 * ## Use when
 *  - You need to request user approval before executing a potentially dangerous action.
 *  - Displaying the outcome of an approval workflow (accepted/rejected).
 *  - Building AI tool execution flows that require explicit user confirmation.
 *
 * ## Do not use when
 *  - You need a generic alert or notification — prefer a dedicated alert component.
 *  - The action doesn't require user approval — use a standard button or action instead.
 *
 * ## Accessibility
 *  - `role="alert"` is set on the host for important, time-sensitive information.
 *  - `aria-live="polite"` announces state changes to assistive technologies.
 *  - Approve and Reject buttons have descriptive `aria-label` attributes.
 *  - Component resolves its accessible name from the `accessibleName` property or external labels.
 *
 * @status experimental
 *
 * @part container - The main container wrapper. Also receives state-specific parts (approval-requested, approval-responded, output-denied, output-available).
 * @part title - The title element of the confirmation alert (if provided).
 * @part message - The message content container.
 * @part actions - The container for approve/reject action buttons (only present when state is 'approval-requested').
 * @part button-approve - The approve button element.
 * @part button-reject - The reject button element.
 *
 * @part approval-requested - Present on the container when state is 'approval-requested'.
 * @part approval-responded - Present on the container when state is 'approval-responded'.
 * @part output-denied - Present on the container when state is 'output-denied'.
 * @part output-available - Present on the container when state is 'output-available'.
 */
@Component({
  styles,
  tag: "ch-confirmation"
})
export class ChConfirmation extends KasstorElement {
  /**
   * Specifies a short string that authors associate with an element
   * to provide users of assistive technologies with a label for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName:
    | string
    | undefined;

  /**
   * The approval object containing the approval request information.
   */
  @property({ attribute: false }) approval: ConfirmationApproval | undefined;

  /**
   * The current state of the confirmation workflow.
   *
   * - `approval-requested`: Shows the request message and approve/reject buttons.
   * - `approval-responded`: Shows the accepted message (user approved).
   * - `output-denied`: Shows the rejected message (user rejected).
   * - `output-available`: Shows the accepted message (output is available).
   */
  @property({ type: String }) state: ConfirmationState = "approval-requested";

  /**
   * Optional title for the confirmation alert.
   */
  @property({ type: String }) title: string | undefined;

  /**
   * Message to display when in 'approval-requested' state.
   */
  @property({ attribute: "request-message" }) requestMessage:
    | string
    | undefined;

  /**
   * Message to display when in 'approval-responded' or 'output-available' state.
   */
  @property({ attribute: "accepted-message" }) acceptedMessage:
    | string
    | undefined;

  /**
   * Message to display when in 'output-denied' state.
   */
  @property({ attribute: "rejected-message" }) rejectedMessage:
    | string
    | undefined;

  /**
   * Custom label for the approve button.
   * @default "Approve"
   */
  @property({ attribute: "approve-button-label" }) approveButtonLabel:
    | string
    | undefined;

  /**
   * Custom label for the reject button.
   * @default "Reject"
   */
  @property({ attribute: "reject-button-label" }) rejectButtonLabel:
    | string
    | undefined;

  /**
   * The `approve` event is emitted when the user clicks the Approve button.
   *
   * It contains the approval ID if available.
   */
  @Event() approve!: EventEmitter<ConfirmationApproveEvent>;

  /**
   * The `reject` event is emitted when the user clicks the Reject button.
   *
   * It contains the approval ID if available.
   */
  @Event() reject!: EventEmitter<ConfirmationRejectEvent>;

  #handleApprove = (event: MouseEvent) => {
    event.stopPropagation();

    this.approve.emit({
      approvalId: this.approval?.id
    });
  };

  #handleReject = (event: MouseEvent) => {
    event.stopPropagation();

    this.reject.emit({
      approvalId: this.approval?.id
    });
  };

  override connectedCallback() {
    super.connectedCallback();

    // Set ARIA attributes for accessibility
    this.setAttribute("role", "alert");
    this.setAttribute("aria-live", "polite");
  }

  override render() {
    const { state, title, accessibleName } = this;
    const containerParts = getContainerParts(state);
    const showActions = shouldShowActions(state);
    const messageType = getMessageType(state);

    const approveLabel = this.approveButtonLabel ?? "Approve";
    const rejectLabel = this.rejectButtonLabel ?? "Reject";

    // Generate unique ID for title if present (for aria-labelledby)
    const titleId = title ? `ch-confirmation-title-${Math.random().toString(36).substring(2, 9)}` : undefined;

    // Determine which message to display
    let messageContent: string | undefined;
    if (messageType === "request") {
      messageContent = this.requestMessage;
    } else if (messageType === "accepted") {
      messageContent = this.acceptedMessage;
    } else if (messageType === "rejected") {
      messageContent = this.rejectedMessage;
    }

    return html`<div
      class="container"
      part="${containerParts}"
      aria-label=${!title && accessibleName ? accessibleName : nothing}
      aria-labelledby=${title && titleId ? titleId : nothing}
    >
      ${title
        ? html`<div
            id="${titleId}"
            class="title"
            part="${CONFIRMATION_PARTS_DICTIONARY.TITLE}"
          >
            ${title}
          </div>`
        : nothing}
      ${messageContent
        ? html`<div
            class="message"
            part="${CONFIRMATION_PARTS_DICTIONARY.MESSAGE}"
          >
            ${messageContent}
          </div>`
        : nothing}
      ${showActions
        ? html`<div
            class="actions"
            part="${CONFIRMATION_PARTS_DICTIONARY.ACTIONS}"
          >
            <button
              class="button-reject"
              part="${CONFIRMATION_PARTS_DICTIONARY.BUTTON_REJECT}"
              aria-label="${rejectLabel}"
              @click=${this.#handleReject}
            >
              ${rejectLabel}
            </button>
            <button
              class="button-approve"
              part="${CONFIRMATION_PARTS_DICTIONARY.BUTTON_APPROVE}"
              aria-label="${approveLabel}"
              @click=${this.#handleApprove}
            >
              ${approveLabel}
            </button>
          </div>`
        : nothing}
    </div>`;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChConfirmationElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChConfirmationElement;
  }

  /** Type of the `ch-confirmation`'s `approve` event. */
  // prettier-ignore
  type HTMLChConfirmationElementApproveEvent = HTMLChConfirmationElementCustomEvent<
    HTMLChConfirmationElementEventMap["approve"]
  >;

  /** Type of the `ch-confirmation`'s `reject` event. */
  // prettier-ignore
  type HTMLChConfirmationElementRejectEvent = HTMLChConfirmationElementCustomEvent<
    HTMLChConfirmationElementEventMap["reject"]
  >;

  interface HTMLChConfirmationElementEventMap {
    approve: ConfirmationApproveEvent;
    reject: ConfirmationRejectEvent;
  }

  interface HTMLChConfirmationElementEventTypes {
    approve: HTMLChConfirmationElementApproveEvent;
    reject: HTMLChConfirmationElementRejectEvent;
  }

  /**
   * The `ch-confirmation` component provides a flexible system for displaying tool approval requests
   * and their outcomes. Perfect for showing users when AI tools require approval before execution,
   * and displaying the approval status afterward.
   *
   * @remarks
   * ## Features
   *  - Context-based state management for approval workflow.
   *  - Conditional rendering based on approval state.
   *  - Support for approval-requested, approval-responded, output-denied, and output-available states.
   *  - Keyboard navigation and accessibility support.
   *  - Theme-aware with automatic dark mode support.
   *  - White-label design: minimal styling, fully customizable via CSS parts.
   *
   * ## Use when
   *  - You need to request user approval before executing a potentially dangerous action.
   *  - Displaying the outcome of an approval workflow (accepted/rejected).
   *  - Building AI tool execution flows that require explicit user confirmation.
   *
   * ## Do not use when
   *  - You need a generic alert or notification — prefer a dedicated alert component.
   *  - The action doesn't require user approval — use a standard button or action instead.
   *
   * ## Accessibility
   *  - `role="alert"` is set on the host for important, time-sensitive information.
   *  - `aria-live="polite"` announces state changes to assistive technologies.
   *  - Approve and Reject buttons have descriptive `aria-label` attributes.
   *  - Component resolves its accessible name from the `accessibleName` property or external labels.
   *
   * @status experimental
   *
   * @part container - The main container wrapper. Also receives state-specific parts (approval-requested, approval-responded, output-denied, output-available).
   * @part title - The title element of the confirmation alert (if provided).
   * @part message - The message content container.
   * @part actions - The container for approve/reject action buttons (only present when state is 'approval-requested').
   * @part button-approve - The approve button element.
   * @part button-reject - The reject button element.
   *
   * @part approval-requested - Present on the container when state is 'approval-requested'.
   * @part approval-responded - Present on the container when state is 'approval-responded'.
   * @part output-denied - Present on the container when state is 'output-denied'.
   * @part output-available - Present on the container when state is 'output-available'.
   *
   * @fires approve The `approve` event is emitted when the user clicks the Approve button.
   *   
   *   It contains the approval ID if available.
   * @fires reject The `reject` event is emitted when the user clicks the Reject button.
   *   
   *   It contains the approval ID if available.
   */
  // prettier-ignore
  interface HTMLChConfirmationElement extends ChConfirmation {
    // Extend the ChConfirmation class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChConfirmationElementEventTypes>(type: K, listener: (this: HTMLChConfirmationElement, ev: HTMLChConfirmationElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChConfirmationElementEventTypes>(type: K, listener: (this: HTMLChConfirmationElement, ev: HTMLChConfirmationElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-confirmation": HTMLChConfirmationElement;
  }

  interface HTMLElementTagNameMap {
    "ch-confirmation": HTMLChConfirmationElement;
  }
}


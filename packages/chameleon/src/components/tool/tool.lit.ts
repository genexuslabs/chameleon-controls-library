import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { tokenMap } from "../../utilities/mapping/token-map.js";

import type { AccordionItemExpandedChangeEvent, AccordionItemModel } from "../accordion/types";
import { ACCORDION_EXPORT_PARTS } from "../../utilities/reserved-names/parts/accordion";
import {
  TOOL_PARTS_DICTIONARY,
  TOOL_STATE_BADGE_MAP,
  DEFAULT_APPROVAL_MESSAGE,
  DEFAULT_ACCEPTED_MESSAGE,
  DEFAULT_REJECTED_MESSAGE
} from "./constants";
import type {
  ToolState,
  ToolInput,
  ToolOutput,
  ToolApproveEvent,
  ToolRejectEvent,
  ToolExpandedChangeEvent
} from "./types";

import styles from "./tool.scss?inline";

// Lazy load required components
import("../accordion/accordion.lit");
import("../code/code.lit");
import("../confirmation/confirmation.lit");

const TOOL_ITEM_ID = "tool-item";

/**
 * The `ch-tool` component displays tool invocation details in a collapsible accordion,
 * showing the tool name, state badge, input parameters, approval controls, and output results.
 *
 * @remarks
 * ## Features
 *  - State-based visualization: Displays appropriate badges for different tool states (Pending, Running, Awaiting Approval, etc.)
 *  - Input/Output display: Shows formatted JSON for tool parameters and results using ch-code
 *  - Approval workflow: Integrates ch-confirmation for tools requiring user approval
 *  - Collapsible interface: Uses ch-accordion-render for expandable content
 *  - White-label design: Fully customizable via CSS parts and custom properties
 *
 * @status experimental
 *
 * @csspart container - The main container wrapping the entire component
 * @csspart header-badge - The badge element displaying the current state (Pending, Running, etc.)
 * @csspart tool-name - The tool name text element
 * @csspart parameters-section - The section containing input parameters
 * @csspart parameters-title - The title for the parameters section
 * @csspart result-section - The section containing output results
 * @csspart result-title - The title for the results section
 * @csspart error-section - The section containing error messages
 * @csspart error-title - The title for the error section
 * @csspart confirmation-wrapper - The wrapper around the ch-confirmation component
 * @csspart state-input-streaming - Present when state is 'input-streaming'
 * @csspart state-input-available - Present when state is 'input-available'
 * @csspart state-approval-requested - Present when state is 'approval-requested'
 * @csspart state-approval-responded - Present when state is 'approval-responded'
 * @csspart state-output-available - Present when state is 'output-available'
 * @csspart state-output-error - Present when state is 'output-error'
 * @csspart state-output-denied - Present when state is 'output-denied'
 */
@Component({
  styles,
  tag: "ch-tool"
})
export class ChTool extends KasstorElement {
  /**
   * The name of the tool being invoked.
   */
  @property({ type: String, attribute: "tool-name" }) toolName: string = "";

  /**
   * The type of the tool (optional metadata).
   */
  @property({ type: String }) type: string = "";

  /**
   * The current state of the tool invocation.
   */
  @property({ type: String }) state: ToolState = "input-available";
  @Observe("state")
  protected stateChanged() {
    this.#updateAccordionModel();
  }

  /**
   * Input parameters for the tool invocation.
   */
  @property({ type: Object, attribute: false }) input: ToolInput | null = null;

  /**
   * Output result from the tool execution.
   */
  @property({ type: Object, attribute: false }) output: ToolOutput | null = null;

  /**
   * Error message when the tool execution fails.
   */
  @property({ type: String, attribute: "error-text" }) errorText: string = "";

  /**
   * Controls whether the accordion is expanded by default.
   */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen: boolean = false;

  /**
   * Message shown when approval is requested.
   */
  @property({ type: String, attribute: "approval-message" })
  approvalMessage: string = DEFAULT_APPROVAL_MESSAGE;

  /**
   * Message shown when approval is accepted.
   */
  @property({ type: String, attribute: "accepted-message" })
  acceptedMessage: string = DEFAULT_ACCEPTED_MESSAGE;

  /**
   * Message shown when approval is rejected.
   */
  @property({ type: String, attribute: "rejected-message" })
  rejectedMessage: string = DEFAULT_REJECTED_MESSAGE;

  /**
   * Unique identifier for the tool call (used in approval events).
   */
  @property({ type: String, attribute: "tool-call-id" }) toolCallId: string = "";

  /**
   * Internal state for the accordion's expanded status.
   */
  @state() private expanded: boolean = false;

  /**
   * Fired when the user approves the tool execution. Payload includes toolCallId.
   */
  @Event() approve!: EventEmitter<ToolApproveEvent>;

  /**
   * Fired when the user rejects the tool execution. Payload includes toolCallId.
   */
  @Event() reject!: EventEmitter<ToolRejectEvent>;

  /**
   * Fired when the accordion expanded state changes.
   */
  @Event() expandedChange!: EventEmitter<ToolExpandedChangeEvent>;

  /**
   * Returns the badge HTML for the current state.
   */
  #getStatusBadge(): TemplateResult {
    const badge = TOOL_STATE_BADGE_MAP[this.state];
    
    return html`
      <span
        class="tool__badge tool__badge--${badge.stateClass}"
        part=${tokenMap({
          [TOOL_PARTS_DICTIONARY.HEADER_BADGE]: true,
          [`state-${this.state}`]: true
        })}
      >
        ${badge.label}
      </span>
    `;
  }

  /**
   * Returns the header template for the accordion.
   */
  #renderHeader(): TemplateResult {
    return html`
      <div class="tool__header">
        ${this.#getStatusBadge()}
        <span class="tool__name" part=${TOOL_PARTS_DICTIONARY.TOOL_NAME}>
          ${this.toolName || this.type || "Tool"}
        </span>
      </div>
    `;
  }

  /**
   * Renders the input parameters section.
   */
  #renderInput(): TemplateResult | null {
    if (!this.input) return null;

    const inputJson = typeof this.input === "string" 
      ? this.input 
      : JSON.stringify(this.input, null, 2);

    return html`
      <div class="tool__section" part=${TOOL_PARTS_DICTIONARY.PARAMETERS_SECTION}>
        <div class="tool__section-title" part=${TOOL_PARTS_DICTIONARY.PARAMETERS_TITLE}>
          Parameters
        </div>
        <ch-code .value=${inputJson} language="json"></ch-code>
      </div>
    `;
  }

  /**
   * Renders the approval confirmation section.
   */
  #renderApproval(): TemplateResult | null {
    // Only render confirmation for approval-requested state
    if (this.state !== "approval-requested") {
      return null;
    }

    return html`
      <div class="tool__section" part=${TOOL_PARTS_DICTIONARY.CONFIRMATION_WRAPPER}>
        <ch-confirmation
          .state=${"approval-requested"}
          .approval=${{ id: this.toolCallId }}
          .requestMessage=${this.approvalMessage}
          .acceptedMessage=${this.acceptedMessage}
          .rejectedMessage=${this.rejectedMessage}
          @approve=${this.#handleApprove}
          @reject=${this.#handleReject}
        ></ch-confirmation>
      </div>
    `;
  }

  /**
   * Renders the output result section.
   */
  #renderOutput(): TemplateResult | null {
    if (this.state !== "output-available" || !this.output) return null;

    const outputJson = typeof this.output === "string"
      ? this.output
      : JSON.stringify(this.output, null, 2);

    return html`
      <div class="tool__section" part=${TOOL_PARTS_DICTIONARY.RESULT_SECTION}>
        <div class="tool__section-title" part=${TOOL_PARTS_DICTIONARY.RESULT_TITLE}>
          Result
        </div>
        <ch-code .value=${outputJson} language="json"></ch-code>
      </div>
    `;
  }

  /**
   * Renders the error section.
   */
  #renderError(): TemplateResult | null {
    if ((this.state !== "output-error" && this.state !== "output-denied") || !this.errorText) return null;

    return html`
      <div class="tool__section tool__section--error" part=${TOOL_PARTS_DICTIONARY.ERROR_SECTION}>
        <div class="tool__section-title" part=${TOOL_PARTS_DICTIONARY.ERROR_TITLE}>
          Error
        </div>
        <div class="tool__error-text">${this.errorText}</div>
      </div>
    `;
  }

  /**
   * Renders the content area of the accordion.
   */
  #renderContent(): TemplateResult {
    return html`
      <div class="tool__content">
        ${this.#renderInput()}
        ${this.#renderApproval()}
        ${this.#renderOutput()}
        ${this.#renderError()}
      </div>
    `;
  }

  /**
   * Internal accordion model.
   */
  #accordionModel: AccordionItemModel[] = [];

  /**
   * Updates the accordion model.
   */
  #updateAccordionModel() {
    this.#accordionModel = [
      {
        id: TOOL_ITEM_ID,
        caption: "", // We use headerSlotId instead
        expanded: this.expanded,
        disabled: false,
        headerSlotId: `${TOOL_ITEM_ID}-header`
      }
    ];
  }

  /**
   * Handles the expandedChange event from the accordion.
   */
  #handleExpandedChange = (event: CustomEvent<AccordionItemExpandedChangeEvent>) => {
    const { expanded } = event.detail;
    this.expanded = expanded;
    this.expandedChange.emit({ expanded });
  };

  /**
   * Handles the approve event from ch-confirmation.
   */
  #handleApprove = () => {
    this.approve.emit({ toolCallId: this.toolCallId });
  };

  /**
   * Handles the reject event from ch-confirmation.
   */
  #handleReject = () => {
    this.reject.emit({ toolCallId: this.toolCallId });
  };

  override connectedCallback() {
    super.connectedCallback();
    // Set initial expanded state from defaultOpen
    this.expanded = this.defaultOpen;
    this.#updateAccordionModel();
  }

  render() {
    // Update the accordion model before rendering
    this.#updateAccordionModel();

    const statePartKey = `STATE_${this.state.toUpperCase().replace(/-/g, "_")}` as keyof typeof TOOL_PARTS_DICTIONARY;
    const statePart = TOOL_PARTS_DICTIONARY[statePartKey];

    return html`
      <div
        class="tool"
        part=${tokenMap({
          [TOOL_PARTS_DICTIONARY.CONTAINER]: true,
          [statePart]: true
        })}
      >
        <ch-accordion-render
          .model=${this.#accordionModel}
          @expandedChange=${this.#handleExpandedChange}
          exportparts=${ACCORDION_EXPORT_PARTS}
        >
          <div slot="${TOOL_ITEM_ID}-header">
            ${this.#renderHeader()}
          </div>
          <div slot=${TOOL_ITEM_ID}>
            ${this.#renderContent()}
          </div>
        </ch-accordion-render>
      </div>
    `;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChToolElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChToolElement;
  }

  /** Type of the `ch-tool`'s `approve` event. */
  // prettier-ignore
  type HTMLChToolElementApproveEvent = HTMLChToolElementCustomEvent<
    HTMLChToolElementEventMap["approve"]
  >;

  /** Type of the `ch-tool`'s `reject` event. */
  // prettier-ignore
  type HTMLChToolElementRejectEvent = HTMLChToolElementCustomEvent<
    HTMLChToolElementEventMap["reject"]
  >;

  /** Type of the `ch-tool`'s `expandedChange` event. */
  // prettier-ignore
  type HTMLChToolElementExpandedChangeEvent = HTMLChToolElementCustomEvent<
    HTMLChToolElementEventMap["expandedChange"]
  >;

  interface HTMLChToolElementEventMap {
    approve: ToolApproveEvent;
    reject: ToolRejectEvent;
    expandedChange: ToolExpandedChangeEvent;
  }

  interface HTMLChToolElementEventTypes {
    approve: HTMLChToolElementApproveEvent;
    reject: HTMLChToolElementRejectEvent;
    expandedChange: HTMLChToolElementExpandedChangeEvent;
  }

  /**
   * The `ch-tool` component displays tool invocation details in a collapsible accordion,
   * showing the tool name, state badge, input parameters, approval controls, and output results.
   *
   * @remarks
   * ## Features
   *  - State-based visualization: Displays appropriate badges for different tool states (Pending, Running, Awaiting Approval, etc.)
   *  - Input/Output display: Shows formatted JSON for tool parameters and results using ch-code
   *  - Approval workflow: Integrates ch-confirmation for tools requiring user approval
   *  - Collapsible interface: Uses ch-accordion-render for expandable content
   *  - White-label design: Fully customizable via CSS parts and custom properties
   *
   * @status experimental
   *
   * @csspart container - The main container wrapping the entire component
   * @csspart header-badge - The badge element displaying the current state (Pending, Running, etc.)
   * @csspart tool-name - The tool name text element
   * @csspart parameters-section - The section containing input parameters
   * @csspart parameters-title - The title for the parameters section
   * @csspart result-section - The section containing output results
   * @csspart result-title - The title for the results section
   * @csspart error-section - The section containing error messages
   * @csspart error-title - The title for the error section
   * @csspart confirmation-wrapper - The wrapper around the ch-confirmation component
   * @csspart state-input-streaming - Present when state is 'input-streaming'
   * @csspart state-input-available - Present when state is 'input-available'
   * @csspart state-approval-requested - Present when state is 'approval-requested'
   * @csspart state-approval-responded - Present when state is 'approval-responded'
   * @csspart state-output-available - Present when state is 'output-available'
   * @csspart state-output-error - Present when state is 'output-error'
   * @csspart state-output-denied - Present when state is 'output-denied'
   *
   * @fires approve Fired when the user approves the tool execution. Payload includes toolCallId.
   * @fires reject Fired when the user rejects the tool execution. Payload includes toolCallId.
   * @fires expandedChange Fired when the accordion expanded state changes.
   */
  // prettier-ignore
  interface HTMLChToolElement extends ChTool {
    // Extend the ChTool class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChToolElementEventTypes>(type: K, listener: (this: HTMLChToolElement, ev: HTMLChToolElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChToolElementEventTypes>(type: K, listener: (this: HTMLChToolElement, ev: HTMLChToolElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-tool": HTMLChToolElement;
  }

  interface HTMLElementTagNameMap {
    "ch-tool": HTMLChToolElement;
  }
}


import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";

import type { AccordionItemExpandedChangeEvent, AccordionModel } from "../accordion/types";
import type { PlanStepModel, PlanExpandedChangeEvent, PlanActionModel, PlanActionClickEvent } from "./types";

import styles from "./plan.scss?inline";

// Lazy load the accordion component
import("../accordion/accordion.lit");

/**
 * The `ch-plan` component displays AI-generated execution plans with streaming support and shimmer loading states.
 *
 * @remarks
 * ## Features
 *  - Collapsible plan content with smooth animations via ch-accordion.
 *  - Streaming support with shimmer loading placeholders.
 *  - Display steps with optional subtasks in a clean, semantic structure.
 *  - White-label design with CSS parts for full customization.
 *  - TypeScript support with comprehensive type definitions.
 *  - Context-based state management for streaming.
 *
 * @status experimental
 *
 * @csspart plan - The root container of the plan component.
 * @csspart header - The header section containing title and description.
 * @csspart title - The plan title element.
 * @csspart description - The plan description element.
 * @csspart content - The main content area containing steps.
 * @csspart step - A single step container.
 * @csspart step-title - The title of a step.
 * @csspart step-description - The description of a step.
 * @csspart substep - A subtask item within a step.
 * @csspart footer - The footer section containing action buttons.
 * @csspart actions - The container for action buttons.
 * @csspart action - An action button.
 * @csspart action-primary - A primary action button.
 * @csspart action-secondary - A secondary action button.
 * @csspart action-disabled - A disabled action button.
 * @csspart shimmer - Applied to shimmer loading placeholders.
 */
@Component({
  styles,
  tag: "ch-plan"
})
export class ChPlan extends KasstorElement {
  /**
   * Internal accordion model for managing the collapsible behavior
   */
  @state() protected accordionModel: AccordionModel = [];

  /**
   * The main title of the plan
   */
  @property() title: string = "";

  /**
   * Optional description providing context about the plan
   */
  @property() description?: string;

  /**
   * Array of steps that make up the plan
   */
  @property({ attribute: false }) steps: PlanStepModel[] = [];
  @Observe("steps")
  protected stepsChanged() {
    this.#updateAccordionModel();
  }

  /**
   * Optional array of action buttons to display in the plan footer
   */
  @property({ attribute: false }) actions?: PlanActionModel[];

  /**
   * Whether the plan content is currently being streamed
   */
  @property({ type: Boolean }) isStreaming: boolean = false;
  @Observe("isStreaming")
  protected isStreamingChanged() {
    // When streaming state changes, request update for smooth transitions
    this.requestUpdate();
  }

  /**
   * Whether the plan should be expanded by default
   */
  @property({ type: Boolean }) defaultOpen: boolean = false;
  @Observe("defaultOpen")
  protected defaultOpenChanged() {
    this.#updateAccordionModel();
  }

  /**
   * Fired when the plan's expanded state changes
   */
  @Event() expandedChange!: EventEmitter<PlanExpandedChangeEvent>;

  /**
   * Fired when an action button is clicked
   */
  @Event() actionClick!: EventEmitter<PlanActionClickEvent>;

  #updateAccordionModel() {
    this.accordionModel = [
      {
        id: "plan-content",
        expanded: this.defaultOpen
      }
    ];
  }

  #handleAccordionExpandedChange = (event: CustomEvent<AccordionItemExpandedChangeEvent>) => {
    const { expanded } = event.detail;
    this.expandedChange.emit({ expanded });
  };

  #handleActionClick = (action: PlanActionModel) => {
    if (!action.disabled) {
      this.actionClick.emit({
        actionId: action.id,
        action
      });
    }
  };

  #renderShimmer() {
    return html`
      <div class="shimmer-container" part="shimmer">
        <div class="shimmer-line shimmer-line--step" part="shimmer"></div>
        <div class="shimmer-line shimmer-line--step shimmer-line--short" part="shimmer"></div>
        <div class="shimmer-line shimmer-line--step shimmer-line--medium" part="shimmer"></div>
      </div>
    `;
  }

  #renderStep(step: PlanStepModel, index: number) {
    return html`
      <div class="step" part="step ${step.status ? `step-${step.status}` : ''}">
        <div class="step-header">
          <h3 class="step-title" part="step-title">
            ${index + 1}. ${step.title}
          </h3>
        </div>
        ${step.description
          ? html`<p class="step-description" part="step-description">${step.description}</p>`
          : nothing}
        ${step.subtasks && step.subtasks.length > 0
          ? html`
              <ul class="substeps">
                ${step.subtasks.map(
                  (subtask) => html`<li class="substep" part="substep">${subtask}</li>`
                )}
              </ul>
            `
          : nothing}
      </div>
    `;
  }

  #renderSteps() {
    if (this.isStreaming && this.steps.length === 0) {
      return this.#renderShimmer();
    }

    return html`
      <div class="steps-container">
        ${this.steps.map((step, index) => this.#renderStep(step, index))}
        ${this.isStreaming ? this.#renderShimmer() : nothing}
      </div>
    `;
  }

  #renderActions() {
    if (!this.actions || this.actions.length === 0) {
      return nothing;
    }

    return html`
      <div class="plan-footer" part="footer">
        <div class="plan-actions" part="actions">
          ${this.actions.map(
            (action) => html`
              <button
                class="plan-action ${action.primary ? 'plan-action--primary' : 'plan-action--secondary'}"
                part="action ${action.primary ? 'action-primary' : 'action-secondary'} ${action.disabled ? 'action-disabled' : ''}"
                ?disabled=${action.disabled}
                @click=${() => this.#handleActionClick(action)}
              >
                ${action.icon ? html`<span class="plan-action-icon">${action.icon}</span>` : nothing}
                <span class="plan-action-label">${action.label}</span>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#updateAccordionModel();
  }

  override render() {
    return html`
      <div class="plan" part="plan">
        <!-- Title and description always visible above accordion -->
        <div class="plan-header" part="header">
          ${this.title
            ? html`<h2 class="plan-title" part="title">${this.title}</h2>`
            : this.isStreaming
            ? html`<div class="shimmer-line shimmer-line--title" part="shimmer"></div>`
            : nothing}
          ${this.description
            ? html`<p class="plan-description" part="description">${this.description}</p>`
            : this.isStreaming
            ? html`<div class="shimmer-line shimmer-line--description" part="shimmer"></div>`
            : nothing}
        </div>
        
        <!-- Accordion for collapsible steps -->
        <ch-accordion-render
          .model=${this.accordionModel}
          @expandedChange=${this.#handleAccordionExpandedChange}
        >
          <div slot="plan-content" class="plan-content" part="content">
            ${this.#renderSteps()}
          </div>
        </ch-accordion-render>

        <!-- Footer with action buttons -->
        ${this.#renderActions()}
      </div>
    `;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChPlanElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChPlanElement;
  }

  /** Type of the `ch-plan`'s `expandedChange` event. */
  // prettier-ignore
  type HTMLChPlanElementExpandedChangeEvent = HTMLChPlanElementCustomEvent<
    HTMLChPlanElementEventMap["expandedChange"]
  >;

  /** Type of the `ch-plan`'s `actionClick` event. */
  // prettier-ignore
  type HTMLChPlanElementActionClickEvent = HTMLChPlanElementCustomEvent<
    HTMLChPlanElementEventMap["actionClick"]
  >;

  interface HTMLChPlanElementEventMap {
    expandedChange: PlanExpandedChangeEvent;
    actionClick: PlanActionClickEvent;
  }

  interface HTMLChPlanElementEventTypes {
    expandedChange: HTMLChPlanElementExpandedChangeEvent;
    actionClick: HTMLChPlanElementActionClickEvent;
  }

  /**
   * The `ch-plan` component displays AI-generated execution plans with streaming support and shimmer loading states.
   *
   * @remarks
   * ## Features
   *  - Collapsible plan content with smooth animations via ch-accordion.
   *  - Streaming support with shimmer loading placeholders.
   *  - Display steps with optional subtasks in a clean, semantic structure.
   *  - White-label design with CSS parts for full customization.
   *  - TypeScript support with comprehensive type definitions.
   *  - Context-based state management for streaming.
   *
   * @status experimental
   *
   * @csspart plan - The root container of the plan component.
   * @csspart header - The header section containing title and description.
   * @csspart title - The plan title element.
   * @csspart description - The plan description element.
   * @csspart content - The main content area containing steps.
   * @csspart step - A single step container.
   * @csspart step-title - The title of a step.
   * @csspart step-description - The description of a step.
   * @csspart substep - A subtask item within a step.
   * @csspart footer - The footer section containing action buttons.
   * @csspart actions - The container for action buttons.
   * @csspart action - An action button.
   * @csspart action-primary - A primary action button.
   * @csspart action-secondary - A secondary action button.
   * @csspart action-disabled - A disabled action button.
   * @csspart shimmer - Applied to shimmer loading placeholders.
   *
   * @fires expandedChange Fired when the plan's expanded state changes
   * @fires actionClick Fired when an action button is clicked
   */
  // prettier-ignore
  interface HTMLChPlanElement extends ChPlan {
    // Extend the ChPlan class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChPlanElementEventTypes>(type: K, listener: (this: HTMLChPlanElement, ev: HTMLChPlanElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChPlanElementEventTypes>(type: K, listener: (this: HTMLChPlanElement, ev: HTMLChPlanElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-plan": HTMLChPlanElement;
  }

  interface HTMLElementTagNameMap {
    "ch-plan": HTMLChPlanElement;
  }
}


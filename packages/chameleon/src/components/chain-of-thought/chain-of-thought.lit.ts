import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";

import type { AccordionItemExpandedChangeEvent, AccordionItemModel } from "../accordion/types";
import { ACCORDION_EXPORT_PARTS } from "../../utilities/reserved-names/parts/accordion";
import type {
  ChainOfThoughtOpenChangeEvent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage
} from "./types";

import styles from "./chain-of-thought.scss?inline";

// Lazy load the accordion component
import("../accordion/accordion.lit");

const CHAIN_OF_THOUGHT_ITEM_ID = "chain-of-thought-item";

/**
 * The `ch-chain-of-thought` component visualizes AI reasoning steps with support for
 * search results, images, and step-by-step progress indicators in a collapsible accordion.
 *
 * @remarks
 * ## Features
 *  - Collapsible interface with smooth animations
 *  - Step-by-step visualization of AI reasoning process with status indicators
 *  - Support for different step statuses (complete, active, pending)
 *  - Built-in search results display with badge-like styling
 *  - Image support with captions for visual content
 *  - Custom icons for different step types
 *  - White-label design: Minimal styles, fully customizable via CSS parts and custom properties
 *  - Built on ch-accordion-render: Leverages existing Chameleon accordion component
 *  - Single component design: All data passed via properties, no slots required from users
 *
 * ## Use when
 *  - Displaying AI chain-of-thought reasoning processes
 *  - Showing step-by-step thinking with search results and images
 *  - Visualizing AI decision-making workflows
 *  - Organizing collapsible AI-generated content with multiple steps
 *
 * ## Do not use when
 *  - Content is static and doesn't represent a reasoning process
 *  - You need multiple independent accordions (use `ch-accordion-render` directly)
 *  - Steps are not sequential or part of a logical reasoning chain
 *
 * @status experimental
 *
 * @csspart header - The clickable button element that toggles the collapsible section (inherited from ch-accordion-render)
 * @csspart panel - The outer container that wraps the header and the section (inherited from ch-accordion-render)
 * @csspart section - The collapsible section element that contains the chain of thought content (inherited from ch-accordion-render)
 * @csspart disabled - Present in the header, panel, and section parts when disabled (inherited from ch-accordion-render)
 * @csspart expanded - Present in the header, panel, and section parts when expanded (inherited from ch-accordion-render)
 * @csspart collapsed - Present in the header, panel, and section parts when collapsed (inherited from ch-accordion-render)
 * @csspart step - Individual step container in the chain of thought
 * @csspart step-icon - The icon container for each step
 * @csspart step-content - The content wrapper for step label and description
 * @csspart step-label - The label text of a step
 * @csspart step-description - The description text of a step
 * @csspart step-status - Status indicator part (also includes step-status--complete, step-status--active, step-status--pending)
 * @csspart search-results - Container for all search results
 * @csspart search-result - Individual search result item
 * @csspart image-container - Container for an image with caption
 * @csspart image - The image element itself
 * @csspart image-caption - Caption text below an image
 *
 * @cssprop [--ch-chain-of-thought-step-icon-size = 1.5rem] - Specifies the size of step icons
 * @cssprop [--ch-chain-of-thought-step-gap = 0.75rem] - Specifies the gap between steps
 * @cssprop [--ch-chain-of-thought-status-complete-color = #22c55e] - Specifies the color for complete status indicator
 * @cssprop [--ch-chain-of-thought-status-active-color = #3b82f6] - Specifies the color for active status indicator
 * @cssprop [--ch-chain-of-thought-status-pending-color = #94a3b8] - Specifies the color for pending status indicator
 * @cssprop [--ch-chain-of-thought-search-result-gap = 0.5rem] - Specifies the gap between search results
 * @cssprop [--ch-chain-of-thought-image-max-width = 100%] - Specifies the maximum width for images
 */
@Component({
  styles,
  tag: "ch-chain-of-thought"
})
export class ChChainOfThought extends KasstorElement {
  /**
   * Controls whether the accordion is expanded or collapsed.
   */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  @Observe("open")
  protected openChanged() {
    this.#updateAccordionModel();
  }

  /**
   * Specifies the default open state of the accordion on initial render.
   * This is only used on the first render and doesn't update afterward.
   */
  @property({ type: Boolean, attribute: "default-open" }) defaultOpen: boolean = false;

  /**
   * The caption/title text for the accordion header.
   * Defaults to "Chain of Thought".
   */
  @property({ type: String }) caption: string = "Chain of Thought";

  /**
   * Optional icon to display before the caption in the header.
   * Can be a data URI or URL string.
   */
  @property({ type: String, attribute: "header-icon" }) headerIcon?: string;
  @Observe("headerIcon")
  protected headerIconChanged() {
    this.#updateAccordionModel();
  }

  /**
   * Array of steps in the chain of thought reasoning process.
   * Each step has an id, label, optional description, optional icon, and a status.
   */
  @property({ attribute: false }) steps: ChainOfThoughtStep[] = [];
  @Observe("steps")
  protected stepsChanged() {
    this.requestUpdate();
  }

  /**
   * Array of search results to display in the chain of thought.
   * Each search result has an id, url, and optional label.
   */
  @property({ attribute: false }) searchResults: ChainOfThoughtSearchResult[] = [];
  @Observe("searchResults")
  protected searchResultsChanged() {
    this.requestUpdate();
  }

  /**
   * Array of images to display in the chain of thought.
   * Each image has an id, src, optional caption, and alt text.
   */
  @property({ attribute: false }) images: ChainOfThoughtImage[] = [];
  @Observe("images")
  protected imagesChanged() {
    this.requestUpdate();
  }

  /**
   * Internal state for the accordion model
   */
  @state() #accordionModel: AccordionItemModel[] = [];

  /**
   * Fired when the accordion is expanded or collapsed. The payload is { open: boolean }.
   */
  @Event() openChange!: EventEmitter<ChainOfThoughtOpenChangeEvent>;

  /**
   * Updates the accordion model for the internal ch-accordion-render
   */
  #updateAccordionModel() {
    // Create caption with icon if headerIcon is provided
    const captionContent = this.headerIcon
      ? html`<img src="${this.headerIcon}" alt="" style="width: 1rem; height: 1rem; margin-right: 0.375rem; display: inline-block; vertical-align: middle;" /><span style="display: inline-block; vertical-align: middle;">${this.caption}</span>`
      : this.caption;
    
    this.#accordionModel = [
      {
        id: CHAIN_OF_THOUGHT_ITEM_ID,
        caption: captionContent,
        expanded: this.open,
        disabled: false
      }
    ];
  }

  /**
   * Handles the expandedChange event from the internal accordion
   */
  #handleExpandedChange = (event: CustomEvent<AccordionItemExpandedChangeEvent>) => {
    const { expanded } = event.detail;
    this.open = expanded;
    this.openChange.emit({ open: expanded });
  };

  /**
   * Renders a single step in the chain of thought
   */
  #renderStep = (step: ChainOfThoughtStep) => {
    const statusClass = `step-status--${step.status}`;

    return html`
      <div
        class="step"
        part="step step-status step-status--${step.status}"
      >
        ${step.icon
          ? html`<div class="step-icon" part="step-icon">
              ${typeof step.icon === "string"
                ? step.icon.startsWith("data:") || step.icon.startsWith("http")
                  ? html`<img src=${step.icon} alt="" />`
                  : html`<span>${step.icon}</span>`
                : step.icon}
            </div>`
          : nothing}
        <div class="step-content" part="step-content">
          <div class="step-label" part="step-label">${step.label}</div>
          ${step.description
            ? html`<div class="step-description" part="step-description">
                ${step.description}
              </div>`
            : nothing}
          ${step.searchResults && step.searchResults.length > 0
            ? html`<div class="search-results" part="search-results">
                ${step.searchResults.map(
                  result => html`
                    <a
                      href=${result.url}
                      class="search-result"
                      part="search-result"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${result.label || result.url}
                    </a>
                  `
                )}
              </div>`
            : nothing}
          ${step.images && step.images.length > 0
            ? html`<div class="images-container">
                ${step.images.map(
                  image => html`
                    <figure class="image-container" part="image-container">
                      <img
                        src=${image.src}
                        alt=${image.alt}
                        class="image"
                        part="image"
                      />
                      ${image.caption
                        ? html`<figcaption class="image-caption" part="image-caption">
                            ${image.caption}
                          </figcaption>`
                        : nothing}
                    </figure>
                  `
                )}
              </div>`
            : nothing}
        </div>
      </div>
    `;
  };

  /**
   * Renders all steps
   */
  #renderSteps = () => {
    if (!this.steps || this.steps.length === 0) {
      return nothing;
    }

    return html`
      <div class="steps-container">
        ${this.steps.map(this.#renderStep)}
      </div>
    `;
  };

  /**
   * Renders search results section
   */
  #renderSearchResults = () => {
    if (!this.searchResults || this.searchResults.length === 0) {
      return nothing;
    }

    return html`
      <div class="search-results" part="search-results">
        ${this.searchResults.map(
          result => html`
            <a
              href=${result.url}
              class="search-result"
              part="search-result"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${result.label || result.url}
            </a>
          `
        )}
      </div>
    `;
  };

  /**
   * Renders images section
   */
  #renderImages = () => {
    if (!this.images || this.images.length === 0) {
      return nothing;
    }

    return html`
      <div class="images-container">
        ${this.images.map(
          image => html`
            <figure class="image-container" part="image-container">
              <img
                src=${image.src}
                alt=${image.alt}
                class="image"
                part="image"
              />
              ${image.caption
                ? html`<figcaption class="image-caption" part="image-caption">
                    ${image.caption}
                  </figcaption>`
                : nothing}
            </figure>
          `
        )}
      </div>
    `;
  };

  override connectedCallback() {
    super.connectedCallback();
    // Initialize open state from defaultOpen on first connection
    if (!this.hasAttribute("open")) {
      this.open = this.defaultOpen;
    }
  }

  render() {
    // Update the accordion model before rendering
    this.#updateAccordionModel();

    return html`
      <ch-accordion-render
        .model=${this.#accordionModel}
        @expandedChange=${this.#handleExpandedChange}
        exportparts=${ACCORDION_EXPORT_PARTS}
      >
        <div slot=${CHAIN_OF_THOUGHT_ITEM_ID} class="content">
          ${this.#renderSteps()}
          ${this.#renderSearchResults()}
          ${this.#renderImages()}
        </div>
      </ch-accordion-render>
    `;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChChainOfThoughtElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChChainOfThoughtElement;
  }

  /** Type of the `ch-chain-of-thought`'s `openChange` event. */
  // prettier-ignore
  type HTMLChChainOfThoughtElementOpenChangeEvent = HTMLChChainOfThoughtElementCustomEvent<
    HTMLChChainOfThoughtElementEventMap["openChange"]
  >;

  interface HTMLChChainOfThoughtElementEventMap {
    openChange: ChainOfThoughtOpenChangeEvent;
  }

  interface HTMLChChainOfThoughtElementEventTypes {
    openChange: HTMLChChainOfThoughtElementOpenChangeEvent;
  }

  /**
   * The `ch-chain-of-thought` component visualizes AI reasoning steps with support for
   * search results, images, and step-by-step progress indicators in a collapsible accordion.
   *
   * @remarks
   * ## Features
   *  - Collapsible interface with smooth animations
   *  - Step-by-step visualization of AI reasoning process with status indicators
   *  - Support for different step statuses (complete, active, pending)
   *  - Built-in search results display with badge-like styling
   *  - Image support with captions for visual content
   *  - Custom icons for different step types
   *  - White-label design: Minimal styles, fully customizable via CSS parts and custom properties
   *  - Built on ch-accordion-render: Leverages existing Chameleon accordion component
   *  - Single component design: All data passed via properties, no slots required from users
   *
   * ## Use when
   *  - Displaying AI chain-of-thought reasoning processes
   *  - Showing step-by-step thinking with search results and images
   *  - Visualizing AI decision-making workflows
   *  - Organizing collapsible AI-generated content with multiple steps
   *
   * ## Do not use when
   *  - Content is static and doesn't represent a reasoning process
   *  - You need multiple independent accordions (use `ch-accordion-render` directly)
   *  - Steps are not sequential or part of a logical reasoning chain
   *
   * @status experimental
   *
   * @csspart header - The clickable button element that toggles the collapsible section (inherited from ch-accordion-render)
   * @csspart panel - The outer container that wraps the header and the section (inherited from ch-accordion-render)
   * @csspart section - The collapsible section element that contains the chain of thought content (inherited from ch-accordion-render)
   * @csspart disabled - Present in the header, panel, and section parts when disabled (inherited from ch-accordion-render)
   * @csspart expanded - Present in the header, panel, and section parts when expanded (inherited from ch-accordion-render)
   * @csspart collapsed - Present in the header, panel, and section parts when collapsed (inherited from ch-accordion-render)
   * @csspart step - Individual step container in the chain of thought
   * @csspart step-icon - The icon container for each step
   * @csspart step-content - The content wrapper for step label and description
   * @csspart step-label - The label text of a step
   * @csspart step-description - The description text of a step
   * @csspart step-status - Status indicator part (also includes step-status--complete, step-status--active, step-status--pending)
   * @csspart search-results - Container for all search results
   * @csspart search-result - Individual search result item
   * @csspart image-container - Container for an image with caption
   * @csspart image - The image element itself
   * @csspart image-caption - Caption text below an image
   *
   * @cssprop [--ch-chain-of-thought-step-icon-size = 1.5rem] - Specifies the size of step icons
   * @cssprop [--ch-chain-of-thought-step-gap = 0.75rem] - Specifies the gap between steps
   * @cssprop [--ch-chain-of-thought-status-complete-color = #22c55e] - Specifies the color for complete status indicator
   * @cssprop [--ch-chain-of-thought-status-active-color = #3b82f6] - Specifies the color for active status indicator
   * @cssprop [--ch-chain-of-thought-status-pending-color = #94a3b8] - Specifies the color for pending status indicator
   * @cssprop [--ch-chain-of-thought-search-result-gap = 0.5rem] - Specifies the gap between search results
   * @cssprop [--ch-chain-of-thought-image-max-width = 100%] - Specifies the maximum width for images
   *
   * @fires openChange Fired when the accordion is expanded or collapsed. The payload is { open: boolean }.
   */
  // prettier-ignore
  interface HTMLChChainOfThoughtElement extends ChChainOfThought {
    // Extend the ChChainOfThought class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChChainOfThoughtElementEventTypes>(type: K, listener: (this: HTMLChChainOfThoughtElement, ev: HTMLChChainOfThoughtElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChChainOfThoughtElementEventTypes>(type: K, listener: (this: HTMLChChainOfThoughtElement, ev: HTMLChChainOfThoughtElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-chain-of-thought": HTMLChChainOfThoughtElement;
  }

  interface HTMLElementTagNameMap {
    "ch-chain-of-thought": HTMLChChainOfThoughtElement;
  }
}


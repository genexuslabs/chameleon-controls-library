import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";

import type { AccordionItemExpandedChangeEvent, AccordionItemModel } from "../accordion/types";
import { ACCORDION_EXPORT_PARTS } from "../../utilities/reserved-names/parts/accordion";
import {
  DEFAULT_STREAMING_SPEED_MS,
  DEFAULT_THINKING_MESSAGE,
  DEFAULT_THOUGHT_MESSAGE_TEMPLATE,
  DURATION_PLACEHOLDER
} from "./constants";
import type { ReasoningItemExpandedChangeEvent } from "./types";

import styles from "./reasoning.scss?inline";

// Lazy load the accordion component
import("../accordion/accordion.lit");

const REASONING_ITEM_ID = "reasoning-item";

/**
 * The `ch-reasoning` component displays AI reasoning content in a collapsible accordion,
 * automatically opening during streaming and closing when finished. It features a pulse
 * animation during the thinking state and a typewriter effect for streaming text content.
 *
 * @remarks
 * ## Features
 *  - Automatic streaming behavior: Opens automatically when `isStreaming` is true, closes when done
 *  - Pulse animation: Visual "thinking" indicator with customizable pulse animation
 *  - Typewriter effect: Text streams character-by-character for a natural feel
 *  - Customizable messages: Configure "Thinking..." and "Thought for X seconds" messages
 *  - White-label design: Minimal styles, fully customizable via CSS parts and custom properties
 *  - Built on ch-accordion-render: Leverages existing Chameleon accordion component
 *
 * ## Use when
 *  - Displaying AI reasoning steps or chain-of-thought processes
 *  - Showing streaming content that should be progressively revealed
 *  - Providing visual feedback during AI model processing
 *  - Organizing collapsible AI-generated content
 *
 * ## Do not use when
 *  - Content is static and doesn't require streaming effects
 *  - Multiple reasoning steps need to be shown simultaneously (use multiple instances instead)
 *  - You need a multi-item accordion (use `ch-accordion-render` directly)
 *
 * @status experimental
 *
 * @csspart header - The clickable button element that toggles the collapsible section (inherited from ch-accordion-render)
 * @csspart panel - The outer container that wraps the header and the section (inherited from ch-accordion-render)
 * @csspart section - The collapsible section element that contains the reasoning content (inherited from ch-accordion-render)
 * @csspart disabled - Present in the header, panel, and section parts when disabled (inherited from ch-accordion-render)
 * @csspart expanded - Present in the header, panel, and section parts when expanded (inherited from ch-accordion-render)
 * @csspart collapsed - Present in the header, panel, and section parts when collapsed (inherited from ch-accordion-render)
 *
 * @cssprop [--ch-reasoning-pulse-duration = 1.5s] - Specifies the duration of the pulse animation displayed during streaming/thinking state.
 * @cssprop [--ch-reasoning-pulse-opacity-min = 0.5] - Specifies the minimum opacity value for the pulse animation.
 * @cssprop [--ch-reasoning-pulse-opacity-max = 1] - Specifies the maximum opacity value for the pulse animation.
 */
@Component({
  styles,
  tag: "ch-reasoning"
})
export class ChReasoning extends KasstorElement {
  #streamingIntervalId: number | null = null;
  #currentCharIndex = 0;
  #dotsIntervalId: number | null = null;
  #dotsCount = 0;

  /**
   * The reasoning text content to display. When streaming, text will be revealed character-by-character.
   */
  @property({ type: String }) content: string = "";
  @Observe("content")
  protected contentChanged() {
    // Reset streaming when content changes
    this.#stopStreaming();
    this.#currentCharIndex = 0;
    this.displayedContent = "";

    if (this.isStreaming) {
      this.#startStreaming();
    } else {
      this.displayedContent = this.content;
    }
  }

  /**
   * Controls the streaming state. When true, shows pulse animation on trigger and enables typewriter effect.
   * Automatically opens the accordion.
   */
  @property({ type: Boolean, attribute: "is-streaming" }) isStreaming: boolean = false;
  @Observe("isStreaming")
  protected isStreamingChanged(newValue: boolean, oldValue: boolean) {
    if (this.isStreaming) {
      // Open accordion and start streaming
      this.open = true;
      this.#startStreaming();
      this.#startDotsAnimation();
    } else {
      // Stop streaming and show all content
      this.#stopStreaming();
      this.#stopDotsAnimation();
      this.displayedContent = this.content;
      // Update accordion model to show thoughtMessageTemplate
      this.#updateAccordionModel();
      // Close the accordion when streaming stops (but not on initial load)
      if (oldValue !== undefined) {
        this.open = false;
      }
    }
  }

  /**
   * Duration in seconds that the reasoning took. Used in the thought message template (e.g., "Thought for 4 seconds").
   */
  @property({ type: Number }) duration: number = 0;
  @Observe("duration")
  protected durationChanged() {
    // Update accordion model when duration changes
    this.#updateAccordionModel();
  }

  /**
   * Custom message displayed in the accordion trigger while isStreaming is true.
   */
  @property({ type: String, attribute: "thinking-message" })
  thinkingMessage: string = DEFAULT_THINKING_MESSAGE;

  /**
   * Custom template message displayed in the accordion trigger after streaming completes.
   * Use {duration} placeholder to insert the duration value.
   */
  @property({ type: String, attribute: "thought-message-template" })
  thoughtMessageTemplate: string = DEFAULT_THOUGHT_MESSAGE_TEMPLATE;
  @Observe("thoughtMessageTemplate")
  protected thoughtMessageTemplateChanged() {
    // Update accordion model when template changes
    this.#updateAccordionModel();
  }

  /**
   * Controls whether the accordion is expanded or collapsed. Can be used for manual control.
   */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  @Observe("open")
  protected openChanged() {
    // Update the accordion model when open changes
    this.#updateAccordionModel();
  }

  /**
   * Streaming speed in milliseconds per character for the typewriter effect.
   */
  @property({ type: Number, attribute: "streaming-speed-ms" })
  streamingSpeedMs: number = DEFAULT_STREAMING_SPEED_MS;

  /**
   * Internal state for the displayed content (used for typewriter effect)
   */
  @state() displayedContent: string = "";

  /**
   * Internal state for animated dots in thinking message
   */
  @state() animatedDots: string = "";

  /**
   * Internal state for the accordion model
   */
  @state() #accordionModel: AccordionItemModel[] = [];

  /**
   * Fired when the accordion is expanded or collapsed. The payload is { expanded: boolean }.
   */
  @Event() openChange!: EventEmitter<ReasoningItemExpandedChangeEvent>;

  /**
   * Starts the typewriter streaming effect
   */
  #startStreaming() {
    this.#stopStreaming(); // Clear any existing interval
    this.#currentCharIndex = 0;
    this.displayedContent = "";

    this.#streamingIntervalId = window.setInterval(() => {
      if (this.#currentCharIndex < this.content.length) {
        this.displayedContent += this.content[this.#currentCharIndex];
        this.#currentCharIndex++;
      } else {
        this.#stopStreaming();
        this.#stopDotsAnimation();
        // Calculate duration if not already set (based on content length and streaming speed)
        if (this.duration === 0) {
          const totalMs = this.content.length * this.streamingSpeedMs;
          this.duration = Math.round(totalMs / 100) / 10; // Convert to seconds, round to 1 decimal
        }
        // Mark streaming as complete
        this.isStreaming = false;
      }
    }, this.streamingSpeedMs);
  }

  /**
   * Stops the typewriter streaming effect
   */
  #stopStreaming() {
    if (this.#streamingIntervalId !== null) {
      clearInterval(this.#streamingIntervalId);
      this.#streamingIntervalId = null;
    }
  }

  /**
   * Starts the animated dots effect for thinking message
   */
  #startDotsAnimation() {
    this.#stopDotsAnimation(); // Clear any existing interval
    this.#dotsCount = 0;
    this.animatedDots = "";

    this.#dotsIntervalId = window.setInterval(() => {
      this.#dotsCount = (this.#dotsCount + 1) % 4; // Cycle through 0, 1, 2, 3
      this.animatedDots = ".".repeat(this.#dotsCount);
      // Force accordion model update to refresh the caption
      this.#updateAccordionModel();
    }, 500); // Update every 500ms
  }

  /**
   * Stops the animated dots effect
   */
  #stopDotsAnimation() {
    if (this.#dotsIntervalId !== null) {
      clearInterval(this.#dotsIntervalId);
      this.#dotsIntervalId = null;
    }
    this.animatedDots = "";
  }

  /**
   * Generates the caption for the accordion trigger based on current state
   */
  #getCaption(): string {
    if (this.isStreaming) {
      return this.thinkingMessage + this.animatedDots;
    }
    return this.thoughtMessageTemplate.replace(DURATION_PLACEHOLDER, String(this.duration));
  }

  /**
   * Updates the accordion model for the internal ch-accordion-render
   */

  #updateAccordionModel() {
    this.#accordionModel = [
      {
        id: REASONING_ITEM_ID,
        caption: this.#getCaption(),
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
    this.openChange.emit({ expanded });
  };

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#stopStreaming();
    this.#stopDotsAnimation();
  }

  render() {
    // Update the accordion model before rendering
    this.#updateAccordionModel();

    return html`
      <div class=${this.isStreaming ? "reasoning--streaming" : ""}>
        <ch-accordion-render
          .model=${this.#accordionModel}
          @expandedChange=${this.#handleExpandedChange}
          exportparts=${ACCORDION_EXPORT_PARTS}
        >
          <div slot=${REASONING_ITEM_ID}>
            ${this.displayedContent}
          </div>
        </ch-accordion-render>
      </div>
    `;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChReasoningElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChReasoningElement;
  }

  /** Type of the `ch-reasoning`'s `openChange` event. */
  // prettier-ignore
  type HTMLChReasoningElementOpenChangeEvent = HTMLChReasoningElementCustomEvent<
    HTMLChReasoningElementEventMap["openChange"]
  >;

  interface HTMLChReasoningElementEventMap {
    openChange: ReasoningItemExpandedChangeEvent;
  }

  interface HTMLChReasoningElementEventTypes {
    openChange: HTMLChReasoningElementOpenChangeEvent;
  }

  /**
   * The `ch-reasoning` component displays AI reasoning content in a collapsible accordion,
   * automatically opening during streaming and closing when finished. It features a pulse
   * animation during the thinking state and a typewriter effect for streaming text content.
   *
   * @remarks
   * ## Features
   *  - Automatic streaming behavior: Opens automatically when `isStreaming` is true, closes when done
   *  - Pulse animation: Visual "thinking" indicator with customizable pulse animation
   *  - Typewriter effect: Text streams character-by-character for a natural feel
   *  - Customizable messages: Configure "Thinking..." and "Thought for X seconds" messages
   *  - White-label design: Minimal styles, fully customizable via CSS parts and custom properties
   *  - Built on ch-accordion-render: Leverages existing Chameleon accordion component
   *
   * ## Use when
   *  - Displaying AI reasoning steps or chain-of-thought processes
   *  - Showing streaming content that should be progressively revealed
   *  - Providing visual feedback during AI model processing
   *  - Organizing collapsible AI-generated content
   *
   * ## Do not use when
   *  - Content is static and doesn't require streaming effects
   *  - Multiple reasoning steps need to be shown simultaneously (use multiple instances instead)
   *  - You need a multi-item accordion (use `ch-accordion-render` directly)
   *
   * @status experimental
   *
   * @csspart header - The clickable button element that toggles the collapsible section (inherited from ch-accordion-render)
   * @csspart panel - The outer container that wraps the header and the section (inherited from ch-accordion-render)
   * @csspart section - The collapsible section element that contains the reasoning content (inherited from ch-accordion-render)
   * @csspart disabled - Present in the header, panel, and section parts when disabled (inherited from ch-accordion-render)
   * @csspart expanded - Present in the header, panel, and section parts when expanded (inherited from ch-accordion-render)
   * @csspart collapsed - Present in the header, panel, and section parts when collapsed (inherited from ch-accordion-render)
   *
   * @cssprop [--ch-reasoning-pulse-duration = 1.5s] - Specifies the duration of the pulse animation displayed during streaming/thinking state.
   * @cssprop [--ch-reasoning-pulse-opacity-min = 0.5] - Specifies the minimum opacity value for the pulse animation.
   * @cssprop [--ch-reasoning-pulse-opacity-max = 1] - Specifies the maximum opacity value for the pulse animation.
   *
   * @fires openChange Fired when the accordion is expanded or collapsed. The payload is { expanded: boolean }.
   */
  // prettier-ignore
  interface HTMLChReasoningElement extends ChReasoning {
    // Extend the ChReasoning class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChReasoningElementEventTypes>(type: K, listener: (this: HTMLChReasoningElement, ev: HTMLChReasoningElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChReasoningElementEventTypes>(type: K, listener: (this: HTMLChReasoningElement, ev: HTMLChReasoningElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-reasoning": HTMLChReasoningElement;
  }

  interface HTMLElementTagNameMap {
    "ch-reasoning": HTMLChReasoningElement;
  }
}


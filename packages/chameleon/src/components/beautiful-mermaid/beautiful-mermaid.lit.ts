import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { property } from "lit/decorators/property.js";

import { renderMermaid } from "beautiful-mermaid";

import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import styles from "./beautiful-mermaid.scss?inline";

/**
 * @status developer-preview
 */
@Component({
  styles,
  tag: "ch-beautiful-mermaid"
})
export class ChBeautifulMermaid extends KasstorElement {
  #renderedSVG: string | undefined;

  /**
   * Specifies the Mermaid diagram definition to be rendered.
   */
  @property() value: string | undefined;
  @Observe("value")
  protected valueChanged() {
    const currentValue = this.value;

    if (currentValue === undefined) {
      this.#renderedSVG = undefined;
      return;
    }

    renderMermaid(currentValue)
      .then(renderedSVG => {
        if (this.value === currentValue) {
          this.#renderedSVG = renderedSVG;
          this.requestUpdate();
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  override render() {
    if (this.#renderedSVG === undefined) {
      return nothing;
    }

    return unsafeSVG(this.#renderedSVG);
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChBeautifulMermaidElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChBeautifulMermaidElement;
  }

  /**
   * @status developer-preview
   */ // prettier-ignore
  interface HTMLChBeautifulMermaidElement extends ChBeautifulMermaid {
    // Extend the ChBeautifulMermaid class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-beautiful-mermaid": HTMLChBeautifulMermaidElement;
  }

  interface HTMLElementTagNameMap {
    "ch-beautiful-mermaid": HTMLChBeautifulMermaidElement;
  }
}


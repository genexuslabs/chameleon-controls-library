import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators.js";

import type { ComponentRenderModel } from "../../typings/component-render";
import { renderItems } from "./renders";

// Side-effect to define the theme component
import "../../../theme/theme.lit";

import styles from "./component-render.scss?inline";

/**
 * @fires modelUpdate
 */
@Component({
  tag: "ch-component-render",
  styles
})
export class ChComponentRender extends KasstorElement {
  /**
   * Specifies the component render.
   */
  @property({ attribute: false }) model!: ComponentRenderModel;

  @Event() modelUpdate!: EventEmitter<void>;

  #queueReRender = () => {
    this.modelUpdate.emit();
    this.requestUpdate();
  };

  // #themeHasLoaded = () => {
  //   this.dispatchEvent(new CustomEvent("allThemesLoaded"));
  // };

  override render() {
    if (!this.model) {
      return "";
    }

    const { bundles, events, states, template, variables } = this.model;

    return html`${bundles
      ? html`<ch-theme .model=${bundles}></ch-theme>`
      : nothing}
    ${renderItems(events, states, template, variables, this.#queueReRender)}`;
  }
}

export default ChComponentRender;

declare global {
  interface HTMLElementTagNameMap {
    "ch-component-render": ChComponentRender;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChComponentRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChComponentRenderElement;
  }

  /** Type of the `ch-component-render`'s `modelUpdate` event. */
  // prettier-ignore
  type HTMLChComponentRenderElementModelUpdateEvent = HTMLChComponentRenderElementCustomEvent<
    HTMLChComponentRenderElementEventMap["modelUpdate"]
  >;

  interface HTMLChComponentRenderElementEventMap {
    modelUpdate: void;
  }

  interface HTMLChComponentRenderElementEventTypes {
    modelUpdate: HTMLChComponentRenderElementModelUpdateEvent;
  }

  /**
   * @fires modelUpdate
   *
   * @fires modelUpdate undefined
   */
  // prettier-ignore
  interface HTMLChComponentRenderElement extends ChComponentRender {
    // Extend the ChComponentRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChComponentRenderElementEventTypes>(type: K, listener: (this: HTMLChComponentRenderElement, ev: HTMLChComponentRenderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChComponentRenderElementEventTypes>(type: K, listener: (this: HTMLChComponentRenderElement, ev: HTMLChComponentRenderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-component-render": HTMLChComponentRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-component-render": HTMLChComponentRenderElement;
  }
}


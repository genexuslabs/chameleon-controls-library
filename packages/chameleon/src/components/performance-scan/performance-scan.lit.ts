import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import { IS_SERVER } from "../../development-flags";
import {
  patchLitRenders,
  PERFORMANCE_SCAN_RE_RENDER_EVENT_NAME
} from "../../utilities/analysis/performance";
import type { PerformanceScanRenderedItems } from "./types";

// Side-effect to define the performance scan item
import "./internals/performance-scan-item/performance-scan-item.lit";

import styles from "./performance-scan.scss?inline";

// On the server we don't check anything
const renderedItems: PerformanceScanRenderedItems = IS_SERVER
  ? new Map()
  : patchLitRenders();

/**
 * A component to visualize re-renders on Lit components.
 * @status experimental
 */
@Component({
  styles,
  tag: "ch-performance-scan"
})
export class ChPerformanceScan extends KasstorElement {
  /**
   * `true` to show the FPS
   */
  @property({ type: Boolean }) showFps: boolean = false;

  #updateRenderedItems = () => this.requestUpdate();

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener(
      PERFORMANCE_SCAN_RE_RENDER_EVENT_NAME,
      this.#updateRenderedItems
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(
      PERFORMANCE_SCAN_RE_RENDER_EVENT_NAME,
      this.#updateRenderedItems
    );
  }

  override render() {
    return html`${repeat(
      renderedItems.values(),
      item => item.id,
      item =>
        html`<ch-performance-scan-item
          .anchorRef=${item.model.anchorRef}
          .anchorTagName=${item.model.anchorTagName}
          .renderCount=${item.renderCount}
        ></ch-performance-scan-item>`
    )}`;
  }
}

export default ChPerformanceScan;

declare global {
  interface HTMLElementTagNameMap {
    "ch-performance-scan": ChPerformanceScan;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChPerformanceScanElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChPerformanceScanElement;
  }

  /**
   * A component to visualize re-renders on Lit components.
   * @status experimental
   */// prettier-ignore
  interface HTMLChPerformanceScanElement extends ChPerformanceScan {
    // Extend the ChPerformanceScan class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-performance-scan": HTMLChPerformanceScanElement;
  }

  interface HTMLElementTagNameMap {
    "ch-performance-scan": HTMLChPerformanceScanElement;
  }
}


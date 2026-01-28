import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import styles from "./performance-scan-item.scss?inline";

/**
 * @status experimental
 */
@Component({
  styles,
  tag: "ch-performance-scan-item"
})
export class ChPerformanceScanItem extends KasstorElement {
  /**
   * Specifies a reference for the scanned element.
   */
  @property({ attribute: false }) anchorRef!: LitElement;

  /**
   * Specifies the tagName of the scanned element.
   */
  @property({ attribute: false }) anchorTagName!: string;

  /**
   * Specifies how many times the scanned element has rendered in a buffer of
   * time.
   */
  @property({ attribute: false }) renderCount!: number;

  protected override willUpdate() {
    if (this.hasUpdated) {
      const animation = this.getAnimations()[0];

      animation?.cancel();
      animation?.play();
    }
  }

  override render() {
    const { left, top, width, height } = this.anchorRef.getBoundingClientRect();

    this.style.setProperty("--ch-performance-scan-item-top", `${top}px`);
    this.style.setProperty("--ch-performance-scan-item-left", `${left}px`);
    this.style.setProperty(
      "--ch-performance-scan-item-block-size",
      `${height}px`
    );
    this.style.setProperty(
      "--ch-performance-scan-item-inline-size",
      `${width}px`
    );

    return html`<span class=${top > 15 ? "outside" : nothing}
      >${this.anchorTagName} x ${this.renderCount}</span
    >`;
  }
}

export default ChPerformanceScanItem;

declare global {
  interface HTMLElementTagNameMap {
    "ch-performance-scan-item": ChPerformanceScanItem;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChPerformanceScanItemElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChPerformanceScanItemElement;
  }

  /**
   * @status experimental
   */// prettier-ignore
  interface HTMLChPerformanceScanItemElement extends ChPerformanceScanItem {
    // Extend the ChPerformanceScanItem class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-performance-scan-item": HTMLChPerformanceScanItemElement;
  }

  interface HTMLElementTagNameMap {
    "ch-performance-scan-item": HTMLChPerformanceScanItemElement;
  }
}


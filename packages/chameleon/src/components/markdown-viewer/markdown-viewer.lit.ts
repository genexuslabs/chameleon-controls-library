import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@Component({
  tag: "ch-markdown-viewer",
  shadow: false
})
export class ChMarkdownViewer extends KasstorElement {
  @property({ type: String }) value?: string;
  @property({ type: Boolean }) showIndicator?: boolean;
  @property({ attribute: false }) renderCode?: any;
  @property({ attribute: false }) theme?: any;

  override render() {
    if (!this.value) {
      return html``;
    }

    const htmlContent = this.value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');

    return html`
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          padding: 8px 0;
        }
        code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.9em;
        }
        strong {
          font-weight: 600;
        }
      </style>
      ${unsafeHTML(htmlContent)}
      ${this.showIndicator ? html`<span class="indicator">...</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-markdown-viewer": ChMarkdownViewer;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChMarkdownViewerElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChMarkdownViewerElement;
  }

  // prettier-ignore
  interface HTMLChMarkdownViewerElement extends ChMarkdownViewer {
    // Extend the ChMarkdownViewer class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-markdown-viewer": HTMLChMarkdownViewerElement;
  }

  interface HTMLElementTagNameMap {
    "ch-markdown-viewer": HTMLChMarkdownViewerElement;
  }
}


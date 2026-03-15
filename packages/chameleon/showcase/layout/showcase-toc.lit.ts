import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import styles from "./showcase-toc.scss?inline";

export type TocHeading = {
  element: HTMLElement;
  text: string;
  level: number;
};

/**
 * Custom event name dispatched by section components to report their headings.
 */
export const HEADINGS_CHANGED_EVENT = "headings-changed";

@Component({
  styles,
  tag: "showcase-toc"
})
export class ShowcaseToc extends KasstorElement {
  #headings: TocHeading[] = [];
  #observer: IntersectionObserver | undefined;
  #activeElement: HTMLElement | undefined;

  /**
   * Current pathname - when it changes, the TOC resets.
   */
  @property() pathname: string | undefined;

  override connectedCallback(): void {
    super.connectedCallback();

    // Listen for headings-changed events from section components
    this.ownerDocument.addEventListener(
      HEADINGS_CHANGED_EVENT,
      this.#handleHeadingsChanged as EventListener
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ownerDocument.removeEventListener(
      HEADINGS_CHANGED_EVENT,
      this.#handleHeadingsChanged as EventListener
    );
    this.#observer?.disconnect();
  }

  #handleHeadingsChanged = (event: CustomEvent<TocHeading[]>) => {
    this.#headings = event.detail;
    this.#setupIntersectionObserver();
    this.requestUpdate();
  };

  #setupIntersectionObserver() {
    this.#observer?.disconnect();

    if (this.#headings.length === 0) {
      return;
    }

    this.#observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.#activeElement = entry.target as HTMLElement;
            this.requestUpdate();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 0.1 }
    );

    for (const heading of this.#headings) {
      this.#observer.observe(heading.element);
    }
  }

  #handleTocClick(heading: TocHeading) {
    return (event: MouseEvent) => {
      event.preventDefault();
      heading.element.scrollIntoView({ behavior: "smooth" });
    };
  }

  override render() {
    if (this.#headings.length === 0) {
      return nothing;
    }

    return html`
      <nav class="toc" part="toc" aria-label="On this page">
        <h3 class="toc-title" part="toc-title">On this page</h3>
        <ul class="toc-list" part="toc-list">
          ${this.#headings.map(
            heading => html`
              <li
                class="toc-item ${heading.level === 3 ? "toc-item--nested" : ""} ${heading.element === this.#activeElement ? "toc-item--active" : ""}"
                part="toc-item"
              >
                <a
                  href="#"
                  class="toc-link"
                  part="toc-link"
                  @click=${this.#handleTocClick(heading)}
                  >${heading.text}</a
                >
              </li>
            `
          )}
        </ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-toc": ShowcaseToc;
  }
}

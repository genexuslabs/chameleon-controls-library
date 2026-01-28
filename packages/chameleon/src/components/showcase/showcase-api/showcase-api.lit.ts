import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import type { ShowcaseApiProperties } from "./types";

import styles from "./showcase-api.scss?inline";

@Component({
  tag: "ch-showcase-api",
  styles
})
export class ChShowcaseApi extends KasstorElement {
  /**
   * Specifies the properties of the API.
   */
  @property({ attribute: false }) properties: ShowcaseApiProperties | undefined;

  #renderProperties = () => {
    const propertyKeys = Object.keys(this.properties ?? {}).sort();

    if (propertyKeys.length === 0) {
      return nothing;
    }

    return html`<article
      aria-labelledby="properties"
      class="properties"
      part="properties"
    >
      <h2 id="properties" part="properties-title">
        <a href="#properties">Properties</a>
      </h2>

      <div class="properties-list" part="properties-list">
        ${repeat(
          propertyKeys,
          propertyKey => propertyKey,
          propertyKey => {
            const property = this.properties![propertyKey];

            return html`<article
              aria-labelledby="property--${propertyKey}"
              class="property-detail"
              part="property-detail"
            >
              <h3
                id="property--${propertyKey}"
                class="property-name"
                part="property-name"
              >
                <a href="#property--${propertyKey}" part="property-name-link"
                  ><code part="property-name-code">${propertyKey}</code></a
                >
              </h3>
              <dl
                aria-labelledby="prop-${propertyKey}"
                part="property-detail-list"
              >
                <dt part="property-detail-list-term">Description</dt>
                <dd
                  part="property-detail-list-description"
                  part="property-detail-list-description-description"
                >
                  ${property.description}
                </dd>

                <dt part="property-detail-list-term">Type</dt>
                <dd part="property-detail-list-description">
                  <code part="property-detail-list-description-type"
                    >${property.type}</code
                  >
                </dd>
              </dl>
            </article>`;
          }
        )}
      </div>
    </article>`;
  };

  override render() {
    return html`${this.#renderProperties()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-showcase-api": ChShowcaseApi;
  }
}

//  <ch-tree-view-render
// class="tree-view"
// .model=${this.#treeViewExplorerModel}
// .showLines=${"last"}
// @selectedItemsChange=${this.#updateSelectedElement}
// ></ch-tree-view-render>


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChShowcaseApiElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChShowcaseApiElement;
  }

  // prettier-ignore
  interface HTMLChShowcaseApiElement extends ChShowcaseApi {
    // Extend the ChShowcaseApi class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-showcase-api": HTMLChShowcaseApiElement;
  }

  interface HTMLElementTagNameMap {
    "ch-showcase-api": HTMLChShowcaseApiElement;
  }
}


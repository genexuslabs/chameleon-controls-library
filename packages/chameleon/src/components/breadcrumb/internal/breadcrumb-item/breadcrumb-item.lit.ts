import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { IS_SERVER } from "../../../../development-flags";
import type { ItemLink } from "../../../../typings/hyperlinks";

import styles from "./breadcrumb-item.scss?inline";

import { BREADCRUMB_NO_ATTRIBUTE } from "../../utils";

import type { BreadCrumbItemModel } from "../../types";

import { tokenMap } from "../../../../utilities/mapping/token-map";

import { DISABLED_CLASS } from "../../../../utilities/reserved-names/common";

import { BREADCRUMB_ITEM_PARTS_DICTIONARY } from "../../../../utilities/reserved-names/parts/breadcrumb";

import type { GxImageMultiState, ImageRender } from "../../../../typings/multi-state-images";

import type ChBreadCrumbRender from "../../breadcrumb-render.lit";

import { getControlRegisterProperty } from "../../../../utilities/register-properties/registry-properties";

// In the server we need to preload the ch-image just in case to properly
// render it, because Lit doesn't support async rendering in the server.
// In the client we can lazy load the ch-image, since not all ch-checkbox will
// use an icon
if (IS_SERVER) {
  await import("../../../image/image.lit");
}

let GET_IMAGE_PATH_CALLBACK_REGISTRY: ChBreadCrumbRender["getImagePathCallback"];

/**
 * @status experimental
 */
@Component({
  styles,
  tag: "ch-breadcrumb-item"
})
export class ChBreadCrumbItem extends KasstorElement {
  /**
   * Specifies the caption of the control
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) caption: string | undefined;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) disabled: boolean | undefined;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName: string | undefined;

  /**
   *
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) link: ItemLink | undefined;

  /**
   * Specifies the UI model of the control
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) model!: BreadCrumbItemModel;

  /**
   * Specifies if the hyperlink is selected. Only applies when the `link`
   * property is defined.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) selected?: boolean = false;

  /**
   * Specifies if the selected item indicator is displayed when the item is
   * selected. Only applies when the `link` property is defined.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) selectedLinkIndicator: boolean = false;

  /**
   * Specifies the src of the start image.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) startImgSrc: string | undefined;

  /**
   * Specifies how the start image will be rendered.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) startImgType: Exclude<ImageRender, "img"> | undefined;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) getImagePathCallback:
    | ((imageSrc: BreadCrumbItemModel) => GxImageMultiState | undefined)
    | undefined;

  #renderCaption = () => {
    return html`<span
      class="caption"
      part=${tokenMap({
        [BREADCRUMB_ITEM_PARTS_DICTIONARY.CAPTION]: true,

        [BREADCRUMB_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

        [BREADCRUMB_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
        [BREADCRUMB_ITEM_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected
      })}
      >${this.caption}</span
    >`;
  };

  #renderImage = () =>
    this.startImgSrc
      ? html`<ch-image
          .disabled=${this.disabled}
          .getImagePathCallback=${this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY}
          .src=${this.model}
          .type=${this.startImgType ?? nothing}
        ></ch-image>`
      : nothing;

  #initializeComponentFromProperties = () => {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??= getControlRegisterProperty(
      "getImagePathCallback",
      "ch-breadcrumb-render"
    );
  };

  override connectedCallback(): void {
    super.connectedCallback();

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.setAttribute("role", "listitem");

    this.#initializeComponentFromProperties();
  }

  // Lit doesn't properly read properties in the connectedCallback when the
  // component is SSRed
  override willUpdate(): void {
    if (this.wasServerSideRendered) {
      this.wasServerSideRendered = false;
      this.#initializeComponentFromProperties();
    }
  }

  override render() {
    // Classes
    const classes = {
      action: true,
      [DISABLED_CLASS]: !!this.disabled
    };

    return this.link
      ? html`
          <a
            role=${this.disabled ? "link" : nothing}
            aria-current=${this.selected ? "page" : nothing}
            aria-disabled=${this.disabled ? "true" : nothing}
            aria-label=${this.accessibleName || nothing}
            class=${tokenMap(classes)}
            part=${tokenMap({
              [BREADCRUMB_ITEM_PARTS_DICTIONARY.ACTION]: true,
              [BREADCRUMB_ITEM_PARTS_DICTIONARY.LINK]: true,

              [BREADCRUMB_ITEM_PARTS_DICTIONARY.SELECTED]: !!this.selected,
              [BREADCRUMB_ITEM_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected
            })}
            href=${!this.disabled ? (this.link.url ?? nothing) : nothing}
          >
            ${this.#renderImage()} ${this.#renderCaption()}
          </a>
        `
      : html`<button
          class=${tokenMap(classes)}
          part=${tokenMap({
            [BREADCRUMB_ITEM_PARTS_DICTIONARY.ACTION]: true,
            [BREADCRUMB_ITEM_PARTS_DICTIONARY.BUTTON]: true
          })}
          ?disabled=${this.disabled}
          type="button"
        >
          ${this.#renderImage()} ${this.#renderCaption()}
        </button> `;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChBreadCrumbItemElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChBreadCrumbItemElement;
  }

  /**
   * @status experimental
   */// prettier-ignore
  interface HTMLChBreadCrumbItemElement extends ChBreadCrumbItem {
    // Extend the ChBreadCrumbItem class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-breadcrumb-item": HTMLChBreadCrumbItemElement;
  }

  interface HTMLElementTagNameMap {
    "ch-breadcrumb-item": HTMLChBreadCrumbItemElement;
  }
}


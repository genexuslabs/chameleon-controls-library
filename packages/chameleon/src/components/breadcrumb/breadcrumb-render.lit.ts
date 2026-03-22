import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";
import type { ItemLink } from "../../typings/hyperlinks";

import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";

import { BREADCRUMB_NO_ATTRIBUTE } from "../breadcrumb/utils";
import styles from "./breadcrumb-render.scss?inline";
import type { BreadCrumbHyperlinkClickEvent, BreadCrumbItemModel, BreadCrumbModel } from "./types";

import type { ChameleonControlsTagName } from "../../typings/chameleon-components";
import type { GxImageMultiState } from "../../typings/multi-state-images";

import ChBreadCrumbItem from "./internal/breadcrumb-item/breadcrumb-item.lit";

import { DEFAULT_BREADCRUMB_GET_IMAGE_PATH_CALLBACK } from "../../utilities/constants/breadcrumb";

import {
  getControlRegisterProperty,
  registryControlProperty
} from "../../utilities/register-properties/registry-properties";

import { adoptCommonThemes } from "../../utilities/theme.js";

import { Observe } from "@genexus/kasstor-core/decorators/observe.js";

// TODO: FOR LIT USE A CONTEXT to share the getImagePathCallback implementation!

// TODO: For some reason, this module import is different when an external
// library imports the registryControlProperty function. We should de-dup this
// to fix issues related with double initialization of the registry
const registerDefaultGetImagePathCallback = () =>
  registryControlProperty(
    "getImagePathCallback",
    "ch-breadcrumb-render",
    DEFAULT_BREADCRUMB_GET_IMAGE_PATH_CALLBACK
  );

const isSelectedLink = (item: BreadCrumbItemModel, breadCrumbState: ChBreadCrumbRender) =>
  !!item.link &&
  !!breadCrumbState.selectedLink?.link?.url &&
  breadCrumbState.selectedLink.link.url === item.link.url &&
  breadCrumbState.selectedLink.id === item.id;

const BREADCRUMB_ITEM = "ch-breadcrumb-item" satisfies ChameleonControlsTagName;

/**
 * @status experimental
 *
 * This component needs to be hydrated to properly work. If not hydrated, the
 * component visibility will be hidden.
 */
@Component({
  styles,
  tag: "ch-breadcrumb-render"
})
export class ChBreadCrumbRender extends KasstorElement {
  constructor() {
    super();
    this.addEventListener("click", this.#handleItemClick);
  }

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) getImagePathCallback:
    | ((item: BreadCrumbItemModel) => GxImageMultiState | undefined)
    | undefined;

  /**
   * Specifies the current selected hyperlink.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) selectedLink?: {
    id?: string;
    link: ItemLink;
  } = {
    link: { url: undefined }
  };

  /**
   * Specifies if the selected item indicator is displayed (only work for hyperlink)
   */
  @property({ type: Boolean, attribute: "selected-link-indicator" })
  selectedLinkIndicator: boolean = false;

  /**
   * Specifies the items of the control.
   */
  @property(BREADCRUMB_NO_ATTRIBUTE) model: BreadCrumbModel | undefined;

  @property(BREADCRUMB_NO_ATTRIBUTE) separator: string | undefined = "/";

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName: string | undefined;
  @Observe("accessibleName")
  accessibleNameChanged() {
    if (this.accessibleName) {
      this.setAttribute("aria-label", this.accessibleName);
    } else {
      this.removeAttribute("aria-label");
    }
  }

  /**
   * Fired when an button is clicked.
   * This event can be prevented.
   */
  @Event() protected buttonClick!: EventEmitter<BreadCrumbItemModel>;

  /**
   * Fired when an hyperlink is clicked.
   * This event can be prevented.
   */
  @Event()
  protected hyperlinkClick!: EventEmitter<BreadCrumbHyperlinkClickEvent>;

  #handleItemClick = (event: MouseEvent) => {
    const composedPath = event.composedPath();

    const itemActionIndex = composedPath.findIndex(
      el =>
        (el as HTMLElement).tagName?.toLowerCase() === "button" ||
        (el as HTMLElement).tagName?.toLowerCase() === "a"
    );

    if (itemActionIndex === -1) {
      return;
    }

    const breadCrumbItem = composedPath[itemActionIndex + 2] as ChBreadCrumbItem;

    // Get the breadcrumb item of the event
    if (!breadCrumbItem || breadCrumbItem.tagName?.toLowerCase() !== BREADCRUMB_ITEM) {
      return;
    }
    const itemUIModel = breadCrumbItem.model;

    if (itemUIModel.link) {
      const eventInfo = this.hyperlinkClick.emit({ item: itemUIModel });

      if (eventInfo.defaultPrevented) {
        event.preventDefault();
        return;
      }

      // Update the selected link
      this.selectedLink = { id: itemUIModel.id, link: itemUIModel.link };
    } else {
      const eventInfo = this.buttonClick.emit(itemUIModel);

      if (eventInfo.defaultPrevented) {
        event.preventDefault();
      }
    }
  };

  #initializeComponentFromProperties = () => {
    // If the getImagePathCallback was not previously registered
    if (!getControlRegisterProperty("getImagePathCallback", "ch-breadcrumb-render")) {
      registerDefaultGetImagePathCallback();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();

    // TODO: Add a unit test for this
    // When used in Astro with ViewTransitions, the connectedCallback can be
    // executed without a shadowRoot attached, because the element is being
    // moved
    if (!this.shadowRoot) {
      return;
    }

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.setAttribute("role", "navigation");
    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);

    this.#initializeComponentFromProperties();
  }

  // Lit doesn't properly read properties in the connectedCallback when the
  // component is SSRed
  override willUpdate(): void {
    if (this.wasServerSideRendered) {
      this.#initializeComponentFromProperties();
    }
  }

  #renderModel = (model: BreadCrumbModel) => {
    return repeat(
      model ?? [],
      (item, index) => item.id ?? `${index}`,
      (item, index) => html`
        <ch-breadcrumb-item
          id=${item.id ?? nothing}
          .caption=${item.caption}
          .disabled=${item.disabled ?? nothing}
          .link=${item.link ?? nothing}
          .model=${item}
          .selected=${isSelectedLink(item, this)}
          .selectedLinkIndicator=${this.selectedLinkIndicator}
          .startImgSrc=${item.startImgSrc ?? nothing}
          .startImgType=${item.startImgType ?? nothing}
          .accessibleName=${item.accessibleName ?? nothing}
        >
        </ch-breadcrumb-item>

        ${!(index === model.length - 1)
          ? html`<span class="separator" aria-hidden="true">${this.separator}</span>`
          : nothing}
      `
    );
  };

  override render() {
    return this.model == null
      ? nothing
      : html`<ol>
          ${this.#renderModel(this.model)}
        </ol>`;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChBreadCrumbRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChBreadCrumbRenderElement;
  }

  /** Type of the `ch-breadcrumb-render`'s `buttonClick` event. */
  // prettier-ignore
  type HTMLChBreadCrumbRenderElementButtonClickEvent = HTMLChBreadCrumbRenderElementCustomEvent<
    HTMLChBreadCrumbRenderElementEventMap["buttonClick"]
  >;

  /** Type of the `ch-breadcrumb-render`'s `hyperlinkClick` event. */
  // prettier-ignore
  type HTMLChBreadCrumbRenderElementHyperlinkClickEvent = HTMLChBreadCrumbRenderElementCustomEvent<
    HTMLChBreadCrumbRenderElementEventMap["hyperlinkClick"]
  >;

  interface HTMLChBreadCrumbRenderElementEventMap {
    buttonClick: BreadCrumbItemModel;
    hyperlinkClick: BreadCrumbHyperlinkClickEvent;
  }

  interface HTMLChBreadCrumbRenderElementEventTypes {
    buttonClick: HTMLChBreadCrumbRenderElementButtonClickEvent;
    hyperlinkClick: HTMLChBreadCrumbRenderElementHyperlinkClickEvent;
  }

  /**
   * @status experimental
   *
   * This component needs to be hydrated to properly work. If not hydrated, the
   * component visibility will be hidden.
   *
   * @fires buttonClick Fired when an button is clicked.
   *   This event can be prevented.
   * @fires hyperlinkClick Fired when an hyperlink is clicked.
   *   This event can be prevented.
   */
  // prettier-ignore
  interface HTMLChBreadCrumbRenderElement extends ChBreadCrumbRender {
    // Extend the ChBreadCrumbRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChBreadCrumbRenderElementEventTypes>(type: K, listener: (this: HTMLChBreadCrumbRenderElement, ev: HTMLChBreadCrumbRenderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChBreadCrumbRenderElementEventTypes>(type: K, listener: (this: HTMLChBreadCrumbRenderElement, ev: HTMLChBreadCrumbRenderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-breadcrumb-render": HTMLChBreadCrumbRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-breadcrumb-render": HTMLChBreadCrumbRenderElement;
  }
}


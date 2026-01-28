import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { property } from "lit/decorators/property.js";

import { IS_SERVER } from "../../development-flags";
import type {
  GetImagePathCallback,
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../typings/multi-state-images";
import { DEFAULT_IMAGE_GET_IMAGE_PATH_CALLBACK } from "../../utilities/constants/image";
import { Host } from "../../utilities/host/host";
import { updateDirectionInImageCustomVar } from "../../utilities/multi-state-icons";
import { getControlRegisterProperty } from "../../utilities/register-properties/registry-properties";

import globalStyles from "./image-global.scss?inline";
import styles from "./image.scss?inline";

const DATA_IMAGE = "data-ch-image";

let GET_IMAGE_PATH_CALLBACK_REGISTRY!: (
  imageSrc: string | unknown | undefined
) => GxImageMultiState | undefined;

/**
 * A control to display multiple images, depending on the state (focus, hover,
 * active or disabled) of a parent element.
 */
@Component({
  tag: "ch-image",
  styles,
  globalStyles
})
export class ChImage extends KasstorElement {
  #currentContainerRef: HTMLElement | undefined | null;
  #image: GxImageMultiStateStart | undefined;

  // TODO: Should it be actionElement?
  /**
   * Specifies a reference for the container, in order to update the state of
   * the icon. The reference must be an ancestor of the control.
   * If not specified, the direct parent reference will be used.
   */
  @property({ attribute: false }) containerRef: HTMLElement | undefined;
  @Observe("containerRef")
  protected containerRefChanged(newContainer: HTMLElement | undefined) {
    // Remove previous data in the current parent
    this.#currentContainerRef?.removeAttribute(DATA_IMAGE);

    this.#currentContainerRef = newContainer ?? this.parentElement;

    // Add data in the new parent
    this.#currentContainerRef?.setAttribute(DATA_IMAGE, "");
  }

  /**
   * Specifies if the icon is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean | undefined =
    false;

  /**
   * This property specifies a callback that is executed when the path the
   * image needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback:
    | GetImagePathCallback
    | undefined;

  /**
   * Specifies the src for the image.
   */
  @property({ attribute: false }) src: string | unknown | undefined;
  @Observe("src")
  protected srcChanged(newSrc: string | unknown | undefined) {
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      this.#image = undefined;
      return;
    }
    const image = getImagePathCallback(newSrc);

    if (!image) {
      this.#image = undefined;
      return;
    }

    this.#image = newSrc
      ? (updateDirectionInImageCustomVar(
          image,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;

    // TODO: We should support contacting these styles.
    // TODO: Add unit tests for this
    if (IS_SERVER && this.#image) {
      this.styles =
        "--ch-start-img--base: " + this.#image.styles["--ch-start-img--base"];
    }
  }

  /**
   * Specifies an accessor for the attribute style of the ch-image. This
   * accessor is useful for SSR scenarios were the Host access is limited
   * (since Lit does not provide the Host declarative component).
   *
   * Without this accessor, the initial load in SSR scenarios would flicker.
   */
  @property({ attribute: "style", reflect: true }) styles: string | undefined;

  /**
   * Specifies how the image will be rendered.
   */
  @property({ attribute: "type", reflect: true }) type:
    | Exclude<ImageRender, "img">
    | undefined = "background";

  #initializeComponentFromProperties = () => {
    // Initialize default getImagePathCallback
    // TODO: Improve the reactivity of this
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty("getImagePathCallback", "ch-image") ??
      DEFAULT_IMAGE_GET_IMAGE_PATH_CALLBACK;

    this.#currentContainerRef = this.containerRef ?? this.parentElement;
    this.#currentContainerRef?.setAttribute(DATA_IMAGE, "");

    if (this.src) {
      this.srcChanged(this.src);
    }

    // Since undefined is a valid value, we need to default to the actual value
    // for reflecting the type attr for the CSS selector.
    // We admit undefined as a valid value, because is removes extra binding
    // logic in all "render" type components (ch-accordion-render,
    // ch-navigation-list-item, ch-tree-view-item, etc) as those components
    // usually don't have a imageType defined in their item's models
    this.type ??= "background";
  };

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute("aria-hidden", "true");

    if (!this.wasServerSideRendered) {
      this.#initializeComponentFromProperties();
    }
  }

  override willUpdate(): void {
    if (this.wasServerSideRendered) {
      this.wasServerSideRendered = false;
      this.#initializeComponentFromProperties();
    }
  }

  override disconnectedCallback() {
    this.#currentContainerRef?.removeAttribute(DATA_IMAGE);
    super.disconnectedCallback();
  }

  override render() {
    Host(this, {
      style: this.#image?.styles
    });
  }
}

export default ChImage;

declare global {
  interface HTMLElementTagNameMap {
    "ch-image": ChImage;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChImageElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChImageElement;
  }

  /**
   * A control to display multiple images, depending on the state (focus, hover,
   * active or disabled) of a parent element.
   */// prettier-ignore
  interface HTMLChImageElement extends ChImage {
    // Extend the ChImage class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-image": HTMLChImageElement;
  }

  interface HTMLElementTagNameMap {
    "ch-image": HTMLChImageElement;
  }
}


import { Component, Element, h, Host, Prop, Watch } from "@stencil/core";
import { getControlRegisterProperty } from "../../common/registry-properties";
import {
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";
import { updateDirectionInImageCustomVar } from "../../common/utils";

const DATA_IMAGE = "data-ch-image";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

/**
 * The `ch-image` component renders a multi-state image that automatically reflects the interactive state of its parent container.
 *
 * @remarks
 * ## Features
 *  - Visual appearance changes in response to parent state (hover, focus, active, disabled) via CSS custom properties (`--ch-start-img--base`, `--ch-start-img--hover`, etc.).
 *  - Image source resolved via a configurable callback (`getImagePathCallback`) or a globally registered resolver from the control registry.
 *  - Supports `"background"` (background-image) and `"mask"` (mask-image with `currentColor`) rendering modes.
 *  - Sets a `data-ch-image` attribute on its container element so parent-state CSS selectors can drive image state transitions.
 *  - Renders as a purely decorative element (`aria-hidden="true"`).
 *
 * ## Use when
 *  - Displaying icons inside buttons, menu items, or any interactive element where the image must reflect the element's current state.
 *  - An icon or image needs to visually respond to the interactive state of its parent (hover, focus, active, disabled).
 *  - You need a monochrome icon that inherits the parent's text color — use `type="mask"`.
 *
 * ## Do not use when
 *  - You need a standalone, non-interactive image display — use a native `<img>` element directly.
 *  - A static, non-state-reactive image is needed.
 *  - The image conveys meaningful content that requires alt text — this component is always `aria-hidden`.
 *
 * ## Accessibility
 *  - The host is marked `aria-hidden="true"` — this is a decorative element hidden from assistive technology.
 *  - Do not use this component for images that convey meaning; use a native `<img>` with `alt` text instead.
 *
 * @status experimental
 */
@Component({
  tag: "ch-image",
  styleUrl: "image.scss"
})
export class ChImage {
  #currentContainerRef!: HTMLElement;
  #image: GxImageMultiStateStart | undefined;

  @Element() el!: HTMLChImageElement;

  // TODO: Should it be actionElement?
  /**
   * Specifies a reference for the container, in order to update the state of
   * the icon. The reference must be an ancestor of the control.
   * If not specified, the direct parent element will be used.
   *
   * The component sets a `data-ch-image` attribute on the resolved container
   * so that CSS state selectors (`:hover`, `:active`, `:focus`) on the
   * container can drive the image state. When the container changes, the
   * attribute is removed from the previous container and added to the new one.
   *
   * Setting to `undefined` reverts to the direct parent.
   */
  @Prop() readonly containerRef: HTMLElement | undefined;
  @Watch("containerRef")
  containerRefChanged(newContainer: HTMLElement | undefined) {
    // Remove previous data in the current parent
    this.#currentContainerRef?.removeAttribute(DATA_IMAGE);

    this.#currentContainerRef = newContainer ?? this.el.parentElement;

    // Add data in the new parent
    this.#currentContainerRef?.setAttribute(DATA_IMAGE, "");
  }

  /**
   * Specifies if the icon is disabled. When `true`, the component uses the
   * `--ch-start-img--disabled` CSS custom property (falling back to
   * `--ch-start-img--base`) and hover/active/focus state changes are
   * suppressed via CSS.
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * Specifies a callback that resolves an image source string into a
   * `GxImageMultiState` object containing CSS custom property styles for
   * each interactive state. If not provided, the component falls back to a
   * globally registered resolver (registered via the control registry under
   * `"getImagePathCallback"`).
   *
   * If neither this callback nor the global registry provides a resolver,
   * the image will not render (internal `#image` is set to `null`).
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;

  /**
   * Specifies the source identifier for the image. This value is passed to
   * `getImagePathCallback` (or the global registry resolver) to obtain the
   * multi-state image definition. When set to `undefined`, the image is
   * cleared. When set to a non-empty string but the resolver returns
   * `undefined`, the internal image reference is set to `null` (nothing
   * renders).
   */
  @Prop() readonly src: string | undefined;
  @Watch("src")
  srcChanged(newSrc: string | undefined) {
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      this.#image = null;
      return;
    }
    const image = getImagePathCallback(newSrc);

    if (!image) {
      this.#image = null;
      return;
    }

    this.#image = newSrc
      ? (updateDirectionInImageCustomVar(
          image,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  }

  /**
   * Specifies how the image will be rendered.
   *  - `"background"`: renders the image as a CSS `background-image`.
   *  - `"mask"`: renders as a CSS `mask-image` with `background-color: currentColor`, which makes the image inherit the parent's text color (useful for monochrome icons).
   *
   * Defaults to `"background"`. This is an init-only property; changing it
   * after initial render may not correctly update the CSS class.
   */
  @Prop() readonly type: Exclude<ImageRender, "img"> = "background";

  connectedCallback() {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??= getControlRegisterProperty(
      "getImagePathCallback",
      "ch-image"
    );

    this.#currentContainerRef = this.containerRef ?? this.el.parentElement;
    this.#currentContainerRef?.setAttribute(DATA_IMAGE, "");

    if (this.src) {
      this.srcChanged(this.src);
    }
  }

  disconnectedCallback() {
    this.#currentContainerRef?.removeAttribute(DATA_IMAGE);
  }

  render() {
    return (
      <Host
        aria-hidden="true"
        class={{
          "ch-image--disabled": this.disabled,
          "ch-image--enabled": !this.disabled,
          [`ch-image--${this.type}`]: true
        }}
        style={this.#image?.styles ?? undefined}
      ></Host>
    );
  }
}

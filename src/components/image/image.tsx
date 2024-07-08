import { Component, Host, h, Prop, Element, Watch } from "@stencil/core";
import {
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";
import { updateDirectionInImageCustomVar } from "../../common/utils";

const DATA_IMAGE = "data-ch-image";

/**
 * A control to display multiple images, depending on the state (focus, hover,
 * active or disabled) of a parent element.
 */
@Component({
  tag: "ch-image",
  styleUrl: "image.scss"
})
export class ChImage {
  #currentContainerRef!: HTMLElement;
  #image: GxImageMultiStateStart | undefined;

  @Element() el!: HTMLChImageElement;

  /**
   * Specifies a reference for the container, in order to update the state of
   * the icon. The reference must be an ancestor of the control.
   * If not specified, the direct parent reference will be used.
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
   * Specifies if the icon is disabled.
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path the
   * image needs to be resolved.
   */
  @Prop() readonly getImagePathCallback!: (
    imageSrc: string
  ) => GxImageMultiState;

  /**
   * Specifies the src for the image.
   */
  @Prop() readonly src: string | undefined;
  @Watch("src")
  srcChanged(newSrc: string | undefined) {
    this.#image = newSrc
      ? (updateDirectionInImageCustomVar(
          this.getImagePathCallback(newSrc),
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  }

  /**
   * Specifies how the image will be rendered.
   */
  @Prop() readonly type: Exclude<ImageRender, "img"> = "background";

  connectedCallback() {
    this.#currentContainerRef = this.containerRef ?? this.el.parentElement;

    this.#currentContainerRef?.setAttribute(DATA_IMAGE, "");

    if (this.src) {
      this.#image = updateDirectionInImageCustomVar(
        this.getImagePathCallback(this.src),
        "start"
      ) as GxImageMultiStateStart;
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
        style={this.#image ?? undefined}
      ></Host>
    );
  }
}

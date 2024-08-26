import {
  Component,
  ComponentInterface,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";

import {
  GxImageMultiState,
  GxImageMultiStateStart
} from "../../../../common/types";
import { updateDirectionInImageCustomVar } from "../../../../common/utils";

/**
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "navigation-list-item.scss",
  tag: "ch-navigation-list-item"
})
export class ChNavigationListItem implements ComponentInterface {
  #startImage: GxImageMultiStateStart | undefined;

  /**
   * Specifies if the control contains sub items.
   */
  @Prop() readonly expandable: boolean = true;

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @Prop() readonly expanded: boolean = true;

  /**
   *
   */
  @Prop() readonly startImgSrc?: string | undefined;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#startImage = this.#computeImage();
  }

  #computeImage = (): GxImageMultiStateStart | undefined => {
    if (!this.startImgSrc) {
      return undefined;
    }

    if (!this.getImagePathCallback) {
      return undefined;
    }
    const img = this.getImagePathCallback(this.startImgSrc);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  };

  connectedCallback(): void {
    this.#startImage = this.#computeImage();
  }

  render() {
    return (
      <Host>
        <button type="button"></button>

        {this.expandable && (
          <div class="expandable">
            <slot />
          </div>
        )}
      </Host>
    );
  }
}

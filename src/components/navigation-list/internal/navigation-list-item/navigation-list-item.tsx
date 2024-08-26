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
  GxImageMultiStateStart,
  ItemLink
} from "../../../../common/types";
import { updateDirectionInImageCustomVar } from "../../../../common/utils";
import { NavigationListItem } from "../../types";

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
   * Specifies the caption of the control
   */
  @Prop() readonly caption!: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * Specifies if the control contains sub items.
   */
  @Prop() readonly expandable: boolean = true;

  /**
   * Specifies what kind of expandable button is displayed in the items by
   * default.
   *  - `"expandableButton"`: Expandable button that allows to expand/collapse
   *     the items of the control.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @Prop() readonly expandableButton: "action" | "decorative" | "no" =
    "decorative";

  /**
   * Specifies the position of the expandable button in reference of the action
   * element of the items
   *  - `"before"`: Expandable button is placed before the action element.
   *  - `"after"`: Expandable button is placed after the action element.
   */
  @Prop() readonly expandableButtonPosition: "before" | "after" = "before";

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @Prop() readonly expanded?: boolean;

  /**
   * Specifies at which level of the navigation list is rendered the control.
   */
  @Prop() readonly level!: number;

  /**
   *
   */
  @Prop() readonly link?: ItemLink | undefined;

  /**
   * Specifies the UI model of the control
   */
  @Prop() readonly model!: NavigationListItem;

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

  #renderContent = () =>
    this.link ? (
      <a
        key="hyperlink"
        role={this.disabled ? "link" : undefined}
        aria-disabled={this.disabled ? "true" : undefined}
        class="action"
        href={!this.disabled ? this.link.url : undefined}
      >
        {this.caption}
      </a>
    ) : (
      <button
        key="button"
        class="action"
        disabled={this.disabled}
        type="button"
      >
        {this.caption}
      </button>
    );

  connectedCallback(): void {
    this.#startImage = this.#computeImage();
  }

  render() {
    return (
      <Host
        class={{
          expandable: this.expandable,
          "expandable--expanded": this.expanded
        }}
      >
        {this.expandable && this.expandableButton !== "no" ? (
          <div
            class={{
              "ch-navigation-list-expandable-button-container": true,
              "expandable-button-container--decorative":
                this.expandableButton === "decorative"
            }}
          >
            {this.expandableButtonPosition === "after" && this.#renderContent()}

            {this.expandableButton === "action" && (
              <button
                key="expandable-button"
                type="button"
                class={{
                  "expandable-button": true,
                  "expandable-button--collapsed": !this.expanded
                }}
                // part={tokenMap({
                //   [TREE_VIEW_ITEM_PARTS_DICTIONARY.EXPANDABLE_BUTTON]: true,
                //   [TREE_VIEW_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
                //   [expandedPart]: true,
                //   [this.parts]: hasParts
                // })}
                disabled={this.disabled}
                // onClick={this.#toggleExpand}
              ></button>
            )}

            {this.expandableButtonPosition === "before" &&
              this.#renderContent()}
          </div>
        ) : (
          this.#renderContent()
        )}

        {this.expandable && (
          <div
            class={{
              expandable: true,
              "expandable--collapsed": !this.expanded
            }}
          >
            <slot />
          </div>
        )}
      </Host>
    );
  }
}

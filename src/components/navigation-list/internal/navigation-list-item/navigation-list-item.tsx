import {
  Component,
  ComponentInterface,
  Element,
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
import {
  tokenMap,
  updateDirectionInImageCustomVar
} from "../../../../common/utils";
import { NavigationListItem } from "../../types";
import { getNavigationListItemLevelPart } from "./utils";
import { NAVIGATION_LIST_ITEM_PARTS_DICTIONARY } from "../../../../common/reserved-names";
import { NAVIGATION_LIST_INITIAL_LEVEL } from "../../utils";

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

  @Element() el!: HTMLChNavigationListItemElement;

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
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @Prop() readonly expandableButton: "decorative" | "no" = "decorative";

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

  #renderContent = (evenLevelParts: "even-level" | "odd-level") => {
    const hasExpandableButton =
      this.expandable && this.expandableButton === "decorative";

    const expandableButtonPosition = this.expandableButtonPosition;

    return this.link ? (
      <a
        key="hyperlink"
        role={this.disabled ? "link" : undefined}
        aria-disabled={this.disabled ? "true" : undefined}
        class={{
          action: true,
          "hyperlink-disabled": this.disabled,
          "expandable-button": hasExpandableButton,
          "expandable-button--collapsed": hasExpandableButton && !this.expanded,
          "expandable-button--after":
            hasExpandableButton && expandableButtonPosition === "after"
        }}
        part={tokenMap({
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
            hasExpandableButton,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.BEFORE]:
            hasExpandableButton && expandableButtonPosition === "before",
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.AFTER]:
            hasExpandableButton && expandableButtonPosition === "after",

          [evenLevelParts]: true
        })}
        href={!this.disabled ? this.link.url : undefined}
      >
        <span class="caption" part="caption">
          {this.caption}
        </span>
      </a>
    ) : (
      <button
        key="button"
        class={{
          action: true,
          "expandable-button": hasExpandableButton,
          "expandable-button--collapsed": hasExpandableButton && !this.expanded,
          "expandable-button--after":
            hasExpandableButton && expandableButtonPosition === "after"
        }}
        part={tokenMap({
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
            hasExpandableButton,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.BEFORE]:
            hasExpandableButton && expandableButtonPosition === "before",
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.AFTER]:
            hasExpandableButton && expandableButtonPosition === "after",

          [evenLevelParts]: true
        })}
        disabled={this.disabled}
        type="button"
      >
        <span class="caption" part="caption">
          {this.caption}
        </span>
      </button>
    );
  };

  connectedCallback(): void {
    this.#startImage = this.#computeImage();

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.el.setAttribute("role", "listitem");
    this.el.style.setProperty("--level", `${this.level}`);
  }

  render() {
    const evenLevel = this.level % 2 === 0;
    const evenLevelParts = getNavigationListItemLevelPart(evenLevel);

    return (
      <Host
        class={{
          expandable: this.expandable,
          "expandable--expanded": this.expanded
        }}
      >
        {this.#renderContent(evenLevelParts)}

        {this.expandable && (
          <div
            class={{
              expandable: true,
              "expandable--collapsed": !this.expanded
            }}
            part={tokenMap({
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.GROUP]: true,
              [evenLevelParts]: this.level !== NAVIGATION_LIST_INITIAL_LEVEL
            })}
          >
            <slot />
          </div>
        )}
      </Host>
    );
  }
}

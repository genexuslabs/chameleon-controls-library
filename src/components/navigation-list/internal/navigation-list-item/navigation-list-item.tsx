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
  ImageRender,
  ItemLink
} from "../../../../common/types";
import {
  tokenMap,
  tokenMapExportParts,
  updateDirectionInImageCustomVar
} from "../../../../common/utils";
import { NavigationListItemModel } from "../../types";
import { getNavigationListItemLevelPart } from "./utils";
import {
  NAVIGATION_LIST_ITEM_EXPORT_PARTS,
  NAVIGATION_LIST_ITEM_PARTS_DICTIONARY
} from "../../../../common/reserved-names";
import { NAVIGATION_LIST_INITIAL_LEVEL } from "../../utils";
import { getControlRegisterProperty } from "../../../../common/registry-properties";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  item: NavigationListItemModel
) => GxImageMultiState | undefined;

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

  // Refs
  #actionRef: HTMLButtonElement | HTMLAnchorElement;

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
   *  - `"start"`: Expandable button is placed before the action element.
   *  - `"end"`: Expandable button is placed after the action element.
   */
  @Prop() readonly expandableButtonPosition: "start" | "end" = "start";

  /**
   * Specifies if the control is expanded or collapsed.
   */
  @Prop() readonly expanded?: boolean;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: NavigationListItemModel
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#startImage = this.#computeImage();
  }

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
  @Prop() readonly model!: NavigationListItemModel;

  /**
   * Specifies if the navigation-list parent is expanded or collapsed.
   */
  @Prop() readonly navigationListExpanded: boolean = true;

  /**
   * Specifies if the hyperlink is selected. Only applies when the `link`
   * property is defined.
   */
  @Prop() readonly selected?: boolean = false;

  /**
   * Specifies if the selected item indicator is displayed when the item is
   * selected. Only applies when the `link` property is defined.
   */
  @Prop() readonly selectedLinkIndicator: boolean = false;

  /**
   * Specifies how the caption will be displayed when the navigation-list
   * parent is collapsed
   */
  @Prop() readonly showCaptionOnCollapse?: "inline" | "tooltip" = "inline";

  /**
   * Specifies the src of the start image.
   */
  @Prop() readonly startImgSrc?: string | undefined;

  /**
   * Specifies how the start image will be rendered.
   */
  @Prop() readonly startImgType: Exclude<ImageRender, "img"> = "background";

  /**
   * Specifies the delay (in ms) for the tooltip to be displayed.
   */
  @Prop() readonly tooltipDelay?: number = 100;

  #computeImage = (): GxImageMultiStateStart | undefined => {
    if (!this.startImgSrc) {
      return undefined;
    }

    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      return undefined;
    }
    const img = getImagePathCallback(this.model);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  };

  #renderCaption = (
    navigationListCollapsed: boolean,
    levelPart: `level-${number}`
  ) => {
    return navigationListCollapsed &&
      this.showCaptionOnCollapse === "tooltip" ? (
      <ch-tooltip
        key="tooltip"
        // We can't use this.el because in not a focusable element. Non
        // focusable elements generate issue with the "mouseleave" and
        // "focusout" events
        actionElement={(this.#actionRef as HTMLButtonElement) ?? null}
        blockAlign="center"
        inlineAlign="outside-end"
        delay={this.tooltipDelay}
        exportparts={tokenMapExportParts(
          {
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.CAPTION]: true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
              true,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.TOOLTIP]: true,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
            [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
              !this.selected,

            [levelPart]: true
          },
          "window"
        )}
      >
        {this.caption}
      </ch-tooltip>
    ) : (
      <span
        key="caption"
        class="caption"
        part={tokenMap({
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.CAPTION]: true,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
            navigationListCollapsed,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected,

          [levelPart]: true
        })}
      >
        {this.caption}
      </span>
    );
  };

  #renderContent = (
    evenLevelParts: "even-level" | "odd-level",
    levelPart: `level-${number}`,
    hasExpandableButton: boolean,
    expandableButtonPosition: "start" | "end"
  ) => {
    const navigationListCollapsed = !this.navigationListExpanded;

    // Classes
    const startImageClasses = this.#startImage?.classes;
    const classes = {
      action: true,
      "action--navigation-list-collapsed": navigationListCollapsed,

      "ch-disabled": this.disabled,

      [`start-img-type--${
        this.startImgType ?? "background"
      } pseudo-img--start`]: !!this.#startImage,
      [startImageClasses]: !!startImageClasses,

      "expandable-button": hasExpandableButton,

      [`expandable-button--expanded-${this.expandableButtonPosition}`]:
        hasExpandableButton && this.expanded,
      [`expandable-button--collapsed-${this.expandableButtonPosition}`]:
        hasExpandableButton && !this.expanded,

      "expandable-button--end":
        hasExpandableButton && expandableButtonPosition === "end"
    };

    return this.link ? (
      <a
        key="hyperlink"
        role={this.disabled ? "link" : undefined}
        aria-current={this.selected ? "page" : undefined}
        aria-disabled={this.disabled ? "true" : undefined}
        class={classes}
        style={this.#startImage?.styles ?? undefined}
        part={tokenMap({
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.LINK]: true,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
            hasExpandableButton,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.START]:
            hasExpandableButton && expandableButtonPosition === "start",
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.END]:
            hasExpandableButton && expandableButtonPosition === "end",

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
            navigationListCollapsed,

          [evenLevelParts]: true,
          [levelPart]: true
        })}
        href={!this.disabled ? this.link.url : undefined}
        ref={el => (this.#actionRef = el)}
      >
        {this.#renderCaption(navigationListCollapsed, levelPart)}
      </a>
    ) : (
      <button
        key="button"
        class={classes}
        style={this.#startImage?.styles ?? undefined}
        part={tokenMap({
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.ACTION]: true,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.BUTTON]: true,

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
            hasExpandableButton,
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.START]:
            hasExpandableButton && expandableButtonPosition === "start",
          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.END]:
            hasExpandableButton && expandableButtonPosition === "end",

          [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NAVIGATION_LIST_COLLAPSED]:
            navigationListCollapsed,

          [evenLevelParts]: true,
          [levelPart]: true
        })}
        disabled={this.disabled}
        type="button"
        ref={el => (this.#actionRef = el)}
      >
        {this.#renderCaption(navigationListCollapsed, levelPart)}
      </button>
    );
  };

  connectedCallback(): void {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??= getControlRegisterProperty(
      "getImagePathCallback",
      "ch-navigation-list-render"
    );

    this.#startImage = this.#computeImage();

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.el.setAttribute("role", "listitem");
    this.el.setAttribute("exportparts", NAVIGATION_LIST_ITEM_EXPORT_PARTS);
    this.el.style.setProperty("--level", `${this.level}`);
  }

  render() {
    const levelPart = `level-${this.level}` as const;
    const evenLevel = this.level % 2 === 0;
    const evenLevelParts = getNavigationListItemLevelPart(evenLevel);

    const hasExpandableButton =
      this.expandable &&
      this.navigationListExpanded &&
      this.expandableButton === "decorative";

    const expandableButtonPosition = this.expandableButtonPosition;

    return (
      <Host
        class={{
          expandable: this.expandable,
          "expandable--expanded": this.expanded,
          selected: this.selected && this.selectedLinkIndicator
        }}
      >
        {this.#renderContent(
          evenLevelParts,
          levelPart,
          hasExpandableButton,
          expandableButtonPosition
        )}

        {this.selected && this.selectedLinkIndicator && (
          <div
            class="indicator"
            part={tokenMap({
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.INDICATOR]: true,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
            })}
          ></div>
        )}

        {this.expandable && (
          <div
            class={{
              expandable: true,
              "expandable--collapsed": !this.expanded
            }}
            part={tokenMap({
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.GROUP]: true,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.NOT_SELECTED]:
                !this.selected,

              [evenLevelParts]: this.level !== NAVIGATION_LIST_INITIAL_LEVEL,

              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.START]:
                hasExpandableButton && expandableButtonPosition === "start",
              [NAVIGATION_LIST_ITEM_PARTS_DICTIONARY.END]:
                hasExpandableButton && expandableButtonPosition === "end",

              [levelPart]: true
            })}
          >
            <slot />
          </div>
        )}
      </Host>
    );
  }
}

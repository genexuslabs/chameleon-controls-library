import {
  Component,
  ComponentInterface,
  Element,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";

import { ChPopoverAlign } from "../../../popover/types";
import {
  tokenMap,
  updateDirectionInImageCustomVar
} from "../../../../common/utils";
import type {
  GxImageMultiStateByDirection,
  GxImageMultiStateEnd,
  GxImageMultiStateStart,
  ImageRender
} from "../../../../common/types";
import {
  DISABLED_CLASS,
  DROPDOWN_ITEM_EXPORT_PARTS,
  DROPDOWN_ITEM_PARTS_DICTIONARY
} from "../../../../common/reserved-names";
import type {
  DropdownImagePathCallback,
  DropdownItemActionableModel
} from "../../types";
import { focusFirstDropdownItem } from "../utils";
import { getDropdownItemMetadata } from "../parse-model";
import { getControlRegisterProperty } from "../../../../common/registry-properties";

const SEPARATE_BY_SPACE_REGEX = /\s+/;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: DropdownImagePathCallback = (
  item,
  iconDirection
) => ({ base: iconDirection === "start" ? item.startImgSrc : item.endImgSrc });

// Parts
const ACTION_LINK =
  `${DROPDOWN_ITEM_PARTS_DICTIONARY.ACTION} ${DROPDOWN_ITEM_PARTS_DICTIONARY.LINK}` as const;

const ACTION_LINK_EXPANDABLE =
  `${ACTION_LINK} ${DROPDOWN_ITEM_PARTS_DICTIONARY.EXPANDABLE}` as const;

const ACTION_BUTTON =
  `${DROPDOWN_ITEM_PARTS_DICTIONARY.ACTION} ${DROPDOWN_ITEM_PARTS_DICTIONARY.BUTTON}` as const;

const ACTION_BUTTON_EXPANDABLE =
  `${ACTION_BUTTON} ${DROPDOWN_ITEM_PARTS_DICTIONARY.EXPANDABLE}` as const;

const WINDOW_ID = "window";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: DropdownImagePathCallback;

@Component({
  shadow: { delegatesFocus: true },
  styleUrl: "dropdown.scss",
  tag: "ch-dropdown"
})
export class ChDropdown implements ComponentInterface {
  #startImage: GxImageMultiStateStart | undefined;
  #endImage: GxImageMultiStateEnd | undefined;

  // Refs
  #mainAction: HTMLButtonElement | HTMLAnchorElement;

  @Element() el: HTMLChDropdownElement;

  /**
   * Specifies if the current parent of the item is the action-group control.
   */
  @Prop() readonly actionGroupParent: boolean = false;

  /**
   * Specifies the block alignment of the dropdown section that is placed
   * relative to the expandable button.
   */
  @Prop() readonly blockAlign: ChPopoverAlign = "center";

  /**
   * Specifies the caption that the control will display.
   */
  @Prop() readonly caption: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * Specifies the src of the end image.
   */
  @Prop() readonly endImgSrc?: string | undefined;
  @Watch("endImgSrc")
  endImgSrcChanged() {
    this.#endImage = this.#computeImage("end");
  }

  /**
   * Specifies how the end image will be rendered.
   */
  @Prop() readonly endImgType: ImageRender = "background";

  /**
   * Specifies whether the item contains a subtree. `true` if the item has a
   * subtree.
   */
  @Prop() readonly expandable: boolean = false;

  /**
   * `true` to display the dropdown section.
   */
  @Prop() readonly expanded: boolean | undefined = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc or endImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: DropdownImagePathCallback;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#startImage = this.#computeImage("start");
    this.#endImage = this.#computeImage("end");
  }

  /**
   * Specifies the hyperlink of the item. If this property is defined, the
   * control will render an anchor tag with this `href`. Otherwise, it will
   * render a button tag.
   */
  @Prop() readonly href: string | undefined;

  /**
   * Specifies the inline alignment of the dropdown section that is placed
   * relative to the expandable button.
   */
  @Prop() readonly inlineAlign: ChPopoverAlign = "center";

  /**
   * Specifies the extended model of the control. This property is only needed
   * to know the UI Model on each event
   */
  @Prop() readonly model!: DropdownItemActionableModel;

  /**
   * This attribute lets you specify if the control is nested in another
   * dropdown. Useful to manage keyboard interaction.
   */
  @Prop() readonly nestedDropdown: boolean = false;

  /**
   * Determine if the dropdown section should be opened when the expandable
   * button of the control is focused.
   * TODO: Add implementation
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @Prop() readonly parts?: string;
  @Watch("parts")
  partsChanged(newParts: string) {
    this.#setExportparts(newParts);
  }

  /**
   * Specifies the shortcut caption that the control will display.
   */
  @Prop() readonly shortcut: string | undefined;

  /**
   * Specifies the src for the left img.
   */
  @Prop() readonly startImgSrc?: string | undefined;
  @Watch("startImgSrc")
  startImgSrcChanged() {
    this.#startImage = this.#computeImage("start");
  }

  /**
   * Specifies how the start image will be rendered.
   */
  @Prop() readonly startImgType: ImageRender = "background";

  #computeImage = <T extends "start" | "end">(
    iconDirection: T
  ): GxImageMultiStateByDirection<T> | undefined => {
    if (
      (iconDirection === "start" && !this.startImgSrc) ||
      (iconDirection === "end" && !this.endImgSrc)
    ) {
      return undefined;
    }

    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      return undefined;
    }

    const img = getImagePathCallback(this.model, iconDirection);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          iconDirection
        ) as GxImageMultiStateByDirection<T>)
      : undefined;
  };

  #dropDownItemContent = () => [
    <span class="content" part={DROPDOWN_ITEM_PARTS_DICTIONARY.CONTENT}>
      {this.caption}
    </span>,

    !!this.shortcut && (
      <span aria-hidden="true" part={DROPDOWN_ITEM_PARTS_DICTIONARY.SHORTCUT}>
        {this.shortcut}
      </span>
    )
  ];

  #actionRender = () => {
    // Classes
    const startImageClasses = this.#startImage?.classes;
    const endImageClasses = this.#endImage?.classes;

    const classes = {
      action: true,
      [DISABLED_CLASS]: this.disabled,

      [`start-img-type--${
        this.startImgType ?? "background"
      } pseudo-img--start`]: !!this.#startImage,
      [startImageClasses]: !!startImageClasses,

      [`end-img-type--${this.endImgType ?? "background"} pseudo-img--end`]:
        !!this.#endImage,
      [endImageClasses]: !!endImageClasses
    };

    const expandable = this.expandable;

    return this.href ? (
      <a
        role={this.disabled ? "link" : undefined}
        aria-controls={expandable ? WINDOW_ID : null}
        aria-disabled={this.disabled ? "true" : undefined}
        aria-expanded={expandable ? (!!this.expanded).toString() : null}
        aria-haspopup={expandable ? "true" : null}
        class={classes}
        style={this.#endImage?.styles ?? undefined}
        part={tokenMap({
          [ACTION_LINK_EXPANDABLE]: expandable,
          [ACTION_LINK]: !expandable,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.EXPANDED]:
            expandable && this.expanded,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.COLLAPSED]:
            expandable && !this.expanded
        })}
        href={!this.disabled ? this.href : undefined}
        // TODO: Use a different ref due to a StencilJS bug when reassigning
        // the same variable with a different element's ref in runtime
        ref={el => (this.#mainAction = el)}
      >
        {this.#dropDownItemContent()}
      </a>
    ) : (
      <button
        popoverTarget={WINDOW_ID}
        aria-controls={expandable ? WINDOW_ID : null}
        aria-expanded={expandable ? (!!this.expanded).toString() : null}
        aria-haspopup={expandable ? "true" : null}
        class={classes}
        part={tokenMap({
          [ACTION_BUTTON_EXPANDABLE]: expandable,
          [ACTION_BUTTON]: !expandable,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.EXPANDED]:
            expandable && this.expanded,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.COLLAPSED]:
            expandable && !this.expanded
        })}
        style={this.#endImage?.styles ?? undefined}
        disabled={this.disabled}
        type="button"
        ref={el => (this.#mainAction = el)}
      >
        {this.#dropDownItemContent()}
      </button>
    );
  };

  #popoverRender = () => (
    <ch-popover
      role="list"
      id={WINDOW_ID}
      part={DROPDOWN_ITEM_PARTS_DICTIONARY.WINDOW}
      actionById
      actionElement={this.#mainAction as HTMLButtonElement}
      blockAlign={this.blockAlign}
      firstLayer={this.actionGroupParent}
      inlineAlign={this.inlineAlign}
      popover="manual"
      show
    >
      <slot />
    </ch-popover>
  );

  #setExportparts = (parts?: string) => {
    // TODO: Add tests for this.
    // TODO: Should be global the Regex?
    // TODO: Test this with multiple parts

    const customParts = parts
      ? `${DROPDOWN_ITEM_EXPORT_PARTS},${parts
          .split(SEPARATE_BY_SPACE_REGEX)
          .join(",")}`
      : DROPDOWN_ITEM_EXPORT_PARTS;

    this.el.setAttribute("exportparts", customParts);
  };

  connectedCallback() {
    this.el.setAttribute("role", "listitem");
    this.#setExportparts(this.parts);

    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty(
        "getImagePathCallback",
        "ch-dropdown-render"
      ) ?? DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#startImage = this.#computeImage("start");
    this.#endImage = this.#computeImage("end");
  }

  componentDidRender() {
    const metadata = getDropdownItemMetadata(this.model);

    if (this.expanded && metadata.focusFirstItemAfterExpand) {
      metadata.focusFirstItemAfterExpand = false;

      // Wait until the first item is rendered
      requestAnimationFrame(() => focusFirstDropdownItem(this.el));
    }

    if (!this.expanded && metadata.focusAfterCollapse) {
      metadata.focusAfterCollapse = false;
      this.el.focus();
    }
  }

  render() {
    return (
      <Host style={this.#startImage?.styles ?? undefined}>
        {this.#actionRender()}

        {this.expandable && this.expanded && this.#popoverRender()}
      </Host>
    );
  }
}

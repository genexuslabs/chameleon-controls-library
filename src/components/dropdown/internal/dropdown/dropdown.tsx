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
import { isPseudoElementImg, tokenMap } from "../../../../common/utils";
import { ImageRender } from "../../../../common/types";
import {
  DROPDOWN_ITEM_EXPORT_PARTS,
  DROPDOWN_ITEM_PARTS_DICTIONARY
} from "../../../../common/reserved-names";
import { DropdownItemModelExtended } from "../../types";

const SEPARATE_BY_SPACE_REGEX = /\s+/;

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

@Component({
  shadow: true,
  styleUrl: "dropdown.scss",
  tag: "ch-dropdown"
})
export class ChDropdown implements ComponentInterface {
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
  @Prop() readonly endImgSrc: string | undefined;

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

  // @Watch("expanded")
  // handleExpandedChange(newExpandedValue: boolean) {
  //   if (newExpandedValue) {
  //     // Click
  //     document.addEventListener("click", this.#closeOnClickOutside, {
  //       capture: true,
  //       passive: true
  //     });
  //   } else {
  //     // Click
  //     document.removeEventListener("click", this.#closeOnClickOutside, {
  //       capture: true
  //     });

  //     // This is a WA to avoid a StencilJS's (or browser) issue when reusing
  //     // the top layer and interacting with the Tab key in the same top layer.
  //     // After the second opening, the Tab key stops working
  //     (this.#mainAction as HTMLButtonElement).popoverTargetElement = null;
  //   }
  // }

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
  @Prop() readonly model!: DropdownItemModelExtended;

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
  @Prop() readonly startImgSrc: string | undefined;

  /**
   * Specifies how the start image will be rendered.
   */
  @Prop() readonly startImgType: ImageRender = "background";

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
    const pseudoStartImage = isPseudoElementImg(
      this.startImgSrc,
      this.startImgType
    );
    const pseudoEndImage = isPseudoElementImg(this.endImgSrc, this.endImgType);
    const expandable = this.expandable;

    return this.href ? (
      <a
        role={this.disabled ? "link" : undefined}
        aria-controls={expandable ? WINDOW_ID : null}
        aria-disabled={this.disabled ? "true" : undefined}
        aria-expanded={expandable ? (!!this.expanded).toString() : null}
        aria-haspopup={expandable ? "true" : null}
        class={{
          action: true,

          [`start-img-type--${this.startImgType} pseudo-img--start`]:
            pseudoStartImage,
          [`end-img-type--${this.endImgType} pseudo-img--end`]: pseudoEndImage
        }}
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
        class={{
          action: true,

          [`start-img-type--${this.startImgType} pseudo-img--start`]:
            pseudoStartImage,
          [`end-img-type--${this.endImgType} pseudo-img--end`]: pseudoEndImage
        }}
        part={tokenMap({
          [ACTION_BUTTON_EXPANDABLE]: expandable,
          [ACTION_BUTTON]: !expandable,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.EXPANDED]:
            expandable && this.expanded,
          [DROPDOWN_ITEM_PARTS_DICTIONARY.COLLAPSED]:
            expandable && !this.expanded
        })}
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
  }

  render() {
    return (
      <Host
        style={
          !!this.startImgSrc || !!this.endImgSrc
            ? {
                "--ch-dropdown-item-start-img": `url("${this.startImgSrc}")`,
                "--ch-dropdown-item-end-img": `url("${this.endImgSrc}")`
              }
            : undefined
        }
      >
        {this.#actionRender()}

        {this.expandable && this.expanded && this.#popoverRender()}
      </Host>
    );
  }
}

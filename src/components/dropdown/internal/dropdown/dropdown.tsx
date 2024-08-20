import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";

import { DropdownAlign, DropdownPosition } from "./types";
import { ChPopoverAlign } from "../../../popover/types";
import { isPseudoElementImg } from "../../../../common/utils";
import { ImageRender } from "../../../../common/types";
import {
  DROPDOWN_EXPORT_PARTS,
  DROPDOWN_PARTS_DICTIONARY
} from "../../../../common/reserved-names";
import { DropdownItemModelExtended } from "../../types";

const SEPARATE_BY_SPACE_REGEX = /\s*/;

const mapDropdownAlignToChWindowAlign: {
  [key in DropdownAlign]: ChPopoverAlign;
} = {
  OutsideStart: "outside-start",
  InsideStart: "inside-start",
  Center: "center",
  InsideEnd: "inside-end",
  OutsideEnd: "outside-end"
};

// Parts
const ACTION_LINK =
  `${DROPDOWN_PARTS_DICTIONARY.ACTION} ${DROPDOWN_PARTS_DICTIONARY.LINK}` as const;

const ACTION_LINK_EXPANDABLE =
  `${ACTION_LINK} ${DROPDOWN_PARTS_DICTIONARY.EXPANDABLE}` as const;

const ACTION_BUTTON =
  `${DROPDOWN_PARTS_DICTIONARY.ACTION} ${DROPDOWN_PARTS_DICTIONARY.BUTTON}` as const;

const ACTION_BUTTON_EXPANDABLE =
  `${ACTION_BUTTON} ${DROPDOWN_PARTS_DICTIONARY.EXPANDABLE}` as const;

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
   * This attribute lets you specify the label for the expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonAccessibleName: string;

  /**
   * Specifies the caption that the control will display.
   */
  @Prop() readonly caption: string;

  /**
   * Specifies the src of the end image.
   */
  @Prop() readonly endImgSrc: string;

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
  @Prop() readonly expanded: boolean = false;

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
  @Prop() readonly href: string;

  /**
   * This callback is executed when an item is clicked.
   */
  @Prop() readonly itemClickCallback: (event: UIEvent) => void;

  /**
   * Specifies if the control is at the first level, where the actions are
   * always visible.
   */
  @Prop() readonly firstLevel: boolean = false;

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
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * Specifies the shortcut caption that the control will display.
   */
  @Prop() readonly shortcut: string;

  /**
   * Specifies the src for the left img.
   */
  @Prop() readonly startImgSrc: string;

  /**
   * Specifies how the start image will be rendered.
   */
  @Prop() readonly startImgType: ImageRender = "background";

  /**
   * Fired when the visibility of the dropdown section is changed by user
   * interaction.
   */
  @Event({ composed: true }) expandedChange: EventEmitter<boolean>;

  #dropDownItemContent = () => [
    <span
      slot="action"
      class="content"
      part={DROPDOWN_PARTS_DICTIONARY.CONTENT}
    >
      {this.caption}
    </span>,

    !!this.shortcut && (
      <span
        aria-hidden="true"
        slot="action"
        part={DROPDOWN_PARTS_DICTIONARY.SHORTCUT}
      >
        {this.shortcut}
      </span>
    )
  ];

  #firstLevelRender = () => (
    <button
      popoverTarget={WINDOW_ID}
      aria-controls={WINDOW_ID}
      aria-expanded={this.expanded.toString()}
      aria-haspopup="true"
      aria-label={this.buttonAccessibleName}
      class="expandable-button"
      part={DROPDOWN_PARTS_DICTIONARY.EXPANDABLE_BUTTON}
      type="button"
      ref={el => (this.#mainAction = el)}
    >
      <slot name="action" />
    </button>
  );

  #actionRender = () => {
    const pseudoStartImage = isPseudoElementImg(
      this.startImgSrc,
      this.startImgType
    );
    const pseudoEndImage = isPseudoElementImg(this.endImgSrc, this.endImgType);

    return this.href ? (
      <a
        aria-controls={this.expandable ? WINDOW_ID : null}
        aria-expanded={this.expandable ? this.expanded.toString() : null}
        aria-haspopup={this.expandable ? "true" : null}
        class={{
          action: true,

          [`start-img-type--${this.startImgType} pseudo-img--start`]:
            pseudoStartImage,
          [`end-img-type--${this.endImgType} pseudo-img--end`]: pseudoEndImage
        }}
        part={!this.expandable ? ACTION_LINK : ACTION_LINK_EXPANDABLE}
        href={this.href}
        ref={el => (this.#mainAction = el)}
      >
        {this.#dropDownItemContent()}
      </a>
    ) : (
      <button
        popoverTarget={WINDOW_ID}
        aria-controls={this.expandable ? WINDOW_ID : null}
        aria-expanded={this.expandable ? this.expanded.toString() : null}
        aria-haspopup={this.expandable ? "true" : null}
        class={{
          action: true,

          [`start-img-type--${this.startImgType} pseudo-img--start`]:
            pseudoStartImage,
          [`end-img-type--${this.endImgType} pseudo-img--end`]: pseudoEndImage
        }}
        part={!this.expandable ? ACTION_BUTTON : ACTION_BUTTON_EXPANDABLE}
        type="button"
        ref={el => (this.#mainAction = el)}
      >
        {this.#dropDownItemContent()}
      </button>
    );
  };

  #popoverRender = () => {
    const aligns = this.position.split("_");
    const alignX = aligns[0] as DropdownAlign;
    const alignY = aligns[1] as DropdownAlign;

    const xAlignMapping = mapDropdownAlignToChWindowAlign[alignX];
    const yAlignMapping = mapDropdownAlignToChWindowAlign[alignY];

    return (
      <ch-popover
        role="list"
        id={WINDOW_ID}
        part={DROPDOWN_PARTS_DICTIONARY.WINDOW}
        actionById={true}
        actionElement={this.#mainAction as HTMLButtonElement}
        closeOnClickOutside={this.firstLevel}
        firstLayer={this.firstLevel || this.actionGroupParent}
        popover="manual"
        hidden={!this.expanded}
        inlineAlign={xAlignMapping}
        blockAlign={yAlignMapping}
      >
        <slot />
      </ch-popover>
    );
  };

  #setExportparts = (parts?: string) => {
    const customParts = parts
      ? `${DROPDOWN_EXPORT_PARTS},${parts
          .split(SEPARATE_BY_SPACE_REGEX)
          .join(",")}`
      : DROPDOWN_EXPORT_PARTS;

    this.el.setAttribute("exportparts", customParts);
  };

  connectedCallback(): void {
    this.#setExportparts(this.parts);

    if (!this.firstLevel) {
      this.el.setAttribute("role", "listitem");
    }
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
        {this.firstLevel && this.expandable
          ? this.#firstLevelRender()
          : this.#actionRender()}

        {this.expandable && this.expanded && this.#popoverRender()}
      </Host>
    );
  }
}

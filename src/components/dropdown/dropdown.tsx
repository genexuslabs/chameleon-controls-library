import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { ChWindowAlign } from "../window/ch-window";

import { DropdownAlign, DropdownPosition } from "./types";
import { focusComposedPath } from "../common/helpers";
import { ChDropdownCustomEvent } from "../../components";
import { isPseudoElementImg } from "../../common/utils";
import { ImageRender } from "../../common/types";

const mapDropdownAlignToChWindowAlign: {
  [key in DropdownAlign]: ChWindowAlign;
} = {
  OutsideStart: "outside-start",
  InsideStart: "inside-start",
  Center: "center",
  InsideEnd: "inside-end",
  OutsideEnd: "outside-end"
};

const DROPDOWN_TAG_NAME = "ch-dropdown";
const WINDOW_ID = "window";

const elementIsDropdown = (element: Element) =>
  element?.tagName?.toLowerCase() === DROPDOWN_TAG_NAME;

@Component({
  shadow: true,
  styleUrl: "dropdown.scss",
  tag: "ch-dropdown"
})
export class ChDropDown implements ChComponent {
  #firstExpanded = false;

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
   * `true` to display the dropdown section.
   */
  @Prop({ mutable: true }) expanded = false;

  @Watch("expanded")
  handleExpandedChange(newExpandedValue: boolean) {
    if (newExpandedValue) {
      // Click
      document.addEventListener("click", this.#closeOnClickOutside, {
        capture: true,
        passive: true
      });
    } else {
      // Click
      document.removeEventListener("click", this.#closeOnClickOutside, {
        capture: true
      });

      // This is a WA to avoid a StencilJS's (or browser) issue when reusing
      // the top layer and interacting with the Tab key in the same top layer.
      // After the second opening, the Tab key stops working
      (this.#mainAction as HTMLButtonElement).popoverTargetElement = null;
    }
  }

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
   * Specifies whether the item contains a subtree. `true` if the item does not
   * have a subtree.
   */
  @Prop() readonly leaf: boolean = false;

  /**
   * Level in the render at which the item is placed.
   */
  @Prop() readonly level: number;

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
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * Specifies the shortcut caption that the control will display.
   */
  @Prop() readonly shortcut: string;

  /**
   * `true` to make available a slot to show a footer element.
   */
  @Prop() readonly showFooter: boolean = false;

  /**
   * `true` to make available a slot to show a header element.
   */
  @Prop() readonly showHeader: boolean = false;

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
  @Event() expandedChange: EventEmitter<boolean>;

  @Listen("actionClick")
  onActionClick() {
    // this.#closeDropdown();
    // @todo This behavior must be specified by a property
    // this.returnFocusToButton();
  }

  @Listen("recursiveClose")
  onRecursiveClose(event: ChDropdownCustomEvent<number>) {
    const stopperLevel = event.detail;

    if (this.level === stopperLevel) {
      event.stopPropagation();
    }

    this.#closeDropdown();
  }

  /**
   * Focus the dropdown action.
   */
  @Method()
  async focusElement() {
    this.#mainAction.focus();
  }

  /**
   * Collapse the content of the dropdown.
   */
  @Method()
  async collapseDropdown() {
    if (this.expanded) {
      this.expandedChange.emit(false);
      this.expanded = false;
    }
  }

  /**
   * Expand the content of the dropdown.
   */
  @Method()
  async expandDropdown() {
    if (!this.expanded) {
      this.expandedChange.emit(true);
      this.expanded = true;
    }
  }

  #closeDropdownSibling = () => {
    const currentFocusedElement = focusComposedPath();
    const currentFocusedItem = currentFocusedElement[
      currentFocusedElement.length - 1
    ] as HTMLChDropdownElement;

    if (!elementIsDropdown(currentFocusedItem)) {
      return;
    }

    if (currentFocusedItem.level < this.level) {
      return;
    }

    // Fire an event to close all dropdown parents up to a certain level
    currentFocusedItem.dispatchEvent(
      new CustomEvent("recursiveClose", { bubbles: true, detail: this.level })
    );
  };

  #closeDropdown = () => {
    this.expandedChange.emit(false);
    this.expanded = false;
  };

  /**
   * Returns focus to the expandable button when closing the dropdown. Only
   * works if `openOnFocus = "false"`
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  // #returnFocusToButton = () => {
  //   if (!this.openOnFocus) {
  //     this.#mainAction.focus();
  //   }
  // };

  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #closeOnClickOutside = (event: MouseEvent) => {
    if (event.composedPath().find(el => el === this.el) === undefined) {
      this.#closeDropdown();
    }
  };

  #handleMouseEnter = (event: MouseEvent) => {
    event.stopPropagation();

    // We first must close the current expanded dropdown, since with the
    // keyboard we could have expanded a different dropdown
    this.#closeDropdownSibling();

    if (!this.expanded) {
      this.expandedChange.emit(true);
      this.expanded = true;
    }
  };

  #handleMouseLeave = (event: MouseEvent) => {
    event.stopPropagation();

    if (this.expanded) {
      this.expandedChange.emit(false);
      this.expanded = false;
    }
  };

  // /**
  //  * Check if the next focused element is a child element of the dropdown
  //  * control.
  //  */
  // // eslint-disable-next-line @stencil-community/own-props-must-be-private
  // #handleKeyUpEvents = (event: KeyboardEvent) => {

  //   if (event.code !== TAB_KEY) {
  //     return;
  //   }

  //   const isChildElement = event.composedPath().includes(this.el);
  //   if (isChildElement) {
  //     return;
  //   }

  //   this.#closeDropdown();
  // };

  #handleButtonClick = (event: PointerEvent) => {
    event.stopPropagation();

    if (this.level !== -1 && this.itemClickCallback) {
      this.itemClickCallback(event);
    }

    // If the nested dropdown is expanded and its expandable button is clicked
    // with the MOUSE and not the keyboard, do not change the visibility
    if (this.nestedDropdown && this.expanded && event.pointerType) {
      return;
    }

    // if (!this.expanded) {
    //   // We first must close the current expanded dropdown, since with the
    //   // mouse we could have expanded a different dropdown
    //   this.#closeDropdownSibling();
    // }

    // WA: When clicking a leaf, its dropdown ancestors must be closed
    if (this.leaf) {
      this.el.dispatchEvent(
        new CustomEvent("recursiveClose", {
          bubbles: true,
          detail: this.level + 1
        })
      );

      return;
    }

    this.expanded = !this.expanded;
    this.expandedChange.emit(!this.expanded);
  };

  #dropDownItemContent = () => [
    <span slot="action" class="content" part="content">
      {this.caption}
    </span>,

    !!this.shortcut && (
      <span aria-hidden="true" slot="action" part="shortcut">
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
      part="action button expandable-action expandable-button"
      type="button"
      onClick={this.#handleButtonClick}
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
        aria-controls={!this.leaf ? WINDOW_ID : null}
        aria-expanded={!this.leaf ? this.expanded.toString() : null}
        aria-haspopup={!this.leaf ? "true" : null}
        class={{
          action: true,

          [`start-img-type--${this.startImgType} pseudo-img--start`]:
            pseudoStartImage,
          [`end-img-type--${this.endImgType} pseudo-img--end`]: pseudoEndImage
        }}
        part={
          this.leaf
            ? "action link"
            : "action link expandable-action expandable-link"
        }
        href={this.href}
        onClick={this.#handleButtonClick}
        onMouseEnter={
          !this.leaf && !this.actionGroupParent ? this.#handleMouseEnter : null
        }
        ref={el => (this.#mainAction = el)}
      >
        {this.#dropDownItemContent()}
      </a>
    ) : (
      <button
        popoverTarget={WINDOW_ID}
        aria-controls={!this.leaf ? WINDOW_ID : null}
        aria-expanded={!this.leaf ? this.expanded.toString() : null}
        aria-haspopup={!this.leaf ? "true" : null}
        class={{
          action: true,

          [`start-img-type--${this.startImgType} pseudo-img--start`]:
            pseudoStartImage,
          [`end-img-type--${this.endImgType} pseudo-img--end`]: pseudoEndImage
        }}
        part={
          this.leaf
            ? "action button"
            : "action button expandable-action expandable-button"
        }
        type="button"
        onMouseEnter={
          !this.leaf && !this.actionGroupParent ? this.#handleMouseEnter : null
        }
        onClick={this.#handleButtonClick}
        ref={el => (this.#mainAction = el)}
      >
        {this.#dropDownItemContent()}
      </button>
    );
  };

  #popoverRender = () => {
    this.#firstExpanded ||= this.expanded;

    if (!this.#firstExpanded) {
      return "";
    }

    const aligns = this.position.split("_");
    const alignX = aligns[0] as DropdownAlign;
    const alignY = aligns[1] as DropdownAlign;

    const xAlignMapping = mapDropdownAlignToChWindowAlign[alignX];
    const yAlignMapping = mapDropdownAlignToChWindowAlign[alignY];

    const noNeedToAddDivListWrapper = !this.showHeader && !this.showFooter;

    return (
      <ch-popover
        role={noNeedToAddDivListWrapper ? "list" : null}
        id={WINDOW_ID}
        part="window"
        actionById={true}
        actionElement={this.#mainAction as HTMLButtonElement}
        firstLayer={this.level === -1 || this.actionGroupParent}
        mode="manual"
        hidden={!this.expanded}
        inlineAlign={xAlignMapping}
        blockAlign={yAlignMapping}
      >
        {noNeedToAddDivListWrapper ? (
          <slot />
        ) : (
          [
            this.showHeader && <slot name="header" />,

            <div role="list" class="list" part="list">
              <slot />
            </div>,

            this.showFooter && <slot name="footer" />
          ]
        )}
      </ch-popover>
    );
  };

  render() {
    return (
      <Host
        role={this.level !== -1 ? "listitem" : null}
        style={
          !!this.startImgSrc || !!this.endImgSrc
            ? {
                "--ch-dropdown-item-start-img": `url("${this.startImgSrc}")`,
                "--ch-dropdown-item-end-img": `url("${this.endImgSrc}")`
              }
            : undefined
        }
        onMouseLeave={
          !this.actionGroupParent && this.level !== -1
            ? this.#handleMouseLeave
            : null
        }
      >
        {this.level === -1 && !this.leaf
          ? this.#firstLevelRender()
          : this.#actionRender()}

        {!this.leaf && this.#popoverRender()}
      </Host>
    );
  }
}

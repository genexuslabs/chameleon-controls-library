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

import { DropdownPosition } from "./types";
import { KEY_CODES } from "../../common/reserverd-names";
import { focusComposedPath } from "../common/helpers";
import { ChDropdownCustomEvent } from "../../components";

export type DropdownAlign =
  | "OutsideStart"
  | "InsideStart"
  | "Center"
  | "InsideEnd"
  | "OutsideEnd";

const mapDropdownAlignToChWindowAlign: {
  [key in DropdownAlign]: ChWindowAlign;
} = {
  OutsideStart: "outside-start",
  InsideStart: "inside-start",
  Center: "center",
  InsideEnd: "inside-end",
  OutsideEnd: "outside-end"
};

const WINDOW_ID = "window";

const DROPDOWN_ITEM_TAG_NAME = "ch-dropdown-item";

const elementIsDropdownItem = (element: Element) =>
  element?.tagName?.toLowerCase() === DROPDOWN_ITEM_TAG_NAME;

// Keys
type DropDownKeyDownEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END
  | typeof KEY_CODES.ESCAPE;

@Component({
  shadow: true,
  styleUrl: "dropdown.scss",
  tag: "ch-dropdown"
})
export class ChDropDown implements ChComponent {
  #keyEventsDictionary: {
    [key in DropDownKeyDownEvents]: (event?: KeyboardEvent) => void;
  } = {
    [KEY_CODES.ARROW_DOWN]: event => {
      event.preventDefault(); // Prevent window's scroll
      const currentFocusedElement = focusComposedPath();

      if (
        !this.nestedDropdown &&
        this.#focusIsOnExpandableButton(currentFocusedElement)
      ) {
        this.#getFirstDropdownItemRef().focusElement();
      }
      // The focus was in a subitem. Focus the next subitem
      else {
        const currentFocusedItem =
          currentFocusedElement[currentFocusedElement.length - 1];
        let nextSiblingToFocus = currentFocusedItem.nextElementSibling;

        if (!elementIsDropdownItem(nextSiblingToFocus)) {
          nextSiblingToFocus = this.#getFirstDropdownItemRef();
        }
        (nextSiblingToFocus as HTMLChDropdownItemElement).focusElement();
      }
    },

    [KEY_CODES.ARROW_UP]: event => {
      event.preventDefault(); // Prevent window's scroll
      const currentFocusedElement = focusComposedPath();

      if (
        !this.nestedDropdown &&
        this.#focusIsOnExpandableButton(currentFocusedElement)
      ) {
        this.#getLastDropdownItemRef().focusElement();
      }
      // The focus was in a subitem. Focus the next subitem
      else {
        const currentFocusedItem =
          currentFocusedElement[currentFocusedElement.length - 1];
        let nextSiblingToFocus = currentFocusedItem.previousElementSibling;

        if (!elementIsDropdownItem(nextSiblingToFocus)) {
          nextSiblingToFocus = this.#getLastDropdownItemRef();
        }
        (nextSiblingToFocus as HTMLChDropdownItemElement).focusElement();
      }
    },

    [KEY_CODES.ARROW_RIGHT]: event => {
      const currentFocusedElement = focusComposedPath();

      const currentFocusedItem =
        currentFocusedElement[currentFocusedElement.length - 1];

      if (!elementIsDropdownItem(currentFocusedItem)) {
        return;
      }
      event.preventDefault(); // Prevent window's scroll

      (
        currentFocusedItem as HTMLChDropdownItemElement
      ).expandAndFocusDropdown();
    },

    [KEY_CODES.ARROW_LEFT]: event => {
      const currentFocusedElement = focusComposedPath();

      const currentFocusedItem =
        currentFocusedElement[currentFocusedElement.length - 1];

      if (!elementIsDropdownItem(currentFocusedItem)) {
        return;
      }
      event.preventDefault(); // Prevent window's scroll

      if (this.expanded) {
        this.#closeDropdown();
        this.#expandableButton.focus();
      }
    },

    [KEY_CODES.HOME]: event => {
      event.preventDefault(); // Prevent window's scroll
      this.#getFirstDropdownItemRef().focusElement();
    },

    [KEY_CODES.END]: event => {
      event.preventDefault(); // Prevent window's scroll
      this.#getLastDropdownItemRef().focusElement();
    },

    [KEY_CODES.ESCAPE]: () => {
      this.#closeDropdown();
      this.#returnFocusToButton();
    }
  };

  #showHeader = false;
  #showFooter = false;
  #firstExpanded = false;

  // Refs
  #expandableButton: HTMLButtonElement;
  #itemsRef: HTMLSlotElement;

  @Element() el: HTMLChDropdownElement;

  /**
   * This attribute lets you specify the label for the expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonAccessibleName: string;

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
    }
  }

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
   * Fired when the visibility of the dropdown section is changed by user
   * interaction.
   */
  @Event() expandedChange: EventEmitter<boolean>;

  /**
   * Fired when all dropdown parents must be closed to a certain level.
   */
  @Event() recursiveClose: EventEmitter<number>;

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
   * Executes the `recursiveClose` event.
   */
  @Method()
  async performRecursiveClose(stopperLevel: number) {
    this.recursiveClose.emit(stopperLevel);
  }

  #closeDropdownSibling = () => {
    const currentFocusedElement = focusComposedPath();
    const currentFocusedItem =
      currentFocusedElement[currentFocusedElement.length - 1];

    if (!elementIsDropdownItem(currentFocusedItem)) {
      return;
    }

    const dropdownToPerformRecursiveClosing = currentFocusedElement[
      currentFocusedElement.length - 2
    ] as HTMLChDropdownElement;

    if (dropdownToPerformRecursiveClosing === this.el) {
      return;
    }

    dropdownToPerformRecursiveClosing.performRecursiveClose(this.level);
  };

  /**
   * Expand the content of the dropdown and focus the first dropdown-item.
   */
  @Method()
  async expandAndFocusDropdown() {
    if (!this.expanded) {
      this.expandedChange.emit(true);
      this.expanded = true;
    }

    // Wait until the dropdown content has been rendered
    requestAnimationFrame(() => {
      this.#getFirstDropdownItemRef().focusElement();
    });
  }

  /**
   * Focus the expandable button of the dropdown.
   */
  @Method()
  async focusButton() {
    this.#expandableButton.focus();
  }

  #focusIsOnExpandableButton = (composedPath: HTMLElement[]): boolean =>
    composedPath[0] === this.#expandableButton;

  #getFirstDropdownItemRef = (): HTMLChDropdownItemElement =>
    this.#getSubItems()[0];

  #getLastDropdownItemRef = (): HTMLChDropdownItemElement => {
    const dropdownItems = this.#getSubItems();
    return dropdownItems[dropdownItems.length - 1];
  };

  #getSubItems = (): HTMLChDropdownItemElement[] => {
    const slotElements = this.#itemsRef.assignedElements();
    let arrayOfDropdownItems = slotElements;

    // There is nested slot when nesting dropdowns
    if (this.nestedDropdown) {
      arrayOfDropdownItems = (
        slotElements[0] as HTMLSlotElement
      ).assignedElements();
    }

    return arrayOfDropdownItems as HTMLChDropdownItemElement[];
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
  #returnFocusToButton = () => {
    if (!this.openOnFocus) {
      this.#expandableButton.focus();
    }
  };

  #closeOnClickOutside = (event: MouseEvent) => {
    if (event.composedPath().find(el => el === this.el) === undefined) {
      this.#closeDropdown();
    }
  };

  #handleKeyDownEvents = (event: KeyboardEvent) => {
    const keyEventHandler: ((event?: KeyboardEvent) => void) | undefined =
      this.#keyEventsDictionary[event.code];

    if (keyEventHandler) {
      event.stopPropagation();
      keyEventHandler(event);
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

    // If the nested dropdown is expanded and its expandable button is clicked
    // with the MOUSE and not the keyboard, do not change the visibility
    if (this.nestedDropdown && this.expanded && event.pointerType) {
      return;
    }

    this.expandedChange.emit(!this.expanded);
    this.expanded = !this.expanded;
  };

  componentWillLoad() {
    this.#showHeader = !!this.el.querySelector(':scope>[slot="header"]');
    this.#showFooter = !!this.el.querySelector(':scope>[slot="footer"]');
  }

  render() {
    const aligns = this.position.split("_");
    const alignX = aligns[0] as DropdownAlign;
    const alignY = aligns[1] as DropdownAlign;

    const xAlignMapping = mapDropdownAlignToChWindowAlign[alignX];
    const yAlignMapping = mapDropdownAlignToChWindowAlign[alignY];

    const isExpanded = this.expanded;
    this.#firstExpanded ||= isExpanded;

    const noNeedToAddDivListWrapper = !this.#showHeader && !this.#showFooter;

    return (
      <Host
        onKeyDown={this.expanded ? this.#handleKeyDownEvents : null}
        onMouseLeave={this.nestedDropdown ? this.#handleMouseLeave : null}
      >
        <button
          aria-controls={WINDOW_ID}
          aria-expanded={this.expanded.toString()}
          aria-haspopup="true"
          aria-label={this.buttonAccessibleName}
          class="expandable-button"
          part="expandable-button"
          type="button"
          onClick={this.#handleButtonClick}
          onMouseEnter={this.nestedDropdown ? this.#handleMouseEnter : null}
          ref={el => (this.#expandableButton = el)}
        >
          <slot name="action" />
        </button>

        <ch-popover
          role={noNeedToAddDivListWrapper ? "list" : null}
          id={WINDOW_ID}
          part="window"
          actionElement={this.#expandableButton}
          mode="manual"
          hidden={!isExpanded}
          inlineAlign={xAlignMapping}
          blockAlign={yAlignMapping}
        >
          {this.#firstExpanded &&
            (noNeedToAddDivListWrapper ? (
              <slot
                name="items"
                ref={el => (this.#itemsRef = el as HTMLSlotElement)}
              />
            ) : (
              [
                this.#showHeader && <slot name="header" />,

                <div role="list" class="list" part="list">
                  <slot
                    name="items"
                    ref={el => (this.#itemsRef = el as HTMLSlotElement)}
                  />
                </div>,

                this.#showFooter && <slot name="footer" />
              ]
            ))}
        </ch-popover>
      </Host>
    );
  }
}

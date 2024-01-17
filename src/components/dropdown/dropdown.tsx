import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { ChWindowAlign } from "../window/ch-window";

import { DropdownPosition } from "./types";

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

const EXPANDABLE_BUTTON_ID = "expandable-button";
const SECTION_ID = "section";

const DROPDOWN_ITEM_TAG_NAME = "ch-dropdown-item";
const DROPDOWN_ITEM_SELECTOR = `:scope > ${DROPDOWN_ITEM_TAG_NAME}`;

// Keys
const TAB_KEY = "Tab";
type DropDownKeyDownEvents = "ArrowDown" | "ArrowUp" | "Escape";

@Component({
  shadow: true,
  styleUrl: "dropdown.scss",
  tag: "ch-dropdown"
})
export class ChDropDown implements ChComponent {
  #keyEventsDictionary: {
    [key in DropDownKeyDownEvents]: (event?: KeyboardEvent) => void;
  } = {
    ArrowDown: (event: KeyboardEvent) => {
      event.preventDefault();

      if (!this.#currentFocusedItem) {
        this.#focusFirstDropDownItem();

        return;
      }

      const nextDropDownItem = this.#findNextDropDownItemSibling();
      if (nextDropDownItem) {
        // This is wrong, it should call the focusElement Method. StencilJS bug?
        nextDropDownItem.handleFocusElement();
      }
    },

    ArrowUp: (event: KeyboardEvent) => {
      event.preventDefault();

      if (!this.#currentFocusedItem) {
        this.#focusFirstDropDownItem();

        return;
      }

      const previousDropDownItem = this.#findPreviousDropDownItemSibling();
      if (previousDropDownItem) {
        // This is wrong, it should call the focusElement Method. StencilJS bug?
        previousDropDownItem.handleFocusElement();
      }
    },

    Escape: () => {
      this.#closeDropdown();
      this.#returnFocusToButton();
    }
  };

  #showHeader = false;
  #showFooter = false;
  #firstExpanded = false;

  /**
   * Determine the current dropdown-item that is focused
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #currentFocusedItem: HTMLChDropdownItemElement;

  // Refs
  #expandableButton: HTMLButtonElement;

  @Element() el: HTMLChDropdownElement;

  @State() expanded = false;
  @State() expandedWithHover = false;

  /**
   * This attribute lets you specify the label for the expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonLabel: string = "Show options";

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   */
  @Prop() readonly expandBehavior: "Click" | "ClickOrHover" = "ClickOrHover";

  /**
   * This attribute lets you specify if the control is nested in another
   * dropdown. Useful to manage keyboard interaction.
   */
  @Prop() readonly nestedDropdown: boolean = false;

  /**
   * Determine if the dropdown section should be opened when the expandable
   * button of the control is focused.
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * Fired when the visibility of the dropdown section is changed
   */
  @Event() expandedChange: EventEmitter<boolean>;

  @Watch("expanded")
  handleExpandedChange(newExpandedValue: boolean) {
    if (newExpandedValue) {
      this.#currentFocusedItem = undefined;

      // Click
      document.addEventListener(
        "click",
        this.#closeDropdownWhenClickingOutside,
        {
          capture: true
        }
      );

      // Keyboard events
      if (!this.nestedDropdown) {
        document.addEventListener("keydown", this.#handleKeyDownEvents, {
          capture: true
        });
      }

      document.addEventListener("keyup", this.#handleKeyUpEvents, {
        capture: true
      });
    } else {
      // Click
      document.removeEventListener(
        "click",
        this.#closeDropdownWhenClickingOutside,
        {
          capture: true
        }
      );

      // Keyboard events
      if (!this.nestedDropdown) {
        document.removeEventListener("keydown", this.#handleKeyDownEvents, {
          capture: true
        });
      }

      document.removeEventListener("keyup", this.#handleKeyUpEvents, {
        capture: true
      });
    }
  }

  @Listen("actionClick")
  onActionClick() {
    this.#closeDropdown();

    // @todo This behavior must be specified by a property
    // this.returnFocusToButton();
  }

  @Listen("focusChange")
  onFocusChange(event: CustomEvent) {
    this.#currentFocusedItem = event.target as HTMLChDropdownItemElement;
  }

  #focusFirstDropDownItem = () => {
    this.#currentFocusedItem = this.el.querySelector(DROPDOWN_ITEM_SELECTOR);

    if (this.#currentFocusedItem) {
      this.#currentFocusedItem.handleFocusElement();
    }
  };

  #findNextDropDownItemSibling = () => {
    let nextSibling = this.#currentFocusedItem
      .nextElementSibling as HTMLChDropdownItemElement;

    while (
      nextSibling &&
      nextSibling.tagName.toLowerCase() !== DROPDOWN_ITEM_TAG_NAME
    ) {
      nextSibling = nextSibling.nextElementSibling as HTMLChDropdownItemElement;
    }

    return nextSibling;
  };

  #findPreviousDropDownItemSibling = () => {
    let previousSibling = this.#currentFocusedItem
      .previousElementSibling as HTMLChDropdownItemElement;

    while (
      previousSibling &&
      previousSibling.tagName.toLowerCase() !== DROPDOWN_ITEM_TAG_NAME
    ) {
      previousSibling =
        previousSibling.previousElementSibling as HTMLChDropdownItemElement;
    }

    return previousSibling;
  };

  #closeDropdown = () => {
    this.#closeDropdownWithHover();
    this.expanded = false;
    this.expandedChange.emit(false);
  };

  #closeDropdownWithHover = () => {
    this.expandedWithHover = false;

    // If the control was not expanded with focus
    if (!this.expanded) {
      this.expandedChange.emit(false);
    }
  };

  /**
   * Returns focus to the expandable button when closing the dropdown. Only
   * works if `openOnFocus = "false"`
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #returnFocusToButton = () => {
    if (!this.openOnFocus && !this.nestedDropdown) {
      this.#expandableButton.focus();
    }
  };

  #closeDropdownWhenClickingOutside = (event: MouseEvent) => {
    if (event.composedPath().find(el => el === this.el) === undefined) {
      this.#closeDropdown();
    }
  };

  #handleKeyDownEvents = (event: KeyboardEvent) => {
    const keyEventHandler: ((event?: KeyboardEvent) => void) | undefined =
      this.#keyEventsDictionary[event.code];

    if (keyEventHandler) {
      keyEventHandler(event);
    }
  };

  /**
   * Check if the next focused element is a child element of the dropdown
   * control.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #handleKeyUpEvents = (event: KeyboardEvent) => {
    if (event.code !== TAB_KEY) {
      return;
    }

    const isChildElement = event.composedPath().includes(this.el);
    if (isChildElement) {
      return;
    }

    this.#closeDropdown();
  };

  #handleMouseLeave = () => {
    const focusedElementIsInsideDropDown =
      document.activeElement.closest("ch-dropdown") === this.el;

    if (focusedElementIsInsideDropDown) {
      this.expanded = true;
    }
    this.#closeDropdownWithHover();
  };

  #handleMouseEnter = () => {
    if (this.expandedWithHover) {
      return;
    }

    this.expandedWithHover = true;

    // If not previously expanded, emit the event
    if (!this.expanded) {
      this.expandedChange.emit(true);
    }
  };

  #handleButtonClick = (event: MouseEvent) => {
    event.stopPropagation();

    this.expandedChange.emit(!this.expanded);
    this.expanded = !this.expanded;
  };

  #handleButtonFocus = (event: FocusEvent) => {
    event.stopPropagation();

    if (this.expanded) {
      return;
    }

    this.expanded = true;

    // If not previously expanded, emit the event
    if (!this.expandedWithHover) {
      this.expandedChange.emit(true);
    }
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

    const isExpanded = this.expanded || this.expandedWithHover;
    this.#firstExpanded ||= isExpanded;

    return (
      <Host
        onMouseLeave={
          this.expandBehavior === "ClickOrHover"
            ? this.#handleMouseLeave
            : undefined
        }
      >
        <button
          id={EXPANDABLE_BUTTON_ID}
          aria-controls={SECTION_ID}
          aria-expanded={this.expanded.toString()}
          aria-haspopup="true"
          aria-label={this.buttonLabel}
          class="expandable-button"
          part="expandable-button"
          type="button"
          onClick={this.#handleButtonClick}
          onFocus={this.openOnFocus ? this.#handleButtonFocus : undefined}
          onMouseEnter={
            this.expandBehavior === "ClickOrHover"
              ? this.#handleMouseEnter
              : undefined
          }
          ref={el => (this.#expandableButton = el)}
        >
          <slot name="action" />
        </button>

        <ch-window
          part="window"
          exportparts="window:section,mask,header,footer,separation"
          container={this.#expandableButton}
          closeOnEscape={true}
          hidden={!isExpanded}
          modal={false}
          showFooter={this.#showFooter}
          showHeader={this.#showHeader}
          showMain={false}
          // Necessary since the separation between the button and the section
          // triggers the onMouseLeave event
          showSeparation={this.expandBehavior === "ClickOrHover"}
          xAlign={xAlignMapping}
          yAlign={yAlignMapping}
        >
          {this.#firstExpanded && [
            this.#showHeader && <slot name="header" slot="header" />,

            <div role="list" class="list" part="list">
              <slot name="items" />
            </div>,

            this.#showFooter && <slot name="footer" slot="footer" />
          ]}
        </ch-window>
      </Host>
    );
  }
}

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
  private keyEventsDictionary: {
    [key in DropDownKeyDownEvents]: (event?: KeyboardEvent) => void;
  } = {
    ArrowDown: (event: KeyboardEvent) => {
      event.preventDefault();

      if (!this.currentFocusedItem) {
        this.focusFirstDropDownItem();

        return;
      }

      const nextDropDownItem = this.findNextDropDownItemSibling();
      if (nextDropDownItem) {
        // This is wrong, it should call the focusElement Method. StencilJS bug?
        nextDropDownItem.handleFocusElement();
      }
    },

    ArrowUp: (event: KeyboardEvent) => {
      event.preventDefault();

      if (!this.currentFocusedItem) {
        this.focusFirstDropDownItem();

        return;
      }

      const previousDropDownItem = this.findPreviousDropDownItemSibling();
      if (previousDropDownItem) {
        // This is wrong, it should call the focusElement Method. StencilJS bug?
        previousDropDownItem.handleFocusElement();
      }
    },

    Escape: () => {
      this.closeDropdown();
      this.returnFocusToButton();
    }
  };

  private showHeader = false;
  private showFooter = false;
  private firstExpanded = false;

  /**
   * Determine the current dropdown-item that is focused
   */
  private currentFocusedItem: HTMLChDropdownItemElement;

  // Refs
  private expandableButton: HTMLButtonElement;

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
      this.currentFocusedItem = undefined;

      // Click
      document.body.addEventListener(
        "click",
        this.closeDropdownWhenClickingOutside,
        {
          capture: true
        }
      );

      // Keyboard events
      if (!this.nestedDropdown) {
        document.body.addEventListener("keydown", this.handleKeyDownEvents, {
          capture: true
        });
      }

      document.body.addEventListener("keyup", this.handleKeyUpEvents, {
        capture: true
      });
    } else {
      // Click
      document.body.removeEventListener(
        "click",
        this.closeDropdownWhenClickingOutside,
        {
          capture: true
        }
      );

      // Keyboard events
      if (!this.nestedDropdown) {
        document.body.removeEventListener("keydown", this.handleKeyDownEvents, {
          capture: true
        });
      }

      document.body.removeEventListener("keyup", this.handleKeyUpEvents, {
        capture: true
      });
    }
  }

  @Listen("actionClick")
  handleActionClick() {
    this.closeDropdown();

    // @todo This behavior must be specified by a property
    // this.returnFocusToButton();
  }

  @Listen("focusChange")
  handleDropDownItemFocusChange(event: CustomEvent) {
    this.currentFocusedItem = event.target as HTMLChDropdownItemElement;
  }

  private focusFirstDropDownItem() {
    this.currentFocusedItem = this.el.querySelector(DROPDOWN_ITEM_SELECTOR);

    if (this.currentFocusedItem) {
      this.currentFocusedItem.handleFocusElement();
    }
  }

  private findNextDropDownItemSibling() {
    let nextSibling = this.currentFocusedItem
      .nextElementSibling as HTMLChDropdownItemElement;

    while (
      nextSibling &&
      nextSibling.tagName.toLowerCase() !== DROPDOWN_ITEM_TAG_NAME
    ) {
      nextSibling = nextSibling.nextElementSibling as HTMLChDropdownItemElement;
    }

    return nextSibling;
  }

  private findPreviousDropDownItemSibling() {
    let previousSibling = this.currentFocusedItem
      .previousElementSibling as HTMLChDropdownItemElement;

    while (
      previousSibling &&
      previousSibling.tagName.toLowerCase() !== DROPDOWN_ITEM_TAG_NAME
    ) {
      previousSibling =
        previousSibling.previousElementSibling as HTMLChDropdownItemElement;
    }

    return previousSibling;
  }

  private closeDropdown = () => {
    this.closeDropdownWithHover();
    this.expanded = false;
    this.expandedChange.emit(false);
  };

  private closeDropdownWithHover = () => {
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
  private returnFocusToButton() {
    if (!this.openOnFocus && !this.nestedDropdown) {
      this.expandableButton.focus();
    }
  }

  private closeDropdownWhenClickingOutside = (event: MouseEvent) => {
    if (event.composedPath().find(el => el === this.el) === undefined) {
      this.closeDropdown();
    }
  };

  private handleKeyDownEvents = (event: KeyboardEvent) => {
    const keyEventHandler: ((event?: KeyboardEvent) => void) | undefined =
      this.keyEventsDictionary[event.code];

    if (keyEventHandler) {
      keyEventHandler(event);
    }
  };

  /**
   * Check if the next focused element is a child element of the dropdown
   * control.
   */
  private handleKeyUpEvents = (event: KeyboardEvent) => {
    if (event.code !== TAB_KEY) {
      return;
    }

    const isChildElement = event.composedPath().includes(this.el);
    if (isChildElement) {
      return;
    }

    this.closeDropdown();
  };

  private handleMouseLeave = () => {
    const focusedElementIsInsideDropDown =
      document.activeElement.closest("ch-dropdown") === this.el;

    if (focusedElementIsInsideDropDown) {
      this.expanded = true;
    }
    this.closeDropdownWithHover();
  };

  private handleMouseEnter = () => {
    if (this.expandedWithHover) {
      return;
    }

    this.expandedWithHover = true;

    // If not previously expanded, emit the event
    if (!this.expanded) {
      this.expandedChange.emit(true);
    }
  };

  private handleButtonClick = (event: MouseEvent) => {
    event.stopPropagation();

    this.expandedChange.emit(!this.expanded);
    this.expanded = !this.expanded;
  };

  private handleButtonFocus = (event: FocusEvent) => {
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
    this.showHeader = !!this.el.querySelector(':scope > [slot="header"]');
    this.showFooter = !!this.el.querySelector(':scope > [slot="footer"]');
  }

  render() {
    const aligns = this.position.split("_");
    const alignX = aligns[0] as DropdownAlign;
    const alignY = aligns[1] as DropdownAlign;

    const hasVerticalPosition =
      alignY === "OutsideStart" || alignY === "OutsideEnd";
    const xAlignMapping = mapDropdownAlignToChWindowAlign[alignX];
    const yAlignMapping = mapDropdownAlignToChWindowAlign[alignY];

    const isExpanded = this.expanded || this.expandedWithHover;
    this.firstExpanded ||= isExpanded;

    return (
      <Host
        onMouseLeave={
          this.expandBehavior === "ClickOrHover"
            ? this.handleMouseLeave
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
          onClick={this.handleButtonClick}
          onFocus={this.openOnFocus ? this.handleButtonFocus : undefined}
          onMouseEnter={
            this.expandBehavior === "ClickOrHover"
              ? this.handleMouseEnter
              : undefined
          }
          ref={el => (this.expandableButton = el)}
        >
          <slot name="action" />
        </button>

        {this.expandBehavior === "ClickOrHover" && this.expandedWithHover && (
          // Necessary since the separation between the button and the section
          // triggers the onMouseLeave event
          <div
            aria-hidden="true"
            class={{
              separation: true,
              [`separation--y separation--y-${yAlignMapping}`]:
                hasVerticalPosition,
              [`separation--x separation--x-${xAlignMapping}`]:
                !hasVerticalPosition
            }}
            part="separation"
          ></div>
        )}

        <ch-window
          part="window"
          exportparts="window:section,mask,header,footer"
          container={this.el}
          closeOnEscape={true}
          hidden={!isExpanded}
          modal={false}
          showFooter={this.showFooter}
          showHeader={this.showHeader}
          showMain={false}
          xAlign={xAlignMapping}
          yAlign={yAlignMapping}
        >
          {this.firstExpanded && [
            this.showHeader && <slot name="header" slot="header" />,

            <div role="list" class="list" part="list">
              <slot name="items" />
            </div>,

            this.showFooter && <slot name="footer" slot="footer" />
          ]}
        </ch-window>
      </Host>
    );
  }
}

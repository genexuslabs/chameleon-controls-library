import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { DropdownPosition } from "../dropdown/types";

const DROPDOWN_ITEM = "ch-dropdown-item";

@Component({
  shadow: true,
  styleUrl: "dropdown-item.scss",
  tag: "ch-dropdown-item"
})
export class ChDropDownItem implements ChComponent {
  private mainElement: HTMLButtonElement | HTMLAnchorElement;

  @Element() el: HTMLChDropdownItemElement;

  @State() hasItems = false;

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   * Only works if the control has subitems.
   */
  @Prop() readonly expandBehavior: "Click" | "ClickOrHover" = "ClickOrHover";

  /**
   * `true` to force the control to make its own containing block.
   */
  @Prop({ reflect: true }) readonly forceContainingBlock: boolean = true;

  /**
   * Specifies the hyperlink of the item. If this property is defined, the
   * control will render an anchor tag with this `href`. Otherwise, it will
   * render a button tag.
   */
  @Prop() readonly href: string;

  /**
   * Specifies the src for the left img.
   */
  @Prop() readonly leftImgSrc: string;

  /**
   * Determine if the dropdown section should be opened when the expandable
   * button of the control is focused.
   * Only works if the control has subitems.
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * Specifies the src for the right img.
   */
  @Prop() readonly rightImgSrc: string;

  /**
   * Specifies the shortcut caption that the control will display.
   */
  @Prop() readonly shortcut: string;

  /**
   * Fires when the control's anchor or button is clicked.
   */
  @Event() actionClick: EventEmitter<string>;

  /**
   * Fired when the visibility of the dropdown section is changed
   */
  @Event() expandedChange: EventEmitter<boolean>;

  /**
   * Fires when the control's anchor or button is in focus.
   */
  @Event() focusChange: EventEmitter;

  /**
   * Focuses the control's anchor or button.
   */
  @Method("focusElement")
  async handleFocusElement() {
    this.mainElement.focus();
  }

  private dropDownItemContent = () => [
    !!this.leftImgSrc && (
      <img
        slot="action"
        aria-hidden="true"
        class="start-img"
        part="start-img"
        alt=""
        src={this.leftImgSrc}
        loading="lazy"
      />
    ),

    <span slot="action" class="content" part="content">
      <slot />
    </span>,

    !!this.shortcut && (
      <span aria-hidden="true" slot="action" part="shortcut">
        {this.shortcut}
      </span>
    ),

    !!this.rightImgSrc && (
      <img
        slot="action"
        aria-hidden="true"
        class="end-img"
        part="end-img"
        alt=""
        src={this.rightImgSrc}
        loading="lazy"
      />
    )
  ];

  private checkItems = () => {
    this.hasItems = !!this.el.querySelector(`:scope>${DROPDOWN_ITEM}`);
  };

  private noItemsRender = () =>
    this.href ? (
      <a
        class="action"
        part="action link"
        href={this.href}
        onClick={this.handleActionClick}
        onFocus={this.handleFocus}
        ref={el => (this.mainElement = el)}
      >
        {this.dropDownItemContent()}

        <slot name="items" onSlotchange={this.checkItems} />
      </a>
    ) : (
      <button
        class="action"
        part="action button"
        type="button"
        onClick={this.handleActionClick}
        onFocus={this.handleFocus}
        ref={el => (this.mainElement = el)}
      >
        {this.dropDownItemContent()}

        <slot name="items" onSlotchange={this.checkItems} />
      </button>
    );

  private itemsRender = () => (
    <ch-dropdown
      class="action"
      exportparts="expandable-button:action,expandable-button:button,expandable-button:expandable-action,separation,list,window"
      expandBehavior={this.expandBehavior}
      nestedDropdown={true}
      openOnFocus={this.openOnFocus}
      position={this.position}
    >
      {this.dropDownItemContent()}

      <slot name="items" slot="items" onSlotchange={this.checkItems} />
    </ch-dropdown>
  );

  private handleActionClick = () => {
    this.actionClick.emit(this.el.id);
  };

  private handleFocus = () => {
    this.focusChange.emit();
  };

  componentWillLoad() {
    this.checkItems();
  }

  render() {
    return (
      <Host role="listitem">
        {this.hasItems ? this.itemsRender() : this.noItemsRender()}
      </Host>
    );
  }
}

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

const DROPDOWN_ITEM = "ch-dropdown-item";

@Component({
  shadow: true,
  styleUrl: "dropdown-item.scss",
  tag: "ch-dropdown-item"
})
export class ChDropDownItem implements ChComponent {
  private mainElement: HTMLButtonElement | HTMLAnchorElement;

  @Element() element: HTMLChDropdownItemElement;

  @State() hasItems = false;

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   * Only works if the control has subitems.
   */
  @Prop() readonly expandBehavior: "Click" | "Click or Hover" =
    "Click or Hover";

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
   * Specifies the src for the right img.
   */
  @Prop() readonly rightImgSrc: string;

  /**
   * Fires when the control's anchor or button is clicked.
   */
  @Event() actionClick: EventEmitter<string>;

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
        aria-hidden="true"
        class="left-img"
        part="left-img"
        alt=""
        src={this.leftImgSrc}
        loading="lazy"
      />
    ),

    <span class="content" part="content">
      <slot />
    </span>,

    !!this.rightImgSrc && (
      <img
        aria-hidden="true"
        class="right-img"
        part="right-img"
        alt=""
        src={this.rightImgSrc}
        loading="lazy"
      />
    )
  ];

  private checkItems = () => {
    this.hasItems = !!this.element.querySelector(`:scope>${DROPDOWN_ITEM}`);
  };

  private noItemsRender = () =>
    this.href ? (
      <a
        class="action"
        part="action target"
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
      part="action button"
      exportparts="expandable-button,separation,list,section,mask,header,footer"
      expandBehavior={this.expandBehavior}
      nestedDropdown={true}
      openOnFocus={this.openOnFocus}
      position="OutsideEnd_InsideStart"
    >
      <div class="dummy-wrapper" slot="action">
        {this.dropDownItemContent()}
      </div>

      <div class="dummy-wrapper" slot="items">
        <slot name="items" onSlotchange={this.checkItems} />
      </div>
    </ch-dropdown>
  );

  private handleActionClick = () => {
    this.actionClick.emit(this.element.id);
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

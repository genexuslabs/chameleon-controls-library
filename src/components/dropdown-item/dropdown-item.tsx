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
  private mainElement:
    | HTMLButtonElement
    | HTMLAnchorElement
    | HTMLChDropdownElement;

  @Element() el: HTMLChDropdownItemElement;

  @State() hasItems = false;

  /**
   * Specifies the caption that the control will display.
   */
  @Prop() readonly caption: string;

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
   * Level in the render at which the item is placed.
   */
  @Prop() readonly level: number;

  /**
   * This attribute lets you specify if the control is nested in another
   * dropdown. Useful to manage keyboard interaction.
   */
  @Prop() readonly nestedDropdown: boolean = true;

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
   * Focuses the control's anchor or button.
   */
  @Method()
  async focusElement() {
    if (this.hasItems) {
      (this.mainElement as HTMLChDropdownElement).focusButton();
    } else {
      this.mainElement.focus();
    }
  }

  /**
   * Expand the content of the dropdown and focus the first dropdown-item.
   */
  @Method()
  async expandAndFocusDropdown() {
    if (this.hasItems) {
      (this.mainElement as HTMLChDropdownElement).expandAndFocusDropdown();
    }
  }

  private dropDownItemContent = () => [
    <span slot="action" class="content" part="content">
      {this.caption}
    </span>,

    !!this.shortcut && (
      <span aria-hidden="true" slot="action" part="shortcut">
        {this.shortcut}
      </span>
    )
  ];

  private checkItems = () => {
    this.hasItems = !!this.el.querySelector(`:scope>${DROPDOWN_ITEM}`);
  };

  private noItemsRender = () =>
    this.href ? (
      <a
        class={{
          action: true,
          "start-img": !!this.leftImgSrc,
          "end-img": !!this.rightImgSrc
        }}
        part="action link"
        href={this.href}
        onClick={this.handleActionClick}
        ref={el => (this.mainElement = el)}
      >
        {this.dropDownItemContent()}

        <slot name="items" onSlotchange={this.checkItems} />
      </a>
    ) : (
      <button
        class={{
          action: true,
          "start-img": !!this.leftImgSrc,
          "end-img": !!this.rightImgSrc
        }}
        part="action button"
        type="button"
        onClick={this.handleActionClick}
        ref={el => (this.mainElement = el)}
      >
        {this.dropDownItemContent()}

        <slot name="items" onSlotchange={this.checkItems} />
      </button>
    );

  private itemsRender = () => (
    <ch-dropdown
      buttonAccessibleName={this.caption}
      class={{
        action: true,
        "start-img-part": !!this.leftImgSrc,
        "end-img-part": !!this.rightImgSrc
      }}
      exportparts="expandable-button:action,expandable-button:button,expandable-button:expandable-action,separation,list,window"
      level={this.level}
      nestedDropdown={this.nestedDropdown}
      openOnFocus={this.openOnFocus}
      position={this.position}
      ref={el => (this.mainElement = el)}
    >
      {this.dropDownItemContent()}

      <slot name="items" slot="items" onSlotchange={this.checkItems} />
    </ch-dropdown>
  );

  private handleActionClick = () => {
    this.actionClick.emit(this.el.id);
  };

  componentWillLoad() {
    this.checkItems();
  }

  render() {
    return (
      <Host
        role="listitem"
        style={
          !!this.leftImgSrc || !!this.rightImgSrc
            ? {
                "--ch-dropdown-item-start-img": `url("${this.leftImgSrc}")`,
                "--ch-dropdown-item-end-img": `url("${this.rightImgSrc}")`
              }
            : undefined
        }
      >
        {this.hasItems ? this.itemsRender() : this.noItemsRender()}
      </Host>
    );
  }
}

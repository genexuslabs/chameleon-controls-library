import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";

@Component({
  shadow: true,
  styleUrl: "dropdown-item.scss",
  tag: "ch-dropdown-item"
})
export class ChDropDownItem implements ChComponent {
  private mainElement: HTMLButtonElement | HTMLAnchorElement;

  @Element() element: HTMLChDropdownItemElement;

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
        part="dropdown-item__left-img"
        alt=""
        src={this.leftImgSrc}
        loading="lazy"
      />
    ),

    <span class="content" part="dropdown-item__content">
      <slot />
    </span>,

    !!this.rightImgSrc && (
      <img
        aria-hidden="true"
        class="right-img"
        part="dropdown-item__right-img"
        alt=""
        src={this.rightImgSrc}
        loading="lazy"
      />
    )
  ];

  private handleActionClick = () => {
    this.actionClick.emit(this.element.id);
  };

  private handleFocus = () => {
    this.focusChange.emit();
  };

  render() {
    console.log(this.leftImgSrc);

    return (
      <Host role="listitem">
        {this.href ? (
          <a
            class="action"
            part="dropdown-item__target"
            href={this.href}
            onClick={this.handleActionClick}
            onFocus={this.handleFocus}
            ref={el => (this.mainElement = el)}
          >
            {this.dropDownItemContent()}
          </a>
        ) : (
          <button
            class="action"
            part="dropdown-item__button"
            type="button"
            onClick={this.handleActionClick}
            onFocus={this.handleFocus}
            ref={el => (this.mainElement = el)}
          >
            {this.dropDownItemContent()}
          </button>
        )}
      </Host>
    );
  }
}

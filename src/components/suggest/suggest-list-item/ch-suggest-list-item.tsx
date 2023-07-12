/* STENCIL IMPORTS */
import {
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  Element
} from "@stencil/core";
/* OTHER LIBRARIES IMPORTS */
/* CUSTOM IMPORTS */
import { ChSuggestKeyDownEvents } from "../ch-suggest";

const ARROW_DOWN = "ArrowDown";
const ARROW_UP = "ArrowUp";
@Component({
  tag: "ch-suggest-list-item",
  styleUrl: "ch-suggest-list-item.scss",
  shadow: true
})
export class ChSuggestListItem {
  /*
INDEX:
1.OWN PROPERTIES
2.REFERENCE TO ELEMENTS
3.STATE() VARIABLES
4.PUBLIC PROPERTY API
5.EVENTS (EMMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.PUBLIC METHODS API
9.LOCAL METHODS
10.RENDER() FUNCTION
*/

  /*** 1.OWN PROPERTIES ***/

  /**
   * The icon url
   */
  @Prop() readonly iconSrc: string;

  /*** 2.REFERENCE TO ELEMENTS ***/

  @Element() el: HTMLChSuggestListItemElement;

  /*** 3.STATE() VARIABLES ***/

  /*** 4.PUBLIC PROPERTY API ***/

  /*** 5.EVENTS (EMIT) ***/

  /**
   * This event is emitted every time the item is selected, either by clicking on it, or by pressing Enter.
   */
  @Event() itemSelected: EventEmitter<itemSelected>;

  /**
   * This event is emitted every time the item is about to lose focus, by pressing the "ArrowUp" or "ArrowDown" keyboard keys.
   */
  @Event() focusChangeAttempt: EventEmitter<focusChangeAttempt>;

  /*** 6.COMPONENT LIFECYCLE EVENTS ***/

  /*** 7.LISTENERS ***/

  /*** 8.PUBLIC METHODS API ***/

  /*** 9.LOCAL METHODS ***/

  private handleClick = () => {
    this.itemSelected.emit({
      el: this.el,
      value: this.el.innerText
    });
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      this.itemSelected.emit({
        el: this.el,
        value: this.el.innerText
      });
    } else if (e.code === ARROW_UP || e.code === ARROW_DOWN) {
      e.preventDefault();
      this.focusChangeAttempt.emit({
        el: this.el,
        code: e.code
      });
    }
  };

  /*** 10.RENDER() FUNCTION ***/

  render() {
    return (
      <Host
        role="listitem"
        tabindex="0"
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
      >
        <slot name="icon"></slot>
        <div class="content-wrapper">
          <slot></slot>
        </div>
      </Host>
    );
  }
}

export type itemSelected = {
  el: HTMLChSuggestListItemElement;
  value: any;
};

export type focusChangeAttempt = {
  el: HTMLChSuggestListItemElement;
  code: ChSuggestKeyDownEvents;
};

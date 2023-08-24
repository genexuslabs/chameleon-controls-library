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
  shadow: { delegatesFocus: true }
})
export class ChSuggestListItem {
  /*
INDEX:
1.OWN PROPERTIES
2.REFERENCE TO ELEMENTS
3.STATE() VARIABLES
4.PUBLIC PROPERTY API / WATCH'S
5.EVENTS (EMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.PUBLIC METHODS API
9.LOCAL METHODS
10.RENDER() FUNCTION
*/

  // 1.OWN PROPERTIES //

  /**
   * The icon url
   */
  @Prop() readonly iconSrc: string;

  /**
   * The description
   */
  @Prop() readonly description: string;

  /**
   * The item value
   */
  @Prop() readonly value;

  // 2.REFERENCE TO ELEMENTS //

  @Element() el: HTMLChSuggestListItemElement;

  // 3.STATE() VARIABLES //

  // 4.PUBLIC PROPERTY API / WATCH'S //

  // 5.EVENTS (EMIT) //

  /**
   * This event is emitted every time the item is selected, either by clicking on it, or by pressing Enter.
   */
  @Event() itemSelected: EventEmitter<SuggestItemData>;

  /**
   * This event is emitted every time the item is about to lose focus, by pressing the "ArrowUp" or "ArrowDown" keyboard keys.
   */
  @Event() focusChangeAttempt: EventEmitter<FocusChangeAttempt>;

  // 6.COMPONENT LIFECYCLE EVENTS //

  // 7.LISTENERS //

  // 8.PUBLIC METHODS API //

  // 9.LOCAL METHODS //

  private handleClick = () => {
    this.itemSelected.emit({
      value: this.value || this.el.innerText,
      description: this.description
    });
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === ARROW_UP || e.code === ARROW_DOWN) {
      e.preventDefault();
      this.focusChangeAttempt.emit({
        el: this.el,
        code: e.code
      });
    }
  };

  // 10.RENDER() FUNCTION //

  render() {
    return (
      <Host role="listitem" onKeyDown={this.handleKeyDown}>
        <button part="button" onClick={this.handleClick}>
          <slot name="icon"></slot>
          <div class="content-wrapper" part="content-wrapper">
            <slot></slot>
            {this.description && (
              <span part="description">{this.description}</span>
            )}
          </div>
        </button>
      </Host>
    );
  }
}

export type SuggestItemData = {
  value: any;
  label?: string;
  description?: string;
  icon?: string;
};

export type FocusChangeAttempt = {
  el: HTMLChSuggestListItemElement;
  code: ChSuggestKeyDownEvents;
};

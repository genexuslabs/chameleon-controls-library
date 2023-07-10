import {
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  Element
} from "@stencil/core";

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

Code organization suggested by StencilJs:
https://stenciljs.com/docs/style-guide#code-organization
*/

  /** ******************************
   *  1.OWN PROPERTIES
   ********************************/

  /**
   * The icon url
   */
  @Prop() readonly iconSrc: string;

  /**
   * The presence of this property adds a class to the item, indicating that is currently selected.
   */
  @Prop({ reflect: true }) readonly selected: boolean;

  /** *****************************
   * 2. REFERENCE TO ELEMENTS
   ********************************/

  @Element() el: HTMLChSuggestListItemElement;

  /** *****************************
   *  3.STATE() VARIABLES
   ********************************/

  /** *****************************
   4.PUBLIC PROPERTY API
   ********************************/

  /** *****************************
   *  5.EVENTS (EMMIT)
   ********************************/

  @Event() itemSelected: EventEmitter<itemSelected>;
  @Event() focusChangeAttempt: EventEmitter<focusChangeAttempt>;

  /** *****************************
   *  6.COMPONENT LIFECYCLE EVENTS
   ********************************/

  /** *****************************
   *  7.LISTENERS
   ********************************/

  /** *****************************
   *  8.PUBLIC METHODS API
   ********************************/

  /** *****************************
   *  9.LOCAL METHODS
   ********************************/

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
    } else if (e.code === "ArrowUp" || e.code === "ArrowDown") {
      e.preventDefault();
      this.focusChangeAttempt.emit({
        el: this.el,
        setFocusOnPrev: e.code === "ArrowUp" ? true : false
      });
    }
  };

  /** *****************************
   *  10.RENDER() FUNCTION
   ********************************/

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
  setFocusOnPrev: boolean;
};

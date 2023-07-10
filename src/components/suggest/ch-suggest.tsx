/* STENCIL IMPORTS */
import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Listen,
  Watch,
  State
} from "@stencil/core";
/* OTHER LIBRARIES IMPORTS */
/* CUSTOM IMPORTS */
import {
  itemSelected,
  focusChangeAttempt
} from "./suggest-list-item/ch-suggest-list-item";
@Component({
  tag: "ch-suggest",
  styleUrl: "ch-suggest.scss",
  shadow: { delegatesFocus: true }
})
export class ChSuggest {
  /*
INDEX:
1.OWN PROPERTIES
2.REFERENCE TO ELEMENTS
3.STATE() VARIABLES
4.PUBLIC PROPERTY API
5.EVENTS (EMMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.WATCHS
9.PUBLIC METHODS API
10.LOCAL METHODS
11.RENDER() FUNCTION

Code organization suggested by StencilJs:
https://stenciljs.com/docs/style-guide#code-organization
*/

  /** ******************************
   *  1.OWN PROPERTIES
   ********************************/

  /**
   * The debounce amount in miliseconds (This is the time the suggest waits after the user has finished typing, to show the suggestions).
   */
  @Prop() readonly debounce = 500;

  /**
   * The label
   */
  @Prop() readonly label: string;

  /**
   * The input value
   */
  @Prop({ mutable: true }) value: string;

  private timeoutReference;

  /** *****************************
   * 2. REFERENCE TO ELEMENTS
   ********************************/
  @Element() el: HTMLChSuggestElement;
  private textInput!: HTMLInputElement;
  private chWindow!: HTMLChWindowElement;

  /** *****************************
   *  3.STATE() VARIABLES
   ********************************/

  @State() selectedItem: HTMLChSuggestListItemElement;

  /** *****************************
   4.PUBLIC PROPERTY API
   ********************************/

  /** *****************************
   *  5.EVENTS (EMMIT)
   ********************************/

  @Event() inputChanged: EventEmitter<string>;

  /** *****************************
   *  6.COMPONENT LIFECYCLE EVENTS
   ********************************/

  /** *****************************
   *  7.LISTENERS
   ********************************/

  @Listen("itemSelected")
  itemSelectedHandler(event: CustomEvent<itemSelected>) {
    this.selectedItem = event.detail.el;
    this.selectedItem.selected = true;
    this.value = event.detail.value;
    this.closeWindow();
  }

  @Listen("focusChangeAttempt")
  focusChangeAttemptHandler(event: CustomEvent<focusChangeAttempt>) {
    const currentFocusedItem = event.detail.el;
    const chSuggestListItemsArray = this.getChSuggestListItems();
    const currentFocusedItemIndex = chSuggestListItemsArray.findIndex(item => {
      return item === currentFocusedItem;
    });
    let newItemToSetFocusOn = null;
    if (event.detail.setFocusOnPrev) {
      if (currentFocusedItemIndex === 0) {
        newItemToSetFocusOn = this.textInput;
        this.scrollListToTop();
      } else {
        newItemToSetFocusOn =
          chSuggestListItemsArray[currentFocusedItemIndex - 1];
      }
    } else {
      if (currentFocusedItemIndex < chSuggestListItemsArray.length + 1) {
        newItemToSetFocusOn =
          chSuggestListItemsArray[currentFocusedItemIndex + 1];
        if (currentFocusedItemIndex === chSuggestListItemsArray.length - 2) {
          this.scrollListToBottom();
        }
      }
    }
    newItemToSetFocusOn && newItemToSetFocusOn.focus();
  }

  /** *****************************
   *  8.WATCHS
   ********************************/

  @Watch("value")
  watchValueHandler() {
    this.unselectItems();
    this.selectSelectedItem();
  }

  /** *****************************
   *  9.PUBLIC METHODS API
   ********************************/

  /** *****************************
   *  10.LOCAL METHODS
   ********************************/

  private unselectItems = (): void => {
    const selectedItems = this.el.querySelectorAll("ch-suggest-list-item");
    selectedItems.length &&
      selectedItems.forEach(selectedItem => {
        (selectedItem as HTMLChSuggestListItemElement).selected = false;
      });
  };

  private selectSelectedItem = (): void => {
    this.selectedItem && (this.selectedItem.selected = true);
  };

  private setFocusOnFirstItem = (): void => {
    const firstItem = this.el.querySelector("ch-suggest-list-item");
    firstItem && firstItem.focus();
  };

  private getChSuggestListItems = (): HTMLChSuggestListItemElement[] => {
    return Array.from(this.el.querySelectorAll("ch-suggest-list-item"));
  };

  private renderId = (): string => {
    return this.label ? this.label.toLocaleLowerCase().replace(" ", "-") : null;
  };

  private handleInput = (e: InputEvent): void => {
    if (this.timeoutReference) {
      clearTimeout(this.timeoutReference);
    }
    const value = (e.target as HTMLInputElement).value;
    this.timeoutReference = setTimeout(() => {
      this.setTimeoutHandler(value);
    }, this.debounce);
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.setFocusOnFirstItem();
    }
  };

  private evaluateWindowMaxHeight = (): void => {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const height =
      documentHeight >= viewportHeight ? documentHeight : viewportHeight;
    const inputBottomPosition =
      this.textInput.getBoundingClientRect().bottom + window.scrollY;
    const windowMaxHeight = height - inputBottomPosition + "px";
    this.el.style.setProperty("--window-max-height", windowMaxHeight);
  };

  private scrollListToTop = (): void => {
    const partWindow =
      this.chWindow.shadowRoot.querySelector("[part='window']");
    partWindow.scrollTop = 0;
  };

  private scrollListToBottom = (): void => {
    const partWindow =
      this.chWindow.shadowRoot.querySelector("[part='window']");
    partWindow.scrollTop = partWindow.scrollHeight;
  };

  private setTimeoutHandler = (targetValue: string): void => {
    this.evaluateWindowMaxHeight();
    this.chWindow.hidden = false;
    const value = targetValue;
    this.inputChanged.emit(value);
    this.value = value;
  };

  private closeWindow = (): void => {
    this.chWindow.hidden = true;
    this.textInput.focus();
  };

  /** *****************************
   *  11.RENDER() FUNCTION
   ********************************/

  render() {
    return (
      <Host>
        {this.label ? (
          <label htmlFor={this.renderId()} part="label">
            {this.label}
          </label>
        ) : null}
        <input
          type="text"
          id={this.renderId()}
          part="input"
          ref={el => (this.textInput = el as HTMLInputElement)}
          onInput={this.handleInput}
          onKeyDown={this.handleKeyDown}
          value={this.value}
          autocomplete="off"
        ></input>
        <ch-window
          container={this.textInput}
          close-on-outside-click
          close-on-escape
          xAlign="inside-start"
          yAlign="outside-end"
          ref={el => (this.chWindow = el as HTMLChWindowElement)}
          exportparts="
            caption:ch-window-caption, 
            close:ch-window-close,
            footer:ch-window-footer,
            header:ch-window-header,
            main:ch-window-main,
            mask:ch-window-mask,
            window:ch-window-window"
        >
          <slot></slot>
        </ch-window>
      </Host>
    );
  }
}

export type ChSuggestKeyDownEvents = "ArrowDown" | "ArrowUp" | "Escape";

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

const ARROW_DOWN = "ArrowDown";
const ARROW_UP = "ArrowUp";
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
4.PUBLIC PROPERTY API / WATCH'S
5.EVENTS (EMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.PUBLIC METHODS API
9.LOCAL METHODS
10.RENDER() FUNCTION
*/

  // 1.OWN PROPERTIES //
  private timeoutReference;

  private keyEventsDictionary: {
    [key in ChSuggestKeyDownEvents]: (
      eventData?: focusChangeAttemptEventData
    ) => void;
  } = {
    ArrowDown: (e: focusChangeAttemptEventData) => {
      const newFocusedItem = this.getNewFocusedItem(
        e.currentFocusedItem,
        ARROW_DOWN
      );
      const nextFocusedItem = this.getNewFocusedItem(
        newFocusedItem,
        ARROW_DOWN
      );
      newFocusedItem && newFocusedItem.focus();
      if (!nextFocusedItem) {
        /* This is the last item. Adjust window scroll to be at the very bottom*/
        this.scrollListToBottom();
      }
    },
    ArrowUp: (e: focusChangeAttemptEventData) => {
      const newFocusedItem = this.getNewFocusedItem(
        e.currentFocusedItem,
        ARROW_UP
      );
      const nextFocusedItem = this.getNewFocusedItem(newFocusedItem, ARROW_UP);
      newFocusedItem && newFocusedItem.focus();
      if (!nextFocusedItem) {
        /* This is the first item. Adjust window scroll to be at the very top*/
        this.scrollListToTop();
      }
    }
  };

  // 2. REFERENCE TO ELEMENTS //

  private textInput!: HTMLInputElement;
  private chWindow!: HTMLChWindowElement;
  @Element() el: HTMLChSuggestElement;

  // 3.STATE() VARIABLES //
  @State() windowHidden = true;

  // 4.PUBLIC PROPERTY API / WATCH'S //

  /**
   * The debounce amount in milliseconds (This is the time the suggest waits after the user has finished typing, to show the suggestions).
   */
  @Prop() readonly debounce: number = 500;

  /**
   * The label
   */
  @Prop() readonly label: string;

  /**
   * Whether or not to display the label
   */
  @Prop() readonly showLabel: boolean = false;

  /**
   * The input value
   */
  @Prop({ mutable: true }) value: string;

  /**
   * The suggest title (optional)
   */
  @Prop() readonly suggestTitle: string;

  @Watch("windowHidden")
  windowHiddenHandler(newValue: boolean) {
    if (newValue) {
      this.chWindow.hidden = true;
    } else {
      this.chWindow.hidden = false;
    }
  }

  @Watch("value")
  watchValueHandler(newValue: string) {
    this.inputChanged.emit(newValue);
  }

  // 5.EVENTS (EMIT) //

  /**
   * This event is emitted every time there input events fires, and it emits the actual input value.
   */
  @Event() inputChanged: EventEmitter<string>;

  // 6.COMPONENT LIFECYCLE EVENTS //

  // 7.LISTENERS //

  @Listen("itemSelected")
  itemSelectedHandler(event: CustomEvent<itemSelected>) {
    this.value = event.detail.value;
    this.closeWindow();
  }

  @Listen("focusChangeAttempt")
  focusChangeAttemptHandler(event: CustomEvent<focusChangeAttempt>) {
    const keyEventHandler:
      | ((event?: focusChangeAttemptEventData) => void)
      | undefined = this.keyEventsDictionary[event.detail.code];

    if (keyEventHandler) {
      const currentFocusedItem = event.detail.el;
      const chSuggestListItemsArray = this.getChSuggestListItems();
      const currentFocusedItemIndex = chSuggestListItemsArray.findIndex(
        item => {
          return item === currentFocusedItem;
        }
      );
      const newItemToSetFocusOn = null;

      keyEventHandler({
        event: event.detail,
        currentFocusedItem: currentFocusedItem,
        chSuggestListItemsArray: chSuggestListItemsArray,
        currentFocusedItemIndex: currentFocusedItemIndex,
        newItemToSetFocusOn: newItemToSetFocusOn
      });
    }
  }

  @Listen("windowClosed")
  windowClosedHandler() {
    this.textInput.focus();
    this.windowHidden = true;
  }

  // 9.PUBLIC METHODS API //

  // 10.LOCAL METHODS //

  private setFocusOnFirstItem = () => {
    const firstItem = this.el.querySelector("ch-suggest-list-item");
    firstItem && firstItem.focus();
  };

  private getChSuggestListItems = (): HTMLChSuggestListItemElement[] =>
    Array.from(this.el.querySelectorAll("ch-suggest-list-item"));

  private getNewFocusedItem = (
    currentFocusedItem: HTMLChSuggestListItemElement,
    direction: typeof ARROW_DOWN | typeof ARROW_UP
  ): HTMLChSuggestListItemElement => {
    /* Helper function that returns the list item that should get focus (the first one, or the last one)*/
    const getListChild = (list: HTMLChSuggestListElement) => {
      const listItems = list.querySelectorAll("ch-suggest-list-item");
      let listChild = listItems && listItems[listItems.length - 1];
      if (direction === ARROW_DOWN) {
        listChild = list.querySelector("ch-suggest-list-item");
      } else {
        const parentListItems = list.querySelectorAll("ch-suggest-list-item");
        listChild =
          parentListItems && parentListItems[parentListItems.length - 1];
      }
      return listChild;
    };

    if (!currentFocusedItem) {
      return;
    }
    let newFocusedItem =
      direction === ARROW_DOWN
        ? currentFocusedItem.nextElementSibling
        : currentFocusedItem.previousElementSibling;
    if (newFocusedItem?.nodeName === "CH-SUGGEST-LIST") {
      newFocusedItem = getListChild(newFocusedItem as HTMLChSuggestListElement);
    } else if (!newFocusedItem) {
      /* this could be the last item of a list, but not the last item*/
      const parent = currentFocusedItem.parentElement;
      const sibling =
        direction === ARROW_DOWN
          ? parent.nextElementSibling
          : parent.previousElementSibling;
      const parentIsList = parent.nodeName === "CH-SUGGEST-LIST";
      if (
        parentIsList &&
        sibling &&
        sibling.nodeName === "CH-SUGGEST-LIST-ITEM"
      ) {
        newFocusedItem =
          direction === ARROW_DOWN
            ? parent.nextElementSibling
            : parent.previousElementSibling;
      } else if (
        parentIsList &&
        sibling &&
        sibling.nodeName === "CH-SUGGEST-LIST"
      ) {
        const parentList =
          direction === ARROW_DOWN
            ? parent.nextElementSibling
            : parent.previousElementSibling;
        let listChild;
        if (direction === ARROW_DOWN) {
          listChild = parentList.querySelector("ch-suggest-list-item");
        } else {
          listChild = getListChild(parentList as HTMLChSuggestListElement);
        }
        newFocusedItem = listChild ? listChild : null;
      }
    }
    return newFocusedItem as HTMLChSuggestListItemElement;
  };

  /**
   * Every time the input event is triggered, the value of the input is sent to processInputEvent, which is responsible for displaying a window with the suggested options. this.debounce is a delay that, along with clearTimeout, ensures that the window is only shown after the user has stopped typing.
   */
  private handleInput = (e: InputEvent) => {
    if (this.timeoutReference) {
      clearTimeout(this.timeoutReference);
    }
    const value = (e.target as HTMLInputElement).value;
    this.timeoutReference = setTimeout(() => {
      this.processInputEvent(value);
    }, this.debounce);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ARROW_DOWN) {
      e.preventDefault();
      this.setFocusOnFirstItem();
    }
  };

  private evaluateWindowMaxHeight = () => {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const height =
      documentHeight >= viewportHeight ? documentHeight : viewportHeight;
    const inputBottomPosition =
      this.textInput.getBoundingClientRect().bottom + window.scrollY;
    const windowMaxHeight = height - inputBottomPosition + "px";
    this.el.style.setProperty("--window-max-height", windowMaxHeight);
  };

  private scrollListToTop = () => {
    const partWindow =
      this.chWindow.shadowRoot.querySelector("[part='window']");
    partWindow.scrollTop = 0;
  };

  private scrollListToBottom = () => {
    const partWindow =
      this.chWindow.shadowRoot.querySelector("[part='window']");
    partWindow.scrollTop = partWindow.scrollHeight;
  };

  private processInputEvent = (targetValue: string) => {
    this.evaluateWindowMaxHeight();
    if (this.windowHidden) {
      this.windowHidden = false;
    }
    this.value = targetValue;
  };

  private closeWindow = () => {
    this.windowHidden = true;
  };

  // 10.RENDER() FUNCTION //

  render() {
    return (
      <Host>
        <div class="wrapper">
          {this.showLabel && this.label && (
            <label id="label" htmlFor="input" part="label">
              {this.label}
            </label>
          )}
          <input
            type="text"
            id="input"
            part="input"
            class="input"
            ref={el => (this.textInput = el as HTMLInputElement)}
            onInput={this.handleInput}
            onKeyDown={this.handleKeyDown}
            value={this.value}
            autocomplete="off"
            aria-controls="ch-window"
            aria-label={!this.showLabel && this.label ? this.label : undefined}
            aria-labelledby={this.showLabel && this.label ? "label" : undefined}
            aria-expanded={this.windowHidden.toString()}
          ></input>
          <ch-window
            id="ch-window"
            container={this.textInput}
            close-on-outside-click
            close-on-escape
            xAlign="inside-start"
            yAlign="outside-end"
            ref={el => (this.chWindow = el as HTMLChWindowElement)}
            caption={this.suggestTitle}
            exportparts="
            header:header, 
            caption:title, 
            close:close-button,
            window:dropdown"
          >
            <slot></slot>
          </ch-window>
        </div>
      </Host>
    );
  }
}

export type ChSuggestKeyDownEvents = typeof ARROW_DOWN | typeof ARROW_UP;
type focusChangeAttemptEventData = {
  event: focusChangeAttempt;
  currentFocusedItem: HTMLChSuggestListItemElement;
  chSuggestListItemsArray: HTMLChSuggestListItemElement[];
  currentFocusedItemIndex: number;
  newItemToSetFocusOn: HTMLElement | null;
};

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
  State,
  Method
} from "@stencil/core";
/* OTHER LIBRARIES IMPORTS */
/* CUSTOM IMPORTS */
import {
  SuggestItemSelectedEvent,
  SuggestItemData,
  FocusChangeAttempt
} from "./suggest-list-item/ch-suggest-list-item";
import { SuggestListData } from "./suggest-list/ch-suggest-list";
import { LabelPosition } from "../../common/types";

const ARROW_DOWN = "ArrowDown";
const ARROW_UP = "ArrowUp";

/**
 * @deprecated Use the `ch-combo-box-render` with `suggest = true`
 */
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
      eventData?: FocusChangeAttemptEventData
    ) => void;
  } = {
    ArrowDown: (e: FocusChangeAttemptEventData) => {
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
    ArrowUp: (e: FocusChangeAttemptEventData) => {
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
  private slot!: HTMLSlotElement;
  @Element() el: HTMLChSuggestElement;

  // 3.STATE() VARIABLES //
  @State() windowHidden = true;

  // 4.PUBLIC PROPERTY API / WATCH'S //

  /**
   * The debounce amount in milliseconds (This is the time the suggest waits after the user has finished typing, to show the suggestions).
   */
  @Prop() readonly debounce: number = 300;

  /**
   * The label
   */
  @Prop() readonly label: string;

  /**
   * The label position
   */
  @Prop({ reflect: true }) readonly labelPosition: LabelPosition = "start";

  /**
   * Whether or not to display the label
   */
  @Prop() readonly showLabel: boolean = true;

  /**
   * This is the suggest value.
   */
  @Prop({ mutable: true }) value: string;

  /**
   * Wether or not the suggest has a header. The header will show the "suggestTitle" if provided, and a close button.
   */
  @Prop() readonly showHeader = false;

  /**
   * The suggest title (optional). This is not the same as the "label", rather, this is the title that will appear inside the dropdown. This title will only be visible if "showHeader" is set to true.
   */
  @Prop() readonly suggestTitle: string;

  /**
   * If true, it will position the cursor at the end when the input is focused.
   */
  @Prop() readonly cursorEnd = false;

  // 5.EVENTS (EMIT) //

  /**
   * This event is emitted every time there input events fires, and it emits the actual input value.
   */
  @Event() valueChanged: EventEmitter<string>;

  /**
   * This event is emitted when an item was selected.
   */
  @Event() selectionChanged: EventEmitter<SuggestItemSelectedEvent>;

  // 6.COMPONENT LIFECYCLE EVENTS //

  // 7.LISTENERS //

  @Listen("itemSelected", { capture: true })
  itemSelectedHandler(event: CustomEvent<SuggestItemSelectedEvent>) {
    event.stopPropagation();
    this.value = event.detail.value;
    this.closeWindow();
    this.selectionChanged.emit(event.detail);
  }

  @Listen("focusChangeAttempt")
  focusChangeAttemptHandler(event: CustomEvent<FocusChangeAttempt>) {
    const keyEventHandler:
      | ((event?: FocusChangeAttemptEventData) => void)
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
    this.slot.innerHTML = "";
  }

  // 9.PUBLIC METHODS API //

  /**
   * @description It selects/highlights the input text.
   */
  @Method()
  async selectInputText() {
    this.textInput.focus();
    this.textInput.select();
  }

  // 10.LOCAL METHODS //

  private evaluateSlotIsEmpty = () => {
    this.chWindow.hidden = !this.el.firstElementChild;
  };

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
      // @ts-expect-error: TODO: Fix this error
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
    const inputValue = (e.target as HTMLInputElement).value;
    this.value = inputValue;
    if (this.timeoutReference) {
      clearTimeout(this.timeoutReference);
    }
    this.timeoutReference = setTimeout(() => {
      this.processInputEvent(inputValue);
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

  private processInputEvent = (inputValue: string) => {
    this.valueChanged.emit(inputValue);
    this.evaluateWindowMaxHeight();
  };

  private closeWindow = () => {
    this.chWindow.hidden = true;
  };

  private onFocusHandler = () => {
    if (this.cursorEnd) {
      this.textInput.setSelectionRange(
        this.textInput.value.length,
        this.textInput.value.length
      );
    }
  };

  // 10.RENDER() FUNCTION //

  render() {
    return (
      <Host>
        <div class="main-wrapper" part="main-wrapper">
          <div class="label-input-wrapper" part="label-input-wrapper">
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
              onFocus={this.onFocusHandler}
              value={this.value}
              autocomplete="off"
              aria-controls="ch-window"
              aria-label={
                !this.showLabel && this.label ? this.label : undefined
              }
              aria-labelledby={
                this.showLabel && this.label ? "label" : undefined
              }
              aria-expanded={this.windowHidden.toString()}
            ></input>
          </div>

          <ch-window
            id="ch-window"
            container={this.textInput}
            close-on-outside-click
            close-on-escape
            xAlign="inside-start"
            yAlign="outside-end"
            ref={el => (this.chWindow = el as HTMLChWindowElement)}
            showHeader={this.showHeader}
            caption={this.suggestTitle}
            exportparts="
            header:header, 
            caption:title, 
            close:close-button,
            window:dropdown"
          >
            <slot
              onSlotchange={this.evaluateSlotIsEmpty}
              ref={el => (this.slot = el as HTMLSlotElement)}
            ></slot>
          </ch-window>
        </div>
      </Host>
    );
  }
}

/**
 * @deprecated Use the `ch-combo-box-render` with `suggest = true`
 */
export type ChSuggestKeyDownEvents = typeof ARROW_DOWN | typeof ARROW_UP;
type FocusChangeAttemptEventData = {
  event: FocusChangeAttempt;
  currentFocusedItem: HTMLChSuggestListItemElement;
  chSuggestListItemsArray: HTMLChSuggestListItemElement[];
  currentFocusedItemIndex: number;
  newItemToSetFocusOn: HTMLElement | null;
};

/**
 * @deprecated Use the `ch-combo-box-render` with `suggest = true`
 */
export type SuggestData = {
  suggestItems: SuggestItemData[];
  suggestLists: SuggestListData[];
};

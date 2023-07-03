import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Listen
} from "@stencil/core";

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
   * The label
   */
  @Prop() readonly label: string;

  /**
   * The input value
   */
  @Prop({ mutable: true }) value: string;

  /** *****************************
   * 2. REFERENCE TO ELEMENTS
   ********************************/
  @Element() el: HTMLChSuggestElement;
  private textInput!: HTMLInputElement;
  private chWindowContainer!: HTMLElement;
  private chWindow!: HTMLChWindowElement;

  /** *****************************
   *  3.STATE() VARIABLES
   ********************************/

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

  componentDidLoad(): void {
    this.chWindow.container = this.chWindowContainer;
  }

  /** *****************************
   *  7.LISTENERS
   ********************************/
  @Listen("keydown")
  keydownHandler(event: KeyboardEvent) {
    const tagName = (event.target as HTMLElement).tagName;
    if (
      event.code === "ArrowUp" ||
      event.code === "ArrowDown" ||
      event.code === "Enter" ||
      event.code === "Tab"
    ) {
      const availableListItems = this.el.querySelectorAll(
        "ch-suggest-list-item"
      );
      if (availableListItems.length) {
        /*Only do something if there are ch-suggest-list-items to navigate*/
        if (tagName === "CH-SUGGEST-LIST-ITEM") {
          if (event.code === "Enter") {
            this.unselectCurrentItem();
            this.value = (event.target as HTMLElement).innerText;
            this.chWindow.hidden = true;
            this.textInput.focus();
          } else {
            const selectedItemIndex = Array.from(availableListItems).findIndex(
              item => {
                return item.hasAttribute("selected");
              }
            );
            if (selectedItemIndex !== -1) {
              if (event.code === "ArrowUp") {
                this.unselectCurrentItem();
                if (selectedItemIndex === 0) {
                  this.textInput.focus();
                } else {
                  availableListItems[selectedItemIndex - 1].focus();
                  availableListItems[selectedItemIndex - 1].setAttribute(
                    "selected",
                    ""
                  );
                }
              } else if (event.code === "ArrowDown") {
                if (selectedItemIndex + 1 < availableListItems.length) {
                  this.unselectCurrentItem();
                  availableListItems[selectedItemIndex + 1].focus();
                  availableListItems[selectedItemIndex + 1].setAttribute(
                    "selected",
                    ""
                  );
                }
              }
            }
          }
        } else if (tagName === "CH-SUGGEST") {
          if (event.code === "ArrowDown" || event.code === "Tab") {
            event.preventDefault();
            availableListItems[0].focus();
            availableListItems[0].setAttribute("selected", "");
          }
        }
      }
    }
  }

  @Listen("itemClicked")
  itemClickedHandler(event: CustomEvent<boolean>) {
    this.unselectCurrentItem();
    const target = event.target;
    (target as unknown as HTMLElement).setAttribute("selected", "");
  }

  /** *****************************
   *  8.PUBLIC METHODS API
   ********************************/

  /** *****************************
   *  9.LOCAL METHODS
   ********************************/

  private unselectCurrentItem = () => {
    const currentSelectedItem = this.el.querySelector(
      "ch-suggest-list-item[selected]"
    );
    if (currentSelectedItem) {
      currentSelectedItem.removeAttribute("selected");
    }
  };

  private renderId = (): string => {
    return this.label ? this.label.toLocaleLowerCase().replace(" ", "-") : null;
  };

  private handleInput = (e): void => {
    this.chWindow.hidden = false;
    const value = e.target.value;
    this.inputChanged.emit(value);
    this.value = value;
  };

  /** *****************************
   *  10.RENDER() FUNCTION
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
          value={this.value}
          autocomplete="off"
        ></input>
        <div
          class="ch-window-container"
          part="ch-window-container"
          ref={el => (this.chWindowContainer = el as HTMLElement)}
        >
          <ch-window
            close-on-outside-click
            close-on-escape
            x-align="inside-start"
            y-align="inside-start"
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
        </div>
      </Host>
    );
  }
}

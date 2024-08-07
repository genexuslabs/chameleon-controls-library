/* eslint-disable @stencil-community/required-jsdoc */
import {
  Component,
  Host,
  h,
  Event,
  EventEmitter,
  Element,
  Prop
} from "@stencil/core";

@Component({
  tag: "ch-select-option",
  styleUrl: "ch-select-option.scss",
  shadow: true
})
export class ChSelectItem {
  /*
   * The select's option height (optional)
   */
  @Prop() readonly height: string;
  /**
   * Set the left side icon
   */
  @Prop() readonly leftIconSrc: string;
  /**
   * Set the right side icon
   */
  @Prop() readonly rightIconSrc: string;
  /**
   * Determines the selected option
   */
  @Prop({ reflect: true }) readonly selected: boolean;
  /**
   * Determines if the option is disabled
   */
  @Prop({ reflect: true }) readonly disabled: boolean;
  /**
   * If enabled, the option icons will display its inherent/natural color
   */
  @Prop({ reflect: true }) readonly autoColor = true;
  /**
   * The select option's value
   */
  @Prop({ reflect: true }) readonly value: string;
  /**
   * Emits the item id
   */
  @Event() itemClicked: EventEmitter;

  @Element() el: HTMLChSelectOptionElement;

  private selectOption?: HTMLDivElement;

  componentDidRender() {
    if (this.el.hasAttribute("disabled")) {
      this.selectOption.setAttribute("disabled", "");
    }
    if (this.el.hasAttribute("selected")) {
      this.selectOption.classList.add("option-selected");
      const selectedOptionText: HTMLElement =
        this.el.parentElement.shadowRoot.querySelector("span.text");
      selectedOptionText.innerHTML = this.el.innerHTML;
    }
  }

  optionClickedHandler(event) {
    const targetOption = event.el.value;
    if (!event.disabled) {
      this.setActiveOption(targetOption);
      this.itemClicked.emit({ "option-value": targetOption });
    }
  }

  setActiveOption(targetItem) {
    const parent: any = this.el.parentElement;
    const selectItems: NodeListOf<HTMLChSelectOptionElement> = parent.children;
    let optionText = "";

    for (let i = 0; i < selectItems.length; i++) {
      const item: any = selectItems[i].shadowRoot.lastChild;
      // remove old item selected class
      if (item.classList.contains("option-selected")) {
        item.classList.remove("option-selected");
      }
      selectItems[i].removeAttribute("aria-selected");
      // remove pre-selection attribute
      selectItems[i].removeAttribute("selected");
      // set active item class
      if (selectItems[i].value === targetItem.trim()) {
        item.classList.add("option-selected");
        selectItems[i].setAttribute("aria-selected", "true");
        optionText = selectItems[i].innerHTML;
      }
    }
    // update selected option text in select
    const selectedOptionText: HTMLElement =
      this.el.parentElement.shadowRoot.querySelector("span.text");
    selectedOptionText.innerHTML = optionText;
  }

  resolveLeftIcon() {
    if (this.leftIconSrc !== undefined) {
      return this.leftIconSrc;
    }
    return "";
  }

  resolveRightIcon() {
    if (this.rightIconSrc !== undefined) {
      return this.rightIconSrc;
    }
    return "";
  }

  render() {
    return (
      <Host
        class="option"
        role="option"
        value={this.value}
        onClick={() => this.optionClickedHandler(this)}
      >
        <div
          class="option"
          exportparts="option-text: select-option"
          ref={el => (this.selectOption = el as HTMLDivElement)}
          style={{ height: this.height }}
        >
          <div class="left-container">
            {this.leftIconSrc && (
              <span class="icon left-icon">
                <ch-icon
                  src={this.resolveLeftIcon()}
                  style={{
                    "--icon-size": "20px",
                    "--icon-color": `var(--first-list-icon-color)`
                  }}
                  auto-color={this.autoColor}
                ></ch-icon>
              </span>
            )}
            <span class="text" part="option-text">
              <slot></slot>
            </span>
          </div>
          {this.rightIconSrc && (
            <span class="icon right-icon">
              <ch-icon
                src={this.resolveRightIcon()}
                style={{
                  "--icon-size": "20px",
                  "--icon-color": `var(--first-list-icon-color)`
                }}
                auto-color={this.autoColor}
              ></ch-icon>
            </span>
          )}
        </div>
      </Host>
    );
  }
}

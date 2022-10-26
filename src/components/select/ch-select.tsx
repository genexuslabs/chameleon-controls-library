import {
  Component,
  Element,
  h,
  Prop,
  getAssetPath,
  State,
  Event,
  EventEmitter,
  Listen,
} from "@stencil/core";

import { ClickOutside } from "stencil-click-outside";

@Component({
  tag: "ch-select",
  styleUrl: "ch-select.scss",
  shadow: true,
  assetsDirs: ["select-assets"],
})
export class ChSelect {
  private selectWidth = 0;
  private selectHeight = 0;
  private selectOptions: Array<any> = [];
  private optionSelected = "";
  private arrowTop: string = getAssetPath(`./select-assets/arrow-top.svg`);

  /*
    Text to show in the select box when not selected option
    */
  @Prop() name: string;
  /*
   * The select icon (optional)
   */
  @Prop() iconSrc: string;
  /*
   * The select arrow icon (optional)
   */
  @Prop() arrowIconSrc: string;
  /**
   * If enabled, the icon will display its inherent/natural color
   */
  @Prop({ reflect: true }) autoColor = false;
  /*
   * The select width (optional)
   */
  @Prop() width: string;
  /*
   * The select height (optional)
   */
  @Prop() height: string;
  /*
   * The select's option height (optional)
   */
  @Prop() optionHeight: string;
  /*
   * This will track state changes (whether the
   * dropdown component is open or closed)
   */
  @State() toggle: boolean = false;

  /**
   * @type EventEmitter
   *
   * Track component events (I.e. activation of dropdown component)
   */
  @Event() onToggle: EventEmitter;

  /**
   * Emmits the item id
   */
  @Event() optionClickedEvent: EventEmitter;

  @Element() el: HTMLChSelectElement;

  componentWillRender() {
    //load select options to render
    for (var i = 0; i < this.el.children.length; i++) {
      if (!this.selectOptions.includes(this.el.children[i]))
        this.selectOptions.push(this.el.children[i]);
      for (var j = 0; j < this.el.children[i].attributes.length; j++) {
        if (this.el.children[i].attributes[j].name === "selected") {
          this.optionSelected = this.el.children[i].innerHTML;
        }
      }
    }
  }

  componentDidLoad() {
    const selectItems: HTMLElement =
      this.el.shadowRoot.querySelector(".select-options");

    let heightValueStr = "";
    let heightValue = 0;
    if (this.height !== "" && this.height) {
      heightValueStr = this.height;
      //selectBox height
      if (this.height.includes("%")) {
        heightValueStr = "100%";
      } else {
        heightValueStr = this.height;
        heightValueStr = heightValueStr.split("px")[0];
        heightValue = Number(heightValueStr);
        var elmt: HTMLElement =
          this.el.shadowRoot.querySelector(".list-container");
        elmt.style.height = heightValue + "px";
      }
    } else {
      //default height: 32px
      heightValue = 32;
    }
    //option's height
    let optionHeightStr = "";
    let optionHeight = 0;
    if (this.optionHeight !== "" && this.optionHeight) {
      optionHeightStr = this.optionHeight;
      optionHeightStr = optionHeightStr.split("px")[0];
      optionHeight = Number(optionHeightStr);
      var optionElmts: NodeListOf<HTMLElement> =
        this.el.shadowRoot.querySelectorAll(".option");
      for (var f = 0; f < optionElmts.length; f++) {
        optionElmts[f].style.height = optionHeight + "px";
        optionElmts[f].style.lineHeight = optionHeight + "px";
      }
    } else {
      //default option height: 32px
      optionHeight = 32;
    }

    //get all options
    const options = selectItems.children;
    for (var i = 0; i < options.length; i++) {
      //calculate selectBox's height based on items quantity and optionHeight property
      this.selectHeight = this.selectHeight + optionHeight;
      //set active option class
      if (options[i].innerHTML === this.optionSelected)
        options[i].classList.add("option-selected");
    }
    //set selectBox height
    selectItems.style.height = this.selectHeight + "px";

    //set select width based on the wider item of the selectBox
    var selectBoxWidth = selectItems.getBoundingClientRect().width;
    selectBoxWidth = Math.round(selectBoxWidth * 100) / 100;
    this.selectWidth = selectBoxWidth;

    if (this.width !== "" && this.width) {
      this.el.style.width = this.width;
      //selectBox width
      if (this.width.includes("%")) {
        selectItems.style.width = "100%";
      } else {
        selectItems.style.width = this.width;
      }
    } else {
      //add an extra space for the up/down arrow
      this.selectWidth = this.selectWidth + 20;
      //add an extra space for the icon, if it's used
      if (this.resolveIcon() !== "") {
        this.selectWidth = this.selectWidth + 20;
      }
      this.el.style.width = this.selectWidth + "px";
      selectItems.style.width = this.selectWidth + "px";
    }

    //calculate position
    const top: number = this.el.getBoundingClientRect().top;
    const totalFromTop = top + this.selectHeight + heightValue;
    if (window.innerHeight - totalFromTop > 0) {
      this.el.style.position = "relative";
    } else {
      var listContainer: HTMLElement =
        this.el.shadowRoot.querySelector(".select-options");
      listContainer.style.position = "unset";
    }
  }

  @Listen("keydown", { passive: true })
  handleKeyDown(ev: KeyboardEvent) {
    switch (ev.key) {
      case " ":
        this.toggleComponent();
        break;
      case "ArrowDown" || "ArrowUp":
        //todo
        break;
      default:
        break;
    }
  }

  @ClickOutside()
  closeSelect() {
    //close the select when user clicks outside of component area.
    if (this.toggle) this.toggleComponent();
  }

  optionClickedHandler(event) {
    const targetOption = event.currentTarget.id;
    this.toggleComponent();
    this.setActiveOption(targetOption);
    this.optionClickedEvent.emit({ "option-value": targetOption });
  }

  setActiveOption(targetOption) {
    const selectItems: HTMLElement =
      this.el.shadowRoot.querySelector(".select-options");
    var optionText = "";
    //get all options
    const options = selectItems.children;
    for (var i = 0; i < options.length; i++) {
      //remove old option's selected class
      if (options[i].classList.contains("option-selected"))
        options[i].classList.remove("option-selected");
      //set active option class
      if (options[i].id === targetOption) {
        options[i].classList.add("option-selected");
        optionText = options[i].innerHTML;
      }
    }
    //update selected option text in select-container
    const selectedOptionText: HTMLElement =
      this.el.shadowRoot.querySelector("span.text");
    selectedOptionText.innerHTML = optionText;
  }

  /*
   * This will manage the dropdown component event and state changes
   */
  toggleComponent(): void {
    this.toggle = !this.toggle;
    // When the user click emit the toggle state value
    this.onToggle.emit({ visible: this.toggle });
  }

  resolveIcon() {
    if (this.iconSrc !== undefined) {
      return this.iconSrc;
    } else {
      return "";
    }
  }

  resolveArrowIcon() {
    if (this.arrowIconSrc !== undefined) {
      return this.arrowIconSrc;
    } else {
      return this.arrowTop;
    }
  }

  render() {
    return (
      <div
        class={
          this.toggle
            ? "select-container uncollapsed"
            : "select-container collapsed"
        }
      >
        <div class="list-container" onClick={() => this.toggleComponent()}>
          <div class="left-container">
            <span class="icon custom-icon">
              <ch-icon
                src={this.resolveIcon()}
                style={{
                  "--select-icon-size": "var(--icon-size)",
                  "--select-icon-color": `var(--icon-color)`,
                }}
              ></ch-icon>
            </span>
            <span class="text">
              {this.optionSelected ? this.optionSelected : this.name}
            </span>
          </div>
          <span class="icon arrow-icon">
            <div part="collapse-icon"></div>
          </span>
        </div>
        <div
          class={
            this.toggle ? "select-options active" : "select-options inactive"
          }
        >
          {this.selectOptions.map((option) => (
            <div
              id={option.value}
              class="option"
              onClick={this.optionClickedHandler.bind(this)}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

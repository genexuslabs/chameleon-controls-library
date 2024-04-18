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
  Host
} from "@stencil/core";

import { ClickOutside } from "stencil-click-outside";

@Component({
  tag: "ch-select",
  styleUrl: "ch-select.scss",
  shadow: true,
  assetsDirs: ["select-assets"]
})
export class ChSelect {
  private optionSelected = "";
  private arrowTop: string = getAssetPath(`./select-assets/arrow-top.svg`);

  /*
    Text to show in the select box when not selected option
    */
  @Prop() readonly name: string;
  /*
   * The select icon (optional)
   */
  @Prop() readonly iconSrc: string;
  /*
   * The select arrow icon (optional)
   */
  @Prop() readonly arrowIconSrc: string;
  /**
   * If enabled, the icon will display its inherent/natural color
   */
  @Prop({ reflect: true }) readonly autoColor = false;
  /*
   * Disables the select
   */
  @Prop() readonly disabled: boolean;
  /*
   * The select width (optional)
   */
  @Prop() readonly width: string;
  /*
   * The select height (optional)
   */
  @Prop() readonly height: string;
  /*
   * This will track state changes (whether the
   * dropdown component is open or closed)
   */
  @State() toggle = false;

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

  //test
  private optionsContainerEl?: HTMLDivElement;
  private selectContainerEl?: HTMLDivElement;
  private selectFlexContainerEl?: HTMLDivElement;
  private ro: ResizeObserver;

  componentDidLoad() {
    this.ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.calculateSelectWidth(entry.contentBoxSize[0].inlineSize);
        this.calculateSelectHeight();
      }
    });
    this.ro.observe(this.el);
    this.ro.observe(this.optionsContainerEl);
  }

  calculateSelectWidth(width) {
    if (width !== 0) this.selectContainerEl.style.width = width + "px";
  }

  calculateSelectHeight() {
    if (this.height !== "" && this.height) {
      this.selectFlexContainerEl.style.height = this.height;
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

  @Listen("itemClicked")
  optionClickedHandler(event) {
    const targetOption = event.currentTarget.id;
    this.toggleComponent();
    this.optionClickedEvent.emit({ "option-value": targetOption });
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
      <Host
        aria-label={this.name}
        role="listbox"
        aria-expanded={this.toggle ? "true" : "false"}
        tabindex="0"
      >
        <div
          ref={el => (this.selectContainerEl = el as HTMLDivElement)}
          class={
            this.toggle
              ? "select-container uncollapsed"
              : "select-container collapsed"
          }
        >
          <div
            class="list-container"
            part="select-box"
            onClick={() => this.toggleComponent()}
            ref={el => (this.selectFlexContainerEl = el as HTMLDivElement)}
          >
            <div class="left-container">
              {this.iconSrc && (
                <span class="icon custom-icon">
                  <ch-icon
                    src={this.resolveIcon()}
                    style={{
                      "--select-icon-size": "var(--icon-size)",
                      "--select-icon-color": `var(--icon-color)`
                    }}
                  ></ch-icon>
                </span>
              )}
              <span class="text">
                {this.optionSelected ? this.optionSelected : this.name}
              </span>
            </div>
            <span class="icon arrow-icon">
              <div part="collapse-icon"></div>
            </span>
          </div>
        </div>

        <div
          ref={el => (this.optionsContainerEl = el as HTMLDivElement)}
          class={
            this.toggle ? "select-options active" : "select-options inactive"
          }
          part="select-options"
        >
          <slot></slot>
        </div>
      </Host>
    );
  }
}

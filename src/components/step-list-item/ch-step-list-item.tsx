import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  getAssetPath,
} from "@stencil/core";

@Component({
  tag: "ch-step-list-item",
  styleUrl: "ch-step-list-item.scss",
  shadow: true,
  assetsDirs: ["step-list-item-assets"],
})
export class ChStepListItem {
  /**
   * Set the left side icon
   */
  @Prop() iconSrc: string;

  /**
   * Emits the item id
   */
  @Event() itemClicked: EventEmitter;

  @Element() el: HTMLChStepListItemElement;
  ulStepItem!: HTMLElement;

  itemClickedHandler(item) {
    const targetItem = item.el.innerText;
    this.setActiveOption(targetItem);
    this.itemClicked.emit({ "item-clicked": targetItem });
  }

  setActiveOption(targetItem) {
    const parent: any = this.el.parentElement;
    const stepItems: NodeListOf<HTMLElement> = parent.children;

    for (var i = 0; i < stepItems.length; i++) {
      const item: any = stepItems[i].shadowRoot.lastChild.childNodes[0];

      //remove old item selected class
      if (item.classList.contains("li-item--active"))
        item.classList.remove("li-item--active");
      //set active item class
      if (stepItems[i].innerText === targetItem) {
        item.classList.add("li-item--active");
      }
    }
  }

  resolveIcon() {
    if (this.iconSrc !== undefined) {
      return this.iconSrc;
    } else {
      return getAssetPath("step-list-item-assets/dot.svg");
    }
  }

  render() {
    return (
      <Host class="item" style={{ width: "100%" }}>
        <li
          class={
            {
              //"tree-open": this.opened,
              //disabled: this.disabled,
            }
          }
        >
          <div
            class={{
              "li-item": true,
              //"li-text--selected": this.selected,
            }}
          >
            <span class="text" onClick={() => this.itemClickedHandler(this)}>
              <slot></slot>
            </span>

            <div
              class="round-tab"
              onClick={() => this.itemClickedHandler(this)}
            >
              <ch-icon
                class="item-icon"
                src={this.resolveIcon()}
                auto-color="auto"
                style={
                  {
                    //"--icon-size": '22px',
                  }
                }
              ></ch-icon>
            </div>

            <span
              class={{
                "horizontal-line": true,
              }}
            ></span>
          </div>
        </li>
      </Host>
    );
  }
}

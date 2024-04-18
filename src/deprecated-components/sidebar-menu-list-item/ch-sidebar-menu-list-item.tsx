import {
  Component,
  Element,
  Host,
  h,
  State,
  Prop,
  Event,
  EventEmitter
} from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu-list-item",
  styleUrl: "ch-sidebar-menu-list-item.scss",
  shadow: true,
  assetsDirs: ["sidebar-menu-list-item-assets"]
})
export class ChSidebarMenuListItem {
  /**
   * Emmits the item id
   */
  @Event() itemClickedEvent: EventEmitter;

  @Element() el: HTMLChSidebarMenuListItemElement;

  /**
   * The first list item icon (optional)
   */
  @Prop() readonly itemIconSrc: string;
  /**
   * If enabled, the icon will display its inherent/natural color
   */
  @Prop({ reflect: true }) readonly autoColor: boolean = false;

  /**
   * If this attribute is present the item will be initially uncollapsed
   */
  @Prop() readonly uncollapsed: boolean = false;

  @State() collapsable = false;
  @State() listTypeItem: string;

  componentWillLoad() {
    //SET THE TPYE OF ITEM
    if (this.el.parentElement.classList.contains("list-one")) {
      this.listTypeItem = "one";
    } else if (this.el.parentElement.classList.contains("list-two")) {
      this.listTypeItem = "two";
    } else {
      this.listTypeItem = "three";
    }
    //SET COLLAPSABLE OR NOT
    if (this.el.querySelector("ch-sidebar-menu-list") !== null) {
      this.collapsable = true;
    }
  }

  itemClicked() {
    const itemId = this.el.getAttribute("id");
    this.itemClickedEvent.emit({ "item-id": itemId });
  }

  firstListItemIcon() {
    if (this.itemIconSrc !== undefined) {
      return this.itemIconSrc;
    }
  }

  listItemContent() {
    if (this.listTypeItem === "one")
      return [
        <div class="main-container" onClick={this.itemClicked.bind(this)}>
          <div class="left-container">
            <span class="icon custom-icon">
              <ch-icon
                src={this.firstListItemIcon()}
                style={{
                  "--icon-size": "20px",
                  "--icon-color": `var(--first-list-icon-color)`
                }}
                auto-color={this.autoColor}
              ></ch-icon>
            </span>
            <span class="text">
              <slot></slot>
            </span>
          </div>
          {this.collapsable ? (
            <span class="icon arrow-icon">
              <div part="collapse-item-icon"></div>
            </span>
          ) : null}
        </div>,
        <slot name="list"></slot>
      ];
    if (this.listTypeItem === "two")
      return [
        <div class="main-container" onClick={this.itemClicked.bind(this)}>
          {this.collapsable ? (
            <span class="icon arrow-icon">
              <div part="collapse-item2-icon"></div>
            </span>
          ) : null}
          <span class="text">
            <slot></slot>
          </span>
        </div>,
        <slot name="list"></slot>
      ];
    if (this.listTypeItem === "three")
      return (
        <div class="main-container" onClick={this.itemClicked.bind(this)}>
          <span class="text">
            <slot></slot>
          </span>
        </div>
      );
  }

  render() {
    return (
      <Host
        class={{
          item: true,
          collapsable: this.collapsable,
          uncollapsed: this.uncollapsed,
          "list-one__item": this.listTypeItem === "one",
          "list-two__item": this.listTypeItem === "two",
          "list-three__item": this.listTypeItem === "three"
        }}
      >
        {this.listItemContent()}
      </Host>
    );
  }
}

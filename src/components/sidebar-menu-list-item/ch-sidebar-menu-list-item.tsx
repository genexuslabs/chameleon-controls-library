import {
  Component,
  Element,
  Host,
  h,
  getAssetPath,
  State,
  Prop,
  Event,
  EventEmitter,
} from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu-list-item",
  styleUrl: "ch-sidebar-menu-list-item.scss",
  shadow: true,
  assetsDirs: ["sidebar-menu-list-item-assets"],
})
export class ChSidebarMenuListItem {
  /**
   * Emmits the item id
   */
  @Event() itemClickedEvent: EventEmitter;

  private listOneIcon: string = getAssetPath(
    `./sidebar-menu-list-item-assets/projects.svg`
  );
  private arrowTop: string = getAssetPath(
    `./sidebar-menu-list-item-assets/arrow-top.svg`
  );
  private arrowRight: string = getAssetPath(
    `./sidebar-menu-list-item-assets/arrow-right.svg`
  );

  @Element() el: HTMLChSidebarMenuListItemElement;

  /**
   * The first list item icon (optional)
   */
  @Prop() itemIconSrc: string;

  /**
   * If this attribute is present the item will be initially uncollapsed
   */
  @Prop() uncollapsed: boolean = false;

  @State() collapsable: boolean = false;
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
    const chSidebarMenu = document.querySelector("ch-sidebar-menu");
    const menu = chSidebarMenu.shadowRoot.getElementById("menu");
    if (!menu.classList.contains("collapsed")) {
      const itemId = this.el.getAttribute("id");
      this.itemClickedEvent.emit({ "item-id": itemId });
    }
  }

  firstListItemIcon() {
    if (this.itemIconSrc !== undefined) {
      return this.itemIconSrc;
    } else {
      return this.listOneIcon;
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
                  "--icon-color": `var(--first-list-icon-color)`,
                }}
              ></ch-icon>
            </span>
            <span class="text">
              <slot></slot>
            </span>
          </div>
          {this.collapsable ? (
            <span class="icon arrow-icon">
              <ch-icon
                src={this.arrowTop}
                style={{
                  "--icon-size": "20px",
                  "--icon-color": `var(--first-list-arrow-color)`,
                }}
              ></ch-icon>
            </span>
          ) : null}
        </div>,
        <slot name="list"></slot>,
      ];
    if (this.listTypeItem === "two")
      return [
        <div class="main-container" onClick={this.itemClicked.bind(this)}>
          {this.collapsable ? (
            <span class="icon arrow-icon">
              <ch-icon
                src={this.arrowRight}
                style={{
                  "--icon-size": "20px",
                  "--icon-color": `var(--second-list-arrow-color)`,
                }}
              ></ch-icon>
            </span>
          ) : null}
          <span class="text">
            <slot></slot>
          </span>
        </div>,
        <slot name="list"></slot>,
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
          "list-three__item": this.listTypeItem === "three",
        }}
      >
        {this.listItemContent()}
      </Host>
    );
  }
}

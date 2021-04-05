import {
  Component,
  Element,
  Host,
  h,
  getAssetPath,
  State,
} from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu-list-item",
  styleUrl: "ch-sidebar-menu-list-item.scss",
  shadow: true,
  assetsDirs: ["assets"],
})
export class ChSidebarMenuListItem {
  private listOneIcon: string = getAssetPath(`./assets/projects.svg`);
  private arrowTop: string = getAssetPath(`./assets/arrow-top.svg`);
  private arrowRight: string = getAssetPath(`./assets/arrow-right.svg`);

  @Element() el: HTMLChSidebarMenuListItemElement;

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

  listItemContent() {
    if (this.listTypeItem === "one")
      return [
        <div class="main-container">
          <div class="left-container">
            <span class="icon custom-icon">
              <ch-icon
                src={this.listOneIcon}
                style={{ "--icon-size": "20px" }}
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
                style={{ "--icon-size": "20px" }}
              ></ch-icon>
            </span>
          ) : null}
        </div>,
        <slot name="list"></slot>,
      ];
    if (this.listTypeItem === "two")
      return [
        <div class="main-container">
          {this.collapsable ? (
            <span class="icon arrow-icon">
              <ch-icon
                src={this.arrowRight}
                style={{ "--icon-size": "20px" }}
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
        <div class="main-container">
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

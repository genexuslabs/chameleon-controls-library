import { Component, Element, Host, h, State } from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu-list",
  styleUrl: "ch-sidebar-menu-list.scss",
  shadow: true
})
export class ChSidebarMenuList {
  @Element() el: HTMLChSidebarMenuListElement;

  /** *****************
   * STATE
   *******************/
  @State() listType = "list-one";

  componentWillLoad() {
    /*
    Set the type of list
    list-three : has two parent lists
    list-two : has one parent list
    list-one : has no parent lists. It is the main list (this is the default)
    */
    if (this.el.parentNode.parentElement !== null) {
      if (
        this.el.parentNode.parentElement.nodeName === "CH-SIDEBAR-MENU-LIST"
      ) {
        this.listType = "list-two";
      }
    }
    if (this.el.parentNode.parentElement.parentElement.parentElement !== null) {
      if (
        this.el.parentNode.parentElement.parentNode.parentElement.nodeName ===
        "CH-SIDEBAR-MENU-LIST"
      ) {
        this.listType = "list-three";
      }
    }
  }

  render() {
    return (
      <Host
        class={{
          "list-one": this.listType === "list-one",
          "list-two": this.listType === "list-two",
          "list-three": this.listType === "list-three"
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}

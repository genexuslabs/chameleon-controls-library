import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu-list",
  styleUrl: "ch-sidebar-menu-list.scss",
  shadow: true,
})
export class ChSidebarMenuList {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}

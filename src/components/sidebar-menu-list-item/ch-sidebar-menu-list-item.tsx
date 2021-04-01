import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu-list-item",
  styleUrl: "ch-sidebar-menu-list-item.scss",
  shadow: true,
})
export class ChSidebarMenuListItem {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}

import { newSpecPage } from "@stencil/core/testing";
import { ChSidebarMenuListItem } from "../ch-sidebar-menu-list-item";

describe("ch-sidebar-menu-list-item", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [ChSidebarMenuListItem],
      html: `<ch-sidebar-menu-list-item></ch-sidebar-menu-list-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-sidebar-menu-list-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-sidebar-menu-list-item>
    `);
  });
});

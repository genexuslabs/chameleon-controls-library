import { newSpecPage } from "@stencil/core/testing";
import { ChSidebarMenuList } from "../ch-sidebar-menu-list";

describe("ch-sidebar-menu-list", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [ChSidebarMenuList],
      html: `<ch-sidebar-menu-list></ch-sidebar-menu-list>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-sidebar-menu-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-sidebar-menu-list>
    `);
  });
});

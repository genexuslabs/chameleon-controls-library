import { newSpecPage } from "@stencil/core/testing";
import { ChSidebarMenu } from "../ch-sidebar-menu";

describe("ch-sidebar-menu", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [ChSidebarMenu],
      html: `<ch-sidebar-menu></ch-sidebar-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <ch-sidebar-menu>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-sidebar-menu>
    `);
  });
});

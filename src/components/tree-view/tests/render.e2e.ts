import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { kbExplorerModel } from "../../../showcase/assets/components/tree-view/models";

describe("[ch-tree-view-render][filters]", () => {
  let page: E2EPage;
  let treeViewRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tree-view-render></ch-tree-view-render>`,
      failOnConsoleError: true
    });
    treeViewRef = await page.find("ch-tree-view-render");
    treeViewRef.setProperty("model", kbExplorerModel);
    await page.waitForChanges();
  });

  it("should have Shadow DOM", async () => {
    expect(treeViewRef.shadowRoot).toBeDefined();
  });
});

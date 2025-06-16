import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { TreeViewModel } from "../types";
import { TREE_VIEW_NODE_RENDER } from "./utils.e2e";

describe("[ch-tree-view-render][order]", () => {
  let page: E2EPage;
  let treeViewRef: E2EElement;

  const getTreeViewRenderedContent = () =>
    page.evaluate(() =>
      document
        .querySelector("ch-tree-view-render")
        .shadowRoot.innerHTML.toString()
    );

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tree-view-render></ch-tree-view-render>`,
      failOnConsoleError: true
    });
    treeViewRef = await page.find("ch-tree-view-render");
  });

  it("should properly order the nodes when all items have an order defined", async () => {
    treeViewRef.setProperty("model", [
      { id: "Abc", caption: "Abc", order: 2 },
      { id: "ZZZ2", caption: "ZZZ", order: 1 },
      { id: "ZZZ", caption: "ZZZ", order: 3 }
    ] satisfies TreeViewModel);
    await page.waitForChanges();

    const renderedContent = await getTreeViewRenderedContent();

    expect(renderedContent).toEqual(
      TREE_VIEW_NODE_RENDER([{ id: "ZZZ2" }, { id: "Abc" }, { id: "ZZZ" }])
    );
  });

  it("should properly order the nodes even if some items doesn't have an order defined", async () => {
    treeViewRef.setProperty("model", [
      { id: "Abc", caption: "Abc", order: 2 },
      {
        id: "ZZZ2",
        caption: "ZZZ",
        order: 1,
        items: [
          { id: "aaa", caption: "bbb" },
          { id: "bbb", caption: "aaa" },
          { id: "ccc", caption: "bab" }
        ]
      },
      { id: "ZZZ", caption: "ZZZ" }
    ] satisfies TreeViewModel);
    await page.waitForChanges();

    const renderedContent = await getTreeViewRenderedContent();

    expect(renderedContent).toEqual(
      TREE_VIEW_NODE_RENDER([
        { id: "ZZZ" },
        { id: "ZZZ2", children: [{ id: "bbb" }, { id: "ccc" }, { id: "aaa" }] },
        { id: "Abc" }
      ])
    );
  });

  it("should properly order the nodes even if some items doesn't have an order defined 2", async () => {
    treeViewRef.setProperty("model", [
      { id: "Abc", caption: "Abc" },
      { id: "ZZZ2", caption: "ZZZa" },
      { id: "ZZZ", caption: "ZZZ" }
    ] satisfies TreeViewModel);
    await page.waitForChanges();

    const renderedContent = await getTreeViewRenderedContent();

    expect(renderedContent).toEqual(
      TREE_VIEW_NODE_RENDER([{ id: "Abc" }, { id: "ZZZ" }, { id: "ZZZ2" }])
    );
  });
});

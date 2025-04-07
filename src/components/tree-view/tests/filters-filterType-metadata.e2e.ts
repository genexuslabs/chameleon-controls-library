import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  kbExplorerModel,
  lazyLoadTreeItemsCallback
} from "../../../showcase/assets/components/tree-view/models";
import { TREE_VIEW_NODE_RENDER } from "./utils.e2e";

describe('[ch-tree-view-render][filters][filterType="metadata"]', () => {
  let page: E2EPage;
  let treeViewRef: E2EElement;

  // It does not serialize correctly setting a RegExp as a property, so we have
  // to evaluate the page
  const setRegExp = (stringRegex: string) =>
    page.evaluate(regex => {
      document.querySelector("ch-tree-view-render").filter = new RegExp(regex);
    }, stringRegex);

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
    treeViewRef.setProperty("model", kbExplorerModel);
    treeViewRef.setProperty("filterDebounce", 0);
    treeViewRef.setProperty(
      "lazyLoadTreeItemsCallback",
      lazyLoadTreeItemsCallback
    );
    await page.waitForChanges();
  });

  it("filter property should be undefined by default", async () => {
    expect(await treeViewRef.getProperty("filter")).toBeUndefined();
  });

  it("should render all items if the filter property is not set", async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  it("should render all items if filter = undefined", async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", undefined);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  it("should render all items if filter = null", async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", null);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  it('should render all items if filter = ""', async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", "");
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  // it('should render all items if filter = "   " (only contains white spaces)', async () => {
  //   const previousHTML = await getTreeViewRenderedContent();

  //   treeViewRef.setProperty("filterType", "metadata");
  //   treeViewRef.setProperty("filter", "   ");
  //   await page.waitForChanges();

  //   const filteredHTML = await getTreeViewRenderedContent();
  //   expect(filteredHTML).toEqual(previousHTML);
  // });

  it('should render all items if filter = new RegExp("") (empty RegExp)', async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp("");
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  it("should not render any items if the filter value is not included in any metadata", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", "nothing.....");
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(TREE_VIEW_NODE_RENDER([]));
  });

  it("should render the items that match the filter (string 1)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", '"objectType":"module"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [
            {
              id: "Root_Module",
              children: [
                "Root_Module.AWS_internal",
                "Root_Module.BL",
                "Root_Module.General",
                "Root_Module.IDE"
              ]
            }
          ]
        }
      ])
    );
  });

  it("should render the items that match the filter (string 2)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", '"objectType":"module","caption":"BL"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [{ id: "Root_Module", children: ["Root_Module.BL"] }]
        }
      ])
    );
  });

  it("should render the items that match the filter (RegExp 1)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"module"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [
            {
              id: "Root_Module",
              children: [
                "Root_Module.AWS_internal",
                "Root_Module.BL",
                "Root_Module.General",
                "Root_Module.IDE"
              ]
            }
          ]
        }
      ])
    );
  });

  it("should render the items that match the filter (RegExp 2)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"module","caption":"BL"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [{ id: "Root_Module", children: ["Root_Module.BL"] }]
        }
      ])
    );
  });

  it("should render the items that match the filter (RegExp 3)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"module","caption":".+al');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [
            {
              id: "Root_Module",
              children: ["Root_Module.AWS_internal", "Root_Module.General"]
            }
          ]
        }
      ])
    );
  });

  it("should render the items that match the filter (RegExp 4)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"(module|folder)"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [
            {
              id: "Root_Module",
              children: [
                "Root_Module.AWS_internal",
                "Root_Module.BL",
                "Root_Module.General",
                "Root_Module.IDE",
                "Root_Module.Back",
                "Root_Module.DataModel",
                "Root_Module.Tests"
              ]
            }
          ]
        }
      ])
    );
  });

  it("should render the items that match the filter (RegExp 5)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"(module|folder)","caption":".+l"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [
            {
              id: "Root_Module",
              children: [
                "Root_Module.AWS_internal",
                "Root_Module.General",
                "Root_Module.DataModel"
              ]
            }
          ]
        }
      ])
    );
  });

  it('should render all items when setting again filterType="none"', async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"(module|folder)","caption":".+l"');
    await page.waitForChanges();

    let filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE_RENDER([
        {
          id: "root",
          children: [
            {
              id: "Root_Module",
              children: [
                "Root_Module.AWS_internal",
                "Root_Module.General",
                "Root_Module.DataModel"
              ]
            }
          ]
        }
      ])
    );

    treeViewRef.setProperty("filterType", "none");
    await page.waitForChanges();
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(previousHTML);
  });
});

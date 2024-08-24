import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  kbExplorerModel,
  lazyLoadTreeItemsCallback
} from "../../../showcase/assets/components/tree-view/models";
import { delayTest } from "../../../testing/utils.e2e";

const ITEM_EXPORT_PARTS =
  "item__action,item__checkbox,item__checkbox-container,item__checkbox-input,item__checkbox-option,item__downloading,item__edit-caption,item__expandable-button,item__group,item__header,item__img,item__line,disabled,expanded,collapsed,expand-button,even-level,odd-level,last-line,lazy-loaded,start-img,end-img,editing,not-editing,selected,not-selected,checked,unchecked,indeterminate,drag-enter";

const TREE_VIEW_NODE = (children: string) =>
  `<ch-tree-view class="not-dragging-item hydrated" exportparts="drag-preview">${children}</ch-tree-view>`;

describe('[ch-tree-view-render][filters][filter-type="list"]', () => {
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
    treeViewRef.setProperty("model", kbExplorerModel);
    treeViewRef.setProperty(
      "lazyLoadTreeItemsCallback",
      lazyLoadTreeItemsCallback
    );
    await page.waitForChanges();
  });

  for (let index = 1; index <= 5; index++) {
    it(`should not fail with filterType="list" try ${index}`, async () => {
      treeViewRef.setProperty("filterType", "list");
      await page.waitForChanges();
    });
  }

  it("should render all items if the filterList property is not set", async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "list");
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  it('should render all items if the filterList property is set, but filterType !== "list"', async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterList", ["root"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();
    expect(filteredHTML).toEqual(previousHTML);
  });

  it("should render all items if the filterList is undefined", async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", undefined);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(previousHTML);
  });

  it("should render all items if the filterList is null", async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", null);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(previousHTML);
  });

  it("should not render any items if the filterList is an empty array", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", []);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(TREE_VIEW_NODE(""));
  });

  it("should render one item if the filterList only contains the root", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["root"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"></ch-tree-view-item>`
      )
    );
  });

  it("should render two items if the filterList only contains a direct descendant of the root", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["Main_Programs"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );
  });

  it("should render two items if the filterList only contains a direct descendant of the root and the root", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["root", "Main_Programs"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );
  });

  it("should render three items if the filterList only contains two direct descendants of the root", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["Main_Programs", "References"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );
  });

  it("should render three items if the filterList only contains two direct descendants of the root", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["Main_Programs", "References"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );
  });

  it("should not render any items if the filterList only contains an item that is not in the model", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["dummy"]);
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(TREE_VIEW_NODE(""));
  });

  it("should update the rendered items if the filterList is updated at runtime", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["dummy"]);
    await page.waitForChanges();

    let filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(TREE_VIEW_NODE(""));

    treeViewRef.setProperty("filterList", ["Main_Programs", "References"]);
    await page.waitForChanges();
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );

    treeViewRef.setProperty("filterList", ["root"]);
    await page.waitForChanges();
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"></ch-tree-view-item>`
      )
    );
  });

  it("should update instantly the rendered items if the filterList is updated at runtime, even if a debounce is set", async () => {
    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterDebounce", 3000); // 3 seconds
    treeViewRef.setProperty("filterList", ["root"]);
    await page.waitForChanges();

    let filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"></ch-tree-view-item>`
      )
    );

    treeViewRef.setProperty("filterList", ["Main_Programs", "References"]);
    await page.waitForChanges();
    await delayTest(250); // 250 ms
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );

    treeViewRef.setProperty("filterList", ["root"]);
    await page.waitForChanges();
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"></ch-tree-view-item>`
      )
    );
  });

  // TODO: For some reason, the new rendered content is not correctly filtered. Testing it manually works fine
  it.skip("should update the rendered items when a filtered item lazy loads its content and there is a new node that is contained on the filterList", async () => {
    treeViewRef.setProperty("filterList", [
      "Main_Programs",
      "References",
      "Main_Programs.Prompt"
    ]);
    await page.waitForChanges();
    let filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );

    await page.click("ch-tree-view-render >>> [id='Main_Programs']");
    // await treeViewRef.callMethod("toggleItems", ["Main_Programs"], true);
    await page.waitForChanges();

    // The lazyLoadTreeItemsCallback method has 500ms of delay
    await delayTest(800);
    await page.waitForChanges();

    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"><ch-tree-view-item id="Main_Programs.Prompt" role="treeitem" aria-level="3" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );
  });

  it('should render all items when setting again filterType="none"', async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "list");
    treeViewRef.setProperty("filterList", ["Main_Programs", "References"]);
    await page.waitForChanges();
    let filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        `<ch-tree-view-item id="root" role="treeitem" aria-level="1" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 0;"><ch-tree-view-item id="Main_Programs" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item><ch-tree-view-item id="References" role="treeitem" aria-level="2" exportparts="${ITEM_EXPORT_PARTS}" class="hydrated" part="item" style="--level: 1;"></ch-tree-view-item></ch-tree-view-item>`
      )
    );

    treeViewRef.setProperty("filterType", "none");
    await page.waitForChanges();
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(previousHTML);
  });
});

import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  kbExplorerModel,
  lazyLoadTreeItemsCallback
} from "../../../showcase/assets/components/tree-view/models";

const ITEM_EXPORT_PARTS =
  "item__action,item__checkbox,item__checkbox-container,item__checkbox-input,item__checkbox-option,item__downloading,item__edit-caption,item__expandable-button,item__group,item__header,item__img,item__line,disabled,expanded,collapsed,expand-button,even-level,odd-level,last-line,lazy-loaded,start-img,end-img,editing,not-editing,selected,not-selected,checked,unchecked,indeterminate,drag-enter";

const TREE_VIEW_NODE = <T extends string>(children: T) =>
  `<ch-tree-view class="not-dragging-item hydrated" exportparts="drag-preview">${children}</ch-tree-view>` as const;

const TREE_VIEW_ITEM_NODE = <T extends string>(
  options: { id: string; level: number; class?: string },
  children?: T
) =>
  `<ch-tree-view-item id="${options.id}" role="treeitem" aria-level="${
    options.level
  }" exportparts="${ITEM_EXPORT_PARTS}" class="${
    options.class ? options.class + " " : ""
  }hydrated" part="item" style="--level: ${options.level - 1};">${
    children ?? ""
  }</ch-tree-view-item>` as const;

describe('[ch-tree-view-render][filters][filter-type="metadata"]', () => {
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

    expect(filteredHTML).toEqual(TREE_VIEW_NODE(""));
  });

  it("should render the items that match the filter (string 1)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", '"objectType":"module"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.AWS_internal", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.BL", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.General", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.IDE", level: 3 })
          )
        )
      )
    );
  });

  it("should render the items that match the filter (string 2)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    treeViewRef.setProperty("filter", '"objectType":"module","caption":"BL"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.BL", level: 3 })
          )
        )
      )
    );
  });

  it("should render the items that match the filter (RegExp 1)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"module"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.AWS_internal", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.BL", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.General", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.IDE", level: 3 })
          )
        )
      )
    );
  });

  it("should render the items that match the filter (RegExp 2)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"module","caption":"BL"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.BL", level: 3 })
          )
        )
      )
    );
  });

  it("should render the items that match the filter (RegExp 3)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"module","caption":".+al');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.AWS_internal", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.General", level: 3 })
          )
        )
      )
    );
  });

  it("should render the items that match the filter (RegExp 4)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"(module|folder)"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.AWS_internal", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.BL", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.General", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.IDE", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.Back", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.DataModel", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.Tests", level: 3 })
          )
        )
      )
    );
  });

  it("should render the items that match the filter (RegExp 5)", async () => {
    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"(module|folder)","caption":".+l"');
    await page.waitForChanges();

    const filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.AWS_internal", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.General", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.DataModel", level: 3 })
          )
        )
      )
    );
  });

  it('should render all items when setting again filterType="none"', async () => {
    const previousHTML = await getTreeViewRenderedContent();

    treeViewRef.setProperty("filterType", "metadata");
    await setRegExp('"objectType":"(module|folder)","caption":".+l"');
    await page.waitForChanges();

    let filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(
      TREE_VIEW_NODE(
        TREE_VIEW_ITEM_NODE(
          { id: "root", level: 1 },
          TREE_VIEW_ITEM_NODE(
            { id: "Root_Module", level: 2 },
            TREE_VIEW_ITEM_NODE({ id: "Root_Module.AWS_internal", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.General", level: 3 }) +
              TREE_VIEW_ITEM_NODE({ id: "Root_Module.DataModel", level: 3 })
          )
        )
      )
    );

    treeViewRef.setProperty("filterType", "none");
    await page.waitForChanges();
    filteredHTML = await getTreeViewRenderedContent();

    expect(filteredHTML).toEqual(previousHTML);
  });
});

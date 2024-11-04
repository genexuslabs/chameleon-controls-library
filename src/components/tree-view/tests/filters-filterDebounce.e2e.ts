import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  importObjectsModel,
  kbExplorerModel
} from "../../../showcase/assets/components/tree-view/models";
import { TREE_VIEW_NODE_RENDER } from "./utils.e2e";
import { delayTest } from "../../../testing/utils.e2e";
import { ChTreeViewRender } from "../tree-view-render";

const DEFAULT_DELAY = 250;
const WAIT_FOR_DEFAULT_DELAY = DEFAULT_DELAY + 50;

const ALL_FILTERS = [
  "caption",
  "checked",
  "list",
  "metadata",
  "unchecked"
] as const satisfies ChTreeViewRender["filterType"][];

describe("[ch-tree-view-render][filters][filterDebounce]", () => {
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
    await page.waitForChanges();
  });

  it("filterDebounce property should equal to 250 by default", async () => {
    expect(await treeViewRef.getProperty("filterDebounce")).toBe(250);
  });

  const debounceFilterTest = (filterType: "caption" | "metadata") => {
    it(`should debounce filters if the filterType is "${filterType}"`, async () => {
      const previousHTML = await getTreeViewRenderedContent();

      treeViewRef.setProperty("filterType", filterType);
      treeViewRef.setProperty("filter", "nothing.....");
      await page.waitForChanges();

      // Render is debounced
      const filteredHTML = await getTreeViewRenderedContent();
      expect(filteredHTML).toEqual(previousHTML);

      // Wait for the timeout to trigger filters
      await delayTest(WAIT_FOR_DEFAULT_DELAY);
      await page.waitForChanges();

      expect(await getTreeViewRenderedContent()).toEqual(
        TREE_VIEW_NODE_RENDER([])
      );
    });
  };
  debounceFilterTest("caption");
  debounceFilterTest("metadata");

  const shouldNotDebounceFiltersTest = (
    filterType: ChTreeViewRender["filterType"]
  ) => {
    // TODO: This test does not work correctly because it does not set the
    // model in the same render, in other words, it does not set the model on
    // the initial load
    it.skip(`should not debounce filters when setting the model and filters at the initial load, even if the filterType is "${filterType}"`, async () => {
      page = await newE2EPage({
        html: `<ch-tree-view-render filter-type="${filterType}" filter="nothing....."></ch-tree-view-render>`,
        failOnConsoleError: true
      });

      await page.evaluate(model => {
        const treeViewElementRef = document.querySelector(
          "ch-tree-view-render"
        )!;
        treeViewElementRef.model = model;
        treeViewElementRef.filterList = [];
      }, kbExplorerModel);

      await page.waitForChanges();

      expect(await getTreeViewRenderedContent()).toEqual(
        TREE_VIEW_NODE_RENDER([])
      );
    });

    it(`should not debounce filters when updating the model at runtime, even if the filterType is "${filterType}"`, async () => {
      treeViewRef.setProperty("filterType", filterType);
      await page.waitForChanges();

      treeViewRef.setProperty("model", importObjectsModel);
      treeViewRef.setProperty("filter", "nothing.....");
      treeViewRef.setProperty("filterList", []);
      await page.waitForChanges();

      expect(await getTreeViewRenderedContent()).toEqual(
        TREE_VIEW_NODE_RENDER([])
      );
    });
  };

  const shouldNotDebounceFiltersTest2 = (
    filterType: ChTreeViewRender["filterType"]
  ) =>
    it(`should not debounce filters when lazy loading a subtree and the filterType is "${filterType}"`, async () => {
      treeViewRef.setProperty("filterType", filterType);
      treeViewRef.setProperty("filter", "z");
      treeViewRef.setProperty("filterList", []);
      await page.waitForChanges();

      // Wait for the timeout to trigger filters
      await delayTest(WAIT_FOR_DEFAULT_DELAY);
      await page.waitForChanges();

      expect(await getTreeViewRenderedContent()).toEqual(
        TREE_VIEW_NODE_RENDER([
          {
            id: "root",
            children: ["Customization"]
          }
        ])
      );

      await page.evaluate(() => {
        document.querySelector(
          "ch-tree-view-render"
        ).lazyLoadTreeItemsCallback = () =>
          new Promise(resolve =>
            resolve([
              {
                id: "Customization.Localization",
                caption: "Localization",
                metadata: "Customization.Localization"
              },
              {
                id: "Other item that should not be displayed",
                caption: "Other item that should not be displayed",
                metadata: "Other item that should not be displayed"
              }
            ])
          );
      });

      await treeViewRef.callMethod("updateAllItemsProperties", {
        expanded: true
      });
      // TODO: Should this be only one await? Revisit tree view implementation for async methods
      await page.waitForChanges();
      await page.waitForChanges();

      expect(await getTreeViewRenderedContent()).toEqual(
        TREE_VIEW_NODE_RENDER([
          {
            id: "root",
            children: [
              { id: "Customization", children: ["Customization.Localization"] }
            ]
          }
        ])
      );
    });

  ALL_FILTERS.forEach(filterType => shouldNotDebounceFiltersTest(filterType));
  shouldNotDebounceFiltersTest2("caption");
  shouldNotDebounceFiltersTest2("metadata");
});

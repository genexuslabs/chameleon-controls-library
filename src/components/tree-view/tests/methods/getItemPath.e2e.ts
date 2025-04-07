import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  fileSystemModel,
  kbExplorerModel
} from "../../../../showcase/assets/components/tree-view/models";
import type { TreeViewItemModel } from "../../types";

const DUMMY_NODE_ID = "__Dummy id";
const ITEM_LEAF = "Root_Module.General";
const ITEM_FOLDER = "Root_Module";
const ITEM_ROOT = "root";

const ITEM_IN_ANOTHER_MODEL = "dev";

describe("[ch-tree-view-render][methods][getItemPath]", () => {
  let page: E2EPage;
  let treeViewRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tree-view-render></ch-tree-view-render>`,
      failOnConsoleError: true
    });
    treeViewRef = await page.find("ch-tree-view-render");
    await page.waitForChanges();
  });

  it("should return null if the model property is empty", async () =>
    expect(
      await treeViewRef.callMethod("getItemPath", DUMMY_NODE_ID)
    ).toBeNull());

  it("should return null if the item doesn't exists in the model", async () => {
    treeViewRef.setProperty("model", kbExplorerModel);
    await page.waitForChanges();

    expect(
      await treeViewRef.callMethod("getItemPath", DUMMY_NODE_ID)
    ).toBeNull();
  });

  it("should return the path if the item exists after updating the model in runtime", async () => {
    treeViewRef.setProperty("model", kbExplorerModel);
    await page.waitForChanges();

    treeViewRef.setProperty("model", fileSystemModel);
    await page.waitForChanges();

    const itemPath = (await treeViewRef.callMethod(
      "getItemPath",
      ITEM_IN_ANOTHER_MODEL
    )) as TreeViewItemModel[] | null;
    expect(itemPath).toBeTruthy();

    // TODO: We should check the actual item model, but to do that, we need to
    // remove the side-effects that the tree-view provokes when the model is
    // set (properties as the "expanded" are set if they are undefined)
    expect(itemPath.map(item => item.id)).toEqual(["root", "dev"]);
  });

  const applyFiltersIfNecessary = (filters: boolean) => {
    if (filters) {
      treeViewRef.setProperty("filterType", "caption");
      treeViewRef.setProperty("filter", "Don't display anything");
    }
  };

  const runTest = (filters: boolean) => {
    const filtersDescription = filters
      ? " and the tree view doesn't render anything because it has filters applied"
      : "";

    it(`should return the path for the item (leaf), when it exists in the model${filtersDescription}`, async () => {
      treeViewRef.setProperty("model", kbExplorerModel);
      applyFiltersIfNecessary(filters);
      await page.waitForChanges();

      const itemPath = (await treeViewRef.callMethod(
        "getItemPath",
        ITEM_LEAF
      )) as TreeViewItemModel[] | null;
      expect(itemPath).toBeTruthy();

      // TODO: We should check the actual item model, but to do that, we need to
      // remove the side-effects that the tree-view provokes when the model is
      // set (properties as the "expanded" are set if they are undefined)
      expect(itemPath.map(item => item.id)).toEqual([
        "root",
        "Root_Module",
        "Root_Module.General"
      ]);
    });

    it(`should return the path for the item (folder), when it exists in the model${filtersDescription}`, async () => {
      treeViewRef.setProperty("model", kbExplorerModel);
      applyFiltersIfNecessary(filters);
      await page.waitForChanges();

      const itemPath = (await treeViewRef.callMethod(
        "getItemPath",
        ITEM_FOLDER
      )) as TreeViewItemModel[] | null;
      expect(itemPath).toBeTruthy();

      // TODO: We should check the actual item model, but to do that, we need to
      // remove the side-effects that the tree-view provokes when the model is
      // set (properties as the "expanded" are set if they are undefined)
      expect(itemPath.map(item => item.id)).toEqual(["root", "Root_Module"]);
    });

    it(`should return the path for the item (root), when it exists in the model${filtersDescription}`, async () => {
      treeViewRef.setProperty("model", kbExplorerModel);
      applyFiltersIfNecessary(filters);
      await page.waitForChanges();

      const itemPath = (await treeViewRef.callMethod(
        "getItemPath",
        ITEM_ROOT
      )) as TreeViewItemModel[] | null;
      expect(itemPath).toBeTruthy();

      // TODO: We should check the actual item model, but to do that, we need to
      // remove the side-effects that the tree-view provokes when the model is
      // set (properties as the "expanded" are set if they are undefined)
      expect(itemPath.map(item => item.id)).toEqual(["root"]);
    });
  };

  runTest(false);
  runTest(true);

  it("should return null if the item exists in the first model, but not in the second (in other words, avoid memory leaks)", async () => {
    treeViewRef.setProperty("model", kbExplorerModel);
    await page.waitForChanges();

    treeViewRef.setProperty("model", fileSystemModel);
    await page.waitForChanges();

    expect(await treeViewRef.callMethod("getItemPath", ITEM_FOLDER)).toBeNull();
  });

  // TODO: Add more tests to check that is works when
  //  - The model is updated at runtime.
  //  - Items are lazy loaded.
});

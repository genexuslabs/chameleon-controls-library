import { h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutRenders
} from "../../flexible-layout/types";

import {
  lazyLoadItemsDictionary,
  kbExplorerModel,
  preferencesModel
} from "../../../pages/assets/models/tree.js";
import { TreeViewItemModel } from "../../tree-view/tree-view/types";

const MENU_BAR = "menu-bar";
const KB_EXPLORER = "kb-explorer";
const PREFERENCES = "preferences";

export const defaultLayout: FlexibleLayout = {
  blockStart: [{ id: MENU_BAR, name: MENU_BAR }],
  inlineStart: [
    { id: KB_EXPLORER, name: "KB Explorer" },
    { id: PREFERENCES, name: "Preferences" }
  ]
};

const lazyLoadTreeItems = (modelId: string): Promise<TreeViewItemModel[]> =>
  new Promise(resolve => {
    const lazyModelResultFromDictionary = lazyLoadItemsDictionary[
      modelId
    ] as TreeViewItemModel[];

    setTimeout(() => {
      resolve(lazyModelResultFromDictionary || []);
    }, 50); // Resolves or rejects after 50 milliseconds
  });

export const layoutRenders: FlexibleLayoutRenders = {
  [MENU_BAR]: () => <ch-action-group-render></ch-action-group-render>,
  [KB_EXPLORER]: () => (
    <ch-tree-view-render
      treeModel={kbExplorerModel}
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      showLines="last"
    ></ch-tree-view-render>
  ),
  [PREFERENCES]: () => (
    <ch-tree-view-render
      treeModel={preferencesModel}
      dragDisabled={true}
      dropDisabled={true}
      editableItems={false}
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      showLines="all"
    ></ch-tree-view-render>
  )
};

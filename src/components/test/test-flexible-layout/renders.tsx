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
import { GXWebModel } from "../../../pages/assets/models/action-group.js";
import { TreeViewItemModel } from "../../tree-view/tree-view/types";

const MENU_BAR = "menu-bar";
const KB_EXPLORER = "kb-explorer";
const PREFERENCES = "preferences";
const START_PAGE = "start-page";
const GRID = "Grid";
const STRUCT_EDITOR = "StructEditor";
const PROPERTIES = "properties";
const OUTPUT = "output";

export const defaultLayout: FlexibleLayout = {
  blockStart: { items: [{ id: MENU_BAR, name: MENU_BAR }] },
  inlineStart: {
    items: [
      { id: KB_EXPLORER, name: "KB Explorer" },
      { id: PREFERENCES, name: "Preferences" }
    ]
  },
  main: {
    items: [
      { id: START_PAGE, name: "Start Page", selected: true },
      { id: GRID, name: "Grid" },
      { id: STRUCT_EDITOR, name: "Struct Editor" }
    ]
  },
  inlineEnd: { items: [{ id: PROPERTIES, name: "Properties" }] },
  blockEnd: {
    items: [
      {
        id: OUTPUT,
        name: "Output",
        startImageSrc: "assets/icons/toolbar/output.svg"
      }
    ]
  }
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
  [MENU_BAR]: () => (
    <ch-action-group-render model={GXWebModel}></ch-action-group-render>
  ),
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
  ),
  [START_PAGE]: () => (
    <div>
      <h1
        style={{
          display: "flex",
          justifyContent: "center",
          fontSize: "64px",
          color: "#c5c8c6",
          "text-align": "center"
        }}
      >
        GeneXus
      </h1>
    </div>
  ),
  [GRID]: () => <div>Grid render...</div>,
  [STRUCT_EDITOR]: () => <div>Struct Editor...</div>,
  [PROPERTIES]: () => <div>Properties render...</div>,
  [OUTPUT]: () => <div>Output render...</div>
};

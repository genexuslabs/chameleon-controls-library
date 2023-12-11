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
  direction: "rows",
  items: [
    {
      accessibleRole: "banner",
      size: "32px",
      viewType: "blockStart",
      widgets: [{ id: MENU_BAR, name: MENU_BAR }]
    },
    {
      direction: "columns",
      size: "1fr",
      items: [
        {
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineStart",
          widgets: [
            { id: KB_EXPLORER, name: "KB Explorer", selected: true },
            { id: PREFERENCES, name: "Preferences" }
          ]
        },
        {
          accessibleRole: "main",
          size: "1fr",
          viewType: "main",
          widgets: [
            { id: START_PAGE, name: "Start Page", selected: true },
            { id: GRID, name: "Grid" },
            { id: STRUCT_EDITOR, name: "Struct Editor" }
          ]
        },
        {
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineEnd",
          widgets: [{ id: PROPERTIES, name: "Properties" }]
        }
      ]
    },
    {
      accessibleRole: "contentinfo",
      size: "200px",
      viewType: "blockEnd",
      widgets: [
        {
          id: OUTPUT,
          name: "Output",
          startImageSrc: "assets/icons/toolbar/output.svg"
        }
      ]
    }
  ]
};

export const layout2: FlexibleLayout = {
  direction: "rows",
  items: [
    {
      accessibleRole: "banner",
      hideDragBar: true,
      size: "32px",
      viewType: "blockStart",
      widgets: [{ id: MENU_BAR, name: MENU_BAR }]
    },
    {
      direction: "columns",
      size: "1fr",
      items: [
        {
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineStart",
          widgets: [
            { id: KB_EXPLORER, name: "KB Explorer", selected: true },
            { id: PREFERENCES, name: "Preferences" }
          ]
        },
        {
          direction: "columns",
          size: "1fr",
          accessibleRole: "main",
          items: [
            {
              size: "1fr",
              viewType: "main",
              widgets: [{ id: START_PAGE, name: "Start Page", selected: true }]
            },
            {
              size: "1fr",
              viewType: "main",
              widgets: [
                { id: GRID, name: "Grid" },
                { id: STRUCT_EDITOR, name: "Struct Editor" }
              ]
            }
          ]
        },
        {
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineEnd",
          widgets: [{ id: PROPERTIES, name: "Properties" }]
        }
      ]
    },
    {
      accessibleRole: "contentinfo",
      size: "200px",
      viewType: "blockEnd",
      widgets: [
        {
          id: OUTPUT,
          name: "Output",
          startImageSrc: "assets/icons/toolbar/output.svg"
        }
      ]
    }
  ]
};

// export const defaultLayout: FlexibleLayout = {
//   blockStart: {
//     items: [{ id: MENU_BAR, name: MENU_BAR }],
//     viewType: "blockStart"
//   },
//   inlineStart: {
//     distribution: [
//       { id: KB_EXPLORER, name: "KB Explorer", selected: true },
//       { id: PREFERENCES, name: "Preferences" }
//     ],
//     expanded: true,
//     viewType: "inlineStart"
//   },
//   main: {
//     distribution: {
//       direction: "columns",
//       items: [
//         {
//           size: "1fr",
//           widgets: [{ id: START_PAGE, name: "Start Page", selected: true }]
//         },
//         {
//           size: "1fr",
//           widgets: [
//             { id: GRID, name: "Grid" },
//             { id: STRUCT_EDITOR, name: "Struct Editor" }
//           ]
//         }
//       ]
//     },
//     viewType: "main"
//   },
//   inlineEnd: {
//     distribution: [{ id: PROPERTIES, name: "Properties" }],
//     expanded: true,
//     viewType: "inlineEnd"
//   },
//   blockEnd: {
//     distribution: [
//       {
//         id: OUTPUT,
//         name: "Output",
//         startImageSrc: "assets/icons/toolbar/output.svg"
//       }
//     ],
//     expanded: true,
//     viewType: "blockEnd"
//   }
// };

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
  [GRID]: () => (
    <div>
      Grid render... <input type="text" />
    </div>
  ),
  [STRUCT_EDITOR]: () => (
    <div>
      Struct Editor... <input type="text" />
    </div>
  ),
  [PROPERTIES]: () => (
    <div>
      Properties render... <input type="text" />
    </div>
  ),
  [OUTPUT]: () => <div>Output render... </div>
};

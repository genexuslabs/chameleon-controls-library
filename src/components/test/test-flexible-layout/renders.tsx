import { h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutRenders
} from "../../flexible-layout/types";

import {
  eagerLargeModel,
  importObjectsModel,
  lazyLoadItemsDictionary,
  kbExplorerModel,
  preferencesModel
} from "../../../showcase/pages/assets/models/tree.js";
import { GXWebModel } from "../../../showcase/pages/assets/models/action-group.js";
import { TreeViewItemModel } from "../../renders/tree-view/types";

const MENU_BAR = "menu-bar";
const KB_EXPLORER = "kb-explorer";
const PREFERENCES = "preferences";
const HEAVY_TREE = "heavy-tree";
const START_PAGE = "start-page";
const GRID = "Grid";
const STRUCT_EDITOR = "StructEditor";
const ATTRS_CONTAINERS_AND_OTHERS = "AttrsContainersAndOthers";
const PROPERTIES = "properties";
const OUTPUT = "output";
const IMPORT_OBJECTS = "import-objects";

export const defaultLayout: FlexibleLayout = {
  id: "root",
  direction: "rows",
  items: [
    {
      id: "sub-group-1",
      accessibleRole: "banner",
      size: "32px",
      viewType: "blockStart",
      widgets: [{ id: MENU_BAR, name: MENU_BAR }]
    },
    {
      id: "sub-group-2",
      direction: "columns",
      size: "1fr",
      items: [
        {
          id: "sub-group-2-1",
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineStart",
          selectedWidgetId: KB_EXPLORER,
          widgets: [
            {
              id: KB_EXPLORER,
              name: "KB Explorer",
              startImageSrc: "assets/icons/toolbar/kb-explorer.svg"
            },
            {
              id: PREFERENCES,
              name: "Preferences",
              startImageSrc: "assets/icons/toolbar/preferences.svg"
            },
            {
              id: HEAVY_TREE,
              name: "Heavy Tree",
              startImageSrc: "assets/icons/toolbar/kb-explorer.svg"
            }
          ]
        },
        {
          id: "sub-group-2-2",
          accessibleRole: "main",
          size: "1fr",
          viewType: "main",
          selectedWidgetId: START_PAGE,
          widgets: [
            { id: START_PAGE, name: "Start Page" },
            { id: GRID, name: "Grid" },
            { id: STRUCT_EDITOR, name: "Struct Editor" }
          ]
        },
        {
          id: "sub-group-2-3",
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineEnd",
          widgets: [
            {
              id: PROPERTIES,
              name: "Properties",
              startImageSrc: "assets/icons/toolbar/properties.svg"
            }
          ]
        }
      ]
    },
    {
      id: "sub-group-3",
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
  id: "root",
  direction: "rows",
  items: [
    {
      id: "sub-group-1",
      accessibleRole: "banner",
      dragBar: { hidden: true },
      size: "32px",
      viewType: "blockStart",
      widgets: [{ id: MENU_BAR, name: MENU_BAR }]
    },
    {
      id: "sub-group-2",
      direction: "columns",
      size: "1fr",
      items: [
        {
          id: "sub-group-2-1",
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineStart",
          selectedWidgetId: KB_EXPLORER,
          widgets: [
            {
              id: KB_EXPLORER,
              name: "KB Explorer",
              startImageSrc: "assets/icons/toolbar/kb-explorer.svg"
            },
            {
              id: PREFERENCES,
              name: "Preferences",
              startImageSrc: "assets/icons/toolbar/preferences.svg"
            },
            {
              id: HEAVY_TREE,
              name: "Heavy Tree",
              startImageSrc: "assets/icons/toolbar/kb-explorer.svg"
            }
          ]
        },
        {
          id: "sub-group-2-2",
          direction: "columns",
          size: "1fr",
          accessibleRole: "main",
          items: [
            {
              id: "sub-group-2-2-1",
              size: "1fr",
              viewType: "main",
              selectedWidgetId: START_PAGE,
              widgets: [{ id: START_PAGE, name: "Start Page" }]
            },
            {
              id: "sub-group-2-2-2",
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
          id: "sub-group-2-3",
          accessibleRole: "complementary",
          expanded: true,
          size: "300px",
          viewType: "inlineEnd",
          widgets: [
            {
              id: PROPERTIES,
              name: "Properties",
              startImageSrc: "assets/icons/toolbar/properties.svg"
            }
          ]
        }
      ]
    },
    {
      id: "sub-group-3",
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

export const layout3: FlexibleLayout = {
  id: "root",
  direction: "rows",
  items: [
    {
      id: "sub-group-1",
      accessibleRole: "banner",
      dragBar: { hidden: true },
      size: "32px",
      viewType: "blockStart",
      widgets: [{ id: MENU_BAR, name: MENU_BAR }]
    },
    {
      id: "sub-group-2",
      direction: "columns",
      size: "1fr",
      items: [
        {
          id: "sub-group-2-1",
          accessibleRole: "complementary",
          closeButtonHidden: true,
          expanded: true,
          size: "300px",
          viewType: "inlineStart",
          selectedWidgetId: KB_EXPLORER,
          showCaptions: false,
          widgets: [
            {
              id: KB_EXPLORER,
              name: "KB Explorer",
              startImageSrc: "assets/icons/toolbar/kb-explorer.svg"
            },
            {
              id: PREFERENCES,
              name: "Preferences",
              startImageSrc: "assets/icons/toolbar/preferences.svg"
            },
            {
              id: HEAVY_TREE,
              name: "Heavy Tree",
              startImageSrc: "assets/icons/toolbar/kb-explorer.svg"
            }
          ]
        },
        {
          id: "sub-group-2-2",
          direction: "rows",
          size: "1fr",
          items: [
            {
              id: "sub-group-2-2-1",
              direction: "columns",
              dragBar: { part: "visible", size: 1 },
              size: "1fr",
              accessibleRole: "main",
              items: [
                {
                  id: "sub-group-2-2-1-1",
                  dragBar: { part: "visible", size: 1 },
                  size: "0.5fr",
                  viewType: "main",
                  selectedWidgetId: START_PAGE,
                  widgets: [{ id: START_PAGE, name: "Start Page" }]
                },
                {
                  id: "sub-group-2-2-1-2",
                  direction: "rows",
                  size: "0.5fr",
                  viewType: "main",
                  items: [
                    {
                      id: "sub-group-2-2-1-2-1",
                      dragBar: { part: "visible", size: 1 },
                      size: "0.5fr",
                      viewType: "main",
                      widgets: [
                        { id: GRID, name: "Grid" },
                        { id: STRUCT_EDITOR, name: "Struct Editor" },
                        {
                          id: ATTRS_CONTAINERS_AND_OTHERS,
                          name: "AttrsContainersAndOthers"
                        }
                      ]
                    },
                    {
                      id: "sub-group-2-2-1-2-2",
                      size: "0.5fr",
                      viewType: "main",
                      widgets: [{ id: IMPORT_OBJECTS, name: "Import Objects" }]
                    }
                  ]
                }
              ]
            },
            {
              id: "sub-group-2-2-2",
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
        },
        {
          id: "sub-group-2-3",
          accessibleRole: "complementary",
          closeButtonHidden: true,
          expanded: true,
          size: "300px",
          showCaptions: false,
          viewType: "inlineEnd",
          widgets: [
            {
              id: PROPERTIES,
              name: "Properties",
              startImageSrc: "assets/icons/toolbar/properties.svg"
            }
          ]
        }
      ]
    }
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
  [MENU_BAR]: () => (
    <ch-action-group-render model={GXWebModel}></ch-action-group-render>
  ),
  [KB_EXPLORER]: () => (
    <ch-tree-view-render
      treeModel={kbExplorerModel}
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      multiSelection
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
      multiSelection
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
      <ch-grid>
        <ch-grid-columnset>
          <ch-grid-column
            column-name="Name"
            settingable={false}
            column-type="tree"
            freeze="start"
            size="20%"
          ></ch-grid-column>
          <ch-grid-column
            column-name="Type"
            settingable={false}
            size="80%"
          ></ch-grid-column>
          <ch-grid-column
            column-name="Description"
            settingable={false}
            size="500px"
          ></ch-grid-column>
          <ch-grid-column
            column-name="Is Collection"
            settingable={false}
            size="100px"
          ></ch-grid-column>
        </ch-grid-columnset>

        <ch-grid-row>
          <ch-grid-cell>Target</ch-grid-cell>
          <ch-grid-cell></ch-grid-cell>
          <ch-grid-cell>Target</ch-grid-cell>
          <ch-grid-cell>false</ch-grid-cell>

          <ch-grid-rowset>
            <ch-grid-row leaf="false">
              <ch-grid-cell>TargetType</ch-grid-cell>
              <ch-grid-cell>
                TargetType, GeneXus.Common.Notifications
              </ch-grid-cell>
              <ch-grid-cell>Target Type (required)</ch-grid-cell>
              <ch-grid-cell>false</ch-grid-cell>
            </ch-grid-row>
            <ch-grid-row>
              <ch-grid-cell>Devices</ch-grid-cell>
              <ch-grid-cell></ch-grid-cell>
              <ch-grid-cell>Devices List</ch-grid-cell>
              <ch-grid-cell>true</ch-grid-cell>

              <ch-grid-rowset>
                <ch-grid-row>
                  <ch-grid-cell>Device</ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>

                  <ch-grid-rowset>
                    <ch-grid-row>
                      <ch-grid-cell>DeviceToken</ch-grid-cell>
                      <ch-grid-cell>Character(500)</ch-grid-cell>
                      <ch-grid-cell>DeviceToken</ch-grid-cell>
                      <ch-grid-cell>false</ch-grid-cell>
                    </ch-grid-row>
                  </ch-grid-rowset>
                </ch-grid-row>
              </ch-grid-rowset>
            </ch-grid-row>
            <ch-grid-row>
              <ch-grid-cell>Groups</ch-grid-cell>
              <ch-grid-cell></ch-grid-cell>
              <ch-grid-cell>Groups</ch-grid-cell>
              <ch-grid-cell>true</ch-grid-cell>

              <ch-grid-rowset>
                <ch-grid-row>
                  <ch-grid-cell>Group</ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>

                  <ch-grid-rowset>
                    <ch-grid-row>
                      <ch-grid-cell>Name</ch-grid-cell>
                      <ch-grid-cell>Character(100)</ch-grid-cell>
                      <ch-grid-cell>Name</ch-grid-cell>
                      <ch-grid-cell>false</ch-grid-cell>
                    </ch-grid-row>
                  </ch-grid-rowset>
                </ch-grid-row>
              </ch-grid-rowset>
            </ch-grid-row>
            <ch-grid-row>
              <ch-grid-cell>Targets</ch-grid-cell>
              <ch-grid-cell></ch-grid-cell>
              <ch-grid-cell>Targets</ch-grid-cell>
              <ch-grid-cell>true</ch-grid-cell>

              <ch-grid-rowset>
                <ch-grid-row>
                  <ch-grid-cell>Filter</ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>
                  <ch-grid-cell></ch-grid-cell>

                  <ch-grid-rowset>
                    <ch-grid-row>
                      <ch-grid-cell>Name</ch-grid-cell>
                      <ch-grid-cell>Character(100)</ch-grid-cell>
                      <ch-grid-cell>Name</ch-grid-cell>
                      <ch-grid-cell>false</ch-grid-cell>
                    </ch-grid-row>
                    <ch-grid-row>
                      <ch-grid-cell>Value</ch-grid-cell>
                      <ch-grid-cell>Character(100)</ch-grid-cell>
                      <ch-grid-cell>Name</ch-grid-cell>
                      <ch-grid-cell>false</ch-grid-cell>
                    </ch-grid-row>
                  </ch-grid-rowset>
                </ch-grid-row>
              </ch-grid-rowset>
            </ch-grid-row>
          </ch-grid-rowset>
        </ch-grid-row>
      </ch-grid>
    </div>
  ),
  [STRUCT_EDITOR]: () => (
    <div>
      Struct Editor... <input type="text" />
    </div>
  ),
  [ATTRS_CONTAINERS_AND_OTHERS]: () => (
    <div>
      Panel AttrsContainersAndOthers <input type="text" />
    </div>
  ),
  [PROPERTIES]: () => (
    <div>
      Properties render... <input type="text" />
    </div>
  ),
  [OUTPUT]: () => <div>Output render... </div>,
  [HEAVY_TREE]: () => (
    <ch-tree-view-render
      treeModel={eagerLargeModel}
      dragDisabled={true}
      dropDisabled={true}
      editableItems={false}
      multiSelection
      showLines="all"
    ></ch-tree-view-render>
  ),
  [IMPORT_OBJECTS]: () => (
    <ch-tree-view-render
      treeModel={importObjectsModel}
      checkbox
      checked
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      toggleCheckboxes
      dragDisabled={true}
      dropDisabled={true}
      editableItems={false}
      multiSelection
      showLines="all"
    ></ch-tree-view-render>
  )
};

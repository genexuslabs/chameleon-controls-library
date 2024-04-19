import { h } from "@stencil/core";
import {
  FlexibleLayout,
  FlexibleLayoutRenders
} from "../../flexible-layout/internal/flexible-layout/types";

import {
  eagerLargeModel,
  importObjectsModel,
  lazyLoadItemsDictionary,
  kbExplorerModel,
  preferencesModel
} from "../../../showcase/pages/assets/models/tree.js";
import { GXWebModel } from "../../../showcase/pages/assets/models/action-group.js";
import { TreeViewItemModel } from "../../tree-view/types";
import {
  ChTreeViewRenderCustomEvent,
  TreeViewItemOpenReferenceInfo
} from "../../../components";

// IDs
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
const PANEL1 = "panel-1";
const PANEL2 = "panel-2";

// Common renders
const PANEL = "Panel";

export const defaultLayout: FlexibleLayout = {
  id: "root",
  direction: "rows",
  items: [
    {
      id: MENU_BAR,
      accessibleRole: "banner",
      size: "32px",
      type: "single-content",
      widget: {
        id: MENU_BAR,
        name: null
      }
    },
    {
      id: "sub-group-2",
      direction: "columns",
      size: "1fr",
      items: [
        {
          id: "sub-group-2-1",
          accessibleRole: "complementary",
          size: "300px",
          type: "tabbed",
          tabDirection: "inline",
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
          type: "tabbed",
          tabDirection: "block",
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
          size: "300px",
          type: "tabbed",
          tabDirection: "inline",
          tabPosition: "end",
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
      type: "tabbed",
      tabDirection: "block",
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
      id: MENU_BAR,
      accessibleRole: "banner",
      dragBar: { hidden: true },
      size: "32px",
      type: "single-content",
      widget: {
        id: MENU_BAR,
        name: null
      }
    },
    {
      id: "sub-group-2",
      direction: "columns",
      size: "1fr",
      items: [
        {
          id: "sub-group-2-1",
          accessibleRole: "complementary",
          size: "300px",
          type: "tabbed",
          tabDirection: "inline",
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
              type: "tabbed",
              tabDirection: "block",
              selectedWidgetId: START_PAGE,
              widgets: [{ id: START_PAGE, name: "Start Page" }]
            },
            {
              id: "sub-group-2-2-2",
              size: "1fr",
              type: "tabbed",
              tabDirection: "block",
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
          size: "300px",
          type: "tabbed",
          tabDirection: "inline",
          tabPosition: "end",
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
      type: "tabbed",
      tabDirection: "block",
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
      id: MENU_BAR,
      accessibleRole: "banner",
      dragBar: { hidden: true },
      size: "32px",
      type: "single-content",
      widget: {
        id: MENU_BAR,
        name: null
      }
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
          // dragOutsideDisabled: true,
          // sortable: false,
          size: "300px",
          type: "tabbed",
          tabDirection: "inline",
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
                  type: "tabbed",
                  tabDirection: "block",
                  selectedWidgetId: START_PAGE,
                  widgets: [{ id: START_PAGE, name: "Start Page" }]
                },
                {
                  id: "sub-group-2-2-1-2",
                  direction: "rows",
                  size: "0.5fr",
                  items: [
                    {
                      id: "sub-group-2-2-1-2-1",
                      dragBar: { part: "visible", size: 1 },
                      size: "0.5fr",
                      type: "tabbed",
                      tabDirection: "block",
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
                      type: "tabbed",
                      tabDirection: "block",
                      widgets: [
                        { id: PANEL1, name: "Panel 1", renderId: PANEL },
                        { id: PANEL2, name: "Panel 2", renderId: PANEL },
                        { id: IMPORT_OBJECTS, name: "Import Objects" }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: "sub-group-2-2-2",
              accessibleRole: "contentinfo",
              size: "200px",
              type: "tabbed",
              tabDirection: "block",
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
          size: "300px",
          showCaptions: false,
          type: "tabbed",
          tabDirection: "inline",
          tabPosition: "end",
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

const openNewPanel = (
  event: ChTreeViewRenderCustomEvent<TreeViewItemOpenReferenceInfo>
) => {
  const referenceInfo = event.detail;

  if (referenceInfo.metadata !== "Panel") {
    return;
  }

  const flexibleLayoutRender = event.target.parentElement
    .parentElement as HTMLChFlexibleLayoutRenderElement;

  flexibleLayoutRender.addWidget("sub-group-2-2-1-1", {
    id: referenceInfo.id,
    name: referenceInfo.id,
    renderId: PANEL
  });
};

export const layoutRenders: FlexibleLayoutRenders = {
  [MENU_BAR]: () => (
    <ch-action-group-render
      slot={MENU_BAR}
      key={MENU_BAR}
      model={GXWebModel}
    ></ch-action-group-render>
  ),
  [KB_EXPLORER]: () => (
    <ch-tree-view-render
      slot={KB_EXPLORER}
      key={KB_EXPLORER}
      treeModel={kbExplorerModel}
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      multiSelection
      showLines="last"
      onItemOpenReference={openNewPanel}
    ></ch-tree-view-render>
  ),
  [PREFERENCES]: () => (
    <ch-tree-view-render
      slot={PREFERENCES}
      key={PREFERENCES}
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
    <div slot={START_PAGE} key={START_PAGE}>
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
    <div slot={GRID} key={GRID}>
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
    <div slot={STRUCT_EDITOR} key={STRUCT_EDITOR}>
      Struct Editor... <input type="text" />
    </div>
  ),
  [ATTRS_CONTAINERS_AND_OTHERS]: () => (
    <div slot={ATTRS_CONTAINERS_AND_OTHERS} key={ATTRS_CONTAINERS_AND_OTHERS}>
      Panel AttrsContainersAndOthers <input type="text" />
    </div>
  ),
  [PROPERTIES]: () => (
    <div slot={PROPERTIES} key={PROPERTIES}>
      Properties render... <input type="text" />
    </div>
  ),
  [OUTPUT]: () => (
    <div slot={OUTPUT} key={OUTPUT}>
      Output render...
    </div>
  ),
  [HEAVY_TREE]: () => (
    <ch-tree-view-render
      slot={HEAVY_TREE}
      key={HEAVY_TREE}
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
      slot={IMPORT_OBJECTS}
      key={IMPORT_OBJECTS}
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
  ),
  [PANEL]: widget => (
    <div slot={widget.id} key={widget.id}>
      This is the render for the <strong>{widget.id}</strong> widget
    </div>
  )
};

import { h } from "@stencil/core";
import {
  FlexibleLayoutModel,
  FlexibleLayoutRenders
} from "../../flexible-layout/internal/flexible-layout/types";

import {
  eagerLargeModel,
  importObjectsModel,
  lazyLoadItemsDictionary,
  kbExplorerModel,
  preferencesModel
} from "../../../showcase/assets/components/tree-view/models";
import { TreeViewItemModel } from "../../tree-view/types";
import {
  ChTreeViewRenderCustomEvent,
  ThemeModel,
  TreeViewItemOpenReferenceInfo
} from "../../../components";

const UNANIMO_THEME: ThemeModel = [
  {
    name: "unanimo",
    url: "https://unpkg.com/@genexus/unanimo@latest/dist/bundles/css/all.css"
  },
  {
    name: "unanimo-extra",
    url: "showcase/unanimo-extra-styles.css"
  }
];

const MERCURY_THEME: ThemeModel = [
  {
    name: "mercury",
    url: "https://unpkg.com/@genexus/mercury@latest/dist/bundles/css/all.css"
  },
  {
    name: "mercury-extra",
    url: "showcase/mercury-extra-styles.css"
  }
];

// IDs
export const MENU_BAR = "menu-bar";
const KB_EXPLORER = "kb-explorer";
const PREFERENCES = "preferences";
const HEAVY_TREE = "heavy-tree";
const START_PAGE = "start-page";
const STRUCT_EDITOR = "StructEditor";
const ATTRS_CONTAINERS_AND_OTHERS = "AttrsContainersAndOthers";
const PROPERTIES = "properties";
export const TOOLBOX = "toolbox";
const OUTPUT = "output";
const IMPORT_OBJECTS = "import-objects";
const PANEL1 = "panel-1";
const PANEL2 = "panel-2";

// Common renders
const PANEL = "Panel";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const defaultLayout: FlexibleLayoutModel = {
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
        name: null,
        slot: true
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
          tabListPosition: "inline-start",
          selectedWidgetId: KB_EXPLORER,
          widgets: [
            {
              id: KB_EXPLORER,
              name: "KB Explorer",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/kb-explorer.svg`,
              startImgType: "mask"
            },
            {
              id: PREFERENCES,
              name: "Preferences",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/preferences.svg`,
              startImgType: "mask"
            },
            {
              id: HEAVY_TREE,
              name: "Heavy Tree",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/kb-explorer.svg`,
              startImgType: "mask"
            }
          ]
        },
        {
          id: "sub-group-2-2",
          accessibleRole: "main",
          size: "1fr",
          type: "tabbed",
          selectedWidgetId: START_PAGE,
          widgets: [
            { id: START_PAGE, accessibleName: "Start Page" },
            {
              id: STRUCT_EDITOR,
              name: "Struct Editor",
              overflow: "auto"
            }
          ]
        },
        {
          id: "sub-group-2-3",
          accessibleRole: "complementary",
          size: "300px",
          type: "tabbed",
          tabListPosition: "inline-start",
          widgets: [
            {
              id: PROPERTIES,
              name: "Properties",
              startImgSrc: `${ASSETS_PREFIX}toolbar/properties.svg`,
              startImgType: "mask"
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
      widgets: [
        {
          id: OUTPUT,
          name: "Output",
          startImgSrc: `${ASSETS_PREFIX}toolbar/output.svg`,
          startImgType: "mask"
        }
      ]
    }
  ]
};

export const layout2: FlexibleLayoutModel = {
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
        name: null,
        slot: true
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
          tabListPosition: "inline-start",
          selectedWidgetId: KB_EXPLORER,
          widgets: [
            {
              id: KB_EXPLORER,
              name: "KB Explorer",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/kb-explorer.svg`,
              startImgType: "mask"
            },
            {
              id: PREFERENCES,
              name: "Preferences",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/preferences.svg`,
              startImgType: "mask"
            },
            {
              id: HEAVY_TREE,
              name: "Heavy Tree",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/kb-explorer.svg`,
              startImgType: "mask"
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
              selectedWidgetId: START_PAGE,
              widgets: [{ id: START_PAGE, accessibleName: "Start Page" }]
            },
            {
              id: "sub-group-2-2-2",
              size: "1fr",
              type: "tabbed",
              widgets: [
                {
                  id: STRUCT_EDITOR,
                  name: "Struct Editor",
                  overflow: "auto"
                }
              ]
            }
          ]
        },
        {
          id: "sub-group-2-3",
          accessibleRole: "complementary",
          size: "300px",
          type: "tabbed",
          tabListPosition: "inline-end",
          widgets: [
            {
              id: PROPERTIES,
              name: "Properties",
              startImgSrc: `${ASSETS_PREFIX}toolbar/properties.svg`,
              startImgType: "mask"
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
      widgets: [
        {
          id: OUTPUT,
          name: "Output",
          startImgSrc: `${ASSETS_PREFIX}toolbar/output.svg`,
          startImgType: "mask"
        }
      ]
    }
  ]
};

export const layout3: FlexibleLayoutModel = {
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
        name: null,
        slot: true
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
          closeButton: false,
          // dragOutside: false,
          // sortable: false,
          dragBar: { part: "visible", size: 1 },
          size: "300px",
          type: "tabbed",
          tabListPosition: "inline-start",
          selectedWidgetId: KB_EXPLORER,
          showCaptions: false,
          widgets: [
            {
              id: KB_EXPLORER,
              name: "KB Explorer",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/kb-explorer.svg`,
              startImgType: "mask"
            },
            {
              id: PREFERENCES,
              name: "Preferences",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/preferences.svg`,
              startImgType: "mask"
            },
            {
              id: HEAVY_TREE,
              name: "Heavy Tree",
              contain: "none", // Necessary to avoid performance issues
              startImgSrc: `${ASSETS_PREFIX}toolbar/kb-explorer.svg`,
              startImgType: "mask"
            }
          ]
        },
        {
          id: "sub-group-2-2",
          direction: "rows",
          size: "1fr",
          dragBar: { part: "visible", size: 1 },
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
                  selectedWidgetId: START_PAGE,
                  widgets: [
                    {
                      id: START_PAGE,
                      accessibleName: "Start Page",
                      startImgSrc: `${ASSETS_PREFIX}/toolbar/home.svg`,
                      startImgType: "mask",
                      closeButton: false
                    }
                  ]
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
                      widgets: [
                        {
                          id: STRUCT_EDITOR,
                          name: "Struct Editor",
                          startImgSrc: `${ASSETS_PREFIX}transaction.svg`,
                          startImgType: "mask",
                          overflow: "auto"
                        },
                        {
                          id: ATTRS_CONTAINERS_AND_OTHERS,
                          name: "AttrsContainersAndOthers",
                          startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
                          startImgType: "background"
                        }
                      ]
                    },
                    {
                      id: "sub-group-2-2-1-2-2",
                      size: "0.5fr",
                      type: "tabbed",
                      widgets: [
                        {
                          id: PANEL1,
                          name: "Panel 1",
                          renderId: PANEL,
                          startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
                          startImgType: "background"
                        },
                        {
                          id: PANEL2,
                          name: "Panel 2 (disabled)",
                          disabled: true,
                          renderId: PANEL,
                          startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
                          startImgType: "background"
                        },
                        {
                          id: IMPORT_OBJECTS,
                          name: "Import Objects",
                          startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                          startImgType: "background"
                        }
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
              widgets: [
                {
                  id: OUTPUT,
                  name: "Output",
                  startImgSrc: `${ASSETS_PREFIX}toolbar/output.svg`,
                  startImgType: "mask"
                }
              ]
            }
          ]
        },
        {
          id: "sub-group-2-3",
          accessibleRole: "complementary",
          closeButton: false,
          size: "300px",
          showCaptions: false,
          type: "tabbed",
          tabListPosition: "inline-end",
          widgets: [
            {
              id: PROPERTIES,
              name: "Properties",
              startImgSrc: `${ASSETS_PREFIX}toolbar/properties.svg`,
              startImgType: "mask"
            },
            {
              id: TOOLBOX,
              name: "Toolbox",
              startImgSrc: `${ASSETS_PREFIX}toolbar/toolbox.svg`,
              startImgType: "mask",
              slot: true
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

export const layoutRenders = (
  designSystem: "mercury" | "unanimo"
): FlexibleLayoutRenders => ({
  [KB_EXPLORER]: () => [
    <ch-theme
      attachStyleSheets={designSystem === "unanimo"}
      model={UNANIMO_THEME}
    ></ch-theme>,
    <ch-theme
      attachStyleSheets={designSystem === "mercury"}
      model={MERCURY_THEME}
    ></ch-theme>,
    <ch-tree-view-render
      class="tree-view tree-view-secondary"
      slot={KB_EXPLORER}
      key={KB_EXPLORER}
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      model={kbExplorerModel}
      multiSelection
      showLines="last"
      onItemOpenReference={openNewPanel}
    ></ch-tree-view-render>
  ],
  [PREFERENCES]: () => (
    <ch-tree-view-render
      class="tree-view tree-view-secondary"
      slot={PREFERENCES}
      key={PREFERENCES}
      dragDisabled={true}
      dropDisabled={true}
      editableItems={false}
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      model={preferencesModel}
      multiSelection
      showLines="all"
    ></ch-tree-view-render>
  ),
  [START_PAGE]: () => (
    <div slot={START_PAGE} key={START_PAGE}>
      <h2 class="heading-1 welcome-message">GeneXus</h2>
    </div>
  ),
  [STRUCT_EDITOR]: () => (
    <div slot={STRUCT_EDITOR} key={STRUCT_EDITOR}>
      Grid render...
      <ch-edit class="input" accessibleName="Name" type="text"></ch-edit>
      <ch-tabular-grid>
        <ch-tabular-grid-columnset>
          <ch-tabular-grid-column
            column-name="Name"
            settingable={false}
            column-type="tree"
            freeze="start"
            size="20%"
          ></ch-tabular-grid-column>
          <ch-tabular-grid-column
            column-name="Type"
            settingable={false}
            size="80%"
          ></ch-tabular-grid-column>
          <ch-tabular-grid-column
            column-name="Description"
            settingable={false}
            size="500px"
          ></ch-tabular-grid-column>
          <ch-tabular-grid-column
            column-name="Is Collection"
            settingable={false}
            size="100px"
          ></ch-tabular-grid-column>
        </ch-tabular-grid-columnset>

        <ch-tabular-grid-row>
          <ch-tabular-grid-cell>Target</ch-tabular-grid-cell>
          <ch-tabular-grid-cell></ch-tabular-grid-cell>
          <ch-tabular-grid-cell>Target</ch-tabular-grid-cell>
          <ch-tabular-grid-cell>false</ch-tabular-grid-cell>

          <ch-tabular-grid-rowset>
            <ch-tabular-grid-row leaf="false">
              <ch-tabular-grid-cell>TargetType</ch-tabular-grid-cell>
              <ch-tabular-grid-cell>
                TargetType, GeneXus.Common.Notifications
              </ch-tabular-grid-cell>
              <ch-tabular-grid-cell>
                Target Type (required)
              </ch-tabular-grid-cell>
              <ch-tabular-grid-cell>false</ch-tabular-grid-cell>
            </ch-tabular-grid-row>
            <ch-tabular-grid-row>
              <ch-tabular-grid-cell>Devices</ch-tabular-grid-cell>
              <ch-tabular-grid-cell></ch-tabular-grid-cell>
              <ch-tabular-grid-cell>Devices List</ch-tabular-grid-cell>
              <ch-tabular-grid-cell>true</ch-tabular-grid-cell>

              <ch-tabular-grid-rowset>
                <ch-tabular-grid-row>
                  <ch-tabular-grid-cell>Device</ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>

                  <ch-tabular-grid-rowset>
                    <ch-tabular-grid-row>
                      <ch-tabular-grid-cell>DeviceToken</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>
                        Character(500)
                      </ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>DeviceToken</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>false</ch-tabular-grid-cell>
                    </ch-tabular-grid-row>
                  </ch-tabular-grid-rowset>
                </ch-tabular-grid-row>
              </ch-tabular-grid-rowset>
            </ch-tabular-grid-row>
            <ch-tabular-grid-row>
              <ch-tabular-grid-cell>Groups</ch-tabular-grid-cell>
              <ch-tabular-grid-cell></ch-tabular-grid-cell>
              <ch-tabular-grid-cell>Groups</ch-tabular-grid-cell>
              <ch-tabular-grid-cell>true</ch-tabular-grid-cell>

              <ch-tabular-grid-rowset>
                <ch-tabular-grid-row>
                  <ch-tabular-grid-cell>Group</ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>

                  <ch-tabular-grid-rowset>
                    <ch-tabular-grid-row>
                      <ch-tabular-grid-cell>Name</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>
                        Character(100)
                      </ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>Name</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>false</ch-tabular-grid-cell>
                    </ch-tabular-grid-row>
                  </ch-tabular-grid-rowset>
                </ch-tabular-grid-row>
              </ch-tabular-grid-rowset>
            </ch-tabular-grid-row>
            <ch-tabular-grid-row>
              <ch-tabular-grid-cell>Targets</ch-tabular-grid-cell>
              <ch-tabular-grid-cell></ch-tabular-grid-cell>
              <ch-tabular-grid-cell>Targets</ch-tabular-grid-cell>
              <ch-tabular-grid-cell>true</ch-tabular-grid-cell>

              <ch-tabular-grid-rowset>
                <ch-tabular-grid-row>
                  <ch-tabular-grid-cell>Filter</ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>
                  <ch-tabular-grid-cell></ch-tabular-grid-cell>

                  <ch-tabular-grid-rowset>
                    <ch-tabular-grid-row>
                      <ch-tabular-grid-cell>Name</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>
                        Character(100)
                      </ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>Name</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>false</ch-tabular-grid-cell>
                    </ch-tabular-grid-row>
                    <ch-tabular-grid-row>
                      <ch-tabular-grid-cell>Value</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>
                        Character(100)
                      </ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>Name</ch-tabular-grid-cell>
                      <ch-tabular-grid-cell>false</ch-tabular-grid-cell>
                    </ch-tabular-grid-row>
                  </ch-tabular-grid-rowset>
                </ch-tabular-grid-row>
              </ch-tabular-grid-rowset>
            </ch-tabular-grid-row>
          </ch-tabular-grid-rowset>
        </ch-tabular-grid-row>
      </ch-tabular-grid>
    </div>
  ),
  [ATTRS_CONTAINERS_AND_OTHERS]: () => (
    <div slot={ATTRS_CONTAINERS_AND_OTHERS} key={ATTRS_CONTAINERS_AND_OTHERS}>
      Panel AttrsContainersAndOthers
      <ch-edit class="input" accessibleName="Panel name" type="text"></ch-edit>
    </div>
  ),
  [PROPERTIES]: () => (
    <div slot={PROPERTIES} key={PROPERTIES}>
      Properties render...
      <ch-edit
        class="input"
        accessibleName="Property name"
        type="text"
      ></ch-edit>
    </div>
  ),
  [OUTPUT]: () => (
    <div slot={OUTPUT} key={OUTPUT}>
      Output render...
    </div>
  ),
  [HEAVY_TREE]: () => (
    <ch-tree-view-render
      class="tree-view tree-view-secondary"
      slot={HEAVY_TREE}
      key={HEAVY_TREE}
      dragDisabled={true}
      model={eagerLargeModel}
      dropDisabled={true}
      editableItems={false}
      multiSelection
      showLines="all"
    ></ch-tree-view-render>
  ),
  [IMPORT_OBJECTS]: () => (
    <ch-tree-view-render
      class="tree-view tree-view-secondary"
      slot={IMPORT_OBJECTS}
      key={IMPORT_OBJECTS}
      checkbox
      checked
      lazyLoadTreeItemsCallback={lazyLoadTreeItems}
      model={importObjectsModel}
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
});

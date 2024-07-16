import {
  TreeViewDataTransferInfo,
  TreeViewDropCheckInfo
} from "../../../../components/tree-view/internal/tree-view/types";
import {
  LazyLoadTreeItemsCallback,
  TreeViewItemModel,
  TreeViewImagePathCallback,
  TreeViewModel
} from "../../../../components/tree-view/types";

const KB_EXPLORER_ORDER = {
  module: 1,
  folder: 2,
  api: 3,
  dso: 3,
  stencil: 3,
  sdPanel: 3,
  masterPanel: 3,
  procedure: 3,
  webPanel: 3,
  globalEvents: 4,
  domain: 5,
  localization: 6,
  files: 7,
  images: 8
};

const FIRST_LEVEL_SIZE = 10;
const SECOND_LEVEL_SIZE = 20;
const THIRD_LEVEL_SIZE = 20;

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

const FOLDER_ICON = "folder";
const MODULE_ICON = "module";

export const getImagePathCallbackTreeView: TreeViewImagePathCallback = (
  item: TreeViewItemModel,
  iconDirection: "start" | "end"
) => {
  if (item.startImgSrc === MODULE_ICON) {
    return {
      default: {
        base: "var(--icon-module-base)",
        active: "var(--icon-module-active)",
        hover: "var(--icon-module-hover)",
        disabled: "var(--icon-module-disabled)"
      },
      expanded: {
        base: "var(--icon-module-base--expanded)",
        active: "var(--icon-module-active--expanded)",
        hover: "var(--icon-module-hover--expanded)",
        disabled: "var(--icon-module-disabled--expanded)"
      }
    };
  }

  if (item.startImgSrc === FOLDER_ICON) {
    return {
      default: {
        base: "var(--icon-folder-base)",
        active: "var(--icon-folder-active)",
        hover: "var(--icon-folder-hover)",
        disabled: "var(--icon-folder-disabled)"
      },
      expanded: {
        base: "var(--icon-folder-base--expanded)",
        active: "var(--icon-folder-active--expanded)",
        hover: "var(--icon-folder-hover--expanded)",
        disabled: "var(--icon-folder-disabled--expanded)"
      }
    };
  }

  return iconDirection === "start" ? item.startImgSrc : item.endImgSrc;
};

const fileSystem_root: TreeViewItemModel[] = [
  {
    id: "dev",
    caption: "dev",
    startImgSrc: FOLDER_ICON,
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true
  },
  {
    id: "etc",
    caption: "etc",
    editable: false,
    startImgSrc: FOLDER_ICON,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "cups",
        caption: "cups",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        leaf: true
      },
      {
        id: "httpd",
        caption: "httpd",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        leaf: true
      },
      {
        id: "init",
        caption: "init.d",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        leaf: true
      }
    ]
  },
  {
    id: "sbin",
    caption: "sbin",
    startImgSrc: FOLDER_ICON,
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true
  },
  {
    id: "tmp",
    caption: "tmp",
    startImgSrc: FOLDER_ICON,
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true
  },
  {
    id: "Users",
    caption: "Users",
    startImgSrc: FOLDER_ICON,
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "jdoe",
        caption: "jdoe",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "jmiller",
        caption: "jmiller",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "mysql",
        caption: "mysql",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      }
    ]
  },
  {
    id: "usr",
    caption: "usr",
    startImgSrc: FOLDER_ICON,
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "bin",
        caption: "bin",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "lib",
        caption: "lib",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "local",
        caption: "local",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      }
    ]
  },
  {
    id: "var",
    caption: "var",
    startImgSrc: FOLDER_ICON,
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "log",
        caption: "log",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "spool",
        caption: "spool",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "yp",
        caption: "yp",
        startImgSrc: FOLDER_ICON,
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      }
    ]
  }
];

export const fileSystemModel: TreeViewItemModel[] = [
  {
    id: "root",
    caption: "/",
    startImgSrc: FOLDER_ICON,
    editable: false,
    expanded: true,
    dragDisabled: true,
    dropDisabled: true,
    items: fileSystem_root
  }
];

const kbExplorer_root: TreeViewItemModel[] = [
  {
    id: "Main_Programs",
    caption: "Main Programs",
    editable: false,
    startImgSrc: `${ASSETS_PREFIX}category.svg`,
    dragDisabled: true,
    dropDisabled: true,
    lazy: true,
    order: 0
  },
  {
    id: "Root_Module",
    caption: "Root Module",
    editable: false,
    startImgSrc: MODULE_ICON,
    dragDisabled: true,
    lazy: true,
    order: 1
  },
  {
    id: "References",
    caption: "References",
    editable: false,
    startImgSrc: `${ASSETS_PREFIX}references.svg`,
    dragDisabled: true,
    dropDisabled: true,
    order: 2
  },
  {
    id: "Customization",
    caption: "Customization",
    editable: false,
    startImgSrc: `${ASSETS_PREFIX}customization.svg`,
    dragDisabled: true,
    dropDisabled: true,
    lazy: true,
    order: 3
  },
  {
    id: "Documentation",
    caption: "Documentation",
    editable: false,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}document.svg`,
    dragDisabled: true,
    dropDisabled: true,
    order: 4
  }
];

export const kbExplorerModel: TreeViewModel = [
  {
    id: "root",
    caption: "GeneXusNext Develop",
    editable: false,
    expanded: true,
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}version.svg`,
    startImgType: "img",
    dragDisabled: true,
    dropDisabled: true,
    items: kbExplorer_root
  }
];

const kbExplorerModel_MainPrograms: TreeViewItemModel[] = [
  {
    id: "Main_Programs.Prompt",
    caption: "Prompt",
    dragDisabled: true,
    dropDisabled: true,
    startImgType: "img",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Main_Programs.ApiHealthCheck",
    caption: "ApiHealthCheck",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`,
    order: KB_EXPLORER_ORDER.api
  },
  {
    id: "Main_Programs.BackHome",
    caption: "BackHome",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}web-panel.svg`,
    order: KB_EXPLORER_ORDER.webPanel
  },
  {
    id: "Main_Programs.Login",
    caption: "Login",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}web-panel.svg`,
    order: KB_EXPLORER_ORDER.webPanel
  },
  {
    id: "Main_Programs.ProvisioningServices",
    caption: "ProvisioningServices",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`,
    order: KB_EXPLORER_ORDER.api
  },
  {
    id: "Main_Programs.VersionCheck",
    caption: "VersionCheck",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}procedure.svg`,
    order: KB_EXPLORER_ORDER.procedure
  }
];

const kbExplorerModel_RootModule: TreeViewItemModel[] = [
  {
    id: "Root_Module.IDE",
    caption: "IDE",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.BL",
    caption: "BL",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General",
    caption: "General",
    startImgSrc: MODULE_ICON,
    lazy: true,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.AWS_internal",
    caption: "AWS_internal",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.DataModel",
    caption: "DataModel",
    startImgSrc: FOLDER_ICON,
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.Back",
    caption: "Back",
    startImgSrc: FOLDER_ICON,
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.Tests",
    caption: "Tests",
    startImgSrc: FOLDER_ICON,
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.Images",
    caption: "Images",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}image.svg`,
    order: KB_EXPLORER_ORDER.images
  },
  {
    id: "Root_Module.GXNext",
    caption: "GXNext",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    order: KB_EXPLORER_ORDER.dso
  },
  {
    id: "Root_Module.GeneXusNext",
    caption: "GeneXusNext",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    order: KB_EXPLORER_ORDER.dso
  },
  {
    id: "Root_Module.Files",
    caption: "Files",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    order: KB_EXPLORER_ORDER.files
  },
  {
    id: "Root_Module.Domain",
    caption: "Domain",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}domain.svg`,
    order: KB_EXPLORER_ORDER.domain
  }
];

const kbExplorerModel_Customization: TreeViewItemModel[] = [
  {
    id: "Customization.Files",
    caption: "Files",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    order: KB_EXPLORER_ORDER.files
  },
  {
    id: "Customization.Images",
    caption: "Images",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}image.svg`,
    order: KB_EXPLORER_ORDER.images
  },
  {
    id: "Customization.Localization",
    caption: "Localization",
    dragDisabled: true,
    dropDisabled: true,
    lazy: true,
    startImgSrc: `${ASSETS_PREFIX}lenguage.svg`,
    order: KB_EXPLORER_ORDER.localization
  }
];

const kbExplorerModel_Customization_Localization: TreeViewItemModel[] = [
  {
    id: "Customization.Localization.Arabic",
    caption: "Arabic",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}lenguage.svg`,
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.English",
    caption: "English",
    checkbox: true,
    checked: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}lenguage.svg`,
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.Spanish",
    caption: "Spanish",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}lenguage.svg`,
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.Italian",
    caption: "Italian",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}lenguage.svg`,
    order: KB_EXPLORER_ORDER.localization
  }
];

const kbExplorerModel_RootModule_General: TreeViewItemModel[] = [
  {
    id: "Root_Module.General.Security",
    caption: "Security",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.Services",
    caption: "Services",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.UI",
    caption: "UI",
    startImgSrc: MODULE_ICON,
    lazy: true,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.Domain",
    caption: "Domain",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}domain.svg`,
    order: KB_EXPLORER_ORDER.domain
  },
  {
    id: "Root_Module.General.GlobalEvents",
    caption: "GlobalEvents",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
    order: KB_EXPLORER_ORDER.globalEvents
  }
];

const kbExplorerModel_RootModule_General_UI: TreeViewItemModel[] = [
  {
    id: "Root_Module.General.UI.DesignSystem",
    caption: "DesignSystem",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.UI.Q2",
    caption: "Q2",
    startImgSrc: FOLDER_ICON,
    lazy: true,
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.General.UI.Popups",
    caption: "Popups",
    startImgSrc: MODULE_ICON,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.UI.Stencils",
    caption: "Stencils",
    startImgSrc: FOLDER_ICON,
    lazy: true,
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.General.UI.Domain",
    caption: "Domain",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}domain.svg`,
    order: KB_EXPLORER_ORDER.domain
  },
  {
    id: "Root_Module.General.UI.Login",
    caption: "Login",
    parts: "item--pending-commit",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  }
];

const kbExplorerModel_RootModule_General_UI_Q2: TreeViewItemModel[] = [
  {
    id: "Root_Module.General.UI.Q2.ContactUs",
    caption: "ContactUs",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Root_Module.General.UI.Q2.ProjectDetail",
    caption: "ProjectDetail",
    parts: "item--pending-commit",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Root_Module.General.UI.Q2.MyApps",
    caption: "MyApps",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  }
];

const kbExplorerModel_RootModule_General_UI_Stencils: TreeViewItemModel[] = [
  {
    id: "Root_Module.General.UI.Stencils.StencilPublishProject",
    caption: "StencilPublishProject",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}stencil.svg`,
    order: KB_EXPLORER_ORDER.stencil
  }
];

export const importObjectsModel = [
  {
    id: "Category",
    caption: "Category",
    startImgSrc: `${ASSETS_PREFIX}category.svg`,
    items: [
      {
        id: "Category.Main_Programs",
        caption: "Main Programs",
        startImgSrc: `${ASSETS_PREFIX}category.svg`,
        leaf: true
      }
    ]
  },
  {
    id: "Design System",
    caption: "Design System",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    items: [
      {
        id: "Design_System.ActionGroup",
        caption: "ActionGroup",
        startImgSrc: `${ASSETS_PREFIX}dso.svg`,
        leaf: true
      },
      {
        id: "Design_System.DynamicActionGroup",
        caption: "DynamicActionGroup",
        startImgSrc: `${ASSETS_PREFIX}dso.svg`,
        leaf: true
      },
      {
        id: "Design_System.UserControls",
        caption: "UserControls",
        startImgSrc: `${ASSETS_PREFIX}dso.svg`,
        leaf: true
      },
      {
        id: "Design_System.Dropdown",
        caption: "Dropdown",
        startImgSrc: `${ASSETS_PREFIX}dso.svg`,
        leaf: true
      },
      {
        id: "Design_System.UnanimoAngularWithoutUserControls",
        caption: "UnanimoAngularWithoutUserControls",
        startImgSrc: `${ASSETS_PREFIX}dso.svg`,
        leaf: true
      }
    ]
  },
  {
    id: "Module",
    caption: "Module",
    startImgSrc: `${ASSETS_PREFIX}module.svg`,
    indeterminate: true,
    items: [
      {
        id: "Module.General",
        caption: "General",
        startImgSrc: `${ASSETS_PREFIX}module.svg`,
        leaf: true
      },
      {
        id: "Module.General.UI",
        caption: "General.UI",
        startImgSrc: `${ASSETS_PREFIX}module.svg`,
        leaf: true
      },
      {
        id: "Module.General.Services",
        caption: "General.Services",
        startImgSrc: `${ASSETS_PREFIX}module.svg`,
        leaf: true
      },
      {
        id: "Module.GeneralReporting",
        caption: "GeneralReporting",
        startImgSrc: `${ASSETS_PREFIX}module.svg`,
        leaf: true
      },
      {
        id: "Module.GeneXusUnanimo",
        caption: "GeneXusUnanimo",
        checked: false,
        startImgSrc: `${ASSETS_PREFIX}module.svg`,
        leaf: true
      },
      {
        id: "Module.GeneXus",
        caption: "GeneXus",
        checked: false,
        startImgSrc: `${ASSETS_PREFIX}module.svg`,
        leaf: true
      }
    ]
  },
  {
    id: "Data Provider",
    caption: "Data Provider",
    startImgSrc: `${ASSETS_PREFIX}data-provider.svg`,
    items: [
      {
        id: "Data_Provider.General.UI.SidebarItemsDP",
        caption: "General.UI.SidebarItemsDP",
        startImgSrc: `${ASSETS_PREFIX}data-provider.svg`,
        leaf: true
      }
    ]
  },
  {
    id: "Panel",
    caption: "Panel",
    lazy: true,
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`
  }
];

const importOBjectsPanelModel: TreeViewItemModel[] = [
  {
    id: "Panel.ActionGroupTests",
    caption: "ActionGroupTests",
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    leaf: true
  },
  {
    id: "Panel.DropdownTests",
    caption: "DropdownTests",
    startImgSrc: `${ASSETS_PREFIX}panel-for-sd.svg`,
    metadata: "Panel",
    leaf: true
  }
];

export const preferencesModel: TreeViewItemModel[] = [
  {
    id: "root",
    caption: "GeneXusNext",
    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
    expanded: true,
    items: [
      {
        id: "Environment.GeneXusNext",
        caption: "GeneXusNext Develop",
        lazy: true,
        startImgSrc: `${ASSETS_PREFIX}version.svg`
      },
      {
        id: "Environment.TeamDev",
        caption: "Team Development",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}teamdev.svg`,
        order: 1
      },
      {
        id: "Environment.Patterns",
        caption: "Patterns",
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        order: 2,
        items: [
          {
            id: "Environment.Patterns.ConversationalFlows",
            caption: "Conversational Flows",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}conversational-flows.svg`
          },
          {
            id: "Environment.Patterns.WorkWith",
            caption: "Work With",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}workwith-for-sd.svg`
          },
          {
            id: "Environment.Patterns.WorkWithForWeb",
            caption: "Work With for Web",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}work-with-web.svg`
          }
        ]
      },
      {
        id: "Environment.Workflow",
        caption: "Workflow",
        startImgSrc: `${ASSETS_PREFIX}workflow.svg`,
        order: 3,
        items: [
          {
            id: "Environment.Workflow.Roles",
            caption: "Roles",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}roles.svg`,
            order: 0
          },
          {
            id: "Environment.Workflow.Documents",
            caption: "Documents",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}document-workflow.svg`,
            order: 1
          },
          {
            id: "Environment.Workflow.Calendars",
            caption: "Calendars",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}calendars.svg`,
            order: 2
          },
          {
            id: "Environment.Workflow.Notification_Templates",
            caption: "Notification templates",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}notification-templates.svg`,
            order: 3
          }
        ]
      }
    ]
  }
];

const Environment_GeneXusNext_preferencesModel: TreeViewItemModel[] = [
  {
    id: "Environment.GeneXusNext.JavaMySQL",
    caption: "JavaMySQL",
    startImgSrc: `${ASSETS_PREFIX}java.svg`,
    items: [
      {
        id: "Environment.GeneXusNext.JavaMySQL.Backend",
        caption: "Back end",
        startImgSrc: `${ASSETS_PREFIX}generator.svg`,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.DefaultJava",
            caption: "Default (Java)",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}java.svg`,
            order: 0
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores",
            caption: "Data Stores",
            startImgSrc: `${ASSETS_PREFIX}datastore.svg`,
            order: 1,
            items: [
              {
                id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores.DefaultMySQL",
                caption: "Default (MySQL)",
                leaf: true,
                startImgSrc: `${ASSETS_PREFIX}mysql.svg`
              },
              {
                id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores.GAMMySQL",
                caption: "GAM (MySQL)",
                leaf: true,
                startImgSrc: `${ASSETS_PREFIX}mysql.svg`,
                order: 1
              }
            ]
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.Services",
            caption: "Services",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}datastore-green.svg`,
            order: 2
          }
        ]
      },
      {
        id: "Environment.GeneXusNext.JavaMySQL.Frontend",
        caption: "Front end",
        startImgSrc: `${ASSETS_PREFIX}sd.svg`,
        order: 1,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Frontend.WebJava",
            caption: "Web (Java)",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}java.svg`
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Frontend.WebAngular",
            caption: "Web (Angular)",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}angular.svg`,
            order: 1
          }
        ]
      },
      {
        id: "Environment.GeneXusNext.JavaMySQL.Deployment",
        caption: "Deployment",
        startImgSrc: `${ASSETS_PREFIX}deployment-unit.svg`,
        order: 2,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Deployment.Backend",
            caption: "Backend",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}deployment-unit.svg`
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Deployment.Frontend",
            caption: "Frontend",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}deployment-unit.svg`
          }
        ]
      }
    ]
  }
];

export const lazyLoadItemsDictionary = {
  root: kbExplorer_root,
  Main_Programs: kbExplorerModel_MainPrograms,
  Root_Module: kbExplorerModel_RootModule,
  Customization: kbExplorerModel_Customization,
  "Customization.Localization": kbExplorerModel_Customization_Localization,
  "Root_Module.General": kbExplorerModel_RootModule_General,
  "Root_Module.General.UI": kbExplorerModel_RootModule_General_UI,
  "Root_Module.General.UI.Q2": kbExplorerModel_RootModule_General_UI_Q2,
  "Root_Module.General.UI.Stencils":
    kbExplorerModel_RootModule_General_UI_Stencils,
  Panel: importOBjectsPanelModel,
  "Environment.GeneXusNext": Environment_GeneXusNext_preferencesModel
} as const satisfies { [key in string]: TreeViewItemModel[] };

export const lazyLargeModel: TreeViewItemModel[] = [];

for (let i = 0; i < FIRST_LEVEL_SIZE; i++) {
  lazyLargeModel.push({
    id: "item-" + i,
    caption: "item-" + i,
    lazy: true,
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    items: []
  });
}

export const eagerLargeModel: TreeViewItemModel[] = [];

for (let i = 0; i < FIRST_LEVEL_SIZE; i++) {
  const subEagerLargeModel = [];
  const modelId = "item-" + i;

  for (let j = 0; j < SECOND_LEVEL_SIZE; j++) {
    const subModelId = modelId + "-" + j;
    const subSubEagerLargeModel = [];

    for (let k = 0; k < THIRD_LEVEL_SIZE; k++) {
      const subSubModelId = subModelId + "-" + k;

      subSubEagerLargeModel.push({
        id: subSubModelId,
        caption: subSubModelId,
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}file.svg`
      });
    }

    subEagerLargeModel.push({
      id: subModelId,
      caption: subModelId,
      expanded: true,
      leaf: false,
      startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
      items: subSubEagerLargeModel
    });
  }

  eagerLargeModel.push({
    id: modelId,
    caption: modelId,
    expanded: true,
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    items: subEagerLargeModel
  });
}

const modelLazyUpdated1: TreeViewItemModel[] = [
  {
    id: "lazy-loaded-1",
    caption: "Lazy Loaded 1 (drag disabled)",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    checkbox: true,
    dragDisabled: true
  },
  {
    id: "lazy-loaded-2",
    caption: "Lazy Loaded 2 (lazy, drag disabled, drop disabled)",
    leaf: false,
    lazy: true,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    toggleCheckboxes: true
  }
];

const modelLazyUpdated2: TreeViewItemModel[] = [
  {
    id: "lazy-loaded-3",
    caption: "Lazy Loaded 3 (drag disabled)",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    checkbox: true,
    dragDisabled: true
  },
  {
    id: "lazy-loaded-4",
    caption: "Lazy Loaded 4 (drag disabled)",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    checkbox: true,
    dragDisabled: true
  }
];

export const lazyLoadTreeItemsCallback: LazyLoadTreeItemsCallback = modelId =>
  new Promise(resolve => {
    let lazyModel =
      modelId === "lazy-loaded-2" ? modelLazyUpdated2 : modelLazyUpdated1;

    if (modelId.startsWith("item-")) {
      lazyModel = [];

      for (let j = 0; j < SECOND_LEVEL_SIZE; j++) {
        const subModelId = modelId + "-" + j;
        const subModelItems = [];

        for (let k = 0; k < THIRD_LEVEL_SIZE; k++) {
          subModelItems.push({
            id: subModelId + "-" + k,
            caption: subModelId + "-" + k,
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}file.svg`
          });
        }

        lazyModel.push({
          id: subModelId,
          caption: subModelId,
          expanded: true,
          leaf: false,
          startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
          items: subModelItems
        });
      }
    }

    const lazyModelResultFromDictionary = lazyLoadItemsDictionary[modelId];

    if (lazyModelResultFromDictionary) {
      lazyModel = lazyModelResultFromDictionary;
    }

    setTimeout(() => {
      resolve(structuredClone(lazyModel));
    }, 500); // Resolves or rejects after 500ms second
  });

export const disabledItemsModel = [
  {
    id: "number-1",
    caption: "number-1",
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
    items: [
      {
        id: "number-1-1",
        caption: "number-1-1",
        class: "ch-tree-view-item--success",
        leaf: false,
        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
        items: [
          {
            id: "number-1-1-1",
            caption: "number-1-1-1",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
          },
          {
            id: "number-1-1-2",
            caption: "number-1-1-2",
            leaf: false,
            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
            items: [
              {
                id: "number-1-1-2-1",
                caption: "number-1-1-2-1",
                leaf: false,
                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                items: [
                  {
                    id: "new-item-added-1",
                    caption: "new-item-added-1",
                    disabled: true,
                    leaf: true,
                    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                  },
                  {
                    id: "new-item-added-2",
                    caption: "new-item-added-2",
                    disabled: false,
                    leaf: true,
                    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                  },
                  {
                    id: "new-item-added-3",
                    caption: "new-item-added-3",
                    disabled: true,
                    leaf: true,
                    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                  },
                  {
                    id: "new-item-added-4",
                    caption: "new-item-added-4",
                    disabled: false,
                    expanded: true,
                    leaf: false,
                    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                    items: [
                      {
                        id: "new-item-added-4-1",
                        caption: "new-item-added-4-1",
                        disabled: false,
                        leaf: true,
                        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                      },
                      {
                        id: "new-item-added-4-2",
                        caption: "new-item-added-4-2",
                        disabled: true,
                        expanded: true,
                        leaf: false,
                        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                        items: [
                          {
                            id: "new-item-added-4-2-1",
                            caption: "new-item-added-4-2-1",
                            disabled: true,
                            expanded: true,
                            leaf: false,
                            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                            items: [
                              {
                                id: "new-item-added-4-2-1-1",
                                caption: "new-item-added-4-2-1-1",
                                disabled: false,
                                leaf: true,
                                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                              },
                              {
                                id: "new-item-added-4-2-1-2",
                                caption: "new-item-added-4-2-1-2",
                                disabled: false,
                                leaf: true,
                                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                              },
                              {
                                id: "new-item-added-4-2-1-3",
                                caption: "new-item-added-4-2-1-3",
                                disabled: true,
                                leaf: true,
                                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                              },
                              {
                                id: "new-item-added-4-2-1-4",
                                caption: "new-item-added-4-2-1-4",
                                disabled: false,
                                leaf: true,
                                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                              }
                            ]
                          },
                          {
                            id: "new-item-added-4-2-2",
                            caption: "new-item-added-4-2-2",
                            disabled: true,
                            leaf: true,
                            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                          }
                        ]
                      }
                    ]
                  },
                  {
                    id: "new-item-added-5",
                    caption: "new-item-added-5",
                    disabled: true,
                    expanded: true,
                    leaf: false,
                    startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                    items: [
                      {
                        id: "new-item-added-5-1",
                        caption: "new-item-added-5-1",
                        disabled: false,
                        leaf: true,
                        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                      },
                      {
                        id: "new-item-added-5-2",
                        caption: "new-item-added-5-2",
                        disabled: true,
                        leaf: true,
                        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
                      }
                    ]
                  }
                ]
              },
              {
                id: "number-1-1-2-2",
                caption: "number-1-1-2-2",
                leaf: true,
                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
              }
            ]
          }
        ]
      },
      {
        id: "number-1-2",
        caption: "number-1-2",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
      }
    ]
  },
  {
    id: "number-2",
    caption: "number-2",
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}datastore.svg`,
    items: [
      {
        id: "number-2-1",
        caption: "number-2-1",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`
      },
      {
        id: "number-2-2",
        caption: "number-2-2",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`
      },
      {
        id: "number-2-3",
        caption: "number-2-3",
        disabled: true,
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`
      }
    ]
  },
  {
    id: "number-3",
    caption: "number-3",
    leaf: false,
    disabled: true,
    expanded: true,
    startImgSrc: `${ASSETS_PREFIX}datastore.svg`,
    items: [
      {
        id: "number-3-1",
        caption: "number-3-1",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`
      },
      {
        id: "number-3-2",
        caption: "number-3-2",
        disabled: true,
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`
      },
      {
        id: "number-3-3",
        caption: "number-3-3",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`
      }
    ]
  }
];

export const simpleModel1 = [
  {
    id: "number-1",
    caption: "number-1 label (always editable)",
    class: "tree-view-item tree-view-item--success",
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}datastore.svg`,
    editable: true,
    items: [
      {
        id: "number-1-1",
        caption: "number-1-1 (always editable)",
        leaf: false,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        editable: true,
        items: [
          {
            id: "number-1-1-1",
            caption: "number-1-1-1",
            leaf: true,
            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
          },
          {
            id: "number-1-1-2",
            caption: "number-1-1-2",
            leaf: false,
            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
            items: [
              {
                id: "number-1-1-2-1",
                caption: "number-1-1-2-1 (lazy, drag disabled)",
                leaf: false,
                startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
                lazy: true,
                checkbox: true,
                dragDisabled: true,
                toggleCheckboxes: true
              },
              {
                id: "number-1-1-2-2",
                caption: "number-1-1-2-2",
                leaf: true,
                startImgSrc: `${ASSETS_PREFIX}java.svg`
              }
            ]
          }
        ]
      },
      {
        id: "number-1-2",
        caption: "number-1-2",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
      }
    ]
  },
  {
    id: "number-2",
    caption: "number-2",
    class: "tree-view-item tree-view-item--custom-image",
    leaf: false,
    items: [
      {
        id: "number-2-1",
        caption: "number-2-1",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}java.svg`
      },
      {
        id: "number-2-2",
        caption: "number-2-2",
        leaf: true,
        startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
      }
    ]
  }
];

export const simpleModel2 = [
  {
    id: "number-a",
    caption: "number-a (always editable)",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}apple.svg`,
    editable: true
  },
  {
    id: "number-b",
    caption: "number-b",
    leaf: false,
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    items: [
      {
        id: "number-2.1",
        caption: "number-2.1",
        leaf: false,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        items: [
          {
            id: "number-2.1.1",
            caption: "number-2.1.1",
            leaf: false,
            startImgSrc: `${ASSETS_PREFIX}java.svg`,
            items: [
              {
                id: "number-2.1.1.1",
                caption: "number-2.1.1.1",
                leaf: true,
                startImgSrc: `${ASSETS_PREFIX}mysql.svg`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "number-3",
    caption: "number-3",
    leaf: true,
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`
  }
];

export const checkDroppableZoneCallback: (
  dropInformation: TreeViewDropCheckInfo
) => Promise<boolean> = () =>
  new Promise(resolve => {
    const accept = true;

    setTimeout(() => {
      resolve(accept);
    }, 500); // Resolves after 500 ms
  });

export const dropItemsCallback: (
  dataTransferInfo: TreeViewDataTransferInfo
) => Promise<{
  acceptDrop: boolean;
  items?: TreeViewItemModel[];
}> = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ acceptDrop: true, items: simpleModel1 });
    }, 25); // Resolves after 25 ms
  });

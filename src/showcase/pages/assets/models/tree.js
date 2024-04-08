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

const fileSystem_root = [
  {
    id: "dev",
    caption: "dev",
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true
  },
  {
    id: "etc",
    caption: "etc",
    editable: false,
    class: "tree-view-item tree-view-item--folder",
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "cups",
        caption: "cups",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        startImgSrc: "assets/icons/file.svg",
        leaf: true
      },
      {
        id: "httpd",
        caption: "httpd",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        startImgSrc: "assets/icons/file.svg",
        leaf: true
      },
      {
        id: "init",
        caption: "init.d",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        startImgSrc: "assets/icons/file.svg",
        leaf: true
      }
    ]
  },
  {
    id: "sbin",
    caption: "sbin",
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true
  },
  {
    id: "tmp",
    caption: "tmp",
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true
  },
  {
    id: "Users",
    caption: "Users",
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "jdoe",
        caption: "jdoe",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "jmiller",
        caption: "jmiller",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "mysql",
        caption: "mysql",
        class: "tree-view-item tree-view-item--folder",
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
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "bin",
        caption: "bin",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "lib",
        caption: "lib",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "local",
        caption: "local",
        class: "tree-view-item tree-view-item--folder",
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
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    items: [
      {
        id: "log",
        caption: "log",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "spool",
        caption: "spool",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      },
      {
        id: "yp",
        caption: "yp",
        class: "tree-view-item tree-view-item--folder",
        editable: false,
        dragDisabled: true,
        dropDisabled: true,
        leaf: true
      }
    ]
  }
];

export const fileSystemModel = [
  {
    id: "root",
    caption: "/",
    class: "tree-view-item tree-view-item--folder",
    editable: false,
    expanded: true,
    dragDisabled: true,
    dropDisabled: true,
    items: fileSystem_root
  }
];

const kbExplorer_root = [
  {
    id: "Main_Programs",
    caption: "Main Programs",
    editable: false,
    startImgSrc: "assets/icons/category.svg",
    dragDisabled: true,
    dropDisabled: true,
    lazy: true,
    order: 0
  },
  {
    id: "Root_Module",
    caption: "Root Module",
    editable: false,
    class: "tree-view-item tree-view-item--module",
    dragDisabled: true,
    lazy: true,
    order: 1
  },
  {
    id: "References",
    caption: "References",
    editable: false,
    startImgSrc: "assets/icons/references.svg",
    dragDisabled: true,
    dropDisabled: true,
    order: 2
  },
  {
    id: "Customization",
    caption: "Customization",
    editable: false,
    startImgSrc: "assets/icons/customization.svg",
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
    startImgSrc: "assets/icons/document.svg",
    dragDisabled: true,
    dropDisabled: true,
    order: 4
  }
];

export const kbExplorerModel = [
  {
    id: "root",
    caption: "GeneXusNext Develop",
    editable: false,
    expanded: true,
    leaf: false,
    startImgSrc: "assets/icons/version.svg",
    dragDisabled: true,
    dropDisabled: true,
    items: kbExplorer_root
  }
];

const kbExplorerModel_MainPrograms = [
  {
    id: "Main_Programs.Prompt",
    caption: "Prompt",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Main_Programs.ApiHealthCheck",
    caption: "ApiHealthCheck",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/api.svg",
    order: KB_EXPLORER_ORDER.api
  },
  {
    id: "Main_Programs.BackHome",
    caption: "BackHome",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/web-panel.svg",
    order: KB_EXPLORER_ORDER.webPanel
  },
  {
    id: "Main_Programs.Login",
    caption: "Login",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/web-panel.svg",
    order: KB_EXPLORER_ORDER.webPanel
  },
  {
    id: "Main_Programs.ProvisioningServices",
    caption: "ProvisioningServices",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/api.svg",
    order: KB_EXPLORER_ORDER.api
  },
  {
    id: "Main_Programs.VersionCheck",
    caption: "VersionCheck",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/procedure.svg",
    order: KB_EXPLORER_ORDER.procedure
  }
];

const kbExplorerModel_RootModule = [
  {
    id: "Root_Module.IDE",
    caption: "IDE",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.BL",
    caption: "BL",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General",
    caption: "General",
    class: "tree-view-item tree-view-item--module",
    lazy: true,
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.AWS_internal",
    caption: "AWS_internal",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.DataModel",
    caption: "DataModel",
    class: "tree-view-item tree-view-item--folder",
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.Back",
    caption: "Back",
    class: "tree-view-item tree-view-item--folder",
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.Tests",
    caption: "Tests",
    class: "tree-view-item tree-view-item--folder",
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.Images",
    caption: "Images",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/image.svg",
    order: KB_EXPLORER_ORDER.images
  },
  {
    id: "Root_Module.GXNext",
    caption: "GXNext",
    leaf: true,
    startImgSrc: "assets/icons/dso.svg",
    order: KB_EXPLORER_ORDER.dso
  },
  {
    id: "Root_Module.GeneXusNext",
    caption: "GeneXusNext",
    leaf: true,
    startImgSrc: "assets/icons/dso.svg",
    order: KB_EXPLORER_ORDER.dso
  },
  {
    id: "Root_Module.Files",
    caption: "Files",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/file.svg",
    order: KB_EXPLORER_ORDER.files
  },
  {
    id: "Root_Module.Domain",
    caption: "Domain",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/domain.svg",
    order: KB_EXPLORER_ORDER.domain
  }
];

const kbExplorerModel_Customization = [
  {
    id: "Customization.Files",
    caption: "Files",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/file.svg",
    order: KB_EXPLORER_ORDER.files
  },
  {
    id: "Customization.Images",
    caption: "Images",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/image.svg",
    order: KB_EXPLORER_ORDER.images
  },
  {
    id: "Customization.Localization",
    caption: "Localization",
    dragDisabled: true,
    dropDisabled: true,
    lazy: true,
    startImgSrc: "assets/icons/lenguage.svg",
    order: KB_EXPLORER_ORDER.localization
  }
];

const kbExplorerModel_Customization_Localization = [
  {
    id: "Customization.Localization.Arabic",
    caption: "Arabic",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/lenguage.svg",
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
    startImgSrc: "assets/icons/lenguage.svg",
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.Spanish",
    caption: "Spanish",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/lenguage.svg",
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.Italian",
    caption: "Italian",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/lenguage.svg",
    order: KB_EXPLORER_ORDER.localization
  }
];

const kbExplorerModel_RootModule_General = [
  {
    id: "Root_Module.General.Security",
    caption: "Security",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.Services",
    caption: "Services",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.UI",
    caption: "UI",
    class: "tree-view-item tree-view-item--module",
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
    startImgSrc: "assets/icons/domain.svg",
    order: KB_EXPLORER_ORDER.domain
  },
  {
    id: "Root_Module.General.GlobalEvents",
    caption: "GlobalEvents",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    startImgSrc: "assets/icons/external-object.svg",
    order: KB_EXPLORER_ORDER.globalEvents
  }
];

const kbExplorerModel_RootModule_General_UI = [
  {
    id: "Root_Module.General.UI.DesignSystem",
    caption: "DesignSystem",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.UI.Q2",
    caption: "Q2",
    class: "tree-view-item tree-view-item--folder",
    lazy: true,
    order: KB_EXPLORER_ORDER.folder
  },
  {
    id: "Root_Module.General.UI.Popups",
    caption: "Popups",
    class: "tree-view-item tree-view-item--module",
    order: KB_EXPLORER_ORDER.module
  },
  {
    id: "Root_Module.General.UI.Stencils",
    caption: "Stencils",
    class: "tree-view-item tree-view-item--folder",
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
    startImgSrc: "assets/icons/domain.svg",
    order: KB_EXPLORER_ORDER.domain
  },
  {
    id: "Root_Module.General.UI.Login",
    caption: "Login",
    class: "tree-view-item tree-view-item--pending-commit",
    leaf: true,
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  }
];

const kbExplorerModel_RootModule_General_UI_Q2 = [
  {
    id: "Root_Module.General.UI.Q2.ContactUs",
    caption: "ContactUs",
    leaf: true,
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Root_Module.General.UI.Q2.ProjectDetail",
    caption: "ProjectDetail",
    class: "tree-view-item tree-view-item--pending-commit",
    leaf: true,
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Root_Module.General.UI.Q2.MyApps",
    caption: "MyApps",
    leaf: true,
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    order: KB_EXPLORER_ORDER.sdPanel
  }
];

const kbExplorerModel_RootModule_General_UI_Stencils = [
  {
    id: "Root_Module.General.UI.Stencils.StencilPublishProject",
    caption: "StencilPublishProject",
    leaf: true,
    startImgSrc: "assets/icons/stencil.svg",
    order: KB_EXPLORER_ORDER.stencil
  }
];

export const importObjectsModel = [
  {
    id: "Category",
    caption: "Category",
    startImgSrc: "assets/icons/category.svg",
    items: [
      {
        id: "Category.Main_Programs",
        caption: "Main Programs",
        startImgSrc: "assets/icons/category.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Design System",
    caption: "Design System",
    startImgSrc: "assets/icons/dso.svg",
    items: [
      {
        id: "Design_System.ActionGroup",
        caption: "ActionGroup",
        startImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.DynamicActionGroup",
        caption: "DynamicActionGroup",
        startImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.UserControls",
        caption: "UserControls",
        startImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.Dropdown",
        caption: "Dropdown",
        startImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.UnanimoAngularWithoutUserControls",
        caption: "UnanimoAngularWithoutUserControls",
        startImgSrc: "assets/icons/dso.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Module",
    caption: "Module",
    startImgSrc: "assets/icons/module.svg",
    indeterminate: true,
    items: [
      {
        id: "Module.General",
        caption: "General",
        startImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.General.UI",
        caption: "General.UI",
        startImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.General.Services",
        caption: "General.Services",
        startImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.GeneralReporting",
        caption: "GeneralReporting",
        startImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.GeneXusUnanimo",
        caption: "GeneXusUnanimo",
        checked: false,
        startImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.GeneXus",
        caption: "GeneXus",
        checked: false,
        startImgSrc: "assets/icons/module.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Data Provider",
    caption: "Data Provider",
    startImgSrc: "assets/icons/data-provider.svg",
    items: [
      {
        id: "Data_Provider.General.UI.SidebarItemsDP",
        caption: "General.UI.SidebarItemsDP",
        startImgSrc: "assets/icons/data-provider.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Panel",
    caption: "Panel",
    lazy: true,
    startImgSrc: "assets/icons/panel-for-sd.svg"
  }
];

const importOBjectsPanelModel = [
  {
    id: "Panel.ActionGroupTests",
    caption: "ActionGroupTests",
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    leaf: true
  },
  {
    id: "Panel.DropdownTests",
    caption: "DropdownTests",
    startImgSrc: "assets/icons/panel-for-sd.svg",
    metadata: "Panel",
    leaf: true
  }
];

export const preferencesModel = [
  {
    id: "root",
    caption: "GeneXusNext",
    startImgSrc: "assets/icons/knowledge-base.svg",
    expanded: true,
    items: [
      {
        id: "Environment.GeneXusNext",
        caption: "GeneXusNext Develop",
        lazy: true,
        startImgSrc: "assets/icons/version.svg"
      },
      {
        id: "Environment.TeamDev",
        caption: "Team Development",
        leaf: true,
        startImgSrc: "assets/icons/teamdev.svg",
        order: 1
      },
      {
        id: "Environment.Patterns",
        caption: "Patterns",
        startImgSrc: "assets/icons/patterns.svg",
        order: 2,
        items: [
          {
            id: "Environment.Patterns.ConversationalFlows",
            caption: "Conversational Flows",
            leaf: true,
            startImgSrc: "assets/icons/conversational-flows.svg"
          },
          {
            id: "Environment.Patterns.WorkWith",
            caption: "Work With",
            leaf: true,
            startImgSrc: "assets/icons/workwith-for-sd.svg"
          },
          {
            id: "Environment.Patterns.WorkWithForWeb",
            caption: "Work With for Web",
            leaf: true,
            startImgSrc: "assets/icons/work-with-web.svg"
          }
        ]
      },
      {
        id: "Environment.Workflow",
        caption: "Workflow",
        startImgSrc: "assets/icons/workflow.svg",
        order: 3,
        items: [
          {
            id: "Environment.Workflow.Roles",
            caption: "Roles",
            leaf: true,
            startImgSrc: "assets/icons/roles.svg",
            order: 0
          },
          {
            id: "Environment.Workflow.Documents",
            caption: "Documents",
            leaf: true,
            startImgSrc: "assets/icons/document-workflow.svg",
            order: 1
          },
          {
            id: "Environment.Workflow.Calendars",
            caption: "Calendars",
            leaf: true,
            startImgSrc: "assets/icons/calendars.svg",
            order: 2
          },
          {
            id: "Environment.Workflow.Notification_Templates",
            caption: "Notification templates",
            leaf: true,
            startImgSrc: "assets/icons/notification-templates.svg",
            order: 3
          }
        ]
      }
    ]
  }
];

const Environment_GeneXusNext_preferencesModel = [
  {
    id: "Environment.GeneXusNext.JavaMySQL",
    caption: "JavaMySQL",
    startImgSrc: "assets/icons/java.svg",
    items: [
      {
        id: "Environment.GeneXusNext.JavaMySQL.Backend",
        caption: "Back end",
        startImgSrc: "assets/icons/generator.svg",
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.DefaultJava",
            caption: "Default (Java)",
            leaf: true,
            startImgSrc: "assets/icons/java.svg",
            order: 0
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores",
            caption: "Data Stores",
            startImgSrc: "assets/icons/datastore.svg",
            order: 1,
            items: [
              {
                id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores.DefaultMySQL",
                caption: "Default (MySQL)",
                leaf: true,
                startImgSrc: "assets/icons/mysql.svg"
              },
              {
                id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores.GAMMySQL",
                caption: "GAM (MySQL)",
                leaf: true,
                startImgSrc: "assets/icons/mysql.svg",
                order: 1
              }
            ]
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.Services",
            caption: "Services",
            leaf: true,
            startImgSrc: "assets/icons/datastore-green.svg",
            order: 2
          }
        ]
      },
      {
        id: "Environment.GeneXusNext.JavaMySQL.Frontend",
        caption: "Front end",
        startImgSrc: "assets/icons/sd.svg",
        order: 1,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Frontend.WebJava",
            caption: "Web (Java)",
            leaf: true,
            startImgSrc: "assets/icons/java.svg"
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Frontend.WebAngular",
            caption: "Web (Angular)",
            leaf: true,
            startImgSrc: "assets/icons/angular.svg",
            order: 1
          }
        ]
      },
      {
        id: "Environment.GeneXusNext.JavaMySQL.Deployment",
        caption: "Deployment",
        startImgSrc: "assets/icons/deployment-unit.svg",
        order: 2,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Deployment.Backend",
            caption: "Backend",
            leaf: true,
            startImgSrc: "assets/icons/deployment-unit.svg"
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Deployment.Frontend",
            caption: "Frontend",
            leaf: true,
            startImgSrc: "assets/icons/deployment-unit.svg"
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
};

export const eagerLargeModel = [];

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
        startImgSrc: "./assets/icons/file.svg"
      });
    }

    subEagerLargeModel.push({
      id: subModelId,
      caption: subModelId,
      expanded: true,
      leaf: false,
      startImgSrc: "./assets/icons/knowledge-base.svg",
      items: subSubEagerLargeModel
    });
  }

  eagerLargeModel.push({
    id: modelId,
    caption: modelId,
    expanded: true,
    leaf: false,
    startImgSrc: "assets/icons/patterns.svg",
    items: subEagerLargeModel
  });
}

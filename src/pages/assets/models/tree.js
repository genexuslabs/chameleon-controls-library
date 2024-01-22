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

const kbExplorer_root = [
  {
    id: "Main_Programs",
    caption: "Main Programs",
    editable: false,
    leftImgSrc: "assets/icons/category.svg",
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
    leftImgSrc: "assets/icons/references.svg",
    dragDisabled: true,
    dropDisabled: true,
    order: 2
  },
  {
    id: "Customization",
    caption: "Customization",
    editable: false,
    leftImgSrc: "assets/icons/customization.svg",
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
    leftImgSrc: "assets/icons/document.svg",
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
    leftImgSrc: "assets/icons/version.svg",
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
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Main_Programs.ApiHealthCheck",
    caption: "ApiHealthCheck",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/api.svg",
    order: KB_EXPLORER_ORDER.api
  },
  {
    id: "Main_Programs.BackHome",
    caption: "BackHome",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/web-panel.svg",
    order: KB_EXPLORER_ORDER.webPanel
  },
  {
    id: "Main_Programs.Login",
    caption: "Login",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/web-panel.svg",
    order: KB_EXPLORER_ORDER.webPanel
  },
  {
    id: "Main_Programs.ProvisioningServices",
    caption: "ProvisioningServices",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/api.svg",
    order: KB_EXPLORER_ORDER.api
  },
  {
    id: "Main_Programs.VersionCheck",
    caption: "VersionCheck",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/procedure.svg",
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
    leftImgSrc: "assets/icons/image.svg",
    order: KB_EXPLORER_ORDER.images
  },
  {
    id: "Root_Module.GXNext",
    caption: "GXNext",
    leaf: true,
    leftImgSrc: "assets/icons/dso.svg",
    order: KB_EXPLORER_ORDER.dso
  },
  {
    id: "Root_Module.GeneXusNext",
    caption: "GeneXusNext",
    leaf: true,
    leftImgSrc: "assets/icons/dso.svg",
    order: KB_EXPLORER_ORDER.dso
  },
  {
    id: "Root_Module.Files",
    caption: "Files",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/file.svg",
    order: KB_EXPLORER_ORDER.files
  },
  {
    id: "Root_Module.Domain",
    caption: "Domain",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/domain.svg",
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
    leftImgSrc: "assets/icons/file.svg",
    order: KB_EXPLORER_ORDER.files
  },
  {
    id: "Customization.Images",
    caption: "Images",
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/image.svg",
    order: KB_EXPLORER_ORDER.images
  },
  {
    id: "Customization.Localization",
    caption: "Localization",
    dragDisabled: true,
    dropDisabled: true,
    lazy: true,
    leftImgSrc: "assets/icons/lenguage.svg",
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
    leftImgSrc: "assets/icons/lenguage.svg",
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
    leftImgSrc: "assets/icons/lenguage.svg",
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.Spanish",
    caption: "Spanish",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/lenguage.svg",
    order: KB_EXPLORER_ORDER.localization
  },
  {
    id: "Customization.Localization.Italian",
    caption: "Italian",
    checkbox: true,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/lenguage.svg",
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
    leftImgSrc: "assets/icons/domain.svg",
    order: KB_EXPLORER_ORDER.domain
  },
  {
    id: "Root_Module.General.GlobalEvents",
    caption: "GlobalEvents",
    editable: false,
    dragDisabled: true,
    dropDisabled: true,
    leaf: true,
    leftImgSrc: "assets/icons/external-object.svg",
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
    leftImgSrc: "assets/icons/domain.svg",
    order: KB_EXPLORER_ORDER.domain
  },
  {
    id: "Root_Module.General.UI.Login",
    caption: "Login",
    class: "tree-view-item tree-view-item--pending-commit",
    leaf: true,
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    order: KB_EXPLORER_ORDER.sdPanel
  }
];

const kbExplorerModel_RootModule_General_UI_Q2 = [
  {
    id: "Root_Module.General.UI.Q2.ContactUs",
    caption: "ContactUs",
    leaf: true,
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Root_Module.General.UI.Q2.ProjectDetail",
    caption: "ProjectDetail",
    class: "tree-view-item tree-view-item--pending-commit",
    leaf: true,
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    order: KB_EXPLORER_ORDER.sdPanel
  },
  {
    id: "Root_Module.General.UI.Q2.MyApps",
    caption: "MyApps",
    leaf: true,
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    order: KB_EXPLORER_ORDER.sdPanel
  }
];

const kbExplorerModel_RootModule_General_UI_Stencils = [
  {
    id: "Root_Module.General.UI.Stencils.StencilPublishProject",
    caption: "StencilPublishProject",
    leaf: true,
    leftImgSrc: "assets/icons/stencil.svg",
    order: KB_EXPLORER_ORDER.stencil
  }
];

export const importObjectsModel = [
  {
    id: "Category",
    caption: "Category",
    leftImgSrc: "assets/icons/category.svg",
    items: [
      {
        id: "Category.Main_Programs",
        caption: "Main Programs",
        leftImgSrc: "assets/icons/category.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Design System",
    caption: "Design System",
    leftImgSrc: "assets/icons/dso.svg",
    items: [
      {
        id: "Design_System.ActionGroup",
        caption: "ActionGroup",
        leftImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.DynamicActionGroup",
        caption: "DynamicActionGroup",
        leftImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.UserControls",
        caption: "UserControls",
        leftImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.Dropdown",
        caption: "Dropdown",
        leftImgSrc: "assets/icons/dso.svg",
        leaf: true
      },
      {
        id: "Design_System.UnanimoAngularWithoutUserControls",
        caption: "UnanimoAngularWithoutUserControls",
        leftImgSrc: "assets/icons/dso.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Module",
    caption: "Module",
    leftImgSrc: "assets/icons/module.svg",
    indeterminate: true,
    items: [
      {
        id: "Module.General",
        caption: "General",
        leftImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.General.UI",
        caption: "General.UI",
        leftImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.General.Services",
        caption: "General.Services",
        leftImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.GeneralReporting",
        caption: "GeneralReporting",
        leftImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.GeneXusUnanimo",
        caption: "GeneXusUnanimo",
        checked: false,
        leftImgSrc: "assets/icons/module.svg",
        leaf: true
      },
      {
        id: "Module.GeneXus",
        caption: "GeneXus",
        checked: false,
        leftImgSrc: "assets/icons/module.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Data Provider",
    caption: "Data Provider",
    leftImgSrc: "assets/icons/data-provider.svg",
    items: [
      {
        id: "Data_Provider.General.UI.SidebarItemsDP",
        caption: "General.UI.SidebarItemsDP",
        leftImgSrc: "assets/icons/data-provider.svg",
        leaf: true
      }
    ]
  },
  {
    id: "Panel",
    caption: "Panel",
    lazy: true,
    leftImgSrc: "assets/icons/panel-for-sd.svg"
  }
];

const importOBjectsPanelModel = [
  {
    id: "Panel.ActionGroupTests",
    caption: "ActionGroupTests",
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    leaf: true
  },
  {
    id: "Panel.DropdownTests",
    caption: "DropdownTests",
    leftImgSrc: "assets/icons/panel-for-sd.svg",
    leaf: true
  }
];

export const preferencesModel = [
  {
    id: "root",
    caption: "GeneXusNext",
    leftImgSrc: "assets/icons/knowledge-base.svg",
    expanded: true,
    items: [
      {
        id: "Environment.GeneXusNext",
        caption: "GeneXusNext Develop",
        lazy: true,
        leftImgSrc: "assets/icons/version.svg"
      },
      {
        id: "Environment.TeamDev",
        caption: "Team Development",
        leaf: true,
        leftImgSrc: "assets/icons/teamdev.svg",
        order: 1
      },
      {
        id: "Environment.Patterns",
        caption: "Patterns",
        leftImgSrc: "assets/icons/patterns.svg",
        order: 2,
        items: [
          {
            id: "Environment.Patterns.ConversationalFlows",
            caption: "Conversational Flows",
            leaf: true,
            leftImgSrc: "assets/icons/conversational-flows.svg"
          },
          {
            id: "Environment.Patterns.WorkWith",
            caption: "Work With",
            leaf: true,
            leftImgSrc: "assets/icons/workwith-for-sd.svg"
          },
          {
            id: "Environment.Patterns.WorkWithForWeb",
            caption: "Work With for Web",
            leaf: true,
            leftImgSrc: "assets/icons/work-with-web.svg"
          }
        ]
      },
      {
        id: "Environment.Workflow",
        caption: "Workflow",
        leftImgSrc: "assets/icons/workflow.svg",
        order: 3,
        items: [
          {
            id: "Environment.Workflow.Roles",
            caption: "Roles",
            leaf: true,
            leftImgSrc: "assets/icons/roles.svg",
            order: 0
          },
          {
            id: "Environment.Workflow.Documents",
            caption: "Documents",
            leaf: true,
            leftImgSrc: "assets/icons/document-workflow.svg",
            order: 1
          },
          {
            id: "Environment.Workflow.Calendars",
            caption: "Calendars",
            leaf: true,
            leftImgSrc: "assets/icons/calendars.svg",
            order: 2
          },
          {
            id: "Environment.Workflow.Notification_Templates",
            caption: "Notification templates",
            leaf: true,
            leftImgSrc: "assets/icons/notification-templates.svg",
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
    leftImgSrc: "assets/icons/java.svg",
    items: [
      {
        id: "Environment.GeneXusNext.JavaMySQL.Backend",
        caption: "Back end",
        leftImgSrc: "assets/icons/generator.svg",
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.DefaultJava",
            caption: "Default (Java)",
            leaf: true,
            leftImgSrc: "assets/icons/java.svg",
            order: 0
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores",
            caption: "Data Stores",
            leftImgSrc: "assets/icons/datastore.svg",
            order: 1,
            items: [
              {
                id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores.DefaultMySQL",
                caption: "Default (MySQL)",
                leaf: true,
                leftImgSrc: "assets/icons/mysql.svg"
              },
              {
                id: "Environment.GeneXusNext.JavaMySQL.Backend.DataStores.GAMMySQL",
                caption: "GAM (MySQL)",
                leaf: true,
                leftImgSrc: "assets/icons/mysql.svg",
                order: 1
              }
            ]
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Backend.Services",
            caption: "Services",
            leaf: true,
            leftImgSrc: "assets/icons/datastore-green.svg",
            order: 2
          }
        ]
      },
      {
        id: "Environment.GeneXusNext.JavaMySQL.Frontend",
        caption: "Front end",
        leftImgSrc: "assets/icons/sd.svg",
        order: 1,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Frontend.WebJava",
            caption: "Web (Java)",
            leaf: true,
            leftImgSrc: "assets/icons/java.svg"
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Frontend.WebAngular",
            caption: "Web (Angular)",
            leaf: true,
            leftImgSrc: "assets/icons/angular.svg",
            order: 1
          }
        ]
      },
      {
        id: "Environment.GeneXusNext.JavaMySQL.Deployment",
        caption: "Deployment",
        leftImgSrc: "assets/icons/deployment-unit.svg",
        order: 2,
        items: [
          {
            id: "Environment.GeneXusNext.JavaMySQL.Deployment.Backend",
            caption: "Backend",
            leaf: true,
            leftImgSrc: "assets/icons/deployment-unit.svg"
          },
          {
            id: "Environment.GeneXusNext.JavaMySQL.Deployment.Frontend",
            caption: "Frontend",
            leaf: true,
            leftImgSrc: "assets/icons/deployment-unit.svg"
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
        leftImgSrc: "./assets/icons/file.svg"
      });
    }

    subEagerLargeModel.push({
      id: subModelId,
      caption: subModelId,
      expanded: true,
      leaf: false,
      leftImgSrc: "./assets/icons/knowledge-base.svg",
      items: subSubEagerLargeModel
    });
  }

  eagerLargeModel.push({
    id: modelId,
    caption: modelId,
    expanded: true,
    leaf: false,
    leftImgSrc: "assets/icons/patterns.svg",
    items: subEagerLargeModel
  });
}

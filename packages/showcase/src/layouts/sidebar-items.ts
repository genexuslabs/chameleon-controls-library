import type { NavigationListModel } from "../../../chameleon/dist/browser/development/components/navigation-list/types";

const DEVELOPER_PREVIEW = "Developer Preview";
const EXPERIMENTAL = "Experimental";
const STABLE = "Stable";

type Metadata = {
  component: string;
  status: typeof DEVELOPER_PREVIEW | typeof EXPERIMENTAL | typeof STABLE;
};

export const sidebarItems: NavigationListModel = [
  // Temporally disabled
  // {
  //   caption: "Getting started",
  //   startImgSrc:
  //     "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/company.svg')",
  //   startImgType: "mask",
  //   items: [
  //     {
  //       caption: "Browser support",
  //       link: { url: "/components/browser-support" }
  //     }
  //   ]
  // },

  {
    caption: "Components",
    expanded: true,
    startImgSrc:
      "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/projects.svg')",
    startImgType: "mask",
    items: [
      {
        caption: "Panel",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/overview.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/accordion/overview" },
            caption: "Accordion",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-accordion-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/flexible-layout/overview" },
            caption: "Flexible Layout",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-flexible-layout-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/layout-splitter/overview" },
            caption: "Layout Splitter",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-layout-splitter"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/sidebar/overview" },
            caption: "Sidebar",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-sidebar"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/tab/overview" },
            caption: "Tab",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-tab-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Form",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/profile.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/action-list/overview" },
            caption: "Action List",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-action-list-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/checkbox/overview" },
            caption: "Checkbox",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-checkbox"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/combo-box/overview" },
            caption: "Combo Box",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-combo-box-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/edit/overview" },
            caption: "Edit",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-edit"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/radio-group/overview" },
            caption: "Radio Group",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-radio-group-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/rating/overview" },
            caption: "Rating",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-rating"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/segmented-control/overview" },
            caption: "Segmented Control",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-segmented-control-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/slider/overview" },
            caption: "Slider",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-slider"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/switch/overview" },
            caption: "Switch",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-switch"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Data",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/excel.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/paginator/overview" },
            caption: "Paginator",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-paginator-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/tabular-grid/overview" },
            caption: "Tabular Grid",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-tabular-grid-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/tree-view/overview" },
            caption: "Tree View",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-tree-view-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Navigation",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/send.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/navigation-list/overview" },
            caption: "Navigation List",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-navigation-list-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Menu",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/hamburger.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/action-group/overview" },
            caption: "Action Group",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-action-group-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/action-menu/overview" },
            caption: "Action Menu",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-action-menu-render"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Overlay",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/expand.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/dialog/overview" },
            caption: "Dialog",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-dialog"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/popover/overview" },
            caption: "Popover",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-popover"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/shortcuts/overview" },
            caption: "Shortcuts",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-shortcuts"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/tooltip/overview" },
            caption: "Tooltip",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-tooltip"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Media",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/image.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/image/overview" },
            caption: "Image",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-image"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/qr/overview" },
            caption: "QR",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-qr"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/barcode-scanner/overview" },
            caption: "Barcode Scanner",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-barcode-scanner"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Code/Markdown",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/csv.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "/components/code/overview" },
            caption: "Code",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-code"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/code-editor/overview" },
            caption: "Code Editor",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-code-editor"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/code-diff-editor/overview" },
            caption: "Code Diff Editor",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-code-diff-editor"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/markdown-viewer/overview" },
            caption: "Markdown Viewer",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-markdown-viewer"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "Misc",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/light-mode.svg')",
        startImgType: "mask",
        items: [
          // Temporally disabled
          // { link: { url: "/components/alert/overview" }, caption: "Alert", metadata: EXPERIMENTAL },

          {
            link: { url: "/components/chat/overview" },
            caption: "Chat",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-chat"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/progress/overview" },
            caption: "Progress",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-progress"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          },
          {
            link: { url: "/components/textblock/overview" },
            caption: "TextBlock",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-textblock"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      },

      {
        caption: "LiveKit",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/light-mode.svg')",
        startImgType: "mask",
        items: [
          // Temporally disabled
          // { link: { url: "/components/alert/overview" }, caption: "Alert", metadata: EXPERIMENTAL },
          {
            link: { url: "/components/live-kit-room/overview" },
            caption: "Room",
            metadata: {
              status: EXPERIMENTAL,
              component: "ch-live-kit-room"
            } as any satisfies Metadata // TODO: Remove the any by adding support for any type of metadata
          }
        ]
      }

      // {link: { url: "/components/notifications", caption: "Notifications", metadata: EXPERIMENTAL], // Temporally disabled
    ]
  }
];

export const getSubRoutes = (
  navigationListModel: NavigationListModel,
  routesAcc: {
    params: { path: string };
    props: {
      component: string;
      title: string;
      section: "overview" | "playground" | "api";
    };
  }[]
) => {
  navigationListModel.forEach(item => {
    if (item.link?.url) {
      const baseUrl = item.link.url.replace("/overview", "");

      routesAcc.push(
        {
          params: { path: baseUrl + "/api" },
          props: {
            title: item.caption,
            component: (item.metadata as any as Metadata).component,
            section: "api"
          }
        },
        {
          params: { path: baseUrl + "/overview" },
          props: {
            title: item.caption,
            component: (item.metadata as any as Metadata).component,
            section: "overview"
          }
        },
        {
          params: { path: baseUrl + "/playground" },
          props: {
            title: item.caption,
            component: (item.metadata as any as Metadata).component,
            section: "playground"
          }
        }
      );
    }

    if (item.items != null) {
      getSubRoutes(item.items, routesAcc);
    }
  });
};

export const getAllRoutes = (
  navigationListModel: NavigationListModel
): {
  params: { path: string };
  props: {
    component: string;
    title: string;
    section: "overview" | "playground" | "api";
  };
}[] => {
  const routesAcc: {
    params: { path: string };
    props: {
      component: string;
      title: string;
      section: "overview" | "playground" | "api";
    };
  }[] = [];

  getSubRoutes(navigationListModel, routesAcc);

  return routesAcc;
};

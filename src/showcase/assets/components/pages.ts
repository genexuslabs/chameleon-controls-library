import {
  NavigationListItemModel,
  NavigationListModel
} from "../../../components/navigation-list/types";

const DEVELOPER_PREVIEW = "Developer Preview";
const EXPERIMENTAL = "Experimental";
const STABLE = "Stable";

export const showcasePages: NavigationListModel = [
  // Temporally disabled
  // {
  //   caption: "Getting started",
  //   startImgSrc:
  //     "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/company.svg')",
  //   startImgType: "mask",
  //   items: [
  //     {
  //       caption: "Browser support",
  //       link: { url: "#browser-support" }
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
            link: { url: "#accordion" },
            caption: "Accordion",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#flexible-layout" },
            caption: "Flexible Layout",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#layout-splitter" },
            caption: "Layout Splitter",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#sidebar" },
            caption: "Sidebar",
            metadata: EXPERIMENTAL
          },
          { link: { url: "#tab" }, caption: "Tab", metadata: EXPERIMENTAL }
        ]
      },

      {
        caption: "Form",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/profile.svg')",
        startImgType: "mask",
        items: [
          {
            link: { url: "#action-list" },
            caption: "Action List",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#checkbox" },
            caption: "Checkbox",
            metadata: DEVELOPER_PREVIEW
          },
          {
            link: { url: "#combo-box" },
            caption: "Combo Box",
            metadata: EXPERIMENTAL
          },
          { link: { url: "#edit" }, caption: "Edit", metadata: EXPERIMENTAL },
          {
            link: { url: "#radio-group" },
            caption: "Radio Group",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#segmented-control" },
            caption: "Segmented Control",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#slider" },
            caption: "Slider",
            metadata: DEVELOPER_PREVIEW
          },
          {
            link: { url: "#switch" },
            caption: "Switch",
            metadata: EXPERIMENTAL
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
            link: { url: "#paginator" },
            caption: "Paginator",
            metadata: STABLE
          },
          {
            link: { url: "#paginator-render" },
            caption: "Paginator Render",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#tabular-grid" },
            caption: "Tabular Grid",
            metadata: STABLE
          },
          {
            link: { url: "#tabular-grid-render" },
            caption: "Tabular Grid Render",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#tree-view" },
            caption: "Tree View",
            metadata: DEVELOPER_PREVIEW
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
            link: { url: "#navigation-list" },
            caption: "Navigation List",
            metadata: EXPERIMENTAL
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
            link: { url: "#action-group" },
            caption: "Action Group",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#dropdown" },
            caption: "Dropdown",
            metadata: EXPERIMENTAL
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
            link: { url: "#dialog" },
            caption: "Dialog",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#popover" },
            caption: "Popover",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#shortcuts" },
            caption: "Shortcuts",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#tooltip" },
            caption: "Tooltip",
            metadata: EXPERIMENTAL
          }
        ]
      },

      {
        caption: "Media",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/image.svg')",
        startImgType: "mask",
        items: [
          { link: { url: "#image" }, caption: "Image", metadata: EXPERIMENTAL },
          { link: { url: "#qr" }, caption: "QR", metadata: DEVELOPER_PREVIEW },
          {
            link: { url: "#barcode-scanner" },
            caption: "Barcode Scanner",
            metadata: EXPERIMENTAL
          }
        ]
      },

      {
        caption: "Code/Markdown",
        startImgSrc:
          "url('https://unpkg.com/@genexus/unanimo@latest/dist/assets/icons/csv.svg')",
        startImgType: "mask",
        items: [
          { link: { url: "#code" }, caption: "Code", metadata: EXPERIMENTAL },
          {
            link: { url: "#code-editor" },
            caption: "Code Editor",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#code-diff-editor" },
            caption: "Code Diff Editor",
            metadata: EXPERIMENTAL
          },
          {
            link: { url: "#markdown-viewer" },
            caption: "Markdown Viewer",
            metadata: EXPERIMENTAL
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
          // { link: { url: "#alert" }, caption: "Alert", metadata: EXPERIMENTAL },

          { link: { url: "#chat" }, caption: "Chat", metadata: EXPERIMENTAL },
          {
            link: { url: "#textblock" },
            caption: "TextBlock",
            metadata: DEVELOPER_PREVIEW
          }
        ]
      }

      // {link: { url: "#notifications", caption: "Notifications", metadata: EXPERIMENTAL], // Temporally disabled
    ]
  }
];

export const findComponentMetadataUsingURLHash = (
  navigationListModel: NavigationListModel,
  hash: string
): NavigationListItemModel | undefined => {
  for (let index = 0; index < navigationListModel.length; index++) {
    const itemUIModel = navigationListModel[index];

    if (itemUIModel.link?.url === hash) {
      return itemUIModel;
    }

    if (itemUIModel.items != null) {
      const itemWasFound = findComponentMetadataUsingURLHash(
        itemUIModel.items,
        hash
      );

      if (itemWasFound) {
        return itemWasFound;
      }
    }
  }

  return undefined;
};

// const iconMapping = {
//   [EXPERIMENTAL]:
//     "https://unpkg.com/@genexus/unanimo@0.8.0/dist/assets/icons/account-settings.svg",
//   [DEVELOPER_PREVIEW]:
//     "https://unpkg.com/@genexus/unanimo@0.8.0/dist/assets/icons/warning.svg",
//   [STABLE]:
//     "https://unpkg.com/@genexus/unanimo@0.8.0/dist/assets/icons/featured.svg"
// };

// /**
//  * @param {TreeXItemModel[]} subModel
//  */
// export const treeViewComponents = components.map(el => ({
//   id: el[0],
//   caption: el[1],
//   metadata: `${el[1]}---${el[2]}`,
//   leaf: true,
//   endImgSrc: iconMapping[el[2]],
//   endImgType: "mask"
// }));

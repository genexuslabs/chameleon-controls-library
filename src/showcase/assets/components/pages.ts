import {
  NavigationListItemModel,
  NavigationListModel
} from "../../../components/navigation-list/types";

const DEVELOPER_PREVIEW = "Developer Preview";
const EXPERIMENTAL = "Experimental";
const STABLE = "Stable";

const showcasePagesWithoutLink: NavigationListModel = [
  { id: "action-list", caption: "Action List", metadata: EXPERIMENTAL },
  { id: "accordion", caption: "Accordion", metadata: EXPERIMENTAL },
  { id: "action-group", caption: "Action Group", metadata: EXPERIMENTAL },
  { id: "alert", caption: "Alert", metadata: EXPERIMENTAL },
  { id: "barcode-scanner", caption: "Barcode Scanner", metadata: EXPERIMENTAL },
  { id: "checkbox", caption: "Checkbox", metadata: DEVELOPER_PREVIEW },
  { id: "chat", caption: "Chat", metadata: EXPERIMENTAL },
  { id: "code", caption: "Code", metadata: EXPERIMENTAL },
  { id: "code-editor", caption: "Code Editor", metadata: EXPERIMENTAL },
  {
    id: "code-diff-editor",
    caption: "Code Diff Editor",
    metadata: EXPERIMENTAL
  },
  { id: "combo-box", caption: "Combo Box", metadata: EXPERIMENTAL },
  { id: "dropdown", caption: "Dropdown", metadata: EXPERIMENTAL },
  { id: "dialog", caption: "Dialog", metadata: EXPERIMENTAL },
  { id: "edit", caption: "Edit", metadata: EXPERIMENTAL },
  { id: "flexible-layout", caption: "Flexible Layout", metadata: EXPERIMENTAL },
  { id: "image", caption: "Image", metadata: EXPERIMENTAL },
  { id: "tabular-grid", caption: "Tabular Grid", metadata: STABLE },
  { id: "layout-splitter", caption: "Layout Splitter", metadata: EXPERIMENTAL },
  { id: "markdown-viewer", caption: "Markdown Viewer", metadata: EXPERIMENTAL },
  { id: "navigation-list", caption: "Navigation List", metadata: EXPERIMENTAL },
  // {id: "notifications", caption: "Notifications", metadata: EXPERIMENTAL], // Temporally disabled
  { id: "paginator", caption: "Paginator", metadata: STABLE },
  { id: "popover", caption: "Popover", metadata: EXPERIMENTAL },
  { id: "qr", caption: "QR", metadata: DEVELOPER_PREVIEW },
  { id: "radio-group", caption: "Radio Group", metadata: EXPERIMENTAL },
  {
    id: "segmented-control",
    caption: "Segmented Control",
    metadata: EXPERIMENTAL
  },
  { id: "shortcuts", caption: "Shortcuts", metadata: EXPERIMENTAL },
  // {id: "sidebar", caption: "Sidebar", metadata: EXPERIMENTAL], // Temporally disabled
  { id: "slider", caption: "Slider", metadata: DEVELOPER_PREVIEW },
  { id: "switch", caption: "Switch", metadata: EXPERIMENTAL },
  // {id: "suggest", caption: "Suggest", metadata: EXPERIMENTAL], // Temporally disabled
  { id: "tab", caption: "Tab", metadata: EXPERIMENTAL },
  { id: "textblock", caption: "TextBlock", metadata: DEVELOPER_PREVIEW },
  { id: "tooltip", caption: "Tooltip", metadata: EXPERIMENTAL }, // Temporally disabled
  { id: "tree-view", caption: "Tree View", metadata: DEVELOPER_PREVIEW }
];

export const showcasePages: NavigationListModel = showcasePagesWithoutLink.map(
  ({ id, caption, metadata }) => ({
    id,
    caption,
    metadata,
    link: { url: `#${id}` }
  })
);

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

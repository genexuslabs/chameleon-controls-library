const DEVELOPER_PREVIEW = "Developer Preview";
const EXPERIMENTAL = "Experimental";
const STABLE = "Stable";

const components = [
  ["accordion", "Accordion", EXPERIMENTAL],
  ["action-group", "Action Group", EXPERIMENTAL],
  ["alert", "Alert", EXPERIMENTAL],
  ["barcode-scanner", "Barcode Scanner", EXPERIMENTAL],
  ["checkbox", "Checkbox", DEVELOPER_PREVIEW],
  ["code", "Code", EXPERIMENTAL],
  ["code-editor", "Code Editor", EXPERIMENTAL],
  ["combo-box", "Combo Box", EXPERIMENTAL],
  ["dropdown", "Dropdown", EXPERIMENTAL],
  ["dialog", "Dialog", EXPERIMENTAL],
  ["flexible-layout", "Flexible Layout", EXPERIMENTAL],
  ["grid", "Tabular Grid", STABLE],
  ["layout-splitter", "Layout Splitter", EXPERIMENTAL],
  ["markdown", "Markdown", EXPERIMENTAL],
  ["notifications", "Notifications", EXPERIMENTAL],
  ["paginator", "Paginator", STABLE],
  ["popover", "Popover", EXPERIMENTAL],
  ["qr", "QR", DEVELOPER_PREVIEW],
  ["radio-group", "Radio Group", EXPERIMENTAL],
  ["segmented-control", "Segmented Control", EXPERIMENTAL],
  ["shortcuts", "Shortcuts", EXPERIMENTAL],
  ["sidebar", "Sidebar", EXPERIMENTAL],
  ["slider", "Slider", DEVELOPER_PREVIEW],
  ["switch", "Switch", EXPERIMENTAL],
  ["suggest", "Suggest", EXPERIMENTAL],
  ["tab", "Tab", EXPERIMENTAL],
  ["textblock", "Textblock", EXPERIMENTAL],
  ["tooltip", "Tooltip", EXPERIMENTAL],
  ["tree-view", "Tree View", DEVELOPER_PREVIEW]
];

const iconMapping = {
  [EXPERIMENTAL]:
    "https://unpkg.com/@genexus/unanimo@0.8.0/dist/assets/icons/account-settings.svg",
  [DEVELOPER_PREVIEW]:
    "https://unpkg.com/@genexus/unanimo@0.8.0/dist/assets/icons/warning.svg",
  [STABLE]:
    "https://unpkg.com/@genexus/unanimo@0.8.0/dist/assets/icons/featured.svg"
};

/**
 * @typedef TreeViewItemModel
 * @type {object}
 * @property {string} id
 * @property {string} caption
 * @property {number=} order
 */

/**
 * @param {TreeXItemModel[]} subModel
 */
export const treeViewComponents = components.map(el => ({
  id: el[0],
  caption: el[1],
  metadata: `${el[1]}---${el[2]}`,
  leaf: true,
  endImgSrc: iconMapping[el[2]],
  endImgType: "mask"
}));

const DEVELOPER_PREVIEW = "Developer Preview";
const EXPERIMENTAL = "Experimental";
const STABLE = "Stable";

const components = [
  ["action-list", "Action List", EXPERIMENTAL],
  // ["accordion", "Accordion", EXPERIMENTAL], // Temporally disabled
  ["action-group", "Action Group", EXPERIMENTAL],
  ["alert", "Alert", EXPERIMENTAL],
  ["barcode-scanner", "Barcode Scanner", EXPERIMENTAL],
  ["checkbox", "Checkbox", DEVELOPER_PREVIEW],
  ["code", "Code", EXPERIMENTAL],
  ["code-editor", "Code Editor", EXPERIMENTAL],
  ["code-diff-editor", "Code Diff Editor", EXPERIMENTAL],
  ["combo-box", "Combo Box", EXPERIMENTAL],
  ["dropdown", "Dropdown", EXPERIMENTAL],
  ["dialog", "Dialog", EXPERIMENTAL],
  ["edit", "Edit", EXPERIMENTAL],
  ["flexible-layout", "Flexible Layout", EXPERIMENTAL],
  ["image", "Image", EXPERIMENTAL],
  ["tabular-grid", "Tabular Grid", STABLE],
  ["layout-splitter", "Layout Splitter", EXPERIMENTAL],
  ["markdown", "Markdown", EXPERIMENTAL],
  // ["notifications", "Notifications", EXPERIMENTAL], // Temporally disabled
  ["paginator", "Paginator", STABLE],
  ["popover", "Popover", EXPERIMENTAL],
  ["qr", "QR", DEVELOPER_PREVIEW],
  ["radio-group", "Radio Group", EXPERIMENTAL],
  ["segmented-control", "Segmented Control", EXPERIMENTAL],
  ["shortcuts", "Shortcuts", EXPERIMENTAL],
  // ["sidebar", "Sidebar", EXPERIMENTAL], // Temporally disabled
  ["slider", "Slider", DEVELOPER_PREVIEW],
  ["switch", "Switch", EXPERIMENTAL],
  // ["suggest", "Suggest", EXPERIMENTAL], // Temporally disabled
  ["tab", "Tab", EXPERIMENTAL],
  // ["textblock", "Textblock", EXPERIMENTAL], // Temporally disabled
  // ["tooltip", "Tooltip", EXPERIMENTAL], // Temporally disabled
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

/**
 * @typedef TreeViewItemModel
 * @type {object}
 * @property {string} id
 * @property {string} caption
 * @property {number=} order
 */

const components = [
  "accordion",
  "action-group",
  "alert",
  "dropdown",
  "checkbox",
  "flexible-layout",
  "grid",
  "icon",
  "layout-splitter",
  "markdown",
  "notifications",
  "paginator",
  "popover",
  "qr",
  "select",
  "shortcuts",
  "sidebar",
  "step-list",
  "style",
  "suggest",
  "textblock",
  "tooltip",
  "tree",
  "window"
];

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
  id: el,
  caption: el,
  leaf: true
}));

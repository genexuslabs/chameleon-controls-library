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
  "barcode-scanner",
  "checkbox",
  "code-editor",
  "combo-box",
  "dropdown",
  "dialog",
  "flexible-layout",
  "grid",
  "layout-splitter",
  "markdown",
  "notifications",
  "paginator",
  "popover",
  ["qr", "QR"],
  "radio-group",
  "segmented-control",
  "shortcuts",
  "sidebar",
  "slider",
  "suggest",
  "tab",
  "textblock",
  "tooltip",
  ["tree-view", "Tree View"]
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
export const treeViewComponents = components.map(el =>
  Array.isArray(el)
    ? { id: el[0], caption: el[1], leaf: true }
    : {
        id: el,
        caption: el
          .split("-")
          .map(word => word.replace(word[0], word[0].toUpperCase()))
          .join(" "),
        leaf: true
      }
);

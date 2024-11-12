type TreeViewNodeTest =
  | {
      id: string;
      class?: string;
      children?: TreeViewNodeTest[];
    }
  | string;

const ITEM_EXPORT_PARTS =
  "item__action,item__checkbox,item__checkbox-container,item__checkbox-input,item__checkbox-option,item__downloading,item__edit-caption,item__expandable-button,item__group,item__header,item__img,item__line,disabled,expanded,collapsed,expand-button,even-level,odd-level,last-line,lazy-loaded,start-img,end-img,editing,not-editing,level-0-leaf,selected,not-selected,checked,unchecked,indeterminate,drag-enter";

const TREE_VIEW_NODE = (children: string) =>
  `<ch-tree-view class="not-dragging-item hydrated" exportparts="drag-preview">${children}</ch-tree-view>` as const;

const TREE_VIEW_ITEM_NODE = (options: TreeViewNodeTest, level: number) => {
  const isObject = typeof options === "object";

  const id = isObject ? options.id : options;
  const cssClass = isObject && options.class ? options.class + " " : "";
  const children = isObject ? options.children ?? [] : [];

  return `<ch-tree-view-item id="${id}" role="treeitem" aria-level="${level}" exportparts="${ITEM_EXPORT_PARTS}" class="${cssClass}hydrated" part="item" style="--level: ${
    level - 1
  };">${children
    .map(node => TREE_VIEW_ITEM_NODE(node, level + 1))
    .join("")}</ch-tree-view-item>` as const;
};

export const TREE_VIEW_NODE_RENDER = (children: TreeViewNodeTest[]) =>
  TREE_VIEW_NODE(children.map(node => TREE_VIEW_ITEM_NODE(node, 1)).join(""));

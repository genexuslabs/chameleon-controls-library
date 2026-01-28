import type {
  TreeViewItemModel,
  TreeViewModel
} from "@genexus/chameleon-controls-library";
import type {
  ComponentMetadataCodeSnippet,
  ComponentTemplateItem
} from "@genexus/design-system-common";

const templateModelItemToTreeViewItem = (
  item: ComponentTemplateItem,
  deep: number,
  index: number
): TreeViewItemModel => {
  if (typeof item === "string") {
    return {
      id: `${deep}-${index}`,
      caption: item.length > 16 ? `${item.substring(0, 15)}...` : item,
      leaf: true,
      metadata: item
    };
  }

  const children = item.children ?? [];

  return {
    id: `${deep}-${index}`,
    caption: item.tag,
    items: (Array.isArray(children) ? children : [children]).map((subItem, index) =>
      templateModelItemToTreeViewItem(subItem, deep + 1, index)
    ),
    leaf: item.children === undefined,
    metadata: item as any // TODO: Add support for any metadata in the ch-tree-view-render
  };
};

export const getTreeViewModelForCodeSnippet = (
  codeSnippet: ComponentMetadataCodeSnippet
): TreeViewModel => {
  const templateArray = Array.isArray(codeSnippet.template)
    ? codeSnippet.template
    : [codeSnippet.template];

  return templateArray.map((item, index) =>
    templateModelItemToTreeViewItem(item, 0, index)
  );
};

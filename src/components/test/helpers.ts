import { TreeXItemModel, TreeXModel } from "../tree-x/types";

export type TreeXItemSimplifiedModel = {
  id: string;
  items: TreeXItemSimplifiedModel[];
};

export function simplifyModel(
  model: TreeXModel | TreeXItemModel
): TreeXItemSimplifiedModel[] {
  const items = model.items;

  if (!items) {
    return [];
  }

  const simplifiedModel: TreeXItemSimplifiedModel[] = items.map(item => ({
    id: item.id,
    items: simplifyModel(item)
  }));

  return simplifiedModel;
}

export const prettyPrint = (value: any) => JSON.stringify(value, undefined, 2);

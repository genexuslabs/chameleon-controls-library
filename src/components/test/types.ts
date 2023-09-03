import { TreeXItemModel, TreeXModel } from "../tree-x/types";

export type TreeXItemModelExtended = {
  parentItem: TreeXModel | TreeXItemModel;
  item: TreeXItemModel;
};

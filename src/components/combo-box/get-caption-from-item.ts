import { ComboBoxItemModel } from "./types";

export const getCaptionFromItem = (item: ComboBoxItemModel) =>
  item.caption ?? item.value;

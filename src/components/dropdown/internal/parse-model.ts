import {
  DropdownItemModelExtended,
  DropdownModel,
  DropdownModelExtended
} from "../types";
import { dropdownItemIsActionable } from "./utils";

export const parseSubModel = (
  parentModel: DropdownModel,
  parentModelExtended: DropdownModelExtended,
  parentItem: DropdownItemModelExtended | undefined
) => {
  // For loop is the fastest iterator
  for (let index = 0; index < parentModel.length; index++) {
    const itemUIModel = parentModel[index];

    if (
      dropdownItemIsActionable(itemUIModel) &&
      itemUIModel.items !== undefined
    ) {
      const subModelExtended: DropdownModelExtended = [];

      const itemUIModelExtended: DropdownItemModelExtended = {
        item: itemUIModel,
        parentItem,
        items: subModelExtended
      };

      parseSubModel(itemUIModel.items, subModelExtended, itemUIModelExtended);

      parentModelExtended.push(itemUIModelExtended);
    } else {
      parentModelExtended.push({
        item: itemUIModel,
        parentItem
      });
    }
  }
};

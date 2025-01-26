import { MODEL_METADATA } from "../../../common/reserved-names";
import {
  DropdownItemActionableModel,
  DropdownItemModel,
  DropdownItemModelMetadata,
  DropdownModel
} from "../types";
import {
  dropdownItemActionableIsExpandable,
  dropdownItemIsActionable
} from "./utils";

export const addMetadataInDropdownItem = (
  itemUIModel: DropdownItemModel,
  parentItem: DropdownItemActionableModel | undefined
) => {
  itemUIModel[MODEL_METADATA] = {
    parentItem
  } satisfies DropdownItemModelMetadata;
};

export const getDropdownItemMetadata = (
  itemUIModel: DropdownItemModel
): DropdownItemModelMetadata => itemUIModel[MODEL_METADATA];

export const parseSubModel = (
  parentModel: DropdownModel,
  parentItem: DropdownItemActionableModel | undefined
) => {
  // For loop is the fastest iterator
  for (let index = 0; index < parentModel.length; index++) {
    const itemUIModel = parentModel[index];

    addMetadataInDropdownItem(itemUIModel, parentItem);

    if (
      dropdownItemIsActionable(itemUIModel) &&
      dropdownItemActionableIsExpandable(itemUIModel)
    ) {
      parseSubModel(itemUIModel.items, itemUIModel);
    }
  }
};

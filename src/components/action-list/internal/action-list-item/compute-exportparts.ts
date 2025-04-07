import {
  ActionListItemAdditionalBase,
  ActionListItemAdditionalCustom,
  ActionListItemAdditionalInformation,
  ActionListItemAdditionalItem,
  ActionListItemAdditionalModel
} from "../../types";

const SPACES_REGEX = /\s+/g;

const addPartForAdditionalItems = (
  additionalItems: ActionListItemAdditionalItem[],
  parts: Set<string>
) => {
  if (additionalItems == null) {
    return;
  }

  // For let index = ... is the fastest for loop
  for (let index = 0; index < additionalItems.length; index++) {
    // Slots does not have parts
    const additionalItem = additionalItems[index] as
      | ActionListItemAdditionalBase
      | ActionListItemAdditionalCustom;

    if (additionalItem.part) {
      // TODO: Add a test for this case
      parts.add(additionalItem.part.trim().replaceAll(SPACES_REGEX, ","));
    }
  }
};

const addPartForAdditionalModel = (
  additionalModel: ActionListItemAdditionalModel | undefined,
  parts: Set<string>
) => {
  if (additionalModel != null) {
    addPartForAdditionalItems(additionalModel.start, parts);
    addPartForAdditionalItems(additionalModel.center, parts);
    addPartForAdditionalItems(additionalModel.end, parts);
  }
};

export const computeExportParts = (
  additionalInfo: ActionListItemAdditionalInformation
) => {
  const parts: Set<string> = new Set();

  addPartForAdditionalModel(additionalInfo["block-start"], parts);
  addPartForAdditionalModel(additionalInfo["block-end"], parts);
  addPartForAdditionalModel(additionalInfo["inline-caption"], parts);
  addPartForAdditionalModel(additionalInfo["stretch-start"], parts);
  addPartForAdditionalModel(additionalInfo["stretch-end"], parts);

  return parts;
};

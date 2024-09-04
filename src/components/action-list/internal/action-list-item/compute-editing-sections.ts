import {
  ActionListItemAdditionalAction,
  ActionListItemAdditionalInformation,
  ActionListItemAdditionalInformationSection,
  ActionListItemAdditionalItem,
  ActionListItemAdditionalModel
} from "../../types";
import { ActionListItemEditingBlockInfo } from "./types";

const BLOCKS_TO_CHECK: (keyof ActionListItemAdditionalInformation)[] = [
  "block-start",
  "block-end",
  "inline-caption",
  "stretch-start",
  "stretch-end"
];

const containsEditingActions = (
  additionalItems?: ActionListItemAdditionalItem[]
): boolean => {
  if (additionalItems == null) {
    return false;
  }

  return additionalItems.some(
    additionalItem =>
      (additionalItem as ActionListItemAdditionalAction).action &&
      (additionalItem as ActionListItemAdditionalAction).action.type ===
        "modify"
  );
};

const isEditingBlock = (
  section: ActionListItemAdditionalInformationSection,
  additionalModel?: ActionListItemAdditionalModel
): ActionListItemEditingBlockInfo | undefined => {
  if (additionalModel == null) {
    return undefined;
  }

  let editingBlockInfo: ActionListItemEditingBlockInfo | undefined;

  if (containsEditingActions(additionalModel.start)) {
    editingBlockInfo = { section: section, align: ["start"] };
  }

  if (containsEditingActions(additionalModel.center)) {
    if (editingBlockInfo) {
      editingBlockInfo.align.push("center");
    } else {
      editingBlockInfo = { section: section, align: ["center"] };
    }
  }

  if (containsEditingActions(additionalModel.end)) {
    if (editingBlockInfo) {
      editingBlockInfo.align.push("end");
    } else {
      editingBlockInfo = { section: section, align: ["end"] };
    }
  }

  return editingBlockInfo;
};

export const computeEditingBlocks = (
  additionalInfo?: ActionListItemAdditionalInformation
): ActionListItemEditingBlockInfo[] | undefined => {
  if (additionalInfo == null) {
    return undefined;
  }

  let editingBlocks: ActionListItemEditingBlockInfo[] | undefined = undefined;

  BLOCKS_TO_CHECK.forEach(block => {
    const editingBlock = isEditingBlock(block, additionalInfo[block]);

    if (editingBlock) {
      editingBlocks ??= [];
      editingBlocks.push(editingBlock);
    }
  });

  return editingBlocks;
};

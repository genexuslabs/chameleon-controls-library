import {
  ActionListItemAdditionalAction,
  ActionListItemAdditionalInformation,
  ActionListItemAdditionalInformationSection,
  ActionListItemAdditionalItem,
  ActionListItemAdditionalItemActionType,
  ActionListItemAdditionalModel
} from "../../types";
import { ActionListItemActionTypeBlockInfo } from "./types";

const BLOCKS_TO_CHECK: (keyof ActionListItemAdditionalInformation)[] = [
  "block-start",
  "block-end",
  "inline-caption",
  "stretch-start",
  "stretch-end"
];

const containsActionTypeActions = (
  action: ActionListItemAdditionalItemActionType["type"],
  additionalItems?: ActionListItemAdditionalItem[]
): boolean => {
  if (additionalItems == null) {
    return false;
  }

  return additionalItems.some(
    additionalItem =>
      (additionalItem as ActionListItemAdditionalAction).action &&
      (additionalItem as ActionListItemAdditionalAction).action.type === action
  );
};

const isActionTypeBlock = (
  action: ActionListItemAdditionalItemActionType["type"],
  section: ActionListItemAdditionalInformationSection,
  additionalModel?: ActionListItemAdditionalModel
): ActionListItemActionTypeBlockInfo | undefined => {
  if (additionalModel == null) {
    return undefined;
  }

  let editingBlockInfo: ActionListItemActionTypeBlockInfo | undefined;

  if (containsActionTypeActions(action, additionalModel.start)) {
    editingBlockInfo = { section: section, align: ["start"] };
  }

  if (containsActionTypeActions(action, additionalModel.center)) {
    if (editingBlockInfo) {
      editingBlockInfo.align.push("center");
    } else {
      editingBlockInfo = { section: section, align: ["center"] };
    }
  }

  if (containsActionTypeActions(action, additionalModel.end)) {
    if (editingBlockInfo) {
      editingBlockInfo.align.push("end");
    } else {
      editingBlockInfo = { section: section, align: ["end"] };
    }
  }

  return editingBlockInfo;
};

export const computeActionTypeBlocks = (
  action: ActionListItemAdditionalItemActionType["type"],
  additionalInfo?: ActionListItemAdditionalInformation
): ActionListItemActionTypeBlockInfo[] | undefined => {
  if (additionalInfo == null) {
    return undefined;
  }

  let editingBlocks: ActionListItemActionTypeBlockInfo[] | undefined =
    undefined;

  BLOCKS_TO_CHECK.forEach(block => {
    const editingBlock = isActionTypeBlock(
      action,
      block,
      additionalInfo[block]
    );

    if (editingBlock) {
      editingBlocks ??= [];
      editingBlocks.push(editingBlock);
    }
  });

  return editingBlocks;
};

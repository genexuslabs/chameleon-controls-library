import { joinParts } from "../join-parts";

/* #INLINE# */
export const ACTION_GROUP_PARTS_DICTIONARY = {
  ACTIONS: "actions",
  MORE_ACTIONS: "more-actions",
  MORE_ACTIONS_BUTTON: "more-actions-button",
  MORE_ACTIONS_WINDOW: "more-actions-window",

  // - - - - - - - - States - - - - - - - -
  VERTICAL: "vertical" // SEPARATOR (comes from dropdown dictionary)
} as const;

export const ACTION_GROUP_EXPORT_PARTS = joinParts(ACTION_GROUP_PARTS_DICTIONARY);


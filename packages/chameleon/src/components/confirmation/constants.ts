import { joinParts } from "../../utilities/reserved-names/join-parts";

/* #INLINE# */
export const CONFIRMATION_PARTS_DICTIONARY = {
  CONTAINER: "container",
  TITLE: "title",
  MESSAGE: "message",
  ACTIONS: "actions",
  BUTTON_APPROVE: "button-approve",
  BUTTON_REJECT: "button-reject",

  // - - - - - - - - States - - - - - - - -
  APPROVAL_REQUESTED: "approval-requested",
  APPROVAL_RESPONDED: "approval-responded",
  OUTPUT_DENIED: "output-denied",
  OUTPUT_AVAILABLE: "output-available"
} as const;

export const CONFIRMATION_EXPORT_PARTS = joinParts(
  CONFIRMATION_PARTS_DICTIONARY
);

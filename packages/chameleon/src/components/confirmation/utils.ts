import type { ConfirmationState } from "./types";
import { CONFIRMATION_PARTS_DICTIONARY } from "./constants";

/**
 * Returns the CSS parts string for the container based on the current state.
 */
export const getContainerParts = (state: ConfirmationState): string => {
  let parts = CONFIRMATION_PARTS_DICTIONARY.CONTAINER;

  switch (state) {
    case "approval-requested":
      parts += ` ${CONFIRMATION_PARTS_DICTIONARY.APPROVAL_REQUESTED}`;
      break;
    case "approval-responded":
      parts += ` ${CONFIRMATION_PARTS_DICTIONARY.APPROVAL_RESPONDED}`;
      break;
    case "output-denied":
      parts += ` ${CONFIRMATION_PARTS_DICTIONARY.OUTPUT_DENIED}`;
      break;
    case "output-available":
      parts += ` ${CONFIRMATION_PARTS_DICTIONARY.OUTPUT_AVAILABLE}`;
      break;
  }

  return parts;
};

/**
 * Determines if the approve/reject actions should be shown based on the state.
 */
export const shouldShowActions = (state: ConfirmationState): boolean => {
  return state === "approval-requested";
};

/**
 * Determines which message to show based on the state.
 */
export const getMessageType = (
  state: ConfirmationState
): "request" | "accepted" | "rejected" | null => {
  switch (state) {
    case "approval-requested":
      return "request";
    case "approval-responded":
    case "output-available":
      return "accepted";
    case "output-denied":
      return "rejected";
    default:
      return null;
  }
};

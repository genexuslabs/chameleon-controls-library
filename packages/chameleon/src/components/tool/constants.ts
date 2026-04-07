import type { ToolState, ToolStateBadge } from "./types";

/**
 * CSS parts dictionary for the ch-tool component.
 */
export const TOOL_PARTS_DICTIONARY = {
  CONTAINER: "container",
  HEADER_BADGE: "header-badge",
  TOOL_NAME: "tool-name",
  PARAMETERS_SECTION: "parameters-section",
  PARAMETERS_TITLE: "parameters-title",
  RESULT_SECTION: "result-section",
  RESULT_TITLE: "result-title",
  ERROR_SECTION: "error-section",
  ERROR_TITLE: "error-title",
  CONFIRMATION_WRAPPER: "confirmation-wrapper",
  
  // State-specific parts
  STATE_INPUT_STREAMING: "state-input-streaming",
  STATE_INPUT_AVAILABLE: "state-input-available",
  STATE_APPROVAL_REQUESTED: "state-approval-requested",
  STATE_APPROVAL_RESPONDED: "state-approval-responded",
  STATE_OUTPUT_AVAILABLE: "state-output-available",
  STATE_OUTPUT_ERROR: "state-output-error",
  STATE_OUTPUT_DENIED: "state-output-denied"
} as const;

/**
 * Mapping of tool states to their badge labels and CSS classes.
 */
export const TOOL_STATE_BADGE_MAP: Record<ToolState, ToolStateBadge> = {
  "input-streaming": {
    label: "Pending",
    stateClass: "pending"
  },
  "input-available": {
    label: "Running",
    stateClass: "running"
  },
  "approval-requested": {
    label: "Awaiting Approval",
    stateClass: "awaiting-approval"
  },
  "approval-responded": {
    label: "Responded",
    stateClass: "responded"
  },
  "output-available": {
    label: "Completed",
    stateClass: "completed"
  },
  "output-error": {
    label: "Error",
    stateClass: "error"
  },
  "output-denied": {
    label: "Denied",
    stateClass: "denied"
  }
};

/**
 * Default approval request message.
 */
export const DEFAULT_APPROVAL_MESSAGE = "This tool requires your approval before execution.";

/**
 * Default approval accepted message.
 */
export const DEFAULT_ACCEPTED_MESSAGE = "Tool execution approved.";

/**
 * Default approval rejected message.
 */
export const DEFAULT_REJECTED_MESSAGE = "Tool execution rejected.";

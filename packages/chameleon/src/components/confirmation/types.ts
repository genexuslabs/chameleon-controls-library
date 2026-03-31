/**
 * Represents the possible states of the confirmation component.
 */
export type ConfirmationState =
  | "approval-requested"
  | "approval-responded"
  | "output-denied"
  | "output-available";

/**
 * Represents the approval object for tool execution approval workflows.
 */
export type ConfirmationApproval = {
  /**
   * Unique identifier for the approval request.
   */
  id: string;

  /**
   * Indicates whether the approval has been granted.
   */
  approved?: boolean;
};

/**
 * Event payload emitted when the user approves the action.
 */
export type ConfirmationApproveEvent = {
  /**
   * The approval ID associated with this action.
   */
  approvalId?: string;
};

/**
 * Event payload emitted when the user rejects the action.
 */
export type ConfirmationRejectEvent = {
  /**
   * The approval ID associated with this action.
   */
  approvalId?: string;
};

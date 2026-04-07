/**
 * Represents the possible states of a tool invocation.
 */
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

/**
 * Input parameters for the tool invocation.
 */
export type ToolInput = Record<string, unknown>;

/**
 * Output result from the tool execution.
 */
export type ToolOutput = Record<string, unknown> | string;

/**
 * Event payload emitted when the user approves the tool execution.
 */
export type ToolApproveEvent = {
  /**
   * The tool call ID associated with this approval.
   */
  toolCallId: string;
};

/**
 * Event payload emitted when the user rejects the tool execution.
 */
export type ToolRejectEvent = {
  /**
   * The tool call ID associated with this rejection.
   */
  toolCallId: string;
};

/**
 * Event payload emitted when the tool's expanded state changes.
 */
export type ToolExpandedChangeEvent = {
  /**
   * Whether the tool is expanded or collapsed.
   */
  expanded: boolean;
};

/**
 * Badge information for tool state visualization.
 */
export type ToolStateBadge = {
  /**
   * The label text to display in the badge.
   */
  label: string;
  
  /**
   * The state class for styling purposes.
   */
  stateClass: string;
};

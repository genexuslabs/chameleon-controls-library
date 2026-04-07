/**
 * Represents a single step in the plan with optional subtasks.
 */
export type PlanStepModel = {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * The title of the step
   */
  title: string;

  /**
   * Optional description providing more details about the step
   */
  description?: string;

  /**
   * Array of subtask strings that belong to this step
   */
  subtasks?: string[];

  /**
   * Current status of the step
   */
  status?: PlanStepStatus;
};

/**
 * Status of a plan step
 */
export type PlanStepStatus = "pending" | "in-progress" | "completed" | "failed";

/**
 * Represents an action button in the plan
 */
export type PlanActionModel = {
  /**
   * Unique identifier for the action
   */
  id: string;

  /**
   * The label text for the action button
   */
  label: string;

  /**
   * Whether this action is the primary action
   */
  primary?: boolean;

  /**
   * Whether the action is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon to display in the button
   */
  icon?: string;
};

/**
 * The complete model for the plan component
 */
export type PlanModel = {
  /**
   * The main title of the plan
   */
  title: string;

  /**
   * Optional description of the plan
   */
  description?: string;

  /**
   * Array of steps that make up the plan
   */
  steps: PlanStepModel[];

  /**
   * Optional array of action buttons to display in the plan footer
   */
  actions?: PlanActionModel[];

  /**
   * Whether the plan content is currently being streamed
   */
  isStreaming?: boolean;

  /**
   * Whether the plan should be expanded by default
   */
  defaultOpen?: boolean;
};

/**
 * Event detail for when the plan's expanded state changes
 */
export type PlanExpandedChangeEvent = {
  /**
   * Whether the plan is now expanded
   */
  expanded: boolean;
};

/**
 * Event detail for when a step is clicked or interacted with
 */
export type PlanStepInteractionEvent = {
  /**
   * The ID of the step that was interacted with
   */
  stepId: string;

  /**
   * The step model
   */
  step: PlanStepModel;
};

/**
 * Event detail for when an action button is clicked
 */
export type PlanActionClickEvent = {
  /**
   * The ID of the action that was clicked
   */
  actionId: string;

  /**
   * The action model
   */
  action: PlanActionModel;
};

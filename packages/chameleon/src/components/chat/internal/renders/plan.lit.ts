import { html } from "lit";
import type {
  PlanActionModel,
  PlanStepModel
} from "../../../plan/types.js";
import type { AGUIActivityMessage } from "../../typesAGUI.js";

/**
 * Application-level schema for the `content` field of an AG-UI activity
 * message whose `activityType === "plan"`.
 *
 * `defaultOpen` lets the app decide whether a given plan should start
 * expanded — useful when a chat shows multiple plans and only one is the
 * current focus.
 */
export type PlanActivityContent = {
  title: string;
  description?: string;
  steps: PlanStepModel[];
  actions?: PlanActionModel[];
  defaultOpen?: boolean;
};

/**
 * Default render for `ch-plan` driven by an AG-UI activity message.
 */
export const defaultPlanRender = (activity: AGUIActivityMessage) => {
  const content = activity.content as PlanActivityContent;
  return html`<ch-plan
    class="plan-container"
    part="plan-container"
    .title=${content.title}
    .description=${content.description}
    .steps=${content.steps}
    .actions=${content.actions}
    .defaultOpen=${content.defaultOpen ?? false}
  ></ch-plan>`;
};

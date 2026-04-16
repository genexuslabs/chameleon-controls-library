import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { tokenMap } from "../../../../utilities/mapping/token-map.js";
import type { ChatMessagePlan, ChatPlanRender } from "../../types";

/**
 * Default render function for ch-plan component within chat messages.
 * Renders a plan with title, description, steps, and optional actions.
 */
export const defaultPlanRender: ChatPlanRender = (
  plan: ChatMessagePlan
): any =>
  html`<ch-plan
    class="plan-container"
    part=${tokenMap({
      "plan-container": true,
      [plan.parts]: !!plan.parts
    })}
    .title=${plan.title}
    .description=${ifDefined(plan.description)}
    .steps=${plan.steps}
    .actions=${ifDefined(plan.actions)}
    .isStreaming=${ifDefined(plan.isStreaming)}
    .defaultOpen=${ifDefined(plan.defaultOpen)}
  ></ch-plan>`;

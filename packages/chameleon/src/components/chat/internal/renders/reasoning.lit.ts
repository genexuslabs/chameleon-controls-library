import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { tokenMap } from "../../../../utilities/mapping/token-map.js";
import type { ChatMessageReasoning, ChatReasoningRender } from "../../types";

/**
 * Default render function for ch-reasoning component within chat messages.
 * Renders AI reasoning process with streaming support and thinking states.
 */
export const defaultReasoningRender: ChatReasoningRender = (
  reasoning: ChatMessageReasoning
): any =>
  html`<ch-reasoning
    class="reasoning-container"
    part=${tokenMap({
      "reasoning-container": true,
      [reasoning.parts]: !!reasoning.parts
    })}
    .content=${reasoning.content}
    .isStreaming=${ifDefined(reasoning.isStreaming)}
    .thinkingMessage=${ifDefined(reasoning.thinkingMessage)}
    .thoughtMessageTemplate=${ifDefined(reasoning.thoughtMessageTemplate)}
    .streamingSpeedMs=${ifDefined(reasoning.streamingSpeedMs)}
  ></ch-reasoning>`;

import { html } from "lit";
import type { AGUIReasoningMessage } from "../../typesAGUI.js";

/**
 * Default render for `ch-reasoning` driven by an AG-UI reasoning message.
 *
 * AG-UI carries no streaming flag on the data — `REASONING_MESSAGE_START` /
 * `REASONING_MESSAGE_CONTENT` / `REASONING_MESSAGE_END` events orchestrate
 * streaming at the chat level. The renderer enables the typewriter effect
 * by default so reasoning text reveals incrementally whether it arrives
 * via real streaming or is fed in fully-formed. Apps that want a static
 * reveal can override `renderItem.reasoning`.
 */
export const defaultReasoningRender = (reasoning: AGUIReasoningMessage) =>
  html`<ch-reasoning
    class="reasoning-container"
    part="reasoning-container"
    .content=${reasoning.content}
    .isStreaming=${true}
    .streamingSpeedMs=${10}
  ></ch-reasoning>`;

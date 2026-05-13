import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { ToolInput, ToolState } from "../../../tool/types.js";
import type { AGUIToolCall, AGUIToolMessage } from "../../typesAGUI.js";

/**
 * Parse the JSON-encoded `function.arguments` string carried on an AG-UI
 * tool call. Returns `undefined` for empty / partial / invalid JSON, which
 * happens during `TOOL_CALL_ARGS` streaming.
 */
const parseToolCallArguments = (
  args: string
): ToolInput | undefined => {
  if (!args) {
    return undefined;
  }
  try {
    return JSON.parse(args) as ToolInput;
  } catch {
    return undefined;
  }
};

/**
 * Derive the `ch-tool` state from the AG-UI snapshot. Approval-flow states
 * (`approval-requested`, `approval-responded`, `output-denied`) are
 * Chameleon-specific UX and have no representation in the AG-UI protocol,
 * so they are never produced here.
 */
const deriveToolState = (toolResult: AGUIToolMessage | undefined): ToolState =>
  toolResult === undefined
    ? "input-available"
    : toolResult.error !== undefined
    ? "output-error"
    : "output-available";

/**
 * Default render for `ch-tool` driven by AG-UI message data.
 *
 * Combines the originating `AGUIToolCall` (carried on a previous assistant
 * message) with its matching `AGUIToolMessage` result (if any) to populate
 * the component props.
 *
 * `defaultOpen` is set to `true` so tool invocations and their results are
 * visible by default — the user gets immediate feedback that a tool ran.
 * The strict AG-UI types `AGUIToolCall` / `AGUIToolMessage` have no slot
 * for a per-call open flag, so this is a renderer-level default. Apps that
 * want a different policy can override `renderItem.tool`.
 */
export const defaultToolRender = (
  toolCall: AGUIToolCall,
  toolResult?: AGUIToolMessage
) =>
  html`<ch-tool
    class="tool-container"
    part="tool-container"
    .toolName=${toolCall.function.name}
    .type=${toolCall.type}
    .state=${deriveToolState(toolResult)}
    .input=${ifDefined(parseToolCallArguments(toolCall.function.arguments))}
    .output=${ifDefined(toolResult?.content)}
    .errorText=${ifDefined(toolResult?.error)}
    .defaultOpen=${true}
  ></ch-tool>`;

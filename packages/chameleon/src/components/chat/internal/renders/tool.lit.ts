import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { tokenMap } from "../../../../utilities/mapping/token-map.js";
import type { ChatMessageTool, ChatToolRender } from "../../types";

/**
 * Default render function for ch-tool component within chat messages.
 * Renders a tool invocation with its state, input, output, and approval workflow.
 */
export const defaultToolRender: ChatToolRender = (
  tool: ChatMessageTool
): any =>
  html`<ch-tool
    class="tool-container"
    part=${tokenMap({
      "tool-container": true,
      [tool.parts]: !!tool.parts
    })}
    .toolName=${tool.toolName}
    .type=${ifDefined(tool.type)}
    .state=${tool.state}
    .input=${ifDefined(tool.input)}
    .output=${ifDefined(tool.output)}
    .errorText=${ifDefined(tool.errorText)}
    .defaultOpen=${ifDefined(tool.defaultOpen)}
    .approvalMessage=${ifDefined(tool.approvalMessage)}
    .acceptedMessage=${ifDefined(tool.acceptedMessage)}
    .rejectedMessage=${ifDefined(tool.rejectedMessage)}
  ></ch-tool>`;

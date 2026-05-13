import { html, nothing } from "lit";
import type { ArgumentTypes } from "../../../../typings/types.js";
import type {
  AGUIActivityMessage,
  AGUIInputContent,
  AGUIMessage
} from "../../typesAGUI.js";
import type {
  ChatInputContentRender,
  ChatMessageStructureRender
} from "./types.js";

/**
 * Map an `AGUIInputContent` part type to the `ChatInputContentRender`
 * bucket that should render it.
 */
const inputContentRenderKey = (
  part: AGUIInputContent
): keyof Required<ChatInputContentRender> | undefined => {
  switch (part.type) {
    case "image":
      return "image";
    case "audio":
      return "audio";
    case "video":
      return "video";
    case "document":
      return "file";
    case "text":
      return undefined;
  }
};

/**
 * Render the multimodal `AGUIInputContent[]` parts of a user message
 * (image / audio / video / document). Text parts are skipped here and
 * rendered through the `content` section instead.
 */
const renderInputContent = (
  parts: AGUIInputContent[],
  chatRef: HTMLChChatElement,
  renders: Required<ChatInputContentRender>
) => {
  const fileParts = parts.filter(p => inputContentRenderKey(p) !== undefined);
  if (fileParts.length === 0) {
    return nothing;
  }
  return html`<ul
    class="files-container"
    part=${`files-container user`}
  >
    ${fileParts.map(part => renders[inputContentRenderKey(part)!](part, chatRef))}
  </ul>`;
};

/**
 * Default per-message structure render. Dispatches by AG-UI role.
 *
 * - `user`: text content + multimodal parts (`AGUIInputContent[]`).
 * - `assistant`: text content + tool calls (rendered via `tool` render,
 *   with the matching `AGUIToolMessage` looked up on `chatRef`).
 * - `tool`: not rendered as its own row; surfaced through the originating
 *   assistant message.
 * - `reasoning`: rendered through the `reasoning` render.
 * - `activity`: dispatched by `activityType` to `plan` / `confirmation` /
 *   `chainOfThought`.
 * - `system` / `developer`: not rendered by default.
 */
export const defaultMessageStructureRender: ChatMessageStructureRender = (
  message,
  chatRef,
  renders: ArgumentTypes<ChatMessageStructureRender>[2]
) => {
  // System / developer / tool messages produce no row of their own
  if (
    message.role === "system" ||
    message.role === "developer" ||
    message.role === "tool"
  ) {
    return nothing;
  }

  const contentBefore = renders.contentBefore
    ? renders.contentBefore(message, chatRef, renders.codeBlock)
    : nothing;

  const content = renders.content(message, chatRef, renders.codeBlock);

  const contentAfter = renders.contentAfter
    ? renders.contentAfter(message, chatRef, renders.codeBlock)
    : nothing;

  // ── Reasoning ───────────────────────────────────────────────────────
  if (message.role === "reasoning") {
    return html`<div part=${`content-container reasoning ${message.id}`}>
      ${contentBefore}${renders.reasoning(message, chatRef)}${contentAfter}
    </div>`;
  }

  // ── Activity (plan / confirmation / chain-of-thought) ───────────────
  if (message.role === "activity") {
    return html`<div part=${`content-container activity ${message.id}`}>
      ${contentBefore}${renderActivity(message, chatRef, renders)}${contentAfter}
    </div>`;
  }

  // ── User ────────────────────────────────────────────────────────────
  if (message.role === "user") {
    const filesRender =
      typeof message.content === "string"
        ? nothing
        : renderInputContent(message.content, chatRef, renders.inputContent);

    return html`<div part=${`content-container user ${message.id}`}>
      ${contentBefore}${content}${contentAfter}${filesRender}${renders.actions(
        message,
        chatRef
      )}
    </div>`;
  }

  // ── Assistant ───────────────────────────────────────────────────────
  // Tool calls are looked up against the chat's tool-result map. Falling
  // back to an empty map keeps this render stand-alone-renderable.
  const toolResults = (chatRef as HTMLChChatElement & {
    toolResultsByCallId?: Map<
      string,
      Extract<AGUIMessage, { role: "tool" }>
    >;
  }).toolResultsByCallId;

  const toolCalls = message.toolCalls ?? [];
  const toolCallsRender = toolCalls.map(call =>
    renders.tool(call, toolResults?.get(call.id), chatRef)
  );

  return html`<div part=${`content-container assistant ${message.id}`}>
    ${contentBefore}${content}${contentAfter}${toolCallsRender}${renders.actions(
      message,
      chatRef
    )}
  </div>`;
};

/**
 * Dispatch an activity message to the matching renderer based on
 * `activityType`. Unknown activity types fall through to `nothing`.
 */
const renderActivity = (
  activity: AGUIActivityMessage,
  chatRef: HTMLChChatElement,
  renders: ArgumentTypes<ChatMessageStructureRender>[2]
) => {
  switch (activity.activityType) {
    case "plan":
      return renders.plan(activity, chatRef);
    case "confirmation":
      return renders.confirmation(activity, chatRef);
    case "chain-of-thought":
      return renders.chainOfThought(activity, chatRef);
    default:
      return nothing;
  }
};

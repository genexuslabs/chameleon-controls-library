import { html, nothing } from "lit";
import { when } from "lit/directives/when.js";
import { getMessageContent } from "../../utils.js";
import type { AGUIMessage } from "../../typesAGUI.js";
import type { ChatCodeBlockRender, ChatContentRender } from "./types.js";

const defaultAssistantContentRender = (
  message: Extract<AGUIMessage, { role: "assistant" }>,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) =>
  when(
    message.content,
    () => html`<ch-markdown-viewer
      part=${`assistant content ${message.id}`}
      .renderCode=${codeBlockRender(chatRef)}
      .theme=${chatRef.markdownTheme ?? undefined}
      .value=${message.content}
    ></ch-markdown-viewer>`
  );

const defaultUserContentRender = (
  message: Extract<AGUIMessage, { role: "user" }>
) => getMessageContent(message) ?? nothing;

/**
 * Default content render. Dispatches per AG-UI role.
 *
 * - `assistant` → markdown viewer.
 * - `user` → plain text (extracted from string content or text parts of
 *   `AGUIInputContent[]`).
 * - `system` / `developer` → not rendered (no chat-visible content by
 *   default).
 * - `tool` / `reasoning` / `activity` → rendered by their dedicated
 *   renderers (`tool`, `reasoning`, `plan`, `confirmation`,
 *   `chainOfThought`), not by this section.
 */
export const defaultContentRender: ChatContentRender = (
  message,
  chatRef,
  codeBlockRender
) => {
  switch (message.role) {
    case "assistant":
      return defaultAssistantContentRender(message, chatRef, codeBlockRender);
    case "user":
      return defaultUserContentRender(message);
    case "system":
    case "developer":
    case "tool":
    case "reasoning":
    case "activity":
      return nothing;
  }
};

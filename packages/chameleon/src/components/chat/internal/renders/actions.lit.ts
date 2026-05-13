import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";
import { copy, getMessageSerializedContentAll } from "../../utils.js";
import type { ChatActionsRender } from "./types.js";

/**
 * Default actions row. Currently exposes a "copy message content" button,
 * shown only for `assistant` messages (the only role with replyable text
 * worth copying in the AG-UI model).
 */
export const defaultActionsRender: ChatActionsRender = (
  message,
  chatRef
) => {
  const { accessibleName, text } = chatRef.translations;

  return when(
    message.role === "assistant",
    () => html`<button
      aria-label=${ifDefined(
        // TODO: Don't set aria-label if it equals to the caption
        accessibleName.copyMessageContent
      )}
      part=${`assistant copy-message-content ${message.id}`}
      type="button"
      @click=${copy(getMessageSerializedContentAll(message))}
    >
      ${text.copyMessageContent}
    </button>`
  );
};

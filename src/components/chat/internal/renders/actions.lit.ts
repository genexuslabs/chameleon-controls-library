import { html } from "lit";
import { when } from "lit/directives/when";

import { tokenMap } from "../../../../common/utils";
import type { ChatActionsRender, ChatMessage } from "../../types";
import { copy, getMessageSerializedContentAll } from "../../utils";

export const defaultActionsRender: ChatActionsRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement
): any => {
  const { accessibleName, text } = chatRef.translations;

  return when(
    message.role === "assistant" &&
      (message.status === "complete" || !message.status),
    () => html`<button
      aria-label=${
        // TODO: Don't set aria-label if it equals to the caption
        accessibleName.copyMessageContent
      }
      part=${tokenMap({
        [`assistant copy-message-content ${message.id}`]: true,
        [message.parts]: !!message.parts
      })}
      type="button"
      @click=${
        // We use the whole message to support copying the files and/or sources
        copy(getMessageSerializedContentAll(message))
      }
    >
      ${text.copyMessageContent}
    </button>`
  );
};

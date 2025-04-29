import { h } from "@stencil/core";
import type { ChatActionsRender, ChatMessage } from "../types";
import { tokenMap } from "../../../common/utils";
import { copy, getMessageSerializedContentAll } from "../utils";

export const defaultActionsRender: ChatActionsRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement
): any => {
  const { accessibleName, text } = chatRef.translations;

  return (
    message.role === "assistant" &&
    (message.status === "complete" || !message.status) && (
      <button
        aria-label={accessibleName.copyMessageContent}
        part={tokenMap({
          [`assistant copy-message-content ${message.id}`]: true,
          [message.parts]: !!message.parts
        })}
        type="button"
        // We use the whole message to support copying the files and/or sources
        onClick={copy(getMessageSerializedContentAll(message))}
      >
        {text.copyMessageContent}
      </button>
    )
  );
};

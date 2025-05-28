import { html } from "lit";
import { when } from "lit/directives/when";
import { tokenMap } from "../../../../common/utils";
import type {
  ChatCodeBlockRender,
  ChatContentRender,
  ChatMessage,
  ChatMessageByRole,
  ChatMessageRole
} from "../../types";
import { DEFAULT_ASSISTANT_STATUS, getMessageContent } from "../../utils";

const defaultAssistantContentRender: ChatContentRender = (
  message: ChatMessageByRole<"assistant">,
  chatRef: HTMLChChatElement
  // codeBlockRender: ChatCodeBlockRender
) => {
  const messageContent = getMessageContent(message);

  return message.status === "waiting"
    ? html`<div
        class="assistant-loading"
        part=${tokenMap({
          [`assistant content waiting ${message.id}`]: true,
          [message.parts]: !!message.parts
        })}
      >
        ${messageContent}
      </div>`
    : when(
        messageContent,
        () => html`<ch-markdown-viewer
          part=${tokenMap({
            [`assistant content ${message.id} ${
              message.status ?? DEFAULT_ASSISTANT_STATUS
            }`]: true,
            [message.parts]: !!message.parts
          })}
          .showIndicator=${message.status === "streaming"}
          .theme=${chatRef.markdownTheme}
          .value=${messageContent}
        ></ch-markdown-viewer>`
      );
};

const defaultErrorContentRender: ChatContentRender = (
  message: ChatMessageByRole<"error">,
  chatRef: HTMLChChatElement,
  codeBlockRender
) => {
  const errorContent = getMessageContent(message);

  return when(
    errorContent,
    () =>
      html`<ch-markdown-viewer
        part=${tokenMap({
          [`error content ${message.id}`]: true,
          [message.parts]: !!message.parts
        })}
        .renderCode=${codeBlockRender(chatRef)}
        .theme=${chatRef.markdownTheme}
        .value=${errorContent}
      ></ch-markdown-viewer>`
  );
};

const defaultUserContentRender: ChatContentRender = (
  messageModel: ChatMessageByRole<"error">
) => getMessageContent(messageModel);

const defaultSystemContentRender: ChatContentRender = () => null;

const contentRenderByRole = {
  assistant: defaultAssistantContentRender,
  error: defaultErrorContentRender,
  system: defaultSystemContentRender,
  user: defaultUserContentRender
} as const satisfies { [key in ChatMessageRole]: ChatContentRender };

export const defaultContentRender: ChatContentRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => contentRenderByRole[message.role](message, chatRef, codeBlockRender);

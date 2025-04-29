import { h } from "@stencil/core";
import type {
  ChatCodeBlockRender,
  ChatContentRender,
  ChatFile,
  ChatFileRender,
  ChatMessageByRole,
  ChatMessageRole,
  ChatMessageStructureRender,
  ChatSourceRender
} from "../types";
import { tokenMap } from "../../../common/utils";
import { DEFAULT_ASSISTANT_STATUS, getMessageFiles } from "../utils";
import { getMimeTypeFileFormat } from "../../../common/mimeTypes/mime-types-utils";

type ChatMessageNoSystem = ChatMessageByRole<
  Exclude<ChatMessageRole, "system">
>;

const applyFileRenders = (
  file: ChatFile,
  chatRef: HTMLChChatElement,
  renders: ChatFileRender
) => renders[getMimeTypeFileFormat(file.mimeType)](file, chatRef);

export const defaultMessageStructureRender: ChatMessageStructureRender = (
  message: ChatMessageNoSystem,
  chatRef: HTMLChChatElement,
  renders: {
    codeBlock: ChatCodeBlockRender;
    content: ChatContentRender;
    file: ChatFileRender;
    source: ChatSourceRender;
  }
) => {
  const assistantStatus =
    message.role === "assistant"
      ? message.status ?? DEFAULT_ASSISTANT_STATUS
      : undefined;

  const messageFiles = getMessageFiles(message);
  const messageSources = message.sources ?? [];

  return (
    <div
      part={tokenMap({
        [`content-container ${message.role} ${message.id}`]: true,
        [assistantStatus]: !!assistantStatus,
        [message.parts]: !!message.parts
      })}
    >
      {renders.content(message, chatRef, renders.codeBlock)}

      {
        // Files
        messageFiles.length !== 0 && (
          <div
            part={tokenMap({
              [`files-container ${message.role} ${message.id}`]: true,
              [assistantStatus]: !!assistantStatus,
              [message.parts]: !!message.parts
            })}
          >
            {messageFiles.map(file =>
              applyFileRenders(file, chatRef, renders.file)
            )}
          </div>
        )
      }

      {
        // Sources
        messageSources.length !== 0 && (
          <div
            part={tokenMap({
              [`sources-container ${message.role} ${message.id}`]: true,
              [assistantStatus]: !!assistantStatus,
              [message.parts]: !!message.parts
            })}
          >
            {messageSources.map(source => renders.source(source, chatRef))}
          </div>
        )
      }
    </div>
  );
};

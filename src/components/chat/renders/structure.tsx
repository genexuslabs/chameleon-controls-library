import { h } from "@stencil/core";
import type {
  ChatCodeBlockRender,
  ChatContentRender,
  ChatFile,
  ChatFilesRender,
  ChatMessageByRole,
  ChatMessageRole,
  ChatMessageStructureRender
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
  renders: ChatFilesRender
) => renders[getMimeTypeFileFormat(file.mimeType)](file, chatRef);

export const defaultMessageStructureRender: ChatMessageStructureRender = (
  message: ChatMessageNoSystem,
  chatRef: HTMLChChatElement,
  renders: {
    codeBlock: ChatCodeBlockRender;
    content: ChatContentRender;
    files: ChatFilesRender;
  }
) => {
  const assistantStatus =
    message.role === "assistant"
      ? message.status ?? DEFAULT_ASSISTANT_STATUS
      : undefined;

  const chatFiles = getMessageFiles(message);

  return (
    <div
      part={tokenMap({
        [`content-container ${message.role}`]: true,
        [assistantStatus]: !!assistantStatus,
        [message.parts]: !!message.parts
      })}
    >
      {renders.content(message, chatRef, renders.codeBlock)}

      {chatFiles.length !== 0 && (
        <div
          part={tokenMap({
            [`files-container ${message.role}`]: true,
            [assistantStatus]: !!assistantStatus,
            [message.parts]: !!message.parts
          })}
        >
          {chatFiles.map(file =>
            applyFileRenders(file, chatRef, renders.files)
          )}
        </div>
      )}
    </div>
  );
};

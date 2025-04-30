import { h } from "@stencil/core";
import type {
  ChatMessageFile,
  ChatFileRender,
  ChatMessageByRole,
  ChatMessageRole,
  ChatMessageStructureRender
} from "../types";
import { tokenMap } from "../../../common/utils";
import { DEFAULT_ASSISTANT_STATUS, getMessageFilesAndSources } from "../utils";
import { getMimeTypeFileFormat } from "../../../common/mimeTypes/mime-types-utils";
import { ArgumentTypes } from "../../../common/types";

type ChatMessageNoSystem = ChatMessageByRole<
  Exclude<ChatMessageRole, "system">
>;

const applyFileRenders = (
  file: ChatMessageFile,
  chatRef: HTMLChChatElement,
  renders: Required<ChatFileRender>
) => renders[getMimeTypeFileFormat(file.mimeType)](file, chatRef);

export const defaultMessageStructureRender: ChatMessageStructureRender = (
  message: ChatMessageNoSystem,
  chatRef: HTMLChChatElement,
  renders: ArgumentTypes<ChatMessageStructureRender>[2]
) => {
  const assistantStatus =
    message.role === "assistant"
      ? message.status ?? DEFAULT_ASSISTANT_STATUS
      : undefined;

  const { files, sources } = getMessageFilesAndSources(message);
  const { sourceFiles } = chatRef.translations.text;

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
        files.length !== 0 && (
          <ul
            class="files-container"
            part={tokenMap({
              [`files-container ${message.role} ${message.id}`]: true,
              [assistantStatus]: !!assistantStatus,
              [message.parts]: !!message.parts
            })}
          >
            {files.map(file => applyFileRenders(file, chatRef, renders.file))}
          </ul>
        )
      }

      {
        // Sources
        sources.length !== 0 && (
          <ul
            class="sources-container"
            part={tokenMap({
              [`sources-container ${message.role} ${message.id}`]: true,
              [assistantStatus]: !!assistantStatus,
              [message.parts]: !!message.parts
            })}
          >
            {sourceFiles && (
              // TODO: Test the accessibility of this span
              <span
                part={tokenMap({
                  [`sources-caption ${message.role} ${message.id}`]: true,
                  [assistantStatus]: !!assistantStatus,
                  [message.parts]: !!message.parts
                })}
              >
                {sourceFiles}
              </span>
            )}

            {sources.map(source => renders.source(source, chatRef))}
          </ul>
        )
      }

      {renders.actions(message, chatRef)}
    </div>
  );
};

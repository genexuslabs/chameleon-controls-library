import { copyToTheClipboard } from "../../common/utils";
import type {
  ChatMessageFiles,
  ChatFileUploadState,
  ChatMessageAssistant,
  ChatMessageNoId,
  ChatMessageSources
} from "./types";

export const getMessageContent = (message: ChatMessageNoId) =>
  typeof message.content === "string"
    ? message.content
    : message.content.message;

export const getMessageSerializedContentAll = (message: ChatMessageNoId) =>
  typeof message.content === "string"
    ? message.content
    : JSON.stringify(message.content, undefined, 2);

export const getMessageFiles = (message: ChatMessageNoId): ChatMessageFiles =>
  typeof message.content === "object" ? message.content.files ?? [] : [];

export const getMessageSources = (
  message: ChatMessageNoId
): ChatMessageSources =>
  typeof message.content === "object" ? message.content.sources ?? [] : [];

export const getMessageFilesAndSources = (
  message: ChatMessageNoId
): { files: ChatMessageFiles; sources: ChatMessageSources } =>
  typeof message.content === "object"
    ? {
        files: message.content.files ?? [],
        sources: message.content.sources ?? []
      }
    : { files: [], sources: [] };

export const DEFAULT_ASSISTANT_STATUS =
  "complete" satisfies ChatMessageAssistant["status"];

export const DEFAULT_FILE_UPLOAD_STATE =
  "uploaded" satisfies ChatFileUploadState;

export const copy = (text: string) => () => copyToTheClipboard(text);

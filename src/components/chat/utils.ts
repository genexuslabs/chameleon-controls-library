import type {
  ChatFiles,
  ChatFileUploadState,
  ChatMessageAssistant,
  ChatMessageNoId
} from "./types";

export const getMessageContent = (message: ChatMessageNoId) =>
  typeof message.content === "string"
    ? message.content
    : message.content.message;

export const getMessageFiles = (message: ChatMessageNoId): ChatFiles =>
  typeof message.content === "object" ? message.content.files ?? [] : [];

export const DEFAULT_ASSISTANT_STATUS =
  "complete" satisfies ChatMessageAssistant["status"];

export const DEFAULT_FILE_UPLOAD_STATE =
  "uploaded" satisfies ChatFileUploadState;

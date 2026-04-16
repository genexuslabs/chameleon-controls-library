import { copyToTheClipboard } from "../../utilities/clipboard.js";
import type {
  ChatMessageFiles,
  ChatFileUploadState,
  ChatMessageAssistant,
  ChatMessageNoId,
  ChatMessageSources,
  ChatMessagePlan,
  ChatMessageTool,
  ChatMessageConfirmation,
  ChatMessageReasoning
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

export const getMessagePlan = (
  message: ChatMessageNoId
): ChatMessagePlan | undefined =>
  typeof message.content === "object" ? message.content.plan : undefined;

export const getMessageTool = (
  message: ChatMessageNoId
): ChatMessageTool | undefined =>
  typeof message.content === "object" ? message.content.tool : undefined;

export const getMessageConfirmation = (
  message: ChatMessageNoId
): ChatMessageConfirmation | undefined =>
  typeof message.content === "object"
    ? message.content.confirmation
    : undefined;

export const getMessageReasoning = (
  message: ChatMessageNoId
): ChatMessageReasoning | undefined =>
  typeof message.content === "object" ? message.content.reasoning : undefined;

export const getMessageSpecialComponents = (
  message: ChatMessageNoId
): {
  plan?: ChatMessagePlan;
  tool?: ChatMessageTool;
  confirmation?: ChatMessageConfirmation;
  reasoning?: ChatMessageReasoning;
} =>
  typeof message.content === "object"
    ? {
        plan: message.content.plan,
        tool: message.content.tool,
        confirmation: message.content.confirmation,
        reasoning: message.content.reasoning
      }
    : {};


export const DEFAULT_ASSISTANT_STATUS =
  "complete" satisfies ChatMessageAssistant["status"];

export const DEFAULT_FILE_UPLOAD_STATE =
  "uploaded" satisfies ChatFileUploadState;

export const copy = (text: string) => () => copyToTheClipboard(text);

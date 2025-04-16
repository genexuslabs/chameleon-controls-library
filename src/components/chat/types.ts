import type { ChMimeType } from "../../common/mime-types";

/**
 * Valid examples:
 * @example
 *   const systemMessage: ChatMessage = {
 *     role: "system",
 *     content: "A useful assistant."
 *   };
 *
 *   const assistantMessage: ChatMessage = {
 *     role: "assistant",
 *     content: "How can I help you?",
 *     status: "waiting"
 *   };
 *
 *   const assistantMessageWithFiles: ChatMessage = {
 *     role: "assistant",
 *     content: {
 *       message: "How can I help you?",
 *       files: [
 *         { url: "...", mimeType: "audio/mpeg", accessibleName: "..." },
 *         { url: "...", mimeType: "image/png", alternativeText: "..." },
 *         { url: "...", mimeType: "video/mp4", accessibleName: "..." },
 *         { url: "...", mimeType: "any string" }
 *       ]
 *     },
 *     status: "waiting"
 *   };
 *
 *   const userMessage: ChatMessage = {
 *     role: "user",
 *     content: "Hello world!"
 *   };
 *
 *   const userMessageWithFiles: ChatMessage = {
 *     role: "user",
 *     content: {
 *       message: "Hello world!",
 *       files: [
 *         { url: "...", mimeType: "audio/mpeg", accessibleName: "..." },
 *         { url: "...", mimeType: "image/png", alternativeText: "..." },
 *         { url: "...", mimeType: "video/mp4", accessibleName: "..." },
 *         { url: "...", mimeType: "any string" }
 *       ]
 *     }
 *   };
 */
export type ChatMessage = ChatMessageByRole<ChatMessageRole>;
export type ChatMessageNoId = ChatMessageByRoleNoId<ChatMessageRole>;

export type ChatMessageByRole<T extends ChatMessageRole> = T extends "system"
  ? ChatMessageSystem
  : T extends "user"
  ? ChatMessageUser
  : T extends "assistant"
  ? ChatMessageAssistant
  : ChatMessageError;

export type ChatMessageByRoleNoId<T extends ChatMessageRole> =
  T extends "system"
    ? Omit<ChatMessageSystem, "id">
    : T extends "user"
    ? Omit<ChatMessageUser, "id">
    : T extends "assistant"
    ? Omit<ChatMessageAssistant, "id">
    : Omit<ChatMessageError, "id">;

export type ChatMessageSystem = {
  id: string;
  role: "system";
  metadata?: string;
  content: ChatContent;
};

export type ChatMessageUser = {
  id: string;
  role: "user";
  content: ChatContent;
  metadata?: string;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;
};

export type ChatMessageAssistant = {
  id: string;
  role: "assistant";
  content?: ChatContent;
  metadata?: string;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;

  /**
   * Specifies the status of the message. If not defined, it will default
   * to "complete"
   */
  status?: "complete" | "waiting" | "streaming";
};

export type ChatMessageError = {
  id: string;
  role: "error";
  content: ChatContent;
  metadata?: string;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;
};

export type ChatMessageRole = "system" | "user" | "assistant" | "error";

export type ChatContent = string | ChatContentFiles;

export type ChatContentFiles = {
  message: string;
  files?: ChatFiles;
};

export type ChatFiles = ChatFile[];

export type ChatFile = {
  accessibleName?: string;
  alternativeText?: string;
  caption?: string;

  // The (string & Record<never, never>) is necessary to allow any string as
  // the mimeType without removing the VSCode suggestions
  mimeType: ChMimeType | (string & Record<never, never>); // TODO: Which is the mimeType for hrefs?
  url: string;
};

export type ChatInternalCallbacks = {
  /**
   * Specifies a callback to execute when the user adds a new message to the
   * chat and waits a response.
   */
  sendChatMessages: (chat: ChatMessage[]) => void;

  /**
   * Specifies a callback to execute when clicking the stop-generate-answer
   * button.
   */
  stopGeneratingAnswer?: () => Promise<void>;

  /**
   * Specifies a callback to validate if the current chat message of the user
   * can be send. If `false`, the `sendChatMessages` won't be executed.
   */
  validateSendChatMessage?: (chat: ChatMessage) => boolean | Promise<boolean>;
};

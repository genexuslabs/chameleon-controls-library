import {
  MimeTypeFormatMap,
  MimeTypes
} from "../../common/mime-type/mime-types";

/**
 * Valid examples:
 * @example
 *   const systemMessage: GxEAIChatMessage = {
 *     role: "system",
 *     content: "A useful assistant."
 *   };
 *
 *   const assistantMessage: GxEAIChatMessage = {
 *     role: "assistant",
 *     content: "Processing with Chat with LLMs",
 *     status: "waiting"
 *   };
 *
 *   const userMessage: GxEAIChatMessage = {
 *     role: "user",
 *     content: "Hello world!"
 *   };
 *
 *   const userMessageWithImage: GxEAIChatMessage = {
 *     role: "user",
 *     content: {
 *       content: "Hello world!",
 *       files: [
 *         { caption: "Profile.png", mimeType: "image/jpg", url: "..." },
 *         { caption: "House.webp", mimeType: "image/jpg", url: "..." },
 *       ]
 *     }
 *   };
 */
export type ChatMessage = ChatMessageByRole<ChatMessageRole>;
export type ChatMessageNoId = ChatMessageByRoleNoId<ChatMessageRole>;
export type ChatMessageRole = "system" | "user" | "assistant" | "error";

export type ChatMessageByRole<T extends ChatMessageRole> = T extends "system"
  ? ChatMessageSystem
  : T extends "error"
  ? ChatMessageError
  : T extends "user"
  ? ChatMessageUser
  : ChatMessageAssistant;

export type ChatMessageByRoleNoId<T extends ChatMessageRole> =
  T extends "system"
    ? Omit<ChatMessageSystem, "id">
    : T extends "user"
    ? Omit<ChatMessageUser, "id">
    : T extends "assistant"
    ? Omit<ChatMessageAssistant, "id">
    : Omit<ChatMessageError, "id">;

// System
export type ChatMessageSystem = {
  id: string;
  role: "system";
  metadata?: string;
  content: string;
};

// Error
export type ChatMessageError = {
  id: string;
  role: "error";
  content: string;
  metadata?: string;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;
};

// User
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

// Assistant
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
  status?: ChatMessageAssistantStatus;
};

export type ChatMessageAssistantStatus =
  | "complete"
  | "waiting"
  | "streaming"
  | "error";

export type ChatContent = string | ChatContentFiles;

export type ChatContentFiles = {
  message: string;
  files?: ChatContentFile[];
};

export type ChatContentFile = {
  caption: string;
  mimeType: MimeTypes;
  pageNumber?: number;
  url: string;
};

export type ChatInternalCallbacks = {
  clear: () => Promise<void>;

  /**
   * Specifies a callback to execute when the user reaches the infinite
   * threshold. It receives the current array of messages and return a promise
   * containing the new messages that will be added at the top of the chat.
   */
  loadMoreItems: (
    chat: ChatMessage[]
  ) => Promise<{ items: ChatMessage[]; morePages: boolean }>;

  /**
   * Specifies a callback to execute when the user adds a new message to the
   * chat and waits a response.
   */
  sendChat: (chat: ChatMessage[]) => void;

  /**
   * Specifies a callback to execute when clicking the stop-generate-answer
   * button.
   */
  stopGeneratingAnswer?: () => Promise<void>;

  /**
   * Displays a notification when the user tried to upload more file than the
   * maximum allowed by the assistant.
   */
  showMaxFileCountForUploadError?: (maxFileCount: number) => void;

  /**
   * Displays a notification when the user tried to upload a file that weights
   * more than the maximum allowed by the assistant.
   */
  showMaxFileSizeForUploadError?: (maxFileSize: number) => void;

  /**
   * Given the file, it uploads the file to the server and returns the URL of
   * the public file that will be used in the user chat message.
   */
  uploadFile?: (file: File) => Promise<{ caption: string; url: string }>;
};

export type ChatInternalFileToUpload = {
  caption: string;
  extension: string;
  key: string;
  file: File;
  mimeTypeFormat: keyof MimeTypeFormatMap;
  src: string | undefined;
};

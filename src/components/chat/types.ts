import type {
  ChMimeType,
  ChMimeTypeFormatMap
} from "../../common/mimeTypes/mime-types";
import type { MarkdownViewerCodeRender } from "../markdown-viewer/parsers/types";

export type ChatMessageRole = "assistant" | "error" | "system" | "user";

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
  metadata?: any;
  content: ChatContent;
  sources?: ChatMessageSources;
};

export type ChatMessageUser = {
  id: string;
  role: "user";
  content: ChatContent;
  metadata?: any;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;

  sources?: ChatMessageSources;
};

export type ChatMessageAssistant = {
  id: string;
  role: "assistant";
  content?: ChatContent;
  metadata?: any;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;

  /**
   * Specifies the status of the message. If not defined, it will default
   * to `"complete"`
   */
  status?: "complete" | "waiting" | "streaming";

  sources?: ChatMessageSources;
};

export type ChatMessageError = {
  id: string;
  role: "error";
  content: ChatContent;
  metadata?: any;

  /**
   * Added to the parts of the cell.
   */
  parts?: string;

  sources?: ChatMessageSources;
};

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

  extension?: string;

  // The (string & Record<never, never>) is necessary to allow any string as
  // the mimeType without removing the VSCode suggestions
  mimeType: ChMimeType | (string & Record<never, never>);

  /**
   * Specifies the uploading state of the files.
   *
   * By default is `"uploaded"`.
   */
  uploadState?: ChatFileUploadState;

  url: string;
};

export type ChatFileUploadState = "failed" | "in-progress" | "uploaded";

export type ChatMessageSources = ChatMessageSource[];

export type ChatMessageSource = {
  accessibleName?: string;
  caption?: string;
  url: string;
  parts?: string;
};

export type ChatInternalCallbacks = {
  /**
   * Specifies a callback that is executed after the user adds a new message to
   * the chat.
   *
   * Since developers can define their own render for file attachment, this
   * callback serves to synchronize the cleanup of the send-input with the
   * cleanup of the custom file attachment.
   */
  clearChatMessageFiles?: () => void;

  /**
   * Specifies a callback to execute before the user adds a new message in the
   * chat. This callbacks is intended to get retrieve the files that the user
   * wants to add in the message.
   *
   * This callback allows developers to implement any custom rendering for
   * attaching files.
   */
  getChatMessageFiles?: () => File[] | Promise<File[]>;

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
  validateSendChatMessage?: (
    chat: ChatMessage,
    files: File[]
  ) => boolean | Promise<boolean>;

  /**
   * Upload a file returning a `ChatFile` type object containing the public URL
   * where the file is stored.
   *
   * When the promise resolve, the `ch-chat` will ensure the returned `ChatFile`
   * has `uploadedState === "uploaded"`. If the promise is reject, the `ch-chat`
   * will set `uploadedState === "failed"` in the returned `ChatFile`.
   */
  uploadFile?: (file: File) => Promise<ChatFile>;
};

export type ChatMessageRenderByItem = (
  messageModel: ChatMessageByRole<"assistant" | "error" | "user">
) => any;

export type ChatMessageRenderBySections = {
  /**
   * Render for code blocks.
   *
   * If `undefined`, a default code block render will be used.
   */
  codeBlock?: ChatCodeBlockRender;

  /**
   * Render for the content of the message.
   *
   * If `undefined`, a default content render will be used.
   */
  content?: ChatContentRender;

  /**
   * Renders for each file type of the message
   *
   * If `undefined`, a default render for the files will be used.
   */
  files?: ChatFilesRender;

  /**
   * Render for the general structure of the message.
   *
   * This render is useful for adding extra elements and widgets for
   * customizing the message structure and content. This render has direct
   * access for all sub-renders of the message (`codeBlock`, `content`, and
   * `files`) for allowing to relocate those render according to the developer
   * needs.
   *
   * If `undefined`, a default structure render will be used.
   */
  messageStructure?: ChatMessageStructureRender;

  /**
   * Render for the sources of the message.
   *
   * If `undefined`, a default render for the sources will be used.
   */
  sources?: ChatSourcesRender;
};

export type ChatCodeBlockRender = (
  chatRef: HTMLChChatElement
) => MarkdownViewerCodeRender;

export type ChatContentRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => any;

export type ChatFilesRender = {
  [key in keyof ChMimeTypeFormatMap]: (
    file: ChatFile,
    chatRef: HTMLChChatElement
  ) => any;
};

export type ChatMessageStructureRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  renders: {
    codeBlock: ChatCodeBlockRender;
    content: ChatContentRender;
    files: ChatFilesRender;
    sources: ChatSourcesRender;
  }
) => any;

export type ChatSourcesRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement
) => any;

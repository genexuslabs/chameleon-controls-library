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

  /**
   * A field for adding any extra information that must be stored for the
   * message.
   *
   * The `metadata` field can be used for any purpose.
   */
  metadata?: any;

  content: ChatMessageContent;

  /**
   * Parts for the cell, message content, `files-container` and
   * `sources-container`.
   *
   * It is not added to the parts of the files and sources.
   */
  parts?: string;
};

export type ChatMessageUser = {
  id: string;
  role: "user";
  content: ChatMessageContent;

  /**
   * A field for adding any extra information that must be stored for the
   * message.
   *
   * The `metadata` field can be used for any purpose, for example, adding more
   * information to customize the render.
   */
  metadata?: any;

  /**
   * Parts for the cell, message content, `files-container` and
   * `sources-container`.
   *
   * It is not added to the parts of the files and sources.
   */
  parts?: string;
};

export type ChatMessageAssistant = {
  id: string;
  role: "assistant";
  content: ChatMessageContent;

  /**
   * A field for adding any extra information that must be stored for the
   * message.
   *
   * The `metadata` field can be used for any purpose, for example, adding more
   * information to customize the render.
   */
  metadata?: any;

  /**
   * Parts for the cell, message content, `files-container` and
   * `sources-container`.
   *
   * It is not added to the parts of the files and sources.
   */
  parts?: string;

  /**
   * Specifies the status of the message. If not defined, it will default
   * to `"complete"`
   */
  status?: "complete" | "waiting" | "streaming";
};

export type ChatMessageError = {
  id: string;
  role: "error";
  content: ChatMessageContent;

  /**
   * A field for adding any extra information that must be stored for the
   * message.
   *
   * The `metadata` field can be used for any purpose, for example, adding more
   * information to customize the render.
   */
  metadata?: any;

  /**
   * Parts for the cell, message content, `files-container` and
   * `sources-container`.
   *
   * It is not added to the parts of the files and sources.
   */
  parts?: string;
};

export type ChatMessageContent = string | ChatMessageContentFilesAndSources;

export type ChatMessageContentFilesAndSources = {
  message: string;
  files?: ChatMessageFiles;
  sources?: ChatMessageSources;
};

export type ChatMessageFiles = ChatMessageFile[];

export type ChatMessageFile = {
  accessibleName?: string;
  alternativeText?: string;
  caption?: string;

  extension?: string;

  /**
   * A field for adding any extra information that must be stored for the
   * file.
   *
   * The `metadata` field can be used for any purpose, for example, adding more
   * information to customize the render.
   */
  metadata?: any;

  // The (string & Record<never, never>) is necessary to allow any string as
  // the mimeType without removing the VSCode suggestions
  mimeType: ChMimeType | (string & Record<never, never>);

  /**
   * Parts for the file.
   */
  parts?: string;

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

  /**
   * A field for adding any extra information that must be stored for the
   * source.
   *
   * The `metadata` field can be used for any purpose, for example, adding more
   * information to customize the render.
   */
  metadata?: any;

  /**
   * Parts for the source.
   */
  parts?: string;

  url: string;
};

export type ChatInternalCallbacks = {
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
  uploadFile?: (file: File) => Promise<ChatMessageFile>;
};

export type ChatMessageRenderByItem = (
  messageModel: ChatMessageByRole<"assistant" | "error" | "user">
) => any;

export type ChatMessageRenderBySections = {
  /**
   * Render for additional actions of the message.
   *
   * If `undefined`, a default render for the additional actions will be used.
   */
  actions?: ChatActionsRender;

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
  file?: ChatFileRender;

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
   * Render for each source of the message.
   *
   * If `undefined`, a default render for the sources will be used.
   */
  source?: ChatSourceRender;
};

export type ChatActionsRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement
) => any;

export type ChatCodeBlockRender = (
  chatRef: HTMLChChatElement
) => MarkdownViewerCodeRender;

export type ChatContentRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => any;

export type ChatFileRender = {
  [key in keyof ChMimeTypeFormatMap]?: (
    file: ChatMessageFile,
    chatRef: HTMLChChatElement
  ) => any;
};

export type ChatMessageStructureRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  renders: Required<Omit<ChatMessageRenderBySections, "messageStructure">>
) => any;

export type ChatSourceRender = (
  source: ChatMessageSource,
  chatRef: HTMLChChatElement
) => any;

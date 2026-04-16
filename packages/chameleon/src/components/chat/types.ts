import type { TemplateResult } from "lit";
import type {
  ChMimeType,
  ChMimeTypeFormatMap
} from "../../typings/mime-types.js";
import type { LiveKitCallbacks } from "../live-kit-room/types";
import type { MarkdownViewerCodeRender } from "../markdown-viewer/parsers/types";
import type { PlanStepModel, PlanActionModel } from "../plan/types";
import type { ToolState, ToolInput, ToolOutput } from "../tool/types";
import type { ConfirmationApproval, ConfirmationState } from "../confirmation/types";

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

  /**
   * `true` if the message content was transcribed by using the live mode.
   */
  transcribed?: boolean;
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

  /**
   * `true` if the message content was transcribed by using the live mode.
   */
  transcribed?: boolean;
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
  message?: string;
  files?: ChatMessageFiles;
  sources?: ChatMessageSources;

    
  /**
   * Optional plan component to render within the message.
   */
  plan?: ChatMessagePlan;
  
  /**
   * Optional tool component to render within the message.
   */
  tool?: ChatMessageTool;
  
  /**
   * Optional confirmation component to render within the message.
   */
  confirmation?: ChatMessageConfirmation;
  
  /**
   * Optional reasoning component to render within the message.
   */
  reasoning?: ChatMessageReasoning;
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

  mimeType: ChMimeType;

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


/**
 * Represents a plan component to be rendered within a chat message.
 * Based on the props of the ch-plan component.
 */
export type ChatMessagePlan = {
  /**
   * The main title of the plan
   */
  title: string;

  /**
   * Optional description providing context about the plan
   */
  description?: string;

  /**
   * Array of steps that make up the plan
   */
  steps: PlanStepModel[];

  /**
   * Optional array of action buttons to display in the plan footer
   */
  actions?: PlanActionModel[];

  /**
   * Whether the plan content is currently being streamed
   */
  isStreaming?: boolean;

  /**
   * Whether the plan should be expanded by default
   */
  defaultOpen?: boolean;

  /**
   * Parts for the plan container.
   */
  parts?: string;
};

/**
 * Represents a tool component to be rendered within a chat message.
 * Based on the props of the ch-tool component.
 */
export type ChatMessageTool = {
  /**
   * The name of the tool being invoked.
   */
  toolName: string;

  /**
   * The type of the tool (optional metadata).
   */
  type?: string;

  /**
   * The current state of the tool invocation.
   */
  state: ToolState;

  /**
   * Input parameters for the tool invocation.
   */
  input?: ToolInput | null;

  /**
   * Output result from the tool execution.
   */
  output?: ToolOutput | null;

  /**
   * Error message when the tool execution fails.
   */
  errorText?: string;

  /**
   * Controls whether the accordion is expanded by default.
   */
  defaultOpen?: boolean;

  /**
   * Message shown when approval is requested.
   */
  approvalMessage?: string;

  /**
   * Message shown when approval is accepted.
   */
  acceptedMessage?: string;

  /**
   * Message shown when approval is rejected.
   */
  rejectedMessage?: string;

  /**
   * Parts for the tool container.
   */
  parts?: string;
};

/**
 * Represents a confirmation component to be rendered within a chat message.
 * Based on the props of the ch-confirmation component.
 */
export type ChatMessageConfirmation = {
  /**
   * The approval object containing the approval request information.
   */
  approval?: ConfirmationApproval;

  /**
   * The current state of the confirmation workflow.
   */
  state: ConfirmationState;

  /**
   * Optional title for the confirmation alert.
   */
  title?: string;

  /**
   * Message to display when in 'approval-requested' state.
   */
  requestMessage?: string;

  /**
   * Message to display when in 'approval-responded' or 'output-available' state.
   */
  acceptedMessage?: string;

  /**
   * Message to display when in 'output-denied' state.
   */
  rejectedMessage?: string;

  /**
   * Parts for the confirmation container.
   */
  parts?: string;
};

/**
 * Represents a reasoning component to be rendered within a chat message.
 * Based on the props of the ch-reasoning component.
 */
export type ChatMessageReasoning = {
  /**
   * The reasoning text content to display.
   */
  content: string;

  /**
   * Controls the streaming state.
   */
  isStreaming?: boolean;

  /**
   * Message displayed while thinking/streaming.
   */
  thinkingMessage?: string;

  /**
   * Template for the thought duration message.
   */
  thoughtMessageTemplate?: string;

  /**
   * Speed of the typewriter effect in milliseconds.
   */
  streamingSpeedMs?: number;

  /**
   * Parts for the reasoning container.
   */
  parts?: string;
};

export type ChatCallbacks = {
  /**
   * Specifies a callback that is executed when the user wants to download the
   * code block as a file.
   *
   * This callback is useful to implement any custom render to manage this
   * action. For example, displaying a dialog to customize the file name that
   * contains the code block to download.
   *
   * If specified, in the default code block render a "download code" button will
   * be displayed in the `code-block__header-actions`.
   */
  downloadCodeBlock?: (plainText: string, language: string) => void;

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
   * Specifies a set of callback to manage `liveMode` events.
   */
  liveMode?: Pick<LiveKitCallbacks, "activeSpeakersChanged">;

  /**
   * Specifies a callback to execute when the user adds a new message to the
   * chat and waits a response.
   */
  sendChatMessages: (chat: ChatMessage[]) => void;

  /**
   * Specifies a callback to execute when clicking the stop-response button.
   */
  stopResponse?: () => Promise<void>;

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
) => TemplateResult | string;

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
   * Render for content that is placed before the main content of the message.
   *
   * This section doesn't always have to be defined, in fact, it doesn't have a
   * default render.
   */
  contentBefore?: ChatContentRender;

  /**
   * Render for the content of the message.
   *
   * If `undefined`, a default content render will be used.
   */
  content?: ChatContentRender;

  /**
   * Render for content that is placed after the main content of the message.
   *
   * This section doesn't always have to be defined, in fact, it doesn't have a
   * default render.
   */
  contentAfter?: ChatContentRender;

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

  
  /**
   * Render for the plan component within the message.
   *
   * If `undefined`, a default render for the plan will be used.
   */
  plan?: ChatPlanRender;

  /**
   * Render for the tool component within the message.
   *
   * If `undefined`, a default render for the tool will be used.
   */
  tool?: ChatToolRender;

  /**
   * Render for the confirmation component within the message.
   *
   * If `undefined`, a default render for the confirmation will be used.
   */
  confirmation?: ChatConfirmationRender;

  /**
   * Render for the reasoning component within the message.
   *
   * If `undefined`, a default render for the reasoning will be used.
   */
  reasoning?: ChatReasoningRender;
};

export type ChatActionsRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatCodeBlockRender = (
  chatRef: HTMLChChatElement
) => MarkdownViewerCodeRender;

export type ChatContentRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => TemplateResult | string;

export type ChatFileRender = {
  [key in keyof ChMimeTypeFormatMap]?: (
    file: ChatMessageFile,
    chatRef: HTMLChChatElement
  ) => TemplateResult | string;
};

export type ChatMessageStructureRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  renders: Required<
    Omit<ChatMessageRenderBySections, "messageStructure" | "file">
  > & {
    file: Required<ChatFileRender>;
  }
) => TemplateResult | string;

export type ChatSourceRender = (
  source: ChatMessageSource,
  chatRef: HTMLChChatElement
) => TemplateResult | string;


export type ChatPlanRender = (
  plan: ChatMessagePlan,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatToolRender = (
  tool: ChatMessageTool,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatConfirmationRender = (
  confirmation: ChatMessageConfirmation,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatReasoningRender = (
  reasoning: ChatMessageReasoning,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatLiveModeConfiguration = {
  url: string;
  token: string;
  localParticipant?: {
    microphoneEnabled?: boolean;
  };
};

export type ChatSendContainerLayout = {
  sendContainerBefore?: ChatSendContainerLayoutElement[];
  sendInputBefore?: ChatSendContainerLayoutElement[];
  sendInputAfter?: ChatSendContainerLayoutElement[];
  sendContainerAfter?: ChatSendContainerLayoutElement[];
};

export type ChatSendContainerLayoutElement =
  | "send-button"
  | "stop-response-button"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

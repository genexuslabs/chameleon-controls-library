/**
 * Render type signatures for the AG-UI-driven chat.
 *
 * These types are NOT part of the AG-UI protocol — they are Chameleon
 * presentation infrastructure that consume AG-UI data. The protocol itself
 * lives in `../../typesAGUI.ts`.
 */

import type { TemplateResult } from "lit";
import type { ChMimeTypeFormatMap } from "../../../../typings/mime-types.js";
import type { LiveKitCallbacks } from "../../../live-kit-room/types.js";
import type { MarkdownViewerCodeRender } from "../../../markdown-viewer/parsers/types.js";
import type {
  AGUIActivityMessage,
  AGUIAssistantMessage,
  AGUIInputContent,
  AGUIMessage,
  AGUIReasoningMessage,
  AGUIToolCall,
  AGUIToolMessage
} from "../../typesAGUI.js";

// #region ─── Callbacks ──────────────────────────────────────────────────────

export type ChatCallbacks = {
  downloadCodeBlock?: (plainText: string, language: string) => void;
  getChatMessageFiles?: () => File[] | Promise<File[]>;
  liveMode?: Pick<LiveKitCallbacks, "activeSpeakersChanged">;
  sendChatMessages: (chat: AGUIMessage[]) => void;
  stopResponse?: () => Promise<void>;
  validateSendChatMessage?: (
    chat: AGUIMessage,
    files: File[]
  ) => boolean | Promise<boolean>;
  /**
   * Upload a file and return the inline-data or URL source the chat should
   * embed inside the next user message's `AGUIInputContent[]`.
   */
  uploadFile?: (file: File) => Promise<AGUIInputContent>;
};

// #endregion

// #region ─── Live mode & layout (Chameleon-side) ────────────────────────────

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

// #endregion

// #region ─── Render contracts ───────────────────────────────────────────────

/**
 * Replace the entire cell render with a function of the AG-UI message.
 */
export type ChatMessageRenderByItem = (
  message: AGUIMessage
) => TemplateResult | string;

/**
 * Replace specific sections of the message render. Each section receives
 * the AG-UI message and may inspect its role / activityType to decide what
 * to emit.
 */
export type ChatMessageRenderBySections = {
  actions?: ChatActionsRender;
  codeBlock?: ChatCodeBlockRender;
  contentBefore?: ChatContentRender;
  content?: ChatContentRender;
  contentAfter?: ChatContentRender;
  inputContent?: ChatInputContentRender;
  messageStructure?: ChatMessageStructureRender;
  plan?: ChatActivityRender;
  tool?: ChatToolRender;
  confirmation?: ChatActivityRender;
  reasoning?: ChatReasoningRender;
  chainOfThought?: ChatActivityRender;
};

export type ChatActionsRender = (
  message: AGUIMessage,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatCodeBlockRender = (
  chatRef: HTMLChChatElement
) => MarkdownViewerCodeRender;

export type ChatContentRender = (
  message: AGUIMessage,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => TemplateResult | string;

/**
 * Render contract for the multimodal parts (`AGUIInputContent[]`) carried
 * inside a user message. Keyed by the same buckets as the underlying
 * `ChMimeTypeFormatMap` so each renderer can be customized per format.
 */
export type ChatInputContentRender = {
  [key in keyof ChMimeTypeFormatMap]?: (
    part: AGUIInputContent,
    chatRef: HTMLChChatElement
  ) => TemplateResult | string;
};

export type ChatMessageStructureRender = (
  message: AGUIMessage,
  chatRef: HTMLChChatElement,
  renders: Required<
    Omit<ChatMessageRenderBySections, "messageStructure" | "inputContent">
  > & {
    inputContent: Required<ChatInputContentRender>;
  }
) => TemplateResult | string;

/**
 * Render an activity message (`AGUIActivityMessage`). The concrete
 * `content` shape is application-defined and discriminated by
 * `activityType`.
 */
export type ChatActivityRender = (
  activity: AGUIActivityMessage,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

/**
 * Render a tool invocation. Receives the originating `AGUIToolCall`
 * (carried on a previous assistant message) plus the matching result
 * `AGUIToolMessage` if one has arrived yet.
 */
export type ChatToolRender = (
  toolCall: AGUIToolCall,
  toolResult: AGUIToolMessage | undefined,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

export type ChatReasoningRender = (
  reasoning: AGUIReasoningMessage,
  chatRef: HTMLChChatElement
) => TemplateResult | string;

// #endregion

// Re-exports for callers that import data shapes alongside render types.
export type {
  AGUIActivityMessage,
  AGUIAssistantMessage,
  AGUIInputContent,
  AGUIMessage,
  AGUIReasoningMessage,
  AGUIToolCall,
  AGUIToolMessage
};

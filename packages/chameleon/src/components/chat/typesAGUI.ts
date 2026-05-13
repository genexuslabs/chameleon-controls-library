/**
 * AG-UI Protocol — Message types.
 *
 * Reference: https://docs.ag-ui.com/concepts/messages
 *
 * This file is a strict, dependency-free transcription of the AG-UI message
 * protocol. It contains only types defined by the protocol — no rendering
 * hints, no Chameleon-specific fields, no callbacks. Adapters that map these
 * types to the `ch-*` components live separately.
 *
 * Order follows the AG-UI documentation:
 *   1. Roles
 *   2. Message variants
 *   3. Tool calls
 *   4. Multimodal content (InputContent)
 *   5. Discriminated union
 *   6. Synchronization events
 */

// #region ─── 1. Roles ───────────────────────────────────────────────────────

export type AGUIMessageRole =
  | "user"
  | "assistant"
  | "system"
  | "tool"
  | "developer"
  | "activity"
  | "reasoning";

// #endregion

// #region ─── 2. Message variants ────────────────────────────────────────────

export type AGUIUserMessage = {
  id: string;
  role: "user";
  content: string | AGUIInputContent[];
  name?: string;
};

export type AGUIAssistantMessage = {
  id: string;
  role: "assistant";
  content?: string;
  name?: string;
  toolCalls?: AGUIToolCall[];
  encryptedContent?: string;
};

export type AGUISystemMessage = {
  id: string;
  role: "system";
  content: string;
  name?: string;
};

export type AGUIToolMessage = {
  id: string;
  role: "tool";
  content: string;
  toolCallId: string;
  error?: string;
  encryptedValue?: string;
};

export type AGUIDeveloperMessage = {
  id: string;
  role: "developer";
  content: string;
  name?: string;
};

/**
 * Frontend-only message. Never sent to the agent. The shape of `content` is
 * application-defined; the protocol only requires that it be a structured
 * record. Use `activityType` to discriminate at the application layer.
 */
export type AGUIActivityMessage<
  TContent extends Record<string, any> = Record<string, any>
> = {
  id: string;
  role: "activity";
  activityType: string;
  content: TContent;
};

export type AGUIReasoningMessage = {
  id: string;
  role: "reasoning";
  content: string;
  encryptedValue?: string;
};

// #endregion

// #region ─── 3. Tool calls ──────────────────────────────────────────────────

/**
 * Tool call carried inside an `AssistantMessage`.
 *
 * `function.arguments` is a JSON-encoded string per the protocol.
 */
export type AGUIToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

// #endregion

// #region ─── 4. Multimodal content (InputContent) ───────────────────────────

/**
 * Multimodal user content. A user message's `content` is either a plain
 * string or an array of `InputContent` parts.
 */
export type AGUIInputContent =
  | AGUITextInputContent
  | AGUIImageInputContent
  | AGUIAudioInputContent
  | AGUIVideoInputContent
  | AGUIDocumentInputContent;

export type AGUITextInputContent = {
  type: "text";
  text: string;
};

export type AGUIImageInputContent = {
  type: "image";
  source: AGUIInputContentSource;
  metadata?: Record<string, unknown>;
};

export type AGUIAudioInputContent = {
  type: "audio";
  source: AGUIInputContentSource;
  metadata?: Record<string, unknown>;
};

export type AGUIVideoInputContent = {
  type: "video";
  source: AGUIInputContentSource;
  metadata?: Record<string, unknown>;
};

export type AGUIDocumentInputContent = {
  type: "document";
  source: AGUIInputContentSource;
  metadata?: Record<string, unknown>;
};

/**
 * Source for a non-text input content part. Either references inline data
 * or an external URL.
 */
export type AGUIInputContentSource =
  | AGUIInputContentDataSource
  | AGUIInputContentUrlSource;

export type AGUIInputContentDataSource = {
  type: "data";
  value: string;
  mimeType: string;
};

export type AGUIInputContentUrlSource = {
  type: "url";
  value: string;
  mimeType?: string;
};

// #endregion

// #region ─── 5. Discriminated union ─────────────────────────────────────────

export type AGUIMessage =
  | AGUIUserMessage
  | AGUIAssistantMessage
  | AGUISystemMessage
  | AGUIToolMessage
  | AGUIDeveloperMessage
  | AGUIActivityMessage
  | AGUIReasoningMessage;

export type AGUIMessageByRole<T extends AGUIMessageRole> = T extends "user"
  ? AGUIUserMessage
  : T extends "assistant"
  ? AGUIAssistantMessage
  : T extends "system"
  ? AGUISystemMessage
  : T extends "tool"
  ? AGUIToolMessage
  : T extends "developer"
  ? AGUIDeveloperMessage
  : T extends "activity"
  ? AGUIActivityMessage
  : AGUIReasoningMessage;

export type AGUIMessageNoId = AGUIMessageByRoleNoId<AGUIMessageRole>;

export type AGUIMessageByRoleNoId<T extends AGUIMessageRole> = Omit<
  AGUIMessageByRole<T>,
  "id"
>;

// #endregion

// #region ─── 6. Synchronization events ──────────────────────────────────────

export type AGUIEventType =
  | "MESSAGES_SNAPSHOT"
  | "TEXT_MESSAGE_START"
  | "TEXT_MESSAGE_CONTENT"
  | "TEXT_MESSAGE_END"
  | "TEXT_MESSAGE_CHUNK"
  | "TOOL_CALL_START"
  | "TOOL_CALL_ARGS"
  | "TOOL_CALL_END"
  | "TOOL_CALL_RESULT"
  | "TOOL_CALL_CHUNK"
  | "REASONING_START"
  | "REASONING_END"
  | "REASONING_MESSAGE_START"
  | "REASONING_MESSAGE_CONTENT"
  | "REASONING_MESSAGE_END"
  | "REASONING_ENCRYPTED_VALUE"
  | "ACTIVITY_SNAPSHOT"
  | "ACTIVITY_DELTA";

export type AGUIEvent =
  | AGUIMessagesSnapshotEvent
  | AGUITextMessageStartEvent
  | AGUITextMessageContentEvent
  | AGUITextMessageEndEvent
  | AGUITextMessageChunkEvent
  | AGUIToolCallStartEvent
  | AGUIToolCallArgsEvent
  | AGUIToolCallEndEvent
  | AGUIToolCallResultEvent
  | AGUIToolCallChunkEvent
  | AGUIReasoningStartEvent
  | AGUIReasoningEndEvent
  | AGUIReasoningMessageStartEvent
  | AGUIReasoningMessageContentEvent
  | AGUIReasoningMessageEndEvent
  | AGUIReasoningEncryptedValueEvent
  | AGUIActivitySnapshotEvent
  | AGUIActivityDeltaEvent;

// ── Snapshot ───────────────────────────────────────────────────────────

export type AGUIMessagesSnapshotEvent = {
  type: "MESSAGES_SNAPSHOT";
  messages: AGUIMessage[];
};

// ── Text message streaming ─────────────────────────────────────────────

export type AGUITextMessageStartEvent = {
  type: "TEXT_MESSAGE_START";
  messageId: string;
  role: "assistant" | "user" | "system" | "developer";
};

export type AGUITextMessageContentEvent = {
  type: "TEXT_MESSAGE_CONTENT";
  messageId: string;
  delta: string;
};

export type AGUITextMessageEndEvent = {
  type: "TEXT_MESSAGE_END";
  messageId: string;
};

/**
 * Convenience event combining start + content in a single chunk.
 */
export type AGUITextMessageChunkEvent = {
  type: "TEXT_MESSAGE_CHUNK";
  messageId: string;
  role: "assistant" | "user" | "system" | "developer";
  delta: string;
};

// ── Tool call streaming ────────────────────────────────────────────────

export type AGUIToolCallStartEvent = {
  type: "TOOL_CALL_START";
  toolCallId: string;
  toolCallName: string;
  parentMessageId: string;
};

export type AGUIToolCallArgsEvent = {
  type: "TOOL_CALL_ARGS";
  toolCallId: string;
  delta: string;
};

export type AGUIToolCallEndEvent = {
  type: "TOOL_CALL_END";
  toolCallId: string;
};

/**
 * Result of a tool call, emitted after the tool has executed.
 */
export type AGUIToolCallResultEvent = {
  type: "TOOL_CALL_RESULT";
  messageId: string;
  toolCallId: string;
  content: string;
  role: "tool";
};

/**
 * Convenience event combining start + args in a single chunk.
 */
export type AGUIToolCallChunkEvent = {
  type: "TOOL_CALL_CHUNK";
  toolCallId: string;
  toolCallName: string;
  parentMessageId: string;
  delta: string;
};

// ── Reasoning streaming ────────────────────────────────────────────────

export type AGUIReasoningStartEvent = {
  type: "REASONING_START";
  messageId: string;
};

export type AGUIReasoningEndEvent = {
  type: "REASONING_END";
  messageId: string;
};

export type AGUIReasoningMessageStartEvent = {
  type: "REASONING_MESSAGE_START";
  messageId: string;
  role: "reasoning";
};

export type AGUIReasoningMessageContentEvent = {
  type: "REASONING_MESSAGE_CONTENT";
  messageId: string;
  delta: string;
};

export type AGUIReasoningMessageEndEvent = {
  type: "REASONING_MESSAGE_END";
  messageId: string;
};

export type AGUIReasoningEncryptedValueEvent = {
  type: "REASONING_ENCRYPTED_VALUE";
  subtype: string;
  entityId: string;
  encryptedValue: string;
};

// ── Activity ───────────────────────────────────────────────────────────

export type AGUIActivitySnapshotEvent = {
  type: "ACTIVITY_SNAPSHOT";
  messageId: string;
  activityType: string;
  content: Record<string, any>;
  replace: boolean;
};

export type AGUIActivityDeltaEvent = {
  type: "ACTIVITY_DELTA";
  messageId: string;
  activityType: string;
  patch: Record<string, any>;
};

// #endregion

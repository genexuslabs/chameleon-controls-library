import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { TranscriptionSegment } from "livekit-client";

import type { ChMimeType } from "../../typings/mime-types.js";
import { Host } from "../../utilities/host/host.js";
import { tokenMap } from "../../utilities/mapping/token-map.js";
import { adoptCommonThemes } from "../../utilities/theme.js";

import type { SmartGridDataState } from "../infinite-scroll/types";
import { EMPTY_LIVE_KIT_ROOM_MESSAGE } from "../live-kit-room/constants.js";
import type { LiveKitCallbacks } from "../live-kit-room/types.js";
import type { ThemeModel } from "../theme/theme-types";
import type { VirtualScrollVirtualItems } from "../virtual-scroller/types.js";
import { renderContentBySections } from "./internal/renders/renders.lit.js";
import { mergeSortedArrays } from "./merge-sort-live-kit-messages.js";
import type { ChatTranslations } from "./translations.js";
import type {
  ChatCallbacks,
  ChatLiveModeConfiguration,
  ChatMessage,
  ChatMessageAssistant,
  ChatMessageByRole,
  ChatMessageByRoleNoId,
  ChatMessageError,
  ChatMessageFiles,
  ChatMessageRenderByItem,
  ChatMessageRenderBySections,
  ChatMessageUser,
  ChatSendContainerLayout,
  ChatSendContainerLayoutElement
} from "./types.js";
import {
  DEFAULT_ASSISTANT_STATUS,
  getMessageContent,
  getMessageFiles,
  getMessageFilesAndSources
} from "./utils.js";

import styles from "./chat.scss?inline";

// Lazy-load child components
import("../smart-grid/smart-grid.lit.js");
import("../virtual-scroller/virtual-scroller.lit.js");
import("../markdown-viewer/markdown-viewer.lit.js");
import("../live-kit-room/live-kit-room.lit.js");

const ENTER_KEY = "Enter";

const createLiveKitMessagesStore = (): {
  user: Map<string, TranscriptionSegment>;
  assistant: Map<string, TranscriptionSegment>;
} => ({
  assistant: new Map(),
  user: new Map()
});

const stopResponseButtonHasAPosition = (sendContainerLayout: ChatSendContainerLayout) =>
  (sendContainerLayout.sendContainerBefore ?? []).includes("stop-response-button") ||
  (sendContainerLayout.sendInputBefore ?? []).includes("stop-response-button") ||
  (sendContainerLayout.sendInputAfter ?? []).includes("stop-response-button") ||
  (sendContainerLayout.sendContainerAfter ?? []).includes("stop-response-button");

const sendContainerLayoutPositionToPartName = {
  sendContainerBefore: "send-container-before",
  sendInputBefore: "send-input-before",
  sendInputAfter: "send-input-after",
  sendContainerAfter: "send-container-after"
} as const satisfies Record<keyof ChatSendContainerLayout, string>;

/**
 * Returns the slot name to be used in the `ch-edit` element.
 */
const getSendInputSlotRename = (slotToRename: "sendInputAfter" | "sendInputBefore") =>
  slotToRename === "sendInputBefore" ? "additional-content-before" : "additional-content-after";

const getAriaBusyValue = (
  status?: "complete" | "waiting" | "streaming" | undefined
): "true" | "false" => (status === "streaming" ? "true" : "false");

/**
 * The `ch-chat` component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.
 *
 * @remarks
 * ## Features
 *  - Text messaging with file uploads and markdown rendering.
 *  - Real-time voice conversations via LiveKit integration.
 *  - Virtual scrolling for large message histories with configurable buffer size.
 *  - Auto-scrolling behavior configurable as `"at-scroll-end"` or `"never"`.
 *  - Fully customizable send-container layout with four slot positions.
 *  - Programmatic message management: add, update, and send messages via public methods.
 *  - Custom rendering of chat items through flexible render callbacks.
 *  - Stop-response button for cancelling assistant response generation.
 *
 * ## Use when
 *  - Building AI-powered chat or assistant interfaces.
 *  - Implementing conversational UIs with file attachment and voice support.
 *  - Building AI-powered conversational interfaces where the interaction model is back-and-forth dialogue.
 *  - The system needs to ask clarifying questions or produce streaming responses.
 *
 * ## Do not use when
 *  - Displaying a simple message list without interactivity — use `ch-smart-grid` instead.
 *  - A standard form would be faster and more precise for collecting structured data (e.g., address forms).
 *  - Displaying a simple non-interactive message list — prefer `ch-smart-grid` directly.
 *
 * ## Accessibility
 *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable for assistive technology during virtual scrolling.
 *  - The send button and stop-response button carry accessible labels via the `translations` property.
 *  - New messages should be announced to screen readers via `aria-live="polite"` on the messages container.
 *  - All action buttons (send, stop-response) must have descriptive labels via the `translations` property.
 *  - Color and alignment alone must not be the only way to distinguish user messages from AI messages.
 *
 * @status experimental
 *
 * @part messages-container - The scrollable container that holds the chat messages.
 * @part send-container - The bottom area containing the input and action buttons.
 * @part send-container-before - Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined.
 * @part send-container-after - Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined.
 * @part send-input-before - Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined.
 * @part send-input-after - Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined.
 * @part send-button - The button that sends the current message.
 * @part stop-response-button - The button that stops the assistant's response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided.
 *
 * @slot empty-chat - Displayed when all records are loaded but there are no messages.
 * @slot loading-chat - Displayed while the chat is in the initial loading state.
 * @slot additional-content - Projected between the messages area and the send container. Rendered when `showAdditionalContent` is `true` and the chat is not in initial or empty state.
 */
@Component({
  shadow: {},
  styles,
  tag: "ch-chat"
})
export class ChChat extends KasstorElement {
  /**
   * Specifies the ID of the cell that is aligned to the start of the scroll
   * position.
   */
  #cellIdAlignedWhenRendered: string | undefined;

  /**
   * Specifies a Set of cells that must render an additional div to correctly
   * reserve space. This space is used to align the cell at the start scroll
   * position.
   *
   * Even if only one cell is aligned to the start of the scroll, all cells
   * that participated in this behavior must maintain the additional rendered
   * div to avoid destroying the DOM and thus causing some side effects on
   * elements whose state the chat can not control.
   */
  #cellHasToReserveSpace: Set<string> | undefined;

  #liveKitTranscriptions:
    | {
        user: Map<string, TranscriptionSegment>;
        assistant: Map<string, TranscriptionSegment>;
      }
    | undefined; // Allocated at runtime to save resources
  #liveKitMessages: ChatMessage[] | undefined; // Allocated at runtime to save resources

  #liveKitCallbacks: LiveKitCallbacks = {
    activeSpeakersChanged: participant =>
      this.callbacks?.liveMode?.activeSpeakersChanged!(participant),

    updateTranscriptions: (segments, participant) => {
      let lastSegmentWithContent: TranscriptionSegment | undefined;

      for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];

        if (segment.text.trim() !== "" && segment.text !== EMPTY_LIVE_KIT_ROOM_MESSAGE) {
          lastSegmentWithContent = segment;
        }
      }

      // Don't add empty messages
      if (lastSegmentWithContent === undefined) {
        return;
      }

      const messageRole = participant!.isLocal ? "user" : "assistant";

      this.#liveKitTranscriptions![messageRole].set(
        lastSegmentWithContent.id,
        lastSegmentWithContent
      );

      this.#liveKitMessages = mergeSortedArrays(this.#liveKitTranscriptions!);
      this.requestUpdate();
    }
  };

  #mustReplaceSendButtonWithStopResponse = true;

  // Refs
  #editRef: Ref<HTMLChEditElement> = createRef();
  #smartGridRef: Ref<HTMLChSmartGridElement> = createRef();
  #virtualScrollRef: Ref<HTMLChVirtualScrollerElement> = createRef();

  @state() uploadingFiles = 0;

  @state() virtualItems: ChatMessage[] = [];

  /**
   * `true` if a message was added by user interaction or one of the following
   * methods were executed: `addNewMessage`, `updateChatMessage` or
   * `updateLastMessage`.
   *
   * This flag is useful to determinate when the initial load of the chat has
   * finished. If we always take into account the `autoScroll` property value,
   * in the initial load the scroll would not be positioned correctly at the
   * end, so we only take into account the `autoScroll` value after the first
   * message is added by the host of the component.
   */
  @state() initialLoadHasEnded = false;

  /**
   * Specifies how the scroll position will be adjusted when the chat messages
   * are updated with the methods `addNewMessage`, `updateChatMessage` or
   * `updateLastMessage`.
   *   - "at-scroll-end": If the scroll is positioned at the end of the content,
   *   the chat will maintain the scroll at the end while the content of the
   *   messages is being updated.
   *
   *  - "never": The scroll position won't be adjusted when the content of the
   *   messages is being updated.
   */
  @property({ attribute: "auto-scroll" }) autoScroll: "never" | "at-scroll-end" = "at-scroll-end";

  /**
   * Specifies the callbacks required in the control.
   */
  @property({ attribute: false }) callbacks?: ChatCallbacks | undefined;

  /**
   * Specifies if all interactions are disabled
   */
  @property({ type: Boolean }) disabled: boolean = false;

  // TODO: Add support for undefined messages.
  /**
   * Specifies the items that the chat will display.
   */
  @property({ attribute: false }) items: ChatMessage[] = [];
  @Observe("items")
  protected itemsChanged() {
    this.#cellIdAlignedWhenRendered = undefined;
    this.initialLoadHasEnded = false;

    // Free the memory, since no cells will have reserved space as the model
    // is different
    this.#cellHasToReserveSpace = undefined;

    // TODO: This is a WA to remove the anchor cell when the model changes. We
    // should find a better way to remove the reserved space for the anchor
    // cell
    this.#smartGridRef.value?.removeScrollEndContentReference();
  }

  /**
   * Specifies if the live mode is set.
   *
   * When this mode is enabled, the chat will disable sending messages by user
   * interactions and the only way to send messages will be throughout the
   * voice. The user will have to enable the microphone input in their Operative
   * System and it will voice chat with the remote participants.
   *
   * When any participant speaks, the transcribed conversation will be displayed
   * as new messages in the chat (`items` property).
   *
   * When the `liveMode` ends, the transcribed conversation will be pushed
   * to the `items` of the chat.
   */
  @property({ attribute: "live-mode", type: Boolean }) liveMode: boolean = false;
  @Observe("liveMode")
  protected liveModeChanged() {
    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    } else {
      this.#virtualScrollRef.value?.addItems("end", ...(this.#liveKitMessages ?? []));

      this.#liveKitTranscriptions = undefined;

      // Wait for the virtual scroller to emit the new message, in order to
      // reduce flickering
      requestAnimationFrame(() => {
        this.#liveKitMessages = undefined;
      });
    }
  }

  /**
   * Specifies the live mode configuration. The `token` and `url` are required
   * to enable the `liveMode`.
   */
  @property({ attribute: false }) liveModeConfiguration: ChatLiveModeConfiguration | undefined;

  /**
   * Specifies if the chat is waiting for the data to be loaded.
   */
  @property({ attribute: false }) loadingState: SmartGridDataState = "initial";

  /**
   * Specifies the theme to be used for rendering the markdown.
   * If `null`, no theme will be applied.
   */
  @property({ attribute: "markdown-theme" }) markdownTheme?: string | null = "ch-markdown-viewer";

  /**
   * Specifies how the messages added by the user interaction will be aligned
   * in the chat.
   *
   * If `newUserMessageAlignment === "start"` the chat will reserve the
   * necessary space to visualize the message at the start of the content
   * viewport if the content is not large enough.
   * This behavior is the same as the Monaco editor does for reserving space
   * when visualizing the last lines positioned at the top of the editor.
   */
  @property({ attribute: "new-user-message-alignment" })
  newUserMessageAlignment: "start" | "end" = "end";
  @Observe("newUserMessageAlignment")
  protected newUserMessageAlignmentChanged() {
    if (this.newUserMessageAlignment === "end") {
      this.#cellIdAlignedWhenRendered = undefined;

      // Don't reset the `cellHasToReserveSpace` Set here, because the render
      // of the items that belongs to the Set will be destroyed and re-created
      // to only remove one div
    }
  }

  /**
   * Specifies how the chat will scroll to the position of the messages added
   * by user interaction.
   */
  @property({ attribute: "new-user-message-scroll-behavior" })
  newUserMessageScrollBehavior: Exclude<ScrollBehavior, "auto"> = "instant";

  /**
   * This property allows us to implement custom rendering of chat items.
   *
   * This works by providing a custom render of the cell content in two
   * possible ways:
   *   1. Replacing the render of the entire cell with a function of the
   *   message model.
   *
   *   2. Replacing the render of specific parts of the message by providing an
   *   object with the specific renders of the message sections (`codeBlock`,
   *   `contentBefore`, `content`, `contentAfter`, `files` and/or
   *   `messageStructure`).
   */
  @property({ attribute: false }) renderItem?:
    | ChatMessageRenderByItem
    | ChatMessageRenderBySections
    | undefined;

  /**
   * `true` to disable the send-button element.
   */
  @property({ attribute: "send-button-disabled", type: Boolean })
  sendButtonDisabled: boolean = false;

  /**
   * `true` to disable the send-input element.
   */
  @property({ attribute: "send-input-disabled", type: Boolean })
  sendInputDisabled: boolean = false;

  /**
   * `true` to render a slot named "additional-content" to project elements
   * between the "content" slot (grid messages) and the "send-container" slot.
   *
   * This slot can only be rendered if loadingState !== "initial" and
   * (loadingState !== "all-records-loaded" && items.length > 0).
   */
  @property({ attribute: "show-additional-content", type: Boolean })
  showAdditionalContent: boolean = false;

  /**
   * Specifies the position of the elements in the `send-container` part.
   * There are four positions for distributing elements:
   *   - `sendContainerBefore`: Before the contents of the `send-container` part.
   *   - `sendInputBefore`: Before the contents of the `send-input` part.
   *   - `sendInputAfter`: After the contents of the `send-input` part.
   *   - `sendContainerAfter`: After the contents of the `send-container` part.
   *
   * At each position you can specify reserved elements, such as the
   * `send-button` and `stop-response-button`, but can also be specified
   * non-reserved elements, which will be projected as content slots.
   *
   * If the reserved `stop-response-button` element is not specified anywhere,
   * the send button will be replaced with the stop-response button
   * when `waitingResponse = true` and the `stopResponse` callback is specified.
   *
   * If the `send-button` is not specified in any position, it won't be
   * rendered in the `ch-chat`.
   *
   * @example
   * If you define:
   * ```ts
   * const sendContainerLayout: ChatSendContainerLayout = {
   *   sendInputBefore: ["attach-files-button"],
   *   sendInputAfter: ["send-button"]
   * }
   * ```
   *
   * You will have to put `slot="attach-files-button"` as follows (but not the
   * `send-button` as this is a reserved element that is rendered internally by
   * the `ch-chat`):
   * ```tsx
   * <ch-chat
   *   sendContainerLayout={sendContainerLayout}
   * >
   *   <button slot="attach-files-button" type="button">
   *     ...
   *   </button>
   * </ch-chat>
   * ```
   */
  @property({ attribute: false }) sendContainerLayout: ChatSendContainerLayout = {
    sendContainerAfter: ["send-button"]
  };
  @Observe("sendContainerLayout")
  protected sendContainerLayoutChanged() {
    this.#mustReplaceSendButtonWithStopResponse = !stopResponseButtonHasAPosition(
      this.sendContainerLayout
    );
  }

  /**
   * Specifies the theme to be used for rendering the chat.
   * If `undefined`, no theme will be applied.
   */
  @property({ attribute: false }) theme?: ThemeModel | undefined;

  /**
   * Specifies the literals required in the control.
   */
  @property({ attribute: false }) translations: ChatTranslations = {
    accessibleName: {
      clearChat: "Clear chat",
      copyMessageContent: "Copy message content",
      downloadCodeButton: "Download code",
      sendButton: "Send",
      sendInput: "Message",
      stopResponseButton: "Stop generating answer"
    },
    placeholder: {
      sendInput: "Ask me a question..."
    },
    text: {
      copyCodeButton: "Copy code",
      copyMessageContent: "Copy",
      processing: "Processing...",
      sourceFiles: "Source files:"
    }
  };

  /**
   * Specifies the number of elements to be rendered above and below the
   * virtual scroll.
   */
  @property({ attribute: "virtual-scroller-buffer-size", type: Number })
  virtualScrollerBufferSize: number = 5;

  /**
   * `true` if the `ch-chat` is waiting for a response from the server. If so,
   * the `sendChatMessages` won't be executed when the user tries to send a new
   * message. Although, the `send-input` and `send-button` won't be disabled,
   * so the user can interact with the chat.
   */
  @property({ attribute: "waiting-response", type: Boolean })
  waitingResponse?: boolean = false;

  /**
   * Fired when a new user message is added in the chat via user interaction.
   *
   * Since developers can define their own render for file attachment, this
   * event serves to synchronize the cleanup of the `send-input` with the
   * cleanup of the custom file attachment, or or even blocking user
   * interactions before the `sendChatMessages` callback is executed.
   */
  @Event() protected userMessageAdded!: EventEmitter<ChatMessageByRole<"user">>;

  // - - - - - - - - - - - - - - - - - - - -
  //             Public methods
  // - - - - - - - - - - - - - - - - - - - -

  /**
   * Add a new message at the end of the record, performing a re-render.
   */
  public async addNewMessage(message: ChatMessage) {
    this.initialLoadHasEnded = true;

    if (this.newUserMessageAlignment === "start") {
      this.#cellHasToReserveSpace ??= new Set();
      this.#cellHasToReserveSpace.add(message.id);
    }

    this.#pushMessage(message);
  }

  /**
   * Focus the chat input
   */
  public async focusChatInput() {
    this.#editRef.value?.focus();
  }

  /**
   * Set the text for the chat input
   */
  public async setChatInputMessage(text: string) {
    if (this.#editRef.value) {
      this.#editRef.value.value = text;
    }
  }

  /**
   * Send the current message of the ch-chat's `send-input` element. This
   * method executes the same callbacks and interoperates with the same
   * features as if the message were sent through user interaction. The only
   * things to keep in mind are the following:
   *  - If the `content` parameter is provided, it will be used in replacement
   *    of the input content.
   *
   *  - If the `files` parameter is provided, the `getChatMessageFiles`
   *    callback won't be executed to get the current files of the chat.
   *
   * Whether or not the `content` parameter is provided, the content of the
   * `send-input` element will be cleared.
   */
  public async sendChatMessage(content?: ChatMessageUser | undefined, files?: File[]) {
    return this.#sendMessage(content, files);
  }

  /**
   * Given the id of the message, it updates the content of the indexed message.
   */
  public async updateChatMessage(
    messageIndex: number,
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) {
    // TODO: Don't update chat message if it has role="user" and it is
    // uploading file messages

    if (this.items.length === 0 || !this.items[messageIndex]) {
      return;
    }
    this.initialLoadHasEnded = true;
    this.#updateMessage(messageIndex, message, mode);

    const updatedMessage = this.items[messageIndex];
    const virtualItemIndex = this.virtualItems.findIndex(
      virtualItem => virtualItem.id === updatedMessage.id
    );

    // Sync the last virtual item with the real item that is updated
    if (virtualItemIndex !== -1) {
      this.virtualItems[virtualItemIndex] = updatedMessage;
    }

    this.requestUpdate();
  }

  // TODO: Add unit tests to validate how the chat message should be copied
  // into the last chat message, considering that messages can have more
  // properties that the interface/type has
  /**
   * Update the content of the last message, performing a re-render.
   */
  public async updateLastMessage(
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) {
    // TODO: Don't update last chat message if it has role="user" and it is
    // uploading file messages

    if (this.items.length === 0) {
      return;
    }
    this.initialLoadHasEnded = true;
    this.#updateMessage(this.items.length - 1, message, mode);

    // Sync the last virtual item with the real item that is updated
    this.virtualItems[this.virtualItems.length - 1] = this.items.at(-1)!;

    this.requestUpdate();
  }

  // - - - - - - - - - - - - - - - - - - - -
  //           Private helpers
  // - - - - - - - - - - - - - - - - - - - -

  #pushMessage = async (message: ChatMessage) => {
    // We should also check for the virtual-scroller to be defined, because the
    // user can add two messages at once, without waiting for the
    // virtual-scroller to be defined
    if (this.items.length === 0 || !this.#virtualScrollRef.value) {
      this.items.push(message);
      this.requestUpdate();
    } else {
      await this.#virtualScrollRef.value.addItems("end", message);
    }
  };

  #updateMessage = (
    messageIndex: number,
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) => {
    if (mode === "concat") {
      const messageInIndex = this.items[messageIndex] as ChatMessageByRole<"system" | "assistant">;

      // Temporal store for the new message content
      const newMessageContent =
        (getMessageContent(messageInIndex) ?? "") + (getMessageContent(message) ?? "");

      // Temporal store for the new message files
      const newMessageFiles: ChatMessageFiles = getMessageFiles(messageInIndex);
      newMessageFiles.push(...getMessageFiles(message));

      // Update the message object, since the current message could not be an
      // object with files
      if (newMessageFiles.length !== 0) {
        // Reuse the message parameter reference to correctly update the
        // message content. We are doing this since it can contain new member
        // the message that are not present in the current message
        message.content = {
          message: newMessageContent,
          files: newMessageFiles
        };
      } else if (typeof message.content === "string") {
        message.content = newMessageContent;
      } else {
        message.content.message = newMessageContent;
      }
    }

    // Replace the message
    const messageId = this.items[messageIndex].id;
    this.items[messageIndex] = Object.assign({ id: messageId }, message);
  };

  // TODO: Sending the chat by pressing the Enter key should be a property
  #sendMessageKeyboard = (event: KeyboardEvent) => {
    if (event.key !== ENTER_KEY || event.shiftKey) {
      return;
    }
    event.preventDefault();

    this.#sendMessage();
  };

  #addUserMessageToRecordAndFocusInput = async (userMessage: ChatMessageByRole<"user">) => {
    const editEl = this.#editRef.value;
    editEl!.value = "";
    editEl!.click(); // TODO: Should it be focus???

    await this.#pushMessage(userMessage);
    this.userMessageAdded.emit(userMessage);
  };

  #chatMessageCanBeSent = (chat: ChatMessage, files: File[]) =>
    !this.callbacks ||
    !this.callbacks.validateSendChatMessage ||
    this.callbacks.validateSendChatMessage(chat, files);

  #getChatFiles = () =>
    !this.callbacks || !this.callbacks.getChatMessageFiles
      ? []
      : this.callbacks.getChatMessageFiles();

  #liveModeIsDisplayed = () => {
    const config = this.liveModeConfiguration;
    return this.liveMode && config && !!config.url && !!config.token;
  };

  #uploadFiles = (
    userMessageToAdd: ChatMessageByRole<"user">,
    sendInputValue: string | undefined,
    filesToUpload: File[]
  ) => {
    const callbacks = this.callbacks;

    if (!callbacks) {
      // eslint-disable-next-line no-console
      return console.warn('The "callbacks" property is not defined, so files can not be uploaded');
    }
    if (!callbacks.uploadFile) {
      // eslint-disable-next-line no-console
      return console.warn(
        'The "uploadFile" member is not defined in the "callbacks" property, so files can not be uploaded'
      );
    }

    const chatFiles: ChatMessageFiles = [];
    userMessageToAdd.content = {
      message: sendInputValue ?? "",
      files: chatFiles
    };

    // Add all files as "in-progress" state and update them to the server in
    // parallel
    for (let fileIndex = 0; fileIndex < filesToUpload.length; fileIndex++) {
      const file = filesToUpload[fileIndex];
      const temporalFileURL = URL.createObjectURL(file);

      chatFiles.push({
        caption: file.name,
        mimeType: file.type as ChMimeType,
        uploadState: "in-progress",
        url: temporalFileURL
      });

      this.uploadingFiles++;

      callbacks
        .uploadFile(file)
        .then(uploadedFile => {
          uploadedFile.uploadState = "uploaded";
          chatFiles[fileIndex] = uploadedFile;
        })
        .catch(() => {
          chatFiles[fileIndex].uploadState = "failed";
        })
        .finally(async () => {
          this.uploadingFiles--;

          // TODO: If the file upload fails, the preview will be removed
          // without replacing it with the actual public URL
          // Free the resource to avoid memory leaks
          URL.revokeObjectURL(temporalFileURL);

          if (this.uploadingFiles === 0) {
            this.#sendChat();
          }
        });
    }
  };

  #sendChat = () => {
    const lastCell = this.items.at(-1)!;
    this.#cellIdAlignedWhenRendered = lastCell.id;

    if (this.newUserMessageAlignment === "start") {
      this.initialLoadHasEnded = true;
      this.#cellHasToReserveSpace ??= new Set();
      this.#cellHasToReserveSpace.add(lastCell.id);
    }

    if (!this.callbacks) {
      // eslint-disable-next-line no-console
      return console.warn(
        'The "callbacks" property is not defined, so the "sendChatMessages" function can not be executed to emit the new chat'
      );
    }

    this.callbacks.sendChatMessages(this.items);
  };

  #sendMessage = async (content?: ChatMessageUser, files?: File[]) => {
    // TODO: Add unit tests for this
    if (
      this.waitingResponse ||
      this.disabled ||
      this.liveMode ||
      this.loadingState === "initial" ||
      this.loadingState === "loading" ||
      this.uploadingFiles !== 0
    ) {
      return;
    }

    const filesToUpload = files ?? (await this.#getChatFiles());
    const sendInputValue = content ? getMessageContent(content) : this.#editRef.value?.value;
    const hasFiles = filesToUpload.length !== 0;
    const emptySendInput = (!sendInputValue || sendInputValue.trim() === "") && !hasFiles;

    if (emptySendInput) {
      return;
    }

    // Message
    const userMessageToAdd: ChatMessageByRole<"user"> =
      content ??
      ({
        id: `${new Date().getTime()}`,
        role: "user",
        content: sendInputValue
      } as ChatMessageByRole<"user">);

    // Validate message with callback
    if (!(await this.#chatMessageCanBeSent(userMessageToAdd, filesToUpload))) {
      return;
    }

    // Upload files to the server as soon as possible
    if (hasFiles) {
      this.#uploadFiles(userMessageToAdd, sendInputValue, filesToUpload);
    }

    // TODO: Should we do something if the uploadFile callback is not defined??
    await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);

    // Only send the chat if the user message didn't have files. Otherwise, the
    // chat sending will be resolved in the uploadFiles
    if (!hasFiles) {
      this.#sendChat();
    }

    // Queue a new re-render
    this.requestUpdate();
  };

  #sendMessageWithSendButton = () => this.#sendMessage();

  #stopResponse = (event: MouseEvent) => {
    event.stopPropagation();
    this.callbacks!.stopResponse!();
  };

  #virtualItemsChanged = (event: CustomEvent<VirtualScrollVirtualItems>) => {
    this.virtualItems = event.detail.virtualItems as ChatMessage[];
  };

  // - - - - - - - - - - - - - - - - - - - -
  //         Message rendering
  //  (merged from internal/chat.lit.ts)
  // - - - - - - - - - - - - - - - - - - - -

  #alignCellWhenRendered = () =>
    // TODO: This is a WA to avoid a type error in runtime
    (this.#smartGridRef.value as any as HTMLChSmartGridElement).scrollEndContentToPosition(
      this.#cellIdAlignedWhenRendered!,
      {
        position: this.newUserMessageAlignment,
        behavior: this.newUserMessageScrollBehavior
      }
    );

  #getMessageRenderedContent = (
    message: ChatMessageUser | ChatMessageAssistant | ChatMessageError
  ) => {
    // Default render
    if (!this.renderItem) {
      return renderContentBySections(message, this as any, {});
    }

    return typeof this.renderItem === "function"
      ? this.renderItem(message)
      : renderContentBySections(message, this as any, this.renderItem); // The custom render is separated by sections
  };

  #renderMessageItem = (message: ChatMessage) => {
    if (message.role === "system") {
      return "";
    }

    const isAssistantMessage = message.role === "assistant";
    const filesAndSources = getMessageFilesAndSources(message);

    const parts = tokenMap({
      [`message ${message.role} ${message.id}`]: true,
      "has-content": (getMessageContent(message) ?? "").trim() !== "",
      "has-files": filesAndSources.files.length !== 0,
      "has-sources": filesAndSources.sources.length !== 0,
      [message.parts as string]: !!message.parts,
      [(message as ChatMessageByRole<"assistant">).status ?? DEFAULT_ASSISTANT_STATUS]:
        isAssistantMessage
    });

    const renderedContent = this.#getMessageRenderedContent(message);

    const messageIsCellAlignedAtTheStart = message.id === this.#cellIdAlignedWhenRendered;

    const hasToRenderAnExtraDiv =
      this.#cellHasToReserveSpace !== undefined && this.#cellHasToReserveSpace.has(message.id);

    return html`<ch-smart-grid-cell
      .cellId=${message.id}
      aria-live=${ifDefined(isAssistantMessage ? "polite" : undefined)}
      aria-busy=${
        // Wait until all changes are made to prevents assistive
        // technologies from announcing changes before updates are done
        ifDefined(isAssistantMessage ? getAriaBusyValue(message.status) : undefined)
      }
      part=${ifDefined(hasToRenderAnExtraDiv ? undefined : parts)}
      .smartGridRef=${
        // TODO: This is a WA to avoid a type error in runtime
        this.#smartGridRef.value as any as HTMLChSmartGridElement
      }
      @smartCellDidLoad=${messageIsCellAlignedAtTheStart ? this.#alignCellWhenRendered : undefined}
    >
      ${hasToRenderAnExtraDiv ? html`<div part=${parts}>${renderedContent}</div>` : renderedContent}
    </ch-smart-grid-cell>`;
  };

  #renderMessages = () =>
    html`${repeat(this.virtualItems, item => item.id, this.#renderMessageItem)}${this
      .#liveKitMessages
      ? repeat(this.#liveKitMessages, item => item.id, this.#renderMessageItem)
      : nothing}`;

  // - - - - - - - - - - - - - - - - - - - -
  //              Layout renders
  // - - - - - - - - - - - - - - - - - - - -
  #renderChatOrEmpty = () =>
    this.loadingState === "all-records-loaded" && this.items.length === 0
      ? html`<slot name="empty-chat"></slot>`
      : html`<ch-smart-grid
          .autoScroll=${
            // We have to bind the property this way to make sure the scroll is
            // positioned correctly at the initial load. Otherwise, if really
            // hard to position the scroll if we don't know somehow when the
            // initial load has finished
            this.initialLoadHasEnded ? this.autoScroll : "at-scroll-end"
          }
          .dataProvider=${this.loadingState === "more-data-to-fetch"}
          .loadingState=${this.virtualItems.length === 0 ? "initial" : this.loadingState}
          .inverseLoading=${true}
          .itemsCount=${this.virtualItems.length}
          @infiniteThresholdReached=${this.#loadMoreItems}
          ${ref(this.#smartGridRef)}
        >
          <ch-virtual-scroller
            role="row"
            slot="grid-content"
            class="grid-content"
            part="messages-container"
            .bufferAmount=${this.virtualScrollerBufferSize}
            .inverseLoading=${true}
            .items=${this.items}
            .itemsCount=${this.items.length}
            @virtualItemsChanged=${this.#virtualItemsChanged}
            ${ref(this.#virtualScrollRef)}
          >
            ${this.#renderMessages()}
          </ch-virtual-scroller>
        </ch-smart-grid>`;

  #renderStopResponseButton = () => {
    const { accessibleName, text } = this.translations;

    const ariaLabel =
      accessibleName.stopResponseButton !== text.stopResponseButton
        ? (accessibleName.stopResponseButton ?? text.stopResponseButton)
        : undefined;

    return this.waitingResponse && this.callbacks?.stopResponse
      ? html`<button
          aria-label=${ifDefined(ariaLabel)}
          title=${ifDefined(ariaLabel)}
          part="stop-response-button"
          type="button"
          @click=${this.#stopResponse}
        >
          ${text.stopResponseButton}
        </button>`
      : nothing;
  };

  #renderSendOrStopResponseButton = () =>
    this.waitingResponse &&
    this.callbacks?.stopResponse &&
    this.#mustReplaceSendButtonWithStopResponse
      ? this.#renderStopResponseButton()
      : this.#renderSendButton();

  #renderSendButton = () => {
    const { accessibleName, text } = this.translations;

    const sendButtonDisabled =
      this.sendButtonDisabled ||
      this.disabled ||
      this.loadingState === "initial" ||
      this.#liveModeIsDisplayed();

    return html`<button
      aria-label=${accessibleName.sendButton === text.sendButton
        ? undefined
        : accessibleName.sendButton}
      title=${accessibleName.sendButton}
      part="send-button"
      ?disabled=${sendButtonDisabled}
      type="button"
      @click=${sendButtonDisabled ? undefined : this.#sendMessageWithSendButton}
    >
      ${text.sendButton}
    </button>`;
  };

  #renderSendContainerLayoutElement = (elementName: ChatSendContainerLayoutElement) => {
    if (elementName === "send-button") {
      return this.#renderSendOrStopResponseButton();
    }

    return elementName === "stop-response-button"
      ? this.#renderStopResponseButton()
      : html`<slot name=${elementName}></slot>`;
  };

  #renderSendContainerOrSendInputSlots = (
    containerName: keyof ChatSendContainerLayout,
    containerElements: ChatSendContainerLayoutElement[] | undefined
  ) => {
    // No elements in the container position
    if (containerElements === undefined || containerElements.length === 0) {
      return nothing;
    }

    // The container only had the stop-response-button, but it is not rendered,
    // so we must avoid rendering the container with empty content
    if (
      containerElements.length === 1 &&
      containerElements[0] === "stop-response-button" &&
      (!this.waitingResponse || this.callbacks?.stopResponse === undefined)
    ) {
      return nothing;
    }

    const partName = sendContainerLayoutPositionToPartName[containerName];

    return html`<div
      slot=${ifDefined(
        containerName === "sendInputAfter" || containerName === "sendInputBefore"
          ? getSendInputSlotRename(containerName)
          : undefined
      )}
      class=${`additional-content-container ${partName}`}
      part=${partName}
    >
      ${containerElements.map(el => this.#renderSendContainerLayoutElement(el))}
    </div>`;
  };

  #renderLiveKitRoom = () => {
    const config = this.liveModeConfiguration;

    return this.#liveModeIsDisplayed()
      ? html`<ch-live-kit-room
          .callbacks=${this.#liveKitCallbacks}
          .connected=${true}
          .microphoneEnabled=${config!.localParticipant?.microphoneEnabled ?? true}
          .token=${config!.token}
          .url=${config!.url}
        ></ch-live-kit-room>`
      : nothing;
  };

  #loadMoreItems = () => {
    this.loadingState = "loading";

    // WA to test
    setTimeout(() => {
      const totalItems = this.items.length;

      const newItems: ChatMessage[] = Array.from({ length: 20 }, (_, index) =>
        index % 2 === 0
          ? {
              id: `index: ${index - totalItems}`,
              role: "user",
              content:
                `index: ${index - totalItems}` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n`
            }
          : {
              id: `index: ${index - totalItems}`,
              role: "assistant",
              content:
                `\nindex: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n` +
                `index: ${index - totalItems}\n`
            }
      );

      this.#virtualScrollRef.value!.addItems("start", ...newItems);

      this.loadingState = "more-data-to-fetch";
    }, 10);
  };

  // - - - - - - - - - - - - - - - - - - - -
  //             Lifecycle
  // - - - - - - - - - - - - - - - - - - - -

  override connectedCallback() {
    super.connectedCallback();

    // Scrollbar styles
    adoptCommonThemes(this.shadowRoot!.adoptedStyleSheets);

    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    }

    this.#mustReplaceSendButtonWithStopResponse = !stopResponseButtonHasAPosition(
      this.sendContainerLayout
    );
  }

  override render() {
    const { sendContainerBefore, sendInputAfter, sendInputBefore, sendContainerAfter } =
      this.sendContainerLayout;

    const canShowAdditionalContent =
      this.showAdditionalContent &&
      // It's not the initial load
      this.loadingState !== "initial" &&
      // It's not the empty chat
      !(this.items.length === 0 && this.loadingState === "all-records-loaded");

    const liveModeIsDisplayed = this.#liveModeIsDisplayed();

    const sendInputDisabled = this.sendInputDisabled || this.disabled || liveModeIsDisplayed;

    Host(this, {
      class: {
        "ch-chat--additional-content": canShowAdditionalContent
      }
    });

    return html`
      ${this.theme
        ? html`<ch-theme .model=${this.theme} .avoidFlashOfUnstyledContent=${true}></ch-theme>`
        : nothing}
      ${this.loadingState === "initial"
        ? html`<slot name="loading-chat"></slot>`
        : this.#renderChatOrEmpty()}
      ${canShowAdditionalContent ? html`<slot name="additional-content"></slot>` : nothing}

      <div class="send-container" part="send-container">
        ${this.#renderSendContainerOrSendInputSlots("sendContainerBefore", sendContainerBefore)}

        <ch-edit
          class="send-input"
          .accessibleName=${this.translations.accessibleName.sendInput}
          .autoGrow=${true}
          ?disabled=${sendInputDisabled}
          .hostParts=${"send-input"}
          .multiline=${true}
          .placeholder=${this.translations.placeholder.sendInput}
          .preventEnterInInputEditorMode=${true}
          .showAdditionalContentAfter=${sendInputAfter !== undefined && sendInputAfter.length !== 0}
          .showAdditionalContentBefore=${sendInputBefore !== undefined &&
          sendInputBefore.length !== 0}
          @keydown=${sendInputDisabled || this.liveMode ? undefined : this.#sendMessageKeyboard}
          ${ref(this.#editRef)}
        >
          ${this.#renderSendContainerOrSendInputSlots("sendInputBefore", sendInputBefore)}
          ${this.#renderSendContainerOrSendInputSlots("sendInputAfter", sendInputAfter)}
        </ch-edit>

        ${this.#renderSendContainerOrSendInputSlots("sendContainerAfter", sendContainerAfter)}
      </div>

      ${this.#renderLiveKitRoom()}
    `;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChChatElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChChatElement;
  }

  /** Type of the `ch-chat`'s `userMessageAdded` event. */
  // prettier-ignore
  type HTMLChChatElementUserMessageAddedEvent = HTMLChChatElementCustomEvent<
    HTMLChChatElementEventMap["userMessageAdded"]
  >;

  interface HTMLChChatElementEventMap {
    userMessageAdded: ChatMessageByRole<"user">;
  }

  interface HTMLChChatElementEventTypes {
    userMessageAdded: HTMLChChatElementUserMessageAddedEvent;
  }

  /**
   * The `ch-chat` component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.
   *
   * @remarks
   * ## Features
   *  - Text messaging with file uploads and markdown rendering.
   *  - Real-time voice conversations via LiveKit integration.
   *  - Virtual scrolling for large message histories with configurable buffer size.
   *  - Auto-scrolling behavior configurable as `"at-scroll-end"` or `"never"`.
   *  - Fully customizable send-container layout with four slot positions.
   *  - Programmatic message management: add, update, and send messages via public methods.
   *  - Custom rendering of chat items through flexible render callbacks.
   *  - Stop-response button for cancelling assistant response generation.
   *
   * ## Use when
   *  - Building AI-powered chat or assistant interfaces.
   *  - Implementing conversational UIs with file attachment and voice support.
   *  - Building AI-powered conversational interfaces where the interaction model is back-and-forth dialogue.
   *  - The system needs to ask clarifying questions or produce streaming responses.
   *
   * ## Do not use when
   *  - Displaying a simple message list without interactivity — use `ch-smart-grid` instead.
   *  - A standard form would be faster and more precise for collecting structured data (e.g., address forms).
   *  - Displaying a simple non-interactive message list — prefer `ch-smart-grid` directly.
   *
   * ## Accessibility
   *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable for assistive technology during virtual scrolling.
   *  - The send button and stop-response button carry accessible labels via the `translations` property.
   *  - New messages should be announced to screen readers via `aria-live="polite"` on the messages container.
   *  - All action buttons (send, stop-response) must have descriptive labels via the `translations` property.
   *  - Color and alignment alone must not be the only way to distinguish user messages from AI messages.
   *
   * @status experimental
   *
   * @part messages-container - The scrollable container that holds the chat messages.
   * @part send-container - The bottom area containing the input and action buttons.
   * @part send-container-before - Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined.
   * @part send-container-after - Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined.
   * @part send-input-before - Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined.
   * @part send-input-after - Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined.
   * @part send-button - The button that sends the current message.
   * @part stop-response-button - The button that stops the assistant's response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided.
   *
   * @slot empty-chat - Displayed when all records are loaded but there are no messages.
   * @slot loading-chat - Displayed while the chat is in the initial loading state.
   * @slot additional-content - Projected between the messages area and the send container. Rendered when `showAdditionalContent` is `true` and the chat is not in initial or empty state.
   *
   * @fires userMessageAdded Fired when a new user message is added in the chat via user interaction.
   *
   *   Since developers can define their own render for file attachment, this
   *   event serves to synchronize the cleanup of the `send-input` with the
   *   cleanup of the custom file attachment, or or even blocking user
   *   interactions before the `sendChatMessages` callback is executed.
   */
  // prettier-ignore
  interface HTMLChChatElement extends ChChat {
    // Extend the ChChat class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChChatElementEventTypes>(type: K, listener: (this: HTMLChChatElement, ev: HTMLChChatElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChChatElementEventTypes>(type: K, listener: (this: HTMLChChatElement, ev: HTMLChChatElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-chat": HTMLChChatElement;
  }

  interface HTMLElementTagNameMap {
    "ch-chat": HTMLChChatElement;
  }
}


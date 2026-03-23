import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit-html";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { createRef, ref, type Ref } from "lit-html/directives/ref.js";

import type { ChMimeType } from "../../utilities/mimeTypes/mime-types";
import { adoptCommonThemes } from "../../utilities/theme";

// import { TranscriptionSegment } from "livekit-client";
import type {
  ChVirtualScrollerCustomEvent,
  VirtualScrollVirtualItems
} from "../../components";
// import { EMPTY_LIVE_KIT_ROOM_MESSAGE } from "../live-kit-room/constants";
// import type { LiveKitCallbacks } from "../live-kit-room/types";

// Temporary types until livekit-client is installed
type TranscriptionSegment = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  final: boolean;
};
type LiveKitCallbacks = any;
const EMPTY_LIVE_KIT_ROOM_MESSAGE = "";
import type { SmartGridDataState } from "../smart-grid/internal/infinite-scroll/types";
import type { ThemeModel } from "../theme/theme-types";
import type { ChChatRenderLit } from "./internal/chat-render.lit";
import { mergeSortedArrays } from "./merge-sort-live-kit-messages";
import type { ChatTranslations } from "./translations";
import type {
  ChatCallbacks,
  ChatLiveModeConfiguration,
  ChatMessage,
  ChatMessageByRole,
  ChatMessageByRoleNoId,
  ChatMessageFiles,
  ChatMessageRenderByItem,
  ChatMessageRenderBySections,
  ChatMessageUser,
  ChatSendContainerLayout,
  ChatSendContainerLayoutElement
} from "./types";
import { getMessageContent, getMessageFiles } from "./utils";

// Import required components
import "../theme/theme.lit";
import "../edit/edit.lit";
import "../smart-grid/smart-grid.lit";
import "../virtual-scroller/virtual-scroller.lit";
import "../markdown-viewer/markdown-viewer.lit";
import "./internal/chat-render.lit";

import styles from "./chat.scss?inline";

const ENTER_KEY = "Enter";

const createLiveKitMessagesStore = (): {
  user: Map<string, TranscriptionSegment>;
  assistant: Map<string, TranscriptionSegment>;
} => ({
  assistant: new Map(),
  user: new Map()
});

const stopResponseButtonHasAPosition = (
  sendContainerLayout: ChatSendContainerLayout
) =>
  (sendContainerLayout.sendContainerBefore ?? []).includes(
    "stop-response-button"
  ) ||
  (sendContainerLayout.sendInputBefore ?? []).includes(
    "stop-response-button"
  ) ||
  (sendContainerLayout.sendInputAfter ?? []).includes("stop-response-button") ||
  (sendContainerLayout.sendContainerAfter ?? []).includes(
    "stop-response-button"
  );

const sendContainerLayoutPositionToPartName = {
  sendContainerBefore: "send-container-before",
  sendInputBefore: "send-input-before",
  sendInputAfter: "send-input-after",
  sendContainerAfter: "send-container-after"
} as const satisfies Record<keyof ChatSendContainerLayout, string>;

const getSendInputSlotRename = (
  slotToRename: "sendInputAfter" | "sendInputBefore"
) =>
  slotToRename === "sendInputBefore"
    ? "additional-content-before"
    : "additional-content-after";

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
  tag: "ch-chat",
  styles,
  shadow: true
})
export class ChChat extends KasstorElement {
  #cellIdAlignedWhenRendered: string | undefined;
  #cellHasToReserveSpace: Set<string> | undefined;

  #liveKitTranscriptions:
    | {
        user: Map<string, TranscriptionSegment>;
        assistant: Map<string, TranscriptionSegment>;
      }
    | undefined;
  #liveKitMessages: ChatMessage[] | undefined;

  #liveKitCallbacks: LiveKitCallbacks = {
    activeSpeakersChanged: participant =>
      this.callbacks?.liveMode?.activeSpeakersChanged(participant),

    updateTranscriptions: (segments, participant) => {
      let lastSegmentWithContent: TranscriptionSegment | undefined;

      for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];

        if (
          segment.text.trim() !== "" &&
          segment.text !== EMPTY_LIVE_KIT_ROOM_MESSAGE
        ) {
          lastSegmentWithContent = segment;
        }
      }

      if (lastSegmentWithContent === undefined) {
        return;
      }

      const messageRole = participant.isLocal ? "user" : "assistant";

      this.#liveKitTranscriptions[messageRole].set(
        lastSegmentWithContent.id,
        lastSegmentWithContent
      );

      this.#liveKitMessages = mergeSortedArrays(this.#liveKitTranscriptions);
      this.requestUpdate();
    }
  };

  #mustReplaceSendButtonWithStopResponse = true;

  #chatLitRef: Ref<ChChatRenderLit> = createRef();
  #editRef: Ref<HTMLChEditElement> = createRef();
  #smartGridRef: Ref<HTMLChSmartGridElement> = createRef();
  #virtualScrollRef: Ref<HTMLChVirtualScrollerElement> = createRef();

  @state() private uploadingFiles = 0;

  @state() private virtualItems: ChatMessage[] = [];

  @state() private initialLoadHasEnded = false;

  @property({ attribute: "auto-scroll" }) autoScroll:
    | "never"
    | "at-scroll-end" = "at-scroll-end";

  @property({ attribute: false }) callbacks?: ChatCallbacks | undefined;

  @property({ type: Boolean }) disabled: boolean = false;

  @property({ attribute: false }) items: ChatMessage[] = [];
  @Observe("items")
  protected itemsChanged() {
    this.#cellIdAlignedWhenRendered = undefined;
    this.initialLoadHasEnded = false;
    this.#cellHasToReserveSpace = undefined;
    this.#smartGridRef.value?.removeScrollEndContentReference();
  }

  @property({ attribute: "live-mode", type: Boolean }) liveMode: boolean =
    false;
  @Observe("liveMode")
  protected liveModeChanged() {
    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    } else {
      this.#virtualScrollRef.value?.addItems("end", ...this.#liveKitMessages);

      this.#liveKitTranscriptions = undefined;

      requestAnimationFrame(() => {
        this.#liveKitMessages = undefined;
      });
    }
  }

  @property({ attribute: false })
  liveModeConfiguration: ChatLiveModeConfiguration | undefined;

  @property({ attribute: "loading-state" }) loadingState: SmartGridDataState =
    "initial";

  @property({ attribute: "markdown-theme" }) markdownTheme?: string | null =
    "ch-markdown-viewer";

  @property({ attribute: "new-user-message-alignment" })
  newUserMessageAlignment: "start" | "end" = "end";
  @Observe("newUserMessageAlignment")
  protected newUserMessageAlignmentChanged() {
    if (this.newUserMessageAlignment === "end") {
      this.#cellIdAlignedWhenRendered = undefined;
    }
  }

  @property({ attribute: "new-user-message-scroll-behavior" })
  newUserMessageScrollBehavior: Exclude<ScrollBehavior, "auto"> = "instant";

  @property({ attribute: false }) renderItem?:
    | ChatMessageRenderByItem
    | ChatMessageRenderBySections
    | undefined;

  @property({ attribute: "send-button-disabled", type: Boolean })
  sendButtonDisabled: boolean = false;

  @property({ attribute: "send-input-disabled", type: Boolean })
  sendInputDisabled: boolean = false;

  @property({ attribute: "show-additional-content", type: Boolean })
  showAdditionalContent: boolean = false;

  @property({ attribute: false }) sendContainerLayout: ChatSendContainerLayout =
    {
      sendContainerAfter: ["send-button"]
    };
  @Observe("sendContainerLayout")
  protected sendContainerLayoutChanged() {
    this.#mustReplaceSendButtonWithStopResponse =
      !stopResponseButtonHasAPosition(this.sendContainerLayout);
  }

  @property({ attribute: false }) theme?: ThemeModel | undefined;

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

  @property({ attribute: "virtual-scroller-buffer-size", type: Number })
  virtualScrollerBufferSize: number = 5;

  @property({ attribute: "waiting-response", type: Boolean }) waitingResponse?:
    | boolean = false;

  @Event() protected userMessageAdded!: EventEmitter<
    ChatMessageByRole<"user">
  >;

  async addNewMessage(message: ChatMessage) {
    this.initialLoadHasEnded = true;

    if (this.newUserMessageAlignment === "start") {
      this.#cellHasToReserveSpace ??= new Set();
      this.#cellHasToReserveSpace.add(message.id);
    }

    this.#pushMessage(message);
  }

  async focusChatInput() {
    this.#editRef.value?.focus();
  }

  async setChatInputMessage(text: string) {
    if (this.#editRef.value) {
      this.#editRef.value.value = text;
    }
  }

  async sendChatMessage(content?: ChatMessageUser | undefined, files?: File[]) {
    return this.#sendMessage(content, files);
  }

  async updateChatMessage(
    messageIndex: number,
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) {
    if (this.items.length === 0 || !this.items[messageIndex]) {
      return;
    }
    this.initialLoadHasEnded = true;
    this.#updateMessage(messageIndex, message, mode);

    const updatedMessage = this.items[messageIndex];
    const virtualItemIndex = this.virtualItems.findIndex(
      virtualItem => virtualItem.id === updatedMessage.id
    );

    if (virtualItemIndex !== -1) {
      this.virtualItems[virtualItemIndex] = updatedMessage;
    }

    this.requestUpdate();
  }

  async updateLastMessage(
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) {
    if (this.items.length === 0) {
      return;
    }
    this.initialLoadHasEnded = true;
    this.#updateMessage(this.items.length - 1, message, mode);

    this.virtualItems[this.virtualItems.length - 1] = this.items.at(-1);

    this.requestUpdate();
  }

  #pushMessage = async (message: ChatMessage) => {
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
      const messageInIndex = this.items[messageIndex] as ChatMessageByRole<
        "system" | "assistant"
      >;

      const newMessageContent =
        getMessageContent(messageInIndex) + getMessageContent(message);

      const newMessageFiles: ChatMessageFiles =
        getMessageFiles(messageInIndex);
      newMessageFiles.push(...getMessageFiles(message));

      if (newMessageFiles.length !== 0) {
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

    const messageId = this.items[messageIndex].id;
    this.items[messageIndex] = Object.assign({ id: messageId }, message);
  };

  #sendMessageKeyboard = (event: KeyboardEvent) => {
    if (event.key !== ENTER_KEY || event.shiftKey) {
      return;
    }
    event.preventDefault();

    this.#sendMessage();
  };

  #addUserMessageToRecordAndFocusInput = async (
    userMessage: ChatMessageByRole<"user">
  ) => {
    this.#editRef.value.value = "";
    this.#editRef.value.click();

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

  #renderLiveKitRoom = () => {
    const config = this.liveModeConfiguration;

    return this.#liveModeIsDisplayed()
      ? html`<ch-live-kit-room
          .callbacks=${this.#liveKitCallbacks}
          connected
          .microphoneEnabled=${config.localParticipant?.microphoneEnabled ??
          true}
          token=${config.token}
          url=${config.url}
        ></ch-live-kit-room>`
      : nothing;
  };

  #uploadFiles = (
    userMessageToAdd: ChatMessageByRole<"user">,
    sendInputValue: string | undefined,
    filesToUpload: File[]
  ) => {
    const callbacks = this.callbacks;

    if (!callbacks) {
      return console.warn(
        'The "callbacks" property is not defined, so files can not be uploaded'
      );
    }
    if (!callbacks.uploadFile) {
      return console.warn(
        'The "uploadFile" member is not defined in the "callbacks" property, so files can not be uploaded'
      );
    }

    const chatFiles: ChatMessageFiles = [];
    userMessageToAdd.content = {
      message: sendInputValue,
      files: chatFiles
    };

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

          URL.revokeObjectURL(temporalFileURL);

          if (this.uploadingFiles === 0) {
            this.#sendChat();
          }
        });
    }
  };

  #sendChat = () => {
    const lastCell = this.items.at(-1);
    this.#cellIdAlignedWhenRendered = lastCell.id;

    if (this.newUserMessageAlignment === "start") {
      this.initialLoadHasEnded = true;
      this.#cellHasToReserveSpace ??= new Set();
      this.#cellHasToReserveSpace.add(lastCell.id);
    }

    if (!this.callbacks) {
      return console.warn(
        'The "callbacks" property is not defined, so the "sendChatMessages" function can not be executed to emit the new chat'
      );
    }

    this.callbacks.sendChatMessages(this.items);
  };

  #sendMessage = async (content?: ChatMessageUser, files?: File[]) => {
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
    const sendInputValue = content
      ? getMessageContent(content)
      : this.#editRef.value.value;
    const hasFiles = filesToUpload.length !== 0;
    const emptySendInput =
      (!sendInputValue || sendInputValue.trim() === "") && !hasFiles;

    if (emptySendInput) {
      return;
    }

    const userMessageToAdd: ChatMessageByRole<"user"> = content ?? {
      id: `${new Date().getTime()}`,
      role: "user",
      content: sendInputValue
    };

    if (!(await this.#chatMessageCanBeSent(userMessageToAdd, filesToUpload))) {
      return;
    }

    if (hasFiles) {
      this.#uploadFiles(userMessageToAdd, sendInputValue, filesToUpload);
    }

    await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);

    if (!hasFiles) {
      this.#sendChat();
    }

    this.requestUpdate();
  };

  #sendMessageWithSendButton = () => this.#sendMessage();

  #stopResponse = (event: MouseEvent) => {
    event.stopPropagation();
    this.callbacks!.stopResponse!();
  };

  #virtualItemsChanged = (
    event: ChVirtualScrollerCustomEvent<VirtualScrollVirtualItems>
  ) => {
    this.virtualItems = event.detail.virtualItems as ChatMessage[];
  };

  #renderChatOrEmpty = () =>
    this.loadingState === "all-records-loaded" && this.items.length === 0
      ? html`<slot name="empty-chat"></slot>`
      : html`<ch-smart-grid
          auto-scroll=${this.initialLoadHasEnded
            ? this.autoScroll
            : "at-scroll-end"}
          .dataProvider=${this.loadingState === "more-data-to-fetch"}
          loading-state=${this.virtualItems.length === 0
            ? "initial"
            : this.loadingState}
          inverse-loading
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
            inverse-loading
            .items=${this.items}
            .itemsCount=${this.items.length}
            @virtualItemsChanged=${this.#virtualItemsChanged}
            ${ref(this.#virtualScrollRef)}
          >
            <ch-chat-render-lit
              .cellHasToReserveSpace=${this.#cellHasToReserveSpace}
              .cellIdAlignedWhenRendered=${this.#cellIdAlignedWhenRendered}
              .chatRef=${this as unknown as HTMLChChatElement}
              .newUserMessageAlignment=${this.newUserMessageAlignment}
              .newUserMessageScrollBehavior=${this.newUserMessageScrollBehavior}
              .renderItem=${this.renderItem}
              .smartGridRef=${this.#smartGridRef.value}
              .virtualItems=${this.virtualItems}
              ${ref(this.#chatLitRef)}
            ></ch-chat-render-lit>
          </ch-virtual-scroller>
        </ch-smart-grid>`;

  #renderStopResponseButton = () => {
    const { accessibleName, text } = this.translations;

    const ariaLabel =
      accessibleName.stopResponseButton !== text.stopResponseButton
        ? accessibleName.stopResponseButton ?? text.stopResponseButton
        : undefined;

    return this.waitingResponse && this.callbacks?.stopResponse
      ? html`<button
          aria-label=${ariaLabel}
          title=${ariaLabel}
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
    const { accessibleName } = this.translations;

    const sendButtonDisabled =
      this.sendButtonDisabled ||
      this.disabled ||
      this.loadingState === "initial" ||
      this.#liveModeIsDisplayed();

    return html`<button
      aria-label=${accessibleName.sendButton}
      title=${accessibleName.sendButton}
      part="send-button"
      ?disabled=${sendButtonDisabled}
      type="button"
      @click=${sendButtonDisabled ? undefined : this.#sendMessageWithSendButton}
    >
    </button>`;
  };

  #renderSendContainerLayoutElement = (
    elementName: ChatSendContainerLayoutElement
  ) => {
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
    if (containerElements === undefined || containerElements.length === 0) {
      return nothing;
    }

    if (
      containerElements.length === 1 &&
      containerElements[0] === "stop-response-button" &&
      (!this.waitingResponse || this.callbacks?.stopResponse === undefined)
    ) {
      return nothing;
    }

    const partName = sendContainerLayoutPositionToPartName[containerName];

    return html`<div
      slot=${containerName === "sendInputAfter" ||
      containerName === "sendInputBefore"
        ? getSendInputSlotRename(containerName)
        : nothing}
      class=${"additional-content-container " + partName}
      part=${partName}
    >
      ${containerElements.map(this.#renderSendContainerLayoutElement)}
    </div>`;
  };

  #loadMoreItems = () => {
    this.loadingState = "loading";

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

      this.#virtualScrollRef.value.addItems("start", ...newItems);

      this.loadingState = "more-data-to-fetch";
    }, 10);
  };

  override connectedCallback() {
    super.connectedCallback();

    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);

    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    }

    this.#mustReplaceSendButtonWithStopResponse =
      !stopResponseButtonHasAPosition(this.sendContainerLayout);
  }

  override updated() {
    this.#chatLitRef.value?.requestUpdate();
  }

  override render() {
    const {
      sendContainerBefore,
      sendInputAfter,
      sendInputBefore,
      sendContainerAfter
    } = this.sendContainerLayout;

    const canShowAdditionalContent =
      this.showAdditionalContent &&
      this.loadingState !== "initial" &&
      !(this.items.length === 0 && this.loadingState === "all-records-loaded");

    const liveModeIsDisplayed = this.#liveModeIsDisplayed();

    const sendInputDisabled =
      this.sendInputDisabled || this.disabled || liveModeIsDisplayed;

    if (canShowAdditionalContent) {
      this.classList.add("ch-chat--additional-content");
    } else {
      this.classList.remove("ch-chat--additional-content");
    }

    return html`
      ${this.theme ? html`<ch-theme .model=${this.theme}></ch-theme>` : nothing}
      ${this.loadingState === "initial"
        ? html`<slot name="loading-chat"></slot>`
        : this.#renderChatOrEmpty()}
      ${canShowAdditionalContent
        ? html`<slot name="additional-content"></slot>`
        : nothing}

      <div class="send-container" part="send-container">
        ${this.#renderSendContainerOrSendInputSlots(
          "sendContainerBefore",
          sendContainerBefore
        )}

        <ch-edit
          class="send-input"
          accessible-name=${this.translations.accessibleName.sendInput}
          ?disabled=${sendInputDisabled}
          placeholder=${this.translations.placeholder.sendInput}
          @keydown=${sendInputDisabled ? undefined : this.#sendMessageKeyboard}
          ${ref(this.#editRef)}
        >
          ${this.#renderSendContainerOrSendInputSlots(
            "sendInputBefore",
            sendInputBefore
          )}
          ${this.#renderSendContainerOrSendInputSlots(
            "sendInputAfter",
            sendInputAfter
          )}
        </ch-edit>

        ${this.#renderSendContainerOrSendInputSlots(
          "sendContainerAfter",
          sendContainerAfter
        )}
      </div>

      ${this.#renderLiveKitRoom()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-chat": ChChat;
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
   * @fires userMessageAdded undefined
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


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

import { Host } from "../../utilities/host/host.js";
import { adoptCommonThemes } from "../../utilities/theme.js";

import type { SmartGridDataState } from "../infinite-scroll/types";
import { EMPTY_LIVE_KIT_ROOM_MESSAGE } from "../live-kit-room/constants.js";
import type { LiveKitCallbacks } from "../live-kit-room/types.js";
import type { ThemeModel } from "../theme/theme-types";
import type { VirtualScrollVirtualItems } from "../virtual-scroller/types.js";

import { renderContentBySections } from "./internal/renders/renders.lit.js";
import type {
  ChatCallbacks,
  ChatLiveModeConfiguration,
  ChatMessageRenderByItem,
  ChatMessageRenderBySections,
  ChatSendContainerLayout,
  ChatSendContainerLayoutElement
} from "./internal/renders/types.js";
import { mergeSortedArrays } from "./merge-sort-live-kit-messages.js";
import type { ChatTranslations } from "./translations.js";
import type {
  AGUIInputContent,
  AGUIMessage,
  AGUIMessageByRole,
  AGUIMessageByRoleNoId,
  AGUIToolMessage,
  AGUIUserMessage
} from "./typesAGUI.js";
import { getMessageContent } from "./utils.js";

import styles from "./chat.scss?inline";

// Lazy-load child components
import("../smart-grid/smart-grid.lit.js");
import("../virtual-scroller/virtual-scroller.lit.js");
import("../markdown-viewer/markdown-viewer.lit.js");
import("../live-kit-room/live-kit-room.lit.js");

// Lazy-load special components for chat integration
import("../plan/plan.lit.js");
import("../tool/tool.lit.js");
import("../confirmation/confirmation.lit.js");
import("../reasoning/reasoning.lit.js");
import("../chain-of-thought/chain-of-thought.lit.js");

import("../edit/edit.lit.js");

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

/**
 * AG-UI roles that don't produce a chat row by default.
 */
const ROLES_WITHOUT_OWN_ROW = new Set<AGUIMessage["role"]>([
  "system",
  "developer",
  "tool"
]);

/**
 * The `ch-chat` component delivers an AG-UI-driven conversational interface
 * with virtual scrolling for efficient rendering of large message histories.
 *
 * @remarks
 * ## Features
 *  - Renders AG-UI message streams (user / assistant / tool / reasoning /
 *    activity / system / developer).
 *  - Tool calls issued by an assistant are matched with their `tool` role
 *    result messages by `toolCallId` and rendered as a single unit.
 *  - Activity messages (`plan`, `confirmation`, `chain-of-thought`) are
 *    dispatched by `activityType`.
 *  - Multimodal user input via `AGUIInputContent[]` (text + image / audio /
 *    video / document parts).
 *  - Real-time voice conversations via LiveKit integration.
 *  - Virtual scrolling for large message histories with configurable buffer
 *    size.
 *  - Programmatic message management: add, update, and send messages via
 *    public methods.
 *
 * ## Use when
 *  - Building AI-powered chat or assistant interfaces speaking the AG-UI
 *    protocol.
 *  - Implementing conversational UIs with file attachment and voice support.
 *
 * ## Accessibility
 *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable
 *    for assistive technology during virtual scrolling.
 *  - The send button and stop-response button carry accessible labels via
 *    the `translations` property.
 *
 * @status experimental
 *
 * @part messages-container - The scrollable container that holds the chat messages.
 * @part send-container - The bottom area containing the input and action buttons.
 * @part send-container-before - Region before the send input within the send container.
 * @part send-container-after - Region after the send input within the send container.
 * @part send-input-before - Region before the text input inside the edit control.
 * @part send-input-after - Region after the text input inside the edit control.
 * @part send-button - The button that sends the current message.
 * @part stop-response-button - The button that stops the assistant's response generation.
 *
 * @slot empty-chat - Displayed when all records are loaded but there are no messages.
 * @slot loading-chat - Displayed while the chat is in the initial loading state.
 * @slot additional-content - Projected between the messages area and the send container.
 */
@Component({
  shadow: {
    exportparts: "container, title, message, actions, button-approve, button-reject, approval-requested, approval-responded, output-denied, output-available"
  },
  styles,
  tag: "ch-chat"
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
  #liveKitMessages: AGUIMessage[] | undefined;

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

  /**
   * Map from `toolCallId` to the matching `tool` role message in `items`.
   * Built from the current items list and consumed by the structure render
   * to pair an assistant's `toolCalls` with their results.
   */
  toolResultsByCallId: Map<string, AGUIToolMessage> = new Map();

  @state() uploadingFiles = 0;

  @state() virtualItems: AGUIMessage[] = [];

  @state() initialLoadHasEnded = false;

  @property({ attribute: "auto-scroll" }) autoScroll: "never" | "at-scroll-end" = "at-scroll-end";

  /**
   * Specifies the callbacks required in the control.
   */
  @property({ attribute: false }) callbacks?: ChatCallbacks | undefined;

  /**
   * Specifies if all interactions are disabled
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * AG-UI messages displayed by the chat.
   */
  @property({ attribute: false }) items: AGUIMessage[] = [];
  @Observe("items")
  protected itemsChanged() {
    this.#cellIdAlignedWhenRendered = undefined;
    this.initialLoadHasEnded = false;
    this.#cellHasToReserveSpace = undefined;
    this.#rebuildToolResultsIndex();
    this.#smartGridRef.value?.removeScrollEndContentReference();
  }

  @property({ attribute: "live-mode", type: Boolean }) liveMode: boolean = false;
  @Observe("liveMode")
  protected liveModeChanged() {
    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    } else {
      this.#virtualScrollRef.value?.addItems("end", ...(this.#liveKitMessages ?? []));
      this.#liveKitTranscriptions = undefined;
      requestAnimationFrame(() => {
        this.#liveKitMessages = undefined;
      });
    }
  }

  @property({ attribute: false }) liveModeConfiguration: ChatLiveModeConfiguration | undefined;

  @property({ attribute: false }) loadingState: SmartGridDataState = "initial";

  @property({ attribute: "markdown-theme" }) markdownTheme?: string | null = "ch-markdown-viewer";

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

  /**
   * Custom render of chat items, either as a full per-item override or as
   * an object of section overrides.
   */
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

  @property({ attribute: false }) sendContainerLayout: ChatSendContainerLayout = {
    sendContainerAfter: ["send-button"]
  };
  @Observe("sendContainerLayout")
  protected sendContainerLayoutChanged() {
    this.#mustReplaceSendButtonWithStopResponse = !stopResponseButtonHasAPosition(
      this.sendContainerLayout
    );
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

  @property({ attribute: "waiting-response", type: Boolean })
  waitingResponse?: boolean = false;

  /**
   * Fired when a new user message is added in the chat via user interaction.
   */
  @Event() protected userMessageAdded!: EventEmitter<AGUIUserMessage>;

  // - - - - - - - - - - - - - - - - - - - -
  //             Public methods
  // - - - - - - - - - - - - - - - - - - - -

  /**
   * Add a new AG-UI message at the end of the record.
   */
  public async addNewMessage(message: AGUIMessage) {
    this.initialLoadHasEnded = true;

    if (this.newUserMessageAlignment === "start") {
      this.#cellHasToReserveSpace ??= new Set();
      this.#cellHasToReserveSpace.add(message.id);
    }

    this.#indexToolMessageIfApplicable(message);
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
   * Send the current message of the ch-chat's `send-input` element.
   */
  public async sendChatMessage(content?: AGUIUserMessage | undefined, files?: File[]) {
    return this.#sendMessage(content, files);
  }

  /**
   * Update the indexed message's content. Streaming-style appenders should
   * use mode `"concat"`; full replacements use `"replace"`.
   */
  public async updateChatMessage(
    messageIndex: number,
    message: AGUIMessageByRoleNoId<"system" | "assistant">,
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

  /**
   * Update the content of the last message.
   */
  public async updateLastMessage(
    message: AGUIMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) {
    if (this.items.length === 0) {
      return;
    }
    this.initialLoadHasEnded = true;
    this.#updateMessage(this.items.length - 1, message, mode);
    this.virtualItems[this.virtualItems.length - 1] = this.items.at(-1)!;
    this.requestUpdate();
  }

  // - - - - - - - - - - - - - - - - - - - -
  //           Private helpers
  // - - - - - - - - - - - - - - - - - - - -

  #pushMessage = async (message: AGUIMessage) => {
    if (this.items.length === 0 || !this.#virtualScrollRef.value) {
      this.items.push(message);
      this.requestUpdate();
    } else {
      await this.#virtualScrollRef.value.addItems("end", message);
    }
  };

  /**
   * Concatenate the textual content of two AG-UI string-content messages
   * (system or assistant). Returns the concatenation, treating missing or
   * non-string content as empty.
   */
  #concatStringContent = (
    a: AGUIMessageByRole<"system" | "assistant">,
    b: AGUIMessageByRoleNoId<"system" | "assistant">
  ): string => {
    const aText = typeof a.content === "string" ? a.content : "";
    const bText = typeof b.content === "string" ? b.content : "";
    return aText + bText;
  };

  #updateMessage = (
    messageIndex: number,
    message: AGUIMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) => {
    if (mode === "concat") {
      const messageInIndex = this.items[messageIndex] as AGUIMessageByRole<
        "system" | "assistant"
      >;
      // Both system and assistant carry string content in AG-UI; bundled
      // payloads (files / sources / plan / etc.) are not supported here.
      message.content = this.#concatStringContent(messageInIndex, message);
    }

    const messageId = this.items[messageIndex].id;
    this.items[messageIndex] = Object.assign({ id: messageId }, message) as AGUIMessage;
    this.#rebuildToolResultsIndex();
  };

  #sendMessageKeyboard = (event: KeyboardEvent) => {
    if (event.key !== ENTER_KEY || event.shiftKey) {
      return;
    }
    event.preventDefault();
    this.#sendMessage();
  };

  #addUserMessageToRecordAndFocusInput = async (userMessage: AGUIUserMessage) => {
    const editEl = this.#editRef.value;
    editEl!.value = "";
    editEl!.click();

    await this.#pushMessage(userMessage);
    this.userMessageAdded.emit(userMessage);
  };

  #chatMessageCanBeSent = (chat: AGUIMessage, files: File[]) =>
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

  /**
   * Upload files for a user message. AG-UI carries multimodal user content
   * as `AGUIInputContent[]`, so files are appended as parts (image / audio
   * / video / document) once their upload resolves. AG-UI has no
   * "in-progress" state on the data itself — a part appears in the
   * message only after upload completes.
   */
  #uploadFiles = (
    userMessageToAdd: AGUIUserMessage,
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

    const parts: AGUIInputContent[] = [];
    if (sendInputValue && sendInputValue.length !== 0) {
      parts.push({ type: "text", text: sendInputValue });
    }
    userMessageToAdd.content = parts;

    for (let fileIndex = 0; fileIndex < filesToUpload.length; fileIndex++) {
      const file = filesToUpload[fileIndex];
      this.uploadingFiles++;

      callbacks
        .uploadFile(file)
        .then(uploadedPart => {
          parts.push(uploadedPart);
        })
        .catch(() => {
          // Strict AG-UI carries no failure marker on the data; the failed
          // upload is simply not appended.
        })
        .finally(async () => {
          this.uploadingFiles--;

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

  #sendMessage = async (content?: AGUIUserMessage, files?: File[]) => {
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
      : this.#editRef.value?.value;
    const hasFiles = filesToUpload.length !== 0;
    const emptySendInput = (!sendInputValue || sendInputValue.trim() === "") && !hasFiles;

    if (emptySendInput) {
      return;
    }

    const userMessageToAdd: AGUIUserMessage =
      content ??
      ({
        id: `${new Date().getTime()}`,
        role: "user",
        content: sendInputValue ?? ""
      } satisfies AGUIUserMessage);

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

  #virtualItemsChanged = (event: CustomEvent<VirtualScrollVirtualItems>) => {
    this.virtualItems = event.detail.virtualItems as AGUIMessage[];
  };

  // ── Tool result indexing ────────────────────────────────────────────

  #indexToolMessageIfApplicable = (message: AGUIMessage) => {
    if (message.role === "tool") {
      this.toolResultsByCallId.set(message.toolCallId, message);
    }
  };

  #rebuildToolResultsIndex = () => {
    this.toolResultsByCallId = new Map();
    for (const message of this.items) {
      this.#indexToolMessageIfApplicable(message);
    }
  };

  // - - - - - - - - - - - - - - - - - - - -
  //         Message rendering
  // - - - - - - - - - - - - - - - - - - - -

  #alignCellWhenRendered = () =>
    (this.#smartGridRef.value as any as HTMLChSmartGridElement).scrollEndContentToPosition(
      this.#cellIdAlignedWhenRendered!,
      {
        position: this.newUserMessageAlignment,
        behavior: this.newUserMessageScrollBehavior
      }
    );

  #getMessageRenderedContent = (message: AGUIMessage) => {
    if (!this.renderItem) {
      return renderContentBySections(message, this as any, {});
    }

    return typeof this.renderItem === "function"
      ? this.renderItem(message)
      : renderContentBySections(message, this as any, this.renderItem);
  };

  #renderMessageItem = (message: AGUIMessage) => {
    if (ROLES_WITHOUT_OWN_ROW.has(message.role)) {
      return "";
    }

    const messageContent = getMessageContent(message) ?? "";
    const hasFiles =
      message.role === "user" && Array.isArray(message.content)
        ? message.content.some(p => p.type !== "text")
        : false;

    const parts = [
      `message ${message.role} ${message.id}`,
      messageContent.trim() !== "" ? "has-content" : "",
      hasFiles ? "has-files" : ""
    ]
      .filter(Boolean)
      .join(" ");

    const renderedContent = this.#getMessageRenderedContent(message);
    const messageIsCellAlignedAtTheStart = message.id === this.#cellIdAlignedWhenRendered;
    const hasToRenderAnExtraDiv =
      this.#cellHasToReserveSpace !== undefined && this.#cellHasToReserveSpace.has(message.id);

    return html`<ch-smart-grid-cell
      .cellId=${message.id}
      aria-live=${ifDefined(message.role === "assistant" ? "polite" : undefined)}
      part=${ifDefined(hasToRenderAnExtraDiv ? undefined : parts)}
      .smartGridRef=${this.#smartGridRef.value as any as HTMLChSmartGridElement}
      @smartCellDidLoad=${messageIsCellAlignedAtTheStart ? this.#alignCellWhenRendered : undefined}
    >
      ${hasToRenderAnExtraDiv ? html`<div part=${parts}>${renderedContent}</div>` : renderedContent}
    </ch-smart-grid-cell>`;
  };

  #renderMessages = () =>
    html`${repeat(
      this.virtualItems,
      (item: AGUIMessage) => item.id,
      this.#renderMessageItem
    )}${this.#liveKitMessages
      ? repeat(
          this.#liveKitMessages,
          (item: AGUIMessage) => item.id,
          this.#renderMessageItem
        )
      : nothing}`;

  // - - - - - - - - - - - - - - - - - - - -
  //              Layout renders
  // - - - - - - - - - - - - - - - - - - - -

  #renderChatOrEmpty = () =>
    this.loadingState === "all-records-loaded" && this.items.length === 0
      ? html`<slot name="empty-chat"></slot>`
      : html`<ch-smart-grid
          .autoScroll=${this.initialLoadHasEnded ? this.autoScroll : "at-scroll-end"}
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
      aria-label=${ifDefined(
        accessibleName.sendButton === text.sendButton
          ? undefined
          : accessibleName.sendButton
      )}
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

    setTimeout(() => {
      const totalItems = this.items.length;

      const newItems: AGUIMessage[] = Array.from({ length: 20 }, (_, index) =>
        index % 2 === 0
          ? ({
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
            } satisfies AGUIMessage)
          : ({
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
            } satisfies AGUIMessage)
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

    adoptCommonThemes(this.shadowRoot!.adoptedStyleSheets);

    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    }

    this.#mustReplaceSendButtonWithStopResponse = !stopResponseButtonHasAPosition(
      this.sendContainerLayout
    );

    this.#rebuildToolResultsIndex();
  }

  override render() {
    const { sendContainerBefore, sendInputAfter, sendInputBefore, sendContainerAfter } =
      this.sendContainerLayout;

    const canShowAdditionalContent =
      this.showAdditionalContent &&
      this.loadingState !== "initial" &&
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
    userMessageAdded: AGUIUserMessage;
  }

  interface HTMLChChatElementEventTypes {
    userMessageAdded: HTMLChChatElementUserMessageAddedEvent;
  }

  /**
   * The `ch-chat` component delivers an AG-UI-driven conversational interface
   * with virtual scrolling for efficient rendering of large message histories.
   *
   * @remarks
   * ## Features
   *  - Renders AG-UI message streams (user / assistant / tool / reasoning /
   *    activity / system / developer).
   *  - Tool calls issued by an assistant are matched with their `tool` role
   *    result messages by `toolCallId` and rendered as a single unit.
   *  - Activity messages (`plan`, `confirmation`, `chain-of-thought`) are
   *    dispatched by `activityType`.
   *  - Multimodal user input via `AGUIInputContent[]` (text + image / audio /
   *    video / document parts).
   *  - Real-time voice conversations via LiveKit integration.
   *  - Virtual scrolling for large message histories with configurable buffer
   *    size.
   *  - Programmatic message management: add, update, and send messages via
   *    public methods.
   *
   * ## Use when
   *  - Building AI-powered chat or assistant interfaces speaking the AG-UI
   *    protocol.
   *  - Implementing conversational UIs with file attachment and voice support.
   *
   * ## Accessibility
   *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable
   *    for assistive technology during virtual scrolling.
   *  - The send button and stop-response button carry accessible labels via
   *    the `translations` property.
   *
   * @status experimental
   *
   * @part messages-container - The scrollable container that holds the chat messages.
   * @part send-container - The bottom area containing the input and action buttons.
   * @part send-container-before - Region before the send input within the send container.
   * @part send-container-after - Region after the send input within the send container.
   * @part send-input-before - Region before the text input inside the edit control.
   * @part send-input-after - Region after the text input inside the edit control.
   * @part send-button - The button that sends the current message.
   * @part stop-response-button - The button that stops the assistant's response generation.
   *
   * @slot empty-chat - Displayed when all records are loaded but there are no messages.
   * @slot loading-chat - Displayed while the chat is in the initial loading state.
   * @slot additional-content - Projected between the messages area and the send container.
   *
   * @fires userMessageAdded Fired when a new user message is added in the chat via user interaction.
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


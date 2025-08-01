import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import type { ChMimeType } from "../../common/mimeTypes/mime-types";
import { adoptCommonThemes } from "../../common/theme";

import { TranscriptionSegment } from "livekit-client";
import type {
  ChVirtualScrollerCustomEvent,
  VirtualScrollVirtualItems
} from "../../components";
import { EMPTY_LIVE_KIT_ROOM_MESSAGE } from "../live-kit-room/constants";
import type { LiveKitCallbacks } from "../live-kit-room/types";
import type { SmartGridDataState } from "../smart-grid/internal/infinite-scroll/types";
import type { ThemeModel } from "../theme/theme-types";
import type { ChChatLit } from "./internal/chat.lit";
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
  ChatMessageUser
} from "./types";
import { getMessageContent, getMessageFiles } from "./utils";

// Side effect to define the ch-chat-lit custom element
import "./internal/chat.lit";

const ENTER_KEY = "Enter";

const createLiveKitMessagesStore = (): {
  user: Map<string, TranscriptionSegment>;
  assistant: Map<string, TranscriptionSegment>;
} => ({
  assistant: new Map(),
  user: new Map()
});

/**
 * TODO: Add description
 */
@Component({
  tag: "ch-chat",
  styleUrl: "chat.scss",
  shadow: true
})
export class ChChat {
  /**
   * Specifies the ID of the cell that is aligned to the start of the scroll
   * position.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
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
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
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

      // Don't add empty messages
      if (lastSegmentWithContent === undefined) {
        return;
      }

      const messageRole = participant.isLocal ? "user" : "assistant";

      this.#liveKitTranscriptions[messageRole].set(
        lastSegmentWithContent.id,
        lastSegmentWithContent
      );

      this.#liveKitMessages = mergeSortedArrays(this.#liveKitTranscriptions);
      forceUpdate(this);
    }
  };

  // Refs
  #chatLitRef: ChChatLit | undefined;
  #editRef!: HTMLChEditElement;
  #smartGridRef: HTMLChSmartGridElement | undefined;
  #virtualScrollRef: HTMLChVirtualScrollerElement | undefined;

  @Element() el!: HTMLChChatElement;

  @State() uploadingFiles = 0;

  @State() virtualItems: ChatMessage[] = [];

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
  @State() initialLoadHasEnded = false;

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
  @Prop() readonly autoScroll: "never" | "at-scroll-end" = "at-scroll-end";

  /**
   * Specifies the callbacks required in the control.
   */
  @Prop() readonly callbacks?: ChatCallbacks | undefined;

  /**
   * Specifies if all interactions are disabled
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * `true` if a response for the assistant is being generated.
   */
  @Prop() readonly generatingResponse?: boolean = false;

  // TODO: Add support for undefined messages.
  /**
   * Specifies the items that the chat will display.
   */
  @Prop({ mutable: true }) items: ChatMessage[] = [];
  @Watch("items")
  itemsChanged() {
    this.#cellIdAlignedWhenRendered = undefined;
    this.initialLoadHasEnded = false;

    // Free the memory, since no cells will have reserved space as the model
    // is different
    this.#cellHasToReserveSpace = undefined;

    // TODO: This is a WA to remove the anchor cell when the model changes. We
    // should find a better way to remove the reserved space for the anchor
    // cell
    this.#smartGridRef?.removeScrollEndContentReference();
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
  @Prop() readonly liveMode: boolean = false;
  @Watch("liveMode")
  liveModeChanged() {
    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    } else {
      this.#virtualScrollRef?.addItems("end", ...this.#liveKitMessages);

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
  @Prop() readonly liveModeConfiguration: ChatLiveModeConfiguration | undefined;

  /**
   * Specifies if the chat is waiting for the data to be loaded.
   */
  @Prop({ mutable: true }) loadingState: SmartGridDataState = "initial";

  /**
   * Specifies the theme to be used for rendering the markdown.
   * If `null`, no theme will be applied.
   */
  @Prop() readonly markdownTheme?: string | null = "ch-markdown-viewer";

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
  @Prop() readonly newUserMessageAlignment: "start" | "end" = "end";
  @Watch("newUserMessageAlignment")
  newUserMessageAlignmentChanged() {
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
  @Prop() readonly newUserMessageScrollBehavior: Exclude<
    ScrollBehavior,
    "auto"
  > = "instant";

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
   *   `content`, `files` and/or `messageStructure`).
   */
  @Prop() readonly renderItem?:
    | ChatMessageRenderByItem
    | ChatMessageRenderBySections
    | undefined;

  /**
   * `true` to disable the send-button element.
   */
  @Prop() readonly sendButtonDisabled: boolean = false;

  /**
   * `true` to disable the send-input element.
   */
  @Prop() readonly sendInputDisabled: boolean = false;

  /**
   * `true` to render a slot named "additional-content" to project elements
   * between the "content" slot (grid messages) and the "send-container" slot.
   *
   * This slot can only be rendered if loadingState !== "initial" and
   * (loadingState !== "all-records-loaded" && items.length > 0).
   */
  @Prop() readonly showAdditionalContent: boolean = false;

  /**
   * If `true`, a slot is rendered in the `send-input` with
   * `"send-input-additional-content-after"` name. This slot is intended to customize
   * the internal content of the send-input by adding additional elements
   * after the send-input content.
   */
  @Prop() readonly showSendInputAdditionalContentAfter: boolean = false;

  /**
   * If `true`, a slot is rendered in the `send-input` with
   * `"send-input-additional-content-before"` name. This slot is intended to customize
   * the internal content of the send-input by adding additional elements
   * before the send-input content.
   */
  @Prop() readonly showSendInputAdditionalContentBefore: boolean = false;

  /**
   * Specifies the theme to be used for rendering the chat.
   * If `undefined`, no theme will be applied.
   */
  @Prop() readonly theme?: ThemeModel | undefined;

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: ChatTranslations = {
    accessibleName: {
      clearChat: "Clear chat",
      copyMessageContent: "Copy message content",
      downloadCodeButton: "Download code",
      sendButton: "Send",
      sendInput: "Message",
      stopButton: "Stop generating answer"
    },
    placeholder: {
      sendInput: "Ask me a question..."
    },
    text: {
      copyCodeButton: "Copy code",
      copyMessageContent: "Copy",
      processing: `Processing...`,
      sourceFiles: "Source files:",
      stopButton: "Stop generating answer"
    }
  };

  /**
   * Fired when a new user message is added in the chat via user interaction.
   *
   * Since developers can define their own render for file attachment, this
   * event serves to synchronize the cleanup of the `send-input` with the
   * cleanup of the custom file attachment, or or even blocking user
   * interactions before the `sendChatMessages` callback is executed.
   */
  @Event() userMessageAdded: EventEmitter<ChatMessageByRole<"user">>;

  /**
   * Add a new message at the end of the record, performing a re-render.
   */
  @Method()
  async addNewMessage(message: ChatMessage) {
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
  @Method()
  async focusChatInput() {
    this.#editRef?.focus();
  }

  /**
   * Set the text for the chat input
   */
  @Method()
  async setChatInputMessage(text: string) {
    if (this.#editRef) {
      this.#editRef.value = text;
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
  @Method()
  async sendChatMessage(content?: ChatMessageUser | undefined, files?: File[]) {
    return this.#sendMessage(content, files);
  }

  /**
   * Given the id of the message, it updates the content of the indexed message.
   */
  @Method()
  async updateChatMessage(
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

    forceUpdate(this);
  }

  // TODO: Add unit tests to validate how the chat message should be copied
  // into the last chat message, considering that messages can have more
  // properties that the interface/type has
  /**
   * Update the content of the last message, performing a re-render.
   */
  @Method()
  async updateLastMessage(
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
    this.virtualItems[this.virtualItems.length - 1] = this.items.at(-1);

    forceUpdate(this);
  }

  #pushMessage = async (message: ChatMessage) => {
    // We should also check for the virtual-scroller to be defined, because the
    // user can add two messages at once, without waiting for the
    // virtual-scroller to be defined
    if (this.items.length === 0 || !this.#virtualScrollRef) {
      this.items.push(message);
      forceUpdate(this);
    } else {
      await this.#virtualScrollRef.addItems("end", message);
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

      // Temporal store for the new message content
      const newMessageContent =
        getMessageContent(messageInIndex) + getMessageContent(message);

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

  #addUserMessageToRecordAndFocusInput = async (
    userMessage: ChatMessageByRole<"user">
  ) => {
    this.#editRef.value = "";
    this.#editRef.click(); // TODO: Should it be focus???

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

    return (
      this.#liveModeIsDisplayed() && (
        <ch-live-kit-room
          callbacks={this.#liveKitCallbacks}
          connected
          microphoneEnabled={config.localParticipant?.microphoneEnabled ?? true}
          token={config.token}
          url={config.url}
        ></ch-live-kit-room>
      )
    );
  };

  #uploadFiles = (
    userMessageToAdd: ChatMessageByRole<"user">,
    sendInputValue: string | undefined,
    filesToUpload: File[]
  ) => {
    const callbacks = this.callbacks;

    if (!callbacks) {
      // eslint-disable-next-line no-console
      return console.warn(
        'The "callbacks" property is not defined, so files can not be uploaded'
      );
    }
    if (!callbacks.uploadFile) {
      // eslint-disable-next-line no-console
      return console.warn(
        'The "uploadFile" member is not defined in the "callbacks" property, so files can not be uploaded'
      );
    }

    const chatFiles: ChatMessageFiles = [];
    userMessageToAdd.content = {
      message: sendInputValue,
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
    const lastCell = this.items.at(-1);
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
      this.generatingResponse ||
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
      : this.#editRef.value;
    const hasFiles = filesToUpload.length !== 0;
    const emptySendInput =
      (!sendInputValue || sendInputValue.trim() === "") && !hasFiles;

    if (emptySendInput) {
      return;
    }

    // Message
    const userMessageToAdd: ChatMessageByRole<"user"> = content ?? {
      id: `${new Date().getTime()}`,
      role: "user",
      content: sendInputValue
    };

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
    forceUpdate(this);
  };

  #sendMessageWithSendButton = () => this.#sendMessage();

  #stopResponse = (event: MouseEvent) => {
    event.stopPropagation();
    this.callbacks!.stop!();
  };

  #virtualItemsChanged = (
    event: ChVirtualScrollerCustomEvent<VirtualScrollVirtualItems>
  ) => {
    this.virtualItems = event.detail.virtualItems as ChatMessage[];
  };

  #renderChatOrEmpty = () =>
    this.loadingState === "all-records-loaded" && this.items.length === 0 ? (
      <slot name="empty-chat"></slot>
    ) : (
      <ch-smart-grid
        autoScroll={
          // We have to bind the property this way to make sure the scroll is
          // positioned correctly at the initial load. Otherwise, if really
          // hard to position the scroll if we don't know somehow when the
          // initial load has finished
          this.initialLoadHasEnded ? this.autoScroll : "at-scroll-end"
        }
        dataProvider={this.loadingState === "more-data-to-fetch"}
        loadingState={
          this.virtualItems.length === 0 ? "initial" : this.loadingState
        }
        inverseLoading
        itemsCount={this.virtualItems.length}
        onInfiniteThresholdReached={this.#loadMoreItems}
        ref={el => (this.#smartGridRef = el as HTMLChSmartGridElement)}
      >
        <ch-virtual-scroller
          role="row"
          slot="grid-content"
          class="grid-content"
          part="messages-container"
          inverseLoading
          // mode="lazy-render"
          items={this.items}
          itemsCount={this.items.length}
          onVirtualItemsChanged={this.#virtualItemsChanged}
          ref={el =>
            (this.#virtualScrollRef = el as HTMLChVirtualScrollerElement)
          }
        >
          <ch-chat-lit
            cellHasToReserveSpace={this.#cellHasToReserveSpace}
            cellIdAlignedWhenRendered={this.#cellIdAlignedWhenRendered}
            chatRef={this.el}
            newUserMessageAlignment={this.newUserMessageAlignment}
            newUserMessageScrollBehavior={this.newUserMessageScrollBehavior}
            renderItem={this.renderItem}
            smartGridRef={this.#smartGridRef}
            virtualItems={this.virtualItems}
            ref={el => (this.#chatLitRef = el)}
          ></ch-chat-lit>
        </ch-virtual-scroller>
      </ch-smart-grid>
    );

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

      this.#virtualScrollRef.addItems("start", ...newItems);

      this.loadingState = "more-data-to-fetch";
    }, 10);
  };

  connectedCallback() {
    // Scrollbar styles
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);

    if (this.liveMode) {
      this.#liveKitTranscriptions = createLiveKitMessagesStore();
      this.#liveKitMessages = [];
    }
  }

  componentDidUpdate() {
    // At this moment, for safety we should always re-render the ch-chat-lit
    // when the ch-chat is re-rendered
    this.#chatLitRef?.requestUpdate();
  }

  render() {
    const text = this.translations.text;
    const accessibleName = this.translations.accessibleName;

    const canShowAdditionalContent =
      this.showAdditionalContent &&
      // It's not the initial load
      this.loadingState !== "initial" &&
      // It's not the empty chat
      !(this.items.length === 0 && this.loadingState === "all-records-loaded");

    const liveModeIsDisplayed = this.#liveModeIsDisplayed();

    const sendInputDisabled =
      this.sendInputDisabled || this.disabled || liveModeIsDisplayed;

    const sendButtonDisabled =
      this.sendButtonDisabled ||
      this.disabled ||
      liveModeIsDisplayed ||
      this.loadingState === "initial";

    return (
      <Host
        class={
          canShowAdditionalContent ? "ch-chat--additional-content" : undefined
        }
      >
        {this.theme && <ch-theme model={this.theme}></ch-theme>}

        {this.loadingState === "initial" ? (
          <slot name="loading-chat"></slot>
        ) : (
          this.#renderChatOrEmpty()
        )}

        {canShowAdditionalContent && <slot name="additional-content" />}

        <div class="send-container" part="send-container">
          {this.generatingResponse && this.callbacks?.stop && (
            <button
              aria-label={
                accessibleName.stopButton !== text.stopButton &&
                (accessibleName.stopButton ?? text.stopButton)
              }
              part="stop-button"
              type="button"
              onClick={this.#stopResponse}
            >
              {text.stopButton}
            </button>
          )}

          <div class="send-input-wrapper" part="send-input-wrapper">
            <ch-edit
              accessibleName={accessibleName.sendInput}
              autoGrow
              disabled={sendInputDisabled}
              hostParts="send-input"
              multiline
              placeholder={this.translations.placeholder.sendInput}
              preventEnterInInputEditorMode
              showAdditionalContentAfter={
                this.showSendInputAdditionalContentAfter
              }
              showAdditionalContentBefore={
                this.showSendInputAdditionalContentBefore
              }
              onKeyDown={
                sendInputDisabled || this.liveMode
                  ? undefined
                  : this.#sendMessageKeyboard
              }
              ref={el => (this.#editRef = el as HTMLChEditElement)}
            >
              {this.showSendInputAdditionalContentBefore && (
                <slot
                  slot="additional-content-before"
                  name="send-input-additional-content-before"
                />
              )}
              {this.showSendInputAdditionalContentAfter && (
                <slot
                  slot="additional-content-after"
                  name="send-input-additional-content-after"
                />
              )}
            </ch-edit>
          </div>

          <button
            aria-label={accessibleName.sendButton}
            title={accessibleName.sendButton}
            class="send-or-audio-button"
            part="send-button"
            disabled={sendButtonDisabled}
            type="button"
            onClick={
              sendButtonDisabled ? undefined : this.#sendMessageWithSendButton
            }
          ></button>
        </div>

        {this.#renderLiveKitRoom()}
      </Host>
    );
  }
}

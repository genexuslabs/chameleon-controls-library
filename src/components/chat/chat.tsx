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
import type {
  ChVirtualScrollerCustomEvent,
  VirtualScrollVirtualItems
} from "../../components";
import type { ThemeModel } from "../theme/theme-types";
import type {
  ChatFiles,
  ChatInternalCallbacks,
  ChatMessage,
  ChatMessageAssistant,
  ChatMessageByRole,
  ChatMessageByRoleNoId,
  ChatMessageError,
  ChatMessageRenderByItem,
  ChatMessageRenderBySections,
  ChatMessageUser
} from "./types";
import type { SmartGridDataState } from "../smart-grid/internal/infinite-scroll/types";
import type { ChatTranslations } from "./translations";
import type { ChMimeType } from "../../common/mimeTypes/mime-types";
import { adoptCommonThemes } from "../../common/theme";
import { tokenMap } from "../../common/utils";
import { getMessageContent, getMessageFiles } from "./utils";
import { renderContentBySections } from "./renders/renders";

const ENTER_KEY = "Enter";

const getAriaBusyValue = (
  status?: "complete" | "waiting" | "streaming" | undefined
): "true" | "false" => (status === "streaming" ? "true" : "false");

/**
 * TODO: Add description
 */
@Component({
  tag: "ch-chat",
  styleUrl: "chat.scss",
  shadow: true
})
export class ChChat {
  #cellIdAlignedWhenRendered: string | undefined;
  #cellHasToReserveSpace: Set<string> | undefined;

  // Refs
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
  @Prop() readonly callbacks?: ChatInternalCallbacks | undefined;

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
    | ChatMessageRenderBySections;

  /**
   * `true` to render a slot named "additional-content" to project elements
   * between the "content" slot (grid messages) and the "send-container" slot.
   *
   * This slot can only be rendered if loadingState !== "initial" and
   * (loadingState !== "all-records-loaded" && items.length > 0).
   */
  @Prop() readonly showAdditionalContent: boolean = false;

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
      copyResponseButton: "Copy assistant response",
      downloadCodeButton: "Download code",
      sendButton: "Send",
      sendInput: "Message",
      stopGeneratingAnswerButton: "Stop generating answer"
    },
    placeholder: {
      sendInput: "Ask me a question..."
    },
    text: {
      stopGeneratingAnswerButton: "Stop generating answer",
      copyCodeButton: "Copy code",
      processing: `Processing...`,
      sourceFiles: "Source files:"
    }
  };

  /**
   * Fired when a new user message is added in the chat by an user interaction.
   *
   * This callback is useful for cleaning up the files for any custom render of
   * the files or even blocking user interactions before the sendChatMessages
   * callback is executed.
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
    if (this.items.length === 0) {
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
      const newMessageFiles: ChatFiles = getMessageFiles(messageInIndex);
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

  // TODO: This should be a property
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
  };

  #chatMessageCanBeSent = (chat: ChatMessage, files: File[]) =>
    !this.callbacks ||
    !this.callbacks.validateSendChatMessage ||
    this.callbacks.validateSendChatMessage(chat, files);

  #getChatFiles = () =>
    !this.callbacks || !this.callbacks.getChatMessageFiles
      ? []
      : this.callbacks.getChatMessageFiles();

  #uploadFiles = (
    userMessageToAdd: ChatMessageByRole<"user">,
    sendInputValue: string,
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

    const chatFiles: ChatFiles = [];
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
            this.#sendChat(userMessageToAdd);
          }
        });
    }

    if (callbacks.clearChatMessageFiles) {
      callbacks.clearChatMessageFiles();
    }
  };

  #sendChat = async (userMessageToAdd: ChatMessageUser) => {
    await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);

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

  #sendMessage = async () => {
    const filesToUpload = await this.#getChatFiles();
    const sendInputValue = this.#editRef.value;
    const hasFiles = filesToUpload.length !== 0;
    const emptySendInput =
      (!sendInputValue || sendInputValue.trim() === "") && !hasFiles;

    // TODO: Add unit tests for this
    if (
      emptySendInput ||
      this.disabled ||
      this.loadingState === "initial" ||
      this.loadingState === "loading" ||
      this.generatingResponse
    ) {
      return;
    }

    // Message
    const userMessageToAdd: ChatMessageByRole<"user"> = {
      id: `${new Date().getTime()}`,
      role: "user",
      content: sendInputValue
    };

    // Validate message with callback
    if (!(await this.#chatMessageCanBeSent(userMessageToAdd, filesToUpload))) {
      return;
    }

    // Upload files to the server
    if (hasFiles) {
      this.#uploadFiles(userMessageToAdd, sendInputValue, filesToUpload);
    }

    if (this.uploadingFiles === 0) {
      await this.#sendChat(userMessageToAdd);
    }

    // Queue a new re-render
    forceUpdate(this);
  };

  #handleStopGenerating = (event: MouseEvent) => {
    event.stopPropagation();
    this.callbacks!.stopGeneratingAnswer!();
  };

  #alignCellWhenRendered = () =>
    this.#smartGridRef.scrollEndContentToPosition(
      this.#cellIdAlignedWhenRendered,
      {
        position: this.newUserMessageAlignment,
        behavior: this.newUserMessageScrollBehavior
      }
    );

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
          part="content"
          inverseLoading
          // mode="lazy-render"
          items={this.items}
          itemsCount={this.items.length}
          onVirtualItemsChanged={this.#virtualItemsChanged}
          ref={el =>
            (this.#virtualScrollRef = el as HTMLChVirtualScrollerElement)
          }
        >
          {this.virtualItems.map(this.#renderItem)}
        </ch-virtual-scroller>
      </ch-smart-grid>
    );

  #getMessageRenderedContent = (
    message: ChatMessageUser | ChatMessageAssistant | ChatMessageError
  ) => {
    // Default render
    if (!this.renderItem) {
      return renderContentBySections(message, this.el, {});
    }

    return typeof this.renderItem === "function"
      ? this.renderItem(message)
      : renderContentBySections(message, this.el, this.renderItem); // The custom render is separated by sections
  };

  #renderItem = (message: ChatMessage) => {
    if (message.role === "system") {
      return "";
    }

    const isAssistantMessage = message.role === "assistant";

    const parts = tokenMap({
      [`cell message ${message.role} ${message.id}`]: true,
      [message.parts]: !!message.parts,
      [(message as ChatMessageByRole<"assistant">).status]: isAssistantMessage
    });

    const renderedContent = this.#getMessageRenderedContent(message);

    const messageIsCellAlignedAtTheStart =
      message.id === this.#cellIdAlignedWhenRendered;

    const hasToRenderAnExtraDiv =
      this.#cellHasToReserveSpace !== undefined &&
      this.#cellHasToReserveSpace.has(message.id);

    return (
      <ch-smart-grid-cell
        key={message.id}
        cellId={message.id}
        aria-live={isAssistantMessage ? "polite" : undefined}
        // Wait until all changes are made to prevents assistive
        // technologies from announcing changes before updates are done
        aria-busy={
          isAssistantMessage ? getAriaBusyValue(message.status) : undefined
        }
        part={hasToRenderAnExtraDiv ? undefined : parts}
        smartGridRef={this.#smartGridRef}
        onSmartCellDidLoad={
          messageIsCellAlignedAtTheStart
            ? this.#alignCellWhenRendered
            : undefined
        }
      >
        {hasToRenderAnExtraDiv ? (
          <div part={parts}>{renderedContent}</div>
        ) : (
          renderedContent
        )}
      </ch-smart-grid-cell>
    );
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

      this.#virtualScrollRef.addItems("start", ...newItems);

      this.loadingState = "more-data-to-fetch";
    }, 10);
  };

  connectedCallback() {
    // Scrollbar styles
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);
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
          {this.generatingResponse && this.callbacks?.stopGeneratingAnswer && (
            <button
              aria-label={
                accessibleName.stopGeneratingAnswerButton !==
                  text.stopGeneratingAnswerButton &&
                (accessibleName.stopGeneratingAnswerButton ??
                  text.stopGeneratingAnswerButton)
              }
              class="stop-generating-answer-button"
              part="stop-generating-answer-button"
              type="button"
              onClick={this.#handleStopGenerating}
            >
              {text.stopGeneratingAnswerButton}
            </button>
          )}

          <div class="send-input-wrapper" part="send-input-wrapper">
            <ch-edit
              accessibleName={accessibleName.sendInput}
              autoGrow
              hostParts="send-input"
              multiline
              placeholder={this.translations.placeholder.sendInput}
              onKeyDown={this.#sendMessageKeyboard}
              ref={el => (this.#editRef = el as HTMLChEditElement)}
            ></ch-edit>
          </div>

          <button
            aria-label={accessibleName.sendButton}
            title={accessibleName.sendButton}
            class="send-or-audio-button"
            part="send-button"
            disabled={this.disabled}
            type="button"
            onClick={
              this.loadingState !== "initial" ? this.#sendMessage : undefined
            }
          ></button>
        </div>
      </Host>
    );
  }
}

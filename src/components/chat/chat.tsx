import {
  Component,
  Element,
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
import {
  ChatContentImages,
  ChatInternalCallbacks,
  ChatMessage,
  ChatMessageByRole,
  ChatMessageByRoleNoId
} from "./types";
import { SmartGridDataState } from "../smart-grid/internal/infinite-scroll/types";
import { removeElement } from "../../common/array";
import { ChatTranslations } from "./translations";
import { defaultChatRender } from "./default-chat-render";
import { adoptCommonThemes } from "../../common/theme";
import { MarkdownViewerCodeRender } from "../markdown-viewer/parsers/types";
import { tokenMap } from "../../common/utils";

const ENTER_KEY = "Enter";

/**
 * TODO: Add description
 */
@Component({
  tag: "ch-chat",
  styleUrl: "chat.scss",
  shadow: true
})
export class ChChat {
  #cellAlignedAtTheStartId: string | undefined;
  #cellHasToReserveSpace: Set<string> | undefined;

  // Refs
  #editRef!: HTMLChEditElement;
  #smartGridRef: HTMLChSmartGridElement | undefined;
  #virtualScrollRef: HTMLChVirtualScrollerElement | undefined;

  @Element() el!: HTMLChChatElement;

  @State() imagesToUpload: { src: string; file: File }[] = [];
  @State() uploadingImagesToTheServer = 0;
  @State() virtualItems: ChatMessage[] = [];

  /**
   * `true` if a message was added by executing the `addNewMessage` method.
   *
   * This flag is useful to determinate when the initial load of the chat has
   * finished. If we always take into account the `autoScroll` property value,
   * in the initial load the scroll would not be positioned correctly at the
   * end, so we only take into account the `autoScroll` value after the first
   * message is added by the host of the component.
   */
  @State() messageWasAdded = false;

  /**
   * TODO.
   */
  @Prop() readonly alignNewMessage: "start" | "end" = "end";
  @Watch("alignNewMessage")
  alignNewMessageChanged() {
    if (this.alignNewMessage === "end") {
      this.#cellAlignedAtTheStartId = undefined;

      // Don't reset the `cellHasToReserveSpace` Set here, because the render
      // of the items that belongs to the Set will be destroyed and re-created
      // to only remove one div
    }
  }

  /**
   * TODO.
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

  /**
   * Specifies an object containing an HTMLAnchorElement reference. Use this
   * property to render a button to download the code when displaying a code
   * block.
   */
  @Prop() readonly hyperlinkToDownloadFile?: { anchor: HTMLAnchorElement };

  /**
   * Specifies if the control can render a button to load images from the file
   * system.
   */
  @Prop() readonly imageUpload: boolean = false;

  /**
   * Specifies if the chat is used in a mobile device.
   */
  @Prop() readonly isMobile?: boolean = false;

  // TODO: Add support for undefined messages.
  /**
   * Specifies the items that the chat will display.
   */
  @Prop({ mutable: true }) items: ChatMessage[] = [];
  @Watch("items")
  itemsChanged() {
    this.#cellAlignedAtTheStartId = undefined;
    this.messageWasAdded = false;

    // Free the memory, since no cells will have reserved space as the model
    // is different
    this.#cellHasToReserveSpace = undefined;
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
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode?: MarkdownViewerCodeRender;

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
      imagePicker: "Select images",
      removeUploadedImage: "Remove uploaded image",
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
   * This property allows us to implement custom rendering of chat items.
   * If allow us to implement the render of the cell content.
   */
  @Prop() readonly renderItem?: (
    messageModel: ChatMessageByRole<"assistant" | "error" | "user">
  ) => any;

  /**
   * Add a new message at the end of the record, performing a re-render.
   */
  @Method()
  async addNewMessage(message: ChatMessage) {
    this.messageWasAdded = true;

    if (this.alignNewMessage === "start") {
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
    if (this.items.length === 0 || !this.items[messageIndex]) {
      return;
    }
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
    if (this.items.length === 0) {
      return;
    }
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

  #getMessageContent = (
    message: ChatMessageByRoleNoId<"system" | "assistant">
  ) =>
    typeof message.content === "string"
      ? message.content
      : message.content.message;

  #updateMessage = (
    messageIndex: number,
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) => {
    if (mode === "concat") {
      // Temporal store for the new message
      const newMessageContent =
        this.#getMessageContent(
          this.items[messageIndex] as ChatMessageByRole<"system" | "assistant">
        ) + this.#getMessageContent(message);

      // Reuse the message ref to correctly update the message content
      if (typeof message.content === "string") {
        message.content = newMessageContent;
      } else {
        message.content.message = newMessageContent;
      }
    }

    // Replace the message
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
    this.#editRef.value = "";
    this.#editRef.click();

    // Scroll to bottom
    if (this.#smartGridRef && this.alignNewMessage === "end") {
      this.#smartGridRef.scrollTop = this.#smartGridRef.scrollHeight;
    }

    await this.#pushMessage(userMessage);
  };

  #chatMessageCanBeSent = (chat: ChatMessage) =>
    !this.callbacks ||
    !this.callbacks.validateSendChatMessage ||
    this.callbacks.validateSendChatMessage(chat);

  #sendChat = () => {
    const lastCell = this.items.at(-1);

    if (this.alignNewMessage === "start") {
      this.messageWasAdded = true;
      this.#cellHasToReserveSpace ??= new Set();
      this.#cellHasToReserveSpace.add(lastCell.id);
      this.#cellAlignedAtTheStartId = lastCell.id;
    }

    this.callbacks?.sendChatToLLM(this.items);
  };

  #sendMessage = async () => {
    if (
      !this.#editRef.value ||
      this.disabled ||
      this.loadingState === "initial" ||
      this.loadingState === "loading" ||
      this.generatingResponse ||
      this.uploadingImagesToTheServer > 0
    ) {
      return;
    }

    // Message without resources
    if (!this.imageUpload || this.imagesToUpload.length === 0) {
      const userMessageToAdd: ChatMessageByRole<"user"> = {
        id: `${new Date().getTime()}`,
        role: "user",
        content: this.#editRef.value
      };

      if (!(await this.#chatMessageCanBeSent(userMessageToAdd))) {
        return;
      }

      await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);
      this.#sendChat();

      // Queue a new re-render
      forceUpdate(this);
      return;
    }

    this.uploadingImagesToTheServer = this.imagesToUpload.length;

    const userContent: ChatContentImages = [
      { type: "text", text: this.#editRef.value }
    ] as ChatContentImages;

    // TODO: See how we can validate the sendChat callback
    this.imagesToUpload.forEach((imageToUpload, index) => {
      // Add the image with empty src, since it's not in the server yet
      userContent.push({
        type: "image_url",
        image_url: { url: "" }
      });

      // Upload the image to the server asynchronously
      this.callbacks
        ?.uploadImage(imageToUpload.file)
        .then(imageSrc => {
          userContent[index + 1] = {
            type: "image_url",
            image_url: { url: imageSrc }
          };

          // Queue a new re-render
          this.uploadingImagesToTheServer--;

          if (this.uploadingImagesToTheServer === 0) {
            this.#sendChat();
          }
        })
        .catch(() => {
          // console.log("Reject...", reason);
          // TODO: Error uploading the image

          this.uploadingImagesToTheServer--;

          if (this.uploadingImagesToTheServer === 0) {
            this.#sendChat();
          }
        });
    });

    const userMessageToAdd: ChatMessageByRole<"user"> = {
      id: `${new Date().getTime()}`,
      role: "user",
      content: userContent
    };
    await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);

    // Free the memory
    this.imagesToUpload = [];
  };

  #handleStopGenerating = (event: MouseEvent) => {
    event.stopPropagation();

    this.callbacks?.stopGeneratingAnswer!();
  };

  // #handleFilesChanged = (event: ImagePickerCustomEvent<FileList | null>) => {
  //   this.imagesToUpload =
  //     event.detail === null
  //       ? []
  //       : [...event.detail].map(imageFile => ({
  //           file: imageFile,
  //           src: URL.createObjectURL(imageFile)
  //         }));
  // };

  #removeUploadedImage = (index: number) => (event: MouseEvent) => {
    const buttonToRemove = event.target as HTMLButtonElement;
    const nextFocusedButton = (buttonToRemove.nextElementSibling ??
      buttonToRemove.previousElementSibling) as HTMLButtonElement | null;

    // Focus the next item to improve accessibility
    nextFocusedButton?.focus();

    // TODO: Remove the file from the image-picker reference
    removeElement(this.imagesToUpload, index);
    forceUpdate(this);
  };

  #removeImageResource = (imageFile: string) => () => {
    URL.revokeObjectURL(imageFile); // Free the memory
  };

  #alignAtTheStartWhenRendered = () =>
    this.#smartGridRef.scrollEndContentToTop(this.#cellAlignedAtTheStartId);

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
          this.messageWasAdded ? this.autoScroll : "at-scroll-end"
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

  #renderItem = (message: ChatMessage) => {
    if (message.role === "system") {
      return "";
    }

    const parts = tokenMap({
      [`message ${message.role}`]: true,
      [message.parts]: !!message.parts,
      [(message as ChatMessageByRole<"assistant">).status]:
        message.role === "assistant"
    });

    const renderedContent = this.renderItem
      ? this.renderItem(message)
      : defaultChatRender(this.el)(message);

    const messageIsCellAlignedAtTheStart =
      message.id === this.#cellAlignedAtTheStartId;

    const hasToRenderAnExtraDiv =
      this.#cellHasToReserveSpace !== undefined &&
      this.#cellHasToReserveSpace.has(message.id);

    return (
      <ch-smart-grid-cell
        key={message.id}
        cellId={message.id}
        part={hasToRenderAnExtraDiv ? undefined : parts}
        smartGridRef={this.#smartGridRef}
        onSmartCellDidLoad={
          messageIsCellAlignedAtTheStart
            ? this.#alignAtTheStartWhenRendered
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
          // TODO: Improve this slot name
          <div class="loading-chat" slot="empty-chat"></div>
        ) : (
          this.#renderChatOrEmpty()
        )}

        {canShowAdditionalContent && <slot name="additional-content" />}

        <div
          class={{
            "send-container": true,
            "send-container--file-uploading": this.imageUpload
          }}
          part="send-container"
        >
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
          {/* 
          {this.imageUpload && (
            <gx-eai-image-picker
              part="image-picker"
              translations={this.translations}
              onFilesChanged={this.#handleFilesChanged}
            ></gx-eai-image-picker>
          )} */}

          <div class="send-input-wrapper" part="send-input-wrapper">
            {this.imagesToUpload.length > 0 && (
              <div class="images-to-upload" part="images-to-upload">
                {this.imagesToUpload.map((imageFile, index) => (
                  <button
                    key={imageFile.src}
                    aria-label={accessibleName.removeUploadedImage}
                    title={accessibleName.removeUploadedImage}
                    part="remove-image-to-upload-button"
                    type="button"
                    onClick={this.#removeUploadedImage(index)}
                  >
                    <img
                      part="image-to-upload"
                      aria-hidden="true"
                      src={imageFile.src}
                      alt=""
                      loading="lazy"
                      onLoad={this.#removeImageResource(imageFile.src)}
                    ></img>
                  </button>
                ))}
              </div>
            )}

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

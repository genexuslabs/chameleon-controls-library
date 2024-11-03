import {
  Component,
  Element,
  Host,
  Method,
  Prop,
  State,
  forceUpdate,
  h
} from "@stencil/core";
import {
  ChVirtualScrollerCustomEvent,
  VirtualScrollVirtualItems
} from "../../components";
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
  #editRef!: HTMLChEditElement;
  #scrollRef: HTMLChSmartGridElement | undefined;
  #virtualScrollRef: HTMLChVirtualScrollerElement | undefined;

  @Element() el!: HTMLChChatElement;

  @State() imagesToUpload: { src: string; file: File }[] = [];
  @State() uploadingImagesToTheServer = 0;
  @State() virtualItems: ChatMessage[] = [];

  /**
   * Specifies the callbacks required in the control.
   */
  @Prop() readonly callbacks?: ChatInternalCallbacks | undefined;

  /**
   * This property allows us to implement custom rendering for the code blocks.
   */
  @Prop() readonly renderCode?: MarkdownViewerCodeRender;

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

  /**
   * Specifies the items that the chat will display.
   */
  @Prop({ mutable: true }) items: ChatMessage[] = [];

  /**
   * Specifies if the chat is waiting for the data to be loaded.
   */
  @Prop({ mutable: true }) loadingState?: SmartGridDataState = "initial";

  /**
   * Specifies the theme to be used for rendering the markdown.
   * If `null`, no theme will be applied.
   */
  @Prop() readonly markdownTheme?: string | null = "ch-markdown-viewer";

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
    this.#pushMessage(message);
  }

  /**
   * Focus the chat input
   */
  @Method()
  async focusChatInput() {
    if (this.#editRef) {
      this.#editRef.click();
    }
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
    if (this.#scrollRef) {
      this.#scrollRef.scrollTop = this.#scrollRef.scrollHeight;
    }

    await this.#pushMessage(userMessage);
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

      await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);
      this.callbacks?.sendChatToLLM(this.items);

      // Queue a new re-render
      forceUpdate(this);
      return;
    }

    this.uploadingImagesToTheServer = this.imagesToUpload.length;

    const userContent: ChatContentImages = [
      { type: "text", text: this.#editRef.value }
    ] as ChatContentImages;

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
            this.callbacks?.sendChatToLLM(this.items);
          }
        })
        .catch(() => {
          // console.log("Reject...", reason);
          // TODO: Error uploading the image

          this.uploadingImagesToTheServer--;

          if (this.uploadingImagesToTheServer === 0) {
            this.callbacks?.sendChatToLLM(this.items);
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
      buttonToRemove.previousElementSibling) as HTMLButtonElement;

    // Focus the next item to improve accessibility
    if (nextFocusedButton) {
      nextFocusedButton.focus();
    }

    // TODO: Remove the file from the image-picker reference
    removeElement(this.imagesToUpload, index);
    forceUpdate(this);
  };

  #removeImageResource = (imageFile: string) => () => {
    URL.revokeObjectURL(imageFile); // Free the memory
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
        dataProvider
        loadingState={
          this.virtualItems.length === 0 ? "initial" : this.loadingState
        }
        inverseLoading
        itemsCount={this.virtualItems.length}
        onInfiniteThresholdReached={this.#loadMoreItems}
        ref={el => (this.#scrollRef = el as HTMLChSmartGridElement)}
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

  #renderItem = (messageModel: ChatMessage) =>
    messageModel.role !== "system" && (
      <ch-smart-grid-cell
        key={messageModel.id}
        cellId={messageModel.id}
        part={tokenMap({
          [`message ${messageModel.role}`]: true,
          [messageModel.parts]: !!messageModel.parts,
          [(messageModel as ChatMessageByRole<"assistant">).status]:
            messageModel.role === "assistant"
        })}
      >
        {this.renderItem
          ? this.renderItem(messageModel)
          : defaultChatRender(this.el)(messageModel)}
      </ch-smart-grid-cell>
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
  }

  render() {
    const accessibleName = this.translations.accessibleName;

    return (
      <Host>
        {this.loadingState === "initial" ? (
          <div class="loading-chat" slot="empty-chat"></div>
        ) : (
          this.#renderChatOrEmpty()
        )}

        <div
          class={{
            "send-container": true,
            "send-container--file-uploading": this.imageUpload
          }}
          part="send-container"
        >
          {this.generatingResponse && this.callbacks?.stopGeneratingAnswer && (
            <button
              class="stop-generating-answer-button"
              part="stop-generating-answer-button"
              type="button"
              onClick={this.#handleStopGenerating}
            >
              {accessibleName.stopGeneratingAnswerButton}
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
              part="send-input"
              accessibleName={accessibleName.sendInput}
              autoGrow
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

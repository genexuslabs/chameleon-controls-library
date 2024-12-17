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
import {
  ChFilePickerCustomEvent,
  ChVirtualScrollerCustomEvent,
  DropdownModel,
  VirtualScrollVirtualItems
} from "../../components";
import {
  ChatContentFiles,
  ChatInternalCallbacks,
  ChatInternalFileToUpload,
  ChatMessage,
  ChatMessageByRole,
  ChatMessageByRoleNoId
} from "./types";
import { SmartGridDataState } from "../smart-grid/internal/infinite-scroll/types";
import { removeIndex } from "../../common/array";
import { ChatTranslations } from "./translations";
import { defaultChatRender } from "./default-chat-render";
import { adoptCommonThemes } from "../../common/theme";
import { MarkdownViewerCodeRender } from "../markdown-viewer/parsers/types";
import { tokenMap } from "../../common/utils";
import {
  MimeTypeFile,
  MimeTypeFormatMap,
  MimeTypeImage,
  MimeTypes,
  MimeTypeVideo
} from "../../common/mime-type/mime-types";
import { getMimeTypeFormat } from "../../common/mime-type/mime-type-mapping";
import { getMessageContent } from "./utils";
import { handleFilesChanged } from "./upload-files-utils";

const ENTER_KEY = "Enter";

const mimeTypeFormatToIconPathMapping = {
  audio: "./assets/icons/audio.svg",
  file: "./assets/icons/projects.svg",
  image: "./assets/icons/image-gallery.svg",
  video: "./assets/icons/video.svg"
} as const satisfies { [key in keyof MimeTypeFormatMap]: string };

/**
 * TODO: Add description
 */
@Component({
  tag: "ch-chat",
  styleUrl: "chat.scss",
  shadow: true
})
export class ChChat {
  #errorWhenUploadingImages = false;

  // Allocated at runtime to save memory
  #fileFormatToUpload:
    | Map<
        keyof MimeTypeFormatMap,
        MimeTypeFile[] | MimeTypeImage[] | MimeTypeVideo[]
      >
    | undefined;
  #fileFormatCount: number = 0;
  #fileFormatPart: keyof MimeTypeFormatMap | undefined;
  #pickFileFormatDropdown: DropdownModel | undefined;

  // Refs
  #editRef!: HTMLChEditElement;
  #filerPickerRef: HTMLChFilePickerElement | undefined;
  #scrollRef: HTMLChSmartGridElement | undefined;
  #virtualScrollRef: HTMLChVirtualScrollerElement | undefined;

  @Element() el!: HTMLChChatElement;

  @State() filesToUpload: ChatInternalFileToUpload[] = [];
  @State() fileFormatSelected: keyof MimeTypeFormatMap | undefined;
  @State() remainingFilesToUpload = 0;
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
   * Specifies if the control can render a button to load images from the file
   * system.
   */
  @Prop() readonly upload: boolean = false;

  /**
   * Specifies the maximum number of file that can be uploaded at a time.
   */
  @Prop() readonly uploadMaxFileCount?: number = 10;

  /**
   * Specifies the maximum file size to for each file to upload.
   * Measure in bytes
   */
  @Prop() readonly uploadMaxFileSize?: number | undefined;

  /**
   * Specifies the supported mime types to upload. Only works if upload = true
   */
  @Prop() readonly supportedMimeTypes?: MimeTypes[] = [];
  @Watch("supportedMimeTypes")
  supportedMimeTypesChanged(newMimeTypes?: MimeTypes[]) {
    this.#setSupportedFileFormats(newMimeTypes);
  }

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
      await this.#virtualScrollRef.addItems("end", [message]);
    }
  };

  #setSupportedFileFormats = (supportedMimeTypes: MimeTypes[] | undefined) => {
    this.#fileFormatCount = 0;
    this.fileFormatSelected = undefined;

    if (!this.upload || supportedMimeTypes == null) {
      this.#fileFormatToUpload = undefined;
      return;
    }

    this.#fileFormatToUpload = new Map();

    supportedMimeTypes.forEach(mimeType => {
      const mimeTypeFormat = getMimeTypeFormat(mimeType);

      // The file format already exists for the mime type
      if (this.#fileFormatToUpload!.has(mimeTypeFormat)) {
        const mimeTypesInFormat =
          this.#fileFormatToUpload!.get(mimeTypeFormat)!;
        (mimeTypesInFormat as any[]).push(mimeType);
      }
      // Add the file format
      else {
        this.#fileFormatToUpload!.set(mimeTypeFormat, [mimeType] as any[]);
        this.#fileFormatCount++;
      }
    });

    if (this.#fileFormatCount > 1) {
      this.#fileFormatPart = undefined;
      this.#pickFileFormatDropdown = [];

      if (this.#fileFormatToUpload.has("file")) {
        this.#addFileFormatToDropdown("file");
      }

      if (this.#fileFormatToUpload.has("image")) {
        this.#addFileFormatToDropdown("image");
      }

      if (this.#fileFormatToUpload.has("audio")) {
        this.#addFileFormatToDropdown("audio");
      }

      if (this.#fileFormatToUpload.has("video")) {
        this.#addFileFormatToDropdown("video");
      }
    } else {
      this.#fileFormatPart = [...this.#fileFormatToUpload.keys()][0];
      this.#pickFileFormatDropdown = undefined;
    }
  };

  #addFileFormatToDropdown = (mimeTypeFormat: keyof MimeTypeFormatMap) => {
    this.#pickFileFormatDropdown!.push({
      id: mimeTypeFormat,
      caption: this.translations.text[mimeTypeFormat],
      startImgSrc: mimeTypeFormatToIconPathMapping[mimeTypeFormat],
      startImgType: "mask"
    });
  };

  #updateMessage = (
    messageIndex: number,
    message: ChatMessageByRoleNoId<"system" | "assistant">,
    mode: "concat" | "replace"
  ) => {
    if (mode === "concat") {
      // Temporal store for the new message
      const newMessageContent =
        getMessageContent(
          this.items[messageIndex] as ChatMessageByRole<"system" | "assistant">
        ) + getMessageContent(message);

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
      this.remainingFilesToUpload > 0
    ) {
      return;
    }

    const messageId = `${new Date().getTime()}`;

    // Message without resources
    if (!this.upload || this.filesToUpload.length === 0) {
      const userMessageToAdd: ChatMessageByRole<"user"> = {
        id: messageId,
        role: "user",
        content: this.#editRef.value
      };

      await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);
      this.callbacks?.sendChat(this.items);

      // Queue a new re-render
      forceUpdate(this);
      return;
    }

    this.remainingFilesToUpload = this.filesToUpload.length;

    const userContent: ChatContentFiles = {
      message: this.#editRef.value,
      files: []
    };

    this.filesToUpload.forEach((fileToUpload, index) => {
      // Add the file with empty src, since it's not in the server yet
      userContent.files!.push({
        mimeType: fileToUpload.file.type as MimeTypes,
        caption: fileToUpload.caption,
        url: ""
      });

      // Upload the file to the server asynchronously
      this.callbacks
        .uploadFile(fileToUpload.file)
        .then(uploadedFile => {
          if (!this.#errorWhenUploadingImages) {
            userContent.files![index].caption = uploadedFile.caption;
            userContent.files![index].url = uploadedFile.url;
          }

          this.#sendChatAfterImageUploadingIsCompleted();
        })
        .catch((errorMessage: any) => {
          // .catch((errorMessage: GxEAIErrorMessage) => {
          // First time that an images errors. Replace the user message with
          // the error message
          if (!this.#errorWhenUploadingImages) {
            this.items[this.items.length - 1] = {
              id: messageId,
              role: "error",
              content: errorMessage
            };
          }

          this.#errorWhenUploadingImages = true;
          this.#sendChatAfterImageUploadingIsCompleted();
        });
    });

    const userMessageToAdd: ChatMessageByRole<"user"> = {
      id: messageId,
      role: "user",
      content: userContent
    };
    await this.#addUserMessageToRecordAndFocusInput(userMessageToAdd);

    // Free the memory
    this.filesToUpload = [];
  };

  #sendChatAfterImageUploadingIsCompleted = () => {
    // Queue a new re-render
    this.remainingFilesToUpload--;

    if (this.remainingFilesToUpload === 0) {
      if (!this.#errorWhenUploadingImages) {
        this.callbacks?.sendChat(this.items);
      }
      this.#errorWhenUploadingImages = false;
    }
  };

  #handleStopGenerating = (event: MouseEvent) => {
    event.stopPropagation();

    this.callbacks?.stopGeneratingAnswer!();
  };

  #handleDropdownItemClick = (_: UIEvent, __: string, itemId: string) => {
    this.fileFormatSelected = itemId as keyof MimeTypeFormatMap;

    requestAnimationFrame(() => this.#filerPickerRef?.click());
  };

  #handleFilesChanged = (event: ChFilePickerCustomEvent<FileList | null>) =>
    handleFilesChanged(
      this.filesToUpload,
      this.uploadMaxFileSize,
      this.uploadMaxFileCount,
      this.callbacks?.showMaxFileCountForUploadError,
      this.callbacks?.showMaxFileSizeForUploadError,
      this,
      event
    );

  #removeUploadedFile = (index: number) => (event: MouseEvent) => {
    const buttonToRemove = event.target as HTMLButtonElement;
    const nextFocusedButton = (buttonToRemove.nextElementSibling ??
      buttonToRemove.previousElementSibling) as HTMLButtonElement;

    // Focus the next item to improve accessibility
    if (nextFocusedButton) {
      nextFocusedButton.focus();
    }

    // TODO: Remove the file from the image-picker reference
    removeIndex(this.filesToUpload, index);

    // There is no need to filter the file type to select, since there are no
    // files selected
    if (this.filesToUpload.length === 0) {
      this.fileFormatSelected = undefined;
    }

    forceUpdate(this);
  };

  #getRemoveUploadedFileAccessibleName = (
    mimeTypeFormat: keyof MimeTypeFormatMap
  ) => {
    const accessibleName = this.translations.accessibleName;

    if (mimeTypeFormat === "image") {
      return accessibleName.removeUploadedImage;
    }

    if (mimeTypeFormat === "file") {
      return accessibleName.removeUploadedFile;
    }

    if (mimeTypeFormat === "audio") {
      return accessibleName.removeUploadedAudio;
    }

    return accessibleName.removeUploadedVideo;
  };

  #removeImageResource = (fileObjectURL: string) => () => {
    URL.revokeObjectURL(fileObjectURL); // Free the memory
  };

  #getImagePickerParts = () => {
    if (this.#fileFormatCount === 1) {
      return `${this.#fileFormatPart}-picker picker`;
    }

    if (
      this.fileFormatSelected !== undefined &&
      this.filesToUpload.length > 0
    ) {
      return `${this.fileFormatSelected}-picker picker`;
    }

    return undefined;
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

    this.callbacks
      .loadMoreItems(this.items)
      .then(result => {
        if (result.items.length > 0) {
          this.#virtualScrollRef.addItems("start", result.items);
        }
        this.loadingState = result.morePages
          ? "more-data-to-fetch"
          : "all-records-loaded";
      })
      .catch(() => {
        this.loadingState = "more-data-to-fetch";
      });
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
            "send-container--file-uploading": this.upload
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

          {this.upload &&
            this.#fileFormatCount !== 0 && [
              this.#fileFormatCount > 1 && this.filesToUpload.length === 0 && (
                <ch-dropdown-render
                  part="dropdown-picker"
                  buttonAccessibleName={accessibleName.filePicker}
                  itemClickCallback={
                    !this.disabled ? this.#handleDropdownItemClick : undefined
                  }
                  model={this.#pickFileFormatDropdown}
                  position="InsideStart_OutsideStart"
                ></ch-dropdown-render>
              ),

              <ch-file-picker
                part={this.#getImagePickerParts()}
                style={
                  this.#fileFormatCount > 1 && this.filesToUpload.length === 0
                    ? { display: "none" }
                    : undefined
                }
                acceptFilter={this.fileFormatSelected}
                fileFormat={this.#fileFormatPart}
                supportedMimeTypes={this.supportedMimeTypes!}
                translations={this.translations}
                uploadMaxFileCount={this.uploadMaxFileCount}
                onFilesChanged={this.#handleFilesChanged}
                ref={el => (this.#filerPickerRef = el)}
              ></ch-file-picker>
            ]}

          {/* 
          {this.imageUpload && (
            <gx-eai-image-picker
              part="image-picker"
              translations={this.translations}
              onFilesChanged={this.#handleFilesChanged}
            ></gx-eai-image-picker>
          )} */}

          <div class="send-input-wrapper" part="send-input-wrapper">
            {this.filesToUpload.length > 0 && (
              <div class="images-to-upload" part="images-to-upload">
                {this.filesToUpload.map((file, index) => (
                  <button
                    key={file.key}
                    aria-label={this.#getRemoveUploadedFileAccessibleName(
                      file.mimeTypeFormat
                    )}
                    title={this.#getRemoveUploadedFileAccessibleName(
                      file.mimeTypeFormat
                    )}
                    class={
                      file.mimeTypeFormat !== "image"
                        ? "remove-file-to-upload-button"
                        : undefined
                    }
                    part={
                      file.mimeTypeFormat === "image"
                        ? "remove-image-to-upload-button"
                        : `remove-file-to-upload-button ${file.mimeTypeFormat}`
                    }
                    type="button"
                    onClick={this.#removeUploadedFile(index)}
                  >
                    {file.src ? (
                      <img
                        part="image-to-upload"
                        src={file.src}
                        alt={file.caption}
                        loading="lazy"
                        onLoad={this.#removeImageResource(file.src)}
                      ></img>
                    ) : (
                      [
                        <span
                          class="file-to-upload__caption"
                          part="file-to-upload__caption"
                        >
                          {file.caption}
                        </span>,
                        <span
                          class="file-to-upload__extension"
                          part="file-to-upload__extension"
                        >
                          {file.extension}
                        </span>
                      ]
                    )}
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

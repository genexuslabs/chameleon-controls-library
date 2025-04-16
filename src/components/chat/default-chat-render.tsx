import { h } from "@stencil/core";
import { ChatContentFiles, ChatContentImage, ChatMessageByRole } from "./types";
import { ChatTranslations } from "./translations";
import { copyToTheClipboard } from "../../common/utils";
import {
  MarkdownViewerCodeRender,
  MarkdownViewerCodeRenderOptions
} from "../markdown-viewer/parsers/types";

const copy = (text: string) => () => copyToTheClipboard(text);

const getAriaBusyValue = (
  status?: "complete" | "waiting" | "streaming" | undefined
): "true" | "false" =>
  status === "complete" || status === undefined ? "false" : "true";

const getAssistantParts = (
  status?: "complete" | "waiting" | "streaming" | undefined
) => (status ? `assistant-content ${status}` : "assistant-content");

const downloadCode =
  (
    options: MarkdownViewerCodeRenderOptions,
    hyperlinkRef: { anchor: HTMLAnchorElement }
  ) =>
  () => {
    // Create the blob variable on the click event
    const blob = new Blob([options.plainText], { type: "text/plain" });

    // Create blob object
    const url = window.URL.createObjectURL(blob);

    hyperlinkRef.anchor.href = url;
    hyperlinkRef.anchor.download = "Answer.txt";
    hyperlinkRef.anchor.click(); // Download the blob

    // Remove the blob object to free the memory
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    });
  };

const defaultCodeRender =
  (
    chatRef: HTMLChChatElement,
    translations: ChatTranslations
  ): MarkdownViewerCodeRender =>
  (options: MarkdownViewerCodeRenderOptions): any =>
    (
      <div>
        <div class="code-block__header" part="code-block__header">
          {options.language}

          <div
            class="code-block__header-actions"
            part="code-block__header-actions"
          >
            <button
              aria-label={
                chatRef.isMobile ? translations.text.copyCodeButton : undefined
              }
              class="code-block__copy-code-button"
              part="code-block__copy-code-button"
              type="button"
              onClick={copy(options.plainText)}
            >
              {!chatRef.isMobile && translations.text.copyCodeButton}
            </button>

            {chatRef.hyperlinkToDownloadFile && (
              <button
                aria-label={translations.accessibleName.downloadCodeButton}
                title={translations.accessibleName.downloadCodeButton}
                class="code-block__download-code-button"
                part="code-block__download-code-button"
                onClick={downloadCode(options, chatRef.hyperlinkToDownloadFile)}
              ></button>
            )}
          </div>
        </div>

        <ch-code
          class="code-block__content"
          language={options.language}
          lastNestedChildClass={options.lastNestedChildClass}
          showIndicator={options.showIndicator}
          value={options.plainText}
        ></ch-code>
      </div>
    );

const renderUserMessage = (userMessage: ChatMessageByRole<"user">) => {
  return typeof userMessage.content === "string" ? (
    userMessage.content
  ) : (
    <div class="message-with-images" part="message-with-images">
      <span part="message-with-images__text">
        {userMessage.content[0].text}
      </span>

      {(userMessage.content.slice(1) as ChatContentImage[]).map(
        imageContent => (
          <img
            aria-hidden="true"
            class={!imageContent.image_url.url ? "file-skeleton" : undefined}
            part={
              imageContent.image_url.url
                ? "message-with-images__image"
                : "message-with-images__image file-skeleton"
            }
            src={imageContent.image_url.url}
            alt=""
            loading="lazy"
          ></img>
        )
      )}
    </div>
  );
};

const renderDefaultAssistantMessage = (
  chatRef: HTMLChChatElement,
  messageModel: ChatMessageByRole<"assistant">
) => {
  const messageContent =
    typeof messageModel.content === "string"
      ? messageModel.content
      : messageModel.content.message;

  const files = (messageModel.content as ChatContentFiles).files ?? null;

  const translations = chatRef.translations;

  return (
    <div
      // Improve accessibility by announcing live changes
      aria-live="polite"
      // Wait until all changes are made to prevents assistive
      // technologies from announcing changes before updates are done
      aria-busy={getAriaBusyValue(messageModel.status)}
      class="assistant-content"
      part={getAssistantParts(messageModel.status)}
    >
      {messageModel.status === "waiting" ? (
        <div class="assistant-loading" part="assistant-loading">
          {/* {spinner()} */}
          {messageContent}
        </div>
      ) : (
        [
          <ch-markdown-viewer
            renderCode={
              chatRef.renderCode ?? defaultCodeRender(chatRef, translations)
            }
            showIndicator={messageModel.status === "streaming"}
            theme={chatRef.markdownTheme}
            value={messageContent}
          ></ch-markdown-viewer>,

          files && (
            <div class="assistant-files" part="assistant-files">
              {translations.text.sourceFiles}

              {files.map(file => (
                <a href={file.url} target="_blank" part="assistant-file">
                  {file.caption}
                </a>
              ))}
            </div>
          )
        ]
      )}

      {(messageModel.status === "complete" || !messageModel.status) && (
        <button
          aria-label={translations.accessibleName.copyResponseButton}
          title={translations.accessibleName.copyResponseButton}
          part="copy-response-button"
          type="button"
          onClick={copy(messageContent)}
        ></button>
      )}
    </div>
  );
};

const renderErrorMessage = (
  chatRef: HTMLChChatElement,
  messageModel: ChatMessageByRole<"error">
) => (
  <ch-markdown-viewer
    renderCode={
      chatRef.renderCode ?? defaultCodeRender(chatRef, chatRef.translations)
    }
    theme={chatRef.markdownTheme}
    value={messageModel.content}
  ></ch-markdown-viewer>
);

export const defaultChatRender =
  (chatRef: HTMLChChatElement) =>
  (messageModel: ChatMessageByRole<"assistant" | "error" | "user">) => {
    if (messageModel.role === "assistant") {
      return renderDefaultAssistantMessage(chatRef, messageModel);
    }

    return messageModel.role === "user"
      ? renderUserMessage(messageModel)
      : renderErrorMessage(chatRef, messageModel);
  };

import { h } from "@stencil/core";
import {
  ChatAssistantContentFiles,
  ChatContentImage,
  ChatMessage,
  ChatMessageByRole
} from "./types";
import {
  MarkdownCodeRender,
  MarkdownCodeRenderOptions
} from "../markdown/parsers/types";
import { ChatTranslations } from "./translations";
import { copyToTheClipboard } from "../../common/utils";

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
    options: MarkdownCodeRenderOptions,
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
    isMobile: boolean,
    copyCodeButtonText: string,
    downloadCodeButtonAccessibleName: string,
    hyperlinkToDownloadFile?: { anchor: HTMLAnchorElement }
  ): MarkdownCodeRender =>
  (options: MarkdownCodeRenderOptions): any =>
    (
      <pre>
        <code class={`hljs language-${options.language}`}>
          <div class="code-block__header" part="code-block__header">
            {options.language}

            <div
              class="code-block__header-actions"
              part="code-block__header-actions"
            >
              <button
                aria-label={isMobile ? copyCodeButtonText : undefined}
                class="code-block__copy-code-button"
                part="code-block__copy-code-button"
                type="button"
                onClick={copy(options.plainText)}
              >
                {!isMobile && copyCodeButtonText}
              </button>

              {hyperlinkToDownloadFile && (
                <button
                  aria-label={downloadCodeButtonAccessibleName}
                  title={downloadCodeButtonAccessibleName}
                  class="code-block__download-code-button"
                  part="code-block__download-code-button"
                  onClick={downloadCode(options, hyperlinkToDownloadFile)}
                ></button>
              )}
            </div>
          </div>

          <div
            class={{
              "code-block__content": true,
              "last-nested-child": options.nestedChildIsCodeTag
            }}
          >
            {options.renderedContent}
          </div>
        </code>
      </pre>
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
  translations: ChatTranslations,
  isMobile: boolean,
  messageModel: ChatMessageByRole<"assistant">,
  hyperlinkToDownloadFile?: { anchor: HTMLAnchorElement }
) => {
  const messageContent =
    typeof messageModel.content === "string"
      ? messageModel.content
      : messageModel.content.message;

  const files =
    (messageModel.content as ChatAssistantContentFiles).files ?? null;

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
          <ch-markdown
            class={`markdown ${messageModel.status}`}
            renderCode={defaultCodeRender(
              isMobile,
              translations.text.copyCodeButton,
              translations.accessibleName.downloadCodeButton,
              hyperlinkToDownloadFile
            )}
            value={messageContent}
          ></ch-markdown>,

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

export const defaultChatRender =
  (
    translations: ChatTranslations,
    isMobile: boolean,
    hyperlinkToDownloadFile?: { anchor: HTMLAnchorElement }
  ) =>
  (messageModel: ChatMessage) =>
    (messageModel.role === "assistant" || messageModel.role === "user") && (
      <ch-smart-grid-cell
        key={messageModel.id}
        cellId={messageModel.id}
        part={`message ${messageModel.role}`}
      >
        {messageModel.role === "assistant"
          ? renderDefaultAssistantMessage(
              translations,
              isMobile,
              messageModel,
              hyperlinkToDownloadFile
            )
          : renderUserMessage(messageModel)}
      </ch-smart-grid-cell>
    );

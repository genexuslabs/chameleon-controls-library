import { h } from "@stencil/core";
import {
  ChatContentFile,
  ChatContentFiles,
  ChatMessageAssistantStatus,
  ChatMessageByRole
} from "./types";
import { copyToTheClipboard } from "../../common/utils";
import {
  getFileExtension,
  getMimeTypeFormat
} from "../../common/mime-type/mime-type-mapping";
import { defaultChatCodeRender } from "./default-code-render";

const copy = (text: string) => () => copyToTheClipboard(text);

const getAriaBusyValue = (
  status?: ChatMessageAssistantStatus | undefined
): "true" | "false" =>
  status === "complete" || status === undefined ? "false" : "true";

const getAssistantParts = (status?: ChatMessageAssistantStatus | undefined) =>
  status ? `assistant-content ${status}` : "assistant-content";

const userContentRender = {
  audio: (file: ChatContentFile) =>
    file.url ? (
      <audio part="message-with-files__audio" src={file.url} controls></audio>
    ) : (
      <div
        class="skeleton"
        part="message-with-files__audio skeleton audio"
      ></div>
    ),

  video: (file: ChatContentFile) =>
    file.url ? (
      <video part="message-with-files__video" src={file.url} controls></video>
    ) : (
      <div
        class="skeleton"
        part="message-with-files__video skeleton video"
      ></div>
    ),

  image: (file: ChatContentFile) => (
    <img
      class={!file.url ? "skeleton" : undefined}
      part={
        file.url
          ? "message-with-files__image image"
          : "message-with-files__image skeleton image"
      }
      src={file.url}
      alt={file.url ? file.caption ?? "" : ""}
      loading="lazy"
    ></img>
  ),

  file: (file: ChatContentFile) => (
    <a
      role={!file.url ? "link" : undefined}
      aria-disabled={!file.url ? "true" : undefined}
      class={file.url ? "file-render" : "file-render skeleton"}
      part={
        file.url
          ? "message-with-files__file"
          : "message-with-files__file skeleton"
      }
      href={file.url || undefined}
      target="_blank"
    >
      <span class="file-to-upload__caption" part="file-to-upload__caption">
        {file.caption}
      </span>

      <span class="file-to-upload__extension" part="file-to-upload__extension">
        {getFileExtension(file.caption!, file.mimeType)}
      </span>
    </a>
  )
};

const renderUserMessage = (userMessage: ChatMessageByRole<"user">) =>
  typeof userMessage.content === "string" ? (
    userMessage.content
  ) : (
    <div class="message-with-images" part="message-with-images">
      {userMessage.content.message && (
        <span part="message-with-images__text">
          {userMessage.content.message}
        </span>
      )}

      {userMessage.content.files?.map(file =>
        userContentRender[getMimeTypeFormat(file.mimeType)](file)
      )}
    </div>
  );

const markdownRender = (
  chatRef: HTMLChChatElement,
  content: string,
  showIndicator: boolean,
  callbacks?: {
    copyCode?: (content: string) => void;
    downloadCode?: (plainCode: string) => void;
  }
) => (
  <ch-markdown-viewer
    renderCode={
      chatRef.renderCode ??
      defaultChatCodeRender(chatRef, showIndicator, callbacks)
    }
    showIndicator={showIndicator}
    theme={chatRef.markdownTheme}
    value={content}
  ></ch-markdown-viewer>
);

const renderDefaultAssistantMessage = (
  chatRef: HTMLChChatElement,
  messageModel: ChatMessageByRole<"assistant">,
  callbacks?: {
    copyCode?: (content: string) => void;
    downloadCode?: (plainCode: string) => void;
  }
) => {
  const messageContent =
    typeof messageModel.content === "string"
      ? messageModel.content
      : messageModel.content.message;

  const files = (messageModel.content as ChatContentFiles).files ?? null;

  const translations = chatRef.translations;
  const showIndicator = messageModel.status === "streaming";

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
          markdownRender(chatRef, messageContent, showIndicator, callbacks),

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
) => markdownRender(chatRef, messageModel.content, false);

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

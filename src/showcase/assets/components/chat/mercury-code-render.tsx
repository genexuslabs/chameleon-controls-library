import { h } from "@stencil/core";
import {
  MarkdownViewerCodeRender,
  MarkdownViewerCodeRenderOptions
} from "../../../../components/markdown-viewer/parsers/types";
import { ChatMessageByRole } from "../../../../components/chat/types";

const copy = (text: string) => () => navigator.clipboard.writeText(text);

export const mercuryCodeRender =
  (copyButtonAccessibleName: string) =>
  (options: MarkdownViewerCodeRenderOptions): MarkdownViewerCodeRender =>
    (
      <div class="code-block-container">
        <div class="code-block-header">
          <button
            aria-label={copyButtonAccessibleName}
            title={copyButtonAccessibleName}
            class="button-copy-code"
            type="button"
            onClick={copy(options.plainText)}
          ></button>
        </div>
        <ch-code
          language={options.language}
          lastNestedChildClass={options.lastNestedChildClass}
          value={options.plainText}
          showIndicator={options.showIndicator}
        ></ch-code>
      </div>
    );

export const mercuryChatMessageRender =
  (theme: string) =>
  (messageModel: ChatMessageByRole<"assistant" | "error" | "user">) =>
    messageModel.role === "assistant" && messageModel.status === "waiting"
      ? [
          <span part="message__processing">Processing request</span>,

          <div class="processing-animation" part="processing-animation"></div>
        ]
      : [
          <span part={`message__role ${messageModel.role}`}>
            {messageModel.role === "user" ? "You" : "GeneXus Code Fixer"}
          </span>,
          <time dateTime={messageModel.metadata} part="message__time">
            {messageModel.metadata}
          </time>,

          messageModel.role === "user" ? (
            <span part="message__content user">{messageModel.content}</span>
          ) : (
            <ch-markdown-viewer
              part={
                messageModel.role === "assistant" &&
                (messageModel.status === "complete" || !messageModel.status) &&
                !messageModel.parts
                  ? `message__content no-error`
                  : "message__content"
              }
              theme={theme}
              showIndicator={
                messageModel.role === "assistant" &&
                messageModel.status === "streaming"
              }
              // renderCode={mercuryCodeRender("Copy code")}
              value={messageModel.content as string}
            ></ch-markdown-viewer>
          )
        ];

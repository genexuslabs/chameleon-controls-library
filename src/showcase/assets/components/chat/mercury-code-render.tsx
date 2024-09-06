import { h } from "@stencil/core";
import {
  MarkdownViewerCodeRender,
  MarkdownViewerCodeRenderOptions
} from "../../../../components/markdown-viewer/parsers/types";
import { ChatMessageByRole } from "../../../../components";

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
          showIndicator={options.showIndicator}
          value={options.plainText}
        ></ch-code>
      </div>
    );

export const mercuryChatMessageRender =
  (theme: string) =>
  (messageModel: ChatMessageByRole<"assistant" | "error" | "user">) =>
    messageModel.role === "assistant" && messageModel.status === "waiting" ? (
      <span part="message__processing">Processing request</span>
    ) : (
      [
        <span part="message__role">
          {messageModel.role === "user" ? "You" : "GeneXus Code Fixer"}
        </span>,
        <time dateTime={messageModel.metadata} part="message__time">
          {messageModel.metadata}
        </time>,

        messageModel.role === "user" ? (
          <span part="message__content">{messageModel.content}</span>
        ) : (
          <ch-markdown-viewer
            part="message__content"
            theme={theme}
            renderCode={mercuryCodeRender("Copy code")}
            value={messageModel.content as string}
          ></ch-markdown-viewer>
        )
      ]
    );

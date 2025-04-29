import { h } from "@stencil/core";
import type { MarkdownViewerCodeRenderOptions } from "../../markdown-viewer/parsers/types";
import type { ChatCodeBlockRender, ChatInternalCallbacks } from "../types";
import { copy } from "../utils";

const downloadCodeBlockCallback =
  (
    plainText: string,
    language: string,
    downloadCodeBlock: ChatInternalCallbacks["downloadCodeBlock"]
  ) =>
  () =>
    downloadCodeBlock(plainText, language);

export const defaultCodeBlockRender: ChatCodeBlockRender =
  (chatRef: HTMLChChatElement) =>
  (options: MarkdownViewerCodeRenderOptions): any => {
    const { accessibleName, text } = chatRef.translations;

    return (
      <div part="code-block">
        <div class="code-block__header" part="code-block__header">
          {options.language}

          <div
            class="code-block__header-actions"
            part="code-block__header-actions"
          >
            <button
              // aria-label={
              //   chatRef.isMobile ? translations.text.copyCodeButton : undefined
              // }
              class="code-block__copy-code-button"
              part="code-block__copy-code-button"
              type="button"
              onClick={copy(options.plainText)}
            >
              {text.copyCodeButton}
            </button>

            {chatRef.callbacks?.downloadCodeBlock && (
              <button
                // TODO: Don't set aria-label if it equals to the caption
                aria-label={accessibleName.downloadCodeButton}
                // title={accessibleName.downloadCodeButton}
                // class="code-block__download-code-button"
                part="code-block__download-code-button"
                onClick={downloadCodeBlockCallback(
                  options.plainText,
                  options.language,
                  chatRef.callbacks.downloadCodeBlock
                )}
              >
                {text.downloadCodeButton}
              </button>
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
  };

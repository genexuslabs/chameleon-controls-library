import { html } from "lit";
import { when } from "lit/directives/when.js";
import type { MarkdownViewerCodeRenderOptions } from "../../../markdown-viewer/parsers/types";
import type { ChatCallbacks, ChatCodeBlockRender } from "../../types";
import { copy } from "../../utils";

const downloadCodeBlockCallback =
  (
    plainText: string,
    language: string,
    downloadCodeBlock: ChatCallbacks["downloadCodeBlock"]
  ) =>
  () =>
    downloadCodeBlock(plainText, language);

export const defaultCodeBlockRender: ChatCodeBlockRender =
  (chatRef: HTMLChChatElement) =>
  (options: MarkdownViewerCodeRenderOptions): any => {
    const { accessibleName, text } = chatRef.translations;

    return html`<div part="code-block">
      <div part="code-block__header">
        <span part="code-block__header-caption">${options.language}</span>

        <div part="code-block__header-actions">
          <button
            aria-label=${text.copyCodeButton}
            part="code-block__copy-code-button"
            type="button"
            @click=${copy(options.plainText)}
          >
            ${text.copyCodeButton}
          </button>

          ${when(
            chatRef.callbacks?.downloadCodeBlock,
            () => html`<button
              aria-label=${
                // TODO: Don't set aria-label if it equals to the caption
                accessibleName.downloadCodeButton
              }
              part="code-block__download-code-button"
              @click=${downloadCodeBlockCallback(
                options.plainText,
                options.language,
                chatRef.callbacks.downloadCodeBlock
              )}
            >
              ${text.downloadCodeButton}
            </button>`
          )}
        </div>
      </div>

      <ch-code
        .language=${options.language}
        .lastNestedChildClass=${options.lastNestedChildClass}
        part="code-block__content"
        .showIndicator=${options.showIndicator}
        .value=${options.plainText}
      ></ch-code>
    </div>`;
  };

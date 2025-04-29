import { h } from "@stencil/core";
import type { MarkdownViewerCodeRenderOptions } from "../../markdown-viewer/parsers/types";
import type { ChatCodeBlockRender } from "../types";
import { copy } from "../utils";

export const defaultCodeBlockRender: ChatCodeBlockRender =
  (chatRef: HTMLChChatElement) =>
  (options: MarkdownViewerCodeRenderOptions): any =>
    (
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
              {chatRef.translations.text.copyCodeButton}
            </button>

            {/* {chatRef.hyperlinkToDownloadFile && (
              <button
                aria-label={translations.accessibleName.downloadCodeButton}
                title={translations.accessibleName.downloadCodeButton}
                class="code-block__download-code-button"
                part="code-block__download-code-button"
                onClick={downloadCode(options, chatRef.hyperlinkToDownloadFile)}
              ></button>
            )} */}
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

import { h } from "@stencil/core";
import {
  MarkdownViewerCodeRender,
  MarkdownViewerCodeRenderOptions
} from "../../markdown-viewer/parsers/types";
import { copyToTheClipboard } from "../../../common/utils";

const handleCopy =
  (callbacks: string, callback?: (message: string) => void) => () => {
    copyToTheClipboard(callbacks);
    if (callback) {
      callback(callbacks);
    }
  };

const downloadCode =
  (plainCode: string, downloadCodeCallback: (plainCode: string) => void) =>
  () =>
    downloadCodeCallback(plainCode);

export const defaultChatCodeRender =
  (
    chatRef: HTMLChChatElement,
    showIndicator: boolean,
    callbacks?: {
      copyCode?: (content: string) => void;
      downloadCode?: (plainCode: string) => void;
    }
  ) =>
  (options: MarkdownViewerCodeRenderOptions): MarkdownViewerCodeRender => {
    const { isMobile, translations } = chatRef;

    return (
      <div class="code-block-container">
        <div class={{ "code-block-header": true, mobile: isMobile }}>
          <span
            class={{ "code-block-header__language": true, mobile: isMobile }}
          >
            {options.language || "plain text"}
          </span>

          <button
            aria-label={isMobile ? translations.text.copyCodeButton : undefined}
            class={{
              "code-block-header__copy-code-button": true,
              mobile: isMobile
            }}
            type="button"
            onClick={handleCopy(options.plainText, callbacks?.copyCode)}
          >
            {!isMobile && translations.text.copyCodeButton}
          </button>
          <button
            aria-label={translations.accessibleName.downloadCodeButton}
            title={translations.accessibleName.downloadCodeButton}
            class="code-block-header__download-code-button"
            onClick={
              callbacks?.downloadCode &&
              downloadCode(options.plainText, callbacks?.downloadCode)
            }
          ></button>
        </div>

        <ch-code
          class={isMobile ? "mobile" : undefined}
          language={options.language}
          lastNestedChildClass={options.lastNestedChildClass}
          showIndicator={showIndicator && options.showIndicator}
          value={options.plainText}
        ></ch-code>
      </div>
    );
  };

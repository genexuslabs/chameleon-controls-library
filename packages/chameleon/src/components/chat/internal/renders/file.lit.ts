import { html } from "lit";
import type {
  AGUIAudioInputContent,
  AGUIDocumentInputContent,
  AGUIImageInputContent,
  AGUIInputContentSource,
  AGUIVideoInputContent
} from "../../typesAGUI.js";
import type { ChatInputContentRender } from "./types.js";

/**
 * Resolve an `AGUIInputContentSource` to a renderable URL. Inline `data`
 * sources are wrapped in a `data:` URI using the source's `mimeType`.
 */
const resolveSourceUrl = (source: AGUIInputContentSource): string =>
  source.type === "url"
    ? source.value
    : `data:${source.mimeType};base64,${source.value}`;

export const defaultFileRender: ChatInputContentRender = {
  audio: part => {
    const audioPart = part as AGUIAudioInputContent;
    return html`<li class="file-container" part="file-container format-audio ${audioPart.source.mimeType}">
      <audio
        part="file format-audio ${audioPart.source.mimeType}"
        src=${resolveSourceUrl(audioPart.source)}
        controls
      ></audio>
    </li>`;
  },

  video: part => {
    const videoPart = part as AGUIVideoInputContent;
    return html`<li class="file-container" part="file-container format-video ${videoPart.source.mimeType}">
      <video
        part="file format-video ${videoPart.source.mimeType}"
        src=${resolveSourceUrl(videoPart.source)}
        controls
      ></video>
    </li>`;
  },

  image: part => {
    const imagePart = part as AGUIImageInputContent;
    return html`<li class="file-container" part="file-container format-image ${imagePart.source.mimeType}">
      <img
        part="file format-image ${imagePart.source.mimeType}"
        src=${resolveSourceUrl(imagePart.source)}
        alt=""
        loading="lazy"
      />
    </li>`;
  },

  file: part => {
    const docPart = part as AGUIDocumentInputContent;
    return html`<li class="file-container" part="file-container format-file ${docPart.source.mimeType}">
      <a
        part="file format-file ${docPart.source.mimeType}"
        href=${resolveSourceUrl(docPart.source)}
        target="_blank"
      >
        ${docPart.source.mimeType}
      </a>
    </li>`;
  }
};

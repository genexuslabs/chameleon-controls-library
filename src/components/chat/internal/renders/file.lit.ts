import { html } from "lit";
import { when } from "lit/directives/when";
import type { ChMimeTypeFormatMap } from "../../../../common/mimeTypes/mime-types";
import { tokenMap } from "../../../../common/utils";
import type { ChatFileRender, ChatMessageFile } from "../../types";
import { DEFAULT_FILE_UPLOAD_STATE } from "../../utils";

const fileSkeleton = (
  file: ChatMessageFile,
  fileFormat: keyof ChMimeTypeFormatMap
) =>
  when(
    file.uploadState === "in-progress",
    () => html`<div
      part=${tokenMap({
        [`file-skeleton format-${fileFormat} ${file.mimeType} ${
          file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
        }`]: true,
        [file.extension]: !!file.extension,
        [file.parts]: !!file.parts
      })}
    ></div>`
  );

// const retryFileUpload = (
//   file: ChatFile,
//   fileFormat: keyof ChMimeTypeFormatMap,
//   chatRef: HTMLChChatElement
// ) =>
//   file.uploadState === "failed" && (
//     <button
//       part={`file-retry-upload format-${fileFormat} ${
//         file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
//       }${file.extension ? " " + file.extension : ""}`}
//     ></button>
//   );

const getFileContainerParts = (
  file: ChatMessageFile,
  fileFormat: keyof ChMimeTypeFormatMap
) =>
  tokenMap({
    [`file-container format-${fileFormat} ${file.mimeType} ${
      file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
    }`]: true,
    [file.extension]: !!file.extension,
    [file.parts]: !!file.parts
  });

const getFileParts = (
  file: ChatMessageFile,
  fileFormat: keyof ChMimeTypeFormatMap
) =>
  tokenMap({
    [`file format-${fileFormat} ${file.mimeType} ${
      file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
    }`]: true,
    [file.extension]: !!file.extension,
    [file.parts]: !!file.parts
  });

// TODO: Improve accessibility by exposing progress or spin states while
// uploading
export const defaultFileRender: ChatFileRender = {
  audio: (file: ChatMessageFile) =>
    html`<li
      class="file-container"
      part=${getFileContainerParts(file, "audio")}
    >
      <audio
        aria-label=${file.accessibleName}
        part=${getFileParts(file, "audio")}
        src=${file.uploadState === "in-progress" ? undefined : file.url}
        controls
      ></audio>

      ${fileSkeleton(file, "audio")}
    </li>`,
  video: (file: ChatMessageFile) =>
    html`<li
      class="file-container"
      part=${getFileContainerParts(file, "video")}
    >
      <video
        aria-label=${file.accessibleName}
        part=${getFileParts(file, "video")}
        src=${file.uploadState === "in-progress" ? undefined : file.url}
        controls
      ></video>

      ${fileSkeleton(file, "video")}
    </li>`,

  image: (file: ChatMessageFile) =>
    html`<li class="file-container" part={getFileContainerParts(file, "image")}>
      <img
        aria-label=${file.accessibleName}
        part=${getFileParts(file, "image")}
        src=${file.url}
        alt=${
          // TODO: Should we add a default alt attr?
          file.alternativeText ?? file.accessibleName ?? ""
        }
        loading="lazy"
      />

      ${fileSkeleton(file, "image")}
    </li>`,

  file: (file: ChatMessageFile) => {
    const disabledWhileUploading = file.uploadState === "in-progress";

    return html`<li
      class="file-container"
      part=${getFileContainerParts(file, "file")}
    >
      <a
        aria-label=${file.accessibleName}
        role=${disabledWhileUploading ? "link" : undefined}
        aria-disabled=${disabledWhileUploading ? "true" : undefined}
        part=${getFileParts(file, "file")}
        href=${disabledWhileUploading ? undefined : file.url}
        target="_blank"
      >
        ${when(
          file.caption,
          () =>
            html`<span
              part=${`file-caption format-file ${file.mimeType} ${
                file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
              }`}
            >
              ${file.caption}
            </span>`
        )}
        ${when(
          file.caption && file.extension,
          () => html`<span
            part=${`file-extension format-file ${file.mimeType} ${
              file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
            }`}
          >
            ${file.extension}
          </span>`
        )}
      </a>

      ${fileSkeleton(file, "file")}
    </li>`;
  }
};

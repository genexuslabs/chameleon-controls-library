import { h } from "@stencil/core";
import type { ChatFile, ChatFilesRender } from "../types";
import type { ChMimeTypeFormatMap } from "../../../common/mimeTypes/mime-types";
import { DEFAULT_FILE_UPLOAD_STATE } from "../utils";

const fileSkeleton = (file: ChatFile, fileFormat: keyof ChMimeTypeFormatMap) =>
  file.uploadState === "in-progress" && (
    <div
      part={`file-skeleton format-${fileFormat} ${
        file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
      }${file.extension ? " " + file.extension : ""}`}
    ></div>
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
  file: ChatFile,
  fileFormat: keyof ChMimeTypeFormatMap
) =>
  `file format-${fileFormat} ${file.mimeType} ${
    file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
  }${file.extension ? " " + file.extension : ""}` as const;

const getFileParts = (file: ChatFile, fileFormat: keyof ChMimeTypeFormatMap) =>
  `file format-${fileFormat} ${file.mimeType} ${
    file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
  }${file.extension ? " " + file.extension : ""}` as const;

// TODO: Improve accessibility by exposing progress or spin states while
// uploading
export const defaultFilesRender: ChatFilesRender = {
  audio: (file: ChatFile) => (
    <div part={getFileContainerParts(file, "audio")}>
      <audio
        aria-label={file.accessibleName}
        part={getFileParts(file, "audio")}
        src={file.uploadState === "in-progress" ? undefined : file.url}
        controls
      ></audio>

      {fileSkeleton(file, "audio")}
    </div>
  ),
  video: (file: ChatFile) => (
    <div part={getFileContainerParts(file, "video")}>
      <video
        aria-label={file.accessibleName}
        part={getFileParts(file, "video")}
        src={file.uploadState === "in-progress" ? undefined : file.url}
        controls
      ></video>

      {fileSkeleton(file, "video")}
    </div>
  ),

  image: (file: ChatFile) => (
    <div part={getFileContainerParts(file, "image")}>
      <img
        aria-label={file.accessibleName}
        part={getFileParts(file, "image")}
        src={file.url}
        // TODO: Should we add a default alt attr?
        alt={file.alternativeText ?? file.accessibleName ?? ""}
        loading="lazy"
      ></img>

      {fileSkeleton(file, "image")}
    </div>
  ),

  file: (file: ChatFile) => {
    const disabledWhileUploading = file.uploadState === "in-progress";

    return (
      <div part={getFileContainerParts(file, "file")}>
        <a
          aria-label={file.accessibleName}
          role={disabledWhileUploading ? "link" : undefined}
          aria-disabled={disabledWhileUploading ? "true" : undefined}
          // class={file.url ? "file-render" : "file-render skeleton"}
          part={getFileParts(file, "file")}
          href={disabledWhileUploading ? undefined : file.url}
          target="_blank"
        >
          {file.caption && (
            <span
              part={`file-caption format-file ${file.mimeType} ${
                file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
              }`}
            >
              {file.caption}
            </span>
          )}

          {file.caption && file.extension && (
            <span
              part={`file-extension format-file ${file.mimeType} ${
                file.uploadState ?? DEFAULT_FILE_UPLOAD_STATE
              }`}
            >
              {file.extension}
            </span>
          )}
        </a>

        {fileSkeleton(file, "file")}
      </div>
    );
  }
};

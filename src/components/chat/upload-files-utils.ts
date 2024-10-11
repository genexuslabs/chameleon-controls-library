import { forceUpdate } from "@stencil/core";
import {
  getFileExtension,
  getMimeTypeFormat
} from "../../common/mime-type/mime-type-mapping";
import { MimeTypes } from "../../common/mime-type/mime-types";
import { ChChat } from "./chat";
import { ChatInternalFileToUpload } from "./types";

export const removeDuplicatedSelectedFiles = (
  newSelectedFiles: File[],
  filesToUpload: ChatInternalFileToUpload[]
) => {
  if (newSelectedFiles.length === 0) {
    return [];
  }

  if (filesToUpload.length === 0) {
    return newSelectedFiles;
  }

  return newSelectedFiles.filter(
    newSelectedFile =>
      !filesToUpload.some(
        ({ file }) =>
          file.name === newSelectedFile.name &&
          file.size === newSelectedFile.size
      )
  );
};

export const handleFilesChanged = (
  filesToUpload: ChatInternalFileToUpload[],
  uploadMaxFileSize: number,
  uploadMaxFileCount: number,
  showMaxFileCountForUploadError: (maxFileCount: number) => void,
  showMaxFileSizeForUploadError: (maxFileSize: number) => void,
  chChatClassRef: ChChat,
  event: GxEaiFilePickerCustomEvent<FileList | null>
) => {
  const keyPrefix = new Date().getTime();

  // Apply filter conditions (uploadMaxFileCount and uploadMaxFileSize)
  const filesWithoutFilter = removeDuplicatedSelectedFiles(
    event.detail === null ? [] : [...event.detail],
    filesToUpload
  );

  // uploadMaxFileCount filter
  const filesWithCountFilter = filesWithoutFilter.slice(
    0,
    uploadMaxFileCount - filesToUpload.length
  );

  // uploadMaxFileSize filter
  const filesWithSizeAndCountFilter = filesWithCountFilter.filter(
    file => uploadMaxFileSize === undefined || file.size <= uploadMaxFileSize
  );

  filesWithSizeAndCountFilter.forEach((file, index) => {
    const mimeTypeFormat = getMimeTypeFormat(file.type as MimeTypes);

    const fileTemporalSrc =
      mimeTypeFormat === "image" ? URL.createObjectURL(file) : undefined;

    filesToUpload.push({
      key: fileTemporalSrc ?? `${keyPrefix}__${index}`,
      caption: file.name,
      extension: getFileExtension(file.name, file.type as MimeTypes),
      file: file,
      mimeTypeFormat: mimeTypeFormat,
      src: fileTemporalSrc
    });
  });

  if (filesWithCountFilter.length < filesWithoutFilter.length) {
    showMaxFileCountForUploadError(uploadMaxFileCount);
  }

  if (filesWithSizeAndCountFilter.length < filesWithCountFilter.length) {
    showMaxFileSizeForUploadError(uploadMaxFileSize!);
  }

  // Queue a re-render since there are no updated properties/states
  forceUpdate(chChatClassRef);
};

import type { ChMimeType, ChMimeTypeFormatMap } from "./mime-types";

export const getMimeTypeFileFormat = (
  mimeType: ChMimeType | (string & Record<never, never>)
): keyof ChMimeTypeFormatMap => {
  const format = mimeType.substring(0, 5);

  // "image" is the most probable file format, so it is placed first to resolve
  // the branch faster
  return format === "image" || format === "video" || format === "audio"
    ? format
    : "file";
};

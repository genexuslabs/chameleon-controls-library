import { MimeTypes, MimeTypeFormatMap } from "./mime-types";

export const getMimeTypeFormat = (mimeType: MimeTypes) => {
  const mimeTypeIdentifier = mimeType.substring(0, 5);

  if (mimeTypeIdentifier === "image") {
    return "image" satisfies keyof MimeTypeFormatMap;
  }

  if (mimeTypeIdentifier === "video") {
    return "video" satisfies keyof MimeTypeFormatMap;
  }

  if (mimeTypeIdentifier === "audio") {
    return "audio" satisfies keyof MimeTypeFormatMap;
  }

  return "file" satisfies keyof MimeTypeFormatMap;
};

const mimeTypeToExtensionDictionary = {
  "audio/aac": ["aac"],
  "audio/midi": ["mid", "midi"],
  "audio/mpeg": ["mp3"],
  "audio/ogg": ["oga", "opus"],
  "audio/wav": ["wav"],
  "audio/webm": ["weba"],
  "audio/x-midi": ["mid", "midi"],
  "application/java": ["java"],
  "application/javascript": ["js"],
  "application/json": ["json"],
  "application/msword": ["doc"],
  "application/php": ["php"],
  "application/pdf": ["pdf"],
  "application/typescript": ["ts"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    "pptx"
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx"
  ],
  "application/x-python": ["py"],
  "application/x-ruby": ["rb"],
  "application/x-shellscript": ["sh"],
  "application/x-tex": ["tex"],
  "image/gif": ["gif"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/svg+xml": ["svg"],
  "text/css": ["css"],
  "text/html": ["html"],
  "text/markdown": ["md"],
  "text/plain": ["txt"],
  "text/x-c": ["c"],
  "text/x-csharp": ["cs"],
  "text/x-c++": ["cpp"],
  "video/mp4": ["mp4"],
  "video/quicktime": ["mov"],
  "video/x-msvideo": ["avi"],
  "video/x-ms-wmv": ["wmv"]
} as const satisfies { [key in MimeTypes]: string[] };

export const getFileExtension = (name: string, mimeType: MimeTypes) => {
  const fileExtensions = mimeTypeToExtensionDictionary[mimeType];

  if (fileExtensions !== undefined && fileExtensions.length === 1) {
    return fileExtensions[0];
  }

  const lastDot = name.lastIndexOf(".");
  const extension = name.substring(lastDot + 1);

  return extension;
};

import type { FilterByPrefix, Prettify } from "../types";

export type ChMimeType =
  | "audio/aac" // aac
  | "audio/midi" // mid, midi
  | "audio/mpeg" // mp3
  | "audio/ogg" // oga, opus
  | "audio/wav" // wav
  | "audio/webm" // weba
  | "audio/x-midi" // mid, midi
  | "application/java" // java
  | "application/javascript" // js
  | "application/json" // json
  | "application/msword" // doc
  | "application/php" // php
  | "application/pdf" // pdf
  | "application/typescript" // ts
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation" // pptx
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // docx
  | "application/x-python" // py
  | "application/x-ruby" // rb
  | "application/x-shellscript" // sh
  | "application/x-tex" // tex
  | "image/gif" // gif
  | "image/jpeg" // jpg, jpeg
  | "image/png" // png
  | "image/svg+xml" // svg
  | "text/css" // css
  | "text/html" // html
  | "text/markdown" // md
  | "text/plain" // txt
  | "text/x-c" // c
  | "text/x-csharp" // cs
  | "text/x-c++" // cpp
  | "video/mp4" // mp4
  | "video/quicktime" // mov
  | "video/x-msvideo" // avi
  | "video/x-ms-wmv"; // wmv

export type ChMimeTypeAudio = FilterByPrefix<ChMimeType, "audio">;

export type ChMimeTypeFile = Prettify<
  FilterByPrefix<ChMimeType, "application"> | FilterByPrefix<ChMimeType, "text">
>;

export type ChMimeTypeImage = FilterByPrefix<ChMimeType, "image">;

export type ChMimeTypeVideo = FilterByPrefix<ChMimeType, "video">;

export interface ChMimeTypeFormatMap {
  audio: ChMimeTypeFile;
  file: ChMimeTypeFile;
  image: ChMimeTypeImage;
  video: ChMimeTypeVideo;
}

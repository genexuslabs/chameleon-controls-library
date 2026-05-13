import { copyToTheClipboard } from "../../utilities/clipboard.js";
import type { AGUIInputContent, AGUIMessage } from "./typesAGUI.js";

/**
 * Extract a human-readable text representation of an AG-UI message's
 * content.
 *
 * - String content → returned as-is.
 * - Multimodal user content (`AGUIInputContent[]`) → text parts joined
 *   with newlines. Returns `undefined` if no text parts are present.
 * - `activity` messages have structured content with no canonical text
 *   form, so they return `undefined`.
 */
export const getMessageContent = (
  message: AGUIMessage
): string | undefined => {
  switch (message.role) {
    case "user": {
      if (typeof message.content === "string") {
        return message.content;
      }
      const textParts = message.content.filter(
        (part): part is Extract<AGUIInputContent, { type: "text" }> =>
          part.type === "text"
      );
      return textParts.length === 0
        ? undefined
        : textParts.map(p => p.text).join("\n");
    }
    case "assistant":
      return message.content;
    case "system":
    case "developer":
    case "reasoning":
    case "tool":
      return message.content;
    case "activity":
      return undefined;
  }
};

/**
 * Serialize a message's content for "copy to clipboard" UX.
 *
 * - Plain string content → returned as-is.
 * - Multimodal / structured content → pretty-printed JSON.
 */
export const getMessageSerializedContentAll = (
  message: AGUIMessage
): string => {
  switch (message.role) {
    case "user":
      return typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content, undefined, 2);
    case "activity":
      return JSON.stringify(message.content, undefined, 2);
    case "assistant":
      return message.content ?? "";
    case "system":
    case "developer":
    case "reasoning":
    case "tool":
      return message.content;
  }
};

export const copy = (text: string) => () => copyToTheClipboard(text);

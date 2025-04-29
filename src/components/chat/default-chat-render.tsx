// import { h } from "@stencil/core";
// import type {
//   ChatContentFiles,
//   ChatMessageByRole,
//   ChatMessageRenderBySections
// } from "./types";
// import type { ChatTranslations } from "./translations";
// import { copyToTheClipboard } from "../../common/utils";
// import type {
//   MarkdownViewerCodeRender,
//   MarkdownViewerCodeRenderOptions
// } from "../markdown-viewer/parsers/types";

// const downloadCode =
//   (
//     options: MarkdownViewerCodeRenderOptions,
//     hyperlinkRef: { anchor: HTMLAnchorElement }
//   ) =>
//   () => {
//     // Create the blob variable on the click event
//     const blob = new Blob([options.plainText], { type: "text/plain" });

//     // Create blob object
//     const url = window.URL.createObjectURL(blob);

//     hyperlinkRef.anchor.href = url;
//     hyperlinkRef.anchor.download = "Answer.txt";
//     hyperlinkRef.anchor.click(); // Download the blob

//     // Remove the blob object to free the memory
//     setTimeout(() => {
//       window.URL.revokeObjectURL(url);
//     });
//   };

// export const defaultChatRender =
//   (chatRef: HTMLChChatElement) =>
//   (messageModel: ChatMessageByRole<"assistant" | "error" | "user">) => {
//     if (messageModel.role === "assistant") {
//       return renderDefaultAssistantMessage(chatRef, messageModel);
//     }

//     return messageModel.role === "user"
//       ? renderUserMessage(messageModel)
//       : renderErrorMessage(chatRef, messageModel);
//   };

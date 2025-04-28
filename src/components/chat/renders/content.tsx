import { h } from "@stencil/core";
import type {
  ChatCodeBlockRender,
  ChatContentRender,
  ChatMessage,
  ChatMessageByRole,
  ChatMessageRole
} from "../types";
import { DEFAULT_ASSISTANT_STATUS, getMessageContent } from "../utils";
import { tokenMap } from "../../../common/utils";

// const renderDefaultAssistantMessage = (
//   chatRef: HTMLChChatElement,
//   messageModel: ChatMessageByRole<"assistant">
// ) => {
//   const messageContent = getMessageContent(messageModel);

//   const translations = chatRef.translations;

//   return (
//     <div
//       // Improve accessibility by announcing live changes
//       aria-live="polite"
//       // Wait until all changes are made to prevents assistive
//       // technologies from announcing changes before updates are done
//       aria-busy={getAriaBusyValue(messageModel.status)}
//       class="assistant-content"
//       part={getAssistantParts(messageModel.status)}
//     >
//       {messageModel.status === "waiting" ? (
//         <div class="assistant-loading" part="assistant-loading">
//           {/* {spinner()} */}
//           {messageContent}
//         </div>
//       ) : (
//         [
//           <ch-markdown-viewer
//             renderCode={
//               chatRef.renderCode ?? defaultCodeRender(chatRef, translations)
//             }
//             showIndicator={messageModel.status === "streaming"}
//             theme={chatRef.markdownTheme}
//             value={messageContent}
//           ></ch-markdown-viewer>,

//           files && (
//             <div class="assistant-files" part="assistant-files">
//               {translations.text.sourceFiles}

//               {files.map(file => (
//                 <a href={file.url} target="_blank" part="assistant-file">
//                   {file.caption}
//                 </a>
//               ))}
//             </div>
//           )
//         ]
//       )}

//       {/* {(messageModel.status === "complete" || !messageModel.status) && (
//         <button
//           aria-label={translations.accessibleName.copyResponseButton}
//           title={translations.accessibleName.copyResponseButton}
//           part="copy-response-button"
//           type="button"
//           onClick={copy(messageContent)}
//         ></button>
//       )} */}
//     </div>
//   );
// };

const defaultAssistantContentRender: ChatContentRender = (
  message: ChatMessageByRole<"assistant">,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => {
  const messageContent = getMessageContent(message);

  return message.status === "waiting" ? (
    <div
      class="assistant-loading"
      part={tokenMap({
        [`assistant content waiting ${message.id}`]: true,
        [message.parts]: !!message.parts
      })}
    >
      {/* {spinner()} */}
      {messageContent}
    </div>
  ) : (
    messageContent && (
      <ch-markdown-viewer
        part={tokenMap({
          [`assistant content ${message.id} ${
            message.status ?? DEFAULT_ASSISTANT_STATUS
          }`]: true,
          [message.parts]: !!message.parts
        })}
        // TODO: Fix the way to optimize this re-render
        renderCode={codeBlockRender(chatRef)}
        showIndicator={message.status === "streaming"}
        theme={chatRef.markdownTheme}
        value={messageContent}
      ></ch-markdown-viewer>
    )
  );
};

const defaultErrorContentRender: ChatContentRender = (
  message: ChatMessageByRole<"error">,
  chatRef: HTMLChChatElement,
  codeBlockRender
) => {
  const errorContent = getMessageContent(message);

  return (
    errorContent && (
      <ch-markdown-viewer
        part={tokenMap({
          [`error content ${message.id}`]: true,
          [message.parts]: !!message.parts
        })}
        renderCode={codeBlockRender(chatRef)}
        theme={chatRef.markdownTheme}
        value={errorContent}
      ></ch-markdown-viewer>
    )
  );
};

const defaultUserContentRender: ChatContentRender = (
  messageModel: ChatMessageByRole<"error">
) => getMessageContent(messageModel);

const defaultSystemContentRender: ChatContentRender = () => null;

const contentRenderByRole = {
  assistant: defaultAssistantContentRender,
  error: defaultErrorContentRender,
  system: defaultSystemContentRender,
  user: defaultUserContentRender
} as const satisfies { [key in ChatMessageRole]: ChatContentRender };

export const defaultContentRender: ChatContentRender = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  codeBlockRender: ChatCodeBlockRender
) => contentRenderByRole[message.role](message, chatRef, codeBlockRender);

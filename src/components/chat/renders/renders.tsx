import { ChatMessage, ChatMessageRenderBySections } from "../types";
import { defaultCodeBlockRender } from "./code-block";
import { defaultContentRender } from "./content";
import { defaultFilesRender } from "./files";
import { defaultMessageStructureRender } from "./structure";

export const renderContentBySections = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  rendersBySections: ChatMessageRenderBySections
) =>
  (rendersBySections.messageStructure ?? defaultMessageStructureRender)(
    message,
    chatRef,
    {
      codeBlock: rendersBySections.codeBlock ?? defaultCodeBlockRender,
      content: rendersBySections.content ?? defaultContentRender,
      files: rendersBySections.files ?? defaultFilesRender
    }
  );

import { ChatMessage, ChatMessageRenderBySections } from "../types";
import { defaultCodeBlockRender } from "./code-block";
import { defaultContentRender } from "./content";
import { defaultFileRender } from "./file";
import { defaultSourceRender } from "./source";
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
      file: {
        audio: rendersBySections.file?.audio ?? defaultFileRender.audio,
        file: rendersBySections.file?.file ?? defaultFileRender.file,
        image: rendersBySections.file?.image ?? defaultFileRender.image,
        video: rendersBySections.file?.video ?? defaultFileRender.video
      },
      source: rendersBySections.source ?? defaultSourceRender
    }
  );

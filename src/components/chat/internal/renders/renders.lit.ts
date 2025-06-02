import { ChatMessage, ChatMessageRenderBySections } from "../../types";
import { defaultActionsRender } from "./actions.lit";
import { defaultCodeBlockRender } from "./code-block.lit";
import { defaultContentRender } from "./content.lit";
import { defaultFileRender } from "./file.lit";
import { defaultSourceRender } from "./source.lit";
import { defaultMessageStructureRender } from "./structure.lit";

export const renderContentBySections = (
  message: ChatMessage,
  chatRef: HTMLChChatElement,
  rendersBySections: ChatMessageRenderBySections
) =>
  (rendersBySections.messageStructure ?? defaultMessageStructureRender)(
    message,
    chatRef,
    {
      actions: rendersBySections.actions ?? defaultActionsRender,
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

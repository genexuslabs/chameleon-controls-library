import type { ChatMessage, ChatMessageRenderBySections } from "../../types";
import { defaultActionsRender } from "./actions.lit";
import { defaultChainOfThoughtRender } from "./chain-of-thought.lit";
import { defaultCodeBlockRender } from "./code-block.lit";
import { defaultConfirmationRender } from "./confirmation.lit";
import { defaultContentRender } from "./content.lit";
import { defaultFileRender } from "./file.lit";
import { defaultPlanRender } from "./plan.lit";
import { defaultReasoningRender } from "./reasoning.lit";
import { defaultSourceRender } from "./source.lit";
import { defaultMessageStructureRender } from "./structure.lit";
import { defaultToolRender } from "./tool.lit";

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
      contentBefore: rendersBySections.contentBefore,
      content: rendersBySections.content ?? defaultContentRender,
      contentAfter: rendersBySections.contentAfter,
      file: {
        audio: rendersBySections.file?.audio ?? defaultFileRender.audio,
        file: rendersBySections.file?.file ?? defaultFileRender.file,
        image: rendersBySections.file?.image ?? defaultFileRender.image,
        video: rendersBySections.file?.video ?? defaultFileRender.video
      },
      source: rendersBySections.source ?? defaultSourceRender,
      plan: rendersBySections.plan ?? defaultPlanRender,
      tool: rendersBySections.tool ?? defaultToolRender,
      confirmation:
        rendersBySections.confirmation ?? defaultConfirmationRender,
      reasoning: rendersBySections.reasoning ?? defaultReasoningRender,
      chainOfThought:
        rendersBySections.chainOfThought ?? defaultChainOfThoughtRender
    }
  );

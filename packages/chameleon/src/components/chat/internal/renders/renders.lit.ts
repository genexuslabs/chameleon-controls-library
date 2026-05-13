import type { AGUIMessage } from "../../typesAGUI.js";
import { defaultActionsRender } from "./actions.lit.js";
import { defaultChainOfThoughtRender } from "./chain-of-thought.lit.js";
import { defaultCodeBlockRender } from "./code-block.lit.js";
import { defaultConfirmationRender } from "./confirmation.lit.js";
import { defaultContentRender } from "./content.lit.js";
import { defaultFileRender } from "./file.lit.js";
import { defaultPlanRender } from "./plan.lit.js";
import { defaultReasoningRender } from "./reasoning.lit.js";
import { defaultMessageStructureRender } from "./structure.lit.js";
import { defaultToolRender } from "./tool.lit.js";
import type { ChatMessageRenderBySections } from "./types.js";

/**
 * Compose the active set of renders by overlaying user-provided overrides
 * on top of the AG-UI defaults, then dispatch through the structure render.
 *
 * `source` is intentionally absent — citation sources do not exist in the
 * AG-UI message protocol.
 */
export const renderContentBySections = (
  message: AGUIMessage,
  chatRef: HTMLChChatElement,
  rendersBySections: ChatMessageRenderBySections
) =>
  (rendersBySections.messageStructure ?? defaultMessageStructureRender)(
    message,
    chatRef,
    {
      actions: rendersBySections.actions ?? defaultActionsRender,
      codeBlock: rendersBySections.codeBlock ?? defaultCodeBlockRender,
      contentBefore: rendersBySections.contentBefore!,
      content: rendersBySections.content ?? defaultContentRender,
      contentAfter: rendersBySections.contentAfter!,
      inputContent: {
        audio: rendersBySections.inputContent?.audio ?? defaultFileRender.audio!,
        file: rendersBySections.inputContent?.file ?? defaultFileRender.file!,
        image: rendersBySections.inputContent?.image ?? defaultFileRender.image!,
        video: rendersBySections.inputContent?.video ?? defaultFileRender.video!
      },
      plan: rendersBySections.plan ?? defaultPlanRender,
      tool: rendersBySections.tool ?? defaultToolRender,
      confirmation:
        rendersBySections.confirmation ?? defaultConfirmationRender,
      reasoning: rendersBySections.reasoning ?? defaultReasoningRender,
      chainOfThought:
        rendersBySections.chainOfThought ?? defaultChainOfThoughtRender
    }
  );

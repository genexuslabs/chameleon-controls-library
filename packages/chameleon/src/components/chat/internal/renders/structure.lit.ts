import { html, nothing } from "lit";
import { getMimeTypeFileFormat } from "../../../../utilities/mime-types-utils.js";
import type { ArgumentTypes } from "../../../../typings/types.js";
import { tokenMap } from "../../../../utilities/mapping/token-map.js";
import type {
  ChatFileRender,
  ChatMessageByRole,
  ChatMessageFile,
  ChatMessageRole,
  ChatMessageStructureRender
} from "../../types";
import {
  DEFAULT_ASSISTANT_STATUS,
  getMessageFilesAndSources,
  getMessageSpecialComponents
} from "../../utils";

type ChatMessageNoSystem = ChatMessageByRole<
  Exclude<ChatMessageRole, "system">
>;

const applyFileRenders = (
  file: ChatMessageFile,
  chatRef: HTMLChChatElement,
  renders: Required<ChatFileRender>
) => renders[getMimeTypeFileFormat(file.mimeType)](file, chatRef);

export const defaultMessageStructureRender: ChatMessageStructureRender = (
  message: ChatMessageNoSystem,
  chatRef: HTMLChChatElement,
  renders: ArgumentTypes<ChatMessageStructureRender>[2]
) => {
  const assistantStatus =
    message.role === "assistant"
      ? message.status ?? DEFAULT_ASSISTANT_STATUS
      : undefined;

  const { files, sources } = getMessageFilesAndSources(message);
  const { sourceFiles } = chatRef.translations.text;

  const contentBefore = renders.contentBefore
    ? renders.contentBefore(message, chatRef, renders.codeBlock)
    : nothing;

  const content = renders.content(message, chatRef, renders.codeBlock);

  const contentAfter = renders.contentAfter
    ? renders.contentAfter(message, chatRef, renders.codeBlock)
    : nothing;

  const filesRender =
    files.length !== 0
      ? html`<ul
          class="files-container"
          part=${tokenMap({
            [`files-container ${message.role} ${message.id}`]: true,
            [assistantStatus]: !!assistantStatus,
            [message.parts]: !!message.parts
          })}
        >${files.map(file => applyFileRenders(file, chatRef, renders.file))}</ul>`
      : nothing;

  const sourcesCaption = sourceFiles
    ? // TODO: Test the accessibility of this span
      html`<span
        part=${tokenMap({
          [`sources-caption ${message.role} ${message.id}`]: true,
          [assistantStatus]: !!assistantStatus,
          [message.parts]: !!message.parts
        })}
        >${sourceFiles}</span
      >`
    : nothing;

  const sourcesRender =
    sources.length !== 0
      ? html`<ul
          class="sources-container"
          part=${tokenMap({
            [`sources-container ${message.role} ${message.id}`]: true,
            [assistantStatus]: !!assistantStatus,
            [message.parts]: !!message.parts
          })}
        >${sourcesCaption}${sources.map(source =>
            renders.source(source, chatRef)
          )}</ul>`
      : nothing;

    // Render special components (plan, tool, confirmation, reasoning, chainOfThought)
  const { plan, tool, confirmation, reasoning, chainOfThought } =
    getMessageSpecialComponents(message);

  const planRender = plan ? renders.plan(plan, chatRef) : nothing;

  const toolRender = tool ? renders.tool(tool, chatRef) : nothing;

  const confirmationRender = confirmation
    ? renders.confirmation(confirmation, chatRef)
    : nothing;

  const reasoningRender = reasoning
    ? renders.reasoning(reasoning, chatRef)
    : nothing;

  const chainOfThoughtRender = chainOfThought
    ? renders.chainOfThought(chainOfThought, chatRef)
    : nothing;

  return html`<div
    part=${tokenMap({
      [`content-container ${message.role} ${message.id}`]: true,
      [assistantStatus]: !!assistantStatus,
      [message.parts]: !!message.parts
    })}
  >${contentBefore}${content}${contentAfter}${filesRender}${sourcesRender}${planRender}${toolRender}${confirmationRender}${reasoningRender}${chainOfThoughtRender}${renders.actions(
      message,
      chatRef
    )}</div>`;
};

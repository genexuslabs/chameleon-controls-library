/* eslint-disable @stencil-community/own-props-must-be-private */
/* eslint-disable @stencil-community/own-methods-must-be-private */
/* eslint-disable @stencil-community/no-unused-watch */
import { html, LitElement } from "lit";
import { property } from "lit/decorators/property.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";

import { tokenMap } from "../../../common/utils";

import type {
  ChatMessage,
  ChatMessageAssistant,
  ChatMessageByRole,
  ChatMessageError,
  ChatMessageRenderByItem,
  ChatMessageRenderBySections,
  ChatMessageUser
} from "./../types";
import {
  DEFAULT_ASSISTANT_STATUS,
  getMessageContent,
  getMessageFilesAndSources
} from "./../utils";
import { renderContentBySections } from "./renders/renders.lit";

// import styles from "../chat.scss?inline";

const getAriaBusyValue = (
  status?: "complete" | "waiting" | "streaming" | undefined
): "true" | "false" => (status === "streaming" ? "true" : "false");

export class ChChatLit extends LitElement {
  /**
   * Specifies a Set of cells that must render an additional div to correctly
   * reserve space. This space is used to align the cell at the start scroll
   * position.
   *
   * Even if only one cell is aligned to the start of the scroll, all cells
   * that participated in this behavior must maintain the additional rendered
   * div to avoid destroying the DOM and thus causing some side effects on
   * elements whose state the chat can not control.
   */
  @property({ attribute: false }) accessor cellHasToReserveSpace:
    | Set<string>
    | undefined;

  @property({ attribute: false }) accessor cellIdAlignedWhenRendered:
    | string
    | undefined;

  /**
   * Specifies the reference for the ch-chat parent.
   */
  @property({ attribute: false }) accessor chatRef: HTMLDivElement | undefined =
    undefined; // TODO: This is a WA to avoid a type error in runtime

  /**
   * Specifies how the messages added by the user interaction will be aligned
   * in the chat.
   *
   * If `newUserMessageAlignment === "start"` the chat will reserve the
   * necessary space to visualize the message at the start of the content
   * viewport if the content is not large enough.
   * This behavior is the same as the Monaco editor does for reserving space
   * when visualizing the last lines positioned at the top of the editor.
   */
  @property() accessor newUserMessageAlignment: "start" | "end" = "end";

  /**
   * Specifies how the chat will scroll to the position of the messages added
   * by user interaction.
   */
  @property() accessor newUserMessageScrollBehavior: Exclude<
    ScrollBehavior,
    "auto"
  > = "instant";

  /**
   * This property allows us to implement custom rendering of chat items.
   *
   * This works by providing a custom render of the cell content in two
   * possible ways:
   *   1. Replacing the render of the entire cell with a function of the
   *   message model.
   *
   *   2. Replacing the render of specific parts of the message by providing an
   *   object with the specific renders of the message sections (`codeBlock`,
   *   `content`, `files` and/or `messageStructure`).
   */
  @property() accessor renderItem:
    | ChatMessageRenderByItem
    | ChatMessageRenderBySections;

  /**
   * Specifies the reference for the smart grid parent.
   *
   * This property is useful to avoid the cell from queering the ch-smart-grid
   * ref on the initial load.
   */
  @property({ attribute: false }) accessor smartGridRef!: HTMLDivElement; // TODO: This is a WA to avoid a type error in runtime

  /**
   * Specifies the virtual items that the chat will display.
   */
  @property({ attribute: false }) accessor virtualItems: ChatMessage[] = [];

  // "Shadow DOM === false"
  protected createRenderRoot() {
    return this;
  }

  #alignCellWhenRendered = () =>
    // TODO: This is a WA to avoid a type error in runtime
    (
      this.smartGridRef as any as HTMLChSmartGridElement
    ).scrollEndContentToPosition(this.cellIdAlignedWhenRendered, {
      position: this.newUserMessageAlignment,
      behavior: this.newUserMessageScrollBehavior
    });

  #getMessageRenderedContent = (
    message: ChatMessageUser | ChatMessageAssistant | ChatMessageError
  ) => {
    // Default render
    if (!this.renderItem) {
      return renderContentBySections(message, this.chatRef as any, {});
    }

    return typeof this.renderItem === "function"
      ? this.renderItem(message)
      : renderContentBySections(message, this.chatRef as any, this.renderItem); // The custom render is separated by sections
  };

  #renderItem = (message: ChatMessage) => {
    if (message.role === "system") {
      return "";
    }

    const isAssistantMessage = message.role === "assistant";
    const filesAndSources = getMessageFilesAndSources(message);

    const parts = tokenMap({
      [`message ${message.role} ${message.id}`]: true,
      "has-content": (getMessageContent(message) ?? "").trim() !== "",
      "has-files": filesAndSources.files.length !== 0,
      "has-sources": filesAndSources.sources.length !== 0,
      [message.parts]: !!message.parts,
      [(message as ChatMessageByRole<"assistant">).status ??
      DEFAULT_ASSISTANT_STATUS]: isAssistantMessage
    });

    const renderedContent = this.#getMessageRenderedContent(message);

    const messageIsCellAlignedAtTheStart =
      message.id === this.cellIdAlignedWhenRendered;

    const hasToRenderAnExtraDiv =
      this.cellHasToReserveSpace !== undefined &&
      this.cellHasToReserveSpace.has(message.id);

    return html`<ch-smart-grid-cell
      .cellId=${message.id}
      aria-live=${ifDefined(isAssistantMessage ? "polite" : undefined)}
      aria-busy=${
        // Wait until all changes are made to prevents assistive
        // technologies from announcing changes before updates are done
        ifDefined(
          isAssistantMessage ? getAriaBusyValue(message.status) : undefined
        )
      }
      part=${ifDefined(hasToRenderAnExtraDiv ? undefined : parts)}
      .smartGridRef=${
        // TODO: This is a WA to avoid a type error in runtime
        this.smartGridRef as any as HTMLChSmartGridElement
      }
      @smartCellDidLoad=${messageIsCellAlignedAtTheStart
        ? this.#alignCellWhenRendered
        : undefined}
    >
      ${hasToRenderAnExtraDiv
        ? html`<div part=${parts}>${renderedContent}</div>`
        : renderedContent}
    </ch-smart-grid-cell>`;
  };

  render() {
    return repeat(this.virtualItems, item => item.id, this.#renderItem);
  }
}

customElements.define("ch-chat-lit", ChChatLit);

declare global {
  interface HTMLElementTagNameMap {
    "ch-chat-lit": ChChatLit;
  }
}

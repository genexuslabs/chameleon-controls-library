import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { property } from "lit/decorators/property.js";
import { html, nothing } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined.js";
import { repeat } from "lit-html/directives/repeat.js";

import { tokenMap } from "../../../utilities/utils";

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

const getAriaBusyValue = (
  status?: "complete" | "waiting" | "streaming" | undefined
): "true" | "false" => (status === "streaming" ? "true" : "false");

@Component({
  tag: "ch-chat-render-lit",
  shadow: false
})
export class ChChatRenderLit extends KasstorElement {
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
  @property({ attribute: false }) cellHasToReserveSpace:
    | Set<string>
    | undefined;

  @property({ attribute: false }) cellIdAlignedWhenRendered:
    | string
    | undefined;

  /**
   * Specifies the reference for the ch-chat parent.
   */
  @property({ attribute: false }) chatRef: HTMLDivElement | undefined =
    undefined;

  /**
   * Specifies the live kit messages that are rendered when liveMode = true in
   * the `ch-chat`
   */
  @property({ attribute: false }) liveKitMessages: ChatMessage[] = [];

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
  @property({ attribute: "new-user-message-alignment" }) newUserMessageAlignment: "start" | "end" = "end";

  /**
   * Specifies how the chat will scroll to the position of the messages added
   * by user interaction.
   */
  @property({ attribute: "new-user-message-scroll-behavior" }) newUserMessageScrollBehavior: Exclude<
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
  @property({ attribute: false }) renderItem:
    | ChatMessageRenderByItem
    | ChatMessageRenderBySections;

  /**
   * Specifies the reference for the smart grid parent.
   *
   * This property is useful to avoid the cell from queering the ch-smart-grid
   * ref on the initial load.
   */
  @property({ attribute: false }) smartGridRef!: HTMLDivElement;

  /**
   * Specifies the virtual items that the chat will display.
   */
  @property({ attribute: false }) virtualItems: ChatMessage[] = [];

  #alignCellWhenRendered = () =>
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
      : renderContentBySections(message, this.chatRef as any, this.renderItem);
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
        ifDefined(
          isAssistantMessage ? getAriaBusyValue(message.status) : undefined
        )
      }
      part=${ifDefined(hasToRenderAnExtraDiv ? undefined : parts)}
      .smartGridRef=${
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

  override render() {
    return html`${repeat(
      this.virtualItems,
      item => item.id,
      this.#renderItem
    )}${this.liveKitMessages
      ? repeat(this.liveKitMessages, item => item.id, this.#renderItem)
      : nothing}`;
  }
}

export interface HTMLChChatRenderLitElement extends ChChatRenderLit {}

declare global {
  interface HTMLElementTagNameMap {
    "ch-chat-render-lit": HTMLChChatRenderLitElement;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChChatRenderLitElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChChatRenderLitElement;
  }

  // prettier-ignore
  interface HTMLChChatRenderLitElement extends ChChatRenderLit {
    // Extend the ChChatRenderLit class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-chat-render-lit": HTMLChChatRenderLitElement;
  }

  interface HTMLElementTagNameMap {
    "ch-chat-render-lit": HTMLChChatRenderLitElement;
  }
}


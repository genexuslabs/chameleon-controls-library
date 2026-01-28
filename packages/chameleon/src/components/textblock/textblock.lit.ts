import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import { SyncWithRAF } from "../../utilities/sync-with-frames";

import styles from "./textblock.scss?inline";

const AVAILABLE_SIZE_CUSTOM_VAR = "--ch-textblock-available-size";
const DISPLAYED_LINES_CUSTOM_VAR = "--ch-textblock-displayed-lines";
const LINE_HEIGHT_CUSTOM_VAR = "--ch-textblock-line-height";

/**
 * @status developer-preview
 *
 * @slot - The slot for the HTML content.
 */
@Component({
  styles,
  tag: "ch-textblock"
})
export class ChTextBlock extends KasstorElement {
  #currentAvailableHeight: number = -1;
  #availableHeight: number = -1;
  #contentHeight: number = -1;
  #lineHeight: number = -1;

  #totalLines: number = -1;
  #displayedLines: number = -1;

  #resizeObserver: ResizeObserver | undefined;
  #syncWithRAF: SyncWithRAF | undefined; // Allocated at runtime to save resources

  // Refs
  #contentRef: Ref<HTMLElement> = createRef();
  #lineMeasuringRef: Ref<HTMLElement> = createRef();

  @state() protected contentOverflows = false;
  // @Observe("contentOverflows")
  // contentOverflowsChanged(newValue: boolean) {
  //   this.overflowingContentChange.emit(newValue);
  // }

  // @Element() el: HTMLChTextblockElement;

  /**
   * This property defines if the control size will grow automatically, to
   * adjust to its content size.
   *
   * If `false` the overflowing content will be displayed with an ellipsis.
   * This ellipsis takes into account multiple lines.
   */
  @property({ type: Boolean }) readonly autoGrow: boolean = false;
  @Observe("autoGrow")
  protected autoGrowChanged(newAutoGrow: boolean) {
    if (newAutoGrow) {
      this.#disconnectResizeObserver();
    }
  }

  /**
   * Specifies the content to be displayed when the control has `format = text`.
   */
  @property() readonly caption: string | undefined;

  /**
   * Specifies the character used to measure the line height
   */
  @property() readonly characterToMeasureLineHeight: string = "A";

  /**
   * It specifies the format that will have the textblock control.
   *
   *  - If `format` = `HTML`, the textblock control works as an HTML div and
   *    the innerHTML will be taken from the default slot.
   *
   *  - If `format` = `text`, the control works as a normal textblock control
   *    and it is affected by most of the defined properties.
   */
  @property() readonly format: "text" | "HTML" = "text";
  @Observe("format")
  protected formatChanged() {
    // Avoid memory leaks, since the containerRef variable will be destroyed
    this.#disconnectResizeObserver();
  }

  /**
   * `true` to display a tooltip when the caption overflows the size of the
   * container.
   *
   * Only works if `format = text` and `autoGrow = false`.
   */
  @property({ type: Boolean }) readonly showTooltipOnOverflow: boolean = false;

  // /**
  //  * Fired when the displayed lines overflows the control's content.
  //  * If `true`, the current content overflows the control.
  //  */
  // @Event() overflowingContentChange: EventEmitter<boolean>;

  #calculateDisplayedLines = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    if (this.#currentAvailableHeight === 0) {
      return;
    }

    const contentRef = this.#contentRef.value!;

    const currentContentHeight = contentRef.scrollHeight;
    const currentLineHeight =
      this.#lineMeasuringRef.value!.getBoundingClientRect().height;

    // Nothing has change
    if (
      this.#availableHeight === this.#currentAvailableHeight &&
      this.#contentHeight === currentContentHeight &&
      this.#lineHeight === currentLineHeight
    ) {
      return;
    }

    // Store new values
    this.#availableHeight = this.#currentAvailableHeight;
    this.#contentHeight = currentContentHeight;
    this.#lineHeight = currentLineHeight;

    this.contentOverflows = this.#currentAvailableHeight < currentContentHeight;

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    // Calculate how many lines can display the control without overflowing
    // the content
    const currentDisplayedLines = Math.max(
      Math.trunc(this.#currentAvailableHeight / currentLineHeight),
      1
    );

    // Calculate the total lines displayed by the control, even if they
    // overflow the content
    const currentTotalLines = Math.max(
      Math.trunc(currentContentHeight / currentLineHeight),
      1
    );

    // Update the line-height value even if the displayed lines didn't change
    contentRef.style.setProperty(
      LINE_HEIGHT_CUSTOM_VAR,
      `${currentLineHeight}px`
    );

    if (this.format === "HTML") {
      contentRef.style.setProperty(
        AVAILABLE_SIZE_CUSTOM_VAR,
        `${this.#availableHeight}px`
      );
    }

    // Nothing has change
    if (
      this.#displayedLines === currentDisplayedLines &&
      this.#totalLines === currentTotalLines
    ) {
      return;
    }

    // Store new values
    this.#displayedLines = currentDisplayedLines;
    this.#totalLines = currentTotalLines;

    contentRef.style.setProperty(
      DISPLAYED_LINES_CUSTOM_VAR,
      `${currentDisplayedLines}`
    );
  };

  #setResizeObserverIfNecessary = () => {
    if (this.#resizeObserver) {
      return;
    }

    this.#syncWithRAF = new SyncWithRAF();

    this.#resizeObserver = new ResizeObserver(entries => {
      const textBlockEntry = entries.find(el => el.target === this);

      if (textBlockEntry) {
        this.#currentAvailableHeight =
          textBlockEntry.contentBoxSize[0].blockSize;
      }

      this.#syncWithRAF!.perform(this.#calculateDisplayedLines);
    });

    this.#resizeObserver.observe(this.#contentRef.value!);
    this.#resizeObserver.observe(this.#lineMeasuringRef.value!);
    this.#resizeObserver.observe(this, { box: "content-box" });
  };

  #disconnectResizeObserver = () => {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;

    this.#syncWithRAF?.cancel();
    this.#syncWithRAF = undefined;

    // Reset values. Necessary when alternating between autoGrow values
    this.#currentAvailableHeight = -1;
    this.#availableHeight = -1;
    this.#contentHeight = -1;
    this.#lineHeight = -1;
    this.#totalLines = -1;
    this.#displayedLines = -1;
  };

  #autoGrowRender = () =>
    this.format === "text" ? this.caption : html`<slot></slot>`;

  #noAutoGrowRender = () =>
    html`<div class="line-measure" ${ref(this.#lineMeasuringRef)}>
        ${this.characterToMeasureLineHeight}
      </div>

      ${this.format === "text"
        ? html`<p class="content" ${ref(this.#contentRef)}>${this.caption}</p>`
        : html`<div class="html-content" ${ref(this.#contentRef)}>
            <slot></slot>
          </div>`}`;

  override updated() {
    if (!this.autoGrow) {
      this.#setResizeObserverIfNecessary();

      if (this.showTooltipOnOverflow && this.format === "text") {
        this.#syncWithRAF!.perform(this.#calculateDisplayedLines);
      }
    }
  }

  override disconnectedCallback() {
    this.#disconnectResizeObserver();
    super.disconnectedCallback();
  }

  override render() {
    return this.autoGrow ? this.#autoGrowRender() : this.#noAutoGrowRender();
    // <Host
    //   // role={this.format === "Text" && !this.lineClamp ? "paragraph" : null}
    //   class={!this.autoGrow ? "ch-textblock--no-auto-grow" : undefined}
    //   title={
    //     this.showTooltipOnOverflow &&
    //     this.format === "text" &&
    //     !this.autoGrow &&
    //     this.contentOverflows
    //       ? this.caption
    //       : undefined
    //   }
    // >
    //   {this.autoGrow ? this.#autoGrowRender() : this.#noAutoGrowRender()}
    // </Host>
  }
}

export default ChTextBlock;

declare global {
  interface HTMLElementTagNameMap {
    "ch-textblock": ChTextBlock;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChTextBlockElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChTextBlockElement;
  }

  /**
   * @status developer-preview
   *
   * @slot - The slot for the HTML content.
   */// prettier-ignore
  interface HTMLChTextBlockElement extends ChTextBlock {
    // Extend the ChTextBlock class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-textblock": HTMLChTextBlockElement;
  }

  interface HTMLElementTagNameMap {
    "ch-textblock": HTMLChTextBlockElement;
  }
}


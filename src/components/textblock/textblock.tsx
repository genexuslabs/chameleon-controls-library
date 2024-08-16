import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";

import { SyncWithRAF } from "../../common/sync-with-frames";

const AVAILABLE_SIZE_CUSTOM_VAR = "--ch-textblock-available-size";
const DISPLAYED_LINES_CUSTOM_VAR = "--ch-textblock-displayed-lines";
const LINE_HEIGHT_CUSTOM_VAR = "--ch-textblock-line-height";

/**
 * @status developer-preview
 *
 * @slot - The slot for the HTML content.
 */
@Component({
  shadow: true,
  styleUrl: "textblock.scss",
  tag: "ch-textblock"
})
export class ChTextBlock implements ComponentInterface {
  #currentAvailableHeight: number = -1;
  #availableHeight: number = -1;
  #contentHeight: number = -1;
  #lineHeight: number = -1;

  #totalLines: number = -1;
  #displayedLines: number = -1;

  #resizeObserver: ResizeObserver | undefined;
  #syncWithRAF: SyncWithRAF | undefined; // Allocated at runtime to save resources

  // Refs
  #contentRef: HTMLElement | undefined;
  #htmlContentRef: HTMLElement | undefined;
  #lineMeasuringRef: HTMLElement | undefined;

  @State() contentOverflows = false;
  @Watch("contentOverflows")
  contentOverflowsChanged(newValue: boolean) {
    this.overflowingContentChange.emit(newValue);
  }

  @Element() el: HTMLChTextblockElement;

  /**
   * This property defines if the control size will grow automatically, to
   * adjust to its content size.
   *
   * If `false` the overflowing content will be displayed with an ellipsis.
   * This ellipsis takes into account multiple lines.
   */
  @Prop() readonly autoGrow: boolean = false;
  @Watch("autoGrow")
  autoGrowChanged(newAutoGrow: boolean) {
    if (newAutoGrow) {
      this.#disconnectResizeObserver();
    }
  }

  /**
   * Specifies the content to be displayed when the control has `format = text`.
   */
  @Prop() readonly caption: string;

  /**
   * Specifies the character used to measure the line height
   */
  @Prop() readonly characterToMeasureLineHeight: string = "A";

  /**
   * It specifies the format that will have the textblock control.
   *
   *  - If `format` = `HTML`, the textblock control works as an HTML div and
   *    the innerHTML will be taken from the default slot.
   *
   *  - If `format` = `text`, the control works as a normal textblock control
   *    and it is affected by most of the defined properties.
   */
  @Prop() readonly format: "text" | "HTML" = "text";
  @Watch("format")
  formatChanged() {
    // Avoid memory leaks, since the containerRef variable will be destroyed
    this.#disconnectResizeObserver();
  }

  /**
   * `true` to display a tooltip when the caption overflows the size of the
   * container.
   *
   * Only works if `format = text` and `autoGrow = false`.
   */
  @Prop() readonly showTooltipOnOverflow: boolean = false;

  /**
   * Fired when the displayed lines overflows the control content.
   * If `true` the current content overflows the control.
   */
  @Event() overflowingContentChange: EventEmitter<boolean>;

  #getContentRef = () =>
    this.format === "HTML" ? this.#htmlContentRef : this.#contentRef;

  #calculateDisplayedLines = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    if (this.#currentAvailableHeight === 0) {
      return;
    }

    const contentRef = this.#getContentRef();

    const currentContentHeight = contentRef.scrollHeight;
    const currentLineHeight =
      this.#lineMeasuringRef.getBoundingClientRect().height;

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
      const textBlockEntry = entries.find(el => el.target === this.el);

      if (textBlockEntry) {
        this.#currentAvailableHeight =
          textBlockEntry.contentBoxSize[0].blockSize;
      }

      this.#syncWithRAF.perform(this.#calculateDisplayedLines);
    });

    const contentRef = this.#getContentRef();

    this.#resizeObserver.observe(contentRef);
    this.#resizeObserver.observe(this.#lineMeasuringRef);
    this.#resizeObserver.observe(this.el, { box: "content-box" });
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

  #autoGrowRender = () => (this.format === "text" ? this.caption : <slot />);

  #noAutoGrowRender = () => [
    <div class="line-measure" ref={el => (this.#lineMeasuringRef = el)}>
      {this.characterToMeasureLineHeight}
    </div>,

    this.format === "text" ? (
      <p class="content" ref={el => (this.#contentRef = el)}>
        {this.caption}
      </p>
    ) : (
      <div class="html-content" ref={el => (this.#htmlContentRef = el)}>
        <slot />
      </div>
    )
  ];

  componentDidRender() {
    if (!this.autoGrow) {
      this.#setResizeObserverIfNecessary();

      if (this.showTooltipOnOverflow && this.format === "text") {
        this.#syncWithRAF.perform(this.#calculateDisplayedLines);
      }
    }
  }

  disconnectedCallback() {
    this.#disconnectResizeObserver();
  }

  render() {
    return (
      <Host
        // role={this.format === "Text" && !this.lineClamp ? "paragraph" : null}
        class={!this.autoGrow ? "ch-textblock--no-auto-grow" : undefined}
        title={
          this.showTooltipOnOverflow &&
          this.format === "text" &&
          !this.autoGrow &&
          this.contentOverflows
            ? this.caption
            : undefined
        }
      >
        {this.autoGrow ? this.#autoGrowRender() : this.#noAutoGrowRender()}
      </Host>
    );
  }
}

import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Watch,
  Prop,
  State,
  h
} from "@stencil/core";
import { ChDialogResizeElement } from "./types";
import { forceCSSMinMax, isRTL } from "../../common/utils";
import { SyncWithRAF } from "../../common/sync-with-frames";

// Custom vars
const DIALOG_BLOCK_START = "--ch-dialog-block-start";
const DIALOG_INLINE_START = "--ch-dialog-inline-start";
const DIALOG_DRAGGED_X = "--ch-dialog-dragged-x";
const DIALOG_DRAGGED_Y = "--ch-dialog-dragged-y";

const DIALOG_RTL = "--ch-dialog-rtl";
const DIALOG_RTL_VALUE = "-1";
const DRAGGING_CLASS = "gx-dialog-dragging";
const RESIZING_CLASS = "ch-dialog-resizing";

const DIALOG_BLOCK_SIZE = "--ch-dialog-block-size";
const DIALOG_INLINE_SIZE = "--ch-dialog-inline-size";

const DIALOG_BORDER_BLOCK_START_SIZE = "--ch-dialog-border-block-start-width";
const DIALOG_BORDER_BLOCK_END_SIZE = "--ch-dialog-border-block-end-width";
const DIALOG_BORDER_INLINE_START_SIZE = "--ch-dialog-border-inline-start-width";
const DIALOG_BORDER_INLINE_END_SIZE = "--ch-dialog-border-inline-end-width";

const DIALOG_RTL_CLASS = "ch-dialog-rtl";

const addCursorInDocument = (cursor: string) =>
  (document.body.style.cursor = cursor);

const resizingCursorDictionary: {
  [key in ChDialogResizeElement]: (rtl: boolean) => void;
} = {
  "block-start": () => addCursorInDocument("ns-resize"),

  "block-end": () => addCursorInDocument("ns-resize"),

  "inline-start": () => addCursorInDocument("ew-resize"),

  "inline-end": () => addCursorInDocument("ew-resize"),

  "block-start-inline-start": rtl =>
    addCursorInDocument(rtl ? "nesw-resize" : "nwse-resize"),

  "block-start-inline-end": rtl =>
    addCursorInDocument(rtl ? "nwse-resize" : "nesw-resize"),

  "block-end-inline-start": rtl =>
    addCursorInDocument(rtl ? "nwse-resize" : "nesw-resize"),

  "block-end-inline-end": rtl =>
    addCursorInDocument(rtl ? "nesw-resize" : "nwse-resize")
};

// Utils
const fromPxToNumber = (pxValue: string) =>
  Number(pxValue.replace("px", "").trim());

const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

/**
 * The `ch-dialog` component represents a modal or non-modal dialog box or other
 * interactive component.
 *
 * @part dialog - The dialog html element, which is the first element inside the host.
 * @part header - The dialog header which is only rendered if 'showHeader' property is true. The header displays the caption and a close button.
 * @part content - The dialog content. It is a div element that acts as a wrapper of the slotted content.
 *
 * @part edge - Represents any of the dialog edges that appear before, after, above or below the dialog. These corners are used to resize the dialog dimensions by dragging.
 * @part edge-block-start - Represents the "block-start" dialog edge (see also "edge" part).
 * @part edge-block-end - Represents the "block-end" dialog edge (see also "edge" part).
 * @part edge-inline-end - Represents the "inline-end" dialog edge (see also "edge" part).
 * @part edge-inline-start - Represents the "inline-start" dialog edge (see also "edge" part).
 *
 * @part corner - Represents any of the dialog corners that appear in-between the edges. These corners are used to resize the dialog dimensions by dragging.
 * @part corner-block-start-inline-start - Represents the dialog corner in-between the "edge-block-start" and "edge-inline-start" parts (see also "corner" part).
 * @part corner-block-start-inline-end - Represents the dialog corner in-between the "edge-block-start" and "edge-inline-end" parts (see also "corner" part).
 * @part corner-block-end-inline-start - Represents the dialog corner in-between the "edge-block-end" and "edge-inline-start" parts (see also "corner" part).
 * @part corner-block-end-inline-end - Represents the dialog corner in-between the "edge-block-end" and "edge-inline-end" parts (see also "corner" part).
 *
 */
@Component({
  tag: "ch-dialog",
  styleUrl: "dialog.scss",
  shadow: true
})
export class ChDialog {
  // Sync computations with frames
  #borderSizeRAF: SyncWithRAF; // Don't allocate memory until the control is rendered
  #dragRAF: SyncWithRAF; // Don't allocate memory until needed when dragging
  #resizeRAF: SyncWithRAF; // Don't allocate memory until needed when resizing

  // Watchers
  #checkPositionWatcher = false;
  #checkBorderSizeWatcher = false;
  #borderSizeObserver: ResizeObserver;
  #rtlWatcher: MutationObserver;

  // Drag
  #draggedDistanceX: number = 0;
  #draggedDistanceY: number = 0;
  #dragging = false;
  #initialDragEvent: MouseEvent;
  #lastDragEvent: MouseEvent;
  #isRTLDirection: boolean;

  // Resize
  #currentEdge: ChDialogResizeElement;
  #draggedDistanceXForResize: number = 0;
  #draggedDistanceYForResize: number = 0;
  #maxBlockSize: number = 0;
  #maxInlineSize: number = 0;
  #minBlockSize: number = 0;
  #minInlineSize: number = 0;

  #resizeByDirectionDictionary = {
    block: (dialogRect: DOMRect, direction: "start" | "end") => {
      let currentDraggedDistanceY =
        this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;

      // Start direction inverts the increment
      if (direction === "start") {
        currentDraggedDistanceY = -currentDraggedDistanceY;
      }

      const newBlockSize = dialogRect.height + currentDraggedDistanceY;
      const newRestrictedBlockSize = forceCSSMinMax(
        newBlockSize,
        this.#minBlockSize,
        this.#maxBlockSize
      );

      // Do not apply resizes or translations if the control is at the minimum
      // or maximum size
      if (newRestrictedBlockSize === dialogRect.height) {
        return;
      }

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      // By resizing the start edge the control is translated to improve the UX
      if (direction === "start") {
        this.#draggedDistanceYForResize -= currentDraggedDistanceY;
        setProperty(this.el, DIALOG_DRAGGED_Y, this.#draggedDistanceYForResize);
      }

      setProperty(this.el, DIALOG_BLOCK_SIZE, newRestrictedBlockSize);
    },

    inline: (dialogRect: DOMRect, direction: "start" | "end") => {
      let currentDraggedDistanceX =
        this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;

      if (this.#isRTLDirection) {
        currentDraggedDistanceX = -currentDraggedDistanceX;
      }

      // Start direction inverts the increment
      if (direction === "start") {
        currentDraggedDistanceX = -currentDraggedDistanceX;
      }

      const newInlineSize = dialogRect.width + currentDraggedDistanceX;
      const newRestrictedInlineSize = forceCSSMinMax(
        newInlineSize,
        this.#minInlineSize,
        this.#maxInlineSize
      );

      // Do not apply resizes or translations if the control is at the minimum
      // or maximum size
      if (newRestrictedInlineSize === dialogRect.width) {
        return;
      }

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      // By resizing the start edge the control is translated to improve the UX
      if (direction === "start") {
        this.#draggedDistanceXForResize -= currentDraggedDistanceX;

        setProperty(this.el, DIALOG_DRAGGED_X, this.#draggedDistanceXForResize);
      }

      setProperty(this.el, DIALOG_INLINE_SIZE, newRestrictedInlineSize);
    }
  } as const;

  #resizeEdgesAndCornersDictionary: {
    [key in ChDialogResizeElement]: (dialogRect: DOMRect) => void;
  } = {
    "block-start": dialogRect =>
      this.#resizeByDirectionDictionary.block(dialogRect, "start"),

    "block-end": dialogRect =>
      this.#resizeByDirectionDictionary.block(dialogRect, "end"),

    "inline-start": dialogRect =>
      this.#resizeByDirectionDictionary.inline(dialogRect, "start"),

    "inline-end": dialogRect =>
      this.#resizeByDirectionDictionary.inline(dialogRect, "end"),

    "block-start-inline-start": dialogRect => {
      this.#resizeByDirectionDictionary.block(dialogRect, "start");
      this.#resizeByDirectionDictionary.inline(dialogRect, "start");
    },

    "block-start-inline-end": dialogRect => {
      this.#resizeByDirectionDictionary.block(dialogRect, "start");
      this.#resizeByDirectionDictionary.inline(dialogRect, "end");
    },

    "block-end-inline-start": dialogRect => {
      this.#resizeByDirectionDictionary.block(dialogRect, "end");
      this.#resizeByDirectionDictionary.inline(dialogRect, "start");
    },

    "block-end-inline-end": dialogRect => {
      this.#resizeByDirectionDictionary.block(dialogRect, "end");
      this.#resizeByDirectionDictionary.inline(dialogRect, "end");
    }
  };

  // Refs
  #resizeLayer: HTMLDivElement;
  #dialogRef: HTMLDialogElement;

  @Element() el: HTMLChDialogElement;

  @State() dragging = false;
  @State() relativeDialog = false;
  @State() resizing = false;

  /**
   * `true` if the dialog should be repositioned after resize.
   */
  @Prop() readonly adjustPositionAfterResize: boolean = false;

  /**
   * "box" will allow the dialog to be draggable from both the header and the
   * content. "header" will allow the dialog to be draggable only from the header.
   * "no" disables dragging completely.
   */
  @Prop() readonly allowDrag: "box" | "header" | "no" = "box";

  /**
   * Refers to the dialog title. I will ve visible if 'showHeader´is true.
   */
  @Prop() readonly caption: string;

  /**
   * Specifies whether the dialog is hidden or visible.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop({ mutable: true, reflect: true }) hidden = true;
  @Watch("hidden")
  handleHiddenChange(hidden: boolean) {
    // Schedule update for watchers
    this.#checkBorderSizeWatcher = true;
    this.#checkPositionWatcher = true;

    // Update the dialog visualization
    if (hidden) {
      this.#dialogRef.close();
    } else {
      this.#showModal();
    }
  }

  /**
   * Specifies whether the dialog is a modal or not. Modal dialog boxes
   * interrupt interaction with the rest of the page being inert, while
   * non-modal dialog boxes allow interaction with the rest of the page.
   *
   * Note: If `hidden !== false`, this property does not reflect changes on
   * runtime, since at the time of writing browsers do not support switching
   * from modal to not-modal, (or vice-versa).
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly modal: boolean = true;

  /**
   * Specifies whether the control can be resized. If `true` the control can be
   * resized at runtime by dragging the edges or corners.
   */
  @Prop() readonly resizable: boolean = false;
  @Watch("resizable")
  resizableChanged() {
    // Schedule update for border size watcher
    this.#checkBorderSizeWatcher = true;
  }

  /**
   * Specifies whether the dialog header is hidden or visible.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly showHeader: boolean = true;

  /**
   * Emitted when the dialog is closed.
   */
  @Event() dialogClosed: EventEmitter;

  connectedCallback() {
    // Set RTL watcher
    this.#rtlWatcher = new MutationObserver(() => {
      this.#isRTLDirection = isRTL();

      if (this.#isRTLDirection) {
        this.el.style.setProperty(DIALOG_RTL, DIALOG_RTL_VALUE);
        this.el.classList.add(DIALOG_RTL_CLASS);
      } else {
        this.el.style.removeProperty(DIALOG_RTL);
        this.el.classList.remove(DIALOG_RTL_CLASS);
      }
    });

    // Observe the dir attribute in the document
    this.#rtlWatcher.observe(document.documentElement, {
      attributeFilter: ["dir"]
    });
  }

  componentWillRender() {
    this.#checkPositionWatcher &&= false;

    if (this.#checkBorderSizeWatcher) {
      this.#checkBorderSizeWatcher = false;

      // Wait until the resize edges have been rendered
      requestAnimationFrame(() => {
        this.#setBorderSizeWatcher();
      });
    }
  }

  componentDidLoad() {
    if (!this.hidden) {
      // Schedule update for watchers
      this.#checkBorderSizeWatcher = true;
      this.#checkPositionWatcher = true;
      this.#showModal();
    }

    // Initialize watchers
    this.#setBorderSizeWatcher();
  }

  disconnectedCallback() {
    // Defensive programming. Make sure the document does not have any unwanted handler
    this.#handleDragEnd();
    this.#removeBorderSizeWatcher();

    // Disconnect RTL watcher
    if (this.#rtlWatcher) {
      this.#rtlWatcher.disconnect();
      this.#rtlWatcher = null; // Free the memory
    }

    document.removeEventListener("click", this.#evaluateClickOnDocument, {
      capture: true
    });
  }

  #addDraggingClass = () => {
    if (!this.#dragging) {
      this.#dialogRef.classList.add(DRAGGING_CLASS);
      this.#dragging = true;
    }
  };

  #removeDraggingClass = () => {
    this.#dialogRef.classList.remove(DRAGGING_CLASS);
    this.#dragging = false;
  };

  #handleDialogClose = () => {
    this.hidden = true;
    // Emit events only when the action is committed by the user
    this.dialogClosed.emit();
    document.removeEventListener("click", this.#evaluateClickOnDocument, {
      capture: true
    });
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                           Drag implementation
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  #handleMouseDown = (event: MouseEvent) => {
    // We should not add preventDefault in this instance, because we would
    // prevent some normal actions like clicking a button or focusing an input.

    this.#dragRAF ||= new SyncWithRAF();
    this.#initialDragEvent = event;

    // Add listeners
    document.addEventListener("mousemove", this.#trackElementDragRAF, {
      capture: true
    });

    document.addEventListener("mouseup", this.#handleDragEnd, {
      capture: true,
      passive: true
    });
  };

  #trackElementDragRAF = (event: MouseEvent) => {
    this.#dragRAF.perform(this.#trackElementDrag, () => {
      // Improve drag UX by not selecting any button or clicking interactive elements
      event.preventDefault();

      // We remove the pointer-events and user-select properties after the first
      // "mousemove", otherwise double clicking to select text would not work.

      this.#addDraggingClass();

      this.#lastDragEvent = event;
    });
  };

  #trackElementDrag = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const currentDraggedDistanceX =
      this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;
    const currentDraggedDistanceY =
      this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    // Update total dragged distance in X
    if (currentDraggedDistanceX !== 0) {
      this.#draggedDistanceX += this.#isRTLDirection // Set dragged distance depending on RTL value
        ? -currentDraggedDistanceX
        : currentDraggedDistanceX;
      setProperty(this.el, DIALOG_DRAGGED_X, this.#draggedDistanceX);
    }

    // Update total dragged distance in Y
    if (currentDraggedDistanceY !== 0) {
      this.#draggedDistanceY += currentDraggedDistanceY;
      setProperty(this.el, DIALOG_DRAGGED_Y, this.#draggedDistanceY);
    }

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleDragEnd = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    // Cancel RAF to prevent access to undefined references
    if (this.#dragRAF) {
      this.#dragRAF.cancel();
    }

    // Remove listeners
    document.removeEventListener("mousemove", this.#trackElementDragRAF, {
      capture: true
    });

    document.removeEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });

    this.#removeDraggingClass();

    // Free the memory
    this.#dragRAF = null;
    this.#initialDragEvent = null;
    this.#lastDragEvent = null;
  };

  #showModal = () => {
    if (this.modal) {
      this.#dialogRef.showModal();
      document.addEventListener("click", this.#evaluateClickOnDocument, {
        capture: true
      });
    } else {
      this.#dialogRef.show();
    }
  };

  #closeHandler = () => {
    this.hidden = true;
  };

  #evaluateClickOnDocument = (e: MouseEvent) => {
    const clickWasMadeOutsideTheDialog = !e
      .composedPath()
      .includes(this.#dialogRef);

    if (clickWasMadeOutsideTheDialog) {
      this.#handleDialogClose();
    }
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                          Resize implementation
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  #handleEdgeResize = (edge: ChDialogResizeElement) => (event: MouseEvent) => {
    this.#fixDialogPosition();

    // this.resizing = true;
    this.#resizeRAF ||= new SyncWithRAF();
    this.#currentEdge = edge;
    this.#initialDragEvent = event;

    // Specify the cursor for the resize operation. Useful to avoid showing
    // incorrect cursors during resizing
    resizingCursorDictionary[this.#currentEdge](this.#isRTLDirection);

    // Initialize drag variables to improve block-start and inline-start
    // resizing. Otherwise, the dialog will always remain in the same X and Y
    // position, even when the block-start or inline-start edges are resized
    this.#draggedDistanceXForResize = this.#draggedDistanceX;
    this.#draggedDistanceYForResize = this.#draggedDistanceY;

    // Get minimum and maximum sizes on first resize operation
    const computedStyle = getComputedStyle(this.#dialogRef);
    this.#maxBlockSize = fromPxToNumber(computedStyle.maxBlockSize);
    this.#maxInlineSize = fromPxToNumber(computedStyle.maxInlineSize);
    this.#minBlockSize = fromPxToNumber(computedStyle.minBlockSize);
    this.#minInlineSize = fromPxToNumber(computedStyle.minInlineSize);

    // Avoid watching border changes during the resize
    this.#removeBorderSizeWatcher();

    // Avoid listener on document click
    document.removeEventListener("click", this.#evaluateClickOnDocument, {
      capture: true
    });

    // Add listeners
    document.addEventListener("mousemove", this.#trackElementResizeRAF, {
      capture: true
    });

    document.addEventListener("mouseup", this.#handleResizeEnd, {
      capture: true,
      passive: true
    });
  };

  #trackElementResizeRAF = (event: MouseEvent) => {
    this.#resizeRAF.perform(this.#trackElementResize, () => {
      // Improve drag UX by not selecting any button or clicking interactive
      // elements
      event.preventDefault();

      // We remove the pointer-events and user-select properties after the first
      // "mousemove", otherwise double clicking to select text would not work
      this.#addDraggingClass();

      this.#lastDragEvent = event;
    });
  };

  #trackElementResize = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const dialogRect = this.#dialogRef.getBoundingClientRect();

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    this.#resizeEdgesAndCornersDictionary[this.#currentEdge](dialogRect);

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleResizeEnd = () => {
    if (this.adjustPositionAfterResize) {
      this.#unfixDialogPosition();
    } else {
      // If the resize was performed from a block-start or inline-start edge, or any
      // of the continuous vertices, it is necessary to reset DIALOG_BLOCK_START or
      // DIALOG_INLINE_START, as they configure the block-start or inline-start of
      // the dialog. This is only necessary if the dialog is not repositioned after
      // the resize.
      this.#fixDialogPosition();
    }

    this.resizing = false;

    // Cancel RAF to prevent access to undefined references
    if (this.#resizeRAF) {
      this.#resizeRAF.cancel();
    }

    // Reset document cursor back to normal
    document.body.style.cursor = null;

    // Reset dragged distance to its original value
    setProperty(this.el, DIALOG_DRAGGED_X, this.#draggedDistanceX);
    setProperty(this.el, DIALOG_DRAGGED_Y, this.#draggedDistanceY);

    // Start again watching border size changes
    this.#setBorderSizeWatcher();

    // Remove listeners
    document.removeEventListener("mousemove", this.#trackElementResizeRAF, {
      capture: true
    });

    document.removeEventListener("mouseup", this.#handleResizeEnd, {
      capture: true
    });

    this.#removeDraggingClass();

    // Free the memory
    this.#resizeRAF = null;
    this.#initialDragEvent = null;
    this.#lastDragEvent = null;

    if (this.modal) {
      // requestAnimationFrame is needed to prevent the dialog from closing, by
      // scheduling the close after the document click.

      requestAnimationFrame(() => {
        document.addEventListener("click", this.#evaluateClickOnDocument, {
          capture: true
        });
      });
    }
  };

  /**
   * This observer watches the size of each border in the control to adjust the
   * position of the invisible resize elements (edges and corners).
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #setBorderSizeWatcher = () => {
    if (!this.resizable || this.hidden) {
      this.#removeBorderSizeWatcher();
      return;
    }

    this.#borderSizeRAF ??= new SyncWithRAF();
    this.#borderSizeObserver = new ResizeObserver(this.#updateBorderSizeRAF);

    // Observe the size of the edges to know if the border
    this.#borderSizeObserver.observe(this.el, { box: "border-box" });
    this.#borderSizeObserver.observe(this.#resizeLayer);
  };

  #updateBorderSizeRAF = () => {
    this.#borderSizeRAF.perform(this.#updateBorderSize);
  };

  #updateBorderSize = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const computedStyle = getComputedStyle(this.el);

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    this.el.style.setProperty(
      DIALOG_BORDER_BLOCK_START_SIZE,
      computedStyle.borderBlockStartWidth
    );

    this.el.style.setProperty(
      DIALOG_BORDER_BLOCK_END_SIZE,
      computedStyle.borderBlockEndWidth
    );

    this.el.style.setProperty(
      DIALOG_BORDER_INLINE_START_SIZE,
      computedStyle.borderInlineStartWidth
    );

    this.el.style.setProperty(
      DIALOG_BORDER_INLINE_END_SIZE,
      computedStyle.borderInlineEndWidth
    );
  };

  #removeBorderSizeWatcher = () => {
    if (this.#borderSizeObserver) {
      this.#borderSizeObserver.disconnect();
      this.#borderSizeObserver = null; // Free the memory
    }

    this.#borderSizeRAF = null; // Free the memory
  };

  #fixDialogPosition = () => {
    const dialogRect = this.#dialogRef.getBoundingClientRect();
    const inlineStart = this.#isRTLDirection
      ? document.documentElement.getBoundingClientRect().width -
        (dialogRect.left + dialogRect.width)
      : dialogRect.left;
    const blockStart = dialogRect.top;

    setProperty(
      this.#dialogRef,
      DIALOG_INLINE_START,
      inlineStart - this.#draggedDistanceX
    );
    setProperty(
      this.#dialogRef,
      DIALOG_BLOCK_START,
      blockStart - this.#draggedDistanceY
    );
  };

  #unfixDialogPosition = () => {
    this.#dialogRef.style.removeProperty(DIALOG_INLINE_START);
    this.#dialogRef.style.removeProperty(DIALOG_BLOCK_START);
  };

  render() {
    return (
      <Host
        class={{
          "gx-dialog-header-drag": !this.hidden && this.allowDrag === "header",
          [RESIZING_CLASS]: this.resizing
        }}
      >
        <dialog
          class={this.showHeader ? "dialog--header" : null}
          aria-labelledby={this.caption ? "heading" : null}
          part="dialog"
          onClose={this.#handleDialogClose}
          onMouseDown={this.allowDrag === "box" ? this.#handleMouseDown : null}
          ref={el => (this.#dialogRef = el)}
        >
          {this.showHeader && (
            <div
              class="header"
              part="header"
              onMouseDown={
                this.allowDrag === "header" ? this.#handleMouseDown : null
              }
            >
              {this.caption && (
                <h2 id="heading" part="caption" class="caption">
                  {this.caption}
                </h2>
              )}
              <button
                class="close-button"
                part="close-button"
                type="button"
                onClick={this.#closeHandler}
              ></button>
            </div>
          )}
          <div part="content">
            <slot />
          </div>
          {this.resizable &&
            !this.hidden && [
              <div
                class="edge__block-start"
                part="edge edge-block-start"
                onMouseDown={this.#handleEdgeResize("block-start")}
              ></div>, // Top
              <div
                class="edge__inline-end"
                part="edge edge-inline-end"
                onMouseDown={this.#handleEdgeResize("inline-end")}
              ></div>, // Right
              <div
                class="edge__block-end"
                part="edge edge-block-end"
                onMouseDown={this.#handleEdgeResize("block-end")}
              ></div>, // Bottom
              <div
                class="edge__inline-start"
                part="edge edge-inline-start"
                onMouseDown={this.#handleEdgeResize("inline-start")}
              ></div>, // Left

              <div
                class="corner__block-start-inline-start"
                part="corner corner-block-start-inline-start"
                onMouseDown={this.#handleEdgeResize("block-start-inline-start")}
              ></div>, // Top Left
              <div
                class="corner__block-start-inline-end"
                part="corner corner-block-start-inline-end"
                onMouseDown={this.#handleEdgeResize("block-start-inline-end")}
              ></div>, // Top Right
              <div
                class="corner__block-end-inline-start"
                part="corner corner-block-end-inline-start"
                onMouseDown={this.#handleEdgeResize("block-end-inline-start")}
              ></div>, // Bottom Left
              <div
                class="corner__block-end-inline-end"
                part="corner corner-block-end-inline-end"
                onMouseDown={this.#handleEdgeResize("block-end-inline-end")}
              ></div>, // Bottom Right

              <div
                class="resize-layer"
                ref={el => (this.#resizeLayer = el)}
              ></div>
            ]}
        </dialog>
      </Host>
    );
  }
}

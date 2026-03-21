import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import { forceCSSMinMax } from "../../utilities/force-css-min-max";
import { getAllShadowRootAncestors } from "../../utilities/get-all-shadow-root-ancestors";
import { Host } from "../../utilities/host/host";
import { KEY_CODES } from "../../utilities/reserved-names/key-codes";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import {
  isRTL,
  subscribeToRTLChanges,
  unsubscribeToRTLChanges
} from "../../utilities/rtl-watcher";
import { SyncWithRAF } from "../../utilities/sync-with-frames";
import { adoptCommonThemes } from "../../utilities/theme.js";

import { getDocumentSizes } from "./get-document-sizes";
import type {
  ChPopoverAlign,
  ChPopoverResizeElement,
  ChPopoverSizeMatch,
  PopoverActionElement,
  PopoverClosedInfo
} from "./types";
import { fromPxToNumber, setResponsiveAlignment } from "./utils";

import styles from "./popover.scss?inline";

const DRAGGING_CLASS = "gx-popover-dragging";
const POPOVER_PREVENT_FLICKERING_CLASS = "gx-popover-prevent-flickering";
const RESIZING_CLASS = "ch-popover-resizing";

// Custom vars
const POPOVER_ALIGN_BLOCK = "--ch-popover-block";
const POPOVER_ALIGN_INLINE = "--ch-popover-inline";

const POPOVER_ACTION_WIDTH = "--ch-popover-action-width";
const POPOVER_ACTION_HEIGHT = "--ch-popover-action-height";
const POPOVER_ACTION_LEFT = "--ch-popover-action-left";
const POPOVER_ACTION_TOP = "--ch-popover-action-top";

const POPOVER_DRAGGED_X = "--ch-popover-dragged-x";
const POPOVER_DRAGGED_Y = "--ch-popover-dragged-y";

const POPOVER_BLOCK_SIZE = "--ch-popover-block-size";
const POPOVER_INLINE_SIZE = "--ch-popover-inline-size";

const POPOVER_MIN_BLOCK_SIZE = "--ch-popover-min-block-size";
const POPOVER_MIN_INLINE_SIZE = "--ch-popover-min-inline-size";

const POPOVER_MAX_BLOCK_SIZE = "--ch-popover-max-block-size";
const POPOVER_MAX_INLINE_SIZE = "--ch-popover-max-inline-size";

const POPOVER_FORCED_MAX_BLOCK_SIZE = "--ch-popover-forced-max-block-size";
const POPOVER_FORCED_MAX_INLINE_SIZE = "--ch-popover-forced-max-inline-size";

const POPOVER_BORDER_BLOCK_START_SIZE =
  "--ch-popover-border-block-start-width";
const POPOVER_BORDER_BLOCK_END_SIZE = "--ch-popover-border-block-end-width";
const POPOVER_BORDER_INLINE_START_SIZE =
  "--ch-popover-border-inline-start-width";
const POPOVER_BORDER_INLINE_END_SIZE = "--ch-popover-border-inline-end-width";

const POPOVER_RTL_CLASS = "ch-popover-rtl";
const POPOVER_RTL = "--ch-popover-rtl";
const POPOVER_RTL_VALUE = "-1";

const PRECISION_TO_AVOID_FLOATING_POINT_ERRORS = 1.5;

const addCursorInDocument = (cursor: string) =>
  (document.body.style.cursor = cursor);

const resizingCursorDictionary: {
  [key in ChPopoverResizeElement]: (rtl: boolean) => void;
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
const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

const getProperty = (element: HTMLElement, property: string): number =>
  Number((element.style.getPropertyValue(property) || "0px").replace("px", ""));

const addPopoverTargetElement = (
  actionElement: PopoverActionElement,
  popoverElement: HTMLElement,
  addAction: boolean
) => {
  if (actionElement && addAction) {
    actionElement.popoverTargetElement = popoverElement;
  }
};

const removePopoverTargetElement = (actionElement: PopoverActionElement) => {
  if (actionElement) {
    actionElement.popoverTargetElement = undefined;
  }
};

let autoId = 0;

/**
 * The `ch-popover` component renders a positioned overlay container anchored to a reference element using the native Popover API and `position: fixed`.
 *
 * @remarks
 * ## Features
 *  - Configurable block and inline alignment (inside/outside/center) relative to the action element.
 *  - Optional flip-block or flip-inline fallback when the popover would overflow the viewport.
 *  - Automatic size-matching to the action element.
 *  - Dragging from a dedicated header or the entire box.
 *  - Edge and corner resizing.
 *  - Responsive re-alignment on scroll and resize.
 *  - Full RTL layout support.
 *  - Closes on outside click or Escape.
 *
 * ## Use when
 *  - You need precise, anchor-relative positioning for dropdowns, floating panels, or custom overlays.
 *  - Contextual content that requires more space than a tooltip but less formality than a modal.
 *  - The content includes interactive elements (links, buttons, form inputs, pickers).
 *  - Feature spotlights, overflow menus, or positioned pickers near a trigger.
 *
 * ## Do not use when
 *  - You need simple tooltip-style overlays with hover/focus triggers -- prefer `ch-tooltip` instead.
 *  - You need modal or non-modal dialog boxes -- prefer `ch-dialog` instead.
 *  - Critical content requiring user confirmation — prefer `ch-dialog`.
 *  - Brief, non-interactive supplementary text — prefer `ch-tooltip`.
 *  - Nested inside another popover — always an anti-pattern.
 *
 * ## Accessibility
 *  - Does not impose a semantic role — consuming components are responsible for adding appropriate ARIA attributes (e.g. `role="dialog"`, `role="listbox"`).
 *  - Keyboard: Escape closes the popover and returns focus to the action element.
 *
 * @status experimental
 *
 * @part header - A draggable header area rendered when `allowDrag === "header"`. Projects the "header" slot.
 *
 * @slot header - Content projected into the header area. Rendered when `allowDrag === "header"`.
 * @slot - Default slot. The main content of the popover.
 */
@Component({
  shadow: true,
  styles,
  tag: "ch-popover"
})
export class ChPopover extends KasstorElement {
  #popoverId = `${autoId++}`;

  // Sync computations with frames
  #borderSizeRAF: SyncWithRAF; // Don't allocate memory until needed when dragging
  #dragRAF: SyncWithRAF; // Don't allocate memory until needed when dragging
  #positionAdjustRAF: SyncWithRAF; // Don't allocate memory until needed
  #resizeRAF: SyncWithRAF; // Don't allocate memory until needed when dragging

  #adjustAlignment = false;

  // Watchers
  #checkPositionWatcher = false;
  #checkBorderSizeWatcher = false;
  #borderSizeObserver: ResizeObserver;
  #resizeObserver: ResizeObserver;

  // Drag
  #draggedDistanceX: number = 0;
  #draggedDistanceY: number = 0;
  #dragging = false;
  #initialDragEvent: MouseEvent;
  #lastDragEvent: MouseEvent;
  #isRTLDirection: boolean;

  // Resize
  #currentEdge: ChPopoverResizeElement;
  #draggedDistanceXForResize: number = 0;
  #draggedDistanceYForResize: number = 0;
  #maxBlockSize: number = 0;
  #maxInlineSize: number = 0;
  #minBlockSize: number = 0;
  #minInlineSize: number = 0;
  #resizeWasMade = false;

  #resizeByDirectionDictionary = {
    block: (popoverRect: DOMRect, direction: "start" | "end") => {
      let currentDraggedDistanceY =
        this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;

      // Start direction inverts the increment
      if (direction === "start") {
        currentDraggedDistanceY = -currentDraggedDistanceY;
      }

      const newBlockSize = popoverRect.height + currentDraggedDistanceY;
      const newRestrictedBlockSize = forceCSSMinMax(
        newBlockSize,
        this.#minBlockSize,
        this.#maxBlockSize
      );

      // Do not apply resizes or translations if the control is at the minimum
      // or maximum size
      if (newRestrictedBlockSize === popoverRect.height) {
        return;
      }

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      // By resizing the start edge the control is translated to improve the UX
      if (direction === "start") {
        this.#draggedDistanceYForResize -= currentDraggedDistanceY;

        setProperty(
          this,
          POPOVER_DRAGGED_Y,
          this.#draggedDistanceYForResize
        );
      }

      setProperty(this, POPOVER_BLOCK_SIZE, newRestrictedBlockSize);
    },

    inline: (popoverRect: DOMRect, direction: "start" | "end") => {
      let currentDraggedDistanceX =
        this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;

      if (this.#isRTLDirection) {
        currentDraggedDistanceX = -currentDraggedDistanceX;
      }

      // Start direction inverts the increment
      if (direction === "start") {
        currentDraggedDistanceX = -currentDraggedDistanceX;
      }

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;
      const newRestrictedInlineSize = forceCSSMinMax(
        newInlineSize,
        this.#minInlineSize,
        this.#maxInlineSize
      );

      // Do not apply resizes or translations if the control is at the minimum
      // or maximum size
      if (newRestrictedInlineSize === popoverRect.width) {
        return;
      }

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      // By resizing the start edge the control is translated to improve the UX
      if (direction === "start") {
        this.#draggedDistanceXForResize -= currentDraggedDistanceX;

        setProperty(
          this,
          POPOVER_DRAGGED_X,
          this.#draggedDistanceXForResize
        );
      }

      setProperty(this, POPOVER_INLINE_SIZE, newRestrictedInlineSize);
    }
  } as const;

  #resizeEdgesAndCornersDictionary: {
    [key in ChPopoverResizeElement]: (popoverRect: DOMRect) => void;
  } = {
    "block-start": popoverRect =>
      this.#resizeByDirectionDictionary.block(popoverRect, "start"),

    "block-end": popoverRect =>
      this.#resizeByDirectionDictionary.block(popoverRect, "end"),

    "inline-start": popoverRect =>
      this.#resizeByDirectionDictionary.inline(popoverRect, "start"),

    "inline-end": popoverRect =>
      this.#resizeByDirectionDictionary.inline(popoverRect, "end"),

    "block-start-inline-start": popoverRect => {
      this.#resizeByDirectionDictionary.block(popoverRect, "start");
      this.#resizeByDirectionDictionary.inline(popoverRect, "start");
    },

    "block-start-inline-end": popoverRect => {
      this.#resizeByDirectionDictionary.block(popoverRect, "start");
      this.#resizeByDirectionDictionary.inline(popoverRect, "end");
    },

    "block-end-inline-start": popoverRect => {
      this.#resizeByDirectionDictionary.block(popoverRect, "end");
      this.#resizeByDirectionDictionary.inline(popoverRect, "start");
    },

    "block-end-inline-end": popoverRect => {
      this.#resizeByDirectionDictionary.block(popoverRect, "end");
      this.#resizeByDirectionDictionary.inline(popoverRect, "end");
    }
  };

  // Refs
  #resizeLayerRef: Ref<HTMLDivElement> = createRef();

  /**
   * Array that contains all root nodes. It is only computed when the scroll
   * listeners must be attached to track the position of the `ch-popover`.
   *
   * We need to store the root nodes references in an array, since when the
   * element is disconnected from the DOM (`disconnectedCallback` method), the
   * element is no longer attached to its parent elements and thus we can't
   * compute the array.
   */
  #rootNodes: [Document, ...ShadowRoot[]] | undefined; // Don't allocate memory until needed when dragging

  @state() protected resizing = false;

  /**
   * `true` if the `actionElement` binds the ch-popover using an external ID.
   * If so, the `popoverTargetElement` property won't be configured in the
   * action element.
   */
  @property({ type: Boolean }) actionById: boolean = false;

  /**
   * Specifies a reference of the action that controls the popover control.
   */
  @property() actionElement?: PopoverActionElement;
  @Observe("actionElement")
  protected handleActionChange(
    newActionElement: PopoverActionElement,
    oldActionElement: PopoverActionElement
  ) {
    // Reset dragged distance
    this.#draggedDistanceX = 0;
    this.#draggedDistanceY = 0;

    // Remove previous action element
    removePopoverTargetElement(oldActionElement);
    addPopoverTargetElement(newActionElement, this, !this.actionById);

    // Schedule update for watchers
    this.#checkPositionWatcher = true;
  }

  /**
   * Specifies the drag behavior of the popover.
   * If `allowDrag === "header"`, a slot with the `"header"` name will be
   * available to place the header content.
   */
  @property({ attribute: "allow-drag" }) allowDrag: "box" | "header" | "no" =
    "no";

  /**
   * Specifies the block alignment of the popover relative to its action
   * element. Valid values: `"outside-start"`, `"inside-start"`, `"center"`,
   * `"inside-end"`, `"outside-end"`.
   */
  @property({ attribute: "block-align" }) blockAlign: ChPopoverAlign = "center";
  @Observe("blockAlign")
  protected handleBlockChange() {
    this.#adjustAlignment = true;
  }

  /**
   * Specifies how the popover adapts its block size.
   *  - "content": The block size of the control will be determined by its
   *    content block size.
   *  - "action-element": The block size of the control will match the block
   *    size of the `actionElement`.
   *  - "action-element-as-minimum": The minimum block size of the control
   *    will match the block size of the `actionElement`.
   *
   * If the control is resized at runtime, only the "action-element-as-minimum"
   * value will still work.
   */
  @property({ attribute: "block-size-match" })
  blockSizeMatch: ChPopoverSizeMatch = "content";
  @Observe("blockSizeMatch")
  protected blockSizeWatchChange(newValue: ChPopoverSizeMatch) {
    if (this.#resizeWasMade) {
      return;
    }

    // Remove the size constrains
    if (newValue === "content") {
      this.style.removeProperty(POPOVER_BLOCK_SIZE);
      this.style.removeProperty(POPOVER_MIN_BLOCK_SIZE);
    } else if (newValue === "action-element") {
      this.style.removeProperty(POPOVER_MIN_BLOCK_SIZE);
    } else {
      this.style.removeProperty(POPOVER_BLOCK_SIZE);
    }

    // Queue a position adjustment
    this.#adjustAlignment = true;
  }

  /**
   * This property only applies for `"manual"` mode. In native popovers, when
   * using `"manual"` mode the popover doesn't close when clicking outside the
   * control. This property allows to close the popover when clicking outside
   * in `"manual"` mode.
   * With this, the popover will close if the click is triggered on any other
   * element than the popover and the `actionElement`. It will also close if
   * the "Escape" key is pressed.
   */
  @property({ type: Boolean, attribute: "close-on-click-outside" })
  closeOnClickOutside: boolean = false;

  /**
   * `true` if the popover is not stacked inside another top layer (e.g., not
   * nested within another popover). When `true`, a CSS class is temporarily
   * applied to prevent initial positioning flickering while the popover
   * calculates its alignment.
   */
  @property({ type: Boolean, attribute: "first-layer" })
  firstLayer: boolean = true;

  /**
   * Specifies the inline alignment of the popover relative to its action
   * element. Valid values: `"outside-start"`, `"inside-start"`, `"center"`,
   * `"inside-end"`, `"outside-end"`.
   */
  @property({ attribute: "inline-align" }) inlineAlign: ChPopoverAlign =
    "center";
  @Observe("inlineAlign")
  protected handleInlineChange() {
    this.#adjustAlignment = true;
  }

  /**
   * Specifies how the popover adapts its inline size.
   *  - "content": The inline size of the control will be determined by its
   *    content inline size.
   *  - "action-element": The inline size of the control will match the inline
   *    size of the `actionElement`.
   *  - "action-element-as-minimum": The minimum inline size of the control
   *    will match the inline size of the `actionElement`.
   *
   * If the control is resized at runtime, only the "action-element-as-minimum"
   * value will still work.
   */
  @property({ attribute: "inline-size-match" })
  inlineSizeMatch: ChPopoverSizeMatch = "content";
  @Observe("inlineSizeMatch")
  protected inlineSizeWatchChange(newValue: ChPopoverSizeMatch) {
    if (this.#resizeWasMade) {
      return;
    }

    // Remove the size constrains
    if (newValue === "content") {
      this.style.removeProperty(POPOVER_INLINE_SIZE);
      this.style.removeProperty(POPOVER_MIN_INLINE_SIZE);
    } else if (newValue === "action-element") {
      this.style.removeProperty(POPOVER_MIN_INLINE_SIZE);
    } else {
      this.style.removeProperty(POPOVER_INLINE_SIZE);
    }

    // Queue a position adjustment
    this.#adjustAlignment = true;
  }

  /**
   * Popovers that have the `"auto"` state can be "light dismissed" by
   * selecting outside the popover area, and generally only allow one popover
   * to be displayed on-screen at a time. By contrast, `"manual"` popovers must
   * always be explicitly hidden, but allow for use cases such as nested
   * popovers in menus.
   */
  @property({ attribute: "popover" }) mode: "auto" | "manual" = "auto";
  @Observe("mode")
  protected handleModeChange() {
    this.setAttribute("popover", this.mode);
  }

  /**
   * Specifies how the popover behaves when the content overflows the window
   * size.
   *   - "overflow": The control won't implement any behavior if the content overflows.
   *   - "add-scroll": The control will place a scroll if the content overflows.
   */
  @property({ reflect: true, attribute: "overflow-behavior" })
  overflowBehavior: "overflow" | "add-scroll" = "overflow";

  /**
   * Specifies an alternative position to try when the control overflows the
   * window.
   */
  @property({ attribute: "position-try" })
  positionTry: "flip-block" | "flip-inline" | "none" = "none";

  /**
   * Specifies whether the control can be resized. If `true` the control can be
   * resized at runtime by dragging the edges or corners.
   */
  @property({ type: Boolean }) resizable: boolean = false;
  @Observe("resizable")
  protected resizableChanged() {
    // Schedule update for border size watcher
    this.#checkBorderSizeWatcher = true;
  }

  /**
   * Specifies whether the popover is hidden or visible.
   */
  // TODO: Remove reflect in a future PR (also add a unit test to verify that the
  // property is not reflected and be careful with the selector `:host([show]) {...}` ).
  @property({ type: Boolean, reflect: true }) show: boolean = false;
  @Observe("show")
  protected showChanged(newShowValue: boolean) {
    // Schedule update for watchers
    this.#checkBorderSizeWatcher = true;
    this.#checkPositionWatcher = true;

    // Update the popover visualization
    if (newShowValue) {
      this.#showPopover();
    } else {
      if (this.firstLayer) {
        this.#avoidFlickeringInTheNextRender(true);
      }

      this.#hidePopover();
    }
  }

  /**
   * Emitted when the popover is opened by an user interaction.
   *
   * This event can be prevented (`preventDefault()`), interrupting the
   * ch-popover's opening.
   */
  @Event() protected popoverOpened!: EventEmitter;

  /**
   * Emitted when the popover is closed by an user interaction.
   *
   * This event can be prevented (`preventDefault()`), interrupting the
   * `ch-popover`'s closing.
   *
   * The `reason` property of the event provides more information about
   * the cause of the closing:
   *  - `"click-outside"`: The popover is being closed because the user clicked
   *    outside the popover when using `closeOnClickOutside === true` and
   *    `mode === "manual"`.
   *
   *  - `"escape-key"`: The popover is being closed because the user pressed the
   *    "Escape" key when using `closeOnClickOutside === true` and
   *    `mode === "manual"`.
   *
   *  - `"popover-no-longer-visible"`: The popover is being closed because it
   *    is no longer visible.
   *
   *  - `"toggle"`: The popover is being closed by the native toggle behavior
   *    of popover. It can be produced by the user clicking the `actionElement`,
   *    pressing the "Enter" or "Space" keys on the `actionElement`, pressing
   *    the "Escape" key or other. Used when `mode === "auto"`.
   */
  @Event() protected popoverClosed!: EventEmitter<PopoverClosedInfo>;

  #showPopover = () => {
    this.showPopover();
    this.#addClickOutsideWatcherIfNecessary();
  };

  #hidePopover = () => {
    this.hidePopover();
    this.#removeClickOutsideWatcher(); // TODO: Add unit test for this, since it avoid memory leaks
  };

  // TODO: Add unit tests for this feature
  #closePopoverIfNotDefaultPrevented = (
    reason: PopoverClosedInfo,
    event?: Event
  ) => {
    const eventInfo = this.popoverClosed.emit(reason);

    if (eventInfo.defaultPrevented) {
      event?.preventDefault();
      return;
    }

    // Only close the popover if the action was not prevented
    this.show = false;
  };

  #handlePopoverCloseOnClickOutside = (event: MouseEvent) => {
    const composedPath = event.composedPath();

    if (
      !composedPath.includes(this) &&
      // If the click is triggered on the actionElement, the actionElement must
      // determine if the popover should be closed
      !composedPath.includes(this.actionElement)
    ) {
      this.#closePopoverIfNotDefaultPrevented(
        { reason: "click-outside" },
        event
      );
    }
  };

  #handlePopoverCloseOnEscapeKey = (event: KeyboardEvent) => {
    if (event.code === KEY_CODES.ESCAPE) {
      this.#closePopoverIfNotDefaultPrevented({ reason: "escape-key" }, event);
    }
  };

  #addClickOutsideWatcherIfNecessary = () => {
    if (this.mode === "manual" && this.closeOnClickOutside) {
      document.addEventListener(
        "click",
        this.#handlePopoverCloseOnClickOutside,
        // "capture: true" must be added for the ch-combo-box use case. When
        // the click is triggered on the combo-box, the control prevents the
        // propagation of the event click
        { capture: true, passive: true }
      );

      document.addEventListener(
        "keydown",
        this.#handlePopoverCloseOnEscapeKey,
        { capture: true, passive: true }
      );
    }
  };

  #removeClickOutsideWatcher = () => {
    document.removeEventListener(
      "click",
      this.#handlePopoverCloseOnClickOutside,
      { capture: true }
    );

    document.removeEventListener(
      "keydown",
      this.#handlePopoverCloseOnEscapeKey,
      { capture: true }
    );
  };

  #addDraggingClass = () => {
    if (!this.#dragging) {
      this.classList.add(DRAGGING_CLASS);
      this.#dragging = true;
    }
  };

  #removeDraggingClass = () => {
    this.classList.remove(DRAGGING_CLASS);
    this.#dragging = false;
  };

  #avoidFlickeringInTheNextRender = (addClass: boolean) => {
    if (addClass) {
      // Class to prevent flickering in the first position adjustment
      this.classList.add(POPOVER_PREVENT_FLICKERING_CLASS);
    } else {
      this.classList.remove(POPOVER_PREVENT_FLICKERING_CLASS);
    }
  };

  #setPositionWatcher = () => {
    if (!this.actionElement || !this.show) {
      this.#removePositionWatcher();
      return;
    }

    // If it was observing the previous container, disconnect the observer
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }

    // TODO: This memory is never released
    this.#positionAdjustRAF ??= new SyncWithRAF();

    this.#resizeObserver ??= new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        const popoverWasResized = entries.find(
          entry => entry.target === this
        );

        // If the popover size is changed, update the alignment in the same
        // frame to avoid any flickering. This optimization avoids an extra
        // setResponsiveAlignment fire and improve the UX when using the
        // combo-box and expanding/collapsing the groups
        if (popoverWasResized) {
          this.#updatePosition();
        } else {
          this.#updatePositionRAF();
        }
      }
    );

    this.#resizeObserver.observe(this.actionElement);
    this.#resizeObserver.observe(document.body);
    this.#resizeObserver.observe(this);

    // Faster first render. Don't wait until the next animation frame
    this.#updatePosition();

    // The popover's position is now set, so we no longer have to hide it
    if (this.firstLayer) {
      requestAnimationFrame(() => {
        this.#avoidFlickeringInTheNextRender(false);
      });
    }

    // TODO: Add a unit test for this
    // Get all root nodes to attach the scroll listener, since the scroll event
    // does not bubble and therefore, we can't track all scroll events if we
    // only attach the scroll listener in the document node
    this.#rootNodes ??= getAllShadowRootAncestors(this);

    // Listeners
    this.#rootNodes.forEach(rootNode =>
      rootNode.addEventListener("scroll", this.#updatePositionRAF, {
        capture: true,
        passive: true
      })
    );

    // We must observe the actual viewport size, because observing the
    // document.body does not work when the browser's window is resized
    // and the body has scrollbars.
    // Also, passive mode is not supported in the "resize" event, because this
    // event can not be prevented
    window.addEventListener("resize", this.#updatePositionRAF);
  };

  #updatePositionRAF = () => {
    this.#positionAdjustRAF.perform(this.#updatePosition);
  };

  #updatePosition = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const documentRect = getDocumentSizes();
    const actionRect = this.actionElement.getBoundingClientRect();
    const popoverScrollSizes = {
      width: this.scrollWidth,
      height: this.scrollHeight
    };
    const computedStyle = getComputedStyle(this);

    const actionInlineStart = this.#getActionInlineStartPosition(
      documentRect,
      actionRect
    );

    this.#setResponsiveAlignment(
      documentRect,
      actionRect,
      actionInlineStart,
      popoverScrollSizes,
      computedStyle
    );

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    setProperty(this, POPOVER_ACTION_WIDTH, actionRect.width);
    setProperty(this, POPOVER_ACTION_HEIGHT, actionRect.height);
    setProperty(this, POPOVER_ACTION_LEFT, actionInlineStart);
    setProperty(this, POPOVER_ACTION_TOP, actionRect.top);
  };

  #getActionInlineStartPosition = (
    documentRect: { width: number; height: number },
    actionRect: DOMRect
  ) =>
    this.#isRTLDirection
      ? documentRect.width - (actionRect.left + actionRect.width)
      : actionRect.left;

  #setResponsiveAlignment = (
    documentRect: { width: number; height: number },
    actionRect: DOMRect,
    actionInlineStart: number,
    popoverScrollSizes: { width: number; height: number },
    computedStyle: CSSStyleDeclaration
  ) => {
    const popoverWidth = this.#getPopoverInlineSizeAndFixItIfNecessary(
      actionRect,
      popoverScrollSizes
    );
    const popoverHeight = this.#getPopoverBlockSizeAndFixItIfNecessary(
      actionRect,
      popoverScrollSizes
    );

    // TODO: Add e2e tests for this
    // We need to check if a maximum width/height for the popover was defined
    // to give more priority to that value, instead of the actual width/height,
    // even if the width/height comes from "action-element-as-minimum"
    const maxInlineSizeCustomVarValue = computedStyle.getPropertyValue(
      POPOVER_MAX_INLINE_SIZE
    );
    const maxBlockSizeCustomVarValue = computedStyle.getPropertyValue(
      POPOVER_MAX_BLOCK_SIZE
    );

    let actualPopoverWidth = popoverWidth;
    let actualPopoverHeight = popoverHeight;

    // We only support "px" for the max-block-size and max-inline-size custom
    // var values
    // TODO: Add e2e tests for this
    try {
      if (maxInlineSizeCustomVarValue.endsWith("px")) {
        actualPopoverWidth = Math.min(
          actualPopoverWidth,
          Number(maxInlineSizeCustomVarValue.replace("px", "").trim())
        );
      }
      if (maxBlockSizeCustomVarValue.endsWith("px")) {
        actualPopoverHeight = Math.min(
          actualPopoverHeight,
          Number(maxBlockSizeCustomVarValue.replace("px", "").trim())
        );
      }
    } catch {
      //
    }

    const alignment = setResponsiveAlignment(
      documentRect,
      actionRect,
      actionInlineStart,
      actualPopoverWidth,
      actualPopoverHeight,
      computedStyle,
      this.inlineAlign,
      this.blockAlign,
      this.positionTry
    );

    const inlineOverflow = alignment[0].alignmentOverflow;
    const blockOverflow = alignment[1].alignmentOverflow;

    this.#setOverflowBehavior(
      actualPopoverWidth,
      actualPopoverHeight,
      inlineOverflow,
      blockOverflow
    );

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    setProperty(this, POPOVER_ALIGN_INLINE, alignment[0].alignmentPosition);
    setProperty(this, POPOVER_ALIGN_BLOCK, alignment[1].alignmentPosition);
  };

  #setOverflowBehavior = (
    popoverWidth: number,
    popoverHeight: number,
    inlineOverflow: number,
    blockOverflow: number
  ) => {
    if (this.overflowBehavior !== "add-scroll") {
      return;
    }

    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const currentMaxInlineSize = getProperty(
      this,
      POPOVER_FORCED_MAX_INLINE_SIZE
    );

    const currentMaxBlockSize = getProperty(
      this,
      POPOVER_FORCED_MAX_BLOCK_SIZE
    );

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -

    // Inline size
    if (inlineOverflow < 0) {
      const newMaxInlineSize = popoverWidth + inlineOverflow;

      // TODO: Add e2e tests for this
      // TODO: We must implement a property to configure the behavior of these
      // kinds of situations
      // Close the popover if it won't be visible.
      if (newMaxInlineSize <= PRECISION_TO_AVOID_FLOATING_POINT_ERRORS) {
        return this.#closePopoverIfNotDefaultPrevented({
          reason: "popover-no-longer-visible"
        });
      }

      setProperty(this, POPOVER_FORCED_MAX_INLINE_SIZE, newMaxInlineSize);
    }
    // Check if the forced inline size is no longer needed
    else if (
      currentMaxInlineSize &&
      popoverWidth + PRECISION_TO_AVOID_FLOATING_POINT_ERRORS <
        currentMaxInlineSize + inlineOverflow
    ) {
      this.style.removeProperty(POPOVER_FORCED_MAX_INLINE_SIZE);
    }

    // Block size
    if (blockOverflow < 0) {
      const newMaxBlockSize = popoverHeight + blockOverflow;

      // TODO: Add e2e tests for this
      // TODO: We must implement a property to configure the behavior of these
      // kinds of situations
      // Close the popover if it won't be visible.
      if (newMaxBlockSize <= PRECISION_TO_AVOID_FLOATING_POINT_ERRORS) {
        return this.#closePopoverIfNotDefaultPrevented({
          reason: "popover-no-longer-visible"
        });
      }

      setProperty(this, POPOVER_FORCED_MAX_BLOCK_SIZE, newMaxBlockSize);
    }
    // Check if the forced block size is no longer needed
    else if (
      currentMaxBlockSize &&
      popoverHeight + PRECISION_TO_AVOID_FLOATING_POINT_ERRORS <
        currentMaxBlockSize + blockOverflow
    ) {
      this.style.removeProperty(POPOVER_FORCED_MAX_BLOCK_SIZE);
    }
  };

  #getPopoverInlineSizeAndFixItIfNecessary = (
    actionRect: DOMRect,
    popoverRect: { width: number; height: number }
  ) => {
    if (this.inlineSizeMatch === "action-element-as-minimum") {
      setProperty(this, POPOVER_MIN_INLINE_SIZE, actionRect.width);

      // TODO: Add e2e tests for this
      return Math.max(actionRect.width, popoverRect.width);
    }

    // Size is determined by the content
    if (this.#resizeWasMade || this.inlineSizeMatch === "content") {
      return popoverRect.width;
    }

    // Size is the same as the `actionElement`
    setProperty(this, POPOVER_INLINE_SIZE, actionRect.width);
    return actionRect.width;
  };

  #getPopoverBlockSizeAndFixItIfNecessary = (
    actionRect: DOMRect,
    popoverRect: { width: number; height: number }
  ) => {
    if (this.blockSizeMatch === "action-element-as-minimum") {
      setProperty(this, POPOVER_MIN_BLOCK_SIZE, actionRect.height);

      // TODO: Add e2e tests for this
      return Math.max(actionRect.height, popoverRect.height);
    }

    // Size is determined by the content
    if (this.#resizeWasMade || this.blockSizeMatch === "content") {
      return popoverRect.height;
    }

    // Size is the same as the `actionElement`
    setProperty(this, POPOVER_BLOCK_SIZE, actionRect.height);
    return actionRect.height;
  };

  #removePositionWatcher = () => {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null; // Free the memory
    }

    // TODO: Add a unit test for this
    // Remove listeners in each root node
    this.#rootNodes?.forEach(rootNode =>
      rootNode?.removeEventListener("scroll", this.#updatePositionRAF, {
        capture: true
      })
    );
    window.removeEventListener("resize", this.#updatePositionRAF);

    // Delete references for root nodes to any avoid memory leak
    this.#rootNodes = undefined;
  };

  #handlePopoverToggle = (event: ToggleEvent) => {
    const willBeOpen = event.newState === "open";
    let eventInfo: CustomEvent<any> | undefined;

    // Emit events only when the action is committed by the user
    if (willBeOpen) {
      eventInfo = this.popoverOpened.emit();
    } else {
      // If the popover is already closed, don't emit the event again
      // This can happen when:
      //  - The "Escape" key is pressed in mode === "manual"
      //  - The user clicks outside the popover in mode === "manual"
      //  - The show property is changed to false externally
      //  - The user scrolls the window and the popover is no longer visible
      // TODO: Add e2e tests for this
      if (!this.show) {
        return;
      }

      eventInfo = this.popoverClosed.emit({ reason: "toggle" });
    }

    // TODO: Add unit tests for this feature
    if (eventInfo.defaultPrevented) {
      event.preventDefault();
      return;
    }

    // Only open the popover if the action was not prevented
    this.show = willBeOpen;
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                           Drag implementation
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  #handleMouseDown = (event: MouseEvent) => {
    // We should not add preventDefault in this instance, because we would
    // prevent some normal actions like clicking a button or focusing an input

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
      // Improve drag UX by not selecting any button or clicking interactive
      // elements
      event.preventDefault();

      // We remove the pointer-events and user-select properties after the first
      // "mousemove", otherwise double clicking to select text would not work
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
      setProperty(this, POPOVER_DRAGGED_X, this.#draggedDistanceX);
    }

    // Update total dragged distance in Y
    if (currentDraggedDistanceY !== 0) {
      this.#draggedDistanceY += currentDraggedDistanceY;
      setProperty(this, POPOVER_DRAGGED_Y, this.#draggedDistanceY);
    }

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleDragEnd = () => {
    // Cancel RAF to prevent access to undefined references
    this.#dragRAF?.cancel();

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

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                          Resize implementation
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  #handleEdgeResize = (edge: ChPopoverResizeElement) => (event: MouseEvent) => {
    this.resizing = true;
    this.#resizeRAF ||= new SyncWithRAF();
    this.#currentEdge = edge;
    this.#initialDragEvent = event;

    // Specify the cursor for the resize operation. Useful to avoid showing
    // incorrect cursors during resizing
    resizingCursorDictionary[this.#currentEdge](this.#isRTLDirection);

    // Initialize drag variables to improve block-start and inline-start
    // resizing. Otherwise, the popover will always remain in the same X and Y
    // position, even when the block-start or inline-start edges are resized
    this.#draggedDistanceXForResize = this.#draggedDistanceX;
    this.#draggedDistanceYForResize = this.#draggedDistanceY;

    // Get minimum and maximum sizes on first resize operation
    const computedStyle = getComputedStyle(this);
    this.#maxBlockSize = fromPxToNumber(computedStyle.maxBlockSize);
    this.#maxInlineSize = fromPxToNumber(computedStyle.maxInlineSize);
    this.#minBlockSize = fromPxToNumber(computedStyle.minBlockSize);
    this.#minInlineSize = fromPxToNumber(computedStyle.minInlineSize);

    // Avoid repositioning the popover
    this.#removePositionWatcher();

    // Avoid watching border changes during the resize
    this.#removeBorderSizeWatcher();

    // Avoid closing the popover during the resize
    this.#removeClickOutsideWatcher();

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
    const popoverRect = this.getBoundingClientRect();

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    this.#resizeEdgesAndCornersDictionary[this.#currentEdge](popoverRect);
    this.#resizeWasMade = true;

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleResizeEnd = () => {
    this.resizing = false;

    // Cancel RAF to prevent access to undefined references
    this.#resizeRAF?.cancel();

    // Reset document cursor back to normal
    document.body.style.cursor = null;

    // Reset dragged distance to its original value
    setProperty(this, POPOVER_DRAGGED_X, this.#draggedDistanceX);
    setProperty(this, POPOVER_DRAGGED_Y, this.#draggedDistanceY);

    // Update the position of the popover when the resize ends
    this.#setPositionWatcher();

    // Start again watching border size changes
    this.#setBorderSizeWatcher();

    // Add again the click outside watcher if necessary. RAF is needed to
    // prevent the popover from closing, since the document click event will be
    // dispatched after the execution of this function (mouseup handler)
    requestAnimationFrame(this.#addClickOutsideWatcherIfNecessary);

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
  };

  /**
   * This observer watches the size of each border in the control to adjust the
   * position of the invisible resize elements (edges and corners).
   */
  #setBorderSizeWatcher = () => {
    if (!this.resizable || !this.show) {
      this.#removeBorderSizeWatcher();
      return;
    }

    this.#borderSizeRAF ??= new SyncWithRAF();
    this.#borderSizeObserver = new ResizeObserver(this.#updateBorderSizeRAF);

    // Observe the size of the edges to know if the border
    this.#borderSizeObserver.observe(this, { box: "border-box" });
    this.#borderSizeObserver.observe(this.#resizeLayerRef.value);
  };

  #updateBorderSizeRAF = () => {
    this.#borderSizeRAF.perform(this.#updateBorderSize);
  };

  #updateBorderSize = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const computedStyle = getComputedStyle(this);

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    this.style.setProperty(
      POPOVER_BORDER_BLOCK_START_SIZE,
      computedStyle.borderBlockStartWidth
    );

    this.style.setProperty(
      POPOVER_BORDER_BLOCK_END_SIZE,
      computedStyle.borderBlockEndWidth
    );

    this.style.setProperty(
      POPOVER_BORDER_INLINE_START_SIZE,
      computedStyle.borderInlineStartWidth
    );

    this.style.setProperty(
      POPOVER_BORDER_INLINE_END_SIZE,
      computedStyle.borderInlineEndWidth
    );
  };

  #removeBorderSizeWatcher = () => {
    if (this.#borderSizeObserver) {
      this.#borderSizeObserver.disconnect();
      this.#borderSizeObserver = null; // Free the memory
    }

    // TODO: Add a unit test to ensure the queued RAF is canceled
    this.#borderSizeRAF?.cancel();
    this.#borderSizeRAF = null; // Free the memory
  };

  #updatePositionWithRTL = (rtl: boolean) => {
    this.#isRTLDirection = rtl;

    if (rtl) {
      this.style.setProperty(POPOVER_RTL, POPOVER_RTL_VALUE);
      this.classList.add(POPOVER_RTL_CLASS);
    } else {
      this.style.removeProperty(POPOVER_RTL);
      this.classList.remove(POPOVER_RTL_CLASS);
    }
  };

  override connectedCallback() {
    super.connectedCallback();

    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);

    // Set the popover attribute to match the mode property
    this.setAttribute("popover", this.mode);

    // Set RTL watcher
    subscribeToRTLChanges(this.#popoverId, this.#updatePositionWithRTL);

    // Initialize RTL position
    this.#updatePositionWithRTL(isRTL());

    if (this.firstLayer) {
      this.#avoidFlickeringInTheNextRender(true);
    }
  }

  override firstUpdated() {
    // Initialize popoverTargetElement
    addPopoverTargetElement(this.actionElement, this, !this.actionById);

    // Initialize watchers
    this.#setPositionWatcher();
    this.#setBorderSizeWatcher();

    if (this.show) {
      this.#showPopover();
    }
  }

  override willUpdate() {
    if (this.#checkPositionWatcher) {
      this.#checkPositionWatcher = false;

      // Update watchers
      this.#setPositionWatcher();
    }

    if (this.#checkBorderSizeWatcher) {
      this.#checkBorderSizeWatcher = false;

      // Wait until the resize edges have been rendered
      requestAnimationFrame(() => {
        this.#setBorderSizeWatcher();
      });
    }

    if (this.#adjustAlignment) {
      this.#adjustAlignment = false;

      if (this.actionElement && this.show) {
        const documentRect = getDocumentSizes();
        const actionRect = this.actionElement.getBoundingClientRect();
        const popoverScrollSizes = {
          width: this.scrollWidth,
          height: this.scrollHeight
        };
        const computedStyle = getComputedStyle(this);

        const actionInlineStart = this.#getActionInlineStartPosition(
          documentRect,
          actionRect
        );

        this.#setResponsiveAlignment(
          documentRect,
          actionRect,
          actionInlineStart,
          popoverScrollSizes,
          computedStyle
        );
      }
    }
  }

  override disconnectedCallback() {
    this.#removePositionWatcher();
    this.#removeBorderSizeWatcher();

    // If the action element still exists, remove the reference
    removePopoverTargetElement(this.actionElement);

    // Defensive programming. Make sure the document does not have any unwanted handler
    this.#handleDragEnd();

    // Avoid leaving handlers in the document
    this.#removeClickOutsideWatcher(); // TODO: Add unit test for this, since it avoid memory leaks

    // Disconnect RTL watcher to avoid memory leaks
    unsubscribeToRTLChanges(this.#popoverId);

    super.disconnectedCallback();
  }

  override render() {
    const canAddListeners = this.show;

    Host(this, {
      class: {
        "gx-popover-header-drag":
          canAddListeners && this.allowDrag === "header",
        [RESIZING_CLASS]: this.resizing,
        [SCROLLABLE_CLASS]: this.overflowBehavior === "add-scroll"
      },
      events: {
        // TODO: Add beforetoggle listener to properly support preventing the natural toggle
        // TODO: Should we add this event with popover="manual"???
        // TODO: Check if the actionElement is an instance of Button to add this handler
        toggle: this.#handlePopoverToggle,
        mousedown:
          canAddListeners && this.allowDrag === "box"
            ? this.#handleMouseDown
            : null
      }
    });

    return html`${this.allowDrag === "header"
        ? html`<div
            class="header"
            part="header"
            @mousedown=${canAddListeners ? this.#handleMouseDown : null}
          >
            <slot name="header"></slot>
          </div>`
        : nothing}

      <slot></slot>

      ${this.resizable && this.show
        ? html`<div
              class="edge__block-start"
              @mousedown=${this.#handleEdgeResize("block-start")}
            ></div>
            <!-- Top -->
            <div
              class="edge__inline-end"
              @mousedown=${this.#handleEdgeResize("inline-end")}
            ></div>
            <!-- Right -->
            <div
              class="edge__block-end"
              @mousedown=${this.#handleEdgeResize("block-end")}
            ></div>
            <!-- Bottom -->
            <div
              class="edge__inline-start"
              @mousedown=${this.#handleEdgeResize("inline-start")}
            ></div>
            <!-- Left -->

            <div
              class="corner__block-start-inline-start"
              @mousedown=${this.#handleEdgeResize("block-start-inline-start")}
            ></div>
            <!-- Top Left -->
            <div
              class="corner__block-start-inline-end"
              @mousedown=${this.#handleEdgeResize("block-start-inline-end")}
            ></div>
            <!-- Top Right -->
            <div
              class="corner__block-end-inline-start"
              @mousedown=${this.#handleEdgeResize("block-end-inline-start")}
            ></div>
            <!-- Bottom Left -->
            <div
              class="corner__block-end-inline-end"
              @mousedown=${this.#handleEdgeResize("block-end-inline-end")}
            ></div>
            <!-- Bottom Right -->

            <div class="resize-layer" ${ref(this.#resizeLayerRef)}></div>`
        : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-popover": ChPopover;
  }
}

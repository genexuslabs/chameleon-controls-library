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
import {
  ChPopoverAlign,
  ChPopoverResizeElement,
  PopoverActionElement
} from "./types";
import { isRTL } from "../../common/utils";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { getAlignmentValue } from "./utils";

const DRAGGING_CLASS = "gx-popover-dragging";
const POPOVER_PREVENT_FLICKERING_CLASS = "gx-popover-prevent-flickering";

// Custom vars
const POPOVER_ALIGN_BLOCK = "--ch-popover-block";
const POPOVER_ALIGN_INLINE = "--ch-popover-inline";

const POPOVER_SEPARATION_X = "--ch-popover-separation-x";
const POPOVER_SEPARATION_Y = "--ch-popover-separation-y";

const POPOVER_ACTION_WIDTH = "--ch-popover-action-width";
const POPOVER_ACTION_HEIGHT = "--ch-popover-action-height";
const POPOVER_ACTION_LEFT = "--ch-popover-action-left";
const POPOVER_ACTION_TOP = "--ch-popover-action-top";

const POPOVER_DRAGGED_X = "--ch-popover-dragged-x";
const POPOVER_DRAGGED_Y = "--ch-popover-dragged-y";

const POPOVER_BLOCK_SIZE = "--ch-popover-block-size";
const POPOVER_INLINE_SIZE = "--ch-popover-inline-size";

const POPOVER_RTL = "--ch-popover-rtl";
const POPOVER_RTL_VALUE = "-1";

// Utils
const fromPxToNumber = (pxValue: string) =>
  Number(pxValue.replace("px", "").trim());

const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

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

/**
 * The `ch-popover` component represents a popover container that is positioned
 * relative to an element, but placed on the top layer using `position: fixed`.
 */
@Component({
  tag: "ch-popover",
  styleUrl: "popover.scss",
  shadow: true
})
export class ChPopover {
  // Sync computations with frames
  #dragRAF: SyncWithRAF; // Don't allocate memory until needed when dragging
  #positionAdjustRAF: SyncWithRAF; // Don't allocate memory until needed
  #resizeRAF: SyncWithRAF; // Don't allocate memory until needed when dragging

  #adjustAlignment = false;

  // Watchers
  #checkWatchers = false;
  #resizeObserver: ResizeObserver;
  #rtlWatcher: MutationObserver;

  // Drag
  #draggedDistanceX: number = 0;
  #draggedDistanceY: number = 0;
  #dragging = false;
  #initialDragEvent: MouseEvent;
  #lastDragEvent: MouseEvent;
  #isRTLDirection: boolean;

  // Resize
  #currentEdge: ChPopoverResizeElement;
  #resizeDictionary: {
    [key in ChPopoverResizeElement]: (popoverRect: DOMRect) => void;
  } = {
    "block-start": popoverRect => {
      const currentDraggedDistanceY =
        this.#initialDragEvent.clientY - this.#lastDragEvent.clientY;

      const newBlockSize = popoverRect.height + currentDraggedDistanceY;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_BLOCK_SIZE, newBlockSize);
    },

    "block-end": popoverRect => {
      const currentDraggedDistanceY =
        this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;

      const newBlockSize = popoverRect.height + currentDraggedDistanceY;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_BLOCK_SIZE, newBlockSize);
    },

    "inline-start": popoverRect => {
      const currentDraggedDistanceX =
        this.#initialDragEvent.clientX - this.#lastDragEvent.clientX;

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_INLINE_SIZE, newInlineSize);
    },

    "inline-end": popoverRect => {
      const currentDraggedDistanceX =
        this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_INLINE_SIZE, newInlineSize);
    },

    "block-start-inline-start": popoverRect => {
      const currentDraggedDistanceY =
        this.#initialDragEvent.clientY - this.#lastDragEvent.clientY;
      const currentDraggedDistanceX =
        this.#initialDragEvent.clientX - this.#lastDragEvent.clientX;

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;
      const newBlockSize = popoverRect.height + currentDraggedDistanceY;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_BLOCK_SIZE, newBlockSize);
      setProperty(this.el, POPOVER_INLINE_SIZE, newInlineSize);
    },

    "block-start-inline-end": popoverRect => {
      const currentDraggedDistanceY =
        this.#initialDragEvent.clientY - this.#lastDragEvent.clientY;
      const currentDraggedDistanceX =
        this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;
      const newBlockSize = popoverRect.height + currentDraggedDistanceY;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_BLOCK_SIZE, newBlockSize);
      setProperty(this.el, POPOVER_INLINE_SIZE, newInlineSize);
    },

    "block-end-inline-start": popoverRect => {
      const currentDraggedDistanceY =
        this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;
      const currentDraggedDistanceX =
        this.#initialDragEvent.clientX - this.#lastDragEvent.clientX;

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;
      const newBlockSize = popoverRect.height + currentDraggedDistanceY;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_BLOCK_SIZE, newBlockSize);
      setProperty(this.el, POPOVER_INLINE_SIZE, newInlineSize);
    },

    "block-end-inline-end": popoverRect => {
      const currentDraggedDistanceY =
        this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;
      const currentDraggedDistanceX =
        this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;

      const newInlineSize = popoverRect.width + currentDraggedDistanceX;
      const newBlockSize = popoverRect.height + currentDraggedDistanceY;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_BLOCK_SIZE, newBlockSize);
      setProperty(this.el, POPOVER_INLINE_SIZE, newInlineSize);
    }
  };

  // Refs
  #windowRef: Window;

  @Element() el: HTMLChPopoverElement;

  @State() actualBlockAlign: ChPopoverAlign;
  @State() actualInlineAlign: ChPopoverAlign;
  @State() relativePopover = false;

  /**
   * `true` if the `actionElement` binds the ch-popover using an external ID.
   * If so, the `popoverTargetElement` property won't be configured in the
   * action element.
   */
  @Prop() readonly actionById: boolean = false;

  /**
   * Specifies a reference of the action that controls the popover control.
   */
  @Prop() readonly actionElement?: PopoverActionElement;
  @Watch("actionElement")
  handleActionChange(
    newActionElement: PopoverActionElement,
    oldActionElement: PopoverActionElement
  ) {
    // Reset dragged distance
    this.#draggedDistanceX = 0;
    this.#draggedDistanceY = 0;

    // Remove previous action element
    removePopoverTargetElement(oldActionElement);
    addPopoverTargetElement(newActionElement, this.el, !this.actionById);

    // Schedule update for watchers
    this.#checkWatchers = true;
  }

  /**
   * Specifies the drag behavior of the popover.
   * If `allowDrag === "header"`, a slot with the `"header"` name will be
   * available to place the header content.
   */
  @Prop() readonly allowDrag: "box" | "header" | "no" = "no";

  /**
   * Specifies the block alignment of the window.
   */
  @Prop() readonly blockAlign: ChPopoverAlign = "center";
  @Watch("blockAlign")
  handleBlockChange() {
    this.#adjustAlignment = true;
  }

  /**
   * `true` if the control is not stacked with another top layer.
   */
  @Prop() readonly firstLayer: boolean = true;

  /**
   * Specifies whether the popover is hidden or visible.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop({ mutable: true, reflect: true }) hidden = true;
  @Watch("hidden")
  handleHiddenChange(newHiddenValue: boolean) {
    // Schedule update for watchers
    this.#checkWatchers = true;

    // Update the popover visualization
    if (newHiddenValue) {
      if (this.firstLayer) {
        this.#avoidFlickeringInTheNextRender(true);
      }

      this.el.hidePopover();
    } else {
      this.el.showPopover();
    }
  }

  /**
   * Specifies the inline alignment of the window.
   */
  @Prop() readonly inlineAlign: ChPopoverAlign = "center";
  @Watch("inlineAlign")
  handleInlineChange() {
    this.#adjustAlignment = true;
  }

  /**
   * Popovers that have the `"auto"` state can be "light dismissed" by
   * selecting outside the popover area, and generally only allow one popover
   * to be displayed on-screen at a time. By contrast, `"manual"` popovers must
   * always be explicitly hidden, but allow for use cases such as nested
   * popovers in menus.
   */
  @Prop() readonly mode: "auto" | "manual" = "auto";

  /**
   * Specifies if the popover is automatically aligned is the content overflow
   * the window.
   */
  @Prop() readonly responsiveAlignment: boolean = true;

  /**
   * Specifies whether the control can be resized. If `true` the control can be
   * resized at runtime by dragging the edges or corners.
   */
  @Prop() readonly resizable: boolean = false;

  /**
   * Emitted when the popover is opened.
   */
  @Event() popoverOpened: EventEmitter;

  /**
   * Emitted when the popover is closed.
   */
  @Event() popoverClosed: EventEmitter;

  #addDraggingClass = () => {
    if (!this.#dragging) {
      this.el.classList.add(DRAGGING_CLASS);
      this.#dragging = true;
    }
  };

  #removeDraggingClass = () => {
    this.el.classList.remove(DRAGGING_CLASS);
    this.#dragging = false;
  };

  #avoidFlickeringInTheNextRender = (addClass: boolean) => {
    if (addClass) {
      // Class to prevent flickering in the first position adjustment
      this.el.classList.add(POPOVER_PREVENT_FLICKERING_CLASS);
    } else {
      this.el.classList.remove(POPOVER_PREVENT_FLICKERING_CLASS);
    }
  };

  #setPositionWatcher = () => {
    if (!this.actionElement || this.hidden) {
      this.#removePositionWatcher();
      return;
    }

    // If it was observing the previous container, disconnect the observer
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }

    this.#positionAdjustRAF ??= new SyncWithRAF();
    this.#resizeObserver ??= new ResizeObserver(this.#updatePositionRAF);

    this.#resizeObserver.observe(this.actionElement);
    this.#resizeObserver.observe(this.el);

    // Faster first render. Don't wait until the next animation frame
    this.#updatePosition();

    // The popover's position is now set, so we no longer have to hide it
    if (this.firstLayer) {
      requestAnimationFrame(() => {
        this.#avoidFlickeringInTheNextRender(false);
      });
    }

    // Listeners
    this.#windowRef.addEventListener("resize", this.#updatePositionRAF, {
      passive: true
    });
    document.addEventListener("scroll", this.#updatePositionRAF, {
      capture: true,
      passive: true
    });
  };

  #updatePositionRAF = () => {
    this.#positionAdjustRAF.perform(this.#updatePosition);
  };

  #updatePosition = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const computedStyle = getComputedStyle(this.el);

    const actionRect = this.actionElement.getBoundingClientRect();
    const popoverRect = this.el.getBoundingClientRect();

    if (!this.relativePopover) {
      const documentRect = document.documentElement.getBoundingClientRect();
      const insetInlineStart = this.#isRTLDirection
        ? documentRect.width - (actionRect.left + actionRect.width)
        : actionRect.left;

      // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
      setProperty(this.el, POPOVER_ACTION_WIDTH, actionRect.width);
      setProperty(this.el, POPOVER_ACTION_HEIGHT, actionRect.height);
      setProperty(this.el, POPOVER_ACTION_LEFT, insetInlineStart);
      setProperty(this.el, POPOVER_ACTION_TOP, actionRect.top);
    }

    this.#setResponsiveAlignment(actionRect, popoverRect, computedStyle);
  };

  #setResponsiveAlignment = (
    actionRect?: DOMRect,
    popoverRect?: DOMRect,
    computedStyle?: CSSStyleDeclaration
  ) => {
    actionRect ??= this.actionElement.getBoundingClientRect();
    popoverRect ??= this.el.getBoundingClientRect();
    computedStyle ??= getComputedStyle(this.el);

    const separationX = computedStyle.getPropertyValue(POPOVER_SEPARATION_X);
    const separationY = computedStyle.getPropertyValue(POPOVER_SEPARATION_Y);

    // Alignment
    const blockAlignmentValue = getAlignmentValue(
      this.blockAlign,
      actionRect.height,
      popoverRect.height,
      fromPxToNumber(separationY)
    );
    setProperty(this.el, POPOVER_ALIGN_BLOCK, blockAlignmentValue);

    const inlineAlignmentValue = getAlignmentValue(
      this.inlineAlign,
      actionRect.width,
      popoverRect.width,
      fromPxToNumber(separationX)
    );
    setProperty(this.el, POPOVER_ALIGN_INLINE, inlineAlignmentValue);
  };

  #removePositionWatcher = () => {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null; // Free the memory
    }

    // Remove listeners
    this.#windowRef.removeEventListener("resize", this.#updatePositionRAF);
    document.removeEventListener("scroll", this.#updatePositionRAF, {
      capture: true
    });
  };

  #handlePopoverToggle = (event: ToggleEvent) => {
    const willBeHidden = !(event.newState === "open");
    this.hidden = willBeHidden;

    // Emit events only when the action is committed by the user
    if (willBeHidden) {
      this.popoverClosed.emit();
    } else {
      this.popoverOpened.emit();
    }
  };

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
      setProperty(this.el, POPOVER_DRAGGED_X, this.#draggedDistanceX);
    }

    // Update total dragged distance in Y
    if (currentDraggedDistanceY !== 0) {
      this.#draggedDistanceY += currentDraggedDistanceY;
      setProperty(this.el, POPOVER_DRAGGED_Y, this.#draggedDistanceY);
    }

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleDragEnd = () => {
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

  #handleEdgeResize = (edge: ChPopoverResizeElement) => (event: MouseEvent) => {
    this.#resizeRAF ||= new SyncWithRAF();
    this.#currentEdge = edge;
    this.#initialDragEvent = event;

    // Avoid repositioning the popover
    this.#removePositionWatcher();

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
    const popoverRect = this.el.getBoundingClientRect();

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    this.#resizeDictionary[this.#currentEdge](popoverRect);

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleResizeEnd = () => {
    // Cancel RAF to prevent access to undefined references
    if (this.#resizeRAF) {
      this.#resizeRAF.cancel();
    }

    // Update the position of the popover when the resize ends
    this.#setPositionWatcher();

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

  connectedCallback() {
    this.#windowRef = window;

    // Responsive alignments
    this.actualBlockAlign = this.blockAlign;
    this.actualInlineAlign = this.inlineAlign;

    // Set RTL watcher
    this.#rtlWatcher = new MutationObserver(() => {
      this.#isRTLDirection = isRTL();

      if (this.#isRTLDirection) {
        this.el.style.setProperty(POPOVER_RTL, POPOVER_RTL_VALUE);
      } else {
        this.el.style.removeProperty(POPOVER_RTL);
      }
    });

    if (this.firstLayer) {
      this.#avoidFlickeringInTheNextRender(true);
    }

    // Observe the dir attribute in the document
    this.#rtlWatcher.observe(document.documentElement, {
      attributeFilter: ["dir"]
    });
  }

  componentWillRender() {
    if (this.#checkWatchers) {
      this.#checkWatchers = false;

      // Update watchers
      this.#setPositionWatcher();
    }

    if (this.#adjustAlignment) {
      this.#setResponsiveAlignment();
    }
  }

  componentDidLoad() {
    // Initialize popoverTargetElement
    addPopoverTargetElement(this.actionElement, this.el, !this.actionById);

    // Initialize watchers
    this.#setPositionWatcher();

    if (!this.hidden) {
      this.el.showPopover();
    }
  }

  disconnectedCallback() {
    this.#removePositionWatcher();

    // If the action element still exists, remove the reference
    removePopoverTargetElement(this.actionElement);

    // Defensive programming. Make sure the document does not have any unwanted handler
    this.#handleDragEnd();

    // Disconnect RTL watcher
    if (this.#rtlWatcher) {
      this.#rtlWatcher.disconnect();
      this.#rtlWatcher = null; // Free the memory
    }
  }

  render() {
    return (
      <Host
        class={{
          "gx-popover-header-drag": !this.hidden && this.allowDrag === "header"
        }}
        popover={this.mode}
        onMouseDown={this.allowDrag === "box" ? this.#handleMouseDown : null}
        onToggle={this.#handlePopoverToggle}
      >
        {this.allowDrag === "header" && (
          <div class="header" part="header" onMouseDown={this.#handleMouseDown}>
            <slot name="header" />
          </div>
        )}

        <slot />

        {this.resizable &&
          !this.hidden && [
            <div
              class="edge__block-start"
              onMouseDown={this.#handleEdgeResize("block-start")}
            ></div>, // Top
            <div
              class="edge__inline-end"
              onMouseDown={this.#handleEdgeResize("inline-end")}
            ></div>, // Right
            <div
              class="edge__block-end"
              onMouseDown={this.#handleEdgeResize("block-end")}
            ></div>, // Bottom
            <div
              class="edge__inline-start"
              onMouseDown={this.#handleEdgeResize("inline-start")}
            ></div>, // Left

            <div
              class="corner__block-start-inline-start"
              onMouseDown={this.#handleEdgeResize("block-start-inline-start")}
            ></div>, // Top Left
            <div
              class="corner__block-start-inline-end"
              onMouseDown={this.#handleEdgeResize("block-start-inline-end")}
            ></div>, // Top Right
            <div
              class="corner__block-end-inline-start"
              onMouseDown={this.#handleEdgeResize("block-end-inline-start")}
            ></div>, // Bottom Left
            <div
              class="corner__block-end-inline-end"
              onMouseDown={this.#handleEdgeResize("block-end-inline-end")}
            ></div> // Bottom Right
          ]}
      </Host>
    );
  }
}

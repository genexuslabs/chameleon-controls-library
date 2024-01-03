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
import { ChPopoverAlign, PopoverActionElement } from "./types";
import { isRTL } from "../../common/utils";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { getAlignmentValue } from "./utils";

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

const POPOVER_RTL = "--ch-popover-rtl";
const POPOVER_RTL_VALUE = "-1";

// Utils
const fromPxToNumber = (pxValue: string) =>
  Number(pxValue.replace("px", "").trim());

const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

const addPopoverTargetElement = (
  actionElement: PopoverActionElement,
  popoverElement: HTMLElement
) => {
  if (actionElement) {
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
  #positionAdjustRAF = new SyncWithRAF();

  #adjustAlignment = false;

  // Watchers
  #checkWatchers = false;
  #resizeObserver: ResizeObserver;
  #rtlWatcher: MutationObserver;

  // Drag
  #draggedDistanceX: number = 0;
  #draggedDistanceY: number = 0;
  #initialDragEvent: MouseEvent;
  #lastDragEvent: MouseEvent;
  #isRTLDirection: boolean;

  // Refs
  #windowRef: Window;

  @Element() el: HTMLChPopoverElement;

  @State() actualBlockAlign: ChPopoverAlign;
  @State() actualInlineAlign: ChPopoverAlign;
  @State() dragging = false;

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
    addPopoverTargetElement(newActionElement, this.el);

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
   * Specifies whether the popover is hidden or visible.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop({ mutable: true }) hidden = true;
  @Watch("hidden")
  handleHiddenChange(newHiddenValue: boolean) {
    // Schedule update for watchers
    this.#checkWatchers = true;

    // Update the popover visualization
    if (newHiddenValue) {
      this.el.hidePopover();
      this.#avoidFlickeringInTheNextRender(true);
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
   * Emitted when the popover is opened.
   */
  @Event() popoverOpened: EventEmitter;

  /**
   * Emitted when the popover is closed.
   */
  @Event() popoverClosed: EventEmitter;

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

    this.#resizeObserver ??= new ResizeObserver(this.#updatePositionRAF);

    this.#resizeObserver.observe(this.actionElement);
    this.#resizeObserver.observe(this.el);

    // Faster first render. Don't wait until the next animation frame
    this.#updatePosition();

    // The popover's position is now set, so we no longer have to hide it
    this.#avoidFlickeringInTheNextRender(false);

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
    const actionRect = this.actionElement.getBoundingClientRect();
    const documentRect = document.documentElement.getBoundingClientRect();
    const popoverRect = this.el.getBoundingClientRect();

    const insetInlineStart = this.#isRTLDirection
      ? documentRect.width - (actionRect.left + actionRect.width)
      : actionRect.left;

    const computedStyle = getComputedStyle(this.el);

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    setProperty(this.el, POPOVER_ACTION_WIDTH, actionRect.width);
    setProperty(this.el, POPOVER_ACTION_HEIGHT, actionRect.height);
    setProperty(this.el, POPOVER_ACTION_LEFT, insetInlineStart);
    setProperty(this.el, POPOVER_ACTION_TOP, actionRect.top);

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
    // Necessary to avoid selecting the text of other elements
    event.preventDefault();

    if (!this.#dragRAF) {
      this.#dragRAF = new SyncWithRAF();
    }

    this.dragging = true;
    this.#initialDragEvent = event;

    // Add listeners
    document.addEventListener("mousemove", this.#trackElementDragRAF, {
      capture: true,
      passive: true
    });

    document.addEventListener("mouseup", this.#handleDragEnd, {
      capture: true,
      passive: true
    });
  };

  #trackElementDragRAF = (event: MouseEvent) => {
    this.#dragRAF.perform(this.#trackElementDrag, () => {
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
    this.#dragRAF.cancel();

    // Remove listeners
    document.removeEventListener("mousemove", this.#trackElementDragRAF, {
      capture: true
    });

    document.removeEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });

    this.dragging = false;

    // Free the memory
    this.#dragRAF = null;
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
    this.#avoidFlickeringInTheNextRender(true);

    // Initialize popoverTargetElement
    addPopoverTargetElement(this.actionElement, this.el);

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
          "gx-popover-header-drag": !this.hidden && this.allowDrag === "header",
          "gx-popover-dragging": this.dragging
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
      </Host>
    );
  }
}

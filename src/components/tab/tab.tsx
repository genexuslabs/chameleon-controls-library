import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import {
  DraggableView,
  DraggableViewInfo,
  FlexibleLayoutWidget
} from "../flexible-layout/types";
import { inBetween, isRTL, tokenMap } from "../../common/utils";
import {
  TabDirection,
  TabElementSize,
  TabItemCloseInfo,
  TabSelectedItemInfo,
  TabType
} from "./types";
import {
  BUTTON_CLASS,
  CAPTION_ID,
  CLOSE_BUTTON_PART,
  DRAG_PREVIEW,
  DRAG_PREVIEW_ELEMENT,
  DRAG_PREVIEW_INSIDE_BLOCK,
  DRAG_PREVIEW_INSIDE_INLINE,
  DRAG_PREVIEW_OUTSIDE,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_ID,
  PAGE_NAME_CLASS,
  SELECTED_PART,
  TAB_LIST_CLASS
} from "./utils";
import { insertIntoIndex, removeElement } from "../../common/array";
import { focusComposedPath } from "../common/helpers";

// Custom vars
const TRANSITION_DURATION = "--ch-tab-transition-duration";

const BUTTON_POSITION_X = "--ch-tab-button-position-x";
const BUTTON_POSITION_Y = "--ch-tab-button-position-y";

const BUTTON_SIZE = "--ch-tab-button-size";

const MOUSE_OFFSET_X = "--ch-tab-mouse-offset-x";
const MOUSE_OFFSET_Y = "--ch-tab-mouse-offset-y";

const MOUSE_POSITION_X = "--ch-tab-mouse-position-x";
const MOUSE_POSITION_Y = "--ch-tab-mouse-position-y";

const TAB_LIST_EDGE_START_POSITION = "--ch-tab-tab-list-start";
const TAB_LIST_EDGE_END_POSITION = "--ch-tab-tab-list-end";

const DECORATIVE_IMAGE = "--ch-tab-decorative-image";

// Key codes
const ARROW_UP = "ArrowUp";
const ARROW_RIGHT = "ArrowRight";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const HOME = "Home";
const END = "End";

type KeyEvents =
  | typeof ARROW_UP
  | typeof ARROW_RIGHT
  | typeof ARROW_DOWN
  | typeof ARROW_LEFT
  | typeof HOME
  | typeof END;

// Selectors
const FIRST_CAPTION_BUTTON = (tabListRef: HTMLElement) =>
  tabListRef.querySelector(":scope>button");

const LAST_CAPTION_BUTTON = (tabListRef: HTMLElement) =>
  tabListRef.querySelector(":scope>button:last-child");

// Utility functions
const isDecorativeImg = (item: FlexibleLayoutWidget) =>
  item.startImageSrc &&
  (!item.startImageType || item.startImageType === "pseudo-element");

const getDirection = (type: TabType): TabDirection =>
  type === "main" || type === "blockEnd" ? "block" : "inline";
const isBlockDirection = (direction: TabDirection) => direction === "block";

const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

const setButtonInitialPosition = (
  element: HTMLElement,
  positionX: number,
  positionY: number
) => {
  setProperty(element, BUTTON_POSITION_X, positionX);
  setProperty(element, BUTTON_POSITION_Y, positionY);
};

const setButtonSize = (element: HTMLElement, size: number) => {
  setProperty(element, BUTTON_SIZE, size);
};

const setMousePosition = (
  element: HTMLElement,
  positionX: number,
  positionY: number
) => {
  setProperty(element, MOUSE_POSITION_X, positionX);
  setProperty(element, MOUSE_POSITION_Y, positionY);
};

// Useful to implement snap to the edges
const setTabListStartEndPosition = (
  element: HTMLElement,
  startPosition: number,
  endPosition: number
) => {
  setProperty(element, TAB_LIST_EDGE_START_POSITION, startPosition);
  setProperty(element, TAB_LIST_EDGE_END_POSITION, endPosition);
};

const getTabListSizesAndSetPosition = (
  hostRef: HTMLChTabElement,
  tabListRef: HTMLElement,
  direction: TabDirection,
  buttonRect: DOMRect
): TabElementSize => {
  const tabListRect = tabListRef.getBoundingClientRect();

  // Tab List information
  const tabListSizes: TabElementSize = {
    xStart: tabListRect.x,
    xEnd: tabListRect.x + tabListRect.width,
    yStart: tabListRect.y,
    yEnd: tabListRect.y + tabListRect.height
  };

  if (isBlockDirection(direction)) {
    setTabListStartEndPosition(
      hostRef,
      tabListSizes.xStart,
      tabListSizes.xEnd - buttonRect.width
    );
  } else {
    setTabListStartEndPosition(
      hostRef,
      tabListSizes.yStart,
      tabListSizes.yEnd - buttonRect.height
    );
  }

  return tabListSizes;
};

const setMouseOffset = (
  element: HTMLElement,
  offsetX: number,
  offsetY: number
) => {
  setProperty(element, MOUSE_OFFSET_X, offsetX);
  setProperty(element, MOUSE_OFFSET_Y, offsetY);
};

const addGrabbingStyle = () =>
  document.body.style.setProperty("cursor", "grabbing");
const removeGrabbingStyle = () => document.body.style.removeProperty("cursor");

const focusNextOrPreviousCaption = (
  focusNextSibling: boolean,
  tabListRef: HTMLElement,
  focusedCaption: HTMLButtonElement,
  event: KeyboardEvent
) => {
  // Prevent scroll
  event.preventDefault();

  let nextFocusedCaption: HTMLButtonElement;

  // Determine the next selected caption button
  if (focusNextSibling) {
    nextFocusedCaption = (focusedCaption.nextElementSibling ??
      FIRST_CAPTION_BUTTON(tabListRef)) as HTMLButtonElement;
  } else {
    nextFocusedCaption = (focusedCaption.previousElementSibling ??
      LAST_CAPTION_BUTTON(tabListRef)) as HTMLButtonElement;
  }

  // Focus and select the caption
  nextFocusedCaption.focus();
  nextFocusedCaption.click();
};

@Component({
  shadow: true,
  styleUrl: "tab.scss",
  tag: "ch-tab"
})
export class ChTab implements DraggableView {
  #cancelId: number;

  // Styling
  #classes: {
    BUTTON?: string;
    IMAGE?: string;
    PAGE?: string;
    PAGE_CONTAINER?: string;
    PAGE_NAME?: string;
    TAB_LIST?: string;
  } = {};
  #parts: {
    BUTTON?: string;
    IMAGE?: string;
    PAGE?: string;
    PAGE_CONTAINER?: string;
    PAGE_NAME?: string;
    TAB_LIST?: string;
  } = {};
  #direction: TabDirection;

  #selectedIndex: number = -1;

  #showCaptions: boolean;

  #lastDragEvent: MouseEvent;
  #needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  #initialMousePosition = -1;

  // Allocated at runtime to reduce memory usage
  #itemSizes: number[];

  /**
   * This variable represents the boundaries of the box where the mouse can be
   * placed when dragging a caption, to consider that the caption is within the
   * tab list.
   */
  #mouseBoundingLimits: TabElementSize;

  #renderedPages: Set<string> = new Set();

  // Refs
  #dragPreviewRef: HTMLDivElement;
  #tabListRef: HTMLDivElement;
  #tabPageRef: HTMLDivElement;

  // Keyboard interactions
  #keyEvents: {
    [key in KeyEvents]: (
      direction: TabDirection,
      event: KeyboardEvent,
      focusedCaption: HTMLButtonElement
    ) => void;
  } = {
    [ARROW_UP]: (direction, ev, focusedButton) => {
      if (direction === "block") {
        return;
      }
      focusNextOrPreviousCaption(false, this.#tabListRef, focusedButton, ev);
    },

    [ARROW_RIGHT]: (direction, ev, focusedButton) => {
      if (direction === "inline") {
        return;
      }
      focusNextOrPreviousCaption(!isRTL(), this.#tabListRef, focusedButton, ev);
    },

    [ARROW_DOWN]: (direction, ev, focusedButton) => {
      if (direction === "block") {
        return;
      }
      focusNextOrPreviousCaption(true, this.#tabListRef, focusedButton, ev);
    },

    [ARROW_LEFT]: (direction, ev, focusedButton) => {
      if (direction === "inline") {
        return;
      }
      focusNextOrPreviousCaption(isRTL(), this.#tabListRef, focusedButton, ev);
    },

    [HOME]: () => {
      const nextFocusedCaption = FIRST_CAPTION_BUTTON(
        this.#tabListRef
      ) as HTMLButtonElement;

      // Focus and select the caption
      nextFocusedCaption.focus();
      nextFocusedCaption.click();
    },

    [END]: () => {
      const nextFocusedCaption = LAST_CAPTION_BUTTON(
        this.#tabListRef
      ) as HTMLButtonElement;

      // Focus and select the caption
      nextFocusedCaption.focus();
      nextFocusedCaption.click();
    }
  };

  @Element() el: HTMLChTabElement;

  @State() draggedElementIndex = -1;
  @State() draggedElementNewIndex = -1;

  /**
   * `true` when the mouse position is out of bounds at least once.
   */
  @State() hasCrossedBoundaries = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element. This label is used for the close button of the captions.
   */
  @Prop() readonly closeButtonAccessibleName: string = "Close";

  /**
   * This attribute lets you specify if the drag operation is disabled in the
   * captions of the control. If `true`, the captions can't be dragged.
   */
  @Prop() readonly dragDisabled: boolean = false;

  /**
   * `true` if the group has is view section expanded. Otherwise, only the
   * toolbar will be displayed.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly expanded: boolean = true;

  /**
   * Specifies the items of the tab control.
   */
  @Prop() readonly items: FlexibleLayoutWidget[];
  @Watch("items")
  handleItemsChange(newItems: FlexibleLayoutWidget[]) {
    this.#updateRenderedPages(newItems);
  }

  /**
   * Specifies the selected item of the widgets array.
   */
  @Prop() readonly selectedId: string;
  @Watch("selectedId")
  handleSelectedIdChange(newSelectedId: string) {
    this.#renderedPages.add(newSelectedId);
  }

  /**
   * Specifies the flexible layout type.
   */
  @Prop({ reflect: true }) readonly type: TabType;
  @Watch("type")
  handleTypeChange(newType: TabType) {
    this.#initializeState(newType);
  }

  /**
   * Fired when an item of the main group is double clicked.
   */
  @Event() expandMainGroup: EventEmitter<string>;

  /**
   * Fired the close button of an item is clicked.
   */
  @Event() itemClose: EventEmitter<TabItemCloseInfo>;

  /**
   * Fired when the selected item change.
   */
  @Event() selectedItemChange: EventEmitter<TabSelectedItemInfo>;

  /**
   * Fired the first time a caption button is dragged outside of its tab list.
   */
  @Event() itemDragStart: EventEmitter<number>;

  /**
   * Ends the preview of the dragged item. Useful for ending the preview via
   * keyboard interaction.
   */
  @Method()
  async endDragPreview(): Promise<void> {
    this.#handleDragEnd();
  }

  /**
   * Returns the info associated to the draggable view.
   */
  @Method()
  async getDraggableViews(): Promise<DraggableViewInfo> {
    return {
      mainView: this.el,
      pageView: this.#tabPageRef,
      tabListView: this.#tabListRef
    };
  }

  /**
   * Promotes the drag preview to the top layer. Useful to avoid z-index issues.
   */
  @Method()
  async promoteDragPreviewToTopLayer(): Promise<void> {
    if (this.draggedElementIndex === -1) {
      return;
    }

    // If this property is added in a declarative way via the Stencil's render,
    // we would have to use requestAnimationFrame to delay the shopPopover()
    // method, since the popover defaults to "auto", which does not allow to
    // keep multiple "auto" popover open at the same time
    this.#dragPreviewRef.popover = "manual";

    this.#dragPreviewRef.showPopover();
  }

  /**
   * Given an id, remove the page from the render
   */
  @Method()
  async removePage(pageId: string, forceRerender = true) {
    this.#renderedPages.delete(pageId);

    if (forceRerender) {
      forceUpdate(this);
    }
  }

  #handleSelectedItemChange =
    (index: number, itemId: string) => (event: MouseEvent) => {
      event.stopPropagation();

      this.selectedItemChange.emit({
        lastSelectedIndex: this.#selectedIndex,
        newSelectedId: itemId,
        newSelectedIndex: index,
        type: this.type
      });

      this.#selectedIndex = index;
      // this.selectedId = itemId;
    };

  /**
   * Make a set based on the rendered items array to maintain order between the
   * pages, even when re-ordering tabs. This is useful for optimizing rendering
   * performance by not re-ordering pages when the caption's order changes.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #updateRenderedPages = (items: FlexibleLayoutWidget[]) => {
    (items ?? []).forEach(item => {
      if (item.wasRendered) {
        this.#renderedPages.add(item.id);
      }
    });
  };

  #handleItemDblClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.expandMainGroup.emit();
  };

  #handleDragStart = (index: number) => (event: DragEvent) => {
    // Remove dragover event to allow mousemove event to fire
    event.preventDefault();

    // Store the index of the dragged element
    this.draggedElementIndex = index;

    // - - - - - - - - - - - DOM read operations - - - - - - - - - - -
    const mousePositionX = event.clientX;
    const mousePositionY = event.clientY;

    const getItemSize = isBlockDirection(this.#direction)
      ? (item: HTMLElement) => item.getBoundingClientRect().width
      : (item: HTMLElement) => item.getBoundingClientRect().height;
    this.#itemSizes = [...this.#tabListRef.children].map(getItemSize);

    const buttonRect = (
      event.target as HTMLButtonElement
    ).getBoundingClientRect();

    // Tab List information
    const tabListSizes = getTabListSizesAndSetPosition(
      this.el,
      this.#tabListRef,
      this.#direction,
      buttonRect
    );

    // Button information
    const buttonSizes: TabElementSize = {
      xStart: buttonRect.x,
      xEnd: buttonRect.x + buttonRect.width,
      yStart: buttonRect.y,
      yEnd: buttonRect.y + buttonRect.height
    };

    const mouseDistanceToButtonTopEdge = mousePositionY - buttonSizes.yStart;
    const mouseDistanceToButtonBottomEdge = buttonSizes.yEnd - mousePositionY;
    const mouseDistanceToButtonLeftEdge = mousePositionX - buttonSizes.xStart;
    const mouseDistanceToButtonRightEdge = buttonSizes.xEnd - mousePositionX;

    // Mouse limits
    this.#mouseBoundingLimits = {
      xStart: tabListSizes.xStart - mouseDistanceToButtonRightEdge,
      xEnd: tabListSizes.xEnd + mouseDistanceToButtonLeftEdge,
      yStart: tabListSizes.yStart - mouseDistanceToButtonBottomEdge,
      yEnd: tabListSizes.yEnd + mouseDistanceToButtonTopEdge
    };

    // Store initial mouse position
    this.#initialMousePosition = isBlockDirection(this.#direction)
      ? mousePositionX
      : mousePositionY;

    // - - - - - - - - - - - DOM write operations - - - - - - - - - - -
    // Initialize mouse position to avoid initial flickering
    setMousePosition(this.el, mousePositionX, mousePositionY);

    // Initialize the button position
    setButtonInitialPosition(this.el, buttonSizes.xStart, buttonSizes.yStart);

    setButtonSize(
      this.el,
      isBlockDirection(this.#direction) ? buttonRect.width : buttonRect.height
    );

    // Update mouse offset to correctly place the dragged element preview
    setMouseOffset(
      this.el,
      mouseDistanceToButtonLeftEdge,
      mouseDistanceToButtonTopEdge
    );

    addGrabbingStyle();

    // Add listeners
    document.body.addEventListener("mousemove", this.#handleItemDrag, {
      capture: true,
      passive: true
    });

    document.body.addEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });
  };

  #handleDragEnd = () => {
    // Since mousemove callbacks are executed on animation frames, we must also
    // remove the events on animations frame. Otherwise we would remove the
    // events and in the next frame the mousemove handler will be executes
    cancelAnimationFrame(this.#cancelId);
    this.#needForRAF = true;

    document.body.removeEventListener("mousemove", this.#handleItemDrag, {
      capture: true
    });

    document.body.removeEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });

    removeGrabbingStyle();

    const anItemWasReordered =
      !this.hasCrossedBoundaries &&
      this.draggedElementNewIndex !== this.draggedElementIndex;

    // Move the item to the new position
    if (anItemWasReordered) {
      const itemToInsert = removeElement(this.items, this.draggedElementIndex);
      insertIntoIndex(this.items, itemToInsert, this.draggedElementNewIndex);

      // Update last selected index
      this.#adjustLastSelectedIndexValueAfterReorder();
    }

    // Restore visibility of the dragged element
    this.draggedElementIndex = -1;
    this.draggedElementNewIndex = -1;

    // Free the memory
    this.#itemSizes = undefined;

    // Reset state
    this.hasCrossedBoundaries = false;
    this.el.style.removeProperty(TRANSITION_DURATION);
  };

  #adjustLastSelectedIndexValueAfterReorder = () => {
    // If the dragged element is the selected element, use the new index
    if (this.#selectedIndex === this.draggedElementIndex) {
      this.#selectedIndex = this.draggedElementNewIndex;
    }
    // Dragged element:
    //   - Started: Before the selected index
    //   - Ended: After the selected index or in the same position
    else if (
      this.draggedElementIndex < this.#selectedIndex &&
      this.#selectedIndex <= this.draggedElementNewIndex
    ) {
      this.#selectedIndex--;
    }
    // Dragged element:
    //   - Started: After the selected index
    //   - Ended: Before the selected index or in the same position
    else if (
      this.#selectedIndex < this.draggedElementIndex &&
      this.draggedElementNewIndex <= this.#selectedIndex
    ) {
      this.#selectedIndex++;
    }
  };

  #handleItemDrag = (event: MouseEvent) => {
    this.#lastDragEvent = event;

    if (!this.#needForRAF) {
      return;
    }
    this.#needForRAF = false; // No need to call RAF up until next frame

    this.#cancelId = requestAnimationFrame(() => {
      this.#needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      const mousePositionX = this.#lastDragEvent.clientX;
      const mousePositionY = this.#lastDragEvent.clientY;

      setMousePosition(this.el, mousePositionX, mousePositionY);

      // There is no need to update the preview of the reorder
      if (this.hasCrossedBoundaries) {
        return;
      }

      const mouseLimits = this.#mouseBoundingLimits;

      const draggedButtonIsInsideTheTabList =
        inBetween(mouseLimits.xStart, mousePositionX, mouseLimits.xEnd) &&
        inBetween(mouseLimits.yStart, mousePositionY, mouseLimits.yEnd);

      // Emit the itemDragStart event the first time the button is out of the
      // mouse bounds (`mouseBoundingLimits`)
      if (!draggedButtonIsInsideTheTabList) {
        this.hasCrossedBoundaries = true;

        // Remove transition before the render to avoid flickering in the animation
        this.el.style.setProperty(TRANSITION_DURATION, "0s");

        this.itemDragStart.emit(this.draggedElementIndex);
        return;
      }

      // There is no need to re-order the items in the preview
      if (this.items.length === 1) {
        return;
      }

      // In this point, the preview is inside the tab list, we should check
      // in which place is the preview to give feedback for the item's reorder
      const mousePosition = isBlockDirection(this.#direction)
        ? mousePositionX
        : mousePositionY;

      const hasMovedToTheEnd = this.#initialMousePosition < mousePosition;

      // Distance traveled from the initial mouse position
      let distanceTraveled = Math.abs(
        this.#initialMousePosition - mousePosition
      );

      let newIndex = this.draggedElementIndex;

      if (hasMovedToTheEnd) {
        // While it is not the last item and the distance traveled is greater
        // than half the size of the next item
        while (
          newIndex < this.items.length - 1 &&
          distanceTraveled - this.#itemSizes[newIndex + 1] / 2 > 0
        ) {
          distanceTraveled -= this.#itemSizes[newIndex + 1];
          newIndex++;
        }
      } else {
        // While it is not the first item and the distance traveled is greater
        // than half the size of the previous item
        while (
          newIndex > 0 &&
          distanceTraveled - this.#itemSizes[newIndex - 1] / 2 > 0
        ) {
          distanceTraveled -= this.#itemSizes[newIndex - 1];
          newIndex--;
        }
      }

      // Check if should update the dragged element index in the preview
      if (this.draggedElementNewIndex !== newIndex) {
        this.draggedElementNewIndex = newIndex;
      }
    });
  };

  #handleClose = (index: number, itemId: string) => (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.itemClose.emit({
      itemIndex: index,
      itemId: itemId,
      type: this.type
    });
  };

  #handleTabFocus = (event: KeyboardEvent) => {
    if (this.items.length < 2) {
      return;
    }

    const keyEventHandler = this.#keyEvents[event.code];
    if (!keyEventHandler) {
      return;
    }

    const currentFocusedCaption = focusComposedPath()[0].closest(
      "." + this.#classes.BUTTON
    ) as HTMLButtonElement;

    keyEventHandler(this.#direction, event, currentFocusedCaption);
  };

  #imgRender = (item: FlexibleLayoutWidget) =>
    item.startImageType === "img" &&
    item.startImageSrc && (
      <img
        aria-hidden="true"
        class={"caption-image " + this.#classes.IMAGE}
        part={this.#parts.IMAGE}
        alt=""
        src={item.startImageSrc}
        loading="lazy"
      />
    );

  #renderTabBar = (thereAreShiftedElements: boolean) => (
    <div
      role="tablist"
      aria-label={this.accessibleName}
      class={this.#classes.TAB_LIST}
      part={this.#parts.TAB_LIST}
      ref={el => (this.#tabListRef = el)}
      onKeyDown={this.#handleTabFocus}
    >
      {this.items.map((item, index) => (
        <button
          key={CAPTION_ID(item.id)}
          id={CAPTION_ID(item.id)}
          role="tab"
          aria-controls={PAGE_ID(item.id)}
          aria-label={!this.#showCaptions ? item.name : null}
          aria-selected={(item.id === this.selectedId).toString()}
          class={{
            [this.#classes.BUTTON]: true,
            "decorative-image": isDecorativeImg(item),

            "dragged-element": this.draggedElementIndex === index,
            "dragged-element--outside":
              this.draggedElementIndex === index &&
              this.hasCrossedBoundaries &&
              this.items.length > 1,
            "shifted-element": this.draggedElementIndex !== -1,

            "shifted-element--start":
              thereAreShiftedElements &&
              this.draggedElementIndex < index &&
              index <= this.draggedElementNewIndex,

            "shifted-element--end":
              thereAreShiftedElements &&
              this.draggedElementNewIndex <= index &&
              index < this.draggedElementIndex
          }}
          part={tokenMap({
            [this.#parts.BUTTON]: true,
            [CAPTION_ID(item.id)]: true,
            [SELECTED_PART]: item.id === this.selectedId
          })}
          style={
            isDecorativeImg(item)
              ? { [DECORATIVE_IMAGE]: `url("${item.startImageSrc}")` }
              : null
          }
          onAuxClick={this.#handleClose(index, item.id)}
          onClick={
            !(item.id === this.selectedId)
              ? this.#handleSelectedItemChange(index, item.id)
              : null
          }
          onDblClick={this.type === "main" ? this.#handleItemDblClick : null}
          // Drag and drop
          onDragStart={!this.dragDisabled ? this.#handleDragStart(index) : null}
        >
          {this.#imgRender(item)}

          {this.#showCaptions && item.name}

          {this.#showCaptions && (
            <button
              aria-label={this.closeButtonAccessibleName}
              class="close-button"
              part={CLOSE_BUTTON_PART}
              type="button"
              onClick={this.#handleClose(index, item.id)}
            ></button>
          )}
        </button>
      ))}
    </div>
  );

  #renderTabPages = () => (
    <div
      class={{
        [this.#classes.PAGE_CONTAINER]: true,
        "page-container": true,
        "page-container--collapsed": !this.expanded
      }}
      part={this.#parts.PAGE_CONTAINER}
      ref={el => (this.#tabPageRef = el)}
    >
      {[...this.#renderedPages.keys()].map(itemId => (
        <div
          key={PAGE_ID(itemId)}
          id={PAGE_ID(itemId)}
          role="tabpanel"
          aria-labelledby={CAPTION_ID(itemId)}
          class={{
            [this.#classes.PAGE]: true,
            "page--selected": itemId === this.selectedId,
            "page--hidden": !(itemId === this.selectedId)
          }}
          part={this.#parts.PAGE}
        >
          <slot name={itemId} />
        </div>
      ))}
    </div>
  );

  #renderDragPreview = (draggedElement: FlexibleLayoutWidget) => {
    const classes = {
      [DRAG_PREVIEW]: true,
      [DRAG_PREVIEW_OUTSIDE]: this.hasCrossedBoundaries,

      [DRAG_PREVIEW_INSIDE_INLINE]:
        !this.hasCrossedBoundaries && !isBlockDirection(this.#direction),

      [DRAG_PREVIEW_INSIDE_BLOCK]:
        !this.hasCrossedBoundaries && isBlockDirection(this.#direction)
    };

    return (
      <div
        aria-hidden="true"
        class={classes}
        part={tokenMap(classes)}
        ref={el => (this.#dragPreviewRef = el)}
      >
        <button
          class={{
            [this.#classes.BUTTON]: true,
            [DRAG_PREVIEW_ELEMENT]: true,
            "decorative-image": isDecorativeImg(draggedElement)
          }}
          part={tokenMap({
            [this.#parts.BUTTON]: true,
            [CAPTION_ID(draggedElement.id)]: true,
            [DRAG_PREVIEW_ELEMENT]: true,
            [SELECTED_PART]: draggedElement.id === this.selectedId
          })}
          style={
            isDecorativeImg(draggedElement)
              ? { [DECORATIVE_IMAGE]: `url("${draggedElement.startImageSrc}")` }
              : null
          }
        >
          {this.#imgRender(draggedElement)}

          {this.#showCaptions && draggedElement.name}
        </button>
      </div>
    );
  };

  #initializeState = (type: TabType) => {
    this.#direction = getDirection(type);
    this.#updateRenderedPages(this.items);

    // Initialize classes and parts
    this.#setClassesAndParts(this.#direction, type);

    this.#showCaptions = isBlockDirection(this.#direction);
  };

  #setClassesAndParts = (direction: TabDirection, type: TabType) => {
    this.#classes = {
      BUTTON: BUTTON_CLASS(direction),
      IMAGE: IMAGE_CLASS(direction),
      PAGE: PAGE_CLASS(direction),
      PAGE_CONTAINER: PAGE_CONTAINER_CLASS(direction),
      PAGE_NAME: PAGE_NAME_CLASS(direction),
      TAB_LIST: TAB_LIST_CLASS(direction)
    };

    // Add the type information to each part
    Object.entries(this.#classes).forEach(([key, value]) => {
      this.#parts[key] = `${value} ${type}`;
    });
  };

  componentWillLoad() {
    this.#initializeState(this.type);
  }

  render() {
    if (this.items == null || this.items.length === 0) {
      return "";
    }

    const draggedIndex = this.draggedElementIndex;
    const draggedElement = this.items[draggedIndex];
    const thereAreShiftedElementsInPreview =
      !this.hasCrossedBoundaries &&
      this.draggedElementNewIndex !== -1 &&
      this.draggedElementIndex !== this.draggedElementNewIndex;

    return (
      <Host class={`ch-tab-direction--${this.#direction}`}>
        {this.#renderTabBar(thereAreShiftedElementsInPreview)}
        {this.#renderTabPages()}

        {draggedIndex !== -1 && this.#renderDragPreview(draggedElement)}
      </Host>
    );
  }
}

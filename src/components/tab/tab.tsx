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
  DraggableViewInfo
} from "../flexible-layout/internal/flexible-layout/types";
import {
  inBetween,
  isPseudoElementImg,
  isRTL,
  tokenMap
} from "../../common/utils";
import {
  TabDirection,
  TabElementSize,
  TabItemCloseInfo,
  TabItemModel,
  TabModel,
  TabSelectedItemInfo
} from "./types";
import {
  CLOSE_BUTTON_PART,
  DRAG_PREVIEW,
  DRAG_PREVIEW_ELEMENT,
  DRAG_PREVIEW_INSIDE_BLOCK,
  DRAG_PREVIEW_INSIDE_INLINE,
  DRAG_PREVIEW_OUTSIDE,
  LIST_CLASSES,
  LIST_PART_BLOCK,
  LIST_PART_INLINE,
  PAGE_ID,
  SELECTED_PART
} from "./utils";
import { insertIntoIndex, removeElement } from "../../common/array";
import {
  focusComposedPath,
  MouseEventButton,
  MouseEventButtons
} from "../common/helpers";
import { CssContainProperty, CssOverflowProperty } from "../../common/types";

const CLOSE_BUTTON_CLASS = "close-button";

// Custom vars
const TRANSITION_DURATION = "--ch-tab-transition-duration";

const BUTTON_POSITION_X = "--ch-tab-button-position-x";
const BUTTON_POSITION_Y = "--ch-tab-button-position-y";

const BUTTON_SIZE = "--ch-tab-button-size";

const MOUSE_OFFSET_X = "--ch-tab-mouse-offset-x";
const MOUSE_OFFSET_Y = "--ch-tab-mouse-offset-y";

const MOUSE_POSITION_X = "--ch-tab-mouse-position-x";
const MOUSE_POSITION_Y = "--ch-tab-mouse-position-y";

const TAB_LIST_EDGE_START_POSITION = "--ch-tab-list-start";
const TAB_LIST_EDGE_END_POSITION = "--ch-tab-list-end";

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
  tabListRef.querySelector(":scope>button") as HTMLButtonElement;

const LAST_CAPTION_BUTTON = (tabListRef: HTMLElement) =>
  tabListRef.querySelector(":scope>button:last-child") as HTMLButtonElement;

// Utility functions

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
  hostRef: HTMLChTabRenderElement,
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

const getNextEnabledButtonCaption = (
  currentBUttonCaption: HTMLButtonElement,
  tabListRef: HTMLElement
) =>
  (currentBUttonCaption.nextElementSibling ??
    FIRST_CAPTION_BUTTON(tabListRef)) as HTMLButtonElement;

const getPreviousEnabledButtonCaption = (
  currentBUttonCaption: HTMLButtonElement,
  tabListRef: HTMLElement
) =>
  (currentBUttonCaption.previousElementSibling ??
    LAST_CAPTION_BUTTON(tabListRef)) as HTMLButtonElement;

const focusNextOrPreviousCaption = (
  focusNextSibling: boolean,
  tabListRef: HTMLElement,
  focusedCaption: HTMLButtonElement,
  event: KeyboardEvent
) => {
  // Prevent scroll
  event.preventDefault();

  let nextFocusedCaption: HTMLButtonElement;

  const searchFunction = focusNextSibling
    ? getNextEnabledButtonCaption
    : getPreviousEnabledButtonCaption;

  // Determine the next selected caption button
  nextFocusedCaption = searchFunction(focusedCaption, tabListRef);

  while (nextFocusedCaption.disabled) {
    nextFocusedCaption = searchFunction(nextFocusedCaption, tabListRef);
  }

  // Focus and select the caption
  nextFocusedCaption.focus();
  nextFocusedCaption.click();
};

@Component({
  shadow: true,
  styleUrl: "tab.scss",
  tag: "ch-tab-render"
})
export class ChTabRender implements DraggableView {
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

  #selectedIndex: number = -1;

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
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #mouseBoundingLimits: TabElementSize;

  #renderedPages: Map<string, TabItemModel> = new Map();
  #itemIdToIndex: Map<string, number> = new Map();

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

    [HOME]: (_, ev) =>
      focusNextOrPreviousCaption(
        true,
        this.#tabListRef,
        LAST_CAPTION_BUTTON(this.#tabListRef),
        ev
      ),

    [END]: (_, ev) =>
      focusNextOrPreviousCaption(
        false,
        this.#tabListRef,
        FIRST_CAPTION_BUTTON(this.#tabListRef),
        ev
      )
  };

  @Element() el: HTMLChTabRenderElement;

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
   * `true` to display a close button for the items.
   */
  @Prop() readonly closeButton: boolean = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element. This label is used for the close button of the captions.
   */
  @Prop() readonly closeButtonAccessibleName: string = "Close";

  /**
   * Same as the contain CSS property. This property indicates that an item
   * and its contents are, as much as possible, independent from the rest of
   * the document tree. Containment enables isolating a subsection of the DOM,
   * providing performance benefits by limiting calculations of layout, style,
   * paint, size, or any combination to a DOM subtree rather than the entire
   * page.
   * Containment can also be used to scope CSS counters and quotes.
   */
  @Prop() readonly contain?: CssContainProperty = "none";

  /**
   * Specifies the flexible layout type.
   */
  @Prop({ reflect: true }) readonly direction: TabDirection;
  @Watch("direction")
  directionChange(newDirection: TabDirection) {
    this.#initializeState(newDirection);
  }

  /**
   * This attribute lets you specify if all tab buttons are disabled.
   * If disabled, tab buttons will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * When the control is sortable, the items can be dragged outside of the
   * tab-list.
   *
   * This property lets you specify if this behavior is enabled.
   */
  @Prop() readonly dragOutside: boolean = false;

  /**
   * `true` if the group has is view section expanded. Otherwise, only the
   * toolbar will be displayed.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly expanded: boolean = true;

  /**
   * Specifies the items of the tab control.
   */
  @Prop() readonly model: TabModel;
  @Watch("model")
  modelChanged(newModel: TabModel) {
    this.#updateRenderedPages(newModel);
  }

  /**
   * Same as the overflow CSS property. This property sets the desired behavior
   * when content does not fit in the item's padding box (overflows) in the
   * horizontal and/or vertical direction.
   */
  @Prop() readonly overflow:
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}` = "visible";

  /**
   * Specifies the selected item of the widgets array.
   */
  @Prop({ mutable: true }) selectedId: string;
  @Watch("selectedId")
  selectedIdChanged(newSelectedId: string) {
    const newSelectedTabItem = this.model.find(
      item => item.id === newSelectedId
    );

    if (newSelectedTabItem) {
      this.#renderedPages.set(newSelectedId, newSelectedTabItem);
    }
  }

  /**
   * `true` to show the captions of the items.
   */
  @Prop() readonly showCaptions: boolean = true;

  /**
   * `true` to enable sorting the tab buttons by dragging them in the tab-list.
   *
   * If `false`, the tab buttons can not be dragged out either.
   */
  @Prop() readonly sortable: boolean = false;

  /**
   * `true` to not render the tab buttons of the control.
   */
  @Prop() readonly tabButtonHidden: boolean = false;

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
   * This event can be default prevented to prevent the item selection.
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

  #buttonIsCloseButton = (buttonRef: HTMLButtonElement) =>
    buttonRef.className === CLOSE_BUTTON_CLASS;

  /**
   * Make a set based on the rendered items array to maintain order between the
   * pages, even when re-ordering tabs. This is useful for optimizing rendering
   * performance by not re-ordering pages when the caption's order changes.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #updateRenderedPages = (items: TabModel) => {
    this.#renderedPages.clear();
    this.#itemIdToIndex.clear();

    (items ?? []).forEach(item => {
      if (item.wasRendered) {
        this.#renderedPages.set(item.id, item);
      }
    });

    // The selected id must be added to the rendered pages, even if it was not
    // marked as "wasRendered" in the UI Model
    if (this.selectedId && items !== undefined) {
      const newSelectedTabItem = this.model.find(
        item => item.id === this.selectedId
      );

      if (newSelectedTabItem) {
        this.#renderedPages.set(this.selectedId, newSelectedTabItem);
      }
    }
  };

  // #handleItemDblClick = (event: MouseEvent) => {
  //   event.preventDefault();
  //   event.stopPropagation();

  //   this.expandMainGroup.emit();
  // };

  #handleDragStart = (event: DragEvent) => {
    const buttonRef = event.composedPath()[0] as HTMLButtonElement;

    if (buttonRef.tagName.toLowerCase() !== "button") {
      return;
    }

    // The only button that can perform dragstart is the tab button
    const itemIndex = this.#itemIdToIndex.get(buttonRef.id);

    // Remove dragover event to allow mousemove event to fire
    event.preventDefault();

    // Store the index of the dragged element
    this.draggedElementIndex = itemIndex;

    // - - - - - - - - - - - DOM read operations - - - - - - - - - - -
    const mousePositionX = event.clientX;
    const mousePositionY = event.clientY;
    const direction = this.direction;

    const getItemSize = isBlockDirection(direction)
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
      direction,
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

    // Update mouse limits if drag outside is enabled
    if (this.dragOutside) {
      this.#mouseBoundingLimits = {
        xStart: tabListSizes.xStart - mouseDistanceToButtonRightEdge,
        xEnd: tabListSizes.xEnd + mouseDistanceToButtonLeftEdge,
        yStart: tabListSizes.yStart - mouseDistanceToButtonBottomEdge,
        yEnd: tabListSizes.yEnd + mouseDistanceToButtonTopEdge
      };
    }

    // Store initial mouse position
    this.#initialMousePosition = isBlockDirection(direction)
      ? mousePositionX
      : mousePositionY;

    // - - - - - - - - - - - DOM write operations - - - - - - - - - - -
    // Initialize mouse position to avoid initial flickering
    setMousePosition(this.el, mousePositionX, mousePositionY);

    // Initialize the button position
    setButtonInitialPosition(this.el, buttonSizes.xStart, buttonSizes.yStart);

    setButtonSize(
      this.el,
      isBlockDirection(direction) ? buttonRect.width : buttonRect.height
    );

    // Update mouse offset to correctly place the dragged element preview
    setMouseOffset(
      this.el,
      mouseDistanceToButtonLeftEdge,
      mouseDistanceToButtonTopEdge
    );

    addGrabbingStyle();

    // Add listeners
    document.addEventListener("mousemove", this.#handleItemDrag, {
      capture: true,
      passive: true
    });

    document.addEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });
  };

  #handleDragEnd = () => {
    // Since mousemove callbacks are executed on animation frames, we must also
    // remove the events on animations frame. Otherwise we would remove the
    // events and in the next frame the mousemove handler will be executes
    cancelAnimationFrame(this.#cancelId);
    this.#needForRAF = true;

    document.removeEventListener("mousemove", this.#handleItemDrag, {
      capture: true
    });

    document.removeEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });

    removeGrabbingStyle();

    const anItemWasReordered =
      !this.hasCrossedBoundaries &&
      this.draggedElementNewIndex !== this.draggedElementIndex;

    // Move the item to the new position
    if (anItemWasReordered) {
      const itemToInsert = removeElement(this.model, this.draggedElementIndex);
      insertIntoIndex(this.model, itemToInsert, this.draggedElementNewIndex);

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

      // Check mouse limits if drag outside is enabled
      if (this.dragOutside) {
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
      }

      // There is no need to re-order the items in the preview
      if (this.model.length === 1) {
        return;
      }

      // In this point, the preview is inside the tab list, we should check
      // in which place is the preview to give feedback for the item's reorder
      const mousePosition = isBlockDirection(this.direction)
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
          newIndex < this.model.length - 1 &&
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

  #preventMouseDownOnScroll = (event: MouseEvent) => {
    // We have to prevent the mousedown event to make work the close with the
    // mouse wheel, because when the page has scroll, the auxClick is not fired
    if (event.buttons !== MouseEventButtons.WHEEL) {
      return;
    }
    const buttonRef = event.composedPath()[0] as HTMLButtonElement;

    if (buttonRef.tagName.toLowerCase() !== "button") {
      return;
    }
    event.preventDefault();
  };

  #handleSelectedItemChange = (event: PointerEvent) => {
    event.stopPropagation();
    const buttonRef = event.composedPath()[0] as HTMLButtonElement;

    // Check the click event is performed on a button element
    if (buttonRef.tagName.toLowerCase() !== "button") {
      return;
    }

    // Click was performed on the close button --> itemClose event
    if (this.#buttonIsCloseButton(buttonRef)) {
      // The parent is the tab button with the itemId
      this.#emitCloseEvent(buttonRef.parentElement.id, event);
    }
    // Otherwise --> selectedItemChange event
    else {
      const itemId = buttonRef.id;

      // Don't fire the selectedItemChange event if the item is already selected
      if (this.selectedId === itemId) {
        return;
      }
      const itemIndex = this.#itemIdToIndex.get(itemId)!;

      const eventInfo = this.selectedItemChange.emit({
        lastSelectedIndex: this.#selectedIndex,
        newSelectedId: itemId,
        newSelectedIndex: itemIndex
      });

      if (!eventInfo.defaultPrevented) {
        this.#selectedIndex = itemIndex;
        this.selectedId = itemId;
      }
    }
  };

  #handleClose = (event: PointerEvent) => {
    // Check if the action was performed on the close button or the action
    // was a click on the wheel
    if (event.button !== MouseEventButton.WHEEL) {
      return;
    }
    const buttonRef = event.composedPath()[0] as HTMLButtonElement;

    if (buttonRef.tagName.toLowerCase() === "button") {
      const itemId = this.#buttonIsCloseButton(buttonRef)
        ? buttonRef.parentElement.id
        : buttonRef.id;
      this.#emitCloseEvent(itemId, event);
    }
  };

  #emitCloseEvent = (itemId: string, event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const itemIndex = this.#itemIdToIndex.get(itemId)!;

    this.itemClose.emit({
      itemIndex: itemIndex,
      itemId: itemId
    });
  };

  #handleTabFocus = (event: KeyboardEvent) => {
    const keyEventHandler = this.#keyEvents[event.code];
    if (!keyEventHandler) {
      return;
    }

    const currentFocusedCaption = focusComposedPath()[0].closest(
      "." + this.#classes.BUTTON
    ) as HTMLButtonElement;

    keyEventHandler(this.direction, event, currentFocusedCaption);
  };

  #getEnabledItems = (): number => {
    let itemsEnabled = 0;
    let itemIndex = 0;

    while (itemsEnabled < 2 && itemIndex < this.model.length) {
      const itemUIModel = this.model[itemIndex];

      if (
        itemUIModel.disabled === false ||
        (!this.disabled && itemUIModel.disabled !== true)
      ) {
        itemsEnabled++;
      }

      itemIndex++;
    }

    return itemsEnabled;
  };

  #imgRender = (item: TabItemModel) =>
    item.startImgType === "img" &&
    item.startImgSrc && (
      <img
        aria-hidden="true"
        class={"caption-image " + this.#classes.IMAGE}
        part={this.#parts.IMAGE}
        alt=""
        src={item.startImgSrc}
        loading="lazy"
      />
    );

  #renderTabBar = (thereAreShiftedElements: boolean) => {
    const enabledItems = this.#getEnabledItems();
    const atLeastOneItemsIsEnabled = enabledItems >= 1;

    return (
      <div
        role="tablist"
        aria-label={this.accessibleName}
        class={this.#classes.TAB_LIST}
        part={this.#parts.TAB_LIST}
        onAuxClick={
          this.closeButton && atLeastOneItemsIsEnabled
            ? this.#handleClose
            : undefined
        }
        onClick={
          atLeastOneItemsIsEnabled ? this.#handleSelectedItemChange : undefined
        }
        // TODO: Add support to drag the item when it is disabled.
        // TODO: Add support to position the item in different areas
        onDragStart={
          this.sortable && atLeastOneItemsIsEnabled
            ? this.#handleDragStart
            : undefined
        }
        onKeyDown={
          this.model.length >= 2 && enabledItems >= 2
            ? this.#handleTabFocus
            : undefined
        }
        onMouseDown={
          this.closeButton && atLeastOneItemsIsEnabled
            ? this.#preventMouseDownOnScroll
            : undefined
        }
        ref={el => (this.#tabListRef = el)}
      >
        {this.model.map((item, index) =>
          this.#renderTabButton(item, index, thereAreShiftedElements)
        )}
      </div>
    );
  };

  #renderTabButton = (
    item: TabItemModel,
    index: number,
    thereAreShiftedElements: boolean
  ) => {
    const isDisabled = item.disabled ?? this.disabled;
    this.#itemIdToIndex.set(item.id, index);

    return (
      <button
        key={item.id}
        id={item.id}
        role="tab"
        aria-controls={PAGE_ID(item.id)}
        aria-label={!this.showCaptions ? item.name : null}
        aria-selected={(item.id === this.selectedId).toString()}
        class={{
          [this.#classes.BUTTON]: true,
          "no-captions": !this.showCaptions,

          "decorative-image": isPseudoElementImg(
            item.startImgSrc,
            item.startImgType
          ),

          "dragged-element": this.draggedElementIndex === index,
          "dragged-element--outside":
            this.draggedElementIndex === index &&
            this.hasCrossedBoundaries &&
            this.model.length > 1,
          "shifted-element": this.draggedElementIndex !== -1,

          "shifted-element--start":
            thereAreShiftedElements &&
            this.draggedElementIndex < index &&
            index <= this.draggedElementNewIndex,

          "shifted-element--end":
            thereAreShiftedElements &&
            this.draggedElementNewIndex <= index &&
            index < this.draggedElementIndex,

          sortable: this.sortable
        }}
        part={tokenMap({
          [this.#parts.BUTTON]: true,
          [item.id]: true,
          [SELECTED_PART]: item.id === this.selectedId,
          disabled: isDisabled
        })}
        disabled={isDisabled}
        style={
          isPseudoElementImg(item.startImgSrc, item.startImgType)
            ? { [DECORATIVE_IMAGE]: `url("${item.startImgSrc}")` }
            : null
        }
        // onDblClick={
        //   this.direction === "main" ? this.#handleItemDblClick : null
        // }
      >
        {this.#imgRender(item)}

        {this.showCaptions && item.name}

        {this.closeButton && (
          <button
            aria-label={this.closeButtonAccessibleName}
            class={CLOSE_BUTTON_CLASS}
            part={CLOSE_BUTTON_PART}
            disabled={isDisabled}
            type="button"
          ></button>
        )}
      </button>
    );
  };

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
      {[...this.#renderedPages.values()].map(this.#renderTabPage)}
    </div>
  );

  #renderTabPage = (item: TabItemModel) => {
    const contain = item.contain ?? this.contain;
    const overflow = item.overflow ?? this.overflow;

    const hasContain = contain !== "none";
    const hasOverflow =
      overflow !== "visible" && overflow !== "visible visible";

    return (
      <div
        key={PAGE_ID(item.id)}
        id={PAGE_ID(item.id)}
        role={!this.tabButtonHidden ? "tabpanel" : undefined}
        aria-labelledby={!this.tabButtonHidden ? item.id : undefined}
        class={{
          [this.#classes.PAGE]: true,
          "page--selected": item.id === this.selectedId,
          "page--hidden": !(item.id === this.selectedId)
        }}
        style={
          hasContain || hasOverflow
            ? {
                contain: hasContain ? contain : undefined,
                overflow: hasOverflow ? overflow : undefined
              }
            : undefined
        }
        part={this.#parts.PAGE}
      >
        <slot name={item.id} />
      </div>
    );
  };

  #renderDragPreview = (draggedElement: TabItemModel) => {
    const classes = {
      [DRAG_PREVIEW]: true,
      [DRAG_PREVIEW_OUTSIDE]: this.hasCrossedBoundaries,

      [DRAG_PREVIEW_INSIDE_INLINE]:
        !this.hasCrossedBoundaries && !isBlockDirection(this.direction),

      [DRAG_PREVIEW_INSIDE_BLOCK]:
        !this.hasCrossedBoundaries && isBlockDirection(this.direction)
    };

    const decorativeImage = isPseudoElementImg(
      draggedElement.startImgSrc,
      draggedElement.startImgType
    );

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
            "decorative-image": decorativeImage
          }}
          part={tokenMap({
            [this.#parts.BUTTON]: true,
            [draggedElement.id]: true,
            [DRAG_PREVIEW_ELEMENT]: true,
            [SELECTED_PART]: draggedElement.id === this.selectedId
          })}
          style={
            decorativeImage
              ? { [DECORATIVE_IMAGE]: `url("${draggedElement.startImgSrc}")` }
              : null
          }
        >
          {this.#imgRender(draggedElement)}

          {this.showCaptions && draggedElement.name}
        </button>
      </div>
    );
  };

  #initializeState = (direction: TabDirection) => {
    this.#updateRenderedPages(this.model);

    // Initialize classes and parts
    this.#setClassesAndParts(direction);
  };

  #setClassesAndParts = (direction: TabDirection) => {
    this.#classes = LIST_CLASSES;
    this.#parts = direction === "block" ? LIST_PART_BLOCK : LIST_PART_INLINE;
  };

  componentWillLoad() {
    this.#initializeState(this.direction);
  }

  render() {
    if (this.model == null || this.model.length === 0) {
      return "";
    }

    const draggedIndex = this.draggedElementIndex;
    const draggedElement = this.model[draggedIndex];
    const thereAreShiftedElementsInPreview =
      !this.hasCrossedBoundaries &&
      this.draggedElementNewIndex !== -1 &&
      this.draggedElementIndex !== this.draggedElementNewIndex;

    return (
      <Host
        class={
          !this.tabButtonHidden
            ? `ch-tab-direction--${this.direction}`
            : undefined
        }
      >
        {!this.tabButtonHidden &&
          this.#renderTabBar(thereAreShiftedElementsInPreview)}
        {this.#renderTabPages()}

        {draggedIndex !== -1 && this.#renderDragPreview(draggedElement)}
      </Host>
    );
  }
}

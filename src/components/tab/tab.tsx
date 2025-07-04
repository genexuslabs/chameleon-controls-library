import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { insertIntoIndex, removeElement } from "../../common/array";
import { getControlRegisterProperty } from "../../common/registry-properties";
import {
  KEY_CODES,
  SCROLLABLE_CLASS,
  TAB_PARTS_DICTIONARY
} from "../../common/reserved-names";
import { adoptCommonThemes } from "../../common/theme";
import type {
  CssContainProperty,
  CssOverflowProperty,
  GxImageMultiState,
  GxImageMultiStateStart
} from "../../common/types";
import {
  inBetween,
  isPseudoElementImg,
  isRTL,
  tokenMap,
  updateDirectionInImageCustomVar
} from "../../common/utils";
import {
  focusComposedPath,
  MouseEventButton,
  MouseEventButtons
} from "../common/helpers";
import {
  DraggableView,
  DraggableViewInfo
} from "../flexible-layout/internal/flexible-layout/types";
import {
  TabElementSize,
  TabItemCloseInfo,
  TabItemModel,
  TabListPosition,
  TabModel,
  TabSelectedItemInfo
} from "./types";
import {
  DEFAULT_TAB_LIST_POSITION,
  DRAG_PREVIEW,
  DRAG_PREVIEW_INSIDE_BLOCK,
  DRAG_PREVIEW_INSIDE_INLINE,
  DRAG_PREVIEW_OUTSIDE,
  isBlockDirection,
  isStartDirection,
  PANEL_ID
} from "./utils";

const TAB_BUTTON_CLASS = "tab";
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

type KeyEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_RIGHT
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ARROW_LEFT
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END;

// Selectors
const FIRST_CAPTION_BUTTON = (tabListRef: HTMLElement) =>
  tabListRef.querySelector(":scope>button") as HTMLButtonElement;

const LAST_CAPTION_BUTTON = (tabListRef: HTMLElement) =>
  tabListRef.querySelector(":scope>button:last-child") as HTMLButtonElement;

// Utility functions

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
  blockDirection: boolean,
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

  if (blockDirection) {
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

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });

@Component({
  shadow: true,
  styleUrl: "tab.scss",
  tag: "ch-tab-render"
})
export class ChTabRender implements DraggableView {
  #cancelId: number;

  #selectedIndex: number = -1;

  #lastDragEvent: MouseEvent;
  #needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  #initialMousePosition = -1;

  // Allocated at runtime to reduce memory usage
  #itemSizes: number[];

  // TODO: Allocate at runtime to reduce memory usage
  #images: Map<string, GxImageMultiStateStart | undefined> = new Map();

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
  #dragPreviewRef: HTMLButtonElement;
  #tabListRef: HTMLDivElement;
  #tabPageRef: HTMLDivElement;

  // Keyboard interactions
  #keyEvents: {
    [key in KeyEvents]: (
      blockDirection: boolean,
      event: KeyboardEvent,
      focusedCaption: HTMLButtonElement
    ) => void;
  } = {
    [KEY_CODES.ARROW_UP]: (blockDirection, ev, focusedButton) => {
      if (blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(false, this.#tabListRef, focusedButton, ev);
    },

    [KEY_CODES.ARROW_RIGHT]: (blockDirection, ev, focusedButton) => {
      if (!blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(!isRTL(), this.#tabListRef, focusedButton, ev);
    },

    [KEY_CODES.ARROW_DOWN]: (blockDirection, ev, focusedButton) => {
      if (blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(true, this.#tabListRef, focusedButton, ev);
    },

    [KEY_CODES.ARROW_LEFT]: (blockDirection, ev, focusedButton) => {
      if (!blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(isRTL(), this.#tabListRef, focusedButton, ev);
    },

    [KEY_CODES.HOME]: (_, ev) =>
      focusNextOrPreviousCaption(
        true,
        this.#tabListRef,
        LAST_CAPTION_BUTTON(this.#tabListRef),
        ev
      ),

    [KEY_CODES.END]: (_, ev) =>
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
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#computeImages();
  }

  /**
   * Specifies the items of the tab control.
   */
  @Prop() readonly model: TabModel;
  @Watch("model")
  modelChanged(newModel: TabModel) {
    this.#computeImages();
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
   * `true` to render a slot named "tab-list-end" to project content at the
   * end position of the tab-list ("after" the tab buttons).
   */
  @Prop() readonly showTabListEnd: boolean = false;

  /**
   * `true` to render a slot named "tab-list-start" to project content at the
   * start position of the tab-list ("before" the tab buttons).
   */
  @Prop() readonly showTabListStart: boolean = false;

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
   * Specifies the position of the tab list of the `ch-tab-render`.
   */
  @Prop() readonly tabListPosition: TabListPosition = DEFAULT_TAB_LIST_POSITION;

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

  // TODO: This code is exactly the same as the ch-accordion-render. We should
  // find the way to avoid this duplication
  #computeImage = (
    imageSrc: string | undefined
  ): GxImageMultiStateStart | undefined => {
    if (!imageSrc) {
      return undefined;
    }
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      return undefined;
    }
    const img = getImagePathCallback(imageSrc);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  };

  #computeImages = () => {
    this.#images.clear();

    this.model?.forEach(itemUIModel => {
      const itemImage = this.#computeImage(itemUIModel.startImgSrc);

      if (itemImage) {
        this.#images.set(itemUIModel.id, itemImage);
      }
    });
  };

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
    const blockDirection = isBlockDirection(this.tabListPosition);

    const getItemSize = blockDirection
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
      blockDirection,
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
    this.#initialMousePosition = blockDirection
      ? mousePositionX
      : mousePositionY;

    // - - - - - - - - - - - DOM write operations - - - - - - - - - - -
    // Initialize mouse position to avoid initial flickering
    setMousePosition(this.el, mousePositionX, mousePositionY);

    // Initialize the button position
    setButtonInitialPosition(this.el, buttonSizes.xStart, buttonSizes.yStart);

    setButtonSize(
      this.el,
      blockDirection ? buttonRect.width : buttonRect.height
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
      const mousePosition = isBlockDirection(this.tabListPosition)
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
    // Assume that the itemId always maps to an item
    const itemUIModel = this.model.find(({ id }) => id === itemId)!;
    const hasCloseButton = itemUIModel.closeButton ?? this.closeButton;

    if (!hasCloseButton) {
      return;
    }

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
      "." + TAB_BUTTON_CLASS
    ) as HTMLButtonElement;

    keyEventHandler(
      isBlockDirection(this.tabListPosition),
      event,
      currentFocusedCaption
    );
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
        class="caption-image img"
        part={TAB_PARTS_DICTIONARY.IMAGE}
        alt=""
        src={item.startImgSrc}
        loading="lazy"
      />
    );

  #renderTabListPosition = (
    position: "start" | "end",
    blockDirection: boolean,
    startDirection: boolean
  ) => {
    const tabListPosition = `tab-list-${position}` as const;

    return (
      <div
        key={tabListPosition}
        class={tabListPosition}
        part={tokenMap({
          [TAB_PARTS_DICTIONARY.LIST_START]: position === "start",
          [TAB_PARTS_DICTIONARY.LIST_END]: position === "end",
          [this.tabListPosition]: true,
          [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
          [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
          [TAB_PARTS_DICTIONARY.START]: startDirection,
          [TAB_PARTS_DICTIONARY.END]: !startDirection
        })}
      >
        <slot name={tabListPosition} />
      </div>
    );
  };

  #renderTabList = (thereAreShiftedElements: boolean) => {
    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);
    const enabledItems = this.#getEnabledItems();
    const atLeastOneItemsIsEnabled = enabledItems >= 1;

    return (
      <div
        role="tablist"
        aria-label={this.accessibleName}
        class={{
          "tab-list": true,
          "tab-list--block": blockDirection,
          "tab-list--inline": !blockDirection
        }}
        // TODO: Add "DRAGGING" parts
        part={tokenMap({
          [TAB_PARTS_DICTIONARY.LIST]: true,
          [this.tabListPosition]: true,
          [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
          [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
          [TAB_PARTS_DICTIONARY.START]: startDirection,
          [TAB_PARTS_DICTIONARY.END]: !startDirection
        })}
        // TODO: Don't add this handler if there is no items with closeButton
        onAuxClick={atLeastOneItemsIsEnabled ? this.#handleClose : undefined}
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
        // TODO: Don't add this handler if there is no items with closeButton
        onMouseDown={
          atLeastOneItemsIsEnabled ? this.#preventMouseDownOnScroll : undefined
        }
        ref={el => (this.#tabListRef = el)}
      >
        {this.model.map((item, index) =>
          this.#renderTabButton(
            item,
            index,
            thereAreShiftedElements,
            blockDirection,
            startDirection
          )
        )}
      </div>
    );
  };

  #renderTabButton = (
    item: TabItemModel,
    index: number,
    thereAreShiftedElements: boolean,
    blockDirection: boolean,
    startDirection: boolean
  ) => {
    const closeButton = item.closeButton ?? this.closeButton;
    const isDisabled = item.disabled ?? this.disabled;
    const selected = item.id === this.selectedId;
    this.#itemIdToIndex.set(item.id, index);

    const startImage = this.#images.get(item.id);
    const startImageClasses = startImage?.classes;
    const isDecorativeImage =
      isPseudoElementImg(item.startImgSrc, item.startImgType) && !!startImage;

    return (
      <button
        key={item.id}
        id={item.id}
        role="tab"
        aria-controls={PANEL_ID(item.id)}
        aria-label={
          item.accessibleName ?? (!this.showCaptions ? item.name : null)
        }
        aria-selected={selected.toString()}
        class={{
          [TAB_BUTTON_CLASS]: true,
          "no-captions": !this.showCaptions,

          sortable: this.sortable,
          selected: selected,

          [`start-img-type--${
            item.startImgType ?? "background"
          } pseudo-img--start`]: isDecorativeImage,
          [startImageClasses]: isDecorativeImage && !!startImageClasses,

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
            index < this.draggedElementIndex
        }}
        part={tokenMap({
          [item.id]: true,
          [TAB_PARTS_DICTIONARY.TAB]: true,
          [this.tabListPosition]: true,
          [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
          [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
          [TAB_PARTS_DICTIONARY.START]: startDirection,
          [TAB_PARTS_DICTIONARY.END]: !startDirection,
          [TAB_PARTS_DICTIONARY.CLOSABLE]: closeButton,
          [TAB_PARTS_DICTIONARY.NOT_CLOSABLE]: !closeButton,
          [TAB_PARTS_DICTIONARY.SELECTED]: selected,
          [TAB_PARTS_DICTIONARY.NOT_SELECTED]: !selected,
          [TAB_PARTS_DICTIONARY.DISABLED]: isDisabled
        })}
        disabled={isDisabled}
        style={isDecorativeImage ? startImage.styles : undefined}
        // onDblClick={
        //   this.direction === "main" ? this.#handleItemDblClick : null
        // }
      >
        {this.#imgRender(item)}

        {this.showCaptions && item.name}

        {closeButton && (
          <button
            aria-label={this.closeButtonAccessibleName}
            class={CLOSE_BUTTON_CLASS}
            part={tokenMap({
              [TAB_PARTS_DICTIONARY.CLOSE_BUTTON]: true,
              [this.tabListPosition]: true,
              [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
              [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
              [TAB_PARTS_DICTIONARY.START]: startDirection,
              [TAB_PARTS_DICTIONARY.END]: !startDirection,
              [TAB_PARTS_DICTIONARY.SELECTED]: selected,
              [TAB_PARTS_DICTIONARY.NOT_SELECTED]: !selected,
              [TAB_PARTS_DICTIONARY.DISABLED]: isDisabled
            })}
            disabled={isDisabled}
            type="button"
          ></button>
        )}
      </button>
    );
  };

  #renderTabPages = (blockDirection: boolean, startDirection: boolean) => (
    <div
      // This key is used key toggling the tabButtonHidden property, so we
      // avoid destroying this div
      key="panel-container"
      class={{
        "panel-container": true,
        "panel-container--collapsed": !this.expanded
      }}
      part={tokenMap({
        [TAB_PARTS_DICTIONARY.PANEL_CONTAINER]: true,
        [this.tabListPosition]: true,
        [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
        [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
        [TAB_PARTS_DICTIONARY.START]: startDirection,
        [TAB_PARTS_DICTIONARY.END]: !startDirection
      })}
      ref={el => (this.#tabPageRef = el)}
    >
      {[...this.#renderedPages.values()].map(this.#renderTabPanel)}
    </div>
  );

  #renderTabPanel = (item: TabItemModel) => {
    // TODO: Avoid this check as much as possible
    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);

    const contain = item.contain ?? this.contain;
    const isDisabled = item.disabled ?? this.disabled;
    const overflow = item.overflow ?? this.overflow;
    const selected = item.id === this.selectedId;

    const hasContain = contain !== "none";
    const hasOverflow =
      overflow !== "visible" && overflow !== "visible visible";

    return (
      <div
        key={PANEL_ID(item.id)}
        id={PANEL_ID(item.id)}
        role={!this.tabButtonHidden ? "tabpanel" : undefined}
        // TODO: Should we set the aria-label when tabButtonHidden === true?
        aria-labelledby={!this.tabButtonHidden ? item.id : undefined}
        class={{
          panel: true,
          "panel--selected": item.id === this.selectedId,
          "panel--hidden": !(item.id === this.selectedId),
          [SCROLLABLE_CLASS]:
            hasOverflow &&
            (overflow.includes("auto" satisfies CssOverflowProperty) ||
              overflow.includes("scroll" satisfies CssOverflowProperty))
        }}
        style={
          hasContain || hasOverflow
            ? {
                contain: hasContain ? contain : undefined,
                overflow: hasOverflow ? overflow : undefined
              }
            : undefined
        }
        part={tokenMap({
          [item.id]: true,
          [TAB_PARTS_DICTIONARY.PANEL]: true,
          [this.tabListPosition]: true,
          [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
          [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
          [TAB_PARTS_DICTIONARY.START]: startDirection,
          [TAB_PARTS_DICTIONARY.END]: !startDirection,
          [TAB_PARTS_DICTIONARY.SELECTED]: selected,
          [TAB_PARTS_DICTIONARY.NOT_SELECTED]: !selected,
          [TAB_PARTS_DICTIONARY.DISABLED]: isDisabled
        })}
      >
        <slot name={item.id} />
      </div>
    );
  };

  #renderDragPreview = (draggedElement: TabItemModel) => {
    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);
    const selected = draggedElement.id === this.selectedId;

    const startImage = this.#images.get(draggedElement.id);
    const startImageClasses = startImage?.classes;
    const isDecorativeImage =
      isPseudoElementImg(
        draggedElement.startImgSrc,
        draggedElement.startImgType
      ) && !!startImage;

    const closeButton = draggedElement.closeButton ?? this.closeButton;

    return (
      <button
        // TODO: Check if this is necessary
        // aria-hidden="true"
        class={{
          [TAB_BUTTON_CLASS]: true,
          [DRAG_PREVIEW]: true,
          "no-captions": !this.showCaptions,

          selected: selected,

          [`start-img-type--${
            draggedElement.startImgType ?? "background"
          } pseudo-img--start`]: isDecorativeImage,
          [startImageClasses]: isDecorativeImage && !!startImageClasses,

          [DRAG_PREVIEW_OUTSIDE]: this.hasCrossedBoundaries,
          [DRAG_PREVIEW_INSIDE_INLINE]:
            !this.hasCrossedBoundaries && !blockDirection,
          [DRAG_PREVIEW_INSIDE_BLOCK]:
            !this.hasCrossedBoundaries && blockDirection
        }}
        part={tokenMap({
          [draggedElement.id]: true,
          [TAB_PARTS_DICTIONARY.TAB]: true,
          [TAB_PARTS_DICTIONARY.DRAGGING]: true,
          [this.tabListPosition]: true,
          [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
          [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
          [TAB_PARTS_DICTIONARY.START]: startDirection,
          [TAB_PARTS_DICTIONARY.END]: !startDirection,
          [TAB_PARTS_DICTIONARY.DRAGGING_OUT_OF_TAB_LIST]:
            this.hasCrossedBoundaries,
          [TAB_PARTS_DICTIONARY.DRAGGING_OVER_TAB_LIST]:
            !this.hasCrossedBoundaries,
          [TAB_PARTS_DICTIONARY.CLOSABLE]: closeButton,
          [TAB_PARTS_DICTIONARY.NOT_CLOSABLE]: !closeButton,
          [TAB_PARTS_DICTIONARY.SELECTED]: selected,
          [TAB_PARTS_DICTIONARY.NOT_SELECTED]: !selected
        })}
        style={isDecorativeImage ? startImage.styles : undefined}
        ref={el => (this.#dragPreviewRef = el)}
      >
        {this.#imgRender(draggedElement)}

        {this.showCaptions && draggedElement.name}
      </button>
    );
  };

  #initializeState = () => {
    this.#updateRenderedPages(this.model);
  };

  connectedCallback() {
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);

    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty("getImagePathCallback", "ch-tab-render") ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#computeImages();
  }

  // TODO: Use connectedCallback
  componentWillLoad() {
    this.#initializeState();
  }

  render() {
    if (this.model == null || this.model.length === 0) {
      return "";
    }

    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);
    const draggedIndex = this.draggedElementIndex;
    const draggedElement = this.model[draggedIndex];
    const thereAreShiftedElementsInPreview =
      !this.hasCrossedBoundaries &&
      this.draggedElementNewIndex !== -1 &&
      this.draggedElementIndex !== this.draggedElementNewIndex;

    return (
      <Host
        class={
          !this.tabButtonHidden ? `ch-tab--${this.tabListPosition}` : undefined
        }
      >
        {!this.tabButtonHidden && [
          this.showTabListStart &&
            this.#renderTabListPosition(
              "start",
              blockDirection,
              startDirection
            ),
          this.#renderTabList(thereAreShiftedElementsInPreview),
          this.showTabListEnd &&
            this.#renderTabListPosition("end", blockDirection, startDirection)
        ]}

        {this.#renderTabPages(blockDirection, startDirection)}

        {draggedIndex !== -1 && this.#renderDragPreview(draggedElement)}
      </Host>
    );
  }
}

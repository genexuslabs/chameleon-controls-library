import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

import { IS_SERVER } from "../../development-flags";
import type {
  CssContainProperty,
  CssOverflowProperty
} from "../../typings/css-properties";
import type { GetImagePathCallback } from "../../typings/multi-state-images";
import { insertIntoIndex, removeIndex } from "../../utilities/array";
import {
  focusComposedPath,
  MouseEventButton,
  MouseEventButtons
} from "../../utilities/focus-composed-path";
import { inBetween } from "../../utilities/in-between";
import { tokenMap } from "../../utilities/mapping/token-map";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import { KEY_CODES } from "../../utilities/reserved-names/key-codes";
import { TAB_PARTS_DICTIONARY } from "../../utilities/reserved-names/reserved-names";
import { isRTL } from "../../utilities/rtl-watcher";
import { SyncWithRAF } from "../../utilities/sync-with-frames";
import { adoptCommonThemes } from "../../utilities/theme.js";

import type {
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

import styles from "./tab.scss?inline";

// In the server we need to preload the ch-image just in case to properly
// render it, because Lit doesn't support async rendering in the server.
// In the client we can lazy load the ch-image, since not all ch-tab-render
// will use an icon
if (IS_SERVER) {
  await import("../image/image.lit");
}

// - - - - - - - - - - - - - - - - - - - -
//           DraggableView interface
// - - - - - - - - - - - - - - - - - - - -
// Defined locally since flexible-layout has not been migrated yet.
// When it is, replace with the import from its types module.
export interface DraggableViewInfo {
  mainView: HTMLElement;
  pageView: HTMLElement;
  tabListView: HTMLElement;
}

export interface DraggableView {
  endDragPreview: () => Promise<void>;

  /**
   * Returns the info associated to the draggable views.
   */
  getDraggableViews: () => Promise<DraggableViewInfo>;

  promoteDragPreviewToTopLayer: () => Promise<void>;
}

// - - - - - - - - - - - - - - - - - - - -
//               Constants
// - - - - - - - - - - - - - - - - - - - -
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

// - - - - - - - - - - - - - - - - - - - -
//           Utility functions
// - - - - - - - - - - - - - - - - - - - -
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
  hostRef: HTMLElement,
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
  currentButtonCaption: HTMLButtonElement,
  tabListRef: HTMLElement
) =>
  (currentButtonCaption.nextElementSibling ??
    FIRST_CAPTION_BUTTON(tabListRef)) as HTMLButtonElement;

const getPreviousEnabledButtonCaption = (
  currentButtonCaption: HTMLButtonElement,
  tabListRef: HTMLElement
) =>
  (currentButtonCaption.previousElementSibling ??
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

const NO_ATTRIBUTE = { attribute: false };

/**
 * The `ch-tab-render` component renders a tabbed interface where each tab
 * button switches the visible content panel.
 *
 * @remarks
 * ## Features
 *  - Tab list positioning along any edge of the container (`block-start`,
 *    `block-end`, `inline-start`, or `inline-end`).
 *  - Optional images, icons, captions, and close buttons per tab.
 *  - Keyboard navigation following WAI-ARIA tab patterns (Arrow keys are
 *    direction-aware based on `tabListPosition`; Home/End jump to first/last
 *    tab).
 *  - Drag-to-reorder tabs within the tab list when `sortable` is enabled.
 *  - Drag tabs outside the component for relocation in a flexible layout
 *    context when `dragOutside` is enabled.
 *  - CSS containment and overflow configuration per tab panel.
 *
 * ## Use when
 *  - Building a multi-panel UI where content should be switchable through
 *    labeled tabs (settings dialogs, property inspectors, IDE-style editor
 *    groups).
 *  - Organizing related but independent content sections within the same
 *    context (e.g., "Overview", "Files", "Commits").
 *  - Users need to view one section at a time without leaving the page.
 *
 * ## Do not use when
 *  - Showing or hiding a single content section -- prefer an accordion instead.
 *  - Users must compare content across sections -- switching back and forth is
 *    too costly.
 *  - The sections represent different pages or routes -- prefer
 *    `ch-navigation-list-render`.
 *  - Content follows a sequential linear process -- prefer a stepper/wizard
 *    pattern.
 *  - More than 6 tabs are needed -- consider a sidebar or
 *    `ch-navigation-list-render`.
 *  - Confusing with `ch-segmented-control-render`: tabs switch to DIFFERENT
 *    content sections; segmented controls switch the VIEW FORMAT of the same
 *    data.
 *
 * ## Accessibility
 *  - Implements the WAI-ARIA Tabs pattern with `role="tablist"`, `role="tab"`,
 *    and `role="tabpanel"`.
 *  - Supports keyboard navigation: Arrow keys to move between tabs, Home/End
 *    to jump to first/last.
 *  - Each tab button reflects `aria-selected` and `aria-controls` linking to
 *    its panel.
 *  - Close buttons carry an accessible label.
 *
 * @status experimental
 *
 * @csspart tab - The primary `<button>` element for each tab item. Also receives the `{item.id}`, position, state, and direction parts.
 * @csspart tab-caption - The `<ch-textblock>` text label inside each tab button. Present when `showCaptions` is `true`.
 * @csspart img - The `<img>` element rendered when a tab item uses `startImgSrc` with `startImgType = "img"`.
 * @csspart close-button - The button that closes a tab. Rendered when `closeButton` is `true` and the item is closable.
 * @csspart tab-list - The `<div>` that wraps all tab buttons and acts as the `role="tablist"` container.
 * @csspart tab-list-start - The `<div>` adjacent to the start of the tab list. Used to project toolbar content via `slot={tabListPosition}`.
 * @csspart tab-list-end - The `<div>` adjacent to the end of the tab list. Used to project toolbar content via `slot={tabListPosition}`.
 * @csspart tab-panel - The panel `<div>` for each tab's content area. Receives `{item.id}`, position, and state parts.
 * @csspart tab-panel-container - The outer container `<div>` that wraps all tab panels.
 *
 * @csspart {item.id} - Present on the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts for each tab item, enabling per-tab styling.
 *
 * @csspart selected - Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is selected.
 * @csspart not-selected - Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is not selected.
 * @csspart disabled - Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is disabled.
 * @csspart closable - Present in the `tab` and `tab-caption` parts when the item has a close button.
 * @csspart not-closable - Present in the `tab` and `tab-caption` parts when the item does not have a close button.
 * @csspart dragging - Present in the `tab`, `close-button`, and `tab-list` parts while a tab is being dragged.
 * @csspart dragging-over-tab-list - Present in the `tab` and `close-button` parts while dragging within the tab list bounds.
 * @csspart dragging-out-of-tab-list - Present in the `tab` and `close-button` parts while dragging outside the tab list bounds.
 * @csspart expanded - Present in the `tab-panel-container` part when the panel container is visible.
 * @csspart collapsed - Present in the `tab-panel-container` part when the panel container is hidden.
 *
 * @csspart block - Present when the tab list is oriented vertically (block direction).
 * @csspart inline - Present when the tab list is oriented horizontally (inline direction).
 * @csspart start - Present when the tab list is positioned at the start edge.
 * @csspart end - Present when the tab list is positioned at the end edge.
 *
 * @slot {tabListPosition} - Named slot rendered adjacent to the tab list for custom toolbar content (e.g., an overflow menu or add-tab button).
 * @slot {item.id} - Named slot for each tab panel's content, projected when the tab has been rendered at least once.
 */
@Component({
  styles,
  tag: "ch-tab-render"
})
export class ChTabRender extends KasstorElement implements DraggableView {
  #selectedIndex: number = -1;

  #syncWithRAF = new SyncWithRAF();

  #lastDragEvent: MouseEvent | undefined;

  #initialMousePosition = -1;

  // Allocated at runtime to reduce memory usage
  #itemSizes: number[] | undefined;

  /**
   * This variable represents the boundaries of the box where the mouse can be
   * placed when dragging a caption, to consider that the caption is within the
   * tab list.
   */
  #mouseBoundingLimits: TabElementSize | undefined;

  #renderedPages: Map<string, TabItemModel> = new Map();
  #itemIdToIndex: Map<string, number> = new Map();

  // Refs
  #dragPreviewRef: Ref<HTMLButtonElement> = createRef();
  #tabListRef: Ref<HTMLDivElement> = createRef();
  #tabPageRef: Ref<HTMLDivElement> = createRef();

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
      focusNextOrPreviousCaption(
        false,
        this.#tabListRef.value!,
        focusedButton,
        ev
      );
    },

    [KEY_CODES.ARROW_RIGHT]: (blockDirection, ev, focusedButton) => {
      if (!blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(
        !isRTL(),
        this.#tabListRef.value!,
        focusedButton,
        ev
      );
    },

    [KEY_CODES.ARROW_DOWN]: (blockDirection, ev, focusedButton) => {
      if (blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(
        true,
        this.#tabListRef.value!,
        focusedButton,
        ev
      );
    },

    [KEY_CODES.ARROW_LEFT]: (blockDirection, ev, focusedButton) => {
      if (!blockDirection) {
        return;
      }
      focusNextOrPreviousCaption(
        isRTL(),
        this.#tabListRef.value!,
        focusedButton,
        ev
      );
    },

    [KEY_CODES.HOME]: (_, ev) =>
      focusNextOrPreviousCaption(
        true,
        this.#tabListRef.value!,
        LAST_CAPTION_BUTTON(this.#tabListRef.value!),
        ev
      ),

    [KEY_CODES.END]: (_, ev) =>
      focusNextOrPreviousCaption(
        false,
        this.#tabListRef.value!,
        FIRST_CAPTION_BUTTON(this.#tabListRef.value!),
        ev
      )
  };

  @state() protected draggedElementIndex = -1;
  @state() protected draggedElementNewIndex = -1;

  /**
   * `true` when the mouse position is out of bounds at least once.
   */
  @state() protected hasCrossedBoundaries = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element. This value is applied as the accessible name of the
   * `role="tablist"` element.
   */
  @property({ attribute: "accessible-name" }) accessibleName:
    | string
    | undefined;

  /**
   * `true` to display a close button for the items.
   */
  @property({ type: Boolean, attribute: "close-button" }) closeButton: boolean =
    false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element. This label is used for the close button of the captions.
   */
  @property({ attribute: "close-button-accessible-name" })
  closeButtonAccessibleName: string = "Close";

  /**
   * Same as the contain CSS property. This property indicates that an item
   * and its contents are, as much as possible, independent from the rest of
   * the document tree. Containment enables isolating a subsection of the DOM,
   * providing performance benefits by limiting calculations of layout, style,
   * paint, size, or any combination to a DOM subtree rather than the entire
   * page.
   * Containment can also be used to scope CSS counters and quotes.
   */
  @property() contain: CssContainProperty | undefined = "none";

  /**
   * This attribute lets you specify if all tab buttons are disabled.
   * If disabled, tab buttons will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * When the control is sortable, the items can be dragged outside of the
   * tab-list.
   *
   * This property lets you specify if this behavior is enabled.
   */
  @property({ type: Boolean, attribute: "drag-outside" }) dragOutside: boolean =
    false;

  /**
   * `true` if the tab panel container is visible. When `false`, only the
   * tab-list toolbar is displayed and all tab panels are hidden.
   */
  @property({ type: Boolean }) expanded: boolean = true;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @property(NO_ATTRIBUTE) getImagePathCallback:
    | GetImagePathCallback
    | undefined;

  /**
   * Specifies the items of the tab control. Tab panels use lazy rendering:
   * a panel's content slot is only rendered after the tab has been selected
   * at least once (tracked internally via `wasRendered`).
   */
  @property(NO_ATTRIBUTE) model: TabModel | undefined;
  @Observe("model")
  protected modelChanged() {
    this.#updateRenderedPages(this.model);
  }

  /**
   * Same as the overflow CSS property. This property sets the desired behavior
   * when content does not fit in the item's padding box (overflows) in the
   * horizontal and/or vertical direction.
   */
  @property() overflow:
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}` = "visible";

  /**
   * Specifies the selected item of the widgets array.
   */
  @property({ attribute: "selected-id" }) selectedId: string | undefined;
  @Observe("selectedId")
  protected selectedIdChanged() {
    if (!this.selectedId) {
      return;
    }
    const newSelectedTabItem = this.model?.find(
      item => item.id === this.selectedId
    );

    if (newSelectedTabItem) {
      this.#renderedPages.set(this.selectedId, newSelectedTabItem);
    }
  }

  /**
   * `true` to show the captions of the items.
   */
  @property({ type: Boolean, attribute: "show-captions" })
  showCaptions: boolean = true;

  /**
   * `true` to render a slot named "tab-list-end" to project content at the
   * end position of the tab-list ("after" the tab buttons).
   */
  @property({ type: Boolean, attribute: "show-tab-list-end" })
  showTabListEnd: boolean = false;

  /**
   * `true` to render a slot named "tab-list-start" to project content at the
   * start position of the tab-list ("before" the tab buttons).
   */
  @property({ type: Boolean, attribute: "show-tab-list-start" })
  showTabListStart: boolean = false;

  /**
   * `true` to enable sorting the tab buttons by dragging them in the tab-list.
   *
   * If `false`, the tab buttons can not be dragged out either.
   */
  @property({ type: Boolean }) sortable: boolean = false;

  /**
   * `true` to not render the tab buttons of the control.
   */
  @property({ type: Boolean, attribute: "tab-button-hidden" })
  tabButtonHidden: boolean = false;

  /**
   * Specifies the position of the tab list of the `ch-tab-render`.
   */
  @property({ attribute: "tab-list-position" })
  tabListPosition: TabListPosition = DEFAULT_TAB_LIST_POSITION;

  /**
   * Fired when an item of the main group is double clicked.
   */
  @Event() expandMainGroup!: EventEmitter<string>;

  /**
   * Fired the close button of an item is clicked.
   */
  @Event() itemClose!: EventEmitter<TabItemCloseInfo>;

  /**
   * Fired when the selected item change.
   * This event can be default prevented to prevent the item selection.
   */
  @Event() selectedItemChange!: EventEmitter<TabSelectedItemInfo>;

  /**
   * Fired the first time a caption button is dragged outside of its tab list.
   */
  @Event() itemDragStart!: EventEmitter<number>;

  /**
   * Ends the preview of the dragged item. Useful for ending the preview via
   * keyboard interaction.
   */
  async endDragPreview(): Promise<void> {
    this.#handleDragEnd();
  }

  /**
   * Returns the info associated to the draggable view.
   */
  async getDraggableViews(): Promise<DraggableViewInfo> {
    return {
      mainView: this,
      pageView: this.#tabPageRef.value!,
      tabListView: this.#tabListRef.value!
    };
  }

  /**
   * Promotes the drag preview to the top layer. Useful to avoid z-index issues.
   */
  async promoteDragPreviewToTopLayer(): Promise<void> {
    if (this.draggedElementIndex === -1) {
      return;
    }

    const dragPreview = this.#dragPreviewRef.value;
    if (!dragPreview) {
      return;
    }

    // If this property is added in a declarative way, we would have to use
    // requestAnimationFrame to delay the showPopover() method, since the
    // popover defaults to "auto", which does not allow to keep multiple "auto"
    // popovers open at the same time
    dragPreview.popover = "manual";

    dragPreview.showPopover();
  }

  /**
   * Given an id, remove the page from the render
   */
  async removePage(pageId: string, forceRerender = true) {
    this.#renderedPages.delete(pageId);

    if (forceRerender) {
      this.requestUpdate();
    }
  }

  // - - - - - - - - - - - - - - - - - - - -
  //          Image rendering
  // - - - - - - - - - - - - - - - - - - - -
  #renderImage = (item: TabItemModel) => {
    if (!item.startImgSrc) {
      return nothing;
    }

    return html`<ch-image
      class="caption-image"
      part=${TAB_PARTS_DICTIONARY.IMAGE}
      aria-hidden="true"
      .getImagePathCallback=${this.getImagePathCallback}
      .src=${item.startImgSrc}
      .type=${item.startImgType ?? "background"}
      .disabled=${item.disabled ?? this.disabled}
    ></ch-image>`;
  };

  // - - - - - - - - - - - - - - - - - - - -
  //        Close button check
  // - - - - - - - - - - - - - - - - - - - -
  #buttonIsCloseButton = (buttonRef: HTMLButtonElement) =>
    buttonRef.className === CLOSE_BUTTON_CLASS;

  // - - - - - - - - - - - - - - - - - - - -
  //        Rendered pages management
  // - - - - - - - - - - - - - - - - - - - -
  /**
   * Make a set based on the rendered items array to maintain order between the
   * pages, even when re-ordering tabs. This is useful for optimizing rendering
   * performance by not re-ordering pages when the caption's order changes.
   */
  #updateRenderedPages = (items: TabModel | undefined) => {
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
      const newSelectedTabItem = this.model?.find(
        item => item.id === this.selectedId
      );

      if (newSelectedTabItem) {
        this.#renderedPages.set(this.selectedId, newSelectedTabItem);
      }
    }
  };

  // - - - - - - - - - - - - - - - - - - - -
  //         Drag and Drop handlers
  // - - - - - - - - - - - - - - - - - - - -
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
    this.draggedElementIndex = itemIndex!;

    // - - - - - - - - - - - DOM read operations - - - - - - - - - - -
    const mousePositionX = event.clientX;
    const mousePositionY = event.clientY;
    const blockDirection = isBlockDirection(this.tabListPosition);

    const getItemSize = blockDirection
      ? (item: HTMLElement) => item.getBoundingClientRect().width
      : (item: HTMLElement) => item.getBoundingClientRect().height;
    this.#itemSizes = [...this.#tabListRef.value!.children].map(
      getItemSize as (item: Element) => number
    );

    const buttonRect = (
      event.target as HTMLButtonElement
    ).getBoundingClientRect();

    // Tab List information
    const tabListSizes = getTabListSizesAndSetPosition(
      this,
      this.#tabListRef.value!,
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
    setMousePosition(this, mousePositionX, mousePositionY);

    // Initialize the button position
    setButtonInitialPosition(this, buttonSizes.xStart, buttonSizes.yStart);

    setButtonSize(this, blockDirection ? buttonRect.width : buttonRect.height);

    // Update mouse offset to correctly place the dragged element preview
    setMouseOffset(
      this,
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
    // events and in the next frame the mousemove handler will be executed
    this.#syncWithRAF.cancel();

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
      const itemToInsert = removeIndex(this.model!, this.draggedElementIndex);
      insertIntoIndex(this.model!, itemToInsert, this.draggedElementNewIndex);

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
    this.style.removeProperty(TRANSITION_DURATION);
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

    this.#syncWithRAF.perform(
      // Computation in animation frame
      () => {
        const mousePositionX = this.#lastDragEvent!.clientX;
        const mousePositionY = this.#lastDragEvent!.clientY;

        setMousePosition(this, mousePositionX, mousePositionY);

        // There is no need to update the preview of the reorder
        if (this.hasCrossedBoundaries) {
          return;
        }

        const mouseLimits = this.#mouseBoundingLimits;

        // Check mouse limits if drag outside is enabled
        if (this.dragOutside && mouseLimits) {
          const draggedButtonIsInsideTheTabList =
            inBetween(mouseLimits.xStart, mousePositionX, mouseLimits.xEnd) &&
            inBetween(mouseLimits.yStart, mousePositionY, mouseLimits.yEnd);

          // Emit the itemDragStart event the first time the button is out of
          // the mouse bounds (`mouseBoundingLimits`)
          if (!draggedButtonIsInsideTheTabList) {
            this.hasCrossedBoundaries = true;

            // Remove transition before the render to avoid flickering in the
            // animation
            this.style.setProperty(TRANSITION_DURATION, "0s");

            this.itemDragStart.emit(this.draggedElementIndex);
            return;
          }
        }

        // There is no need to re-order the items in the preview
        if (this.model!.length === 1) {
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
            newIndex < this.model!.length - 1 &&
            distanceTraveled - this.#itemSizes![newIndex + 1] / 2 > 0
          ) {
            distanceTraveled -= this.#itemSizes![newIndex + 1];
            newIndex++;
          }
        } else {
          // While it is not the first item and the distance traveled is greater
          // than half the size of the previous item
          while (
            newIndex > 0 &&
            distanceTraveled - this.#itemSizes![newIndex - 1] / 2 > 0
          ) {
            distanceTraveled -= this.#itemSizes![newIndex - 1];
            newIndex--;
          }
        }

        // Check if should update the dragged element index in the preview
        if (this.draggedElementNewIndex !== newIndex) {
          this.draggedElementNewIndex = newIndex;
        }
      }
    );
  };

  // - - - - - - - - - - - - - - - - - - - -
  //         Selection and close handlers
  // - - - - - - - - - - - - - - - - - - - -
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
    const composedPath = event.composedPath();
    const buttonRef = composedPath.find(
      eventTarget =>
        (eventTarget as HTMLElement).tagName?.toLowerCase() === "button"
    ) as HTMLButtonElement | undefined;

    // Check the click event is performed on a button element
    if (!buttonRef || buttonRef.getRootNode() !== this.shadowRoot) {
      return;
    }

    // Click was performed on the close button --> itemClose event
    if (this.#buttonIsCloseButton(buttonRef)) {
      // The parent is the tab button with the itemId
      this.#emitCloseEvent(buttonRef.parentElement!.id, event);
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
        ? buttonRef.parentElement!.id
        : buttonRef.id;
      this.#emitCloseEvent(itemId, event);
    }
  };

  #emitCloseEvent = (itemId: string, event: PointerEvent) => {
    // Assume that the itemId always maps to an item
    const itemUIModel = this.model!.find(({ id }) => id === itemId)!;
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

  // - - - - - - - - - - - - - - - - - - - -
  //         Keyboard navigation
  // - - - - - - - - - - - - - - - - - - - -
  #handleTabFocus = (event: KeyboardEvent) => {
    const keyEventHandler = this.#keyEvents[event.code as KeyEvents];
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

    while (itemsEnabled < 2 && itemIndex < this.model!.length) {
      const itemUIModel = this.model![itemIndex];

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

  // - - - - - - - - - - - - - - - - - - - -
  //              Tab parts
  // - - - - - - - - - - - - - - - - - - - -
  #getTabParts = ({
    id,
    blockDirection,
    closeButton,
    isDisabled,
    isTabCaption,
    selected,
    startDirection
  }: {
    id: string;
    blockDirection: boolean;
    closeButton: boolean;
    isDisabled: boolean;
    isTabCaption: boolean;
    selected: boolean;
    startDirection: boolean;
  }) =>
    tokenMap({
      [id]: true,
      [TAB_PARTS_DICTIONARY.TAB]: !isTabCaption,
      [TAB_PARTS_DICTIONARY.TAB_CAPTION]: isTabCaption,
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
    });

  // - - - - - - - - - - - - - - - - - - - -
  //          Render methods
  // - - - - - - - - - - - - - - - - - - - -
  #renderTabListPosition = (
    position: "start" | "end",
    blockDirection: boolean,
    startDirection: boolean
  ): TemplateResult => {
    const tabListPosition = `tab-list-${position}` as const;

    return html`<div
      class=${tabListPosition}
      part=${tokenMap({
        [TAB_PARTS_DICTIONARY.LIST_START]: position === "start",
        [TAB_PARTS_DICTIONARY.LIST_END]: position === "end",
        [this.tabListPosition]: true,
        [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
        [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
        [TAB_PARTS_DICTIONARY.START]: startDirection,
        [TAB_PARTS_DICTIONARY.END]: !startDirection
      })}
    >
      <slot name=${tabListPosition}></slot>
    </div>`;
  };

  #renderTabList = (thereAreShiftedElements: boolean): TemplateResult => {
    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);
    const enabledItems = this.#getEnabledItems();
    const atLeastOneItemIsEnabled = enabledItems >= 1;

    return html`<div
      role="tablist"
      aria-label=${this.accessibleName || nothing}
      class=${classMap({
        "tab-list": true,
        "tab-list--block": blockDirection,
        "tab-list--inline": !blockDirection
      })}
      part=${tokenMap({
        [TAB_PARTS_DICTIONARY.LIST]: true,
        [this.tabListPosition]: true,
        [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
        [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
        [TAB_PARTS_DICTIONARY.START]: startDirection,
        [TAB_PARTS_DICTIONARY.END]: !startDirection
      })}
      @auxclick=${atLeastOneItemIsEnabled ? this.#handleClose : nothing}
      @click=${atLeastOneItemIsEnabled
        ? this.#handleSelectedItemChange
        : nothing}
      @dragstart=${this.sortable && atLeastOneItemIsEnabled
        ? this.#handleDragStart
        : nothing}
      @keydown=${this.model!.length >= 2 && enabledItems >= 2
        ? this.#handleTabFocus
        : nothing}
      @mousedown=${atLeastOneItemIsEnabled
        ? this.#preventMouseDownOnScroll
        : nothing}
      ${ref(this.#tabListRef)}
    >
      ${this.model!.map((item, index) =>
        this.#renderTabButton(
          item,
          index,
          thereAreShiftedElements,
          blockDirection,
          startDirection
        )
      )}
    </div>`;
  };

  #renderTabButton = (
    item: TabItemModel,
    index: number,
    thereAreShiftedElements: boolean,
    blockDirection: boolean,
    startDirection: boolean
  ): TemplateResult => {
    const closeButton = item.closeButton ?? this.closeButton;
    const isDisabled = item.disabled ?? this.disabled;
    const selected = item.id === this.selectedId;
    this.#itemIdToIndex.set(item.id, index);

    const hasStartImage = !!item.startImgSrc;

    return html`<button
      id=${item.id}
      role="tab"
      aria-controls=${PANEL_ID(item.id)}
      aria-label=${item.accessibleName ??
      (!this.showCaptions ? item.name : nothing) ??
      nothing}
      aria-selected=${selected.toString()}
      class=${classMap({
        [TAB_BUTTON_CLASS]: true,
        "no-captions": !this.showCaptions,
        sortable: this.sortable,
        selected: selected,
        "dragged-element": this.draggedElementIndex === index,
        "dragged-element--outside":
          this.draggedElementIndex === index &&
          this.hasCrossedBoundaries &&
          this.model!.length > 1,
        "shifted-element": this.draggedElementIndex !== -1,
        "shifted-element--start":
          thereAreShiftedElements &&
          this.draggedElementIndex < index &&
          index <= this.draggedElementNewIndex,
        "shifted-element--end":
          thereAreShiftedElements &&
          this.draggedElementNewIndex <= index &&
          index < this.draggedElementIndex
      })}
      part=${this.#getTabParts({
        id: item.id,
        blockDirection,
        closeButton,
        isDisabled,
        isTabCaption: false,
        selected,
        startDirection
      })}
      ?disabled=${isDisabled}
    >
      ${hasStartImage ? this.#renderImage(item) : nothing}
      ${this.showCaptions
        ? html`<ch-textblock
            class="tab-caption"
            part=${this.#getTabParts({
              id: item.id,
              blockDirection,
              closeButton,
              isDisabled,
              isTabCaption: true,
              selected,
              startDirection
            })}
            .caption=${item.name}
            .showTooltipOnOverflow=${true}
          ></ch-textblock>`
        : nothing}
      ${closeButton
        ? html`<button
            aria-label=${this.closeButtonAccessibleName}
            class=${CLOSE_BUTTON_CLASS}
            part=${tokenMap({
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
            ?disabled=${isDisabled}
            type="button"
          ></button>`
        : nothing}
    </button>`;
  };

  #renderTabPages = (
    blockDirection: boolean,
    startDirection: boolean
  ): TemplateResult =>
    html`<div
      class=${classMap({
        "panel-container": true,
        "panel-container--collapsed": !this.expanded
      })}
      part=${tokenMap({
        [TAB_PARTS_DICTIONARY.PANEL_CONTAINER]: true,
        [this.tabListPosition]: true,
        [TAB_PARTS_DICTIONARY.BLOCK]: blockDirection,
        [TAB_PARTS_DICTIONARY.INLINE]: !blockDirection,
        [TAB_PARTS_DICTIONARY.START]: startDirection,
        [TAB_PARTS_DICTIONARY.END]: !startDirection
      })}
      ${ref(this.#tabPageRef)}
    >
      ${[...this.#renderedPages.values()].map(item =>
        this.#renderTabPanel(item)
      )}
    </div>`;

  #renderTabPanel = (item: TabItemModel): TemplateResult => {
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

    return html`<div
      id=${PANEL_ID(item.id)}
      role=${!this.tabButtonHidden ? "tabpanel" : nothing}
      aria-labelledby=${!this.tabButtonHidden ? item.id : nothing}
      class=${classMap({
        panel: true,
        "panel--selected": item.id === this.selectedId,
        "panel--hidden": item.id !== this.selectedId,
        [SCROLLABLE_CLASS]:
          hasOverflow &&
          (overflow.includes("auto" satisfies CssOverflowProperty) ||
            overflow.includes("scroll" satisfies CssOverflowProperty))
      })}
      style=${hasContain || hasOverflow
        ? styleMap({
            contain: hasContain ? contain! : undefined,
            overflow: hasOverflow ? overflow : undefined
          })
        : nothing}
      part=${tokenMap({
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
      <slot name=${item.id}></slot>
    </div>`;
  };

  #renderDragPreview = (draggedElement: TabItemModel): TemplateResult => {
    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);
    const selected = draggedElement.id === this.selectedId;
    const closeButton = draggedElement.closeButton ?? this.closeButton;
    const hasStartImage = !!draggedElement.startImgSrc;

    return html`<button
      class=${classMap({
        [TAB_BUTTON_CLASS]: true,
        [DRAG_PREVIEW]: true,
        "no-captions": !this.showCaptions,
        selected: selected,
        [DRAG_PREVIEW_OUTSIDE]: this.hasCrossedBoundaries,
        [DRAG_PREVIEW_INSIDE_INLINE]:
          !this.hasCrossedBoundaries && !blockDirection,
        [DRAG_PREVIEW_INSIDE_BLOCK]:
          !this.hasCrossedBoundaries && blockDirection
      })}
      part=${tokenMap({
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
      ${ref(this.#dragPreviewRef)}
    >
      ${hasStartImage ? this.#renderImage(draggedElement) : nothing}
      ${this.showCaptions ? draggedElement.name : nothing}
    </button>`;
  };

  // - - - - - - - - - - - - - - - - - - - -
  //           Lifecycle
  // - - - - - - - - - - - - - - - - - - - -
  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.shadowRoot) {
      return;
    }

    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);
  }

  protected override firstWillUpdate(): void {
    this.#updateRenderedPages(this.model);
  }

  // - - - - - - - - - - - - - - - - - - - -
  //           Render
  // - - - - - - - - - - - - - - - - - - - -
  protected override render() {
    if (this.model == null || this.model.length === 0) {
      return nothing;
    }

    const blockDirection = isBlockDirection(this.tabListPosition);
    const startDirection = isStartDirection(this.tabListPosition);
    const draggedIndex = this.draggedElementIndex;
    const draggedElement = this.model[draggedIndex];
    const thereAreShiftedElementsInPreview =
      !this.hasCrossedBoundaries &&
      this.draggedElementNewIndex !== -1 &&
      this.draggedElementIndex !== this.draggedElementNewIndex;

    // Set the host class for the tab list position layout
    // TODO: Add a unit test for the tabButtonHidden property
    if (!this.tabButtonHidden) {
      this.classList.add(`ch-tab--${this.tabListPosition}`);
    } else {
      // Remove any previously set position class
      this.classList.remove(
        "ch-tab--block-start",
        "ch-tab--block-end",
        "ch-tab--inline-start",
        "ch-tab--inline-end"
      );
    }

    return html`${!this.tabButtonHidden
      ? html`${this.showTabListStart
          ? this.#renderTabListPosition("start", blockDirection, startDirection)
          : nothing}
        ${this.#renderTabList(thereAreShiftedElementsInPreview)}
        ${this.showTabListEnd
          ? this.#renderTabListPosition("end", blockDirection, startDirection)
          : nothing}`
      : nothing}
    ${this.#renderTabPages(blockDirection, startDirection)}
    ${draggedIndex !== -1 ? this.#renderDragPreview(draggedElement) : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-tab-render": ChTabRender;
  }
}


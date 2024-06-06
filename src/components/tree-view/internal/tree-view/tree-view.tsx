import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  Prop,
  State,
  h,
  readTask,
  writeTask
} from "@stencil/core";

import {
  TreeViewDataTransferInfo,
  TreeViewDropCheckInfo,
  TreeViewDroppableZoneState,
  TreeViewItemContextMenu,
  TreeViewItemDragStartInfo,
  TreeViewItemExpandedInfo,
  TreeViewItemSelectedInfo,
  TreeViewItemSelected,
  TreeViewDropType
} from "./types";
import {
  focusComposedPath,
  mouseEventModifierKey
} from "../../../common/helpers";
import { scrollToEdge } from "../../../../common/scroll-to-edge";
import { GxDataTransferInfo } from "../../../../common/types";
import { ChTreeViewItemCustomEvent } from "../../../../components";
import { TREE_VIEW_PARTS_DICTIONARY } from "../../../../common/reserved-names";
import {
  isRTL,
  subscribeToRTLChanges,
  unsubscribeToRTLChanges
} from "../../../../common/utils";

const TREE_ITEM_TAG_NAME = "ch-tree-view-item";
const TREE_DROP_TAG_NAME = "ch-tree-view-drop";
const TREE_TAG_NAME = "ch-tree-view";

// Droppable zone states
const CHECKING: TreeViewDroppableZoneState = "checking";
const INVALID: TreeViewDroppableZoneState = "invalid";
const TEMPORAL_INVALID: TreeViewDroppableZoneState = "temporal-invalid";
const VALID: TreeViewDroppableZoneState = "valid";

// Selectors
// const CHECKED_ITEMS = `${TREE_ITEM_TAG_NAME}[checked]`;
const ITEM_SELECTOR = (treeItemId: string) =>
  `${TREE_ITEM_TAG_NAME}[id="${treeItemId}"]`;

const TEXT_FORMAT = "text/plain";

const ARROW_DOWN_KEY = "ArrowDown";
const ARROW_UP_KEY = "ArrowUp";
const EDIT_KEY = "F2";

type KeyEvents = typeof ARROW_DOWN_KEY | typeof ARROW_UP_KEY | typeof EDIT_KEY;

const isTreeDrop = (element: HTMLElement) =>
  element.tagName.toLowerCase() === TREE_DROP_TAG_NAME;

const isTreeItem = (element: HTMLElement) =>
  element.tagName.toLowerCase() === TREE_ITEM_TAG_NAME;

const isTreeItemOrTreeDrop = (elementTagName: string) =>
  elementTagName === TREE_ITEM_TAG_NAME ||
  elementTagName === TREE_DROP_TAG_NAME;

const getFocusedTreeItem = (): HTMLChTreeViewItemElement | undefined =>
  focusComposedPath().find(isTreeItem) as HTMLChTreeViewItemElement;

const canMoveTreeItemFocus = (treeItem: HTMLChTreeViewItemElement): boolean =>
  treeItem && !treeItem.editing;

const getDroppableZoneKey = (
  newContainerId: string,
  draggedItems: GxDataTransferInfo[],
  dropType: TreeViewDropType
) =>
  `"newContainerId":"${newContainerId}","metadata":"${JSON.stringify(
    draggedItems
  )}","dropType":"${dropType}"`;

const POSITION_X_DRAG_CUSTOM_VAR = "--ch-tree-view-dragging-item-x";
const POSITION_Y_DRAG_CUSTOM_VAR = "--ch-tree-view-dragging-item-y";

let autoId = 0;

/**
 * @part drag-preview - The element that contains the preview information for the current drag.
 */
@Component({
  tag: "ch-tree-view",
  styleUrl: "tree-view.scss",
  shadow: true
})
export class ChTreeView {
  // @todo TODO: Check if key codes works in Safari
  #keyDownEvents: {
    [key in KeyEvents]: (event: KeyboardEvent) => void;
  } = {
    [ARROW_DOWN_KEY]: event => {
      const treeItem = getFocusedTreeItem();

      if (!canMoveTreeItemFocus(treeItem)) {
        return;
      }
      event.preventDefault();
      treeItem.focusNextItem(mouseEventModifierKey(event));
    },

    [ARROW_UP_KEY]: event => {
      const treeItem = getFocusedTreeItem();

      if (!canMoveTreeItemFocus(treeItem)) {
        return;
      }
      event.preventDefault();
      treeItem.focusPreviousItem(mouseEventModifierKey(event));
    },

    [EDIT_KEY]: event => {
      const treeItem = getFocusedTreeItem();

      if (!treeItem || !treeItem.editable) {
        return;
      }

      event.preventDefault();
      treeItem.editing = true;
    }
  };

  #draggingSelectedItems = false;
  #needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  #lastDragEvent: MouseEvent;

  #openSubTreeTimeout: NodeJS.Timeout;

  /**
   * Cache to avoid duplicate requests when checking the droppable zone in the
   * same drag event.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #validDroppableZoneCache: Map<string, TreeViewDroppableZoneState> = new Map();
  #dragStartTimestamp: number; // Useful to avoid race conditions where the server response is slow
  #draggedItems: GxDataTransferInfo[];

  /**
   * Useful to identify the control and subscribe to RTL changes
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #treeViewId: string;

  // Refs
  #currentDraggedItem: HTMLChTreeViewItemElement;
  #lastOpenSubTreeItem: HTMLChTreeViewItemElement | HTMLChTreeViewDropElement;

  /**
   * Text displayed when dragging an item.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #dragInfo: string;
  #draggedIds: string[] = [];
  #draggedParentIds: string[] = [];

  @Element() el: HTMLChTreeViewElement;

  @State() draggingInTheDocument = false;

  @State() draggingInTree = false;

  @State() rtlDirection = false;

  /**
   * Set this attribute if you want to allow multi selection of the items.
   */
  @Prop() readonly multiSelection: boolean = false;

  /**
   * This property lets you specify the time (in ms) that the mouse must be
   * over in a subtree to open it when dragging.
   */
  @Prop() readonly openSubTreeCountdown: number = 750;

  /**
   * Callback that is executed to get the current selected items.
   */
  @Prop() readonly selectedItemsCallback: () => Map<
    string,
    TreeViewItemSelectedInfo
  >;

  /**
   * `true` to scroll in the tree when dragging an item near the edges of the
   * tree.
   */
  @Prop() readonly scrollToEdgeOnDrag: boolean = true;

  /**
   * This property lets you specify if the tree is waiting to process the drop
   * of items.
   */
  @Prop() readonly waitDropProcessing: boolean = false;

  /**
   * Fired when an element attempts to enter in a droppable zone where the tree
   * has no information about the validity of the drop.
   */
  @Event() droppableZoneEnter: EventEmitter<TreeViewDropCheckInfo>;

  /**
   * Fired when an item is expanded or collapsed.
   */
  @Event() expandedItemChange: EventEmitter<TreeViewItemExpandedInfo>;

  /**
   * Fired when an element displays its contextmenu.
   */
  @Event() itemContextmenu: EventEmitter<TreeViewItemContextMenu>;

  /**
   * Fired when the dragged items are dropped in another item of the tree.
   */
  @Event() itemsDropped: EventEmitter<TreeViewDataTransferInfo>;

  /**
   * Fired when the selected items change.
   */
  @Event() selectedItemsChange: EventEmitter<
    Map<string, TreeViewItemSelectedInfo>
  >;

  @Listen("contextmenu", { capture: true })
  onContextMenu(event: PointerEvent) {
    const treeItem = (event.target as HTMLElement).closest(TREE_ITEM_TAG_NAME);

    if (!treeItem) {
      return;
    }
    event.preventDefault();

    this.itemContextmenu.emit({
      id: treeItem.id,
      itemRef: treeItem,
      metadata: treeItem.metadata,
      contextmenuEvent: event
    });
  }

  // Set edit mode in items
  @Listen("keydown", { capture: true })
  onKeyDown(event: KeyboardEvent) {
    const keyHandler = this.#keyDownEvents[event.key];

    if (keyHandler) {
      keyHandler(event);
    }
  }

  // We can't use capture, because the dataTransfer info would not be defined
  // Also, we cant use capture and setTimeout with 0 seconds, because the
  // getData method can only be accessed during the dragstart and drop event
  @Listen("dragstart", { passive: true, target: "window" })
  onDragStart(event: DragEvent) {
    // Reset the validity of the droppable zones with each new drag start
    this.#validDroppableZoneCache.clear();

    // If there is no data, the dragstart does not achieve the interface required
    const data = event.dataTransfer.getData(TEXT_FORMAT);
    if (data === "") {
      return;
    }

    try {
      // Try to parse the data
      const paredData = JSON.parse(data);

      this.#draggedItems = paredData;
      this.draggingInTheDocument = true;
      this.#dragStartTimestamp = new Date().getTime();
    } catch {
      // Empty
    }
  }

  @Listen("dragend", { capture: true, passive: true, target: "window" })
  onDragEnd() {
    this.draggingInTheDocument = false;
  }

  @Listen("dragenter", { capture: true, passive: true })
  onDragEnter(event: DragEvent) {
    this.#cancelSubTreeOpening(null, true);
    event.stopPropagation();

    // The event target can be either a tree item or a tree drop element
    const eventTarget = event.target as
      | HTMLChTreeViewItemElement
      | HTMLChTreeViewDropElement;
    const containerTargetTagName = eventTarget.tagName.toLowerCase();

    // Check if it is a valid item
    if (!isTreeItemOrTreeDrop(containerTargetTagName)) {
      return;
    }

    const targetIsTreeItem = containerTargetTagName === TREE_ITEM_TAG_NAME;
    const dragEnterInformation = this.#getDropTypeAndTreeItemTarget(
      eventTarget,
      targetIsTreeItem
    );
    const treeItemTarget = dragEnterInformation.treeItem;
    const dropType = dragEnterInformation.dropType;

    this.#lastOpenSubTreeItem = eventTarget;

    // Only the tree view items can open its subtree when hovering
    if (targetIsTreeItem) {
      this.#openSubTreeAfterCountdown(treeItemTarget);
    }

    if (this.#validDroppableZone(event, treeItemTarget, dropType) === VALID) {
      eventTarget.dragState = "enter";
    }
  }

  @Listen("dragleave", { capture: true, passive: true })
  onDragLeave(event: DragEvent) {
    const currentTarget = event.target as
      | HTMLChTreeViewItemElement
      | HTMLChTreeViewDropElement;

    if (!isTreeItemOrTreeDrop(currentTarget.tagName.toLowerCase())) {
      return;
    }

    currentTarget.dragState = "none";

    if (isTreeItem(currentTarget)) {
      this.#cancelSubTreeOpening(currentTarget as HTMLChTreeViewItemElement);
    }
  }

  #getDropTypeAndTreeItemTarget = (
    eventTarget: HTMLChTreeViewItemElement | HTMLChTreeViewDropElement,
    targetIsTreeItem: boolean
  ): {
    treeItem: HTMLChTreeViewItemElement;
    dropType: TreeViewDropType;
  } => {
    // Only the tree view items can open its subtree when hovering
    if (targetIsTreeItem) {
      return {
        treeItem: eventTarget as HTMLChTreeViewItemElement,
        dropType: "above"
      };
    }

    // The drop is intended to be performed before or after the tree item
    const dropType: TreeViewDropType = (
      eventTarget as HTMLChTreeViewDropElement
    ).type;

    return {
      // Depending on the position of the tree drop, we get the treeItem ref
      treeItem: (dropType === "before"
        ? eventTarget.nextElementSibling
        : eventTarget.previousElementSibling) as HTMLChTreeViewItemElement,
      dropType: (eventTarget as HTMLChTreeViewDropElement).type
    };
  };

  #cancelSubTreeOpening = (
    treeItemOrTreeDrop: HTMLChTreeViewItemElement | HTMLChTreeViewDropElement,
    forceClear = false
  ) => {
    if (this.#lastOpenSubTreeItem === treeItemOrTreeDrop || forceClear) {
      clearTimeout(this.#openSubTreeTimeout);
      this.#lastOpenSubTreeItem = null;
    }
  };

  @Listen("drop")
  onDrop(event: DragEvent) {
    event.stopPropagation();

    this.#cancelSubTreeOpening(null, true);
    const eventTarget = event.target as
      | HTMLChTreeViewItemElement
      | HTMLChTreeViewDropElement;
    const containerTargetTagName = eventTarget.tagName.toLowerCase();

    // Check if it is a valid item
    if (!isTreeItemOrTreeDrop(containerTargetTagName)) {
      return;
    }

    // Remove drag enter mode
    eventTarget.dragState = "none";

    const targetIsTreeItem = containerTargetTagName === TREE_ITEM_TAG_NAME;
    const dragEnterInformation = this.#getDropTypeAndTreeItemTarget(
      eventTarget,
      targetIsTreeItem
    );
    const treeItemTarget = dragEnterInformation.treeItem;
    const dropType = dragEnterInformation.dropType;

    // The droppable zone must be checked, even if it was marked as not valid
    // @todo Try to drop an item with high delays in droppable zone checking
    if (this.#validDroppableZone(event, treeItemTarget, dropType) !== VALID) {
      return;
    }

    // TODO: Check dataTransfer format before parsing?
    const draggedItems: GxDataTransferInfo[] = JSON.parse(
      event.dataTransfer.getData(TEXT_FORMAT)
    );

    this.itemsDropped.emit({
      newContainer: {
        id: treeItemTarget.id,
        metadata: treeItemTarget.metadata
      },
      draggingSelectedItems: this.#draggingSelectedItems,
      draggedItems: draggedItems,
      dropInTheSameTree: this.draggingInTree,
      dropType: dropType
    });
  }

  @Listen("itemDragStart")
  onItemDragStart(event: ChTreeViewItemCustomEvent<TreeViewItemDragStartInfo>) {
    // Avoid bubbling as this event can listened in other components (e.g. ch-flexible-layout)
    event.stopPropagation();

    document.addEventListener("dragover", this.#trackItemDrag, {
      capture: true
    });

    this.#currentDraggedItem = event.target;
    const allItemsCanBeDragged = this.#checkDragValidityAndUpdateDragInfo(
      event.detail
    );

    if (!allItemsCanBeDragged) {
      // This effect disables drop interactions in all page elements, so there
      // is no need to capture and prevent the drop event in the window
      event.detail.dragEvent.dataTransfer.effectAllowed = "none";
      return;
    }

    this.draggingInTree = true;

    if (this.scrollToEdgeOnDrag) {
      this.#fixScrollPositionOnDrag();
    }
  }

  @Listen("itemDragEnd")
  onItemDragEnd() {
    this.draggingInTree = false;

    document.removeEventListener("dragover", this.#trackItemDrag, {
      capture: true
    });

    // Reset not allowed droppable ids
    this.#resetVariables();
  }

  @Listen("selectedItemChange")
  onSelectedItemChange(event: ChTreeViewItemCustomEvent<TreeViewItemSelected>) {
    event.stopPropagation();
    const selectedItemInfo = event.detail;
    const selectedItemsInfo = this.selectedItemsCallback();

    // If the Control key was not pressed or multi selection is disabled,
    // remove all selected items
    if (!selectedItemInfo.ctrlKeyPressed || !this.multiSelection) {
      // Clear selected items
      selectedItemsInfo.clear();
    }

    // If the item is selected, add it to list
    if (selectedItemInfo.selected) {
      selectedItemsInfo.set(selectedItemInfo.id, selectedItemInfo);
    } else {
      selectedItemsInfo.delete(selectedItemInfo.id);
    }

    // Sync with UI model
    this.selectedItemsChange.emit(selectedItemsInfo);
  }

  /**
   * Given an item id, it scrolls into the item's view.
   */
  @Method()
  async scrollIntoVisible(treeItemId: string) {
    readTask(() => {
      const itemRef = this.el.querySelector(ITEM_SELECTOR(treeItemId));
      if (!itemRef) {
        return;
      }

      writeTask(() => {
        itemRef.scrollIntoView();
      });
    });
  }

  /**
   * Update the information about the valid droppable zones.
   * @param requestTimestamp Time where the request to the server was made. Useful to avoid having old information.
   * @param newContainerId ID of the container where the drag is trying to be made.
   * @param draggedItems Information about the dragged items.
   * @param validDrop Current state of the droppable zone.
   */
  @Method()
  async updateValidDropZone(
    requestTimestamp: number,
    newContainerId: string,
    draggedItems: GxDataTransferInfo[],
    dropType: TreeViewDropType,
    validDrop: boolean
  ) {
    if (
      !this.draggingInTheDocument ||
      requestTimestamp <= this.#dragStartTimestamp
    ) {
      return;
    }

    const droppableZoneKey = getDroppableZoneKey(
      newContainerId,
      draggedItems,
      dropType
    );
    this.#validDroppableZoneCache.set(
      droppableZoneKey,
      validDrop ? VALID : INVALID
    );

    // Don't show droppable zones if the dragEnter is invalid or the last
    // dragover was not performed in the same node that this method validates
    if (!validDrop || !this.#lastOpenSubTreeItem) {
      return;
    }

    const treeItemId = isTreeDrop(this.#lastOpenSubTreeItem)
      ? (this.#lastOpenSubTreeItem as HTMLChTreeViewDropElement).treeItemId
      : this.#lastOpenSubTreeItem.id;

    const shouldUpdateDragEnterInCurrentContainer =
      treeItemId === newContainerId;

    if (shouldUpdateDragEnterInCurrentContainer) {
      this.#lastOpenSubTreeItem.dragState = "enter";
    }
  }

  #getTreeViewItemRef = itemId =>
    this.el.querySelector(ITEM_SELECTOR(itemId)) as HTMLChTreeViewItemElement;

  #validDroppableZone = (
    event: DragEvent,
    treeItemTarget: HTMLChTreeViewItemElement,
    dropType: TreeViewDropType
  ): TreeViewDroppableZoneState => {
    const cacheKey = getDroppableZoneKey(
      treeItemTarget.id,
      this.#draggedItems,
      dropType
    );
    let droppableZoneState = this.#validDroppableZoneCache.get(cacheKey);

    // Invalidate the cache, because the item is no longer waiting for its
    // content to be downloaded
    if (
      droppableZoneState === TEMPORAL_INVALID &&
      !treeItemTarget.lazyLoad &&
      !treeItemTarget.downloading
    ) {
      droppableZoneState = null;
    }

    // If there is a cached value, return the cached value
    if (droppableZoneState != null) {
      return droppableZoneState;
    }

    // Do not show drop zones if:
    //   - The effect does not allow it.
    //   - The drop is disabled in the container target when dragging "above".
    //   - When dragging in the same tree, don't mark droppable zones if they are
    //     the dragged items or their direct parents.
    //
    // There is no need to check the following case, because the tree drop is
    // not even rendered:
    //   - When dragging "before" and "after" an item and the direct parent
    //     has drops disabled.
    if (
      event.dataTransfer.effectAllowed === "none" ||
      (dropType === "above" && treeItemTarget.dropDisabled) ||
      (this.draggingInTree &&
        (this.#draggedIds.includes(treeItemTarget.id) ||
          this.#draggedParentIds.includes(treeItemTarget.id)))
    ) {
      this.#validDroppableZoneCache.set(cacheKey, INVALID);
      return INVALID;
    }

    // Disable "above" drops when items need to lazy load their content first
    if (
      dropType === "above" &&
      (treeItemTarget.lazyLoad || treeItemTarget.downloading)
    ) {
      this.#validDroppableZoneCache.set(cacheKey, TEMPORAL_INVALID);
      return TEMPORAL_INVALID;
    }

    // Otherwise, emit the event to check the droppable zone
    this.#validDroppableZoneCache.set(cacheKey, CHECKING);
    this.droppableZoneEnter.emit({
      newContainer: {
        id: treeItemTarget.id,
        metadata: treeItemTarget.metadata
      },
      draggedItems: this.#draggedItems,
      dropType: dropType
    });
    return CHECKING;
  };

  #openSubTreeAfterCountdown = (currentTarget: HTMLChTreeViewItemElement) => {
    if (currentTarget.leaf || currentTarget.expanded) {
      return;
    }

    this.#openSubTreeTimeout = setTimeout(() => {
      currentTarget.expanded = true;
      this.expandedItemChange.emit({ id: currentTarget.id, expanded: true });
    }, this.openSubTreeCountdown);
  };

  #trackItemDrag = (event: DragEvent) => {
    const draggingInATree =
      (event.target as HTMLElement).closest(TREE_TAG_NAME) !== null;

    // The Tree View must be the only element that processes the "dragover"
    // event. Any other handler that processes this event can modify the
    // `dropEffect` an thus break the drag and drop implementation
    if (draggingInATree) {
      event.stopImmediatePropagation();
    }

    event.preventDefault();
    this.#lastDragEvent = event;

    this.#updateDropEffect(event);

    if (!this.#needForRAF) {
      return;
    }
    this.#needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.#needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      this.el.style.setProperty(
        POSITION_X_DRAG_CUSTOM_VAR,
        `${this.#lastDragEvent.clientX}px`
      );
      this.el.style.setProperty(
        POSITION_Y_DRAG_CUSTOM_VAR,
        `${this.#lastDragEvent.clientY}px`
      );
    });
  };

  #updateDropEffect = (event: DragEvent) => {
    // Drag over was performed outside of the Tree View
    if (!event.composedPath().includes(this.el)) {
      return;
    }

    // We have to used composePath to find if an item is a target in the
    // dragover event
    const itemTarget = event.composedPath().find((element: HTMLElement) => {
      if (!element.tagName) {
        return false;
      }

      return (
        isTreeItemOrTreeDrop(element.tagName.toLowerCase()) &&
        element.closest(TREE_TAG_NAME) === this.el
      );
    }) as HTMLChTreeViewItemElement | HTMLChTreeViewDropElement;

    const targetIsTreeItem =
      itemTarget.tagName.toLowerCase() === TREE_ITEM_TAG_NAME;
    const dragEnterInformation = this.#getDropTypeAndTreeItemTarget(
      itemTarget,
      targetIsTreeItem
    );
    const treeItemTarget = dragEnterInformation.treeItem;
    const dropType = dragEnterInformation.dropType;

    const droppableZoneState = this.#validDroppableZone(
      event,
      treeItemTarget,
      dropType
    );

    if (
      droppableZoneState === INVALID ||
      droppableZoneState === TEMPORAL_INVALID
    ) {
      event.dataTransfer.dropEffect = "none";
    }
  };

  #resetVariables = () => {
    this.#draggedIds = [];
    this.#draggedParentIds = [];
  };

  /**
   * First, it check if all items can be dragged. If so, it updates the
   * dataTransfer in the drag event to store the ids and metadata of the
   * dragged items. Also it updates the visual information of the dragged
   * items.
   * @returns If all selected items can be dragged.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #checkDragValidityAndUpdateDragInfo = (
    dragInfo: TreeViewItemDragStartInfo
  ): boolean => {
    const draggedElement = dragInfo.elem;

    const selectedItemsInfo = this.selectedItemsCallback();
    const isDraggingSelectedItems = selectedItemsInfo.has(draggedElement.id);
    this.#draggingSelectedItems = isDraggingSelectedItems;

    let dataTransferInfo: GxDataTransferInfo[] = [];
    let dragIsEnabledForAllItems: boolean;

    if (isDraggingSelectedItems) {
      const selectedItemKeys = [...selectedItemsInfo.keys()];
      const selectedItemValues = [...selectedItemsInfo.values()];
      const selectedItemCount = selectedItemKeys.length;

      dragIsEnabledForAllItems = selectedItemValues.every(
        el => !this.#getTreeViewItemRef(el.id).dragDisabled
      );

      this.#draggedIds = selectedItemKeys;
      dataTransferInfo = selectedItemValues.map(el => ({
        id: el.id,
        metadata: el.metadata
      }));

      this.#dragInfo =
        selectedItemCount === 1
          ? draggedElement.caption
          : selectedItemCount.toString();
    } else {
      dragIsEnabledForAllItems = !draggedElement.dragDisabled;
      dataTransferInfo = [
        { id: draggedElement.id, metadata: draggedElement.metadata }
      ];
      this.#draggedIds = [draggedElement.id];
      this.#dragInfo = draggedElement.caption;
    }

    this.#getDirectParentsOfDraggableItems(isDraggingSelectedItems);

    // Update drag event info
    const data = JSON.stringify(dataTransferInfo);
    dragInfo.dragEvent.dataTransfer.setData(TEXT_FORMAT, data);

    // We must keep the data binding and processing even if there is an item
    // that can't be dragged, otherwise, other trees or element might behave
    // unexpected when a dragstart event comes
    return dragIsEnabledForAllItems;
  };

  #fixScrollPositionOnDrag = () => {
    if (!this.draggingInTree || !this.#lastDragEvent) {
      return;
    }

    requestAnimationFrame(() => {
      scrollToEdge(this.#lastDragEvent, this.el, 10, 30);

      requestAnimationFrame(this.#fixScrollPositionOnDrag);
    });
  };

  #getDirectParentsOfDraggableItems = (draggingSelectedItems: boolean) => {
    if (!draggingSelectedItems) {
      const parentTreeItemElem = this.#currentDraggedItem.parentElement;

      if (parentTreeItemElem.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
        this.#draggedParentIds.push(parentTreeItemElem.id);
      }

      return;
    }

    // Dragging selected items
    const selectedItemsInfo = this.selectedItemsCallback();
    selectedItemsInfo.forEach(selectedItem => {
      const parentId = selectedItem.parentId;

      // parentId === "" when the item is in the first level of the tree
      if (parentId !== "") {
        this.#draggedParentIds.push(parentId);
      }
    });
  };

  connectedCallback() {
    this.#treeViewId = `ch-tree-view-id-${autoId++}`;

    subscribeToRTLChanges(this.#treeViewId, (rtl: boolean) => {
      this.rtlDirection = rtl;
    });

    // Initialize rtlDirection value
    this.rtlDirection = isRTL();
  }

  disconnectedCallback() {
    unsubscribeToRTLChanges(this.#treeViewId);

    this.#resetVariables();

    // Remove dragover body event
    this.onItemDragEnd();
  }

  render() {
    return (
      <Host
        class={{
          "dragging-item": this.draggingInTheDocument,
          "not-dragging-item": !this.draggingInTheDocument, // WA for some bugs in GeneXus' DSO
          "dragging-selected-items":
            this.draggingInTree && this.#draggingSelectedItems,
          "rtl-direction": this.rtlDirection,
          "waiting-drop-processing": this.waitDropProcessing
        }}
        exportparts={TREE_VIEW_PARTS_DICTIONARY.DRAG_PREVIEW}
      >
        <slot />

        {this.draggingInTree && (
          <span
            aria-hidden="true"
            class="drag-info"
            part={TREE_VIEW_PARTS_DICTIONARY.DRAG_PREVIEW}
          >
            {this.#dragInfo}
          </span>
        )}
      </Host>
    );
  }
}

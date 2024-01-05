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
  h
} from "@stencil/core";

import {
  TreeViewDataTransferInfo,
  TreeViewDropCheckInfo,
  TreeViewDroppableZoneState,
  TreeViewItemContextMenu,
  // CheckedTreeItemInfo,
  // ExpandedTreeItemInfo,
  TreeViewItemDragStartInfo,
  TreeViewItemExpandedInfo,
  TreeViewItemSelectedInfo
} from "./types";
import { focusComposedPath, mouseEventModifierKey } from "../../common/helpers";
import { scrollToEdge } from "../../../common/scroll-to-edge";
import { GxDataTransferInfo } from "../../../common/types";
import { ChTreeViewItemCustomEvent } from "../../../components";

const TREE_ITEM_TAG_NAME = "ch-tree-view-item";
const TREE_TAG_NAME = "ch-tree-view";

// Selectors
// const CHECKED_ITEMS = `${TREE_ITEM_TAG_NAME}[checked]`;

const TEXT_FORMAT = "text/plain";

const ARROW_DOWN_KEY = "ArrowDown";
const ARROW_UP_KEY = "ArrowUp";
const EDIT_KEY = "F2";

type KeyEvents = typeof ARROW_DOWN_KEY | typeof ARROW_UP_KEY | typeof EDIT_KEY;

const isTreeItem = (element: HTMLElement) =>
  element.tagName.toLowerCase() === TREE_ITEM_TAG_NAME;

const getFocusedTreeItem = (): HTMLChTreeViewItemElement | undefined =>
  focusComposedPath().find(isTreeItem) as HTMLChTreeViewItemElement;

const canMoveTreeItemFocus = (treeItem: HTMLChTreeViewItemElement): boolean =>
  treeItem && !treeItem.editing;

const getDroppableZoneKey = (
  newContainerId: string,
  draggedItems: GxDataTransferInfo[]
) =>
  `"newContainerId":"${newContainerId}","metadata":"${JSON.stringify(
    draggedItems
  )}"`;

const POSITION_X_DRAG_CUSTOM_VAR = "--ch-tree-view-dragging-item-x";
const POSITION_Y_DRAG_CUSTOM_VAR = "--ch-tree-view-dragging-item-y";

@Component({
  tag: "ch-tree-view",
  styleUrl: "tree-view.scss",
  shadow: false
})
export class ChTreeView {
  // @todo TODO: Check if key codes works in Safari
  private keyDownEvents: {
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

  private draggingSelectedItems = false;
  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  private lastDragEvent: MouseEvent;

  private openSubTreeTimeout: NodeJS.Timeout;

  private selectedItemsInfo: Map<string, TreeViewItemSelectedInfo> = new Map();

  /**
   * Cache to avoid duplicate requests when checking the droppable zone in the
   * same drag event.
   */
  private validDroppableZoneCache: Map<string, TreeViewDroppableZoneState> =
    new Map();
  private dragStartTimestamp: number; // Useful to avoid race conditions where the server response is slow
  private draggedItems: GxDataTransferInfo[];

  // Refs
  private currentDraggedItem: HTMLChTreeViewItemElement;
  private lastOpenSubTreeItem: HTMLChTreeViewItemElement;

  /**
   * Text displayed when dragging an item.
   */
  private dragInfo: string;
  private draggedIds: string[] = [];
  private draggedParentIds: string[] = [];

  @Element() el: HTMLChTreeViewElement;

  @State() draggingInTheDocument = false;

  @State() draggingInTree = false;

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

  // /**
  //  * Returns an array of the selected tree items, providing the id, caption and
  //  * selected status.
  //  */
  // @Method()
  // async getCheckedItems(): Promise<CheckedTreeItemInfo[]> {
  //   const checkedItems = Array.from(
  //     this.el.querySelectorAll(CHECKED_ITEMS)
  //   ) as HTMLChTreeViewItemElement[];

  //   return checkedItems.map(item => ({
  //     id: item.id,
  //     caption: item.caption,
  //     selected: item.selected
  //   }));
  // }

  @Listen("contextmenu", { capture: true })
  handleContextMenuEvent(event: PointerEvent) {
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
  handleKeyDownEvents(event: KeyboardEvent) {
    const keyHandler = this.keyDownEvents[event.key];

    if (keyHandler) {
      keyHandler(event);
    }
  }

  // We can't use capture, because the dataTransfer info would not be defined
  // Also, we cant use capture and setTimeout with 0 seconds, because the
  // getData method can only be accessed during the dragstart and drop event
  @Listen("dragstart", { passive: true, target: "window" })
  handleDragStart(event: DragEvent) {
    // Reset the validity of the droppable zones with each new drag start
    this.validDroppableZoneCache.clear();

    // If there is no data, the dragstart does not achieve the interface required
    const data = event.dataTransfer.getData(TEXT_FORMAT);
    if (data === "") {
      return;
    }

    try {
      // Try to parse the data
      const paredData = JSON.parse(data);

      this.draggedItems = paredData;
      this.draggingInTheDocument = true;
      this.dragStartTimestamp = new Date().getTime();
    } catch {
      // Empty
    }
  }

  @Listen("dragend", { capture: true, passive: true, target: "window" })
  handleDragEnd() {
    this.draggingInTheDocument = false;
  }

  @Listen("dragenter", { capture: true, passive: true })
  handleDragEnter(event: DragEvent) {
    this.cancelSubTreeOpening(null, true);
    event.stopPropagation();
    const containerTarget = event.target as HTMLChTreeViewItemElement;

    // Check if it is a valid item
    if (containerTarget.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME) {
      return;
    }

    this.lastOpenSubTreeItem = containerTarget;
    this.openSubTreeAfterCountdown(containerTarget);

    if (this.validDroppableZone(event) === "valid") {
      containerTarget.dragState = "enter";
    }
  }

  @Listen("dragleave", { capture: true, passive: true })
  handleDragLeave(event: DragEvent) {
    const currentTarget = event.target as HTMLElement;

    if (currentTarget.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME) {
      return;
    }

    const treeItem = currentTarget as HTMLChTreeViewItemElement;
    treeItem.dragState = "none";
    this.cancelSubTreeOpening(treeItem);
  }

  private cancelSubTreeOpening(
    treeItem: HTMLChTreeViewItemElement,
    forceClear = false
  ) {
    if (this.lastOpenSubTreeItem === treeItem || forceClear) {
      clearTimeout(this.openSubTreeTimeout);
      this.lastOpenSubTreeItem = null;
    }
  }

  @Listen("drop")
  handleItemDrop(event: DragEvent) {
    event.stopPropagation();

    this.cancelSubTreeOpening(null, true);
    const newContainer = event.target as HTMLChTreeViewItemElement;

    const draggedItems: GxDataTransferInfo[] = JSON.parse(
      event.dataTransfer.getData(TEXT_FORMAT)
    );

    // The droppable zone must be checked, even if it was marked as not valid
    // @todo Try to drop an item with high delays in droppable zone checking
    if (this.validDroppableZone(event) !== "valid") {
      return;
    }

    this.itemsDropped.emit({
      newContainer: { id: newContainer.id, metadata: newContainer.metadata },
      draggingSelectedItems: this.draggingSelectedItems,
      draggedItems: draggedItems,
      dropInTheSameTree: this.draggingInTree
    });
  }

  @Listen("itemDragStart")
  handleItemDragStart(
    event: ChTreeViewItemCustomEvent<TreeViewItemDragStartInfo>
  ) {
    document.body.addEventListener("dragover", this.trackItemDrag, {
      capture: true
    });

    this.currentDraggedItem = event.target;
    const allItemsCanBeDragged = this.checkDragValidityAndUpdateDragInfo(
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
      this.fixScrollPositionOnDrag();
    }
  }

  @Listen("itemDragEnd")
  handleItemDragEnd() {
    this.draggingInTree = false;

    document.body.removeEventListener("dragover", this.trackItemDrag, {
      capture: true
    });

    // Reset not allowed droppable ids
    this.resetVariables();
  }

  @Listen("selectedItemChange")
  handleSelectedItemChange(
    event: ChTreeViewItemCustomEvent<TreeViewItemSelectedInfo>
  ) {
    event.stopPropagation();
    const selectedItemInfo = event.detail;

    this.handleItemSelection(selectedItemInfo);
  }

  /**
   * Clear all information about the selected items. This method is intended to
   * be used when selected items are reordered and the selected references will
   * no longer be useful.
   */
  @Method()
  async clearSelectedItemsInfo() {
    this.clearSelectedItems();
  }

  /**
   * Given an item id, it displays and scrolls into the item view.
   */
  @Method()
  async scrollIntoVisible(treeItemId: string) {
    const itemRef = this.el.querySelector(
      `${TREE_ITEM_TAG_NAME}[id="${treeItemId}"]`
    );
    if (!itemRef) {
      return;
    }

    let parentItem = itemRef.parentElement;

    // Expand all parents
    while (parentItem.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
      (parentItem as HTMLChTreeViewItemElement).expanded = true;
      parentItem = parentItem.parentElement;
    }

    // Wait until the parents are expanded
    requestAnimationFrame(() => {
      itemRef.scrollIntoView();
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
    validDrop: boolean
  ) {
    if (
      !this.draggingInTheDocument ||
      requestTimestamp <= this.dragStartTimestamp
    ) {
      return;
    }

    const droppableZoneKey = getDroppableZoneKey(newContainerId, draggedItems);
    this.validDroppableZoneCache.set(
      droppableZoneKey,
      validDrop ? "valid" : "invalid"
    );

    const shouldUpdateDragEnterInCurrentContainer =
      this.lastOpenSubTreeItem?.id === newContainerId;

    if (shouldUpdateDragEnterInCurrentContainer) {
      this.lastOpenSubTreeItem.dragState = "enter";
    }
  }

  private validDroppableZone(event: DragEvent): TreeViewDroppableZoneState {
    const containerTarget = event.target as HTMLChTreeViewItemElement;

    const cacheKey = getDroppableZoneKey(containerTarget.id, this.draggedItems);
    let droppableZoneState = this.validDroppableZoneCache.get(cacheKey);

    // Invalidate the cache, because the item is no longer waiting for its content to be downloaded
    if (
      droppableZoneState === "temporal-invalid" &&
      !containerTarget.lazyLoad &&
      !containerTarget.downloading
    ) {
      droppableZoneState = null;
    }

    if (droppableZoneState != null) {
      return droppableZoneState;
    }

    // Do not show drop zones if:
    //   - The effect does not allow it.
    //   - The drop is disabled in the container target.
    //   - When dragging in the same tree, don't mark droppable zones if they are
    //     the dragged items or their direct parents.
    if (
      event.dataTransfer.effectAllowed === "none" ||
      containerTarget.dropDisabled ||
      (this.draggingInTree &&
        (this.draggedIds.includes(containerTarget.id) ||
          this.draggedParentIds.includes(containerTarget.id)))
    ) {
      this.validDroppableZoneCache.set(cacheKey, "invalid");
      return "invalid";
    }

    // Disable drops when items need to lazy load their content first
    if (containerTarget.lazyLoad || containerTarget.downloading) {
      this.validDroppableZoneCache.set(cacheKey, "temporal-invalid");
      return "temporal-invalid";
    }

    this.validDroppableZoneCache.set(cacheKey, "checking");
    this.droppableZoneEnter.emit({
      newContainer: {
        id: containerTarget.id,
        metadata: containerTarget.metadata
      },
      draggedItems: this.draggedItems
    });
    return "checking";
  }

  private openSubTreeAfterCountdown(currentTarget: HTMLChTreeViewItemElement) {
    if (currentTarget.leaf || currentTarget.expanded) {
      return;
    }

    this.openSubTreeTimeout = setTimeout(() => {
      currentTarget.expanded = true;
      this.expandedItemChange.emit({ id: currentTarget.id, expanded: true });
    }, this.openSubTreeCountdown);
  }

  private trackItemDrag = (event: DragEvent) => {
    const draggingInATree =
      (event.target as HTMLElement).closest(TREE_TAG_NAME) !== null;

    // The Tree View must be the only element that processes the "dragover"
    // event. Any other handler that processes this event can modify the
    // `dropEffect` an thus break the drag and drop implementation
    if (draggingInATree) {
      event.stopImmediatePropagation();
    }

    event.preventDefault();
    this.lastDragEvent = event;

    this.updateDropEffect(event);

    if (!this.needForRAF) {
      return;
    }
    this.needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      this.el.style.setProperty(
        POSITION_X_DRAG_CUSTOM_VAR,
        `${this.lastDragEvent.clientX}px`
      );
      this.el.style.setProperty(
        POSITION_Y_DRAG_CUSTOM_VAR,
        `${this.lastDragEvent.clientY}px`
      );
    });
  };

  private updateDropEffect(event: DragEvent) {
    const itemTarget = event.target as HTMLElement;

    // Check if it is a valid item
    if (
      itemTarget.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME ||
      itemTarget.closest(TREE_TAG_NAME) !== this.el
    ) {
      return;
    }
    const droppableZoneState = this.validDroppableZone(event);

    if (
      droppableZoneState === "invalid" ||
      droppableZoneState === "temporal-invalid"
    ) {
      event.dataTransfer.dropEffect = "none";
    }
  }

  private resetVariables() {
    this.draggedIds = [];
    this.draggedParentIds = [];
  }

  /**
   * First, it check if all items can be dragged. If so, it updates the
   * dataTransfer in the drag event to store the ids and metadata of the
   * dragged items. Also it updates the visual information of the dragged
   * items.
   * @returns If all selected items can be dragged.
   */
  private checkDragValidityAndUpdateDragInfo(
    dragInfo: TreeViewItemDragStartInfo
  ): boolean {
    const draggedElement = dragInfo.elem;

    const isDraggingSelectedItems = this.selectedItemsInfo.has(
      draggedElement.id
    );
    this.draggingSelectedItems = isDraggingSelectedItems;

    let dataTransferInfo: GxDataTransferInfo[] = [];
    let dragIsEnabledForAllItems: boolean;

    if (isDraggingSelectedItems) {
      const selectedItemKeys = [...this.selectedItemsInfo.keys()];
      const selectedItemValues = [...this.selectedItemsInfo.values()];
      const selectedItemCount = selectedItemKeys.length;

      dragIsEnabledForAllItems = selectedItemValues.every(
        el => !el.itemRef.dragDisabled
      );

      this.draggedIds = selectedItemKeys;
      dataTransferInfo = selectedItemValues.map(el => ({
        id: el.id,
        metadata: el.metadata
      }));

      this.dragInfo =
        selectedItemCount === 1
          ? draggedElement.caption
          : selectedItemCount.toString();
    } else {
      dragIsEnabledForAllItems = !draggedElement.dragDisabled;
      dataTransferInfo = [
        { id: draggedElement.id, metadata: draggedElement.metadata }
      ];
      this.draggedIds = [draggedElement.id];
      this.dragInfo = draggedElement.caption;
    }

    this.getDirectParentsOfDraggableItems(isDraggingSelectedItems);

    // Update drag event info
    const data = JSON.stringify(dataTransferInfo);
    dragInfo.dragEvent.dataTransfer.setData(TEXT_FORMAT, data);

    // We must keep the data binding and processing even if there is an item
    // that can't be dragged, otherwise, other trees or element might behave
    // unexpected when a dragstart event comes
    return dragIsEnabledForAllItems;
  }

  private fixScrollPositionOnDrag = () => {
    if (!this.draggingInTree || !this.lastDragEvent) {
      return;
    }

    requestAnimationFrame(() => {
      scrollToEdge(this.lastDragEvent, this.el, 10, 30);

      requestAnimationFrame(this.fixScrollPositionOnDrag);
    });
  };

  private getDirectParentsOfDraggableItems(draggingSelectedItems: boolean) {
    if (!draggingSelectedItems) {
      const parentTreeItemElem = this.currentDraggedItem.parentElement;

      if (parentTreeItemElem.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
        this.draggedParentIds.push(parentTreeItemElem.id);
      }

      return;
    }

    // Dragging selected items
    this.selectedItemsInfo.forEach(selectedItem => {
      const parentId = selectedItem.parentId;

      // parentId === "" when the item is in the first level of the tree
      if (parentId !== "") {
        this.draggedParentIds.push(parentId);
      }
    });
  }

  private handleItemSelection(selectedItemInfo: TreeViewItemSelectedInfo) {
    // If the Control key was not pressed or multi selection is disabled,
    // remove all selected items
    if (!selectedItemInfo.ctrlKeyPressed || !this.multiSelection) {
      // Deselect all items except the item that emitted the event
      this.selectedItemsInfo.forEach(treeItem => {
        if (treeItem.id !== selectedItemInfo.id) {
          treeItem.itemRef.selected = false;
        }
      });

      this.clearSelectedItems();
    }

    // If the item is selected, add it to list
    if (selectedItemInfo.selected) {
      this.selectedItemsInfo.set(selectedItemInfo.id, selectedItemInfo);
    } else {
      this.selectedItemsInfo.delete(selectedItemInfo.id);
    }

    // Sync with UI model
    this.selectedItemsChange.emit(this.selectedItemsInfo);
  }

  private clearSelectedItems() {
    this.selectedItemsInfo.clear();
  }

  disconnectedCallback() {
    this.resetVariables();

    // Remove dragover body event
    this.handleItemDragEnd();
  }

  render() {
    return (
      <Host
        class={{
          "ch-tree-view-dragging-item": this.draggingInTheDocument,
          "ch-tree-view-not-dragging-item": !this.draggingInTheDocument, // WA for some bugs in GeneXus' DSO
          "ch-tree-view--dragging-selected-items":
            this.draggingInTree && this.draggingSelectedItems,
          "ch-tree-view-waiting-drop-processing": this.waitDropProcessing
        }}
      >
        <div
          role="tree"
          part="tree-x-container"
          aria-multiselectable={this.multiSelection.toString()}
          class="ch-tree-view-container"
        >
          <slot />
        </div>

        {this.draggingInTree && (
          <span aria-hidden="true" class="ch-tree-view-drag-info">
            {this.dragInfo}
          </span>
        )}
      </Host>
    );
  }
}

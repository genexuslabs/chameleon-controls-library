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
  TreeXDataTransferInfo,
  TreeXDroppableZoneState,
  // CheckedTreeItemInfo,
  // ExpandedTreeItemInfo,
  TreeXItemDragStartInfo,
  TreeXListItemExpandedInfo,
  TreeXListItemSelectedInfo
} from "./types";
import { mouseEventModifierKey } from "../common/helpers";
import { scrollToEdge } from "../../common/scroll-to-edge";
import { GxDataTransferInfo } from "../../common/types";
import { ChTreeXListItemCustomEvent } from "../../components";

const TREE_ITEM_TAG_NAME = "ch-tree-x-list-item";
const TREE_TAG_NAME = "ch-tree-x";

// Selectors
// const CHECKED_ITEMS = `${TREE_ITEM_TAG_NAME}[checked]`;

const TEXT_FORMAT = "text/plain";

const ARROW_DOWN_KEY = "ArrowDown";
const ARROW_UP_KEY = "ArrowUp";
const EDIT_KEY = "F2";

type KeyEvents = typeof ARROW_DOWN_KEY | typeof ARROW_UP_KEY | typeof EDIT_KEY;

const isExecutedInTree = (event: KeyboardEvent, el: HTMLChTreeXElement) =>
  event.composedPath().includes(el);

const treeItemIsInEditMode = () =>
  (document.activeElement as HTMLChTreeXListItemElement).editing;

const getDroppableZoneKey = (
  newContainerId: string,
  draggedItems: GxDataTransferInfo[]
) =>
  `"newContainerId":"${newContainerId}","metadata":"${JSON.stringify(
    draggedItems
  )}"`;

const POSITION_X_DRAG_CUSTOM_VAR = "--ch-tree-x-dragging-item-x";
const POSITION_Y_DRAG_CUSTOM_VAR = "--ch-tree-x-dragging-item-y";

@Component({
  tag: "ch-tree-x",
  styleUrl: "tree-x.scss",
  shadow: false
})
export class ChTreeX {
  // @todo TODO: Check if key codes works in Safari
  private keyDownEvents: {
    [key in KeyEvents]: (event: KeyboardEvent) => void;
  } = {
    [ARROW_DOWN_KEY]: event => {
      if (!isExecutedInTree(event, this.el) || treeItemIsInEditMode()) {
        return;
      }
      event.preventDefault();

      const treeItem = document.activeElement as HTMLChTreeXListItemElement;
      treeItem.focusNextItem(mouseEventModifierKey(event));
    },

    [ARROW_UP_KEY]: event => {
      if (!isExecutedInTree(event, this.el) || treeItemIsInEditMode()) {
        return;
      }
      event.preventDefault();

      const treeItem = document.activeElement as HTMLChTreeXListItemElement;
      treeItem.focusPreviousItem(mouseEventModifierKey(event));
    },

    [EDIT_KEY]: event => {
      if (document.activeElement.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME) {
        return;
      }

      event.preventDefault();
      (document.activeElement as HTMLChTreeXListItemElement).editing = true;
    }
  };

  private draggingSelectedItems = false;
  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  private lastDragEvent: MouseEvent;

  private openSubTreeTimeout: NodeJS.Timeout;

  private selectedItemsInfo: Map<string, TreeXListItemSelectedInfo> = new Map();

  /**
   * Cache to avoid duplicate requests when checking the droppable zone in the
   * same drag event.
   */
  private validDroppableZoneCache: Map<string, TreeXDroppableZoneState> =
    new Map();
  private dragStartTimestamp: number; // Useful to avoid race conditions where the server response is slow
  private draggedItems: GxDataTransferInfo[];

  // Refs
  private currentDraggedItem: HTMLChTreeXListItemElement;
  private lastOpenSubTreeItem: HTMLChTreeXListItemElement;

  /**
   * Text displayed when dragging an item.
   */
  private dragInfo: string;
  private draggedIds: string[] = [];
  private draggedParentIds: string[] = [];

  @Element() el: HTMLChTreeXElement;

  @State() draggingInTheDocument = false;

  @State() draggingInTree = false;

  /**
   * Level in the tree at which the control is placed.
   */
  @Prop() readonly level: number = -1;

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
  @Event() droppableZoneEnter: EventEmitter<TreeXDataTransferInfo>;

  /**
   * Fired when an item is expanded or collapsed.
   */
  @Event() expandedItemChange: EventEmitter<TreeXListItemExpandedInfo>;

  /**
   * Fired when the selected items change.
   */
  @Event() selectedItemsChange: EventEmitter<
    Map<string, TreeXListItemSelectedInfo>
  >;

  /**
   * Fired when the dragged items are dropped in another item of the tree.
   */
  @Event() itemsDropped: EventEmitter<TreeXDataTransferInfo>;

  /**
   * Given an item id, it displays and scrolls into the item view.
   */
  @Method()
  async scrollIntoVisible(treeItemId: string) {
    const itemRef = this.el.querySelector(
      `${TREE_ITEM_TAG_NAME}#${treeItemId}`
    );
    if (!itemRef) {
      return;
    }

    let parentItem = itemRef.parentElement.parentElement;

    // Expand all parents
    while (parentItem.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
      (parentItem as HTMLChTreeXListItemElement).expanded = true;
      parentItem = parentItem.parentElement.parentElement;
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
  async updateValidDroppableZone(
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
  // /**
  //  * Returns an array of the selected tree items, providing the id, caption and
  //  * selected status.
  //  */
  // @Method()
  // async getCheckedItems(): Promise<CheckedTreeItemInfo[]> {
  //   const checkedItems = Array.from(
  //     this.el.querySelectorAll(CHECKED_ITEMS)
  //   ) as HTMLChTreeXListItemElement[];

  //   return checkedItems.map(item => ({
  //     id: item.id,
  //     caption: item.caption,
  //     selected: item.selected
  //   }));
  // }

  // We can't use capture, because the dataTransfer info would not be defined
  // Also, we cant use capture and setTimeout with 0 seconds, because the
  // getData method can only be accessed during the dragstart and drop event
  @Listen("dragstart", { passive: true, target: "window" })
  handleDragStart(event: DragEvent) {
    // Reset the validity of the droppable zones with each new drag start
    this.validDroppableZoneCache.clear();

    this.draggingInTheDocument = true;
    this.dragStartTimestamp = new Date().getTime();
    this.draggedItems = JSON.parse(event.dataTransfer.getData(TEXT_FORMAT));
  }

  @Listen("dragend", { capture: true, passive: true, target: "window" })
  handleDragEnd() {
    this.draggingInTheDocument = false;
  }

  @Listen("dragenter", { capture: true, passive: true })
  handleDragEnter(event: DragEvent) {
    this.cancelSubTreeOpening(null, true);
    event.stopPropagation();
    const containerTarget = event.target as HTMLChTreeXListItemElement;

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

    const treeItem = currentTarget as HTMLChTreeXListItemElement;
    treeItem.dragState = "none";
    this.cancelSubTreeOpening(treeItem);
  }

  private cancelSubTreeOpening(
    treeItem: HTMLChTreeXListItemElement,
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
    const newContainer = event.target as HTMLChTreeXListItemElement;

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
      draggedItems: draggedItems,
      dropInTheSameTree: this.draggingInTree
    });
  }

  @Listen("itemDragStart")
  handleItemDragStart(
    event: ChTreeXListItemCustomEvent<TreeXItemDragStartInfo>
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
  handleSelectedItemChange(event: CustomEvent<TreeXListItemSelectedInfo>) {
    event.stopPropagation();
    const selectedItemInfo = event.detail;
    const selectedItemEl = event.target as HTMLChTreeXListItemElement;

    this.handleItemSelection(selectedItemEl, selectedItemInfo);
  }

  private validDroppableZone(event: DragEvent): TreeXDroppableZoneState {
    const containerTarget = event.target as HTMLChTreeXListItemElement;

    const cacheKey = getDroppableZoneKey(containerTarget.id, this.draggedItems);
    const droppableZoneState = this.validDroppableZoneCache.get(cacheKey);

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
      !containerTarget.dropEnabled ||
      (this.draggingInTree &&
        (this.draggedIds.includes(containerTarget.id) ||
          this.draggedParentIds.includes(containerTarget.id)))
    ) {
      this.validDroppableZoneCache.set(cacheKey, "invalid");
      return "invalid";
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

  private openSubTreeAfterCountdown(currentTarget: HTMLChTreeXListItemElement) {
    if (currentTarget.leaf || currentTarget.expanded) {
      return;
    }

    this.openSubTreeTimeout = setTimeout(() => {
      currentTarget.expanded = true;
      this.expandedItemChange.emit({ id: currentTarget.id, expanded: true });
    }, this.openSubTreeCountdown);
  }

  private trackItemDrag = (event: DragEvent) => {
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
        `${this.lastDragEvent.pageX}px`
      );
      this.el.style.setProperty(
        POSITION_Y_DRAG_CUSTOM_VAR,
        `${this.lastDragEvent.pageY}px`
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

    const cacheKey = getDroppableZoneKey(itemTarget.id, this.draggedItems);
    const droppableZoneState = this.validDroppableZoneCache.get(cacheKey);

    if (droppableZoneState === "invalid") {
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
    dragInfo: TreeXItemDragStartInfo
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
        el => el.itemRef.dragEnabled
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
      dragIsEnabledForAllItems = draggedElement.dragEnabled;
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
      const parentTreeItemElem =
        this.currentDraggedItem.parentElement.parentElement;

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

  private handleItemSelection(
    selectedItemEl: HTMLChTreeXListItemElement,
    selectedItemInfo: TreeXListItemSelectedInfo
  ) {
    // If the Control key was not pressed or multi selection is disabled,
    // remove all selected items
    if (!selectedItemInfo.ctrlKeyPressed || !this.multiSelection) {
      this.selectedItemsInfo.forEach(treeItem => {
        treeItem.itemRef.selected = false;
      });

      this.clearSelectedItems();

      // Re-select the item
      selectedItemEl.selected = selectedItemInfo.selected;
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

  private handleKeyDownEvents = (event: KeyboardEvent) => {
    const keyHandler = this.keyDownEvents[event.key];

    if (keyHandler) {
      keyHandler(event);
    }
  };

  connectedCallback() {
    // Set edit mode in items
    this.el.addEventListener("keydown", this.handleKeyDownEvents, {
      capture: true
    });
  }

  disconnectedCallback() {
    this.el.removeEventListener("keydown", this.handleKeyDownEvents);

    this.resetVariables();

    // Remove dragover body event
    this.handleItemDragEnd();
  }

  render() {
    return (
      <Host
        class={{
          "ch-tree-x-dragging-item": this.draggingInTheDocument,
          "ch-tree-x--dragging-selected-items":
            this.draggingInTree && this.draggingSelectedItems,
          "ch-tree-x-waiting-drop-processing": this.waitDropProcessing
        }}
      >
        <slot />

        {this.draggingInTree && (
          <span aria-hidden="true" class="ch-tree-x-drag-info">
            {this.dragInfo}
          </span>
        )}
      </Host>
    );
  }
}

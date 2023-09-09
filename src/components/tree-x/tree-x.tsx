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
  Watch,
  h
} from "@stencil/core";

import {
  // CheckedTreeItemInfo,
  // ExpandedTreeItemInfo,
  TreeXItemDragStartInfo,
  TreeXItemDropInfo,
  TreeXLines,
  TreeXListItemSelectedInfo
} from "./types";
import { mouseEventModifierKey } from "../common/helpers";

const TREE_ITEM_TAG_NAME = "ch-tree-x-list-item";
const TREE_LIST_TAG_NAME = "ch-tree-x-list";

// Selectors
const TREE_LIST_AND_ITEM_SELECTOR =
  TREE_LIST_TAG_NAME + "," + TREE_ITEM_TAG_NAME;
// const CHECKED_ITEMS = `${TREE_ITEM_TAG_NAME}[checked]`;

const ARROW_DOWN_KEY = "ArrowDown";
const ARROW_UP_KEY = "ArrowUp";
const EDIT_KEY = "F2";

type KeyEvents = typeof ARROW_DOWN_KEY | typeof ARROW_UP_KEY | typeof EDIT_KEY;

const isExecutedInTree = (event: KeyboardEvent, el: HTMLChTreeXElement) =>
  event.composedPath().includes(el);

const treeItemIsInEditMode = () =>
  (document.activeElement as HTMLChTreeXListItemElement).editing;

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

  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  private lastPageX = 0;
  private lastPageY = 0;

  private openSubTreeTimeout: NodeJS.Timeout;

  private selectedItemsInfo: Map<string, TreeXListItemSelectedInfo> = new Map();

  private currentDraggedItem: HTMLChTreeXListItemElement;
  private lastOpenSubTreeItem: HTMLChTreeXListItemElement;

  /**
   * Text displayed when dragging an item.
   */
  private dragInfo: string;
  private draggedIds: string[] = [];
  private draggedParentIds: string[] = [];

  @Element() el: HTMLChTreeXElement;

  @State() draggingItem = false;

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
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop() readonly showLines: TreeXLines = "none";
  @Watch("showLines")
  handleShowLinesChange(newShowLines: TreeXLines) {
    const treeItems = this.el.querySelectorAll(
      TREE_LIST_AND_ITEM_SELECTOR
    ) as NodeListOf<HTMLChTreeXListElement | HTMLChTreeXListItemElement>;

    treeItems.forEach(item => {
      item.showLines = newShowLines;
    });
  }

  /**
   * This property lets you specify if the tree is waiting to process the drop
   * of items.
   */
  @Prop() readonly waitDropProcessing: boolean = false;

  /**
   * Fired when the selected items change.
   */
  @Event() selectedItemsChange: EventEmitter<
    Map<string, TreeXListItemSelectedInfo>
  >;

  /**
   * Fired when the dragged items are dropped in another item of the tree.
   */
  @Event() itemsDropped: EventEmitter<TreeXItemDropInfo>;

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

  // /**
  //  * This method is used to toggle a tree item by the tree item id/ids.
  //  *
  //  * @param treeItemIds An array id the tree items to be toggled.
  //  * @param expand A boolean indicating that the tree item should be expanded or collapsed. (optional)
  //  * @returns The modified items after the method was called.
  //  */
  // @Method()
  // async toggleItems(
  //   treeItemIds: string[],
  //   expand?: boolean
  // ): Promise<ExpandedTreeItemInfo[]> {
  //   if (!treeItemIds) {
  //     return [];
  //   }

  //   const allTreeItems = Array.from(
  //     this.el.querySelectorAll(TREE_ITEM_TAG_NAME)
  //   );
  //   const modifiedTreeItems: ExpandedTreeItemInfo[] = [];

  //   treeItemIds.forEach(treeItemId => {
  //     const treeItem = allTreeItems.find(item => treeItemId === item.id);

  //     if (treeItem) {
  //       treeItem.expanded = expand ?? !treeItem.expanded;

  //       modifiedTreeItems.push({
  //         id: treeItem.id,
  //         expanded: treeItem.expanded
  //       });
  //     }
  //   });
  //   return modifiedTreeItems;
  // }

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

  @Listen("itemDragStart")
  handleItemDragStart(event: CustomEvent<TreeXItemDragStartInfo>) {
    document.body.addEventListener("dragover", this.trackItemDrag, {
      capture: true
    });

    this.currentDraggedItem = event.target as HTMLChTreeXListItemElement;
    this.updateDragInfo(event.detail);

    this.el.addEventListener("dragenter", this.trackItemDragEnter, {
      capture: true,
      passive: true
    });

    this.el.addEventListener("dragleave", this.trackItemDragLeave, {
      capture: true,
      passive: true
    });

    // Wait until the custom var values are updated to avoid flickering
    setTimeout(() => {
      this.draggingItem = true;
    }, 10);
  }

  @Listen("itemDragEnd")
  handleItemDragEnd() {
    this.draggingItem = false;

    document.body.removeEventListener("dragover", this.trackItemDrag, {
      capture: true
    });

    this.el.removeEventListener("dragenter", this.trackItemDragEnter, {
      capture: true
    });

    this.el.removeEventListener("dragleave", this.trackItemDragLeave, {
      capture: true
    });

    // Reset not allowed droppable ids
    this.resetVariables();
  }

  @Listen("itemDrop")
  handleItemDrop(event: CustomEvent<TreeXItemDropInfo>) {
    event.stopPropagation();

    this.cancelSubTreeOpening(null, true);
    const selectedItemEl = event.target as HTMLChTreeXListItemElement;

    if (!this.validDroppableZone(selectedItemEl.id)) {
      return;
    }
    this.itemsDropped.emit(event.detail);
  }

  @Listen("selectedItemChange")
  handleSelectedItemChange(event: CustomEvent<TreeXListItemSelectedInfo>) {
    event.stopPropagation();
    const selectedItemInfo = event.detail;
    const selectedItemEl = event.target as HTMLChTreeXListItemElement;

    this.handleItemSelection(selectedItemEl, selectedItemInfo);
  }

  private trackItemDragEnter = (event: DragEvent) => {
    event.stopPropagation();
    const currentTarget = event.target as HTMLElement;

    // Don't mark droppable zones if they are the dragged items or their direct parents
    if (!this.validDroppableZone(currentTarget.id)) {
      return;
    }

    // Check if it is a valid item
    if (currentTarget.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME) {
      return;
    }

    const treeItem = currentTarget as HTMLChTreeXListItemElement;
    treeItem.dragState = "enter";
    this.openSubTreeAfterCountdown(treeItem);
  };

  private validDroppableZone = (draggedItemId: string) =>
    !this.draggedIds.includes(draggedItemId) &&
    !this.draggedParentIds.includes(draggedItemId);

  private openSubTreeAfterCountdown(treeItem: HTMLChTreeXListItemElement) {
    this.cancelSubTreeOpening(treeItem);

    if (treeItem.leaf || treeItem.expanded) {
      return;
    }

    this.lastOpenSubTreeItem = treeItem;

    this.openSubTreeTimeout = setTimeout(() => {
      treeItem.expanded = true;
    }, this.openSubTreeCountdown);
  }

  private trackItemDragLeave = (event: DragEvent) => {
    const currentTarget = event.target as HTMLElement;

    if (currentTarget.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME) {
      return;
    }

    const treeItem = currentTarget as HTMLChTreeXListItemElement;
    treeItem.dragState = "none";
    this.cancelSubTreeOpening(treeItem);
  };

  private cancelSubTreeOpening(
    treeItem: HTMLChTreeXListItemElement,
    forceClear = false
  ) {
    if (this.lastOpenSubTreeItem === treeItem || forceClear) {
      clearTimeout(this.openSubTreeTimeout);
    }
  }

  private trackItemDrag = (event: DragEvent) => {
    event.preventDefault();
    this.lastPageX = event.pageX;
    this.lastPageY = event.pageY;

    if (!this.needForRAF) {
      return;
    }
    this.needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      this.el.style.setProperty(
        POSITION_X_DRAG_CUSTOM_VAR,
        `${this.lastPageX}px`
      );
      this.el.style.setProperty(
        POSITION_Y_DRAG_CUSTOM_VAR,
        `${this.lastPageY}px`
      );
    });
  };

  private resetVariables() {
    this.draggedIds = [];
    this.draggedParentIds = [];
  }

  /**
   * Update the dataTransfer in the drag event to store the ids of the dragged
   * items. Also it updates the visual information of the dragged items.
   */
  private updateDragInfo(dragInfo: TreeXItemDragStartInfo) {
    const draggedElement = dragInfo.elem;

    const isDraggingSelectedItems = this.selectedItemsInfo.has(
      draggedElement.id
    );

    let joinedDraggedIds: string;

    if (isDraggingSelectedItems) {
      const selectedItemKeys = [...this.selectedItemsInfo.keys()];
      const selectedItemCount = selectedItemKeys.length;

      this.draggedIds = selectedItemKeys;
      joinedDraggedIds = selectedItemKeys.join(",");

      this.dragInfo =
        selectedItemCount === 1
          ? draggedElement.caption
          : selectedItemCount.toString();
    } else {
      joinedDraggedIds = draggedElement.id;
      this.draggedIds = [joinedDraggedIds];
      this.dragInfo = draggedElement.caption;
    }

    this.getDirectParentsOfDraggableItems(isDraggingSelectedItems);

    dragInfo.dataTransfer.setData("text/plain", joinedDraggedIds);
  }

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
          "ch-tree-x-dragging-item": this.draggingItem,
          "ch-tree-x-waiting-drop-processing": this.waitDropProcessing
        }}
      >
        <slot />

        {this.draggingItem && (
          <span aria-hidden="true" class="ch-tree-x-drag-info">
            {this.dragInfo}
          </span>
        )}
      </Host>
    );
  }
}

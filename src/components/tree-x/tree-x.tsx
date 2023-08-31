import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  // Method,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";
import { TreeXListItemSelectedInfo } from "../tree-x-list-item/tree-x-list-item";
import {
  // CheckedTreeItemInfo,
  // ExpandedTreeItemInfo,
  SelectedTreeItemInfo,
  TreeXItemDragStartInfo,
  TreeXItemDropInfo
} from "./types";

const TREE_ITEM_TAG_NAME = "ch-tree-x-list-item";

// Selectors
// const CHECKED_ITEMS = `${TREE_ITEM_TAG_NAME}[checked]`;

const ARROW_DOWN_KEY = "ArrowDown";
const ARROW_UP_KEY = "ArrowUp";
const CONTROL_KEY = "Control";
const EDIT_KEY = "F2";

type KeyEvents =
  | typeof ARROW_DOWN_KEY
  | typeof ARROW_UP_KEY
  | typeof CONTROL_KEY
  | typeof EDIT_KEY;

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
      treeItem.focusNextItem();
    },

    [ARROW_UP_KEY]: event => {
      if (!isExecutedInTree(event, this.el) || treeItemIsInEditMode()) {
        return;
      }
      event.preventDefault();

      const treeItem = document.activeElement as HTMLChTreeXListItemElement;
      treeItem.focusPreviousItem();
    },

    [CONTROL_KEY]: event => {
      event.preventDefault();
      this.ctrlKeyPressed = true;
    },

    [EDIT_KEY]: event => {
      if (document.activeElement.tagName.toLowerCase() !== TREE_ITEM_TAG_NAME) {
        return;
      }

      event.preventDefault();
      (document.activeElement as HTMLChTreeXListItemElement).editing = true;
    }
  };

  private keyUpEvents = {
    [CONTROL_KEY]: (event: KeyboardEvent) => {
      event.preventDefault();
      this.ctrlKeyPressed = false;
    }
  };

  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  private lastPageX = 0;
  private lastPageY = 0;

  private selectedItems: Set<HTMLChTreeXListItemElement> = new Set();
  private selectedItemsInfo: Map<string, SelectedTreeItemInfo> = new Map();

  private currentDraggedItem: HTMLChTreeXListItemElement;

  /**
   * Text displayed when dragging an item.
   */
  private dragInfo: string;
  private draggedIds: string[] = [];
  private draggedParentIds: string[] = [];

  @Element() el: HTMLChTreeXElement;

  @State() draggingItem = false;

  /**
   * This property specifies if the ctrl key is pressed
   */
  @Prop({ mutable: true }) ctrlKeyPressed = false;

  /**
   * Level in the tree at which the control is placed.
   */
  @Prop() readonly level: number = -1;

  /**
   * Set this attribute if you want to allow multi selection of the items.
   */
  @Prop() readonly multiSelection: boolean = false;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop() readonly showLines: boolean = false;
  @Watch("showLines")
  handleShowLinesChange(newShowLines: boolean) {
    const treeItems = this.el.querySelectorAll(TREE_ITEM_TAG_NAME);

    treeItems.forEach(item => {
      item.showLines = newShowLines;
    });
  }

  /**
   * Fired when the selected items change.
   */
  @Event() selectedItemsChange: EventEmitter<SelectedTreeItemInfo[]>;

  /**
   * Fired when a lazy item is expanded an its content must be loaded.
   */
  @Event() loadLazyChildren: EventEmitter<string>;

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
    this.draggedIds = [];
    this.draggedParentIds = [];
  }

  @Listen("itemDrop")
  handleItemDrop(event: CustomEvent<TreeXItemDropInfo>) {
    console.log("itemDrop", event);
  }

  @Listen("selectedItemChange")
  handleSelectedItemChange(event: CustomEvent<TreeXListItemSelectedInfo>) {
    const selectedItemInfo = event.detail;
    const selectedItemEl = event.target as HTMLChTreeXListItemElement;

    this.handleItemSelection(selectedItemEl, selectedItemInfo);

    this.handleItemLazyLoad(selectedItemInfo);
  }

  private trackItemDragEnter = (event: DragEvent) => {
    event.stopPropagation();
    const currentTarget = event.target as HTMLElement;

    console.log("CURRENT TARGET", currentTarget);

    // Don't mark droppable zones if they are the dragged items or their direct parents
    if (
      this.draggedIds.includes(currentTarget.id) ||
      this.draggedParentIds.includes(currentTarget.id)
    ) {
      return;
    }

    if (currentTarget.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
      (currentTarget as HTMLChTreeXListItemElement).dragState = "enter";
    }
  };

  private trackItemDragLeave = (event: DragEvent) => {
    const currentTarget = event.target as HTMLElement;

    if (currentTarget.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
      (currentTarget as HTMLChTreeXListItemElement).dragState = "none";
    }
  };

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

      // console.log(event.clientX, event.clientY, event);
      // console.log("trackItemDrag");

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

    console.log("draggedIds", joinedDraggedIds);
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
    this.selectedItems.forEach(selectedItem => {
      const parentTreeItemElem = selectedItem.parentElement.parentElement;

      if (parentTreeItemElem.tagName.toLowerCase() === TREE_ITEM_TAG_NAME) {
        this.draggedParentIds.push(parentTreeItemElem.id);
      }
    });
  }

  private handleItemSelection(
    selectedItemEl: HTMLChTreeXListItemElement,
    selectedItemInfo: TreeXListItemSelectedInfo
  ) {
    // If the Control key was not pressed or multi selection is disabled,
    // remove all selected items
    if (!this.ctrlKeyPressed || !this.multiSelection) {
      this.selectedItems.forEach(treeItem => {
        treeItem.selected = false;
      });

      this.selectedItems.clear();
      this.selectedItemsInfo.clear();

      // Re-select the item
      selectedItemEl.selected = selectedItemInfo.selected;
    }

    // If the item is selected, add it to list
    if (selectedItemInfo.selected) {
      console.log("Add item to de list");

      this.selectedItems.add(selectedItemEl);
      this.selectedItemsInfo.set(selectedItemInfo.id, {
        id: selectedItemInfo.id,
        caption: selectedItemEl.caption,
        checked: selectedItemEl.checked
      });
    } else {
      this.selectedItems.delete(selectedItemEl);
      this.selectedItemsInfo.delete(selectedItemInfo.id);
    }

    // Sync with UI model
    this.selectedItemsChange.emit([...this.selectedItemsInfo.values()]);
  }

  private handleItemLazyLoad(selectedItemInfo: TreeXListItemSelectedInfo) {
    if (selectedItemInfo.expanded && selectedItemInfo.lazy) {
      this.loadLazyChildren.emit(selectedItemInfo.id);
    }
  }

  private handleKeyDownEvents = (event: KeyboardEvent) => {
    const keyHandler = this.keyDownEvents[event.key];

    if (keyHandler) {
      keyHandler(event);
    }
  };

  private handleKeyUpEvents = (event: KeyboardEvent) => {
    const keyHandler = this.keyUpEvents[event.key];

    if (keyHandler) {
      keyHandler(event);
    }
  };

  connectedCallback() {
    // Set edit mode in items
    this.el.addEventListener("keydown", this.handleKeyDownEvents, {
      capture: true
    });

    this.el.addEventListener("keyup", this.handleKeyUpEvents, {
      capture: true
    });
  }

  disconnectedCallback() {
    this.el.removeEventListener("keydown", this.handleKeyDownEvents);
    this.el.removeEventListener("keyup", this.handleKeyUpEvents);

    // Remove dragover body event
    this.handleItemDragEnd();
  }

  render() {
    return (
      <Host class={{ "ch-tree-x-remove-drop": this.draggingItem }}>
        <slot />

        {this.draggingItem && (
          <span aria-hidden="true" class="ch-tree-x-dragging-item">
            {this.dragInfo}
          </span>
        )}
      </Host>
    );
  }
}

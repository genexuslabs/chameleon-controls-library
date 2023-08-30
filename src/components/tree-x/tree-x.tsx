import {
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  // Method,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { TreeXListItemSelectedInfo } from "../tree-x-list-item/tree-x-list-item";
import {
  // CheckedTreeItemInfo,
  // ExpandedTreeItemInfo,
  SelectedTreeItemInfo
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

  private selectedItems: Set<HTMLChTreeXListItemElement> = new Set();
  private selectedItemsInfo: Map<string, SelectedTreeItemInfo> = new Map();

  @Element() el: HTMLChTreeXElement;

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

  @Listen("selectedItemChange")
  handleSelectedItemChange(event: CustomEvent<TreeXListItemSelectedInfo>) {
    const selectedItemInfo = event.detail;
    const selectedItemEl = event.target as HTMLChTreeXListItemElement;

    this.handleItemSelection(selectedItemEl, selectedItemInfo);

    this.handleItemLazyLoad(selectedItemInfo);
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
  }

  render() {
    return <slot />;
  }
}

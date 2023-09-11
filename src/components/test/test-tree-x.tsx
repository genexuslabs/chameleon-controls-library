import {
  Component,
  h,
  Prop,
  Listen,
  Host,
  Watch,
  State,
  forceUpdate,
  Method
} from "@stencil/core";
import {
  TreeXItemDropInfo,
  TreeXItemModel,
  TreeXLines,
  TreeXListItemNewCaption,
  TreeXListItemSelectedInfo,
  TreeXModel
} from "../tree-x/types";
import {
  TreeXItemModelExtended,
  TreeXOperationStatusModifyCaption
} from "./types";
import {
  ChTreeXCustomEvent,
  ChTreeXListItemCustomEvent
} from "../../components";

const DEFAULT_EXPANDED_VALUE = false;
const DEFAULT_LAZY_VALUE = false;
const DEFAULT_SELECTED_VALUE = false;

@Component({
  tag: "ch-test-tree-x",
  styleUrl: "test-tree-x.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChTestTreeX {
  // UI Models
  private flattenedTreeModel: Map<string, TreeXItemModelExtended> = new Map();
  private selectedItems: Set<string> = new Set();
  private flattenedLazyTreeModel: Map<string, TreeXItemModel> = new Map();

  // Refs
  private treeRef: HTMLChTreeXElement;

  /**
   * This property lets you specify if the tree is waiting to process the drop
   * of items.
   */
  @State() waitDropProcessing = false;

  /**
   * Callback that is executed when a list of items request to be dropped into
   * another item.
   */
  @Prop() readonly dropItemsCallback: (
    dropItemId: string,
    draggedIds: string[]
  ) => Promise<TreeXItemModel[]>;

  /**
   * This property lets you define the model of the ch-tree-x control.
   */
  @Prop({ mutable: true }) treeModel: TreeXModel = { items: [] };
  @Watch("treeModel")
  handleTreeModelChange() {
    this.flattenModel();
  }

  /**
   * Callback that is executed when a item request to load its subitems.
   */
  @Prop() readonly lazyLoadTreeItemsCallback: (
    treeItemId: string
  ) => Promise<TreeXItemModel[]>;

  /**
   * Callback that is executed when a item request to modify its caption.
   */
  @Prop() readonly modifyItemCaptionCallback: (
    treeItemId: string,
    newCaption: string
  ) => Promise<TreeXOperationStatusModifyCaption>;

  /**
   * Set this attribute if you want to allow multi selection of the items.
   */
  @Prop({ mutable: true }) multiSelection = false;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop({ mutable: true }) showLines: TreeXLines = "none";

  /**
   * Callback that is executed when the treeModel is changed to order its items.
   */
  @Prop() readonly sortItemsCallback: (subModel: TreeXItemModel[]) => void;

  /**
   * Given an item id, it displays and scrolls into the item view.
   */
  @Method()
  async scrollIntoVisible(treeItemId: string) {
    const itemUIModel = this.flattenedTreeModel.get(treeItemId);

    if (!itemUIModel) {
      // @todo Check if the item is on the server?
      return;
    }

    let visitedNode = itemUIModel.parentItem as TreeXItemModel;

    // While the parent is not the root, update the UI Models
    while (visitedNode && visitedNode.id != null) {
      // Expand the item
      visitedNode.expanded = true;

      const visitedNodeUIModel = this.flattenedTreeModel.get(visitedNode.id);
      visitedNode = visitedNodeUIModel.parentItem as TreeXItemModel;
    }

    forceUpdate(this);

    // @todo For some reason, when the model is created using the "big model" option,
    // this implementation does not work when only the UI Model is updated. So, to
    // expand the items, we have to delegate the responsibility to the tree-x
    this.treeRef.scrollIntoVisible(treeItemId);
  }

  @Listen("itemsDropped")
  handleDrop(event: CustomEvent<TreeXItemDropInfo>) {
    const detail = event.detail;
    const dropItemId = detail.dropItemId;

    // Check if the parent exists in the UI Model
    if (!this.flattenedTreeModel.get(dropItemId)) {
      return;
    }

    const data = detail.dataTransfer.getData("text/plain");
    const draggedIds = data?.split(",") ?? [];

    if (draggedIds.length === 0 || !this.dropItemsCallback) {
      return;
    }

    const promise = this.dropItemsCallback(dropItemId, draggedIds);
    this.waitDropProcessing = true;

    promise.then(acceptDrop => {
      this.waitDropProcessing = false;

      if (!acceptDrop) {
        return;
      }

      const newParentItem = this.flattenedTreeModel.get(dropItemId).item;

      // Add the UI models to the new container and remove the UI models from
      // the old containers
      draggedIds.forEach(itemId => {
        const itemUIModelExtended = this.flattenedTreeModel.get(itemId);
        const item = itemUIModelExtended.item;
        const oldParentItem = itemUIModelExtended.parentItem;

        // Remove the UI model from the previous parent
        oldParentItem.items.splice(oldParentItem.items.indexOf(item), 1);

        // Add the UI Model to the new parent
        newParentItem.items.push(item);

        // Reference the new parent in the item
        itemUIModelExtended.parentItem = newParentItem;
      });

      this.sortItems(newParentItem.items);

      // Open the item to visualize the new subitems
      newParentItem.expanded = true;

      // There is no need to force and update, since the waitDropProcessing
      // prop was modified
    });
  }

  @Listen("loadLazyContent")
  loadLazyChildrenHandler(event: ChTreeXListItemCustomEvent<string>) {
    event.stopPropagation();
    const treeItemId = event.detail;

    if (this.lazyLoadTreeItemsCallback) {
      const promise = this.lazyLoadTreeItemsCallback(treeItemId);
      const itemRef = event.target;
      itemRef.downloading = true;

      promise.then(result => {
        const itemToLazyLoadContent =
          this.flattenedLazyTreeModel.get(treeItemId);

        // Establish that the content was lazy loaded
        this.flattenedLazyTreeModel.delete(treeItemId);
        itemToLazyLoadContent.lazy = false;
        itemRef.downloading = false;

        // Check if there is items to add
        if (result == null) {
          return;
        }

        // @todo What happens in the server when dropping items on a lazy node?
        itemToLazyLoadContent.items = result;

        this.sortItems(itemToLazyLoadContent.items);
        this.flattenSubModel(itemToLazyLoadContent);

        // Force re-render
        forceUpdate(this);
      });
    }
  }

  @Listen("modifyCaption")
  handleCaptionModification(
    event: ChTreeXListItemCustomEvent<TreeXListItemNewCaption>
  ) {
    event.stopPropagation();

    if (!this.modifyItemCaptionCallback) {
      return;
    }

    const itemRef = event.target;
    const itemId = event.detail.id;
    const itemUIModel = this.flattenedTreeModel.get(itemId);
    const itemInfo = itemUIModel.item;
    const newCaption = event.detail.caption;
    const oldCaption = itemInfo.caption;

    // Optimistic UI: Update the caption in the UI Model before the change is
    // completed in the server
    itemInfo.caption = newCaption;

    // Due to performance reasons, we don't make a shallow copy of the
    // treeModel to force a re-render
    itemRef.caption = newCaption;

    const promise = this.modifyItemCaptionCallback(itemId, newCaption);

    promise.then(status => {
      if (status.success) {
        this.sortItems(itemUIModel.parentItem.items);

        // Force re-render
        forceUpdate(this);
      } else {
        itemRef.caption = oldCaption;
        itemInfo.caption = oldCaption;

        // Do something with the error message
      }
    });
  }

  private closeTreeNodeHandler = () => {
    // this.tree.toggleItems(["number-1-1-2"], false);
  };

  private openTreeNodeHandler = () => {
    // this.tree.toggleItems(["number-1-1-2"], true);
  };

  private toggleTreeNodeHandler = () => {
    // this.tree.toggleItems(["number-1-1-2"]);
  };

  private handleSelectedItemsChange = (
    event: ChTreeXCustomEvent<Map<string, TreeXListItemSelectedInfo>>
  ) => {
    const itemsToProcess = new Map(event.detail);

    // Remove no longer selected items
    this.selectedItems.forEach(selectedItemId => {
      const itemUIModel = this.flattenedTreeModel.get(selectedItemId).item;
      const itemIsStillSelected = itemsToProcess.get(selectedItemId);

      // The item does not need to be added. Remove it from the processed list
      if (itemIsStillSelected) {
        itemUIModel.expanded = itemIsStillSelected.expanded; // Update expanded state
        itemsToProcess.delete(selectedItemId);
      }
      // The item must be un-selected in the UI Model
      else {
        itemUIModel.selected = false;
        this.selectedItems.delete(selectedItemId);
      }
    });

    // Add new selected items
    itemsToProcess.forEach((newSelectedItemInfo, itemId) => {
      const newSelectedItem = this.flattenedTreeModel.get(itemId).item;
      newSelectedItem.selected = true;
      newSelectedItem.expanded = newSelectedItemInfo.expanded;

      this.selectedItems.add(itemId);
    });
  };

  private getCheckedItemsHandler = async () => {
    // const checked = await this.tree.getCheckedItems();
  };

  // private deleteNodeHandler = () => {
  //   this.treeItemsModel = [];
  // };

  private renderSubModel = (treeSubModel: TreeXItemModel) => (
    <ch-tree-x-list-item
      id={treeSubModel.id}
      caption={treeSubModel.caption}
      checkbox={treeSubModel.checkbox}
      checked={treeSubModel.checked}
      class={treeSubModel.class}
      disabled={treeSubModel.disabled}
      expanded={treeSubModel.expanded}
      lazyLoad={treeSubModel.lazy}
      leaf={treeSubModel.leaf}
      leftImgSrc={treeSubModel.leftImgSrc}
      rightImgSrc={treeSubModel.rightImgSrc}
      selected={treeSubModel.selected}
      showExpandableButton={treeSubModel.showExpandableButton}
      toggleCheckboxes={treeSubModel.toggleCheckboxes}
    >
      {!treeSubModel.leaf &&
        treeSubModel.items != null &&
        treeSubModel.items.length !== 0 && (
          <ch-tree-x-list slot="tree">
            {treeSubModel.items.map(this.renderSubModel)}
          </ch-tree-x-list>
        )}
    </ch-tree-x-list-item>
  );

  private flattenSubModel(model: TreeXModel | TreeXItemModel) {
    const items = model.items;

    if (!items) {
      // Make sure that subtrees don't have an undefined array
      if ((model as TreeXItemModel).leaf === false) {
        model.items = [];
      }
      return;
    }

    this.sortItems(items);

    items.forEach(item => {
      this.flattenedTreeModel.set(item.id, {
        parentItem: model,
        item: item
      });

      // Make sure the properties are with their default values to avoid issues
      // when reusing DOM nodes
      item.expanded ??= DEFAULT_EXPANDED_VALUE;
      item.lazy ??= DEFAULT_LAZY_VALUE;
      item.selected ??= DEFAULT_SELECTED_VALUE;

      if (item.lazy) {
        this.flattenedLazyTreeModel.set(item.id, item);
      }

      if (item.selected) {
        this.selectedItems.add(item.id);
      }

      this.flattenSubModel(item);
    });
  }

  private sortItems(items: TreeXItemModel[]) {
    // Ensure that items are sorted
    if (this.sortItemsCallback) {
      this.sortItemsCallback(items);
    }
  }

  private flattenModel() {
    this.flattenedTreeModel.clear();
    this.flattenedLazyTreeModel.clear();

    this.flattenSubModel(this.treeModel);
  }

  private handleMultiSelectionChange = (event: CustomEvent) => {
    const checked = (event.target as HTMLInputElement).checked;

    this.multiSelection = checked;
  };

  private handleShowLinesChange = (event: CustomEvent) => {
    const selectedOption = (event.target as HTMLSelectElement).value;
    this.showLines = selectedOption as TreeXLines;
  };

  componentWillLoad() {
    this.flattenModel();
  }

  render() {
    return (
      <Host>
        <ch-tree-x
          multiSelection={this.multiSelection}
          showLines={this.showLines}
          waitDropProcessing={this.waitDropProcessing}
          onSelectedItemsChange={this.handleSelectedItemsChange}
          ref={el => (this.treeRef = el)}
        >
          <ch-tree-x-list>
            {this.treeModel.items.map(this.renderSubModel)}
          </ch-tree-x-list>
        </ch-tree-x>

        <div class="tree-buttons">
          <button type="button" onClick={this.closeTreeNodeHandler}>
            Close 1-1-2
          </button>

          <button type="button" onClick={this.openTreeNodeHandler}>
            Open 1-1-2
          </button>

          <button type="button" onClick={this.toggleTreeNodeHandler}>
            Toggle 1-1-2
          </button>

          <button type="button" onClick={this.getCheckedItemsHandler}>
            Get Checked Items
          </button>

          <ch-checkbox caption="Check / uncheck all"></ch-checkbox>

          <ch-checkbox
            checkedValue="true"
            unCheckedValue="false"
            value={this.multiSelection.toString()}
            caption="Multi selection"
            onInput={this.handleMultiSelectionChange}
          ></ch-checkbox>

          <label>
            Lines
            <select name="lines" onInput={this.handleShowLinesChange}>
              <option value="all" selected={this.showLines === "all"}>
                All lines
              </option>
              <option value="last" selected={this.showLines === "last"}>
                Last line
              </option>
              <option value="none" selected={this.showLines === "none"}>
                None
              </option>
            </select>
          </label>
          {/* <button type="button" onClick={this.deleteNodeHandler}>
          Delete Tree
        </button> */}
        </div>
      </Host>
    );
  }
}

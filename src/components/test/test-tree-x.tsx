import { Component, h, Prop, Listen, Host, Watch, State } from "@stencil/core";
import {
  TreeXItemDropInfo,
  TreeXItemModel,
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

@Component({
  tag: "ch-test-tree-x",
  styleUrl: "test-tree-x.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChTestTreeX {
  // UI Model
  private flattenedTreeModel: Map<string, TreeXItemModelExtended> = new Map();
  private selectedItems: Set<string> = new Set();
  private flattenedLazyTreeModel: Map<string, TreeXItemModel> = new Map();

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
    console.log("handleTreeModelChange - - - - - - - - - -");
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
   * Set this attribute if you want to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop({ mutable: true }) showLines = true;

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

      // Open the item to visualize the new subitems
      newParentItem.expanded = true;

      // Force re-render
      this.render();
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
        this.flattenedLazyTreeModel.delete(treeItemId);

        itemToLazyLoadContent.items = result;
        itemToLazyLoadContent.lazy = false;
        itemRef.downloading = false;

        this.flattenSubModel(itemToLazyLoadContent);

        // Force re-render
        this.treeModel = { ...this.treeModel };
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
    const itemInfo = this.flattenedTreeModel.get(itemId).item;
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
      if (!status.success) {
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
    // console.log(checked);
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
      class={treeSubModel.cssClass}
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
      return;
    }

    items.forEach(item => {
      this.flattenedTreeModel.set(item.id, {
        parentItem: model,
        item: item
      });

      if (item.lazy) {
        this.flattenedLazyTreeModel.set(item.id, item);
      }

      if (item.selected) {
        this.selectedItems.add(item.id);
      }

      this.flattenSubModel(item);
    });
  }

  private flattenModel() {
    this.flattenedTreeModel.clear();
    this.flattenedLazyTreeModel.clear();

    this.flattenSubModel(this.treeModel);
  }

  private handleMultiSelectionChange = (event: CustomEvent) => {
    const checked = (event.target as HTMLInputElement).checked;
    console.log("handleMultiSelectionChange", checked);

    this.multiSelection = checked;
  };

  private handleShowLinesChange = (event: CustomEvent) => {
    const checked = (event.target as HTMLInputElement).checked;
    this.showLines = checked;
  };

  componentWillLoad() {
    this.flattenModel();
  }

  render() {
    return (
      <Host>
        <div class="test-tree-x-scroll">
          <ch-tree-x
            multiSelection={this.multiSelection}
            showLines={this.showLines}
            waitDropProcessing={this.waitDropProcessing}
            onSelectedItemsChange={this.handleSelectedItemsChange}
          >
            <ch-tree-x-list>
              {this.treeModel.items.map(this.renderSubModel)}
            </ch-tree-x-list>
          </ch-tree-x>
        </div>

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

          <ch-checkbox
            checkedValue="true"
            unCheckedValue="false"
            value={this.showLines.toString()}
            caption="Show lines"
            onInput={this.handleShowLinesChange}
          ></ch-checkbox>

          {/* <button type="button" onClick={this.deleteNodeHandler}>
          Delete Tree
        </button> */}
        </div>
      </Host>
    );
  }
}

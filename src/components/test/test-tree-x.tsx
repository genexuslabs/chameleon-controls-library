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
  TreeXDataTransferInfo,
  TreeXDropCheckInfo,
  TreeXItemModel,
  TreeXLines,
  TreeXListItemExpandedInfo,
  TreeXListItemNewCaption,
  TreeXListItemSelectedInfo
} from "../tree-x/types";
import {
  TreeXItemModelExtended,
  TreeXOperationStatusModifyCaption
} from "./types";
import {
  ChTreeXCustomEvent,
  ChTreeXListItemCustomEvent
} from "../../components";
import { GxDataTransferInfo } from "../../common/types";

const DEFAULT_DRAG_DISABLED_VALUE = false;
const DEFAULT_DROP_DISABLED_VALUE = false;
const DEFAULT_CLASS_VALUE = "tree-view-item";
const DEFAULT_EXPANDED_VALUE = false;
const DEFAULT_INDETERMINATE_VALUE = false;
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
   * Callback that is executed when an element tries to drop in another item of
   * the tree. Returns whether the drop is valid.
   */
  @Prop() readonly checkDroppableZoneCallback: (
    dropInformation: TreeXDropCheckInfo
  ) => Promise<boolean>;

  /**
   * A CSS class to set as the `ch-tree-x` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   * This attribute lets you specify if the drag operation is disabled in all
   * items by default. If `true`, the control can't be dragged.
   */
  @Prop() readonly dragDisabled: boolean = DEFAULT_DRAG_DISABLED_VALUE;

  /**
   * This attribute lets you specify if the drop operation is disabled in all
   * items by default. If `true`, the control won't accept any drops.
   */
  @Prop() readonly dropDisabled: boolean = DEFAULT_DROP_DISABLED_VALUE;

  /**
   * Callback that is executed when a list of items request to be dropped into
   * another item.
   */
  @Prop() readonly dropItemsCallback: (
    dataTransferInfo: TreeXDataTransferInfo
  ) => Promise<{ acceptDrop: boolean; items?: TreeXItemModel[] }>;

  /**
   * This property lets you define the model of the ch-tree-x control.
   */
  @Prop() readonly treeModel: TreeXItemModel[] = [];
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
  @Prop() readonly multiSelection: boolean = false;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop() readonly showLines: TreeXLines = "none";

  /**
   * Callback that is executed when the treeModel is changed to order its items.
   */
  @Prop() readonly sortItemsCallback: (subModel: TreeXItemModel[]) => void;

  /**
   * Given an item id, an array of items to add, the download status and the
   * lazy state, updates the item's UI Model.
   */
  @Method()
  async loadLazyContent(
    itemId: string,
    items?: TreeXItemModel[],
    downloading = false,
    lazy = false
  ) {
    const itemToLazyLoadContent = this.flattenedLazyTreeModel.get(itemId);

    // Establish that the content was lazy loaded
    this.flattenedLazyTreeModel.delete(itemId);
    itemToLazyLoadContent.downloading = downloading;
    itemToLazyLoadContent.lazy = lazy;

    // Check if there is items to add
    if (items == null) {
      return;
    }

    // @todo What happens in the server when dropping items on a lazy node?
    itemToLazyLoadContent.items = items;

    this.sortItems(itemToLazyLoadContent.items);
    this.flattenSubModel(itemToLazyLoadContent);

    // Force re-render
    forceUpdate(this);
  }

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

  /**
   * This method is used to toggle a tree item by the tree item id/ids.
   *
   * @param treeItemIds An array id the tree items to be toggled.
   * @param expand A boolean indicating that the tree item should be expanded or collapsed. (optional)
   * @returns The modified items after the method was called.
   */
  @Method()
  async toggleItems(
    treeItemIds: string[],
    expand?: boolean
  ): Promise<TreeXListItemExpandedInfo[]> {
    if (!treeItemIds) {
      return [];
    }

    const modifiedTreeItems: TreeXListItemExpandedInfo[] = [];

    treeItemIds.forEach(treeItemId => {
      const itemInfo = this.flattenedTreeModel.get(treeItemId).item;

      if (itemInfo) {
        itemInfo.expanded = expand ?? !itemInfo.expanded;

        modifiedTreeItems.push({
          id: itemInfo.id,
          expanded: itemInfo.expanded
        });
      }
    });
    // Force re-render
    forceUpdate(this);

    return modifiedTreeItems;
  }

  /**
   * Given a subset of item's properties, it updates all item UI models.
   */
  @Method()
  async updateAllItemsProperties(properties: {
    expanded?: boolean;
    checked?: boolean;
  }) {
    [...this.flattenedTreeModel.values()].forEach(itemUIModel => {
      if (properties.expanded != null) {
        itemUIModel.item.expanded = properties.expanded;
      }

      if (properties.checked != null) {
        itemUIModel.item.checked = properties.checked;
        itemUIModel.item.indeterminate = false;
      }
    });

    forceUpdate(this);
  }

  /**
   * Given a item list and the properties to update, it updates the properties
   * of the items in the list.
   */
  @Method()
  async updateItemsProperties(items: string[], properties: TreeXItemModel) {
    items.forEach(item => {
      const itemUIModel = this.flattenedTreeModel.get(item);
      this.updateItemProperty(itemUIModel, properties);
    });

    forceUpdate(this);
  }

  private updateItemProperty(
    itemUIModel: TreeXItemModelExtended | undefined,
    properties: TreeXItemModel
  ) {
    if (!itemUIModel) {
      return;
    }

    const itemInfo = itemUIModel.item;

    Object.keys(properties).forEach(propertyName => {
      itemInfo[propertyName] = properties[propertyName];
    });
  }

  @Listen("loadLazyContent")
  loadLazyChildrenHandler(event: ChTreeXListItemCustomEvent<string>) {
    if (!this.lazyLoadTreeItemsCallback) {
      return;
    }
    event.stopPropagation();

    const treeItemId = event.detail;
    const promise = this.lazyLoadTreeItemsCallback(treeItemId);
    event.target.downloading = true;

    promise.then(result => {
      this.loadLazyContent(treeItemId, result);
    });
  }

  @Listen("modifyCaption")
  handleCaptionModification(
    event: ChTreeXListItemCustomEvent<TreeXListItemNewCaption>
  ) {
    if (!this.modifyItemCaptionCallback) {
      return;
    }
    event.stopPropagation();

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

  private handleDroppableZoneEnter = (
    event: ChTreeXCustomEvent<TreeXDropCheckInfo>
  ) => {
    if (!this.checkDroppableZoneCallback) {
      return;
    }
    event.stopPropagation();

    const dropInformation = event.detail;
    const requestTimestamp = new Date().getTime();
    const promise = this.checkDroppableZoneCallback(dropInformation);

    promise.then(validDrop => {
      this.treeRef.updateValidDroppableZone(
        requestTimestamp,
        dropInformation.newContainer.id,
        dropInformation.draggedItems,
        validDrop
      );
    });
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

  private handleExpandedItemChange = (
    event: ChTreeXCustomEvent<TreeXListItemExpandedInfo>
  ) => {
    const detail = event.detail;
    const itemInfo = this.flattenedTreeModel.get(detail.id).item;
    itemInfo.expanded = detail.expanded;
  };

  private handleItemsDropped = (
    event: ChTreeXCustomEvent<TreeXDataTransferInfo>
  ) => {
    if (!this.dropItemsCallback) {
      return;
    }
    event.stopPropagation();

    const dataTransferInfo = event.detail;
    const newContainer = dataTransferInfo.newContainer;
    const newParentId = newContainer.id;

    // Check if the parent exists in the UI Model
    if (!this.flattenedTreeModel.get(newParentId)) {
      return;
    }

    const draggedItems: GxDataTransferInfo[] = dataTransferInfo.draggedItems;

    if (draggedItems.length === 0) {
      return;
    }

    const promise = this.dropItemsCallback(dataTransferInfo);
    this.waitDropProcessing = true;

    promise.then(async response => {
      this.waitDropProcessing = false;

      if (!response.acceptDrop) {
        return;
      }

      const newParentUIModel = this.flattenedTreeModel.get(newParentId).item;

      // Only move the items to the new parent, keeping the state
      if (dataTransferInfo.dropInTheSameTree) {
        // Add the UI models to the new container and remove the UI models from
        // the old containers
        draggedItems.forEach(this.moveItemToNewParent(newParentUIModel));

        // When the selected items are moved, the tree must remove its internal
        // state to not have undefined references
        if (dataTransferInfo.draggingSelectedItems) {
          await this.treeRef.clearSelectedItemsInfo();
        }
      }
      // Add the new items
      else {
        if (response.items == null) {
          return;
        }

        // Add new items to the parent
        newParentUIModel.items.push(...response.items);

        // Flatten the new UI models
        response.items.forEach(this.flattenItemUIModel(newParentUIModel));
      }

      this.sortItems(newParentUIModel.items);

      // Open the item to visualize the new subitems
      newParentUIModel.expanded = true;

      // There is no need to force and update, since the waitDropProcessing
      // prop was modified
    });
  };

  private moveItemToNewParent =
    (newParentUIModel: TreeXItemModel) =>
    (dataTransferInfo: GxDataTransferInfo) => {
      const itemUIModelExtended = this.flattenedTreeModel.get(
        dataTransferInfo.id
      );
      const item = itemUIModelExtended.item;
      const oldParentItem = itemUIModelExtended.parentItem;

      // Remove the UI model from the previous parent
      oldParentItem.items.splice(oldParentItem.items.indexOf(item), 1);

      // Add the UI Model to the new parent
      newParentUIModel.items.push(item);

      // Reference the new parent in the item
      itemUIModelExtended.parentItem = newParentUIModel;
    };

  private renderSubModel = (
    treeSubModel: TreeXItemModel,
    lastItem: boolean,
    level: number
  ) => (
    <ch-tree-x-list-item
      id={treeSubModel.id}
      caption={treeSubModel.caption}
      checkbox={treeSubModel.checkbox}
      checked={treeSubModel.checked}
      class={treeSubModel.class}
      disabled={treeSubModel.disabled}
      downloading={treeSubModel.downloading}
      dragDisabled={treeSubModel.dragDisabled ?? this.dragDisabled}
      dropDisabled={treeSubModel.dropDisabled ?? this.dropDisabled}
      expanded={treeSubModel.expanded}
      indeterminate={treeSubModel.indeterminate}
      lastItem={lastItem}
      lazyLoad={treeSubModel.lazy}
      leaf={treeSubModel.leaf}
      leftImgSrc={treeSubModel.leftImgSrc}
      level={level}
      metadata={treeSubModel.metadata}
      rightImgSrc={treeSubModel.rightImgSrc}
      selected={treeSubModel.selected}
      showExpandableButton={treeSubModel.showExpandableButton}
      showLines={this.showLines}
      toggleCheckboxes={treeSubModel.toggleCheckboxes}
    >
      {!treeSubModel.leaf &&
        treeSubModel.items != null &&
        treeSubModel.items.length !== 0 && (
          <ch-tree-x-list slot="tree">
            {treeSubModel.items.map((subModel, index) =>
              this.renderSubModel(
                subModel,
                this.showLines && index === treeSubModel.items.length - 1,
                level + 1
              )
            )}
          </ch-tree-x-list>
        )}
    </ch-tree-x-list-item>
  );

  private flattenSubModel(model: TreeXItemModel) {
    const items = model.items;

    if (!items) {
      // Make sure that subtrees don't have an undefined array
      if (model.leaf === false) {
        model.items = [];
      }
      return;
    }

    this.sortItems(items);

    items.forEach(this.flattenItemUIModel(model));
  }

  private flattenItemUIModel =
    (parentModel: TreeXItemModel) => (item: TreeXItemModel) => {
      this.flattenedTreeModel.set(item.id, {
        parentItem: parentModel,
        item: item
      });

      // Make sure the properties are with their default values to avoid issues
      // when reusing DOM nodes
      item.class ||= DEFAULT_CLASS_VALUE;
      item.expanded ??= DEFAULT_EXPANDED_VALUE;
      item.indeterminate ??= DEFAULT_INDETERMINATE_VALUE;
      item.lazy ??= DEFAULT_LAZY_VALUE;
      item.selected ??= DEFAULT_SELECTED_VALUE;

      if (item.lazy) {
        this.flattenedLazyTreeModel.set(item.id, item);
      }

      if (item.selected) {
        this.selectedItems.add(item.id);
      }

      this.flattenSubModel(item);
    };

  private sortItems(items: TreeXItemModel[]) {
    // Ensure that items are sorted
    if (this.sortItemsCallback) {
      this.sortItemsCallback(items);
    }
  }

  private flattenModel() {
    this.flattenedTreeModel.clear();
    this.flattenedLazyTreeModel.clear();

    this.flattenSubModel({ id: null, caption: null, items: this.treeModel });
  }

  componentWillLoad() {
    this.flattenModel();
  }

  render() {
    return (
      <Host>
        <ch-tree-x
          class={this.cssClass || null}
          multiSelection={this.multiSelection}
          waitDropProcessing={this.waitDropProcessing}
          onDroppableZoneEnter={this.handleDroppableZoneEnter}
          onExpandedItemChange={this.handleExpandedItemChange}
          onItemsDropped={this.handleItemsDropped}
          onSelectedItemsChange={this.handleSelectedItemsChange}
          ref={el => (this.treeRef = el)}
        >
          {this.treeModel.map((subModel, index) =>
            this.renderSubModel(
              subModel,
              this.showLines && index === this.treeModel.length - 1,
              0
            )
          )}
        </ch-tree-x>
      </Host>
    );
  }
}

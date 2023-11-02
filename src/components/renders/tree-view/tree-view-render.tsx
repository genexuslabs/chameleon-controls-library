import {
  Component,
  Event,
  EventEmitter,
  h,
  Prop,
  Listen,
  Watch,
  State,
  forceUpdate,
  Method
} from "@stencil/core";
import {
  TreeViewDataTransferInfo,
  TreeViewDropCheckInfo,
  TreeViewItemContextMenu,
  TreeViewItemModel,
  TreeViewLines,
  TreeViewItemCheckedInfo,
  TreeViewItemExpandedInfo,
  TreeViewItemNewCaption,
  TreeViewItemOpenReferenceInfo,
  TreeViewItemSelectedInfo
} from "../../tree-view/tree-view/types";
import {
  TreeViewFilterInfo,
  TreeViewFilterOptions,
  TreeViewFilterType,
  TreeViewItemModelExtended,
  TreeViewOperationStatusModifyCaption
} from "./types";
import {
  ChTreeViewCustomEvent,
  ChTreeViewItemCustomEvent
} from "../../../components";
import { GxDataTransferInfo } from "../../../common/types";
import { filterDictionary } from "./helpers";
import {
  TreeViewGXItemModel,
  fromGxImageToURL
} from "./genexus-implementation";

const DEFAULT_DRAG_DISABLED_VALUE = false;
const DEFAULT_DROP_DISABLED_VALUE = false;
const DEFAULT_CLASS_VALUE = "tree-view-item";
const DEFAULT_EDITABLE_ITEMS_VALUE = true;
const DEFAULT_EXPANDED_VALUE = false;
const DEFAULT_INDETERMINATE_VALUE = false;
const DEFAULT_LAZY_VALUE = false;
const DEFAULT_ORDER_VALUE = 0;
const DEFAULT_SELECTED_VALUE = false;

const defaultRenderItem = (
  itemModel: TreeViewItemModel,
  treeState: ChTreeViewRender,
  treeHasFilter: boolean,
  lastItem: boolean,
  level: number
) =>
  (treeState.filterType === "none" || itemModel.render !== false) && (
    <ch-tree-view-item
      id={itemModel.id}
      caption={itemModel.caption}
      checkbox={itemModel.checkbox ?? treeState.checkbox}
      checked={itemModel.checked ?? treeState.checked}
      class={itemModel.class}
      disabled={itemModel.disabled}
      downloading={itemModel.downloading}
      dragDisabled={itemModel.dragDisabled ?? treeState.dragDisabled}
      dropDisabled={itemModel.dropDisabled ?? treeState.dropDisabled}
      editable={itemModel.editable ?? treeState.editableItems}
      expanded={itemModel.expanded}
      indeterminate={itemModel.indeterminate}
      lastItem={lastItem}
      lazyLoad={itemModel.lazy}
      leaf={itemModel.leaf}
      leftImgSrc={itemModel.leftImgSrc}
      level={level}
      metadata={itemModel.metadata}
      rightImgSrc={itemModel.rightImgSrc}
      selected={itemModel.selected}
      showExpandableButton={itemModel.showExpandableButton}
      showLines={treeState.showLines}
      toggleCheckboxes={
        itemModel.toggleCheckboxes ?? treeState.toggleCheckboxes
      }
    >
      {!itemModel.leaf &&
        itemModel.items != null &&
        itemModel.items.map((subModel, index) =>
          defaultRenderItem(
            subModel,
            treeState,
            treeHasFilter,
            treeState.showLines !== "none" &&
              // If there is a filter applied in the current list, use the
              // lastItemId value to calculate the last item
              (treeHasFilter && itemModel.lastItemId !== ""
                ? subModel.id === itemModel.lastItemId
                : index === itemModel.items.length - 1),
            level + 1
          )
        )}
    </ch-tree-view-item>
  );

const GXRenderItem = (
  itemModel: TreeViewGXItemModel,
  treeState: ChTreeViewRender,
  treeHasFilter: boolean,
  lastItem: boolean,
  level: number
) =>
  (treeState.filterType === "none" || itemModel.render !== false) && (
    <ch-tree-view-item
      id={itemModel.id}
      caption={itemModel.caption}
      checkbox={itemModel.checkbox ?? treeState.checkbox}
      checked={itemModel.checked ?? treeState.checked}
      class={itemModel.class}
      downloading={itemModel.downloading}
      dragDisabled={
        itemModel.dragEnabled != null
          ? !itemModel.dragEnabled
          : treeState.dragDisabled
      }
      dropDisabled={
        itemModel.dropEnabled != null
          ? !itemModel.dropEnabled
          : treeState.dropDisabled
      }
      editable={itemModel.editable ?? treeState.editableItems}
      expanded={itemModel.expanded}
      indeterminate={itemModel.indeterminate}
      lastItem={lastItem}
      lazyLoad={itemModel.lazy}
      leaf={itemModel.leaf}
      leftImgSrc={fromGxImageToURL(
        itemModel.leftImage,
        treeState.gxSettings,
        treeState.gxImageConstructor
      )}
      level={level}
      metadata={itemModel.metadata}
      selected={itemModel.selected}
      showLines={treeState.showLines}
      toggleCheckboxes={
        itemModel.toggleCheckboxes ?? treeState.toggleCheckboxes
      }
    >
      {!itemModel.leaf &&
        itemModel.items != null &&
        itemModel.items.map((subModel, index) =>
          GXRenderItem(
            subModel,
            treeState,
            treeHasFilter,
            treeState.showLines !== "none" &&
              // If there is a filter applied in the current list, use the
              // lastItemId value to calculate the last item
              (treeHasFilter && itemModel.lastItemId !== ""
                ? subModel.id === itemModel.lastItemId
                : index === itemModel.items.length - 1),
            level + 1
          )
        )}
    </ch-tree-view-item>
  );

const defaultSortItemsCallback = (subModel: TreeViewItemModel[]): void => {
  subModel.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    }

    if (a.order > b.order) {
      return 0;
    }

    return a.caption <= b.caption ? -1 : 0;
  });
};

@Component({
  tag: "ch-tree-view-render",
  styleUrl: "tree-view-render.scss",
  shadow: false
})
export class ChTreeViewRender {
  // UI Models
  private flattenedTreeModel: Map<string, TreeViewItemModelExtended> =
    new Map();
  private flattenedCheckboxTreeModel: Map<string, TreeViewItemModelExtended> =
    new Map();
  private selectedItems: Set<string> = new Set();

  private applyFilters = false;
  private emitCheckedChange = false;

  private filterTimeout: NodeJS.Timeout;

  // Refs
  private treeRef: HTMLChTreeViewElement;

  /**
   * This property lets you specify if the tree is waiting to process the drop
   * of items.
   */
  @State() waitDropProcessing = false;

  /**
   * Set this attribute if you want display a checkbox in all items by default.
   */
  @Prop() readonly checkbox: boolean = false;

  /**
   * Set this attribute if you want the checkbox to be checked in all items by
   * default.
   * Only works if `checkbox = true`
   */
  @Prop() readonly checked: boolean = false;

  /**
   * Callback that is executed when an element tries to drop in another item of
   * the tree. Returns whether the drop is valid.
   */
  @Prop() readonly checkDroppableZoneCallback: (
    dropInformation: TreeViewDropCheckInfo
  ) => Promise<boolean>;

  /**
   * A CSS class to set as the `ch-tree-view` element class.
   */
  @Prop() readonly cssClass: string = "tree-view";

  /**
   * This attribute lets you specify if the drag operation is disabled in all
   * items by default. If `true`, the items can't be dragged.
   */
  @Prop() readonly dragDisabled: boolean = DEFAULT_DRAG_DISABLED_VALUE;

  /**
   * This attribute lets you specify if the drop operation is disabled in all
   * items by default. If `true`, the items won't accept any drops.
   */
  @Prop() readonly dropDisabled: boolean = DEFAULT_DROP_DISABLED_VALUE;

  /**
   * Callback that is executed when a list of items request to be dropped into
   * another item.
   */
  @Prop() readonly dropItemsCallback: (
    dataTransferInfo: TreeViewDataTransferInfo
  ) => Promise<{ acceptDrop: boolean; items?: TreeViewItemModel[] }>;

  /**
   * This attribute lets you specify if the edit operation is enabled in all
   * items by default. If `true`, the items can edit its caption in place.
   */
  @Prop() readonly editableItems: boolean = DEFAULT_EDITABLE_ITEMS_VALUE;

  /**
   * This property lets you determine the expression that will be applied to the
   * filter.
   * Only works if `filterType = "caption" | "metadata"`.
   */
  @Prop() readonly filter: string;
  @Watch("filter")
  handleFilterChange() {
    if (this.filterType === "caption" || this.filterType === "metadata") {
      this.processFilters();
    }
  }

  /**
   * This property lets you determine the debounce time (in ms) that the
   * control waits until it processes the changes to the filter property.
   * Consecutive changes to the `filter` property between this range, reset the
   * timeout to process the filter.
   * Only works if `filterType = "caption" | "metadata"`.
   */
  @Prop() readonly filterDebounce: number = 250;
  @Watch("filterDebounce")
  handleFilterDebounceChange() {
    if (this.filterType === "caption" || this.filterType === "metadata") {
      this.processFilters();
    }
  }

  /**
   * This property lets you determine the list of items that will be filtered.
   * Only works if `filterType = "id-list"`.
   */
  @Prop() readonly filterList: string[] = [];
  @Watch("filterList")
  handleFilterListChange() {
    if (this.filterType === "id-list") {
      this.processFilters();
    }
  }

  /**
   * This property lets you determine the options that will be applied to the
   * filter.
   * Only works if `filterType = "caption" | "metadata"`.
   */
  @Prop() readonly filterOptions: TreeViewFilterOptions = {};
  @Watch("filterOptions")
  handleFilterOptionsChange() {
    if (this.filterType === "caption" || this.filterType === "metadata") {
      this.processFilters();
    }
  }

  /**
   * This attribute lets you define what kind of filter is applied to items.
   * Only items that satisfy the filter predicate will be displayed.
   *
   * | Value       | Details                                                                                        |
   * | ----------- | ---------------------------------------------------------------------------------------------- |
   * | `checked`   | Show only the items that have a checkbox and are checked.                                      |
   * | `unchecked` | Show only the items that have a checkbox and are not checked.                                  |
   * | `caption`   | Show only the items whose `caption` satisfies the regex determinate by the `filter` property.  |
   * | `metadata`  | Show only the items whose `metadata` satisfies the regex determinate by the `filter` property. |
   * | `id-list`   | Show only the items that are contained in the array determinate by the `filterList` property.  |
   * | `none`      | Show all items.                                                                                |
   */
  @Prop() readonly filterType: TreeViewFilterType = "none";
  @Watch("filterType")
  handleFilterTypeChange() {
    this.processFilters();
  }

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings: any;

  /**
   * Callback that is executed when a item request to load its subitems.
   */
  @Prop() readonly lazyLoadTreeItemsCallback: (
    treeItemId: string
  ) => Promise<TreeViewItemModel[]>;

  /**
   * Callback that is executed when a item request to modify its caption.
   */
  @Prop() readonly modifyItemCaptionCallback: (
    treeItemId: string,
    newCaption: string
  ) => Promise<TreeViewOperationStatusModifyCaption>;

  /**
   * Set this attribute if you want to allow multi selection of the items.
   */
  @Prop() readonly multiSelection: boolean = false;

  /**
   * This property allows us to implement custom rendering of tree items.
   */
  @Prop({ mutable: true }) renderItem: (
    itemModel: TreeViewItemModel | any,
    treeState: ChTreeViewRender,
    treeHasFilter: boolean,
    lastItem: boolean,
    level: number
  ) => any = defaultRenderItem;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop() readonly showLines: TreeViewLines = "none";

  /**
   * Callback that is executed when the treeModel is changed to order its items.
   */
  @Prop() readonly sortItemsCallback: (subModel: TreeViewItemModel[]) => void =
    defaultSortItemsCallback;

  /**
   * Set this attribute if you want all the children item's checkboxes to be
   * checked when the parent item checkbox is checked, or to be unchecked when
   * the parent item checkbox is unchecked.
   * This attribute will be used in all items by default.
   */
  @Prop() readonly toggleCheckboxes: boolean = false;

  /**
   * This property lets you define the model of the ch-tree-x control.
   */
  @Prop() readonly treeModel: TreeViewItemModel[] = [];
  @Watch("treeModel")
  handleTreeModelChange() {
    this.flattenModel();
  }

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  /**
   * Fired when the checked items change.
   * This event does not take into account the currently filtered items.
   */
  @Event() checkedItemsChange: EventEmitter<
    Map<string, TreeViewItemModelExtended>
  >;

  /**
   * Fired when an element displays its contextmenu.
   */
  @Event() itemContextmenu: EventEmitter<TreeViewItemContextMenu>;

  /**
   * Fired when the user interacts with an item in a way that its reference
   * must be opened.
   */
  @Event() itemOpenReference: EventEmitter<TreeViewItemOpenReferenceInfo>;

  /**
   * Fired when the selected items change.
   */
  @Event() selectedItemsChange: EventEmitter<
    Map<string, TreeViewItemSelectedInfo>
  >;

  /**
   * Given an item id, an array of items to add, the download status and the
   * lazy state, updates the item's UI Model.
   */
  @Method()
  async loadLazyContent(
    itemId: string,
    items?: TreeViewItemModel[],
    downloading = false,
    lazy = false
  ) {
    const itemToLazyLoadContent = this.flattenedTreeModel.get(itemId).item;

    // Establish that the content was lazy loaded
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

    // Re-sync checked items
    this.emitCheckedItemsChange();

    // Update filters
    this.processFilters();

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

    let visitedNode = itemUIModel.parentItem as TreeViewItemModel;

    // While the parent is not the root, update the UI Models
    while (visitedNode && visitedNode.id != null) {
      // Expand the item
      visitedNode.expanded = true;

      const visitedNodeUIModel = this.flattenedTreeModel.get(visitedNode.id);
      visitedNode = visitedNodeUIModel.parentItem as TreeViewItemModel;
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
  ): Promise<TreeViewItemExpandedInfo[]> {
    if (!treeItemIds) {
      return [];
    }

    const modifiedTreeItems: TreeViewItemExpandedInfo[] = [];

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

    // Update filters
    if (properties.checked != null) {
      this.processFilters();
    }

    forceUpdate(this);
  }

  /**
   * Given a item list and the properties to update, it updates the properties
   * of the items in the list.
   */
  @Method()
  async updateItemsProperties(items: string[], properties: TreeViewItemModel) {
    items.forEach(item => {
      const itemUIModel = this.flattenedTreeModel.get(item);
      this.updateItemProperty(itemUIModel, properties);
    });

    // Update filters
    this.processFilters();

    forceUpdate(this);
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
    this.treeRef.updateValidDropZone(
      requestTimestamp,
      newContainerId,
      draggedItems,
      validDrop
    );
  }

  private updateItemProperty(
    itemUIModel: TreeViewItemModelExtended | undefined,
    properties: TreeViewItemModel
  ) {
    if (!itemUIModel) {
      return;
    }

    const itemInfo = itemUIModel.item;

    Object.keys(properties).forEach(propertyName => {
      itemInfo[propertyName] = properties[propertyName];
    });
  }

  @Listen("checkboxChange")
  @Listen("checkboxToggleChange")
  updateCheckboxValue(
    event: ChTreeViewItemCustomEvent<TreeViewItemCheckedInfo>
  ) {
    event.stopPropagation();

    const detail = event.detail;
    const treeItemId = detail.id;
    const itemUIModel = this.flattenedCheckboxTreeModel.get(treeItemId);

    // In some cases, when the `treeModel` and `checked` properties are updated
    // outside of the tree control, some events are fired with undefined references
    if (!itemUIModel) {
      return;
    }
    const itemInfo = itemUIModel.item;

    itemInfo.checked = detail.checked;
    itemInfo.indeterminate = detail.indeterminate;

    this.emitCheckedItemsChange();

    // Update filters
    if (this.filterType === "checked" || this.filterType === "unchecked") {
      this.processFilters();
    }

    // Force re-render
    forceUpdate(this);
  }

  @Listen("loadLazyContent")
  loadLazyChildrenHandler(event: ChTreeViewItemCustomEvent<string>) {
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
    event: ChTreeViewItemCustomEvent<TreeViewItemNewCaption>
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

        // Update filters
        this.processFilters();

        // Force re-render
        forceUpdate(this);
      } else {
        itemRef.caption = oldCaption;
        itemInfo.caption = oldCaption;

        // Do something with the error message
      }
    });
  }

  @Listen("openReference", { capture: true })
  handleOpenReference(
    event: ChTreeViewItemCustomEvent<TreeViewItemOpenReferenceInfo>
  ) {
    event.stopPropagation();
    this.itemOpenReference.emit(event.detail);
  }

  private handleDroppableZoneEnter = (
    event: ChTreeViewCustomEvent<TreeViewDropCheckInfo>
  ) => {
    if (!this.checkDroppableZoneCallback) {
      return;
    }
    event.stopPropagation();

    // Suppose the request is made immediately by executing the callback
    const requestTimestamp = new Date().getTime();

    const dropInformation = event.detail;
    const promise = this.checkDroppableZoneCallback(dropInformation);

    promise.then(validDrop => {
      this.updateValidDropZone(
        requestTimestamp,
        dropInformation.newContainer.id,
        dropInformation.draggedItems,
        validDrop
      );
    });
  };

  private handleSelectedItemsChange = (
    event: ChTreeViewCustomEvent<Map<string, TreeViewItemSelectedInfo>>
  ) => {
    event.stopPropagation();
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

    this.selectedItemsChange.emit(event.detail);
  };

  private handleExpandedItemChange = (
    event: ChTreeViewCustomEvent<TreeViewItemExpandedInfo>
  ) => {
    const detail = event.detail;
    const itemInfo = this.flattenedTreeModel.get(detail.id).item;
    itemInfo.expanded = detail.expanded;
  };

  private handleItemContextmenu = (
    event: ChTreeViewCustomEvent<TreeViewItemContextMenu>
  ) => {
    event.stopPropagation();
    this.itemContextmenu.emit(event.detail);
  };

  private handleItemsDropped = (
    event: ChTreeViewCustomEvent<TreeViewDataTransferInfo>
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

      // Re-sync checked items
      this.emitCheckedItemsChange();

      // Update filters
      this.processFilters();

      // There is no need to force and update, since the waitDropProcessing
      // prop was modified
    });
  };

  private moveItemToNewParent =
    (newParentUIModel: TreeViewItemModel) =>
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

  private flattenSubModel(model: TreeViewItemModel) {
    const items = model.items;

    if (!items) {
      // Make sure that subtrees don't have an undefined array
      if (model.leaf !== true) {
        model.items = [];
      }
      return;
    }
    this.sortItems(items);

    items.forEach(this.flattenItemUIModel(model));
  }

  private flattenItemUIModel =
    (parentModel: TreeViewItemModel) => (item: TreeViewItemModel) => {
      this.flattenedTreeModel.set(item.id, {
        parentItem: parentModel,
        item: item
      });

      // Add the items that have a checkbox in a separate Map
      if (item.checkbox ?? this.checkbox) {
        this.flattenedCheckboxTreeModel.set(item.id, {
          parentItem: parentModel,
          item: item
        });
      }

      // Make sure the properties are with their default values to avoid issues
      // when reusing DOM nodes
      item.class ||= DEFAULT_CLASS_VALUE;
      item.expanded ??= DEFAULT_EXPANDED_VALUE;
      item.indeterminate ??= DEFAULT_INDETERMINATE_VALUE;
      item.lazy ??= DEFAULT_LAZY_VALUE;
      item.order ??= DEFAULT_ORDER_VALUE;
      item.selected ??= DEFAULT_SELECTED_VALUE;

      if (item.selected) {
        this.selectedItems.add(item.id);
      }

      this.flattenSubModel(item);
    };

  private sortItems(items: TreeViewItemModel[]) {
    // Ensure that items are sorted
    if (this.sortItemsCallback) {
      this.sortItemsCallback(items);
    }
  }

  private flattenModel() {
    this.flattenedTreeModel.clear();
    this.flattenedCheckboxTreeModel.clear();
    this.selectedItems.clear();

    // The model was updated at runtime, so we need to clear the references
    if (this.treeRef) {
      this.treeRef.clearSelectedItemsInfo();
    }

    this.flattenSubModel({ id: null, caption: null, items: this.treeModel });

    // Re-sync checked items
    this.emitCheckedItemsChange();
  }

  private filterSubModel(
    item: TreeViewItemModel,
    filterInfo: TreeViewFilterInfo
  ): boolean {
    let aSubItemIsRendered = false;

    // Check if a subitem is rendered
    if (item.leaf !== true && item.items != null) {
      let lastItemId = "";

      item.items.forEach(subItem => {
        const itemSatisfiesFilter = this.filterSubModel(subItem, filterInfo);
        aSubItemIsRendered ||= itemSatisfiesFilter;

        if (itemSatisfiesFilter) {
          lastItemId = subItem.id;
        }
      });

      item.lastItemId = lastItemId;
    }

    // The current item is rendered if it satisfies the filter condition or a
    // subitem exists that needs to be rendered
    const satisfiesFilter =
      filterDictionary[this.filterType](item, filterInfo) || aSubItemIsRendered;
    item.render = satisfiesFilter; // Update item render

    return satisfiesFilter;
  }

  private emitCheckedItemsChange() {
    this.emitCheckedChange = true;
  }

  private updateCheckedItems() {
    // New copy of the checked items
    const allItemsWithCheckbox: Map<string, TreeViewItemModelExtended> =
      new Map(this.flattenedCheckboxTreeModel);

    // Update the checked value if not defined
    allItemsWithCheckbox.forEach(itemUIModel => {
      itemUIModel.item.checked ??= this.checked;
    });

    this.checkedItemsChange.emit(allItemsWithCheckbox);
  }

  private processFilters() {
    this.applyFilters = true;
  }

  private updateFilters() {
    if (this.filterType === "none") {
      return;
    }

    // Remove queued filter processing
    clearTimeout(this.filterTimeout);

    const processWithDebounce =
      this.filterDebounce > 0 &&
      (this.filterType === "caption" || this.filterType === "metadata");

    const filterFunction = () =>
      this.filterSubModel(
        {
          id: null,
          caption: null,
          items: this.treeModel
        },
        {
          defaultCheckbox: this.checkbox,
          defaultChecked: this.checked,
          filter: this.filter,
          filterList: this.filterList,
          filterOptions: this.filterOptions
        }
      );

    // Check if should filter with debounce
    if (processWithDebounce) {
      this.filterTimeout = setTimeout(() => {
        filterFunction();
        forceUpdate(this); // After the filter processing is completed, force a re-render
      }, this.filterDebounce);
    } else {
      filterFunction();
    }
  }

  componentWillLoad() {
    if (this.useGxRender) {
      this.renderItem = GXRenderItem;
    }

    this.flattenModel();
    this.updateCheckedItems();
    this.updateFilters();
  }

  componentWillUpdate() {
    if (this.emitCheckedChange) {
      this.updateCheckedItems();
      this.emitCheckedChange = false;
    }

    if (this.applyFilters) {
      this.updateFilters();
      this.applyFilters = false;
    }
  }

  render() {
    return (
      <ch-tree-view
        class={this.cssClass || null}
        multiSelection={this.multiSelection}
        waitDropProcessing={this.waitDropProcessing}
        onDroppableZoneEnter={this.handleDroppableZoneEnter}
        onExpandedItemChange={this.handleExpandedItemChange}
        onItemContextmenu={this.handleItemContextmenu}
        onItemsDropped={this.handleItemsDropped}
        onSelectedItemsChange={this.handleSelectedItemsChange}
        ref={el => (this.treeRef = el)}
      >
        {this.treeModel.map((itemModel, index) =>
          this.renderItem(
            itemModel,
            this,
            (this.filterType === "caption" || this.filterType === "metadata") &&
              this.filter != null,
            this.showLines !== "none" && index === this.treeModel.length - 1,
            0
          )
        )}
      </ch-tree-view>
    );
  }
}

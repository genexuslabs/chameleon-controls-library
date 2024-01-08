import {
  Component,
  Event,
  EventEmitter,
  h,
  Prop,
  Listen,
  Method
} from "@stencil/core";
import {
  TreeViewDataTransferInfo,
  TreeViewDropCheckInfo,
  TreeViewItemContextMenu,
  TreeViewItemModel,
  TreeViewLines,
  TreeViewItemExpandedInfo,
  TreeViewItemOpenReferenceInfo,
  TreeViewItemSelectedInfo
} from "../../tree-view/tree-view/types";
import {
  TreeViewFilterOptions,
  TreeViewFilterType,
  TreeViewItemModelExtended,
  TreeViewOperationStatusModifyCaption
} from "../../renders/tree-view/types";
import { ChTreeViewRenderCustomEvent } from "../../../components";
import { GxDataTransferInfo } from "../../../common/types";
import { ChTreeViewRender } from "../../renders/tree-view/tree-view-render";

const DEFAULT_DRAG_DISABLED_VALUE = false;
const DEFAULT_DROP_DISABLED_VALUE = false;
const DEFAULT_EDITABLE_ITEMS_VALUE = true;

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
      expandableButton={itemModel.expandableButton}
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
            treeState.showLines &&
              (treeHasFilter && itemModel.lastItemId !== ""
                ? subModel.id === itemModel.lastItemId
                : index === itemModel.items.length - 1),
            level + 1
          )
        )}
    </ch-tree-view-item>
  );

@Component({
  tag: "ch-tree-view-render-wrapper",
  styleUrl: "tree-view-render-wrapper.scss",
  shadow: false
})
export class ChTreeViewRenderWrapper {
  // Refs
  private treeRef: HTMLChTreeViewRenderElement;

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
  @Prop() readonly cssClass: string;

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
   * Specifies what kind of expandable button is displayed in the items by
   * default.
   *  - `"expandableButton"`: Expandable button that allows to expand/collapse
   *     the items of the control.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @Prop() readonly expandableButton: "action" | "decorative" | "no" =
    "decorative";

  /**
   * This property lets you determine the expression that will be applied to the
   * filter.
   * Only works if `filterType = "caption" | "metadata"`.
   */
  @Prop() readonly filter: string;

  /**
   * This property lets you determine the list of items that will be filtered.
   * Only works if `filterType = "id-list"`.
   */
  @Prop() readonly filterList: string[] = [];

  /**
   * This property lets you determine the options that will be applied to the
   * filter.
   * Only works if `filterType = "caption" | "metadata"`.
   */
  @Prop() readonly filterOptions: TreeViewFilterOptions = {};

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
  @Prop() readonly renderItem: (
    itemModel: TreeViewItemModel,
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
  @Prop() readonly sortItemsCallback: (subModel: TreeViewItemModel[]) => void;

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
    this.treeRef.loadLazyContent(itemId, items, downloading, lazy);
  }

  /**
   * Given an item id, it displays and scrolls into the item view.
   */
  @Method()
  async scrollIntoVisible(treeItemId: string) {
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
    return this.treeRef.toggleItems(treeItemIds, expand);
  }

  /**
   * Given a subset of item's properties, it updates all item UI models.
   */
  @Method()
  async updateAllItemsProperties(properties: {
    expanded?: boolean;
    checked?: boolean;
  }) {
    this.treeRef.updateAllItemsProperties(properties);
  }

  /**
   * Given a item list and the properties to update, it updates the properties
   * of the items in the list.
   */
  @Method()
  async updateItemsProperties(items: string[], properties: TreeViewItemModel) {
    this.treeRef.updateItemsProperties(items, properties);
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

  @Listen("checkedItemsChange")
  updateCheckboxValue(
    event: ChTreeViewRenderCustomEvent<Map<string, TreeViewItemModelExtended>>
  ) {
    event.stopPropagation();
    this.checkedItemsChange.emit(event.detail);
  }

  @Listen("itemOpenReference")
  handleOpenReference(
    event: ChTreeViewRenderCustomEvent<TreeViewItemOpenReferenceInfo>
  ) {
    event.stopPropagation();
    this.itemOpenReference.emit(event.detail);
  }

  render() {
    return (
      <ch-tree-view-render
        checkbox={this.checkbox}
        checked={this.checked}
        checkDroppableZoneCallback={this.checkDroppableZoneCallback}
        cssClass={this.cssClass}
        dragDisabled={this.dragDisabled}
        dropDisabled={this.dropDisabled}
        dropItemsCallback={this.dropItemsCallback}
        editableItems={this.editableItems}
        expandableButton={this.expandableButton}
        filter={this.filter}
        filterList={this.filterList}
        filterOptions={this.filterOptions}
        filterType={this.filterType}
        lazyLoadTreeItemsCallback={this.lazyLoadTreeItemsCallback}
        modifyItemCaptionCallback={this.modifyItemCaptionCallback}
        multiSelection={this.multiSelection}
        renderItem={this.renderItem}
        showLines={this.showLines}
        sortItemsCallback={this.sortItemsCallback}
        toggleCheckboxes={this.toggleCheckboxes}
        treeModel={this.treeModel}
        ref={el => (this.treeRef = el)}
      ></ch-tree-view-render>
    );
  }
}

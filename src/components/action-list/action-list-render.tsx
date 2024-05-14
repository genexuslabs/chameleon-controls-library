import { Component, Element, Host, h, Prop, State } from "@stencil/core";
import {
  ActionListItemModel,
  ActionListItemModelMap,
  ActionListItemType,
  ActionListModel
} from "./types";

const DEFAULT_EDITABLE_ITEMS_VALUE = true;
// const DEFAULT_ORDER_VALUE = 0;

// const defaultGetImagePath: ActionListImagePathCallback = (imgSrc: string) =>
//   imgSrc;

const renderMapping: {
  [key in ActionListItemType]: (
    itemModel: ActionListItemModelMap[key],
    actionRenderState: ChActionListRender
  ) => any;
} = {
  actionable: (itemModel, actionListRenderState) => (
    <ch-action-list-item
      key={itemModel.id}
      id={itemModel.id}
      additionalInfo={itemModel.additionalInformation}
      caption={itemModel.caption}
      checkbox={itemModel.checkbox ?? actionListRenderState.checkbox}
      checked={itemModel.checked ?? actionListRenderState.checked}
      disabled={itemModel.disabled}
      editable={itemModel.editable ?? actionListRenderState.editableItems}
      metadata={itemModel.metadata}
      selected={itemModel.selected}
    ></ch-action-list-item>
  ),
  heading: () => {},
  separator: () => {}
};

const defaultRenderItem = (
  itemModel: ActionListItemModel,
  actionListRenderState: ChActionListRender
) =>
  renderMapping[itemModel.type](
    itemModel as any, // THIS IS A WA
    actionListRenderState
  );

const defaultSortItemsCallback = (subModel: ActionListItemModel[]): void => {
  subModel.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    }

    if (a.order > b.order) {
      return 0;
    }

    return a.type === "actionable" &&
      b.type === "actionable" &&
      a.caption <= b.caption
      ? -1
      : 0;
  });
};

// type ImmediateFilter = "immediate" | "debounced" | undefined;

@Component({
  tag: "ch-action-list-render",
  styleUrl: "action-list-render.scss",
  shadow: true
})
export class ChActionListRender {
  @Element() el: HTMLChActionListRenderElement;

  @State() expanded: boolean = true;

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
   * This attribute lets you specify if the edit operation is enabled in all
   * items by default. If `true`, the items can edit its caption in place.
   */
  @Prop() readonly editableItems: boolean = DEFAULT_EDITABLE_ITEMS_VALUE;

  /**
   * This property lets you define the model of the control.
   */
  @Prop() readonly model: ActionListModel = [];

  // /**
  //  * This property lets you determine the expression that will be applied to the
  //  * filter.
  //  * Only works if `filterType = "caption" | "metadata"`.
  //  */
  // @Prop() readonly filter: string;
  // @Watch("filter")
  // filterChanged() {
  //   if (this.filterType === "caption" || this.filterType === "metadata") {
  //     this.#scheduleFilterProcessing();
  //   }
  // }

  // /**
  //  * This property lets you determine the debounce time (in ms) that the
  //  * control waits until it processes the changes to the filter property.
  //  * Consecutive changes to the `filter` property between this range, reset the
  //  * timeout to process the filter.
  //  * Only works if `filterType = "caption" | "metadata"`.
  //  */
  // @Prop() readonly filterDebounce: number = 250;
  // @Watch("filterDebounce")
  // filterDebounceChanged() {
  //   if (this.filterType === "caption" || this.filterType === "metadata") {
  //     this.#scheduleFilterProcessing();
  //   }
  // }

  // /**
  //  * This property lets you determine the list of items that will be filtered.
  //  * Only works if `filterType = "list"`.
  //  */
  // @Prop() readonly filterList: string[] = [];
  // @Watch("filterList")
  // filterListChanged() {
  //   // Use a Set to efficiently check for ids
  //   this.#filterListAsSet = new Set(this.filterList);

  //   if (this.filterType === "list") {
  //     this.#scheduleFilterProcessing();
  //   }
  // }

  // /**
  //  * This property lets you determine the options that will be applied to the
  //  * filter.
  //  */
  // @Prop() readonly filterOptions: TreeViewFilterOptions = {};
  // @Watch("filterOptions")
  // filterOptionsChanged() {
  //   this.#scheduleFilterProcessing();
  // }

  // /**
  //  * This attribute lets you define what kind of filter is applied to items.
  //  * Only items that satisfy the filter predicate will be displayed.
  //  *
  //  * | Value       | Details                                                                                        |
  //  * | ----------- | ---------------------------------------------------------------------------------------------- |
  //  * | `checked`   | Show only the items that have a checkbox and are checked.                                      |
  //  * | `unchecked` | Show only the items that have a checkbox and are not checked.                                  |
  //  * | `caption`   | Show only the items whose `caption` satisfies the regex determinate by the `filter` property.  |
  //  * | `metadata`  | Show only the items whose `metadata` satisfies the regex determinate by the `filter` property. |
  //  * | `list`      | Show only the items that are contained in the array determinate by the `filterList` property.  |
  //  * | `none`      | Show all items.                                                                                |
  //  */
  // @Prop() readonly filterType: TreeViewFilterType = "none";
  // @Watch("filterType")
  // filterTypeChanged() {
  //   this.#scheduleFilterProcessing();
  // }

  // /**
  //  * This property specifies a callback that is executed when the path for an
  //  * item image needs to be resolved. With this callback, there is no need to
  //  * re-implement item rendering (`renderItem` property) just to change the
  //  * path used for the images.
  //  */
  // @Prop() readonly getImagePathCallback: TreeViewImagePathCallback =
  //   defaultGetImagePath;

  // /**
  //  * Callback that is executed when a item request to modify its caption.
  //  */
  // @Prop() readonly modifyItemCaptionCallback: (
  //   treeItemId: string,
  //   newCaption: string
  // ) => Promise<TreeViewOperationStatusModifyCaption>;

  // /**
  //  * Set this attribute if you want to allow multi selection of the items.
  //  */
  // @Prop() readonly multiSelection: boolean = false;
  // @Watch("multiSelection")
  // multiSelectionChanged(newMultiSelection: boolean) {
  //   // MultiSelection is disabled. We must select the last updated item
  //   if (!newMultiSelection) {
  //     this.#removeAllSelectedItemsExceptForTheLast(this.#selectedItems);
  //   }
  // }

  /**
   * This property allows us to implement custom rendering of tree items.
   */
  @Prop() readonly renderItem: (
    itemModel: ActionListItemModel,
    actionListRenderState: ChActionListRender
  ) => any = defaultRenderItem;

  /**
   * Callback that is executed when the treeModel is changed to order its items.
   */
  @Prop() readonly sortItemsCallback: (subModel: ActionListModel) => void =
    defaultSortItemsCallback;

  // /**
  //  * Fired when the checked items change.
  //  * This event does take into account the currently filtered items.
  //  */
  // @Event() checkedItemsChange: EventEmitter<
  //   Map<string, TreeViewItemModelExtended>
  // >;

  // /**
  //  * Fired when an element displays its contextmenu.
  //  */
  // @Event() itemContextmenu: EventEmitter<TreeViewItemContextMenu>;

  /**
   * Fired when the selected items change.
   * This event can be fired by the following conditions:
   *   1. A user changes the selected items interacting with the Tree View.
   *
   *   2. The `multiSelection` value is changed from `true` to `false`.
   *
   *   3. A selected item is no longer rendered because it does not satisfies a
   *      filter condition.
   *
   *   4. TODO: The `treeModel` property is updated and contains different selected
   *      items. Even if it does not contains different selected items, this
   *      event is fired because the selected items can have a different path
   *      than before the `treeModel` update.
   *
   *   5. The `updateItemsProperties` method is executed, changing the item
   *      selection.
   *
   *   6. A selected item is removed.
   *
   *   7. TODO: A selected item is moved into a new parent with drag and drop.
   *      In this case, since the detail of the event contains the information
   *      of the parent, this event must be fired to update the information.
   *
   *   8. Executing `scrollIntoVisible` method and updating the selected value
   *      of the scrolled item.
   *
   *   9. TODO: An external item is dropped into the Tree View and the item is
   *      selected.
   *
   *  10. TODO: Lazy loading content that has selected items?
   *
   * Thing that does not fire this event:
   *   - TODO: Renaming a selected item.
   *
   *   - TODO: Applying a filter that keeps all selected items rendered.
   */
  // @Event() selectedItemsChange: EventEmitter<TreeViewItemModelExtended[]>;

  render() {
    return <Host>{this.model?.map(item => this.renderItem(item, this))}</Host>;
    // return (
    //   <ch-tree-view
    //     class={this.cssClass || null}
    //     multiSelection={this.multiSelection}
    //     selectedItemsCallback={this.#getSelectedItemsCallback}
    //     waitDropProcessing={this.waitDropProcessing}
    //     onDroppableZoneEnter={this.#handleDroppableZoneEnter}
    //     onExpandedItemChange={this.#handleExpandedItemChange}
    //     onItemContextmenu={this.#handleItemContextmenu}
    //     onItemsDropped={this.#handleItemsDropped}
    //     onSelectedItemsChange={this.#handleSelectedItemsChange}
    //     ref={el => (this.#treeRef = el)}
    //   >
    //     {this.treeModel.map((itemModel, index) =>
    //       this.renderItem(
    //         itemModel,
    //         this,
    //         this.#treeHasFilters(),
    //         this.showLines !== "none" && index === this.treeModel.length - 1,
    //         0,
    //         this.dropMode !== "above" && this.dropDisabled !== true,
    //         this.useGxRender
    //       )
    //     )}
    //   </ch-tree-view>
    // );
  }
}

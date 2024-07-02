import {
  Component,
  Element,
  Host,
  h,
  Prop,
  State,
  Listen,
  Watch,
  forceUpdate,
  Event,
  EventEmitter,
  Method
  // EventEmitter
} from "@stencil/core";
import {
  ActionListItemActionable,
  ActionListItemGroup,
  ActionListItemModel,
  ActionListItemModelExtended,
  ActionListItemModelExtendedGroup,
  ActionListItemModelExtendedRoot,
  ActionListItemModelMap,
  ActionListItemType,
  ActionListModel
} from "./types";
import { ChActionListItemCustomEvent } from "../../components";
import { ActionListFixedChangeEventDetail } from "./internal/action-list-item/types";
import { removeElement } from "../../common/array";
import { mouseEventModifierKey } from "../common/helpers";
import { actionListKeyboardNavigation } from "./keyboard-navigation";
import { getActionListOrGroupItemFromEvent } from "./utils";

const DEFAULT_EDITABLE_ITEMS_VALUE = true;
// const DEFAULT_ORDER_VALUE = 0;

// const defaultGetImagePath: ActionListImagePathCallback = (imgSrc: string) =>
//   imgSrc;

const renderMapping: {
  [key in ActionListItemType]: (
    itemModel: ActionListItemModelMap[key],
    actionRenderState: ChActionListRender,
    disabled?: boolean,
    nested?: boolean,
    nestedExpandable?: boolean
  ) => any;
} = {
  actionable: (
    itemModel,
    actionListRenderState,
    disabled: boolean,
    nested = false,
    nestedExpandable = false
  ) => (
    <ch-action-list-item
      key={itemModel.id}
      id={itemModel.id}
      additionalInfo={itemModel.additionalInformation}
      caption={itemModel.caption}
      checkbox={itemModel.checkbox ?? actionListRenderState.checkbox}
      checked={itemModel.checked ?? actionListRenderState.checked}
      disabled={disabled === true ? true : itemModel.disabled}
      editable={itemModel.editable ?? actionListRenderState.editableItems}
      fixed={itemModel.fixed}
      metadata={itemModel.metadata}
      nested={nested}
      nestedExpandable={nestedExpandable}
      selectable={actionListRenderState.selection !== "none"}
      selected={itemModel.selected}
    ></ch-action-list-item>
  ),
  group: (itemModel, actionRenderState) => (
    <ch-action-list-group
      key={itemModel.id}
      id={itemModel.id}
      caption={itemModel.caption}
      disabled={itemModel.disabled}
      expandable={itemModel.expandable}
      expanded={itemModel.expanded}
      selected={itemModel.selected}
    >
      {itemModel.items?.map(item =>
        actionRenderState.renderItem(
          item,
          actionRenderState,
          itemModel.disabled,
          true,
          itemModel.expandable
        )
      )}
    </ch-action-list-group>
  ),
  separator: () => (
    <div
      role="separator"
      aria-hidden="true"
      class="separator"
      part="separator"
    ></div>
  )
};

const defaultRenderItem = (
  itemModel: ActionListItemModel,
  actionListRenderState: ChActionListRender,
  disabled?: boolean,
  nested?: boolean,
  nestedExpandable?: boolean
) =>
  itemModel.type === "actionable"
    ? renderMapping.actionable(
        itemModel as any, // THIS IS A WA
        actionListRenderState,
        disabled,
        nested,
        nestedExpandable
      )
    : renderMapping[itemModel.type](
        itemModel as any, // THIS IS A WA
        actionListRenderState
      );

const FIRST_ITEM_GREATER_THAN_SECOND = -1;
const SECOND_ITEM_GREATER_THAN_FIRST = 0;

const defaultSortItemsCallback = (subModel: ActionListItemModel[]): void => {
  subModel.sort((a, b) => {
    // Rules:
    //   - Checks fixed value.
    //   - If can't decide, checks "order" value.
    //   - If can't decide, checks "caption" value.

    // Both, "a" and "b" are fixed
    if (a.type === "actionable" && b.type === "actionable") {
      if (a.fixed && !b.fixed) {
        return FIRST_ITEM_GREATER_THAN_SECOND;
      }

      if (!a.fixed && b.fixed) {
        return SECOND_ITEM_GREATER_THAN_FIRST;
      }
    }
    // Only "a" is fixed
    else if (a.type === "actionable" && a.fixed) {
      return FIRST_ITEM_GREATER_THAN_SECOND;
    }
    // Only "b" is fixed
    else if (b.type === "actionable" && b.fixed) {
      return SECOND_ITEM_GREATER_THAN_FIRST;
    }

    if (a.order < b.order) {
      return FIRST_ITEM_GREATER_THAN_SECOND;
    }

    if (a.order > b.order) {
      return SECOND_ITEM_GREATER_THAN_FIRST;
    }

    return a.type === "actionable" &&
      b.type === "actionable" &&
      a.caption <= b.caption
      ? FIRST_ITEM_GREATER_THAN_SECOND
      : SECOND_ITEM_GREATER_THAN_FIRST;
  });
};

// type ImmediateFilter = "immediate" | "debounced" | undefined;

@Component({
  tag: "ch-action-list-render",
  styleUrl: "action-list-render.scss",
  shadow: true
})
export class ChActionListRender {
  #flattenedModel: Map<string, ActionListItemModelExtended> = new Map();
  // #additionalItemsParts: Set<string> | undefined;
  #selectedItems: Set<string> | undefined;

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
  @Watch("model")
  modelChanged(newModel: ActionListModel) {
    this.#flattenUIModel(newModel);
  }

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
    actionListRenderState: ChActionListRender,
    disabled?: boolean,
    nested?: boolean,
    nestedExpandable?: boolean
  ) => any = defaultRenderItem;

  /**
   * Callback that is executed when and item requests to be removed.
   * If the callback is not defined, the item will be removed without further
   * confirmation.
   */
  @Prop() readonly removeItemCallback?: (
    itemInfo: ActionListItemActionable
  ) => Promise<boolean>;

  /**
   * Specifies the type of selection implemented by the control.
   */
  @Prop() readonly selection: "single" | "multiple" | "none" = "none";
  @Watch("selection")
  selectionChanged(newValue: "single" | "multiple" | "none") {
    if (newValue === "none") {
      this.#removeAllSelectedItems();
      this.#selectedItems = undefined;
    }
    // Create the set to allocate the selected items, if necessary
    else {
      this.#selectedItems ??= new Set();

      if (newValue === "single") {
        this.#removeAllSelectedItemsExceptForTheLast(this.#selectedItems);
      }
    }
  }

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

  /**
   * Fired when the selected items change and `selection !== "none"`
   */
  @Event() selectedItemsChange: EventEmitter<ActionListItemModelExtended[]>;

  /**
   * Fired when an item is clicked and `selection === "none"`.
   */
  @Event() itemClick: EventEmitter<ActionListItemModelExtended>;

  /**
   * Given a list of ids, it returns an array of the items that exists in the
   * given list.
   */
  @Method()
  async getItemsInfo(
    itemsId: string[]
  ): Promise<ActionListItemModelExtended[]> {
    return this.#getItemsInfo(itemsId);
  }

  /**
   * Remove the item and all its descendants from the control.
   */
  @Method()
  async removeItem(itemId: string) {
    const itemUIModel = this.#flattenedModel.get(itemId);

    if (!itemUIModel) {
      return;
    }

    // Remove all descendants
    if (itemUIModel.item.type === "group") {
      const items = itemUIModel.item.items;

      items.forEach(item => {
        this.#flattenedModel.delete(item.id);
      });
    }

    this.#removeItem(itemUIModel);
  }

  #getItemsInfo = (itemsId: string[]): ActionListItemModelExtended[] => {
    const actionListItemsInfo: ActionListItemModelExtended[] = [];

    itemsId.forEach(itemId => {
      const itemUIModel = this.#flattenedModel.get(itemId);

      if (itemUIModel) {
        actionListItemsInfo.push(itemUIModel);
      }
    });

    return actionListItemsInfo;
  };

  @Listen("fixedChange")
  onFixedChange(
    event: ChActionListItemCustomEvent<ActionListFixedChangeEventDetail>
  ) {
    const detail = event.detail;

    const itemUIModel = this.#flattenedModel.get(detail.itemId);
    const itemInfo = itemUIModel.item as ActionListItemActionable;
    itemInfo.fixed = detail.value;

    // Sort items in parent model
    this.#sortModel(
      (itemUIModel as ActionListItemModelExtendedRoot).root ??
        (itemUIModel as ActionListItemModelExtendedGroup).parentItem.items
    );

    // Queue a re-render to update the fixed binding and the order of the items
    forceUpdate(this);
  }

  @Listen("remove")
  onRemove(event: ChActionListItemCustomEvent<string>) {
    const itemUIModel = this.#flattenedModel.get(event.detail);

    if (!this.removeItemCallback) {
      this.#removeItem(itemUIModel);

      return;
    }

    this.removeItemCallback(itemUIModel.item as ActionListItemActionable).then(
      acceptRemove => {
        if (acceptRemove) {
          this.#removeItem(itemUIModel);
        }
      }
    );
  }

  #getItemOrGroupInfo = (itemId: string) =>
    this.#flattenedModel.get(itemId).item as
      | ActionListItemActionable
      | ActionListItemGroup;

  #removeAllSelectedItemsExceptForTheLast = (
    currentSelectedItems: Set<string>
  ) => {
    if (currentSelectedItems.size > 1) {
      const selectedItemsArray = [...currentSelectedItems.values()];
      const lastItemIndex = currentSelectedItems.size - 1;

      // Deselect all items except the last
      for (let index = 0; index < lastItemIndex; index++) {
        const itemId = selectedItemsArray[index];

        this.#getItemOrGroupInfo(itemId).selected = false;
      }

      // Create a new Set with only the last item
      currentSelectedItems.clear();
      currentSelectedItems.add(selectedItemsArray[lastItemIndex]);

      forceUpdate(this);
      this.#emitSelectedItemsChange();
      // this.#scheduleSelectedItemsChange();
    }
  };

  #removeAllSelectedItems = () => {
    this.#selectedItems.forEach(selectedItemId => {
      const selectedItemInfo = this.#getItemOrGroupInfo(selectedItemId);
      selectedItemInfo.selected = false;
    });

    this.#selectedItems.clear();
  };

  #handleItemClick = (event: PointerEvent) => {
    const actionListItemOrGroup = getActionListOrGroupItemFromEvent(event);

    if (!actionListItemOrGroup) {
      return;
    }
    const itemInfo = this.#getItemOrGroupInfo(actionListItemOrGroup.id);
    this.#checkIfMustExpandCollapseGroup(itemInfo);

    this.itemClick.emit(this.#flattenedModel.get(itemInfo.id));
  };

  #checkIfMustExpandCollapseGroup = (
    itemInfo: ActionListItemActionable | ActionListItemGroup
  ) => {
    // Toggle the expanded/collapsed in the group on click
    if (
      itemInfo.type === "group" &&
      itemInfo.expandable &&
      !itemInfo.disabled
    ) {
      itemInfo.expanded = !itemInfo.expanded;
      forceUpdate(this);
    }
  };

  #handleItemSelection = (event: PointerEvent) => {
    const actionListItemOrGroup = getActionListOrGroupItemFromEvent(event);

    if (!actionListItemOrGroup) {
      return;
    }
    const itemId = actionListItemOrGroup.id;
    const itemInfo = this.#getItemOrGroupInfo(itemId);

    const ctrlKeyIsPressed = mouseEventModifierKey(event);
    const itemWasSelected = this.#selectedItems.has(itemId);
    const singleSelectionMode = this.selection === "single";

    // - - - - - - - - - - Single selection - - - - - - - - - -
    if (singleSelectionMode) {
      if (!ctrlKeyIsPressed) {
        this.#checkIfMustExpandCollapseGroup(itemInfo);
      }

      // Nothing to update in the UI
      if (itemWasSelected && !ctrlKeyIsPressed) {
        return;
      }
      const previousSelectedItemId: string | undefined = [
        ...this.#selectedItems.keys()
      ][0];

      // Remove the previous selected item
      if (previousSelectedItemId) {
        this.#selectedItems.clear();

        const previousSelectedItemInfo = this.#getItemOrGroupInfo(
          previousSelectedItemId
        );
        previousSelectedItemInfo.selected = false;
      }

      // If the item was not selected, add it to the Set. If the item was
      // selected, the previous if removes the item
      if (!itemWasSelected) {
        this.#selectedItems.add(itemId);
      }

      itemInfo.selected = !itemWasSelected;
      this.#emitSelectedItemsChange();
      forceUpdate(this);
      return;
    }

    // - - - - - - - - - - Multiple selection - - - - - - - - - -
    if (ctrlKeyIsPressed) {
      // The item was selected, deselect the item
      if (itemWasSelected) {
        this.#selectedItems.delete(itemId);
      }
      // Otherwise, select the item
      else {
        this.#selectedItems.add(itemId);
      }

      itemInfo.selected = !itemWasSelected;
    } else {
      this.#checkIfMustExpandCollapseGroup(itemInfo);

      // Remove the selection from all items
      this.#removeAllSelectedItems();

      this.#selectedItems.add(itemId);
      itemInfo.selected = true;
    }

    this.#emitSelectedItemsChange();
    forceUpdate(this);
  };

  #emitSelectedItemsChange = () => {
    const selectedItemsInfo = this.#getItemsInfo([
      ...this.#selectedItems.keys()
    ]);
    this.selectedItemsChange.emit(selectedItemsInfo);
  };

  #removeItem = (itemUIModel: ActionListItemModelExtended) => {
    const parentArray =
      (itemUIModel as ActionListItemModelExtendedRoot).root ??
      (itemUIModel as ActionListItemModelExtendedGroup).parentItem.items;
    const itemToRemoveId = itemUIModel.item.id;

    const itemToRemoveIndex = parentArray.findIndex(
      el => el.id === itemToRemoveId
    );

    // Remove the UI model from the previous parent. The equality function
    // must be by index, not by object reference
    removeElement(parentArray, itemToRemoveIndex);

    this.#flattenedModel.delete(itemToRemoveId);

    // Queue a re-render
    forceUpdate(this);
  };

  #sortModel = (model: ActionListModel) => {
    if (this.sortItemsCallback) {
      this.sortItemsCallback(model);
    }
  };

  #flattenUIModel = (model: ActionListModel) => {
    this.#flattenedModel.clear();

    if (!model) {
      return;
    }

    // Traditional for loop is the faster "for"
    for (let index = 0; index < model.length; index++) {
      const itemInfo = model[index];

      // Group
      if (itemInfo.type === "group") {
        this.#flattenedModel.set(itemInfo.id, { item: itemInfo, root: model });
        this.#flattenSubUIModel(itemInfo.items, itemInfo);
      }
      // Actionable
      else if (itemInfo.type === "actionable") {
        this.#flattenedModel.set(itemInfo.id, { item: itemInfo, root: model });
      }
    }

    this.#sortModel(model);
  };

  #flattenSubUIModel = (
    model: ActionListItemActionable[],
    parentItem: ActionListItemGroup
  ) => {
    if (!model) {
      return;
    }

    // Traditional for loop is the faster "for"
    for (let index = 0; index < model.length; index++) {
      const itemInfo = model[index];
      this.#flattenedModel.set(itemInfo.id, {
        item: itemInfo,
        parentItem: parentItem
      });
    }

    this.#sortModel(model);
  };

  // #processAdditionalItemParts = () => {
  //   this.#additionalItemsParts = undefined;

  //   this.#additionalItemsParts ??= new Set();
  // }

  connectedCallback() {
    this.#flattenUIModel(this.model);
  }

  render() {
    return (
      <Host
        aria-multiselectable={this.selection === "multiple" ? "true" : null}
        onClick={
          this.selection === "none"
            ? this.#handleItemClick
            : this.#handleItemSelection
        }
        onKeyDown={actionListKeyboardNavigation(this.el, this.#flattenedModel)}
      >
        {this.model?.map(item =>
          this.renderItem(item, this, false, false, false)
        )}
      </Host>
    );
  }
}

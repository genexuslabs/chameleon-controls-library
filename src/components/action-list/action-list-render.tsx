import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  // EventEmitter
  Prop,
  State,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import { removeElement } from "../../common/array";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { adoptCommonThemes } from "../../common/theme";
import {
  ActionListTranslations,
  ChActionListItemCustomEvent
} from "../../components";
import { mouseEventModifierKey } from "../common/helpers";
import { flattenActionListUIModel } from "./flatten-model";
import {
  ActionListCaptionChangeEventDetail,
  ActionListFixedChangeEventDetail
} from "./internal/action-list-item/types";
import { actionListKeyboardNavigation } from "./keyboard-navigation";
import {
  selectedItemsChangeShouldBeEmitted,
  setActionListSelectedItems
} from "./selections";
import { actionListDefaultTranslations } from "./translations";
import {
  ActionListImagePathCallback,
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
import { updateItemProperty } from "./update-item-property";
import {
  ACTION_LIST_ITEM_TAG,
  getActionListItemOrGroupInfo,
  getActionListOrGroupItemFromEvent,
  getParentArray
} from "./utils";

const DEFAULT_EDITABLE_ITEMS_VALUE = true;
// const DEFAULT_ORDER_VALUE = 0;

// const defaultGetImagePath: ActionListImagePathCallback = (imgSrc: string) =>
//   imgSrc;

const renderMapping: {
  [key in ActionListItemType]: (
    itemModel: ActionListItemModelMap[key],
    actionRenderState: ChActionListRender,
    disabled?: boolean,
    nested?: boolean, // TODO: Verify if this is necessary
    nestedExpandable?: boolean
  ) => any;
} = {
  actionable: (
    itemModel,
    actionListRenderState,
    disabled: boolean,
    nested: boolean,
    nestedExpandable: boolean = false
  ) => (
    <ch-action-list-item
      key={itemModel.id}
      id={itemModel.id}
      additionalInfo={itemModel.additionalInformation}
      caption={itemModel.caption}
      checkbox={itemModel.checkbox ?? actionListRenderState.checkbox}
      checked={itemModel.checked ?? actionListRenderState.checked}
      disabled={
        disabled === true
          ? true
          : itemModel.disabled ?? actionListRenderState.disabled
      }
      editable={itemModel.editable ?? actionListRenderState.editableItems}
      expandable={itemModel.expandable}
      expanded={itemModel.expanded}
      fixed={itemModel.fixed}
      getImagePathCallback={actionListRenderState.getImagePathCallback}
      metadata={itemModel.metadata}
      nested={nested ?? false}
      nestedExpandable={nestedExpandable ?? false}
      selectable={actionListRenderState.selection !== "none"}
      selected={itemModel.selected}
      translations={actionListRenderState.translations}
    >
      {itemModel.items?.map(item =>
        actionListRenderState.renderItem(
          item,
          actionListRenderState,
          disabled,
          true,
          itemModel.expandable
        )
      )}
    </ch-action-list-item>
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
  nested?: boolean
) => {
  if (itemModel.type === "separator") {
    return renderMapping.separator(itemModel as any, actionListRenderState);
  }

  return renderMapping.actionable(
    itemModel as any, // THIS IS A WA
    actionListRenderState,
    disabled,
    nested
  );
};

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

@Component({
  tag: "ch-action-list-render",
  styleUrl: "action-list-render.scss",
  shadow: true
})
export class ChActionListRender {
  #flattenedModel: Map<string, ActionListItemModelExtended> = new Map();
  // #additionalItemsParts: Set<string> | undefined;
  #selectedItems: Set<string> | undefined = undefined;

  #shouldUpdateModelAndSelection = false;

  @Element() el: HTMLChActionListRenderElement;

  @State() expanded: boolean = true;

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
   * This attribute lets you specify if all items are disabled.
   * If disabled, action list items will not fire any user interaction related
   * event (for example, `selectedItemsChange` event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This attribute lets you specify if the edit operation is enabled in all
   * items by default. If `true`, the items can edit its caption in place.
   */
  @Prop() readonly editableItems: boolean = DEFAULT_EDITABLE_ITEMS_VALUE;

  /**
   * Callback that is executed when and item requests to be fixed/unfixed.
   * If the callback is not defined, the item will be fixed/unfixed without
   * further confirmation.
   */
  @Prop() readonly fixItemCallback?: (
    itemInfo: ActionListItemActionable,
    newFixedValue: boolean
  ) => Promise<boolean>;

  /**
   * This property specifies a callback that is executed when the path for an
   * imgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: ActionListImagePathCallback;

  /**
   * This property lets you define the model of the control.
   */
  @Prop() readonly model: ActionListModel = [];
  @Watch("model")
  modelChanged() {
    this.#shouldUpdateModelAndSelection = true;
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

  /**
   * Callback that is executed when a item request to modify its caption.
   */
  @Prop() readonly modifyItemCaptionCallback: (
    actionListItemId: string,
    newCaption: string
  ) => Promise<void>;

  /**
   * This property allows us to implement custom rendering of action-list items.
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
  selectionChanged() {
    this.#shouldUpdateModelAndSelection = true;
  }

  /**
   * Callback that is executed when the action-list model is changed to order its items.
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
   * Specifies the literals required for the control.
   */
  @Prop() readonly translations: ActionListTranslations =
    actionListDefaultTranslations;

  /**
   * Fired when the selected items change and `selection !== "none"`
   */
  @Event() selectedItemsChange: EventEmitter<ActionListItemModelExtended[]>;

  /**
   * Fired when an item is clicked and `selection === "none"`.
   * Applies for items that have `type === "actionable"` or
   * (`type === "group"` and `expandable === true`)
   */
  @Event() itemClick: EventEmitter<ActionListItemModelExtended>;

  /**
   * Adds an item in the control.
   *
   * If the item already exists, the operation is canceled.
   *
   * If the `groupParentId` property is specified the item is added in the
   * group determined by `groupParentId`. It only works if the item to add
   * has `type === "actionable"`
   */
  @Method()
  async addItem(
    itemInfo: ActionListItemModel,
    groupParentId?: string
  ): Promise<void> {
    // Already exists
    if (this.#flattenedModel.get(itemInfo.id)) {
      return;
    }

    if (groupParentId) {
      const parentGroup = this.#flattenedModel.get(groupParentId);

      // The parent group does not exists or it isn't a group
      if (
        !parentGroup ||
        parentGroup.item.type !== "group" ||
        itemInfo.type !== "actionable"
      ) {
        return;
      }

      parentGroup.item.items.push(itemInfo);
      this.#flattenedModel.set(itemInfo.id, {
        item: itemInfo,
        parentItem: parentGroup.item
      });

      // Sort items in parent model
      this.#sortModel(parentGroup.item.items);
    }
    // Item is placed at the root
    else {
      this.model.push(itemInfo);
      this.#flattenedModel.set(itemInfo.id, {
        item: itemInfo,
        root: this.model
      });

      // Sort items in parent model
      this.#sortModel(this.model);
    }

    forceUpdate(this);
  }

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

  /**
   * Given an itemId and the properties to update, it updates the properties
   * of the items in the list.
   */
  @Method()
  async updateItemProperties(
    itemId: string,
    properties: Partial<ActionListItemModel> & { type: ActionListItemType }
  ) {
    // Set to check if there are new selected items
    const newSelectedItems = new Set(this.#selectedItems);

    const parentArray = updateItemProperty(
      itemId,
      properties,
      this.#flattenedModel,
      newSelectedItems
    );

    if (parentArray !== undefined) {
      this.#sortModel(parentArray);
    }

    if (
      selectedItemsChangeShouldBeEmitted(
        this.#selectedItems,
        newSelectedItems,
        this.#flattenedModel,
        this.selection
      )
    ) {
      this.#selectedItems = newSelectedItems;
      this.#emitSelectedItemsChange();
    }

    forceUpdate(this);
  }

  @Listen("captionChange")
  onCaptionChange(
    event: ChActionListItemCustomEvent<ActionListCaptionChangeEventDetail>
  ) {
    if (!this.modifyItemCaptionCallback) {
      return;
    }
    event.stopPropagation();

    const itemRef = event
      .composedPath()
      .find(
        el =>
          (el as HTMLElement).tagName &&
          (el as HTMLElement).tagName?.toLowerCase() === ACTION_LIST_ITEM_TAG
      ) as HTMLChActionListItemElement;
    if (!itemRef) {
      return;
    }

    const itemId = event.detail.itemId;
    const itemUIModel = this.#flattenedModel.get(itemId);
    const itemInfo = itemUIModel.item as ActionListItemActionable;
    const newCaption = event.detail.newCaption;
    const oldCaption = itemInfo.caption;

    // Optimistic UI: Update the caption in the UI Model before the change is
    // completed in the server
    itemInfo.caption = newCaption;
    itemRef.caption = newCaption;

    this.modifyItemCaptionCallback(itemId, newCaption)
      .then(() => {
        // Sort items in parent model
        this.#sortModel(getParentArray(itemUIModel));

        // Update filters
        // this.#scheduleFilterProcessing();

        // Force re-render
        forceUpdate(this);
      })
      .catch(() => {
        // TODO: Should we do something with the error message?
        itemRef.caption = oldCaption;
        itemInfo.caption = oldCaption;
      });
  }

  @Listen("fixedChange")
  onFixedChange(
    event: ChActionListItemCustomEvent<ActionListFixedChangeEventDetail>
  ) {
    const detail = event.detail;

    const itemUIModel = this.#flattenedModel.get(detail.itemId);
    const itemInfo = itemUIModel.item as ActionListItemActionable;

    if (!this.fixItemCallback) {
      this.#updateItemFix(itemUIModel, itemInfo, detail.value);
      return;
    }

    this.fixItemCallback(itemInfo, detail.value).then(acceptChange => {
      if (acceptChange) {
        this.#updateItemFix(itemUIModel, itemInfo, detail.value);
      }
    });
  }

  #updateItemFix = (
    itemUIModel: ActionListItemModelExtended,
    itemInfo: ActionListItemActionable,
    newFixedValue: boolean
  ) => {
    itemInfo.fixed = newFixedValue;

    // Sort items in parent model
    this.#sortModel(getParentArray(itemUIModel));

    // Queue a re-render to update the fixed binding and the order of the items
    forceUpdate(this);
  };

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
    getActionListItemOrGroupInfo(itemId, this.#flattenedModel);

  #updateAndEmitSelectedItems = (selection: "single" | "multiple" | "none") => {
    if (selection === "none") {
      this.#removeAllSelectedItems();
      this.#selectedItems = undefined;
    }
    // Create the set to allocate the selected items, if necessary
    else {
      // First render. Do not check to emit selectedItemsChange event.
      if (!this.#selectedItems) {
        this.#selectedItems = new Set();

        // TODO: Add a unit test for "?? []"
        setActionListSelectedItems(this.model ?? [], this.#selectedItems);
        return;
      }

      const newSelectedItems = new Set<string>();
      setActionListSelectedItems(this.model ?? [], newSelectedItems);

      if (
        selectedItemsChangeShouldBeEmitted(
          this.#selectedItems,
          newSelectedItems,
          this.#flattenedModel,
          this.selection
        )
      ) {
        this.#selectedItems = newSelectedItems;
        forceUpdate(this);
        this.#emitSelectedItemsChange();
      }
    }
  };

  #removeAllSelectedItems = () => {
    if (this.#selectedItems) {
      this.#selectedItems.forEach(selectedItemId => {
        const selectedItemInfo = this.#getItemOrGroupInfo(selectedItemId);
        selectedItemInfo.selected = false;
      });

      this.#selectedItems.clear();
    }
  };

  #handleItemClick = (event: PointerEvent) => {
    const actionListItemOrGroup = getActionListOrGroupItemFromEvent(event);

    if (
      !actionListItemOrGroup ||
      (actionListItemOrGroup as HTMLChActionListItemElement).editing
    ) {
      return;
    }
    const itemInfo = this.#getItemOrGroupInfo(actionListItemOrGroup.id);
    this.#checkIfMustExpandCollapseGroup(itemInfo);

    if (!itemInfo.expandable) {
      return;
    }
    this.itemClick.emit(this.#flattenedModel.get(itemInfo.id));
  };

  #checkIfMustExpandCollapseGroup = (
    itemInfo: ActionListItemActionable | ActionListItemGroup
  ) => {
    // Toggle the expanded/collapsed in the group on click
    if (itemInfo.expandable && !itemInfo.disabled) {
      itemInfo.expanded = !itemInfo.expanded;
      forceUpdate(this);
    }
  };

  #handleItemSelection = (event: PointerEvent) => {
    const actionListItemOrGroup = getActionListOrGroupItemFromEvent(event);

    if (
      !actionListItemOrGroup ||
      (actionListItemOrGroup as HTMLChActionListItemElement).editing
    ) {
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

    // In some situations, the user could remove the item before the
    // "removeItemCallback" promise is resolved
    if (itemToRemoveIndex > -1) {
      // Remove the UI model from the previous parent. The equality function
      // must be by index, not by object reference
      removeElement(parentArray, itemToRemoveIndex);
    }

    this.#flattenedModel.delete(itemToRemoveId);

    // Queue a re-render
    forceUpdate(this);
  };

  #sortModel = (model: ActionListModel) => {
    if (this.sortItemsCallback) {
      this.sortItemsCallback(model);
    }
  };

  #flattenUIModel = (model: ActionListModel) =>
    flattenActionListUIModel(model, this.#flattenedModel, this.#sortModel);

  // #processAdditionalItemParts = () => {
  //   this.#additionalItemsParts = undefined;

  //   this.#additionalItemsParts ??= new Set();
  // }

  connectedCallback() {
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);
    this.#flattenUIModel(this.model);

    this.#updateAndEmitSelectedItems(this.selection);
    this.el.setAttribute("role", "list");
  }

  // Don't turn it into the componentWillUpdate lifecycle method.
  // For some reason, the componentWillUpdate lifecycle method is not
  // dispatched when an Angular page (with SSR) is served from the server, but
  // when navigating in the SPA, the componentWillUpdate method works
  componentWillRender() {
    if (this.#shouldUpdateModelAndSelection) {
      this.#shouldUpdateModelAndSelection = false;

      this.#flattenUIModel(this.model);
      this.#updateAndEmitSelectedItems(this.selection);
    }
  }

  render() {
    return (
      <Host
        aria-multiselectable={this.selection === "multiple" ? "true" : null}
        class={SCROLLABLE_CLASS}
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

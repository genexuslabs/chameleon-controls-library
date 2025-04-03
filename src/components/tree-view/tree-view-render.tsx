import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Prop,
  Listen,
  Watch,
  State,
  forceUpdate,
  Method,
  Host
} from "@stencil/core";
import type {
  TreeViewDataTransferInfo,
  TreeViewDropCheckInfo,
  TreeViewItemContextMenu,
  TreeViewLines,
  TreeViewItemCheckedInfo,
  TreeViewItemExpandedInfo,
  TreeViewItemNewCaption,
  TreeViewItemOpenReferenceInfo,
  TreeViewItemSelectedInfo,
  TreeViewDropType
} from "./internal/tree-view/types";
import {
  LazyLoadTreeItemsCallback,
  TreeViewFilterInfo,
  TreeViewFilterOptions,
  TreeViewFilterType,
  TreeViewImagePathCallback,
  TreeViewItemModel,
  TreeViewItemModelExtended,
  TreeViewModel,
  TreeViewOperationStatusModifyCaption,
  TreeViewRemoveItemsResult
} from "./types";
import {
  ChTreeViewCustomEvent,
  ChTreeViewItemCustomEvent
} from "../../components";
import { GxDataTransferInfo } from "../../common/types";
import { computeFilter, itemHasCheckbox } from "./helpers";
import {
  GXRender,
  TreeViewGXItemModel,
  fromGxImageToURL
} from "./genexus-implementation";
import {
  removeTreeViewItems,
  ROOT_ID,
  scrollIntoVisibleId,
  scrollIntoVisiblePath
} from "./utils";
import { reloadItems } from "./reload-items";
import { updateItemProperty } from "./update-item-property";
import { insertIntoIndex, removeElement } from "../../common/array";
import {
  getControlRegisterProperty,
  registryControlProperty
} from "../../common/registry-properties";
import { getItemPath } from "./methods/getItemPath";

// - - - - - - - - - - - - - - - - - - - -
//                Registry
// - - - - - - - - - - - - - - - - - - - -
// This callback will be registered by default. If it is used in GeneXus, all
// tree views will have the same state, so the parameters used of the treeState
// are "shared" across all tree view instances
const registerDefaultGetImagePathCallback = (treeState: ChTreeViewRender) =>
  registryControlProperty(
    "getImagePathCallback",
    "ch-tree-view-render",
    (item: TreeViewItemModel, iconDirection: "start" | "end" = "start") => {
      const img = iconDirection === "start" ? item.startImgSrc : item.endImgSrc;

      return treeState.useGxRender
        ? fromGxImageToURL(
            img,
            treeState.gxSettings,
            treeState.gxImageConstructor
          )
        : img;
    }
  );

// - - - - - - - - - - - - - - - - - - - -
//                Defaults
// - - - - - - - - - - - - - - - - - - - -

const DEFAULT_EXPANDED_VALUE = false;
const DEFAULT_INDETERMINATE_VALUE = false;
const DEFAULT_LAZY_VALUE = false;
const DEFAULT_ORDER_VALUE = 0;
const DEFAULT_SELECTED_VALUE = false;

// There are a filter applied and, if the type is "caption" or
// "metadata", the filter property must be set
const treeViewHasFilters = (
  filterType: TreeViewFilterType,
  filter: string | RegExp
) => {
  if (filterType === "none") {
    return false;
  }

  if (filterType !== "caption" && filterType !== "metadata") {
    return true;
  }

  if (!filter) {
    return false;
  }

  // The RegExp has "object" type
  // TODO: Add unit tests for the trim case
  return typeof filter === "object" || filter.trim() !== "";
};

// GeneXus implementation
const gxDragDisabled = (
  itemModel: TreeViewGXItemModel,
  treeState: ChTreeViewRender
) =>
  itemModel.dragEnabled != null
    ? !itemModel.dragEnabled
    : treeState.dragDisabled;

// GeneXus implementation
const gxDropDisabled = (
  itemModel: TreeViewGXItemModel,
  treeState: ChTreeViewRender
) =>
  itemModel.dropEnabled != null
    ? !itemModel.dropEnabled
    : treeState.dropDisabled;

const isDropDisabled = (
  itemModel: TreeViewGXItemModel,
  treeState: ChTreeViewRender,
  useGxRender: boolean
) =>
  useGxRender
    ? gxDropDisabled(itemModel, treeState)
    : (itemModel as GXRender<false>).dropDisabled ?? treeState.dropDisabled;

const treeDropId = (treeItemId: string) => `ch-tree-view-drop__${treeItemId}`;

const defaultRenderItem = <T extends true | false>(
  itemModel: GXRender<T>,
  treeState: ChTreeViewRender,
  treeHasFilter: boolean,
  lastItem: boolean,
  level: number,
  dropBeforeAndAfterEnabled: boolean,
  useGxRender = false
) =>
  (treeState.filterType === "none" ||
    itemModel.render !== false ||
    (treeState.filterType === "list" &&
      (treeState.filterList === undefined ||
        treeState.filterList === null))) && [
    dropBeforeAndAfterEnabled && (
      <ch-tree-view-drop
        id={treeDropId(itemModel.id)}
        level={level}
        treeItemId={itemModel.id}
        type="before"
      ></ch-tree-view-drop>
    ),

    <ch-tree-view-item
      key={itemModel.id}
      id={itemModel.id}
      caption={itemModel.caption}
      checkbox={itemModel.checkbox ?? treeState.checkbox}
      checked={itemModel.checked ?? treeState.checked}
      disabled={
        useGxRender
          ? (itemModel as GXRender<true>).enabled === false
          : (itemModel as GXRender<false>).disabled
      }
      downloading={itemModel.downloading}
      dragDisabled={
        useGxRender
          ? gxDragDisabled(itemModel, treeState)
          : (itemModel as GXRender<false>).dragDisabled ??
            treeState.dragDisabled
      }
      dropDisabled={isDropDisabled(itemModel, treeState, useGxRender)}
      editable={itemModel.editable ?? treeState.editableItems}
      endImgSrc={itemModel.endImgSrc}
      endImgType={itemModel.endImgType ?? "background"}
      expanded={itemModel.expanded}
      expandableButton={treeState.expandableButton}
      expandOnClick={treeState.expandOnClick}
      getImagePathCallback={treeState.getImagePathCallback}
      indeterminate={itemModel.indeterminate}
      lastItem={lastItem}
      lazyLoad={itemModel.lazy}
      leaf={itemModel.leaf}
      level={level}
      metadata={itemModel.metadata}
      model={itemModel}
      parts={itemModel.parts}
      selected={itemModel.selected}
      showLines={treeState.showLines}
      toggleCheckboxes={
        itemModel.toggleCheckboxes ?? treeState.toggleCheckboxes
      }
      startImgSrc={itemModel.startImgSrc}
      startImgType={itemModel.startImgType ?? "background"}
    >
      {!itemModel.leaf &&
        itemModel.items != null &&
        itemModel.items.map((subModel, index) =>
          treeState.renderItem(
            subModel,
            treeState,
            treeHasFilter,
            treeState.showLines !== "none" &&
              // If there is a filter applied in the current list, use the
              // lastItemId value to calculate the last item
              (treeHasFilter && itemModel.lastItemId !== undefined
                ? subModel.id === itemModel.lastItemId
                : index === itemModel.items.length - 1),
            level + 1,

            // When dragging "before" and "after" an item and the direct parent
            // has drops disabled, don't render the ch-tree-view-drop elements.
            treeState.dropMode !== "above" &&
              isDropDisabled(itemModel, treeState, useGxRender) !== true,
            useGxRender
          )
        )}
    </ch-tree-view-item>,

    dropBeforeAndAfterEnabled && lastItem && (
      <ch-tree-view-drop
        id={treeDropId(itemModel.id) + "-after"}
        level={level}
        treeItemId={itemModel.id}
        type="after"
      ></ch-tree-view-drop>
    )
  ];

const defaultSortItemsCallback = (subModel: TreeViewModel): void => {
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

type ImmediateFilter = "immediate" | "debounced" | undefined;

/**
 * @part drag-preview - The element that contains the preview information for the current drag.
 *
 * @part item - The host element of the each item.
 *
 * @part item__action - A sub element of the header (item__header part) that contains the main information related to the item (startImage, caption/edit-caption, endImage and downloading).
 *
 * @part item__checkbox - The host element of the item's checkbox.
 * @part item__checkbox-container - The container that serves as a wrapper for the `input` and the `option` parts of the checkbox.
 * @part item__checkbox-input - The input element that implements the interactions for the checkbox.
 * @part item__checkbox-option - The actual "input" that is rendered above the `item__checkbox-input` part of the checkbox. This part has `position: absolute` and `pointer-events: none`.
 *
 * @part item__downloading - The spinner element that is rendered when an item is lazy loading its content. This element is rendered at the end of the `item__action` part.
 *
 * @part item__edit-caption - The input element that is rendered when an item is editing its caption. When rendered this element replaces the caption of the `item__action` part.
 *
 * @part item__expandable-button - The actionable expandable button element that is rendered when an item has subitems and the expandable button is interactive (`leaf !== true` and `expandableButton === "action"`). When rendered this element is placed at the start of the `item__action` part.
 *
 * @part item__group - The container element for the subitems that is rendered when the content of an item has been lazy loaded.
 *
 * @part item__header - The container for all elements -excepts the subitems (`item__group` part)- of an item. It contains the `item__expandable-button`, `item_checkbox` and `item__action` parts.
 *
 * @part item__img - The img element that is rendered when an item has images (`startImgSrc` is defined and/or `endImgSrc` is defined).
 *
 * @part item__line - The element that is rendered to display the relationship between the an item and its parent. Rendered if the item is not in the first level and `showLines !== "none"`.
 *
 * @part disabled - Present in the `item__header`, `item__expandable-button`, `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is disabled (`disabled` === `true`).
 *
 * @part expanded - Present in the `item__action`, `item__expandable-button` and `item__group` parts when the item is expanded (`expanded` === `true`).
 * @part collapsed - Present in the `item__action`, `item__expandable-button` and `item__group` parts when the item is collapsed (`expanded` !== `true`).
 *
 * @part expand-button - Present in the `item__header` part when the item has an expandable button (`level !== 0`, `leaf !== true` and `expandableButton !== "no"`).
 *
 * @part even-level - Present in the `item__group` and `item__header` parts when the item is in an even level.
 * @part odd-level - Present in the `item__group` and `item__header` parts when the item is in an odd level.
 *
 * @part last-line - Present in the `item__line` part if the item is the last item of its parent item in `showLines = "last"` mode (`showLines === "last"`, `level !== 0` and `lastItem === true`).
 *
 * @part lazy-loaded - Present in the `item__group` part when the content of the item has been loaded.
 *
 * @part start-img - Present in the `item__img` part when the item has an start image element (`startImgSrc` is defined and `startImgType` === "img").
 * @part end-img - Present in the `item__img` part when the item has an end image element (`endImgSrc` is defined and `endImgType` === "img").
 *
 * @part editing - Present in the `item__header` and `item__action` parts when the item is in edit mode.
 * @part not-editing - Present in the `item__header` and `item__action` parts when the item isn't in edit mode.
 *
 * @part selected - Present in the `item__header` part when the item is selected (`selected` === `true`).
 * @part not-selected - Present in the `item__header` part when the item isn't selected (`selected` !== `true`).
 *
 * @part checked - Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is checked and not indeterminate (`checked` === `true` and `indeterminate !== true`).
 * @part indeterminate - Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is indeterminate (`indeterminate` === `true`).
 * @part unchecked - Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is unchecked and not indeterminate (`checked` !== `true` and `indeterminate !== true`).
 *
 * @part drag-enter - Present in the `item` and `item__header` parts when a valid drop operation is over the item.
 */
@Component({
  tag: "ch-tree-view-render",
  styleUrl: "tree-view-render.scss",
  shadow: true
})
export class ChTreeViewRender {
  // UI Models
  #flattenedTreeModel: Map<string, TreeViewItemModelExtended> = new Map();
  #flattenedCheckboxTreeModel: Map<string, TreeViewItemModelExtended> =
    new Map();
  #selectedItems: Set<string> = new Set();

  #selectedChangeScheduled = false;

  #checkedChangeScheduled = false;

  #rootNode: TreeViewItemModel;

  // Filters info
  #applyFilters = false;
  #immediateFilter: ImmediateFilter;
  #filterTimeout: NodeJS.Timeout;
  #filterListAsSet: Set<string>;

  // Refs
  #treeRef: HTMLChTreeViewElement;

  @Element() el: HTMLChTreeViewRenderElement;

  /**
   * This property lets you specify if the tree is waiting to process the drop
   * of items.
   */
  @State() waitDropProcessing = false;

  /**
   * Set this attribute if you want display a checkbox in all items by default.
   */
  @Prop() readonly checkbox: boolean = false;
  @Watch("checkbox")
  checkboxChange() {
    this.#scheduleCheckedItemsChange();
    this.#scheduleFilterProcessing();
  }

  /**
   * Set this attribute if you want the checkbox to be checked in all items by
   * default.
   * Only works if `checkbox = true`
   */
  @Prop() readonly checked: boolean = false;
  @Watch("checked")
  checkedChange() {
    this.#scheduleCheckedItemsChange();
    this.#scheduleFilterProcessing();
  }

  /**
   * Callback that is executed when an element tries to drop in another item of
   * the tree. Returns whether the drop is valid.
   */
  @Prop() readonly checkDroppableZoneCallback: (
    dropInformation: TreeViewDropCheckInfo
  ) => Promise<boolean>;

  /**
   * This attribute lets you specify if the drag operation is disabled in all
   * items by default. If `true`, the items can't be dragged.
   */
  @Prop() readonly dragDisabled: boolean = true;

  /**
   * This attribute lets you specify if the drop operation is disabled in all
   * items by default. If `true`, the items won't accept any drops.
   */
  @Prop() readonly dropDisabled: boolean = true;

  /**
   * Callback that is executed when a list of items request to be dropped into
   * another item.
   */
  @Prop() readonly dropItemsCallback: (
    dataTransferInfo: TreeViewDataTransferInfo
  ) => Promise<{ acceptDrop: boolean; model?: TreeViewModel }>;

  /**
   * This attribute lets you specify which kind of drop operation can be
   * effected in the items.
   */
  @Prop() readonly dropMode: "above" | "before-and-after" | "all" = "above";

  /**
   * This attribute lets you specify if the edit operation is enabled in all
   * items by default. If `true`, the items can edit its caption in place.
   */
  @Prop() readonly editableItems: boolean = false;

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
   * Specifies if a tree-view-item is expanded on click interaction. If `true`
   * the tree-view-item is expanded on click interaction. If `false`, with
   * mouse interaction the tree-view-item will only be expanded on double click.
   */
  @Prop() readonly expandOnClick: boolean = true;

  /**
   * This property lets you determine the expression that will be applied to the
   * filter.
   * Only works if `filterType = "caption" | "metadata"`.
   */
  @Prop() readonly filter?: string | RegExp | undefined;
  @Watch("filter")
  filterChanged() {
    if (this.filterType === "caption" || this.filterType === "metadata") {
      this.#scheduleFilterProcessing();
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
  filterDebounceChanged() {
    if (this.filterType === "caption" || this.filterType === "metadata") {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * This property lets you determine the list of items that will be filtered.
   * Only works if `filterType = "list"`.
   * If `undefined` or `null` all items will be rendered. If `[]` no items will
   * be rendered.
   */
  @Prop() readonly filterList: string[] | undefined | null = undefined;
  @Watch("filterList")
  filterListChanged() {
    // Use a Set to efficiently check for ids
    this.#filterListAsSet = new Set(this.filterList);

    if (this.filterType === "list") {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * This property lets you determine the options that will be applied to the
   * filter.
   */
  @Prop() readonly filterOptions: TreeViewFilterOptions = {};
  @Watch("filterOptions")
  filterOptionsChanged() {
    this.#scheduleFilterProcessing();
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
   * | `list`      | Show only the items that are contained in the array determinate by the `filterList` property.  |
   * | `none`      | Show all items.                                                                                |
   */
  @Prop() readonly filterType: TreeViewFilterType = "none";
  @Watch("filterType")
  filterTypeChanged(newValue: TreeViewFilterType) {
    if (newValue === "list") {
      // Use a Set to efficiently check for ids
      this.#filterListAsSet = new Set(this.filterList);
    } else {
      this.#filterListAsSet = undefined; // Free the memory
    }

    this.#scheduleFilterProcessing();
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
   * This property specifies a callback that is executed when the path for an
   * item image needs to be resolved. With this callback, there is no need to
   * re-implement item rendering (`renderItem` property) just to change the
   * path used for the images.
   */
  @Prop() readonly getImagePathCallback: TreeViewImagePathCallback;

  /**
   * Callback that is executed when a item request to load its subitems.
   */
  @Prop() readonly lazyLoadTreeItemsCallback: LazyLoadTreeItemsCallback;

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
  @Watch("multiSelection")
  multiSelectionChanged(newMultiSelection: boolean) {
    // MultiSelection is disabled. We must select the last updated item
    if (!newMultiSelection) {
      this.#removeAllSelectedItemsExceptForTheLast(this.#selectedItems);
    }
  }

  /**
   * This property lets you define the model of the ch-tree-view-render control.
   */
  @Prop() readonly model: TreeViewModel = [];
  @Watch("model")
  modelChanged() {
    this.#flattenModel();
  }

  /**
   * This property allows us to implement custom rendering of tree items.
   */
  @Prop() readonly renderItem: (
    itemModel: TreeViewItemModel | any,
    treeState: ChTreeViewRender,
    treeHasFilter: boolean,
    lastItem: boolean,
    level: number,
    dropBeforeAndAfterEnabled: boolean,
    useGxRender?: boolean
  ) => any = defaultRenderItem;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop() readonly showLines: TreeViewLines = "none";

  /**
   * Callback that is executed when the `model` is changed to order its items.
   */
  @Prop() readonly sortItemsCallback: (subModel: TreeViewModel) => void =
    defaultSortItemsCallback;

  /**
   * Set this attribute if you want all the children item's checkboxes to be
   * checked when the parent item checkbox is checked, or to be unchecked when
   * the parent item checkbox is unchecked.
   * This attribute will be used in all items by default.
   */
  @Prop() readonly toggleCheckboxes: boolean = false;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  /**
   * Fired when the checked items change.
   * This event does take into account the currently filtered items.
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
  @Event() selectedItemsChange: EventEmitter<TreeViewItemModelExtended[]>;

  /**
   * Given the drop accepting, the data transfer info and the external items,
   * it process the drops of the items in the tree.
   */
  @Method()
  async dropItems(
    acceptDrop: boolean,
    dataTransferInfo: TreeViewDataTransferInfo,
    model?: TreeViewModel
  ) {
    if (!acceptDrop) {
      return;
    }

    const newParentId = dataTransferInfo.newContainer.id;
    const newParentUIModel = this.#flattenedTreeModel.get(newParentId);
    const dropType = dataTransferInfo.dropType;

    // When the dropType is "before" or "after", the target node must be
    // the parent
    const actualParent =
      dropType === "above"
        ? newParentUIModel.item
        : newParentUIModel.parentItem;

    // Only move the items to the new parent, keeping the state
    if (dataTransferInfo.dropInTheSameTree) {
      let specificIndexToInsert: { index: number } = undefined;

      if (dropType !== "above") {
        specificIndexToInsert = {
          index: actualParent.items.findIndex(
            item => item.id === dataTransferInfo.newContainer.id
          )
        };

        if (dropType === "after") {
          specificIndexToInsert.index++;
        }
      }

      // Add the UI models to the new container and remove the UI models from
      // the old containers
      dataTransferInfo.draggedItems.forEach(
        this.#moveItemToNewParent(actualParent, specificIndexToInsert)
      );

      // When the selected items are moved, the tree must update its internal
      // state to not have undefined references
      if (dataTransferInfo.draggingSelectedItems) {
        this.#scheduleSelectedItemsChange();
      }
    }
    // Add the new items
    else {
      if (model == null) {
        return;
      }

      // Add new items to the parent
      actualParent.items.push(...model);

      // Flatten the new UI models
      model.forEach(this.#flattenItemUIModel(actualParent));
    }

    this.#sortItems(actualParent.items);

    // Open the item to visualize the new subitems
    actualParent.expanded = true;

    // Re-sync checked items
    this.#scheduleCheckedItemsChange();

    // Update filters
    this.#scheduleFilterProcessing();

    // Force re-render
    forceUpdate(this);
  }

  /**
   * Returns item's path (an ordered array of the UI models that creates the path
   * from the root to the ID) given the item ID, and null if there is no such item
   * otherwise.
   *
   * This method doesn't change its behavior if the tree view has filters
   * applied.
   *
   * @param itemId The id of the item.
   */
  @Method()
  async getItemPath(itemId: string): Promise<TreeViewItemModel[] | null> {
    return getItemPath(itemId, this.#flattenedTreeModel);
  }

  /**
   * Given a list of ids, it returns an array of the items that exists in the
   * given list.
   */
  @Method()
  async getItemsInfo(itemsId: string[]): Promise<TreeViewItemModelExtended[]> {
    return this.#getItemsInfo(itemsId);
  }

  #getItemsInfo = (itemsId: string[]): TreeViewItemModelExtended[] => {
    const treeViewItemsInfo: TreeViewItemModelExtended[] = [];

    itemsId.forEach(itemId => {
      const itemUIModel = this.#flattenedTreeModel.get(itemId);

      if (itemUIModel) {
        treeViewItemsInfo.push(itemUIModel);
      }
    });

    return treeViewItemsInfo;
  };

  /**
   * Given an item id, an array of items to add, the download status and the
   * lazy state, updates the item's UI Model.
   */
  @Method()
  async loadLazyContent(
    itemId: string,
    model?: TreeViewModel,
    downloading = false,
    lazy = false
  ) {
    const itemToLazyLoadContent = this.#flattenedTreeModel.get(itemId).item;

    // Establish that the content was lazy loaded
    itemToLazyLoadContent.downloading = downloading;
    itemToLazyLoadContent.lazy = lazy;

    // Check if there is items to add
    if (model == null) {
      return;
    }

    // @todo What happens in the server when dropping items on a lazy node?
    itemToLazyLoadContent.items = model;

    this.#sortItems(itemToLazyLoadContent.items);
    this.#flattenSubModel(itemToLazyLoadContent);

    // Re-sync checked items
    this.#scheduleCheckedItemsChange();

    // Update filters
    this.#scheduleFilterProcessing("immediate");

    // Force re-render
    forceUpdate(this);
  }

  /**
   * Given a list of ids, removes the items and their children in the tree.
   */
  @Method()
  async removeItems(items: string[]) {
    const removeItemsResult: TreeViewRemoveItemsResult = removeTreeViewItems(
      items,
      this.#flattenedTreeModel,
      this.#flattenedCheckboxTreeModel,
      this.#selectedItems
    );

    if (!this.#treeHasFilters()) {
      // Update selected items
      if (removeItemsResult.atLeastOneSelected) {
        this.#updateSelectedItems();
      }

      // Re-sync checked items
      if (removeItemsResult.atLeastOneCheckbox) {
        this.#scheduleCheckedItemsChange();
      }
    }

    // Force re-render
    if (removeItemsResult.atLeastOneElement) {
      forceUpdate(this);

      // Update filters
      this.#scheduleFilterProcessing("immediate");
    }
  }

  /**
   * Given an item id and the additional properties to update before and after
   * reload, it reloads the items of the `itemId` node by using the
   * `lazyLoadTreeItemsCallback` property.
   */
  @Method()
  async reloadItems(
    itemId: string,
    beforeProperties?: Partial<TreeViewItemModel>,
    afterProperties?: Partial<TreeViewItemModel>
  ): Promise<boolean> {
    const success = await reloadItems(
      this.el,
      itemId,
      this.#flattenedTreeModel,
      this.lazyLoadTreeItemsCallback,
      (itemId, items) => this.loadLazyContent(itemId, items),
      (items: string[]) => this.removeItems(items),
      beforeProperties,
      afterProperties
    );

    return success;
  }

  /**
   * Given the path of the item (represent by a sorted array containing all ids
   * from the root to the item) and the additional properties to update after,
   * it displays and scrolls into the item view.
   * The path can also be a string representing the id of the item to scroll
   * into.
   *
   * When using a path, this method will fail if:
   *   - The path does not start from the root element.
   *   - The path contains a cycle.
   *   - The path does not correspond to a valid path on the server:
   *     - One of the item of the path, except for the last one, is a leaf.
   *     - An item in the path does not exists on the server.
   *     - The path has repeated items.
   *     - And so on.
   */
  @Method()
  async scrollIntoVisible(
    path: string | string[],
    afterProperties?: Partial<TreeViewItemModel>
  ): Promise<boolean> {
    const hasOnlyTheItemId = typeof path === "string";

    const success = await (hasOnlyTheItemId
      ? scrollIntoVisibleId(path, this.#flattenedTreeModel)
      : scrollIntoVisiblePath(
          this.el,
          path,
          this.#flattenedTreeModel,
          this.#rootNode,
          this.lazyLoadTreeItemsCallback
        ));

    if (!success) {
      return false;
    }
    const itemId = hasOnlyTheItemId ? path : path[path.length - 1];

    // Expand all parent items
    let parentInfo = this.#flattenedTreeModel.get(itemId).parentItem;
    while (parentInfo !== this.#rootNode) {
      parentInfo.expanded = true;
      parentInfo = this.#flattenedTreeModel.get(parentInfo.id).parentItem;
    }

    if (afterProperties) {
      this.updateItemsProperties([itemId], afterProperties);
    }

    forceUpdate(this);

    // Scroll into the itemId view, after rendering has completed
    requestAnimationFrame(() => {
      this.#treeRef.scrollIntoVisible(itemId);
    });

    return true;
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
      const itemInfo = this.#flattenedTreeModel.get(treeItemId).item;

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
    [...this.#flattenedTreeModel.values()].forEach(itemUIModel => {
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
      this.#scheduleFilterProcessing();
    }

    forceUpdate(this);
  }

  /**
   * Given a item list and the properties to update, it updates the properties
   * of the items in the list.
   */
  @Method()
  async updateItemsProperties(
    items: string[],
    properties: Partial<TreeViewItemModel>
  ) {
    // Set to check if there are new selected items
    const newSelectedItems = new Set(this.#selectedItems);

    // Map to check if there are new items with checkbox
    const newCheckboxItems: Map<string, TreeViewItemModelExtended> = new Map(
      this.#flattenedCheckboxTreeModel
    );

    items.forEach(itemId => {
      updateItemProperty(
        itemId,
        properties,
        this.#flattenedTreeModel,
        newSelectedItems,
        newCheckboxItems,
        this.checkbox
      );
    });

    // MultiSelection is disabled. We must select the last updated item
    if (!this.multiSelection) {
      this.#removeAllSelectedItemsExceptForTheLast(newSelectedItems);
    }

    // Update filters if necessary
    if (this.#treeHasFilters()) {
      this.#scheduleFilterProcessing();
    } else {
      this.#checkIfThereAreDifferentItemsWithCheckbox(newCheckboxItems);
      this.#checkIfThereAreDifferentSelectedItems(newSelectedItems);
    }

    forceUpdate(this);
  }

  /**
   * Update the information about the valid droppable zones.
   * @param requestTimestamp Time where the request to the server was made. Useful to avoid having old information.
   * @param newContainerId ID of the container where the drag is trying to be made.
   * @param draggedItems Information about the dragged items.
   * @param validDrop Current state of the droppable zone.
   * @param dropType Type of drop that wants to be effected
   */
  @Method()
  async updateValidDropZone(
    requestTimestamp: number,
    newContainerId: string,
    draggedItems: GxDataTransferInfo[],
    dropType: TreeViewDropType,
    validDrop: boolean
  ) {
    this.#treeRef.updateValidDropZone(
      requestTimestamp,
      newContainerId,
      draggedItems,
      dropType,
      validDrop
    );
  }

  @Listen("checkboxChange")
  @Listen("checkboxToggleChange")
  onCheckboxChange(event: ChTreeViewItemCustomEvent<TreeViewItemCheckedInfo>) {
    event.stopPropagation();

    const detail = event.detail;
    const treeItemId = detail.id;
    const itemUIModel = this.#flattenedCheckboxTreeModel.get(treeItemId);

    // In some cases, when the `treeModel` and `checked` properties are updated
    // outside of the tree control, some events are fired with undefined references
    if (!itemUIModel) {
      return;
    }
    const itemInfo = itemUIModel.item;

    itemInfo.checked = detail.checked;
    itemInfo.indeterminate = detail.indeterminate;

    this.#scheduleCheckedItemsChange();

    // Update filters
    if (this.filterType === "checked" || this.filterType === "unchecked") {
      this.#scheduleFilterProcessing();
    }

    // Force re-render
    forceUpdate(this);
  }

  @Listen("loadLazyContent")
  onLoadLazyContent(event: ChTreeViewItemCustomEvent<string>) {
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
  onModifyCaption(event: ChTreeViewItemCustomEvent<TreeViewItemNewCaption>) {
    if (!this.modifyItemCaptionCallback) {
      return;
    }
    event.stopPropagation();

    const itemRef = event.target;
    const itemId = event.detail.id;
    const itemUIModel = this.#flattenedTreeModel.get(itemId);
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
        this.#sortItems(itemUIModel.parentItem.items);

        // Update filters
        this.#scheduleFilterProcessing();

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
  onOpenReference(
    event: ChTreeViewItemCustomEvent<TreeViewItemOpenReferenceInfo>
  ) {
    event.stopPropagation();
    this.itemOpenReference.emit(event.detail);
  }

  #handleDroppableZoneEnter = (
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
        dropInformation.dropType,
        validDrop
      );
    });
  };

  #handleSelectedItemsChange = (
    event: ChTreeViewCustomEvent<Map<string, TreeViewItemSelectedInfo>>
  ) => {
    event.stopPropagation();
    const itemsToProcess = new Map(event.detail);

    const previousSelectedItems = this.#selectedItems;

    // Remove no longer selected items
    previousSelectedItems.forEach(selectedItemId => {
      const itemUIModel = this.#flattenedTreeModel.get(selectedItemId).item;
      const itemIsStillSelected = itemsToProcess.get(selectedItemId);

      // The item does not need to be added. Remove it from the processed list
      if (itemIsStillSelected) {
        itemUIModel.expanded = itemIsStillSelected.expanded; // Update expanded state
        itemsToProcess.delete(selectedItemId);
      }
      // The item must be un-selected in the UI Model
      else {
        itemUIModel.selected = false;
        previousSelectedItems.delete(selectedItemId);
      }
    });

    // Add new selected items
    itemsToProcess.forEach((newSelectedItemInfo, itemId) => {
      const newSelectedItem = this.#flattenedTreeModel.get(itemId).item;
      newSelectedItem.selected = true;
      newSelectedItem.expanded = newSelectedItemInfo.expanded;

      previousSelectedItems.add(itemId);
    });

    // Queue re-render to avoid issues about synchronization the Virtual DOM
    // with the real DOM
    forceUpdate(this);

    this.#updateSelectedItems();
  };

  #handleExpandedItemChange = (
    event: ChTreeViewCustomEvent<TreeViewItemExpandedInfo>
  ) => {
    const detail = event.detail;
    const itemInfo = this.#flattenedTreeModel.get(detail.id).item;
    itemInfo.expanded = detail.expanded;
  };

  #handleItemContextmenu = (
    event: ChTreeViewCustomEvent<TreeViewItemContextMenu>
  ) => {
    event.stopPropagation();
    this.itemContextmenu.emit(event.detail);
  };

  #handleItemsDropped = (
    event: ChTreeViewCustomEvent<TreeViewDataTransferInfo>
  ) => {
    const dataTransferInfo = event.detail;
    const newContainer = dataTransferInfo.newContainer;
    const newParentId = newContainer.id;

    // Check if the parent exists in the UI Model
    if (!this.#flattenedTreeModel.get(newParentId)) {
      return;
    }

    const draggedItems: GxDataTransferInfo[] = dataTransferInfo.draggedItems;

    if (draggedItems.length === 0 || !this.dropItemsCallback) {
      return;
    }
    event.stopPropagation();

    const promise = this.dropItemsCallback(dataTransferInfo);
    this.waitDropProcessing = true;

    promise.then(async response => {
      this.dropItems(response.acceptDrop, dataTransferInfo, response.model);
      this.waitDropProcessing = false;
    });
  };

  #removeAllSelectedItemsExceptForTheLast = (
    currentSelectedItems: Set<string>
  ) => {
    if (currentSelectedItems.size > 1) {
      const selectedItemsArray = [...currentSelectedItems.values()];
      const lastItemIndex = currentSelectedItems.size - 1;

      // Deselect all items except the last
      for (let index = 0; index < lastItemIndex; index++) {
        const itemId = selectedItemsArray[index];

        this.#flattenedTreeModel.get(itemId).item.selected = false;
      }

      // Create a new Set with only the last item
      currentSelectedItems.clear();
      currentSelectedItems.add(selectedItemsArray[lastItemIndex]);

      this.#scheduleSelectedItemsChange();
    }
  };

  #moveItemToNewParent =
    (newParentItem: TreeViewItemModel, specificIndex?: { index: number }) =>
    (dataTransferInfo: GxDataTransferInfo, index: number) => {
      const itemUIModelExtended = this.#flattenedTreeModel.get(
        dataTransferInfo.id
      );
      const item = itemUIModelExtended.item;
      const oldParentItem = itemUIModelExtended.parentItem;

      const oldIndex = oldParentItem.items.findIndex(el => el.id === item.id);

      // Remove the UI model from the previous parent. The equality function
      // must be by index, not by object reference
      removeElement(oldParentItem.items, oldIndex);

      // The item must be inserted in a specific position, because the dropMode
      // has "before" and "after" enabled
      if (specificIndex !== undefined) {
        let newIndex = specificIndex.index + index;

        // The item is moved in the same parent, so no new items are added
        // The specificIndex must be decreased to balance the increment
        if (oldParentItem.id === newParentItem.id && oldIndex < newIndex) {
          newIndex--;
          specificIndex.index--;
        }

        insertIntoIndex(newParentItem.items, item, newIndex);
      }
      // Add the UI Model to the new parent by pushing it at the end
      else {
        newParentItem.items.push(item);
      }

      // Reference the new parent in the item
      itemUIModelExtended.parentItem = newParentItem;
    };

  #flattenSubModel = (model: TreeViewItemModel) => {
    const items = model.items;

    if (!items) {
      // Make sure that subtrees don't have an undefined array
      if (model.leaf !== true) {
        model.items = [];
      }
      return;
    }
    this.#sortItems(items);

    items.forEach(this.#flattenItemUIModel(model));
  };

  #flattenItemUIModel =
    (parentModel: TreeViewItemModel) => (item: TreeViewItemModel) => {
      this.#flattenedTreeModel.set(item.id, {
        parentItem: parentModel,
        item: item
      });

      // Add the items that have a checkbox in a separate Map
      if (this.#itemHasCheckbox(item)) {
        this.#flattenedCheckboxTreeModel.set(item.id, {
          parentItem: parentModel,
          item: item
        });
      }

      // Make sure the properties are with their default values to avoid issues
      // when reusing DOM nodes
      item.expanded ??= DEFAULT_EXPANDED_VALUE;
      item.indeterminate ??= DEFAULT_INDETERMINATE_VALUE;
      item.lazy ??= DEFAULT_LAZY_VALUE;
      item.order ??= DEFAULT_ORDER_VALUE;
      item.selected ??= DEFAULT_SELECTED_VALUE;

      if (item.selected) {
        this.#selectedItems.add(item.id);
      }

      this.#flattenSubModel(item);
    };

  #itemHasCheckbox = (item: TreeViewItemModel) =>
    itemHasCheckbox(item, this.checkbox);

  #treeHasFilters = () => treeViewHasFilters(this.filterType, this.filter);

  #sortItems = (model: TreeViewModel) => {
    // Ensure that items are sorted if the dropMode enables it
    if (this.dropMode === "above" && this.sortItemsCallback) {
      this.sortItemsCallback(model);
    }
  };

  #flattenModel = () => {
    this.#flattenedTreeModel.clear();
    this.#flattenedCheckboxTreeModel.clear();
    this.#selectedItems.clear();

    this.#rootNode = { id: ROOT_ID, caption: ROOT_ID, items: this.model };
    this.#flattenSubModel(this.#rootNode);

    // Re-sync filters
    this.#scheduleFilterProcessing("immediate");

    // The model was updated at runtime, so we need to update the references
    // Re-sync selected items
    this.#scheduleSelectedItemsChange();

    // Re-sync checked items
    this.#scheduleCheckedItemsChange();
  };

  #filterSubModel = (
    item: TreeViewItemModel,
    filterInfo: TreeViewFilterInfo,
    currentSelectedItems: Set<string>,
    currentCheckboxItems: Map<string, TreeViewItemModelExtended>
  ): boolean => {
    let aSubItemIsRendered = false;

    // Check if a subitem is rendered
    if (item.leaf !== true && item.items != null) {
      let lastItemId = undefined;

      item.items.forEach(subItem => {
        const itemSatisfiesFilter = this.#filterSubModel(
          subItem,
          filterInfo,
          currentSelectedItems,
          currentCheckboxItems
        );
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
      aSubItemIsRendered || computeFilter(this.filterType, item, filterInfo);

    item.render = satisfiesFilter; // Update item render

    // Update selected and checkbox items
    if (satisfiesFilter && item.id !== ROOT_ID) {
      if (item.selected) {
        currentSelectedItems.add(item.id);
      }

      if (this.#itemHasCheckbox(item)) {
        const itemUIModel = this.#flattenedTreeModel.get(item.id);
        currentCheckboxItems.set(item.id, itemUIModel);
      }
    }

    return satisfiesFilter;
  };

  #scheduleCheckedItemsChange = () => {
    this.#checkedChangeScheduled = true;
  };

  #scheduleSelectedItemsChange = () => {
    this.#selectedChangeScheduled = true;
  };

  #updateSelectedItems = () => {
    const selectedItemsInfo = this.#getItemsInfo([
      ...this.#selectedItems.keys()
    ]);
    this.selectedItemsChange.emit(selectedItemsInfo);
  };

  #updateCheckedItems = () => {
    // New copy of the checked items
    const allItemsWithCheckbox: Map<string, TreeViewItemModelExtended> =
      new Map(this.#flattenedCheckboxTreeModel);

    // Update the checked value if not defined
    allItemsWithCheckbox.forEach(itemUIModel => {
      itemUIModel.item.checked ??= this.checked;
    });

    this.checkedItemsChange.emit(allItemsWithCheckbox);
  };

  #scheduleFilterProcessing = (immediateFilter?: ImmediateFilter) => {
    this.#applyFilters = true;

    if (immediateFilter !== undefined) {
      this.#immediateFilter ??= immediateFilter;
    }
  };

  #checkIfThereAreDifferentItemsWithCheckbox = (
    newCheckboxItems: Map<string, TreeViewItemModelExtended>
  ) => {
    if (newCheckboxItems.size !== this.#flattenedCheckboxTreeModel.size) {
      this.#checkedChangeScheduled = true;
    }
    // Check if the items in each Map have the same id
    else {
      this.#flattenedCheckboxTreeModel.forEach((_, itemId) => {
        // Found a value that don't belong to the checkboxItems with filters,
        // schedule checkedItemsChange
        if (!newCheckboxItems.has(itemId)) {
          // Schedule checkedItemsChange
          this.#checkedChangeScheduled = true;
        }
      });
    }

    // The previous checkbox items will now be the selected items with filter
    this.#flattenedCheckboxTreeModel = newCheckboxItems;
  };

  #checkIfThereAreDifferentSelectedItems = (newSelectedItems: Set<string>) => {
    if (newSelectedItems.size !== this.#selectedItems.size) {
      this.#selectedChangeScheduled = true;
    }
    // Check if the items in each Set have the same id
    else {
      this.#selectedItems.forEach(itemId => {
        // Found a value that don't belong to the selectedItems with filters,
        // deselect the item
        if (!newSelectedItems.has(itemId)) {
          this.#flattenedTreeModel.get(itemId).item.selected = false;

          // Schedule selectedItemsChange
          this.#selectedChangeScheduled = true;
        }
      });
    }

    // The previous selected items will now be the selected items with filter
    this.#selectedItems = newSelectedItems;
  };

  #updateFilters = () => {
    if (this.filterType === "none") {
      // Check if there are more items with checkbox
      const itemsWithCheckbox: Map<string, TreeViewItemModelExtended> =
        new Map();

      this.#flattenedTreeModel.forEach((itemUIModel, itemId) => {
        if (this.#itemHasCheckbox(itemUIModel.item)) {
          itemsWithCheckbox.set(itemId, itemUIModel);
        }
      });

      this.#checkIfThereAreDifferentItemsWithCheckbox(itemsWithCheckbox);
      this.#validateCheckedAndSelectedItems();
      // Reset immediate filters, since there are not any filters to process
      this.#immediateFilter = undefined;

      return;
    }

    // Remove queued filter processing
    clearTimeout(this.#filterTimeout);

    const processWithDebounce =
      this.filterDebounce > 0 &&
      (this.filterType === "caption" || this.filterType === "metadata");

    const filterFunction = () => {
      const currentSelectedItems: Set<string> = new Set();
      const currentCheckedItems: Map<string, TreeViewItemModelExtended> =
        new Map();

      if (this.filterType === "list") {
        // TODO: Add unit tests for this case (?? [])
        this.#filterListAsSet ??= new Set(this.filterList ?? []);
      }

      this.#filterSubModel(
        {
          id: ROOT_ID,
          caption: ROOT_ID,
          items: this.model
        },
        {
          defaultCheckbox: this.checkbox,
          defaultChecked: this.checked,
          filter: this.filter,
          filterOptions: this.filterOptions,
          filterSet: this.#filterListAsSet
        },
        currentSelectedItems,
        currentCheckedItems
      );

      // It validates if there are differences between the items with checkbox
      // and the selected items. If there are, emit the corresponding updates.
      this.#checkIfThereAreDifferentSelectedItems(currentSelectedItems);
      this.#checkIfThereAreDifferentItemsWithCheckbox(currentCheckedItems);

      this.#validateCheckedAndSelectedItems();
    };

    // Check if should filter with debounce
    if (processWithDebounce && this.#immediateFilter !== "immediate") {
      this.#filterTimeout = setTimeout(() => {
        this.#immediateFilter = undefined;
        filterFunction();
        forceUpdate(this); // After the filter processing is completed, force a re-render
      }, this.filterDebounce);
    }
    // No debounce
    else {
      this.#immediateFilter = undefined;
      filterFunction();
    }
  };

  #validateCheckedAndSelectedItems = () => {
    if (this.#checkedChangeScheduled) {
      this.#updateCheckedItems();
      this.#checkedChangeScheduled = false;
    }

    if (this.#selectedChangeScheduled) {
      this.#selectedChangeScheduled = false;

      // Update the selected items in the ch-tree-view control
      this.#updateSelectedItems();
    }
  };

  #getSelectedItemsCallback = () => {
    const selectedItemsInfo: Map<string, TreeViewItemSelectedInfo> = new Map();

    this.#selectedItems.forEach(itemId => {
      const itemUIModel = this.#flattenedTreeModel.get(itemId);
      const itemInfo = itemUIModel.item;

      selectedItemsInfo.set(itemId, {
        id: itemInfo.id,
        expanded: itemInfo.expanded,
        metadata: itemInfo.metadata,
        parentId: itemUIModel.parentItem.id
      });
    });

    return selectedItemsInfo;
  };

  connectedCallback() {
    // If the getImagePathCallback was not previously registered
    if (
      !getControlRegisterProperty("getImagePathCallback", "ch-tree-view-render")
    ) {
      registerDefaultGetImagePathCallback(this);
    }

    // Accessibility
    this.el.setAttribute("role", "tree");
  }

  componentWillLoad() {
    this.#flattenModel();
  }

  componentWillRender() {
    if (
      !this.#selectedChangeScheduled &&
      !this.#checkedChangeScheduled &&
      !this.#applyFilters
    ) {
      return;
    }

    // If the filters must be applied, we must let the filters decided which
    // are the selected and checked items
    if (this.#applyFilters) {
      this.#updateFilters();
      this.#applyFilters = false;
      return;
    }

    this.#validateCheckedAndSelectedItems();
  }

  render() {
    return (
      <Host aria-multiselectable={this.multiSelection.toString()}>
        <ch-tree-view
          multiSelection={this.multiSelection}
          selectedItemsCallback={this.#getSelectedItemsCallback}
          waitDropProcessing={this.waitDropProcessing}
          onDroppableZoneEnter={this.#handleDroppableZoneEnter}
          onExpandedItemChange={this.#handleExpandedItemChange}
          onItemContextmenu={this.#handleItemContextmenu}
          onItemsDropped={this.#handleItemsDropped}
          onSelectedItemsChange={this.#handleSelectedItemsChange}
          ref={el => (this.#treeRef = el)}
        >
          {this.model.map((itemModel, index) =>
            this.renderItem(
              itemModel,
              this,
              this.#treeHasFilters(),
              this.showLines !== "none" && index === this.model.length - 1,
              0,
              this.dropMode !== "above" && this.dropDisabled !== true,
              this.useGxRender
            )
          )}
        </ch-tree-view>
      </Host>
    );
  }
}

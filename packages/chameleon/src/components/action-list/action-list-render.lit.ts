import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import { removeIndex } from "../../utilities/array";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import { adoptCommonThemes } from "../../utilities/theme.js";
import { mouseEventModifierKey } from "../../utilities/focus-composed-path";
import { flattenActionListUIModel } from "./flatten-model";
import type {
  ActionListCaptionChangeEventDetail,
  ActionListFixedChangeEventDetail
} from "./internal/action-list-item/types";
import { actionListKeyboardNavigation } from "./keyboard-navigation";
import {
  selectedItemsChangeShouldBeEmitted,
  setActionListSelectedItems
} from "./selections";
import { actionListDefaultTranslations } from "./translations";
import type { ActionListTranslations } from "./translations";
import type {
  ActionListImagePathCallback,
  ActionListItemActionable,
  ActionListItemGroup,
  ActionListItemModel,
  ActionListItemModelExtended,
  ActionListItemModelExtendedGroup,
  ActionListItemModelExtendedRoot,
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

// Side-effect imports to define the internal sub-components
import type { ChActionListItem } from "./internal/action-list-item/action-list-item.lit";
import "./internal/action-list-item/action-list-item.lit";
import "./internal/action-list-group/action-list-group.lit";

import styles from "./action-list-render.scss?inline";

const DEFAULT_EDITABLE_ITEMS_VALUE = true;
// const DEFAULT_ORDER_VALUE = 0;

// const defaultGetImagePath: ActionListImagePathCallback = (imgSrc: string) =>
//   imgSrc;

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

/**
 * The `ch-action-list-render` component renders an interactive list of actionable items driven by a declarative model.
 *
 * @remarks
 * ## Features
 *  - Single and multiple selection with modifier-key multi-select.
 *  - In-place caption editing with optimistic UI updates.
 *  - Item pinning (fixed) and sorting.
 *  - Grouping with expandable/collapsible sections.
 *  - Programmatic add/remove operations.
 *  - Three item types: `actionable`, `group`, and `separator`.
 *  - Keyboard navigation.
 *
 * ## Use when
 *  - You need a rich, data-driven list with selection semantics (e.g., panel lists, filterable sidebars, or reorderable collections).
 *  - Command palettes, selection panels, or item management lists where users can pick, pin, edit, or remove items.
 *
 * ## Do not use when
 *  - You need a simple static list without selection or editing -- use a plain HTML list instead.
 *  - Navigation is the primary purpose -- prefer `ch-navigation-list-render`.
 *  - The list is hierarchical -- prefer `ch-tree-view-render`.
 *
 * ## Accessibility
 *  - The host element has `role="list"` with `aria-multiselectable` when `selection` is `"multiple"`.
 *  - Separator items have `role="separator"` and `aria-hidden="true"`.
 *  - Supports keyboard navigation: arrow keys move focus between items, Enter/Space selects, and modifier-click enables multi-select.
 *
 * @status experimental
 *
 * @part separator - A horizontal divider rendered between items when the model contains an item of `type: "separator"`.
 *
 * @part item__action - The clickable row element for each actionable item.
 * @part item__caption - The text caption inside an actionable item.
 * @part item__checkbox - The checkbox element rendered when `checkbox` is `true`.
 *
 * @part group__action - The clickable header row for a group item.
 * @part group__caption - The text caption inside a group header.
 * @part group__expandable - The expandable/collapsible container for a group's children.
 *
 * @part disabled - Present in the `item__action`, `item__caption`, `group__action`, and `group__caption` parts when the item is disabled.
 * @part expanded - Present in the `group__expandable` part when the group is expanded.
 * @part collapsed - Present in the `group__expandable` part when the group is collapsed.
 * @part selected - Present in the `item__action` and `group__action` parts when the item is selected.
 * @part not-selected - Present in the `item__action` and `group__action` parts when the item is not selected.
 */
@Component({
  styles,
  tag: "ch-action-list-render"
})
export class ChActionListRender extends KasstorElement {
  #flattenedModel: Map<string, ActionListItemModelExtended> = new Map();
  // #additionalItemsParts: Set<string> | undefined;
  #selectedItems: Set<string> | undefined = undefined;

  #keydownHandler: ((event: KeyboardEvent) => void) | undefined;

  constructor() {
    super();

    // Handle click events via addEventListener in the constructor (like nav-list)
    this.addEventListener("click", this.#handleClick as EventListener);
  }

  /**
   * Set this attribute if you want display a checkbox in all items by default.
   */
  @property({ type: Boolean }) checkbox: boolean = false;

  /**
   * Set this attribute if you want the checkbox to be checked in all items by
   * default.
   * Only works if `checkbox = true`
   */
  @property({ type: Boolean }) checked: boolean = false;

  /**
   * This attribute lets you specify if all items are disabled.
   * If disabled, action list items will not fire any user interaction related
   * event (for example, `selectedItemsChange` event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * This attribute lets you specify if the edit operation is enabled in all
   * items by default. If `true`, the items can edit its caption in place.
   * Note: the default value is `true`, so items are editable unless
   * explicitly disabled.
   */
  @property({ type: Boolean, attribute: "editable-items" })
  editableItems: boolean = DEFAULT_EDITABLE_ITEMS_VALUE;

  /**
   * Callback that is executed when and item requests to be fixed/unfixed.
   * If the callback is not defined, the item will be fixed/unfixed without
   * further confirmation.
   */
  @property({ attribute: false }) fixItemCallback:
    | ((
        itemInfo: ActionListItemActionable,
        newFixedValue: boolean
      ) => Promise<boolean>)
    | undefined;

  /**
   * This property specifies a callback that is executed when the path for an
   * imgSrc needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback:
    | ActionListImagePathCallback
    | undefined;

  /**
   * This property lets you define the model of the control. The model is an
   * array of `ActionListItemModel` objects. Each item has a `type`
   * (`"actionable"`, `"group"`, or `"separator"`), an `id`, a `caption`,
   * and optional properties such as `selected`, `disabled`, `fixed`, `order`,
   * and nested `items` (for groups).
   */
  @property({ attribute: false }) model: ActionListModel = [];
  @Observe("model")
  protected modelChanged() {
    this.#flattenUIModel(this.model);
    this.#updateAndEmitSelectedItems(this.selection);
  }

  /**
   * Callback that is executed when a item request to modify its caption.
   */
  @property({ attribute: false }) modifyItemCaptionCallback:
    | ((actionListItemId: string, newCaption: string) => Promise<void>)
    | undefined;

  /**
   * This property allows us to implement custom rendering of action-list items.
   */
  @property({ attribute: false }) renderItem:
    | ((
        itemModel: ActionListItemModel,
        actionListRenderState: ChActionListRender,
        disabled?: boolean,
        nested?: boolean,
        nestedExpandable?: boolean
      ) => TemplateResult | typeof nothing)
    | undefined;

  /**
   * Callback that is executed when and item requests to be removed.
   * If the callback is not defined, the item will be removed without further
   * confirmation.
   */
  @property({ attribute: false }) removeItemCallback:
    | ((itemInfo: ActionListItemActionable) => Promise<boolean>)
    | undefined;

  /**
   * Specifies the type of selection implemented by the control.
   *  - `"none"`: No selection; item clicks fire the `itemClick` event.
   *  - `"single"`: Only one item can be selected at a time.
   *  - `"multiple"`: Multiple items can be selected using modifier-key clicks.
   */
  @property() selection: "single" | "multiple" | "none" = "none";
  @Observe("selection")
  protected selectionChanged() {
    this.#updateAndEmitSelectedItems(this.selection);
  }

  /**
   * Callback that is executed when the action-list model is changed to order its items.
   */
  @property({ attribute: false }) sortItemsCallback: (
    subModel: ActionListModel
  ) => void = defaultSortItemsCallback;

  /**
   * Specifies the literals required for the control.
   */
  @property({ attribute: false }) translations: ActionListTranslations =
    actionListDefaultTranslations;

  /**
   * Fired when the selected items change and `selection !== "none"`
   */
  @Event() protected selectedItemsChange!: EventEmitter<
    ActionListItemModelExtended[]
  >;

  /**
   * Fired when an item is clicked and `selection === "none"`.
   * Applies for items that have `type === "actionable"` or
   * (`type === "group"` and `expandable === true`)
   */
  @Event() protected itemClick!: EventEmitter<ActionListItemModelExtended>;

  /**
   * Adds an item in the control.
   *
   * If the item already exists, the operation is canceled.
   *
   * If the `groupParentId` property is specified the item is added in the
   * group determined by `groupParentId`. It only works if the item to add
   * has `type === "actionable"`
   */
  addItem(itemInfo: ActionListItemModel, groupParentId?: string): void {
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

    this.requestUpdate();
  }

  /**
   * Given a list of ids, it returns an array of the items that exists in the
   * given list.
   */
  getItemsInfo(itemsId: string[]): ActionListItemModelExtended[] {
    return this.#getItemsInfo(itemsId);
  }

  /**
   * Remove the item and all its descendants from the control.
   */
  removeItem(itemId: string): void {
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
  updateItemProperties(
    itemId: string,
    properties: Partial<ActionListItemModel> & { type: ActionListItemType }
  ): void {
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

    this.requestUpdate();
  }

  #onCaptionChange = (event: CustomEvent<ActionListCaptionChangeEventDetail>) => {
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
      ) as ChActionListItem | undefined;
    if (!itemRef) {
      return;
    }

    const itemId = event.detail.itemId;
    const itemUIModel = this.#flattenedModel.get(itemId);
    const itemInfo = itemUIModel!.item as ActionListItemActionable;
    const newCaption = event.detail.newCaption;
    const oldCaption = itemInfo.caption;

    // Optimistic UI: Update the caption in the UI Model before the change is
    // completed in the server
    itemInfo.caption = newCaption;
    itemRef.caption = newCaption;

    this.modifyItemCaptionCallback(itemId, newCaption)
      .then(() => {
        // Sort items in parent model
        this.#sortModel(getParentArray(itemUIModel!));

        // Update filters
        // this.#scheduleFilterProcessing();

        // Force re-render
        this.requestUpdate();
      })
      .catch(() => {
        // TODO: Should we do something with the error message?
        itemRef.caption = oldCaption;
        itemInfo.caption = oldCaption;
      });
  };

  #onFixedChange = (event: CustomEvent<ActionListFixedChangeEventDetail>) => {
    const detail = event.detail;

    const itemUIModel = this.#flattenedModel.get(detail.itemId);
    const itemInfo = itemUIModel!.item as ActionListItemActionable;

    if (!this.fixItemCallback) {
      this.#updateItemFix(itemUIModel!, itemInfo, detail.value);
      return;
    }

    this.fixItemCallback(itemInfo, detail.value).then(acceptChange => {
      if (acceptChange) {
        this.#updateItemFix(itemUIModel!, itemInfo, detail.value);
      }
    });
  };

  #updateItemFix = (
    itemUIModel: ActionListItemModelExtended,
    itemInfo: ActionListItemActionable,
    newFixedValue: boolean
  ) => {
    itemInfo.fixed = newFixedValue;

    // Sort items in parent model
    this.#sortModel(getParentArray(itemUIModel));

    // Queue a re-render to update the fixed binding and the order of the items
    this.requestUpdate();
  };

  #onRemove = (event: CustomEvent<string>) => {
    const itemUIModel = this.#flattenedModel.get(event.detail);

    if (!this.removeItemCallback) {
      this.#removeItem(itemUIModel!);

      return;
    }

    this.removeItemCallback(
      itemUIModel!.item as ActionListItemActionable
    ).then(acceptRemove => {
      if (acceptRemove) {
        this.#removeItem(itemUIModel!);
      }
    });
  };

  #getItemOrGroupInfo = (itemId: string) =>
    getActionListItemOrGroupInfo(itemId, this.#flattenedModel);

  #updateAndEmitSelectedItems = (
    selection: "single" | "multiple" | "none"
  ) => {
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
        this.requestUpdate();
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

  #handleClick = (event: PointerEvent) => {
    if (this.selection === "none") {
      this.#handleItemClick(event);
    } else {
      this.#handleItemSelection(event);
    }
  };

  #handleItemClick = (event: PointerEvent) => {
    const actionListItemOrGroup = getActionListOrGroupItemFromEvent(event);

    if (
      !actionListItemOrGroup ||
      (actionListItemOrGroup as ChActionListItem).editing
    ) {
      return;
    }
    const itemInfo = this.#getItemOrGroupInfo(actionListItemOrGroup.id);
    this.#checkIfMustExpandCollapseGroup(itemInfo);

    if (itemInfo.type === "group" && !itemInfo.expandable) {
      return;
    }
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
      this.requestUpdate();
    }
  };

  #handleItemSelection = (event: PointerEvent) => {
    const actionListItemOrGroup = getActionListOrGroupItemFromEvent(event);

    if (
      !actionListItemOrGroup ||
      (actionListItemOrGroup as ChActionListItem).editing
    ) {
      return;
    }
    const itemId = actionListItemOrGroup.id;
    const itemInfo = this.#getItemOrGroupInfo(itemId);

    const ctrlKeyIsPressed = mouseEventModifierKey(event);
    const itemWasSelected = this.#selectedItems!.has(itemId);
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
        ...this.#selectedItems!.keys()
      ][0];

      // Remove the previous selected item
      if (previousSelectedItemId) {
        this.#selectedItems!.clear();

        const previousSelectedItemInfo = this.#getItemOrGroupInfo(
          previousSelectedItemId
        );
        previousSelectedItemInfo.selected = false;
      }

      // If the item was not selected, add it to the Set. If the item was
      // selected, the previous if removes the item
      if (!itemWasSelected) {
        this.#selectedItems!.add(itemId);
      }

      itemInfo.selected = !itemWasSelected;
      this.#emitSelectedItemsChange();
      this.requestUpdate();
      return;
    }

    // - - - - - - - - - - Multiple selection - - - - - - - - - -
    if (ctrlKeyIsPressed) {
      // The item was selected, deselect the item
      if (itemWasSelected) {
        this.#selectedItems!.delete(itemId);
      }
      // Otherwise, select the item
      else {
        this.#selectedItems!.add(itemId);
      }

      itemInfo.selected = !itemWasSelected;
    } else {
      this.#checkIfMustExpandCollapseGroup(itemInfo);

      // Remove the selection from all items
      this.#removeAllSelectedItems();

      this.#selectedItems!.add(itemId);
      itemInfo.selected = true;
    }

    this.#emitSelectedItemsChange();
    this.requestUpdate();
  };

  #emitSelectedItemsChange = () => {
    const selectedItemsInfo = this.#getItemsInfo([
      ...this.#selectedItems!.keys()
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
      removeIndex(parentArray, itemToRemoveIndex);
    }

    this.#flattenedModel.delete(itemToRemoveId);

    // Queue a re-render
    this.requestUpdate();
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

  #defaultRenderItem = (
    itemModel: ActionListItemModel,
    _actionListRenderState: ChActionListRender,
    disabled?: boolean,
    nested?: boolean,
    nestedExpandable?: boolean
  ): TemplateResult | typeof nothing => {
    if (itemModel.type === "separator") {
      return html`<div
        role="separator"
        aria-hidden="true"
        class="separator"
        part="separator"
      ></div>`;
    }

    if (itemModel.type === "group") {
      return html`<ch-action-list-group
        id=${itemModel.id}
        .caption=${itemModel.caption}
        .disabled=${itemModel.disabled ?? this.disabled}
        .expandable=${itemModel.expandable}
        .expanded=${itemModel.expanded}
        .selected=${itemModel.selected}
      >
        ${itemModel.items?.map(item =>
          this.#actualRenderItem(
            item,
            this,
            itemModel.disabled,
            true,
            itemModel.expandable
          )
        )}
      </ch-action-list-group>`;
    }

    // Actionable
    return html`<ch-action-list-item
      id=${itemModel.id}
      .additionalInfo=${itemModel.additionalInformation ?? nothing}
      .caption=${itemModel.caption}
      .checkbox=${itemModel.checkbox ?? this.checkbox}
      .checked=${itemModel.checked ?? this.checked}
      .disabled=${disabled === true
        ? true
        : itemModel.disabled ?? this.disabled}
      .editable=${itemModel.editable ?? this.editableItems}
      .fixed=${itemModel.fixed}
      .getImagePathCallback=${this.getImagePathCallback ?? nothing}
      .metadata=${itemModel.metadata ?? nothing}
      .nested=${nested ?? false}
      .nestedExpandable=${nestedExpandable ?? false}
      .selectable=${this.selection !== "none"}
      .selected=${itemModel.selected}
      .translations=${this.translations}
    ></ch-action-list-item>`;
  };

  #actualRenderItem = (
    itemModel: ActionListItemModel,
    actionListRenderState: ChActionListRender,
    disabled?: boolean,
    nested?: boolean,
    nestedExpandable?: boolean
  ): TemplateResult | typeof nothing => {
    const renderFn = this.renderItem ?? this.#defaultRenderItem;
    return renderFn(
      itemModel,
      actionListRenderState,
      disabled,
      nested,
      nestedExpandable
    );
  };

  override connectedCallback(): void {
    super.connectedCallback();

    // When used in Astro with ViewTransitions, the connectedCallback can be
    // executed without a shadowRoot attached, because the element is being moved
    if (!this.shadowRoot) {
      return;
    }

    // Static attributes that we included in the Host functional component to
    // eliminate additional overhead
    this.setAttribute("role", "list");
    this.classList.add(SCROLLABLE_CLASS);
    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);

    // Listen for composed events from internal items
    this.addEventListener(
      "captionChange",
      this.#onCaptionChange as EventListener
    );
    this.addEventListener(
      "fixedChange",
      this.#onFixedChange as EventListener
    );
    this.addEventListener("remove", this.#onRemove as EventListener);

    // Keyboard navigation
    this.#keydownHandler = actionListKeyboardNavigation(
      this,
      this.#flattenedModel
    );
    this.addEventListener("keydown", this.#keydownHandler);
  }

  protected override firstWillUpdate(): void {
    this.#flattenUIModel(this.model);
    this.#updateAndEmitSelectedItems(this.selection);
  }

  override disconnectedCallback(): void {
    this.removeEventListener(
      "captionChange",
      this.#onCaptionChange as EventListener
    );
    this.removeEventListener(
      "fixedChange",
      this.#onFixedChange as EventListener
    );
    this.removeEventListener("remove", this.#onRemove as EventListener);

    if (this.#keydownHandler) {
      this.removeEventListener("keydown", this.#keydownHandler);
    }

    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    // Update the aria-multiselectable attribute
    if (this.selection === "multiple") {
      this.setAttribute("aria-multiselectable", "true");
    } else {
      this.removeAttribute("aria-multiselectable");
    }
  }

  protected override render() {
    return this.model == null
      ? nothing
      : repeat(
          this.model,
          item => item.id,
          item => this.#actualRenderItem(item, this, false, false, false)
        );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-action-list-render": ChActionListRender;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChActionListRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChActionListRenderElement;
  }

  /** Type of the `ch-action-list-render`'s `selectedItemsChange` event. */
  // prettier-ignore
  type HTMLChActionListRenderElementSelectedItemsChangeEvent = HTMLChActionListRenderElementCustomEvent<
    HTMLChActionListRenderElementEventMap["selectedItemsChange"]
  >;

  /** Type of the `ch-action-list-render`'s `itemClick` event. */
  // prettier-ignore
  type HTMLChActionListRenderElementItemClickEvent = HTMLChActionListRenderElementCustomEvent<
    HTMLChActionListRenderElementEventMap["itemClick"]
  >;

  interface HTMLChActionListRenderElementEventMap {
    selectedItemsChange: ActionListItemModelExtended[];
    itemClick: ActionListItemModelExtended;
  }

  interface HTMLChActionListRenderElementEventTypes {
    selectedItemsChange: HTMLChActionListRenderElementSelectedItemsChangeEvent;
    itemClick: HTMLChActionListRenderElementItemClickEvent;
  }

  /**
   * The `ch-action-list-render` component renders an interactive list of actionable items driven by a declarative model.
   *
   * @remarks
   * ## Features
   *  - Single and multiple selection with modifier-key multi-select.
   *  - In-place caption editing with optimistic UI updates.
   *  - Item pinning (fixed) and sorting.
   *  - Grouping with expandable/collapsible sections.
   *  - Programmatic add/remove operations.
   *  - Three item types: `actionable`, `group`, and `separator`.
   *  - Keyboard navigation.
   *
   * ## Use when
   *  - You need a rich, data-driven list with selection semantics (e.g., panel lists, filterable sidebars, or reorderable collections).
   *  - Command palettes, selection panels, or item management lists where users can pick, pin, edit, or remove items.
   *
   * ## Do not use when
   *  - You need a simple static list without selection or editing -- use a plain HTML list instead.
   *  - Navigation is the primary purpose -- prefer `ch-navigation-list-render`.
   *  - The list is hierarchical -- prefer `ch-tree-view-render`.
   *
   * ## Accessibility
   *  - The host element has `role="list"` with `aria-multiselectable` when `selection` is `"multiple"`.
   *  - Separator items have `role="separator"` and `aria-hidden="true"`.
   *  - Supports keyboard navigation: arrow keys move focus between items, Enter/Space selects, and modifier-click enables multi-select.
   *
   * @status experimental
   *
   * @part separator - A horizontal divider rendered between items when the model contains an item of `type: "separator"`.
   *
   * @part item__action - The clickable row element for each actionable item.
   * @part item__caption - The text caption inside an actionable item.
   * @part item__checkbox - The checkbox element rendered when `checkbox` is `true`.
   *
   * @part group__action - The clickable header row for a group item.
   * @part group__caption - The text caption inside a group header.
   * @part group__expandable - The expandable/collapsible container for a group's children.
   *
   * @part disabled - Present in the `item__action`, `item__caption`, `group__action`, and `group__caption` parts when the item is disabled.
   * @part expanded - Present in the `group__expandable` part when the group is expanded.
   * @part collapsed - Present in the `group__expandable` part when the group is collapsed.
   * @part selected - Present in the `item__action` and `group__action` parts when the item is selected.
   * @part not-selected - Present in the `item__action` and `group__action` parts when the item is not selected.
   *
   * @fires selectedItemsChange Fired when the selected items change and `selection !== "none"`
   * @fires itemClick Fired when an item is clicked and `selection === "none"`.
   *   Applies for items that have `type === "actionable"` or
   *   (`type === "group"` and `expandable === true`)
   */
  // prettier-ignore
  interface HTMLChActionListRenderElement extends ChActionListRender {
    // Extend the ChActionListRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChActionListRenderElementEventTypes>(type: K, listener: (this: HTMLChActionListRenderElement, ev: HTMLChActionListRenderElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChActionListRenderElementEventTypes>(type: K, listener: (this: HTMLChActionListRenderElement, ev: HTMLChActionListRenderElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-action-list-render": HTMLChActionListRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-action-list-render": HTMLChActionListRenderElement;
  }
}


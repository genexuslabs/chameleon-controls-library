import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import {
  AccessibleNameComponent,
  DisableableComponent
} from "../../common/interfaces";
import {
  ComboBoxSuggestOptions,
  ComboBoxItemModel,
  ComboBoxItemGroup,
  ComboBoxItemLeaf,
  ComboBoxSuggestInfo,
  ComboBoxModel,
  ComboBoxSelectedIndex,
  ComboBoxItemModelExtended
} from "./types";
import { isMobileDevice } from "../../common/utils";
import { KEY_CODES } from "../../common/reserved-names";
import { ChPopoverCustomEvent } from "../../components";
import { ChPopoverAlign } from "../popover/types";
import { focusComposedPath } from "../common/helpers";
import { filterSubModel } from "./helpers";
import {
  findComboBoxLargestValue,
  getComboBoxItemImageCustomVars,
  mapValuesToItemInfo,
  popoverWasClicked
} from "./utils";
import { findNextSelectedIndex, findSelectedIndex } from "./navigation";

const SELECTED_PART = "selected";
const DISABLED_PART = "disabled";

const SELECTED_ITEM_SELECTOR = `button[part*='${SELECTED_PART}']`;
const mobileDevice = isMobileDevice();

let autoId = 0;

// Keys
type KeyDownNoFiltersEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END
  | typeof KEY_CODES.ENTER
  | typeof KEY_CODES.SPACE
  | typeof KEY_CODES.TAB;

type KeyDownWithFiltersEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ENTER
  | typeof KEY_CODES.TAB;

type ImmediateFilter = "immediate" | "debounced" | undefined;

/**
 * @status experimental
 *
 * The ch-combo-box-render is an input widget that has an associated popup. The
 * popup enables users to choose a value for the input from a collection.
 *  - Items are only rendered when the popup is displayed.
 *
 * @part ... - ...
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "combo-box.scss",
  tag: "ch-combo-box-render"
})
export class ChComboBoxRender
  implements AccessibleNameComponent, DisableableComponent
{
  #accessibleNameFromExternalLabel: string | undefined;
  #popoverId: string | undefined;

  /**
   * This variable is used to emulate the behavior of the native select. The
   * native select decides its min size based on the size of the largest option.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #largestValue: string;

  /**
   * Caption of the item identified by the value property
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #currentValueCaption: string;

  #valueToItemInfo: Map<string, ComboBoxItemModelExtended> = new Map();

  #itemCaptionToItemValue: Map<string, string> = new Map();

  // Filters info
  #applyFilters = false;
  #immediateFilter: ImmediateFilter;
  #queuedFilterId: NodeJS.Timeout;

  /**
   * Collection of displayed values. If a filter is applied and the value
   * belongs to this Set, the item is displayed.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #displayedValues: Set<string> | undefined; // Don't allocate memory until needed

  /**
   * When the control is used in a desktop environment, we need to manually
   * focus the selected item when the control is expanded.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #focusSelectAfterNextRender = true;

  #selectNextIndex = (
    event: KeyboardEvent,
    currentSelectedIndex: ComboBoxSelectedIndex,
    increment: 1 | -1,
    hasFilters: boolean,
    displayedValues: Set<string>
  ) => {
    event.preventDefault(); // Stop ArrowDown key from scrolling

    const nextSelectedIndex =
      currentSelectedIndex.type === "not-exists"
        ? findNextSelectedIndex(
            this.model,
            {
              type: "first-level",
              firstLevelIndex: increment === 1 ? -1 : this.model.length
            },
            increment,
            hasFilters,
            displayedValues
          )
        : findNextSelectedIndex(
            this.model,
            currentSelectedIndex,
            increment,
            hasFilters,
            displayedValues
          );

    if (nextSelectedIndex.type === "not-exists") {
      return;
    }

    // The new selected value is either in the first level or in the group
    const newSelectedValue =
      nextSelectedIndex.type === "first-level"
        ? this.model[nextSelectedIndex.firstLevelIndex].value
        : (this.model[nextSelectedIndex.firstLevelIndex] as ComboBoxItemGroup)
            .items[nextSelectedIndex.secondLevelIndex].value;

    if (this.currentSelectedValue !== newSelectedValue) {
      this.currentSelectedValue = newSelectedValue;
      this.#focusSelectAfterNextRender = true;
    }
  };

  // Keyboard events when the control has no filters
  #keyEventsNoFiltersDictionary: {
    [key in KeyDownNoFiltersEvents]: (event: KeyboardEvent) => void;
  } = {
    ArrowUp: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.currentSelectedValue),
        -1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    ArrowDown: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.currentSelectedValue),
        1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    Home: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        {
          type: "first-level",
          firstLevelIndex: -1
        }, // The algorithm will sum 1 to the start index
        1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    End: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        {
          type: "first-level",
          firstLevelIndex: this.model.length
        }, // The algorithm will sum -1 to the start index
        -1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    Enter: () => {
      // The focus must return to the Host when closing the popover
      if (this.expanded) {
        this.el.focus();
      }

      this.expanded = !this.expanded;
    },

    Space: event => {
      event.preventDefault(); // Stop space key from scrolling

      // Only expands the ComboBox
      this.expanded ||= true;
    },

    Tab: event => {
      // The focus must return to the Host when tabbing with the popover
      // expanded
      if (this.expanded) {
        event.preventDefault();

        this.el.focus();
        this.expanded = false;
      }
    }
  };

  // Keyboard events when the control has filters
  #keyEventsWithFiltersDictionary: {
    [key in KeyDownWithFiltersEvents]: (event: KeyboardEvent) => void;
  } = {
    ArrowUp: (event: KeyboardEvent) => {
      if (this.expanded) {
        this.#keyEventsNoFiltersDictionary.ArrowUp(event);
      } else {
        this.expanded = true;
      }
    },

    ArrowDown: (event: KeyboardEvent) => {
      if (this.expanded) {
        this.#keyEventsNoFiltersDictionary.ArrowDown(event);
      } else {
        this.expanded = true;
      }
    },

    Enter: (event: KeyboardEvent) =>
      this.#checkAndEmitValueChangeWithFilters(event),

    Tab: (event: KeyboardEvent) =>
      this.#checkAndEmitValueChangeWithFilters(event)
  };

  // Refs
  // #maskRef: HTMLDivElement;
  #inputRef: HTMLInputElement;
  #selectRef: HTMLSelectElement | undefined;

  /**
   * When the combo-box is expanded, the visually selected value must change,
   * but in the interface the `value` property must only change when the
   * popover is closed.
   * This state help us to render the visually selected value, without updating
   * the `value` property in the interface.
   */
  @State() currentSelectedValue: string;

  @State() expanded = false;
  @Watch("expanded")
  handleExpandedChange(newExpandedValue: boolean) {
    if (newExpandedValue && !mobileDevice) {
      this.#focusSelectAfterNextRender = true;

      // When the control is expanded and has filters applied, we should
      // refresh the rendered items without any debounce
      if (this.suggest) {
        this.currentSelectedValue = undefined; // Clear selected value when expanding with filters
        this.#scheduleFilterProcessing("immediate");
      }
    }
  }

  @AttachInternals() internals: ElementInternals;

  @Element() el: HTMLChComboBoxRenderElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property lets you determine the expression that will be applied to the
   * filter.
   * Only works if `suggest === true`.
   */
  @Prop({ mutable: true }) filter: string;
  @Watch("filter")
  filterChanged() {
    if (this.suggest) {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * Specifies the items of the control
   */
  @Prop() readonly model: ComboBoxModel = [];
  @Watch("model")
  modelChanged(newModel: ComboBoxModel) {
    this.#findLargestValue(this.model);
    mapValuesToItemInfo(
      newModel,
      this.#valueToItemInfo,
      this.#itemCaptionToItemValue
    );
    this.#checkIfCurrentSelectedValueIsNoLongerValid();

    // This must be the last operation, since it needs to wait for the UI Model
    // Map to be updated (#valueToItemInfo)
    this.#setValueInForm(this.value);
  }

  /**
   * This attribute indicates that multiple options can be selected in the list.
   * If it is not specified, then only one option can be selected at a time.
   * When multiple is specified, the control will show a scrolling list box
   * instead of a single line dropdown.
   */
  @Prop() readonly multiple: boolean = false;

  /**
   * A hint to the user of what can be entered in the control. Same as
   * [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)
   * attribute for `input` elements.
   */
  @Prop() readonly placeholder: string;

  /**
   * Specifies the inline alignment of the popover.
   */
  @Prop() readonly popoverInlineAlign: ChPopoverAlign = "inside-start";

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * Specifies whether the control can be resized. If `true` the control can be
   * resized at runtime by dragging the edges or corners.
   */
  @Prop() readonly resizable: boolean = false;

  /**
   * This property lets you specify if the control behaves like a suggest.
   * If `true` the combo-box value will be editable an displayed items will be
   * filtered according to the input's value.                                                                         |
   */
  @Prop() readonly suggest: boolean = false;
  @Watch("suggest")
  suggestChanged() {
    this.#scheduleFilterProcessing("immediate");
  }

  /**
   * This property lets you determine the debounce time (in ms) that the
   * control waits until it processes the changes to the filter property.
   * Consecutive changes to the `filter` property between this range, reset the
   * timeout to process the filter.
   * Only works if `suggest === true`.
   */
  @Prop() readonly suggestDebounce: number = 250;
  @Watch("suggestDebounce")
  suggestDebounceChanged() {
    if (this.suggest) {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * This property lets you determine the options that will be applied to the
   * filter.
   */
  @Prop() readonly suggestOptions: ComboBoxSuggestOptions = {};
  @Watch("suggestOptions")
  suggestOptionsChanged() {
    this.#scheduleFilterProcessing("immediate");
  }

  /**
   * Specifies the value (selected item) of the control.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChange(newValue: string) {
    this.#setValueInForm(newValue);
  }

  /**
   * Emitted when a change to the element's filter is committed by the user.
   * Only applies if `suggest === true`. It contains the information about
   * the new filter value.
   *
   * This event is debounced by the `suggestDebounce` value.
   */
  @Event() filterChange: EventEmitter<string>;

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   */
  @Event() input: EventEmitter<string>;

  #findLargestValue = (model: ComboBoxModel) => {
    this.#largestValue = findComboBoxLargestValue(model);
  };

  #scheduleFilterProcessing = (newImmediateFilter?: ImmediateFilter) => {
    this.#applyFilters = true;

    if (newImmediateFilter !== undefined) {
      this.#immediateFilter ??= newImmediateFilter;
    }
  };

  #filterFunction = (modelIsAlreadyFiltered: boolean) => {
    // Reset immediate filter
    this.#immediateFilter = undefined;

    // New filter value
    this.filterChange.emit(this.filter);

    if (modelIsAlreadyFiltered) {
      return;
    }
    this.#displayedValues.clear();

    const filterOptions: ComboBoxSuggestInfo = {
      filter: this.filter,
      options: this.suggestOptions
    };

    for (let index = 0; index < this.model.length; index++) {
      const item = this.model[index];
      filterSubModel(item, filterOptions, this.#displayedValues);
    }

    // Remove the selected value if it is no longer rendered
    if (!this.#displayedValues.has(this.currentSelectedValue)) {
      this.currentSelectedValue = undefined;
    }
  };

  #updateFilters = () => {
    if (!this.suggest) {
      this.#displayedValues = undefined;
      return;
    }

    const modelIsAlreadyFiltered = this.#isModelAlreadyFiltered();

    // Remove queued filter processing
    clearTimeout(this.#queuedFilterId);

    const processWithDebounce = this.suggestDebounce > 0;

    // Check if the model already contains the filtered items
    if (!modelIsAlreadyFiltered) {
      this.#displayedValues ??= new Set();
    }

    // Check if should filter with debounce
    if (processWithDebounce && this.#immediateFilter !== "immediate") {
      this.#queuedFilterId = setTimeout(() => {
        this.#filterFunction(modelIsAlreadyFiltered);
        forceUpdate(this); // After the filter processing is completed, force a re-render
      }, this.suggestDebounce);
    }
    // No debounce
    else {
      this.#filterFunction(modelIsAlreadyFiltered);
    }
  };

  #checkIfCurrentSelectedValueIsNoLongerValid = () => {
    // If the current selected does not exists in the new model, remove the
    // current selected value. This is necessary to process filters
    if (!this.#valueToItemInfo.get(this.currentSelectedValue)) {
      this.currentSelectedValue = undefined;
    }
  };

  #getCaptionUsingValue = (itemValue: string) =>
    this.#valueToItemInfo.get(itemValue)?.item.caption;

  #getValueUsingCaption = (itemCaption: string) =>
    this.#itemCaptionToItemValue.get(itemCaption);

  #checkAndEmitValueChangeWithNoFilter = () => {
    if (this.currentSelectedValue !== this.value) {
      this.value = this.currentSelectedValue;

      // Emit event
      this.input.emit(this.value);
    }
  };

  #checkAndEmitValueChangeWithFilters = (event: KeyboardEvent) => {
    if (!this.expanded) {
      return;
    }
    this.expanded = false;

    // The focus must return to the Host when tabbing with the popover
    // expanded
    this.el.focus();
    event.preventDefault();

    // "Traditional selection". A value was selected pressing the enter key
    if (this.currentSelectedValue) {
      this.filter = this.#getCaptionUsingValue(this.currentSelectedValue);
      this.#checkAndEmitValueChangeWithNoFilter();
      return;
    }

    // No item was selected and the filters are not strict
    if (!this.suggestOptions?.strict) {
      this.value = this.filter;

      // Emit input event
      this.input.emit(this.value);
      return;
    }

    // Strict selection
    const valueMatchingTheCaption = this.#getValueUsingCaption(this.filter);

    if (valueMatchingTheCaption) {
      this.value = valueMatchingTheCaption;

      // Emit input event
      this.input.emit(this.value);
    }
    // Revert change because the filter does not match any item value
    else {
      this.filter = this.#currentValueCaption;

      // Emit filter change event to recover the previous state
      this.filterChange.emit(this.filter);
    }
  };

  #itemLeafParts = (
    item: ComboBoxItemLeaf,
    insideAGroup: boolean,
    isDisabled: boolean
  ) =>
    `item ${item.value}${insideAGroup ? " nested" : ""}${
      isDisabled ? ` ${DISABLED_PART}` : ""
    }${item.value === this.currentSelectedValue ? ` ${SELECTED_PART}` : ""}`;

  #handleSelectChange = (event: Event) => {
    event.preventDefault();

    this.value = this.#selectRef.value;
    this.currentSelectedValue = this.#selectRef.value;

    // Emit event
    this.input.emit(this.value);
  };

  #handleExpandedChangeWithKeyBoard = (event: KeyboardEvent) => {
    if (!this.suggest) {
      const keyboardHandler = this.#keyEventsNoFiltersDictionary[event.code];

      if (!keyboardHandler) {
        return;
      }
      keyboardHandler(event);

      if (!this.expanded) {
        this.#checkAndEmitValueChangeWithNoFilter();
      }
    }
    // Keyboard implementation for filters
    else {
      const keyboardHandler = this.#keyEventsWithFiltersDictionary[event.code];

      if (keyboardHandler) {
        keyboardHandler(event);
      }
    }
  };

  #handlePopoverClose = (event: ChPopoverCustomEvent<any>) => {
    event.stopPropagation();

    // The focus must return to the Host when the popover is closed using the
    // Escape key
    this.expanded = false;

    // TODO: When destroyItemsOnClose === true, StencilJS would throw 'The
    // "popoverClosed" event was emitted, but the dispatcher node is no longer
    // connected to the dom.', because the popoverOnClose event is emitted twice
    // in the ch-popover

    // Return the focus to the control if the popover was closed with the
    // escape key or by clicking again the combo-box
    if (focusComposedPath().includes(this.el)) {
      this.el.focus();
    }

    // this.#checkAndEmitValueChange();
  };

  #handleInputFilterChange = (event: InputEvent) => {
    event.stopPropagation();
    this.expanded = true;
    this.filter = this.#inputRef.value;
  };

  #displayPopover = (event: MouseEvent) => {
    const clickWasPerformedInALabel = event.detail === 0;

    // TODO: Add a unit test for this case (clicking on the popover should not
    // close the popover)
    if (
      clickWasPerformedInALabel ||
      (this.expanded && popoverWasClicked(event))
    ) {
      return;
    }
    event.stopPropagation();
    this.expanded = !this.expanded;
  };

  #updateCurrentSelectedValue = (itemValue: string) => (event: MouseEvent) => {
    event.stopPropagation();
    this.currentSelectedValue = itemValue;
  };

  #selectValueAndClosePopover = (itemValue: string) => (event: MouseEvent) => {
    event.stopPropagation();

    this.expanded = false;
    this.currentSelectedValue = itemValue;

    // Update current filter, even if no filters are applied. With this, if the
    // suggest property is updated at runtime, the current selected caption
    // won't change
    this.filter = this.#getCaptionUsingValue(itemValue);
    this.#checkAndEmitValueChangeWithNoFilter();
  };

  #toggleExpandInGroup = (itemGroup: ComboBoxItemGroup) => () => {
    this.#valueToItemInfo.get(itemGroup.value).firstExpanded = true;
    itemGroup.expanded = !itemGroup.expanded;

    forceUpdate(this);
  };

  #isModelAlreadyFiltered = () => this.suggestOptions.alreadyProcessed === true;

  #setValueInForm = (value: string) => {
    this.currentSelectedValue = value;
    this.#currentValueCaption = this.#getCaptionUsingValue(value);

    // Update the filter property is there are no filters applied. TODO: USE @State FOR FILTER PROPERTY?
    this.filter = this.#currentValueCaption;

    // Update form value
    this.internals.setFormValue(value);
  };

  #customItemRender =
    (
      insideAGroup: boolean,
      disabled: boolean | undefined,
      filtersAreApplied: boolean
    ) =>
    (item: ComboBoxItemModel, index: number) => {
      if (
        filtersAreApplied &&
        !this.#isModelAlreadyFiltered() &&
        !this.#displayedValues.has(item.value)
      ) {
        return;
      }

      const hasStartImg = !!item.startImgSrc;
      const hasEndImg = !!item.endImgSrc;
      const hasImages = hasStartImg || hasEndImg;

      const customVars = getComboBoxItemImageCustomVars(
        item,
        hasImages,
        hasStartImg,
        hasEndImg
      );

      // This variable inherits the disabled state from group parents. Useful
      // to propagate the disabled state in the child buttons
      const isDisabled = disabled ?? item.disabled;
      const itemGroup = item as ComboBoxItemGroup;
      const canAddListeners = !isDisabled;

      return itemGroup.items != null ? (
        <div
          key={`__group__${item.value}`}
          // TODO: This should be placed in the button
          aria-controls={itemGroup.expandable ? `${index}__content` : null}
          aria-expanded={
            itemGroup.expandable ? (!!itemGroup.expanded).toString() : null
          }
          aria-labelledby={index.toString()}
          role="group"
          class="group"
          part={`group${isDisabled ? ` ${DISABLED_PART}` : ""}`}
        >
          {itemGroup.expandable ? (
            <button
              // TODO: Add ID
              class={{
                // eslint-disable-next-line camelcase
                group__header: true,
                "group--expandable": true,
                "group--collapsed": !itemGroup.expanded
              }}
              part={`group__header expandable${isDisabled ? " disabled" : ""} ${
                itemGroup.expanded ? "expanded" : "collapsed"
              }`}
              style={customVars}
              disabled={isDisabled}
              type="button"
              onClick={canAddListeners && this.#toggleExpandInGroup(itemGroup)}
            >
              <span
                class={{
                  "group__header-caption": true,
                  [`start-img-type--${
                    item.startImgType ?? "background"
                  } img--start`]: hasStartImg,
                  [`end-img-type--${item.endImgType ?? "background"} img--end`]:
                    hasEndImg
                }}
                part="group__header-caption"
              >
                {item.caption}
              </span>
            </button>
          ) : (
            <span
              id={index.toString()}
              class={{
                // eslint-disable-next-line camelcase
                group__header: true,
                [`start-img-type--${
                  item.startImgType ?? "background"
                } img--start`]: hasStartImg,
                [`end-img-type--${item.endImgType ?? "background"} img--end`]:
                  hasEndImg
              }}
              part={`group__header${this.disabled ? " disabled" : ""}`}
              style={customVars}
            >
              {item.caption}
            </span>
          )}

          <div
            key={`__content__${item.value}`}
            id={itemGroup.expandable ? `${index}__content` : null}
            class={{
              // eslint-disable-next-line camelcase
              group__content: true,
              "group__content--collapsed":
                itemGroup.expandable && !itemGroup.expanded
            }}
            part="group__content"
          >
            {(!itemGroup.expandable ||
              this.#valueToItemInfo.get(itemGroup.value).firstExpanded) &&
              itemGroup.items.map(
                this.#customItemRender(true, isDisabled, filtersAreApplied)
              )}
          </div>
        </div>
      ) : (
        <button
          key={item.value}
          role="option"
          // TODO: This should be a string
          aria-selected={item.value === this.currentSelectedValue}
          tabindex="-1"
          class={
            hasImages
              ? {
                  leaf: true,
                  [`start-img-type--${
                    item.startImgType ?? "background"
                  } img--start`]: hasStartImg,
                  [`end-img-type--${item.endImgType ?? "background"} img--end`]:
                    hasEndImg
                }
              : undefined
          }
          part={this.#itemLeafParts(item, insideAGroup, isDisabled)}
          style={customVars}
          disabled={isDisabled}
          type="button"
          onClick={
            canAddListeners && this.#selectValueAndClosePopover(item.value)
          }
          onMouseEnter={
            canAddListeners && this.#updateCurrentSelectedValue(item.value)
          }
        >
          {item.caption}
        </button>
      );
    };

  #nativeItemRender = (item: ComboBoxItemModel) =>
    (item as ComboBoxItemGroup).items != null ? (
      <optgroup label={item.caption}>
        {(item as ComboBoxItemGroup).items.map(this.#nativeItemRender)}
      </optgroup>
    ) : (
      <option
        key={item.value}
        value={item.value}
        disabled={item.disabled}
        selected={item.value === this.value}
      >
        {item.caption}
      </option>
    );

  #nativeRender = () => [
    <span
      aria-hidden={!this.currentSelectedValue ? "true" : null}
      class="value"
    >
      {this.currentSelectedValue
        ? this.#getCaptionUsingValue(this.currentSelectedValue) ??
          this.placeholder
        : this.placeholder}
    </span>,

    <select
      aria-label={this.#accessibleNameFromExternalLabel ?? this.accessibleName}
      disabled={this.disabled}
      onChange={!this.disabled && this.#handleSelectChange}
      ref={el => (this.#selectRef = el)}
    >
      {!this.currentSelectedValue && (
        <option disabled selected value="">
          {this.placeholder}
        </option>
      )}
      {this.model.map(this.#nativeItemRender)}
    </select>
  ];

  connectedCallback() {
    this.#popoverId ??= `ch-combo-box-popover-${autoId++}`;
    this.#findLargestValue(this.model);
    mapValuesToItemInfo(
      this.model,
      this.#valueToItemInfo,
      this.#itemCaptionToItemValue
    );

    this.#setValueInForm(this.value);

    const labels = this.internals.labels;

    // Get external aria-label
    if (labels?.length > 0) {
      this.#accessibleNameFromExternalLabel = labels[0].textContent.trim();
    }
  }

  // Don't trigger the render method if the only changed property is "filter"
  componentShouldUpdate(_newValue, _oldValue, name: string) {
    if (name === "filter") {
      // We need to check this condition here, because only the "filter" prop
      // could be updated and because we return false (to avoid extra re-renders)
      // the componentWillRender method won't be dispatched
      if (this.#applyFilters) {
        this.#updateFilters(); // TODO: THERE IS A BUG IF THE COMBO-BOX STARTS WITH FILTERS APPLIED
        this.#applyFilters = false;
      }

      return false;
    }

    return true;
  }

  componentWillRender() {
    // If the "filter" property was not updated, we still have to check if we
    // should update filters. This verification MUST NOT be implemented in the
    // componentShouldUpdate method, because not all properties are updated in
    // that method, leaving to race-conditions in some cases when checking
    // filters in the componentShouldUpdate method

    if (this.#applyFilters) {
      this.#updateFilters(); // TODO: THERE IS A BUG IF THE COMBO-BOX STARTS WITH FILTERS APPLIED
      this.#applyFilters = false;
    }
  }

  componentDidRender() {
    // Focus the input when there are filters and the control is expanded
    if (this.suggest && this.expanded) {
      this.#focusSelectAfterNextRender = false;
      this.#inputRef.focus();
      return;
    }

    // Only focus elements when filter are not applied
    if (!this.#focusSelectAfterNextRender) {
      return;
    }
    this.#focusSelectAfterNextRender = false;

    const selectedElement = this.el.shadowRoot.querySelector(
      SELECTED_ITEM_SELECTOR
    ) as HTMLElement | undefined;

    // Focus the selected element
    if (selectedElement) {
      // Wait until the JS has been executed to avoid race conditions when
      // rendering elements in the top layer and trying to focus them
      requestAnimationFrame(() => {
        selectedElement.focus();
      });
    }
  }

  render() {
    const filtersAreApplied = this.suggest;
    const disableTextSelection = !this.disabled && !filtersAreApplied;
    const comboBoxIsInteractive = !this.readonly && !this.disabled;

    const currentItemInInput: ComboBoxItemModel | undefined =
      this.#valueToItemInfo.get(
        filtersAreApplied
          ? this.#getValueUsingCaption(this.filter)
          : this.currentSelectedValue
      )?.item;

    const hasStartImg = currentItemInInput && !!currentItemInInput.startImgSrc;

    const customVars = getComboBoxItemImageCustomVars(
      currentItemInInput,
      hasStartImg,
      hasStartImg,
      false
    );

    // TODO: UNIT TESTS.
    // - Clicking the combo-box with JS should not open the popover
    // - User click must open the combo-box
    // - Clicking the combo-box's label should not open the popover

    return (
      <Host
        class={{
          "ch-disabled": this.disabled,
          "ch-combo-box--normal": !filtersAreApplied,
          "ch-combo-box--suggest": filtersAreApplied
        }}
        onKeyDown={
          !mobileDevice &&
          comboBoxIsInteractive &&
          this.#handleExpandedChangeWithKeyBoard
        }
        onClickCapture={
          comboBoxIsInteractive &&
          (!filtersAreApplied || !this.expanded) &&
          this.#displayPopover
        }
      >
        {mobileDevice
          ? this.#nativeRender()
          : [
              <span class="invisible-text">
                {this.#largestValue || this.placeholder}
              </span>,

              <div
                key="combobox"
                role="combobox"
                aria-label={
                  this.#accessibleNameFromExternalLabel ?? this.accessibleName
                }
                tabindex={disableTextSelection ? "0" : null}
                class={{
                  "input-container": true,

                  [`start-img-type--${
                    currentItemInInput?.startImgType ?? "background"
                  } img--start`]: hasStartImg
                }}
                style={customVars}
              >
                <input
                  aria-controls="popover"
                  // This reset is necessary, since we use "disabled" to
                  // disallow the focus and text selection in the input when
                  // the combo-box has no filters
                  aria-disabled={disableTextSelection ? "false" : null}
                  aria-expanded={this.expanded.toString()}
                  aria-haspopup="true"
                  autocomplete="off"
                  class={{
                    value: true,
                    "value--readonly": !filtersAreApplied
                  }}
                  disabled={this.disabled || !filtersAreApplied}
                  placeholder={this.placeholder}
                  readOnly={this.readonly || !filtersAreApplied}
                  value={
                    filtersAreApplied
                      ? this.filter
                      : this.#getCaptionUsingValue(this.currentSelectedValue)
                  }
                  onInputCapture={
                    filtersAreApplied &&
                    comboBoxIsInteractive &&
                    this.#handleInputFilterChange
                  }
                  ref={el => (this.#inputRef = el)}
                ></input>
              </div>,

              this.expanded && (
                <ch-popover
                  key="popover"
                  id="popover"
                  role="listbox"
                  aria-hidden="false" // TODO: Remove this and add a unit test
                  part="window"
                  actionById
                  actionElement={this.el as unknown as HTMLButtonElement} // This is a WA. We should remove it
                  blockAlign="outside-end"
                  inlineAlign={this.popoverInlineAlign}
                  closeOnClickOutside
                  hidden={false}
                  popover="manual"
                  resizable={this.resizable}
                  inlineSizeMatch="action-element-as-minimum"
                  overflowBehavior="add-scroll"
                  positionTry="flip-block"
                  onPopoverClosed={
                    comboBoxIsInteractive && this.#handlePopoverClose
                  }
                >
                  {this.model.map(
                    this.#customItemRender(false, undefined, filtersAreApplied)
                  )}
                </ch-popover>
              )
            ]}
      </Host>
    );
  }
}

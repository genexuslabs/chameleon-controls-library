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
  ComboBoxFilterOptions,
  ComboBoxFilterType,
  ComboBoxItemModel,
  ComboBoxItemGroup,
  ComboBoxItemLeaf,
  ComboBoxFilterInfo,
  ComboBoxModel,
  ComboBoxSelectedIndex,
  ComboBoxItemModelExtended
} from "./types";
import { isMobileDevice } from "../../common/utils";
import { KEY_CODES } from "../../common/reserved-names";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { ChPopoverCustomEvent } from "../../components";
import { ChPopoverAlign } from "../popover/types";
import { focusComposedPath } from "../common/helpers";
import { filterSubModel } from "./helpers";

const SELECTED_PART = "selected";
const DISABLED_PART = "disabled";

const SELECTED_ITEM_SELECTOR = `button[part*='${SELECTED_PART}']`;

const COMBO_BOX_MASK_BLOCK_START = "--ch-combo-box-mask-block-start";
const COMBO_BOX_MASK_BLOCK_END = "--ch-combo-box-mask-block-end";
const COMBO_BOX_MASK_INLINE_START = "--ch-combo-box-mask-inline-start";
const COMBO_BOX_MASK_INLINE_END = "--ch-combo-box-mask-inline-end";

const mobileDevice = isMobileDevice();

let autoId = 0;

const negateBorderValue = (borderSize: string) =>
  borderSize === "0px" ? "0px" : `-${borderSize}`;

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

const SELECTED_VALUE_DOES_NOT_EXISTS: ComboBoxSelectedIndex = {
  type: "not-exists"
} as const;

const isValidIndex = (array: any, index: number) =>
  0 <= index && index < array.length;

const findSelectedIndex = (
  valueToItemInfo: Map<string, ComboBoxItemModelExtended>,
  selectedValue: string | undefined
): ComboBoxSelectedIndex => {
  if (!selectedValue) {
    return SELECTED_VALUE_DOES_NOT_EXISTS;
  }

  return (
    valueToItemInfo.get(selectedValue)?.index ?? SELECTED_VALUE_DOES_NOT_EXISTS
  );
};

const findNextSelectedIndex = (
  model: ComboBoxModel,
  currentIndex: ComboBoxSelectedIndex,
  increment: 1 | -1,
  hasFilters: boolean,
  displayedValues: Set<string>
): ComboBoxSelectedIndex => {
  if (currentIndex.type === "not-exists") {
    return SELECTED_VALUE_DOES_NOT_EXISTS;
  }
  const firstLevelIndex = currentIndex.firstLevelIndex;

  if (currentIndex.type === "nested") {
    let secondLevelIndex = currentIndex.secondLevelIndex + increment; // Start from the first valid index
    const firstLevelItemItems = (model[firstLevelIndex] as ComboBoxItemGroup)
      .items;

    // Search in the nested level skipping disabled and not rendered items
    while (
      isValidIndex(firstLevelItemItems, secondLevelIndex) &&
      (firstLevelItemItems[secondLevelIndex].disabled ||
        (hasFilters &&
          !displayedValues.has(firstLevelItemItems[secondLevelIndex].value)))
    ) {
      secondLevelIndex += increment;
    }

    // If the index is not after the end of the array, the new selected value
    // was found
    if (isValidIndex(firstLevelItemItems, secondLevelIndex)) {
      return {
        type: "nested",
        firstLevelIndex: firstLevelIndex,
        secondLevelIndex: secondLevelIndex
      };
    }
  }

  // At this point, either all items in the nested level were disabled or the
  // "currentIndex" was not nested. In any case, we must check the next item
  // in the first level
  let nextFirstLevelIndex = firstLevelIndex + increment;

  // Search for the next first level item that is not disabled and is not filtered
  while (
    isValidIndex(model, nextFirstLevelIndex) &&
    (model[nextFirstLevelIndex].disabled ||
      (hasFilters && !displayedValues.has(model[nextFirstLevelIndex].value)))
  ) {
    nextFirstLevelIndex += increment;
  }

  // With this flag, we also say that we are at the end of the combo-box
  // and there isn't any new "next value" to select
  if (!isValidIndex(model, nextFirstLevelIndex)) {
    return SELECTED_VALUE_DOES_NOT_EXISTS;
  }

  const nestedLevel = (model[nextFirstLevelIndex] as ComboBoxItemGroup).items;

  if (nestedLevel != null) {
    return findNextSelectedIndex(
      model,
      {
        type: "nested",
        firstLevelIndex: nextFirstLevelIndex,
        secondLevelIndex: increment === 1 ? -1 : nestedLevel.length // The algorithm will sum 1 (or -1) to the start index
      },
      increment,
      hasFilters,
      displayedValues
    );
  }

  return {
    type: "first-level",
    firstLevelIndex: nextFirstLevelIndex
  };
};

type ImmediateFilter = "immediate" | "debounced" | undefined;

/**
 * @part ... - ...
 */
@Component({
  formAssociated: true,
  shadow: true,
  styleUrl: "combo-box.scss",
  tag: "ch-combo-box"
})
export class ChComboBox
  implements AccessibleNameComponent, DisableableComponent
{
  #accessibleNameFromExternalLabel: string | undefined;
  #popoverId: string | undefined;
  #firstExpanded = false;

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

  #borderSizeRAF: SyncWithRAF | undefined;
  #resizeObserver: ResizeObserver | undefined;

  #lastMaskInlineStart = undefined;
  #lastMaskInlineEnd = undefined;
  #lastMaskBlockStart = undefined;
  #lastMaskBlockEnd = undefined;

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
        this.filterType !== "none" && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    ArrowDown: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.currentSelectedValue),
        1,
        this.filterType !== "none" && !this.#isModelAlreadyFiltered(),
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
        this.filterType !== "none" && !this.#isModelAlreadyFiltered(),
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
        this.filterType !== "none" && !this.#isModelAlreadyFiltered(),
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
  #maskRef: HTMLDivElement;
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
    this.#firstExpanded = true;

    if (newExpandedValue && !mobileDevice) {
      this.#focusSelectAfterNextRender = true;

      // When the control is expanded and has filters applied, we should
      // refresh the rendered items without any debounce
      if (this.filterType !== "none") {
        this.currentSelectedValue = undefined; // Clear selected value when expanding with filters
        this.#scheduleFilterProcessing("immediate");
      }
    }
  }

  @AttachInternals() internals: ElementInternals;

  @Element() el: HTMLChComboBoxElement;

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
   * Specifies whether the items should not stay rendered in the DOM if the
   * control is closed.
   * `true` to destroy the rendered items when the control is closed.
   * Note: By default, the control does not rendered the items until the first
   * expansion. The same applies if the control have groups.
   */
  @Prop() readonly destroyItemsOnClose: boolean = false;

  /**
   * This property lets you determine the expression that will be applied to the
   * filter.
   * Only works if `filterType = "caption" | "value"`.
   */
  @Prop({ mutable: true }) filter: string;
  @Watch("filter")
  filterChanged() {
    if (this.filterType === "caption" || this.filterType === "value") {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * This property lets you determine the debounce time (in ms) that the
   * control waits until it processes the changes to the filter property.
   * Consecutive changes to the `filter` property between this range, reset the
   * timeout to process the filter.
   * Only works if `filterType = "caption" | "value"`.
   */
  @Prop() readonly filterDebounce: number = 250;
  @Watch("filterDebounce")
  filterDebounceChanged() {
    if (this.filterType === "caption" || this.filterType === "value") {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * This property lets you determine the options that will be applied to the
   * filter.
   */
  @Prop() readonly filterOptions: ComboBoxFilterOptions = {};
  @Watch("filterOptions")
  filterOptionsChanged() {
    this.#scheduleFilterProcessing("immediate");
  }

  /**
   * This attribute lets you define what kind of filter is applied to items.
   * Only items that satisfy the filter predicate will be displayed.
   *
   * | Value     | Details                                                                                       |
   * | --------- | --------------------------------------------------------------------------------------------- |
   * | `caption` | Show only the items whose `caption` satisfies the regex determinate by the `filter` property. |
   * | `value`   | Show only the items whose `value` satisfies the regex determinate by the `filter` property.   |
   * | `none`    | Show all items.                                                                               |
   */
  @Prop() readonly filterType: ComboBoxFilterType = "none";
  @Watch("filterType")
  filterTypeChanged() {
    this.#scheduleFilterProcessing("immediate");
  }

  /**
   * Specifies the items of the control
   */
  @Prop() readonly model: ComboBoxModel = [];
  @Watch("model")
  modelChanged(newModel: ComboBoxModel) {
    this.#findLargestValue(this.model);
    this.#mapValuesToItemInfo(newModel);
    this.#checkIfCurrentSelectedValueIsNoLongerValid();
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
   * Specifies the value (selected item) of the control.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChange(newValue: string) {
    this.currentSelectedValue = newValue;
    this.#currentValueCaption = this.#getCaptionUsingValue(newValue);

    // Update the filter property is there are no filters applied. TODO: USE @State FOR FILTER PROPERTY?
    if (this.filterType === "none") {
      this.filter = this.#currentValueCaption;
    }

    // Update form value
    this.internals.setFormValue(newValue);
  }

  /**
   * Emitted when a change to the element's filter is committed by the user.
   * Only applies if `filterType !== "none"`. It contains the information about
   * the new filter value.
   *
   * This event is debounced by the `filterDebounce` value.
   */
  @Event() filterChange: EventEmitter<string>;

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   */
  @Event() input: EventEmitter<string>;

  #findLargestValue = (model: ComboBoxModel) => {
    this.#largestValue = "";
    let largestValueLength = 0;

    model.forEach((itemGroup: ComboBoxItemGroup) => {
      const subItems = itemGroup.items;

      if (itemGroup.caption.length > largestValueLength) {
        this.#largestValue = itemGroup.caption;
        largestValueLength = itemGroup.caption.length;
      }

      if (subItems != null) {
        subItems.forEach(leaf => {
          if (leaf.caption.length > largestValueLength) {
            this.#largestValue = leaf.caption;
            largestValueLength = leaf.caption.length;
          }
        });
      }
    });
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

    const filterOptions: ComboBoxFilterInfo = {
      filter: this.filter,
      filterOptions: this.filterOptions
    };

    for (let index = 0; index < this.model.length; index++) {
      const item = this.model[index];

      filterSubModel(
        item,
        this.filterType,
        filterOptions,
        this.#displayedValues
      );
    }

    // Remove the selected value if it is no longer rendered
    if (!this.#displayedValues.has(this.currentSelectedValue)) {
      this.currentSelectedValue = undefined;
    }
  };

  #updateFilters = () => {
    if (this.filterType === "none") {
      this.#displayedValues = undefined;
      return;
    }

    const modelIsAlreadyFiltered = this.#isModelAlreadyFiltered();

    // Remove queued filter processing
    clearTimeout(this.#queuedFilterId);

    const processWithDebounce =
      this.filterDebounce > 0 &&
      (this.filterType === "caption" || this.filterType === "value");

    // Check if the model already contains the filtered items
    if (!modelIsAlreadyFiltered) {
      this.#displayedValues ??= new Set();
    }

    // Check if should filter with debounce
    if (processWithDebounce && this.#immediateFilter !== "immediate") {
      this.#queuedFilterId = setTimeout(() => {
        this.#filterFunction(modelIsAlreadyFiltered);
        forceUpdate(this); // After the filter processing is completed, force a re-render
      }, this.filterDebounce);
    }
    // No debounce
    else {
      this.#filterFunction(modelIsAlreadyFiltered);
    }
  };

  #mapValuesToItemInfo = (model: ComboBoxModel) => {
    this.#valueToItemInfo.clear();
    this.#itemCaptionToItemValue.clear();

    if (model == null) {
      return;
    }

    model.forEach((item, firstLevelIndex) => {
      const itemGroup = item as ComboBoxItemGroup;
      const subItems = itemGroup.items;

      if (subItems != null) {
        // First level item
        this.#valueToItemInfo.set(itemGroup.value, {
          item: itemGroup,
          index: {
            type: "first-level",
            firstLevelIndex: firstLevelIndex
          },
          firstExpanded: itemGroup.expandable && !!itemGroup.expanded
        });

        this.#itemCaptionToItemValue.set(itemGroup.caption, itemGroup.value);

        // Second level items
        subItems.forEach((subItem, secondLevelIndex) => {
          this.#valueToItemInfo.set(subItem.value, {
            item: subItem,
            index: {
              type: "nested",
              firstLevelIndex: firstLevelIndex,
              secondLevelIndex: secondLevelIndex
            }
          });

          this.#itemCaptionToItemValue.set(subItem.caption, subItem.value);
        });
      }
      // First level item
      else {
        this.#valueToItemInfo.set(item.value, {
          item: item,
          index: {
            type: "first-level",
            firstLevelIndex: firstLevelIndex
          }
        });
        this.#itemCaptionToItemValue.set(item.caption, item.value);
      }
    });
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
    if (!this.filterOptions?.strict) {
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
    `item${insideAGroup ? " nested" : ""}${
      isDisabled ? ` ${DISABLED_PART}` : ""
    }${item.value === this.currentSelectedValue ? ` ${SELECTED_PART}` : ""}`;

  #setResizeObserver = () => {
    this.#borderSizeRAF = new SyncWithRAF();
    this.#resizeObserver = new ResizeObserver(this.#updateBorderSizeRAF);

    // Observe the size of the edges to know if the border
    this.#resizeObserver.observe(this.el, { box: "border-box" });
    this.#resizeObserver.observe(this.#maskRef ?? this.#selectRef);
  };

  #updateBorderSizeRAF = () => {
    this.#borderSizeRAF.perform(this.#updateBorderSize);
  };

  #updateBorderSize = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const computedStyle = getComputedStyle(this.el);

    const negatedBorderInlineStartWidth = negateBorderValue(
      computedStyle.borderInlineStartWidth
    );
    const negatedBorderInlineEndWidth = negateBorderValue(
      computedStyle.borderInlineEndWidth
    );
    const negatedBorderBlockStartWidth = negateBorderValue(
      computedStyle.borderBlockStartWidth
    );
    const negatedBorderBlockEndWidth = negateBorderValue(
      computedStyle.borderBlockEndWidth
    );

    if (
      this.#lastMaskInlineStart === negatedBorderInlineStartWidth &&
      this.#lastMaskInlineEnd === negatedBorderInlineEndWidth &&
      this.#lastMaskBlockStart === negatedBorderBlockStartWidth &&
      this.#lastMaskBlockEnd === negatedBorderBlockEndWidth
    ) {
      return;
    }

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    this.el.style.setProperty(
      COMBO_BOX_MASK_INLINE_START,
      negatedBorderInlineStartWidth
    );

    this.el.style.setProperty(
      COMBO_BOX_MASK_INLINE_END,
      negatedBorderInlineEndWidth
    );

    this.el.style.setProperty(
      COMBO_BOX_MASK_BLOCK_START,
      negatedBorderBlockStartWidth
    );

    this.el.style.setProperty(
      COMBO_BOX_MASK_BLOCK_END,
      negatedBorderBlockEndWidth
    );

    // Store borders to avoid an extra call from the resize observer due to
    // the size of the mask is updated
    this.#lastMaskInlineStart = negatedBorderInlineStartWidth;
    this.#lastMaskInlineEnd = negatedBorderInlineEndWidth;
    this.#lastMaskBlockStart = negatedBorderBlockStartWidth;
    this.#lastMaskBlockEnd = negatedBorderBlockEndWidth;
  };

  #handleSelectChange = (event: Event) => {
    event.preventDefault();

    this.value = this.#selectRef.value;
    this.currentSelectedValue = this.#selectRef.value;

    // Emit event
    this.input.emit(this.value);
  };

  #handleExpandedChange = (event: MouseEvent) => {
    event.stopPropagation();
    this.expanded = !this.expanded;
  };

  #handleExpandedChangeWithKeyBoard = (event: KeyboardEvent) => {
    if (this.filterType === "none") {
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

  #displayPopoverWhenFiltersApplied = (event: MouseEvent) => {
    event.stopPropagation();
    this.expanded = true;
  };

  #focusInnerInputWhenFiltersApplied = (event: MouseEvent) => {
    event.stopPropagation();
    this.#inputRef.focus();
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
    // filterType property is updated at runtime, the current selected caption
    // won't change
    this.filter = this.#getCaptionUsingValue(itemValue);
    this.#checkAndEmitValueChangeWithNoFilter();
  };

  #toggleExpandInGroup = (itemGroup: ComboBoxItemGroup) => () => {
    this.#valueToItemInfo.get(itemGroup.value).firstExpanded = true;
    itemGroup.expanded = !itemGroup.expanded;

    forceUpdate(this);
  };

  #getItemImageCustomVars = (
    item: ComboBoxItemModel,
    hasImages: boolean,
    hasStartImg: boolean,
    hasEndImg: boolean
  ) =>
    hasImages
      ? {
          "--ch-combo-box-item-start-img": hasStartImg
            ? `url("${item.startImgSrc}")`
            : null,
          "--ch-combo-box-item-end-img": hasEndImg
            ? `url("${item.endImgSrc}")`
            : null
        }
      : undefined;

  #isModelAlreadyFiltered = () => this.filterOptions.alreadyProcessed === true;

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

      const customVars = this.#getItemImageCustomVars(
        item,
        hasImages,
        hasStartImg,
        hasEndImg
      );

      // This variable inherits the disabled state from group parents. Useful
      // to propagate the disabled state in the child buttons
      const isDisabled = disabled ?? item.disabled;
      const itemGroup = item as ComboBoxItemGroup;
      const canAddListeners = !isDisabled && this.expanded;

      return itemGroup.items != null ? (
        <div
          key={item.value}
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
              class={{
                // eslint-disable-next-line camelcase
                group__header: true,
                "group--expandable": true,
                "group--collapsed": !itemGroup.expanded
              }}
              part={`group__header expandable${isDisabled ? " disabled" : ""} ${
                this.expanded ? "expanded" : "collapsed"
              }`}
              style={customVars}
              disabled={isDisabled}
              type="button"
              onClick={
                canAddListeners ? this.#toggleExpandInGroup(itemGroup) : null
              }
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
            key={`${index}__content`}
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
            canAddListeners
              ? this.#selectValueAndClosePopover(item.value)
              : null
          }
          onMouseEnter={
            canAddListeners
              ? this.#updateCurrentSelectedValue(item.value)
              : null
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
      aria-label={this.accessibleName ?? this.#accessibleNameFromExternalLabel}
      disabled={this.disabled}
      onChange={!this.disabled ? this.#handleSelectChange : null}
      ref={el => (this.#selectRef = el)}
    >
      {this.model.map(this.#nativeItemRender)}
    </select>
  ];

  connectedCallback() {
    this.#popoverId ??= `ch-combo-box-popover-${autoId++}`;
    this.#findLargestValue(this.model);
    this.#mapValuesToItemInfo(this.model);

    this.internals.setFormValue(this.value);
    this.currentSelectedValue = this.value;

    this.#currentValueCaption = this.#getCaptionUsingValue(this.value);
    this.filter = this.#currentValueCaption;

    const labels = this.internals.labels;

    // Get external aria-label
    if (!this.accessibleName && labels?.length > 0) {
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

  componentDidLoad() {
    this.#setResizeObserver();
  }

  componentDidRender() {
    // Focus the input when there are filters and the control is expanded
    if (this.filterType !== "none" && this.expanded) {
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

  disconnectedCallback() {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = undefined; // Free the memory
    }

    this.#borderSizeRAF = undefined; // Free the memory
  }

  render() {
    const filtersAreApplied = this.filterType !== "none";
    const comboBoxIsInteractive = !this.readonly && !this.disabled;
    const destroyRender = this.destroyItemsOnClose && !this.expanded;

    const currentItemInInput: ComboBoxItemModel | undefined =
      this.#valueToItemInfo.get(
        filtersAreApplied
          ? this.#getValueUsingCaption(this.filter)
          : this.currentSelectedValue
      )?.item;

    const hasStartImg = currentItemInInput && !!currentItemInInput.startImgSrc;

    const customVars = this.#getItemImageCustomVars(
      currentItemInInput,
      hasStartImg,
      hasStartImg,
      false
    );

    return (
      <Host
        // Make the host focusable since the input is disabled when there are no
        // filters
        tabindex={
          !mobileDevice && !filtersAreApplied && !this.disabled ? "0" : null
        }
        class={this.disabled ? "ch-disabled" : null}
        onKeyDown={
          !mobileDevice && comboBoxIsInteractive
            ? this.#handleExpandedChangeWithKeyBoard
            : null
        }
        onClick={
          !mobileDevice && filtersAreApplied && comboBoxIsInteractive
            ? this.#focusInnerInputWhenFiltersApplied
            : null
        }
      >
        {mobileDevice
          ? this.#nativeRender()
          : [
              <span class="invisible-text">
                {this.#largestValue || this.placeholder}
              </span>,

              <div
                key="mask"
                // This mask is used to capture click events that must open the
                // popover. If we capture click events in the Host, clicking external
                // label would open the combo-box's window
                aria-hidden="true"
                class={{
                  mask: true,
                  "mask--no-filters": this.filterType === "none",

                  [`start-img-type--${
                    currentItemInInput?.startImgType ?? "background"
                  } img--start`]: hasStartImg
                }}
                style={customVars}
                onClickCapture={
                  !filtersAreApplied && comboBoxIsInteractive
                    ? this.#handleExpandedChange
                    : null
                }
                ref={el => (this.#maskRef = el)}
              >
                <input
                  // We must place the input inside the mask, otherwise it
                  // won't stretch to the Host size
                  key="combobox"
                  role="combobox"
                  aria-controls="popover"
                  // This reset is necessary, since we use "disabled" to
                  // disallow the focus and text selection in the input when
                  // the combo-box has no filters
                  aria-disabled={
                    !this.disabled && !filtersAreApplied ? "false" : null
                  }
                  aria-expanded={this.expanded.toString()}
                  aria-haspopup="true"
                  aria-label={
                    this.accessibleName ?? this.#accessibleNameFromExternalLabel
                  }
                  autocomplete="off"
                  class={{
                    value: true,
                    "value--readonly": !filtersAreApplied,
                    "value--start-img": hasStartImg
                  }}
                  disabled={this.disabled || !filtersAreApplied}
                  placeholder={this.placeholder}
                  readOnly={this.readonly || !filtersAreApplied}
                  value={
                    filtersAreApplied
                      ? this.filter
                      : this.#getCaptionUsingValue(this.currentSelectedValue)
                  }
                  onClickCapture={
                    filtersAreApplied && !this.expanded && comboBoxIsInteractive
                      ? this.#displayPopoverWhenFiltersApplied
                      : null
                  }
                  onInputCapture={
                    filtersAreApplied && comboBoxIsInteractive
                      ? this.#handleInputFilterChange
                      : null
                  }
                  ref={el => (this.#inputRef = el)}
                ></input>
              </div>,

              this.#firstExpanded && !destroyRender && (
                <ch-popover
                  key="popover"
                  id="popover"
                  role="listbox"
                  aria-hidden="false"
                  part="window"
                  actionById
                  actionElement={this.el as unknown as HTMLButtonElement} // This is a WA. We should remove it
                  blockAlign="outside-end"
                  inlineAlign={this.popoverInlineAlign}
                  closeOnClickOutside
                  hidden={!this.expanded}
                  popover="manual"
                  resizable={this.resizable}
                  inlineSizeMatch="action-element-as-minimum"
                  overflowBehavior="add-scroll"
                  positionTry="flip-block"
                  onPopoverClosed={
                    this.expanded && comboBoxIsInteractive
                      ? this.#handlePopoverClose
                      : null
                  }
                >
                  <div class="window__content" part="window__content">
                    {this.model.map(
                      this.#customItemRender(
                        false,
                        undefined,
                        filtersAreApplied
                      )
                    )}
                  </div>
                </ch-popover>
              )
            ]}
      </Host>
    );
  }
}

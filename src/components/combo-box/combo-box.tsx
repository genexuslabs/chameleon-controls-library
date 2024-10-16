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
import { isMobileDevice, tokenMap } from "../../common/utils";
import {
  COMBO_BOX_PARTS_DICTIONARY,
  KEY_CODES
} from "../../common/reserved-names";
import { ChPopoverCustomEvent, GxImageMultiState } from "../../components";
import { ChPopoverAlign } from "../popover/types";
import { focusComposedPath } from "../common/helpers";
import { filterSubModel } from "./helpers";
import {
  comboBoxActiveDescendantIsRendered,
  findComboBoxLargestValue,
  getComboBoxItemFromMouseEvent,
  getComboBoxItemImageCustomVars,
  mapValuesToItemInfo,
  popoverWasClicked
} from "./utils";
import { findNextSelectedIndex, findSelectedIndex } from "./navigation";
import { customComboBoxItemRender, nativeItemRender } from "./renders";

const SELECTED_ITEM_SELECTOR = `button[part*='${COMBO_BOX_PARTS_DICTIONARY.SELECTED}']`;
const mobileDevice = isMobileDevice();

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

  /**
   * This variable is used to emulate the behavior of the native select. The
   * native select decides its min size based on the size of the largest option.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #largestValue: string;

  /**
   * Last value that was set correctly in the control. Useful to revert the
   * value when applying strict filters.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #lastConfirmedValue: string;

  #valueToItemInfo: Map<string, ComboBoxItemModelExtended> = new Map();
  #captionToItemInfo: Map<string, ComboBoxItemModelExtended> = new Map();

  // Filters info
  #applyFilters = false;
  #queuedInputValueUpdate: NodeJS.Timeout;

  /**
   * Collection of displayed values. If a filter is applied and the value
   * belongs to this Set, the item is displayed.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #displayedValues: Set<ComboBoxItemModel> | undefined; // Don't allocate memory until needed

  #selectNextIndex = (
    event: KeyboardEvent,
    currentSelectedIndex: ComboBoxSelectedIndex,
    increment: 1 | -1,
    hasFilters: boolean,
    displayedValues: Set<ComboBoxItemModel>
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
        ? this.model[nextSelectedIndex.firstLevelIndex]
        : (this.model[nextSelectedIndex.firstLevelIndex] as ComboBoxItemGroup)
            .items[nextSelectedIndex.secondLevelIndex];

    if (this.activeDescendant !== newSelectedValue) {
      this.activeDescendant = newSelectedValue;
    }
  };

  // Keyboard events when the control has no filters
  #keyEventsNoFiltersDictionary: {
    [key in KeyDownNoFiltersEvents]: (event: KeyboardEvent) => void;
  } = {
    ArrowUp: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.activeDescendant),
        -1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    ArrowDown: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.activeDescendant),
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
  @State() activeDescendant: ComboBoxItemModel | undefined;

  @State() expanded = false;
  @Watch("expanded")
  handleExpandedChange(newExpandedValue: boolean) {
    if (newExpandedValue && !mobileDevice) {
      // this.#focusSelectAfterNextRender = true;

      // Sync the active descendant when expanding the combo-box
      this.#syncActiveDescendant();

      // TODO: Add a unit test for this case
      // When the control is expanded and has filters applied, we should
      // refresh the rendered items without any debounce
      if (this.suggest) {
        this.#scheduleFilterProcessing();
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
   * This property specifies a callback that is executed when the path for an
   * imgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    item: ComboBoxItemLeaf,
    iconDirection: "start" | "end"
  ) => GxImageMultiState | undefined;

  /**
   * Specifies a set of parts to use in the Host element (`ch-combo-box-render`).
   */
  @Prop() readonly hostParts?: string;

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
      this.#captionToItemInfo
    );
    // this.#checkIfCurrentSelectedValueIsNoLongerValid();

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
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

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
   * filtered according to the input's value.
   */
  @Prop() readonly suggest: boolean = false;
  @Watch("suggest")
  suggestChanged() {
    this.#scheduleFilterProcessing();
  }

  /**
   * This property lets you determine the debounce time (in ms) that the
   * control waits until it processes the changes to the filter property.
   * Consecutive changes to the `value` property between this range, reset the
   * timeout to process the value.
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
   * suggest.
   */
  @Prop() readonly suggestOptions: ComboBoxSuggestOptions = {};
  @Watch("suggestOptions")
  suggestOptionsChanged() {
    this.#scheduleFilterProcessing();
  }

  /**
   * Specifies the value (selected item) of the control.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChanged(newValue: string) {
    this.#setValueInForm(newValue);

    if (this.suggest) {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   *
   * If `suggest = true`, this event is debounced by the `suggestDebounce` value.
   */
  @Event() input: EventEmitter<string>;

  // TODO: Add change event
  // @Event() change: EventEmitter<string>;

  #findLargestValue = (model: ComboBoxModel) => {
    this.#largestValue = findComboBoxLargestValue(model);
  };

  #scheduleFilterProcessing = () => {
    this.#applyFilters = true;
  };

  #filterModel = () => {
    // New filter value
    this.#displayedValues.clear();

    const filterOptions: ComboBoxSuggestInfo = {
      filter: this.value,
      options: this.suggestOptions
    };

    for (let index = 0; index < this.model.length; index++) {
      const item = this.model[index];
      filterSubModel(item, filterOptions, this.#displayedValues);
    }

    // Remove the active descendant if it is no longer rendered
    if (!this.#displayedValues.has(this.activeDescendant)) {
      this.activeDescendant = undefined;
    }
  };

  #updateFilters = () => {
    if (!this.suggest) {
      this.#displayedValues = undefined;
      return;
    }

    const modelIsAlreadyFiltered = this.#isModelAlreadyFiltered();

    // Check if the model already contains the filtered items
    if (!modelIsAlreadyFiltered) {
      this.#displayedValues ??= new Set();
      this.#filterModel();
    }
  };

  #getCurrentValueMapping = (): ComboBoxItemModelExtended | undefined =>
    this.#captionToItemInfo.get(this.value) ??
    this.#valueToItemInfo.get(this.value);

  #checkAndEmitValueChangeWithNoFilter = () => {
    const activeDescendant = this.activeDescendant;

    // TODO: Should we debounce this event?
    if (activeDescendant?.value !== this.value) {
      // Clear last debounce
      clearTimeout(this.#queuedInputValueUpdate);

      this.value = this.suggest
        ? activeDescendant.caption ?? activeDescendant.value
        : activeDescendant.value;

      // Emit event
      this.input.emit(this.value);

      // Emit change event
      // this.change.emit(this.value);
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
    if (this.activeDescendant) {
      this.#checkAndEmitValueChangeWithNoFilter();
      return;
    }

    // No item was selected and the suggest is not strict
    if (!this.suggestOptions?.strict) {
      // TODO: Should we update the #lastConfirmedValue?

      return;
    }

    // Strict selection
    const inputValueMatches = this.#getCurrentValueMapping();

    if (inputValueMatches) {
      // TODO: Do we have to emit the change event?
    }
    // Revert change because the input value does not match any item value
    else {
      // Clear last debounce
      clearTimeout(this.#queuedInputValueUpdate);

      this.value = this.#lastConfirmedValue;

      // Emit filter change event to recover the previous state.
      // TODO: Should we debounce this event?
      this.input.emit(this.value);
    }
  };

  #handleSelectChange = (event: Event) => {
    event.preventDefault();

    this.value = this.#selectRef.value;
    this.activeDescendant = this.#valueToItemInfo.get(
      this.activeDescendant.value
    )?.item;

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

    if (this.suggest) {
      // Strict selection. Closing the popover should never confirm the current
      // value. In other words, it cancels the selection
      if (this.suggestOptions.strict) {
        // Clear last debounce
        clearTimeout(this.#queuedInputValueUpdate);

        // Revert change because the input value does not match any item value
        this.value = this.#lastConfirmedValue;

        // Emit filter change event to recover the previous state.
        // TODO: Should we debounce this event?
        this.input.emit(this.value);
      }
    } else {
      this.#checkAndEmitValueChangeWithNoFilter();
    }
  };

  #handleInputFilterChange = (event: InputEvent) => {
    event.stopPropagation();
    this.expanded = true;

    // Clear last debounce
    clearTimeout(this.#queuedInputValueUpdate);

    // TODO: Add unit tests for this case
    if (this.suggestDebounce > 0) {
      this.#queuedInputValueUpdate = setTimeout(() => {
        this.value = this.#inputRef.value;
        this.input.emit(this.value);
      }, this.suggestDebounce);
    } else {
      this.value = this.#inputRef.value;
      this.input.emit(this.value);
    }
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

  #handlePopoverClick = (event: MouseEvent) => {
    const itemUIModel = getComboBoxItemFromMouseEvent(event, this.model);

    if (!itemUIModel) {
      return;
    }
    const itemGroup = itemUIModel as ComboBoxItemGroup;

    // Clicked in a group header
    if (itemGroup.items != null) {
      if (!itemGroup.expandable) {
        return;
      }
      // Toggle expanded
      itemGroup.expanded = !itemGroup.expanded;
    }
    // Clicked in a leaf
    else {
      this.activeDescendant = itemUIModel;
      this.expanded = false;

      this.#checkAndEmitValueChangeWithNoFilter();
    }

    forceUpdate(this);
  };

  #handleMouseOverItem = (event: MouseEvent) => {
    const itemUIModel = getComboBoxItemFromMouseEvent(event, this.model) as
      | ComboBoxItemGroup
      | undefined;

    if (itemUIModel && itemUIModel.items == null) {
      this.activeDescendant = itemUIModel;
      forceUpdate(this);
    }
  };

  #isModelAlreadyFiltered = () => this.suggestOptions.alreadyProcessed === true;

  #setValueInForm = (value: string) => {
    // TODO: Add a unit test for this case
    if (!this.expanded) {
      this.#lastConfirmedValue = value;
    }

    this.#syncActiveDescendant();

    // Update form value
    this.internals.setFormValue(value);
  };

  #syncActiveDescendant = () => {
    // TODO: Should we set the activeDescendant at the end of this function?

    // If the active descendant is not set, try to set it using the value
    // TODO: Do we have to use the caption when using suggest?
    if (!this.activeDescendant || !this.expanded) {
      this.activeDescendant = this.#getCurrentValueMapping()?.item;
    }

    // If the value does not belong to a rendered item, remove the active
    // descendant
    const clientSideFilters = this.suggest && !this.#isModelAlreadyFiltered();
    if (
      !clientSideFilters &&
      !comboBoxActiveDescendantIsRendered(this.activeDescendant, this.model)
    ) {
      this.activeDescendant = undefined;
    }
  };

  #nativeRender = () => (
    <select
      aria-label={this.#accessibleNameFromExternalLabel ?? this.accessibleName}
      disabled={this.disabled}
      onChange={!this.disabled && this.#handleSelectChange}
      ref={el => (this.#selectRef = el)}
    >
      {!this.activeDescendant && (
        <option disabled selected value="">
          {this.placeholder}
        </option>
      )}
      {this.model.map(item => nativeItemRender(item, this.value))}
    </select>
  );

  connectedCallback() {
    this.#findLargestValue(this.model);
    mapValuesToItemInfo(
      this.model,
      this.#valueToItemInfo,
      this.#captionToItemInfo
    );
    this.#setValueInForm(this.value);

    const labels = this.internals.labels;

    // Get external aria-label
    if (labels?.length > 0) {
      this.#accessibleNameFromExternalLabel = labels[0].textContent.trim();
    }
  }

  componentWillRender() {
    if (this.#applyFilters) {
      this.#updateFilters(); // TODO: THERE IS A BUG IF THE COMBO-BOX STARTS WITH FILTERS APPLIED
      this.#applyFilters = false;
    }
  }

  componentDidRender() {
    if (this.expanded) {
      const selectedElement = this.el.shadowRoot.querySelector(
        SELECTED_ITEM_SELECTOR
      ) as HTMLElement | undefined;

      // Focus the selected element to force the scroll into view
      if (selectedElement) {
        // Wait until the JS has been executed to avoid race conditions when
        // rendering elements in the top layer and trying to focus them
        requestAnimationFrame(() => {
          selectedElement.focus();
          this.#inputRef.focus();
        });
      }
    }
  }

  render() {
    const filtersAreApplied = this.suggest;
    const disableTextSelection = !this.disabled && !filtersAreApplied;
    const comboBoxIsInteractive = !this.readonly && !this.disabled;

    const currentItemInInput: ComboBoxItemModel | undefined = filtersAreApplied
      ? this.#valueToItemInfo.get(this.value)?.item
      : this.activeDescendant;

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

    // TODO: Add unit tests for this feature.
    const currentValueMapping = this.#getCurrentValueMapping()?.item.value;

    return (
      <Host
        class={{
          "ch-disabled": this.disabled,
          "ch-combo-box--normal": !filtersAreApplied,
          "ch-combo-box--suggest": filtersAreApplied
        }}
        // TODO: Add unit tests for this feature, since it breaks custom parts
        // rendered outside of the ch-combo-box-render render() method
        part={tokenMap({
          [currentValueMapping]: !!currentValueMapping,
          [this.hostParts]: !!this.hostParts
        })}
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
                      ? this.value
                      : this.activeDescendant?.caption
                  }
                  onInputCapture={
                    filtersAreApplied &&
                    comboBoxIsInteractive &&
                    this.#handleInputFilterChange
                  }
                  ref={el => (this.#inputRef = el)}
                ></input>
              </div>,

              this.expanded && comboBoxIsInteractive && (
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
                  onClick={this.#handlePopoverClick}
                  onMouseOver={this.#handleMouseOverItem}
                  onPopoverClosed={this.#handlePopoverClose}
                >
                  {this.model.map(
                    customComboBoxItemRender(
                      false,
                      this.disabled,
                      filtersAreApplied && !this.#isModelAlreadyFiltered(),
                      this.activeDescendant,
                      this.#displayedValues,
                      ""
                    )
                  )}
                </ch-popover>
              )
            ]}
      </Host>
    );
  }
}

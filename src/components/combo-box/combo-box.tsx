import { TypeAhead } from "@genexus/kasstor-webkit";
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
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";
import {
  AccessibleNameComponent,
  DisableableComponent
} from "../../common/interfaces";
import { getControlRegisterProperty } from "../../common/registry-properties";
import {
  COMBO_BOX_HOST_PARTS,
  COMBO_BOX_PARTS_DICTIONARY,
  KEY_CODES
} from "../../common/reserved-names";
import { GxImageMultiStateStart } from "../../common/types";
import { isMobileDevice, tokenMap } from "../../common/utils";
import { ChPopoverCustomEvent, GxImageMultiState } from "../../components";
import { focusComposedPath } from "../common/helpers";
import { ChPopoverAlign, PopoverClosedInfo } from "../popover/types";
import { getCaptionFromItem } from "./get-caption-from-item";
import { filterSubModel } from "./helpers";
import { computeComboBoxItemImage, getComboBoxImages } from "./item-images";
import {
  COMBO_BOX_NO_ACTIVE_ITEM,
  findNextSelectedIndex,
  findSelectedIndex
} from "./navigation";
import { customComboBoxItemRender, nativeItemRender } from "./renders";
import {
  ComboBoxImagePathCallback,
  ComboBoxItemGroup,
  ComboBoxItemImagesModel,
  ComboBoxItemModel,
  ComboBoxItemModelExtended,
  ComboBoxModel,
  ComboBoxSelectedIndex,
  ComboBoxSuggestInfo,
  ComboBoxSuggestOptions
} from "./types";
import {
  comboBoxActiveDescendantIsRendered,
  findComboBoxLargestValue,
  getComboBoxItemFromMouseEvent,
  mapValuesToItemInfo,
  popoverWasClicked
} from "./utils";

const SELECTED_ITEM_SELECTOR = `button[part*='${COMBO_BOX_PARTS_DICTIONARY.SELECTED}']`;
const mobileDevice = isMobileDevice();

const DEFAULT_GET_IMAGE_PATH_CALLBACK = (
  itemUIModel: ComboBoxItemModel,
  iconDirection: "start" | "end"
): GxImageMultiState => ({
  base:
    iconDirection === "start" ? itemUIModel.startImgSrc : itemUIModel.endImgSrc
});

// Keys
type KeyDownNoFiltersEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END
  | typeof KEY_CODES.ENTER
  | typeof KEY_CODES.NUMPAD_ENTER
  | typeof KEY_CODES.SPACE
  | typeof KEY_CODES.TAB;

type KeyDownWithFiltersEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.ENTER
  | typeof KEY_CODES.NUMPAD_ENTER
  | typeof KEY_CODES.TAB;

const getComboBoxItemFromIndex = (
  selectedIndex: Exclude<ComboBoxSelectedIndex, null>,
  model: ComboBoxModel
) =>
  typeof selectedIndex === "number"
    ? model[selectedIndex]
    : (model[selectedIndex[0]] as ComboBoxItemGroup).items[selectedIndex[1]];

const NEGATIVE_INDEX = -1;

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
  #itemImages: Map<string, ComboBoxItemImagesModel> | undefined;

  #shouldFocusTheComboBox = false;

  // TODO: This should only be defined when suggest = false, so we free up some
  // memory
  #typeAhead = new TypeAhead<ComboBoxSelectedIndex>({
    getCaptionFromIndex: index =>
      getCaptionFromItem(
        getComboBoxItemFromIndex(
          // Assume that the index is defined
          index,
          this.model
        )
      ),
    getFirstIndex: () => {
      const selectedIndex = findNextSelectedIndex(
        this.model,
        NEGATIVE_INDEX,
        1,
        false,
        this.#displayedValues
      );
      return selectedIndex;
    },
    getNextIndex: currentSelectedIndex => {
      // TODO: Avoid the code duplication
      const nextSelectedIndex =
        currentSelectedIndex === COMBO_BOX_NO_ACTIVE_ITEM
          ? findNextSelectedIndex(
              this.model,
              NEGATIVE_INDEX,
              1,
              false,
              this.#displayedValues
            )
          : findNextSelectedIndex(
              this.model,
              currentSelectedIndex,
              1,
              false,
              this.#displayedValues
            );

      console.log(
        "getNextIndex................................",
        "currentSelectedIndex------",
        currentSelectedIndex &&
          getComboBoxItemFromIndex(currentSelectedIndex, this.model),
        "nextSelectedIndex------",
        nextSelectedIndex &&
          getComboBoxItemFromIndex(nextSelectedIndex, this.model)
      );

      return nextSelectedIndex;
    },
    isSameIndex: (a, b) => JSON.stringify(a) === JSON.stringify(b)
  });

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
      currentSelectedIndex === COMBO_BOX_NO_ACTIVE_ITEM
        ? findNextSelectedIndex(
            this.model,
            increment === 1 ? NEGATIVE_INDEX : this.model.length,
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

    if (nextSelectedIndex === COMBO_BOX_NO_ACTIVE_ITEM) {
      return;
    }

    // The new selected value is either in the first level or in the group
    const newSelectedValue = getComboBoxItemFromIndex(
      nextSelectedIndex,
      this.model
    );

    if (this.activeDescendant !== newSelectedValue) {
      this.activeDescendant = newSelectedValue;
    }
  };

  // Keyboard events when the control has no filters
  #keyEventsNoFiltersDictionary: {
    [key in KeyDownNoFiltersEvents]: (event: KeyboardEvent) => void;
  } = {
    ArrowUp: (event: KeyboardEvent) => {
      if (this.expanded) {
        this.#selectNextIndex(
          event,
          findSelectedIndex(this.#valueToItemInfo, this.activeDescendant),
          -1,
          this.suggest && !this.#isModelAlreadyFiltered(),
          this.#displayedValues
        );
      }
      // Open the combo-box, without selecting any value
      else {
        event.preventDefault(); // Stop space key from scrolling

        this.#shouldFocusTheComboBox = true;
        this.expanded = true;
      }
    },

    ArrowDown: (event: KeyboardEvent) => {
      if (this.expanded) {
        this.#selectNextIndex(
          event,
          findSelectedIndex(this.#valueToItemInfo, this.activeDescendant),
          1,
          this.suggest && !this.#isModelAlreadyFiltered(),
          this.#displayedValues
        );
      }
      // Open the combo-box, without selecting any value
      else {
        event.preventDefault(); // Stop space key from scrolling

        this.#shouldFocusTheComboBox = true;
        this.expanded = true;
      }
    },

    Home: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        NEGATIVE_INDEX, // The algorithm will sum 1 to the start index
        1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    End: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        this.model.length, // The algorithm will sum -1 to the start index
        -1,
        this.suggest && !this.#isModelAlreadyFiltered(),
        this.#displayedValues
      ),

    Enter: () => {
      // The focus must return to the Host when closing the popover
      if (this.expanded) {
        this.#shouldFocusTheComboBox = true;
      }

      this.expanded = !this.expanded;
    },

    // Same as the Enter handler
    NumpadEnter: () => {
      // The focus must return to the Host when closing the popover
      if (this.expanded) {
        this.#shouldFocusTheComboBox = true;
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

        this.#shouldFocusTheComboBox = true;
        this.expanded = false;
      }
    }
  };

  // Keyboard events when the control has filters
  #keyEventsWithFiltersDictionary: {
    [key in KeyDownWithFiltersEvents]: (event: KeyboardEvent) => void;
  } = {
    ArrowUp: (event: KeyboardEvent) =>
      this.#keyEventsNoFiltersDictionary.ArrowUp(event),

    ArrowDown: (event: KeyboardEvent) =>
      this.#keyEventsNoFiltersDictionary.ArrowDown(event),

    Enter: (event: KeyboardEvent) =>
      this.#checkAndEmitValueChangeWithFilters(event),

    // Same as the Enter handler
    NumpadEnter: (event: KeyboardEvent) =>
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
      this.#setComboBoxIcons();

      // Sync the active descendant when expanding the combo-box
      this.#syncActiveDescendant();

      // TODO: Add a unit test for this case
      // When the control is expanded and has filters applied, we should
      // refresh the rendered items without any debounce
      if (this.suggest) {
        this.#scheduleFilterProcessing();
      }
    }
    // Free the memory, since the combo-box does not won't render any images
    else {
      this.#itemImages = undefined;
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
  @Prop() readonly getImagePathCallback?: ComboBoxImagePathCallback;

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

    // TODO: Add a unit test for this
    // The model can change when the combo-box is expanded by having server
    // filters. In this case, we need to re-compute the icons
    if (this.expanded) {
      this.#setComboBoxIcons();
    }

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

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user.
   *  - In normal mode (suggest = false), it is emitted after each input event.
   *
   *  - In suggest mode (suggest = true), it is emitted after the popover is closed
   * and a new value is committed by the user.
   *
   * This event is NOT debounced by the `suggestDebounce` value.
   */
  @Event() change: EventEmitter<string>;

  #findLargestValue = (model: ComboBoxModel) => {
    this.#largestValue = findComboBoxLargestValue(model);
  };

  #getActualImagePathCallback = () =>
    this.getImagePathCallback ??
    getControlRegisterProperty("getImagePathCallback", "ch-combo-box-render") ??
    DEFAULT_GET_IMAGE_PATH_CALLBACK;

  #setComboBoxIcons = () => {
    this.#itemImages = getComboBoxImages(
      this.model,
      this.#getActualImagePathCallback()
    );
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

  #getCurrentItemMapping = (): ComboBoxItemModelExtended | undefined =>
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
      // TODO: Add a unit test for this
      this.#emitChangeEvent();
    }
  };

  #checkAndEmitValueChangeWithFilters = (event: KeyboardEvent) => {
    if (!this.expanded) {
      return;
    }
    this.expanded = false;

    // The focus must return to the Host when tabbing with the popover
    // expanded
    this.#shouldFocusTheComboBox = true;
    event.preventDefault();

    // "Traditional selection". A value was selected pressing the enter key
    if (this.activeDescendant) {
      this.#checkAndEmitValueChangeWithNoFilter();
      return;
    }

    // No item was selected and the suggest is not strict
    if (!this.suggestOptions?.strict) {
      // TODO: Add a unit test: filters, no strict, value confirmation with
      // Enter or Tab. Expected: The value update should not be debounced
      // TODO: Avoid emitting duplicated input events if the value did not
      // changed

      // Clear last debounce and update the value right away, because the value
      // selection was confirmed
      clearTimeout(this.#queuedInputValueUpdate);
      this.value = this.#inputRef.value;
      this.input.emit(this.value);

      // TODO: Add a unit test for this
      this.#emitChangeEvent();
      return;
    }

    // Strict selection
    const inputValueMatches = this.#getCurrentItemMapping();

    if (inputValueMatches) {
      // TODO: Do we have to emit the change event?

      // TODO: Add a unit test for this
      this.#emitChangeEvent();
    }
    // Revert change because the input value does not match any item value
    else {
      // Clear last debounce
      clearTimeout(this.#queuedInputValueUpdate);

      this.value = this.#lastConfirmedValue;

      // Emit filter change event to recover the previous state.
      // TODO: Should we debounce this event?
      this.input.emit(this.value);

      // TODO: Add a unit test for this
      this.#emitChangeEvent();
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

    // TODO: Prevent change event in the native select
  };

  #handleExpandedChangeWithKeyBoard = (event: KeyboardEvent) => {
    const { altKey, code, ctrlKey, metaKey, key } = event;

    // Keyboard implementation for filters
    if (this.suggest) {
      const keyboardHandler = this.#keyEventsWithFiltersDictionary[code];

      if (keyboardHandler) {
        keyboardHandler(event);
      }
    } else {
      const keyboardHandler = this.#keyEventsNoFiltersDictionary[code];

      // TODO: We should consider what happens with key === "Backspace" || key === "Clear"

      if (!keyboardHandler) {
        const performTypeAhead =
          this.expanded &&
          key.length === 1 &&
          key !== " " &&
          !altKey &&
          !ctrlKey &&
          !metaKey;

        if (performTypeAhead) {
          const result = this.#typeAhead.search(
            key,
            findSelectedIndex(this.#valueToItemInfo, this.activeDescendant)
          );

          if (result !== null) {
            this.activeDescendant = getComboBoxItemFromIndex(
              result,
              this.model
            );
          }
        }

        return;
      }
      keyboardHandler(event);

      if (!this.expanded) {
        this.#checkAndEmitValueChangeWithNoFilter();
      }
    }
  };

  #handlePopoverClose = (event: ChPopoverCustomEvent<PopoverClosedInfo>) => {
    event.stopPropagation();

    // The focus must return to the Host when the popover is closed using the
    // Escape key
    this.expanded = false;

    // TODO: When destroyItemsOnClose === true, StencilJS would throw 'The
    // "popoverClosed" event was emitted, but the dispatcher node is no longer
    // connected to the dom.', because the popoverOnClose event is emitted twice
    // in the ch-popover

    // Return the focus to the control if the popover was closed with the
    // escape key or by clicking again the combo-box. Don't return the focus if
    // the popover was closed because it is no longer visible, because it will
    // provoke a layout shift
    if (
      event.detail.reason !== "popover-no-longer-visible" &&
      focusComposedPath().includes(this.el)
    ) {
      this.#shouldFocusTheComboBox = true;
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

      // TODO: Add a unit test for this
      this.#emitChangeEvent();
    }
  };

  #emitChangeEvent = () =>
    // TODO: Add a unit test for this
    // TODO: Don't emit the event if the value didn't change
    this.change.emit(this.value);

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
  #shouldRenderActiveItemIcon = () =>
    !this.suggest ||
    !this.expanded ||
    this.suggestOptions.renderActiveItemIconOnExpand;

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
      this.activeDescendant = this.#getCurrentItemMapping()?.item;
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

    // Accessibility
    this.#setValueInForm(this.value);
    const labels = this.internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-combo-box-render",
      labels,
      this.#accessibleNameFromExternalLabel,
      this.accessibleName
    );
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

    if (this.#shouldFocusTheComboBox) {
      this.#shouldFocusTheComboBox = false;
      this.el.focus();
    }
  }

  render() {
    const filtersAreApplied = this.suggest;
    const disableTextSelection = !this.disabled && !filtersAreApplied;
    const comboBoxIsInteractive = !this.readonly && !this.disabled;

    const selectedItemInfo = this.#getCurrentItemMapping()?.item;
    const currentItemInInput: ComboBoxItemModel | undefined = filtersAreApplied
      ? this.activeDescendant
      : selectedItemInfo;

    const computedImage =
      currentItemInInput?.startImgSrc && this.#shouldRenderActiveItemIcon()
        ? (computeComboBoxItemImage(
            currentItemInInput,
            "start",
            this.#getActualImagePathCallback()
          ) as GxImageMultiStateStart | undefined)
        : undefined;

    const startImgClasses = computedImage
      ? `img--start start-img-type--${
          currentItemInInput.startImgType ?? "background"
        } ${computedImage.classes}`
      : undefined;

    // TODO: UNIT TESTS.
    // - Clicking the combo-box with JS should not open the popover
    // - User click must open the combo-box
    // - Clicking the combo-box's label should not open the popover

    // TODO: Add unit tests for this feature.
    const currentValueMapping = selectedItemInfo?.value;
    const inputValue = filtersAreApplied
      ? this.value
      : selectedItemInfo?.caption;

    return (
      <Host
        class={{
          "ch-disabled": this.disabled,
          "ch-combo-box--normal": !filtersAreApplied,
          "ch-combo-box--suggest": filtersAreApplied,
          "ch-combo-box--expanded": this.expanded
        }}
        // TODO: Add unit tests for this feature, since it breaks custom parts
        // rendered outside of the ch-combo-box-render render() method
        part={tokenMap({
          [currentValueMapping]: !!currentValueMapping,

          // TODO: Add a unit test for this. Should we display the placeholder
          // even if a value is set without an option that is mapped to the
          // value?
          [COMBO_BOX_HOST_PARTS.PLACEHOLDER]: !inputValue,
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

                  // TODO: Fix disabled styling when the group parent is disabled, but the option leaf isn't.
                  // Class for disabled images. Used when the combo-box or selected item are disabled
                  disabled: this.disabled || currentItemInInput?.disabled,
                  [startImgClasses]: !!startImgClasses
                }}
                style={computedImage?.styles}
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
                  value={inputValue}
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
                  show
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
                      this.#itemImages,
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

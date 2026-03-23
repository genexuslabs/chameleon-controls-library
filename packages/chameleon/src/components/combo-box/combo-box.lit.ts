import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { Event, type EventEmitter } from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { TypeAhead } from "@genexus/kasstor-webkit";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

import { DEV_MODE, IS_SERVER } from "../../development-flags";
import type { GxImageMultiState, GxImageMultiStateStart } from "../../typings/multi-state-images";
import { analyzeLabelExistence } from "../../utilities/analysis/accessibility";
import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";
import { focusComposedPath } from "../../utilities/focus-composed-path";
import { Host } from "../../utilities/host/host";
import { isMobileDevice } from "../../utilities/is-mobile-device";
import { tokenMap } from "../../utilities/mapping/token-map";
import { createResolvedImagePathCallback } from "../../utilities/register-properties/image-path-registry";
import { KEY_CODES } from "../../utilities/reserved-names/key-codes";
import {
  COMBO_BOX_HOST_PARTS,
  COMBO_BOX_PARTS_DICTIONARY
} from "../../utilities/reserved-names/parts/combo-box";

import type { ChPopoverAlign, PopoverClosedInfo } from "../popover/types";
import { getCaptionFromItem } from "./get-caption-from-item";
import { filterSubModel } from "./helpers";
import { computeComboBoxItemImage, getComboBoxImages } from "./item-images";
import { COMBO_BOX_NO_ACTIVE_ITEM, findNextSelectedIndex, findSelectedIndex } from "./navigation";
import { customComboBoxItemRender, nativeItemRender } from "./renders";
import type {
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

import styles from "./combo-box.scss?inline";

// Lazy-load the popover for SSR
if (IS_SERVER) {
  await import("../popover/popover.lit");
}

const SELECTED_ITEM_SELECTOR = `button[part*='${COMBO_BOX_PARTS_DICTIONARY.SELECTED}']`;
const mobileDevice = isMobileDevice();

const DEFAULT_GET_IMAGE_PATH_CALLBACK = (
  itemUIModel: ComboBoxItemModel,
  iconDirection: "start" | "end"
): GxImageMultiState => ({
  base: iconDirection === "start" ? itemUIModel.startImgSrc : itemUIModel.endImgSrc
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
 * The `ch-combo-box-render` component is a feature-rich combo box that combines an input field with a popover-based dropdown list for selecting values.
 *
 * @remarks
 * ## Features
 *  - Flat lists and expandable item groups.
 *  - Suggest (autocomplete) mode with strict matching, debounced input, and server-side filtering.
 *  - Full keyboard navigation: Arrow keys, Home, End, Enter, Tab, and type-ahead search.
 *  - Multiple selection support.
 *  - Item images with multi-state support.
 *  - Automatic min-width sizing based on the largest option.
 *  - Lazy rendering of items only when the popup is displayed.
 *  - Native `select` fallback on mobile devices.
 *
 * ## Use when
 *  - A dropdown selection from a list of options is needed.
 *  - A searchable or autocomplete input is required.
 *  - Options should be organized into groups.
 *  - The list has more than 7 options and space is constrained.
 *  - A searchable or filterable input improves discoverability of items.
 *  - Options are organized into named groups.
 *
 * ## Do not use when
 *  - A simple binary choice is needed — prefer `ch-checkbox` or `ch-switch` instead.
 *  - All options should be visible at once — prefer `ch-radio-group-render` instead.
 *  - There are 2–3 options — prefer `ch-radio-group-render` (always visible, no extra click required).
 *  - The selection has immediate side effects — clearly communicate what will happen on change.
 *  - Navigation links are needed — never use a combo box to navigate between pages.
 *
 * ## Accessibility
 *  - Form-associated via `ElementInternals` — participates in native form validation and submission.
 *  - Delegates focus into the shadow DOM (`delegatesFocus: true`).
 *  - Implements the WAI-ARIA `combobox` pattern: the input has `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-haspopup` attributes.
 *  - The popup list has `role="listbox"`.
 *  - Keyboard navigation:
 *    - **Arrow Up / Arrow Down**: Navigate through items in the dropdown. If the dropdown is closed, opens it.
 *    - **Home / End**: Jump to the first or last item (non-suggest mode).
 *    - **Enter / NumpadEnter**: Toggle the dropdown open/closed; in suggest mode, confirms the current selection.
 *    - **Space**: Opens the dropdown (non-suggest mode only).
 *    - **Tab**: Closes the dropdown and confirms the selection.
 *    - **Type-ahead**: In non-suggest mode, typing characters while the dropdown is open performs incremental search to jump to matching items.
 *  - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.
 *  - On mobile devices, falls back to a native `<select>` element for optimal touch interaction and OS-level accessibility.
 *
 * @status experimental
 *
 * @part window - The popover element that contains the dropdown list of items.
 * @part expandable - Applied to group headers that can be expanded or collapsed.
 * @part group - Applied to each item group container.
 * @part group__header - The header element of an item group.
 * @part group__header-caption - The caption text inside a group header.
 * @part group__content - The container that wraps the child items of a group.
 * @part item - Applied to each selectable leaf item in the list.
 * @part section - Applied to section containers in the dropdown.
 * @part disabled - State part applied to disabled items, groups, group headers, and expandable headers.
 * @part expanded - State part applied to expanded group headers and expandable buttons.
 * @part collapsed - State part applied to collapsed group headers and expandable buttons.
 * @part nested - State part applied to items that are nested inside a group.
 * @part selected - State part applied to the currently selected item.
 * @part ch-combo-box-render--placeholder - Present on the host when no item is selected and the placeholder text is displayed.
 */
@Component({
  shadow: { formAssociated: true, delegatesFocus: true },
  styles,
  tag: "ch-combo-box-render"
})
export class ChComboBoxRender extends KasstorElement {
  #accessibleNameFromExternalLabel: string | undefined;

  /**
   * This variable is used to emulate the behavior of the native select. The
   * native select decides its min size based on the size of the largest option.
   */
  #largestValue: string;

  /**
   * Last value that was set correctly in the control. Useful to revert the
   * value when applying strict filters.
   */
  #lastConfirmedValue: string;

  #valueToItemInfo: Map<string, ComboBoxItemModelExtended> = new Map();
  #captionToItemInfo: Map<string, ComboBoxItemModelExtended> = new Map();
  #itemImages: Map<string, ComboBoxItemImagesModel> | undefined;

  #shouldFocusTheComboBox = false;

  #internals = this.attachInternals();

  /**
   * Computed signal that resolves the image path callback with the
   * following priority: local property > global registry signal.
   * Using `watch()` in the template causes pin-point updates to only the
   * `<ch-image>` bindings when the registry changes.
   */
  #resolvedImagePathCallback = createResolvedImagePathCallback(() => this.getImagePathCallback);

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
          ? findNextSelectedIndex(this.model, NEGATIVE_INDEX, 1, false, this.#displayedValues)
          : findNextSelectedIndex(
              this.model,
              currentSelectedIndex,
              1,
              false,
              this.#displayedValues
            );

      return nextSelectedIndex;
    },
    isSameIndex: (a, b) => JSON.stringify(a) === JSON.stringify(b)
  });

  // Filters info
  #applyFilters = false;
  #queuedInputValueUpdate: ReturnType<typeof setTimeout>;

  /**
   * Collection of displayed values. If a filter is applied and the value
   * belongs to this Set, the item is displayed.
   */
  #displayedValues: Set<ComboBoxItemModel> | undefined; // Don't allocate memory until needed

  // Refs
  #inputRef: Ref<HTMLInputElement> = createRef();
  #selectRef: Ref<HTMLSelectElement> = createRef();

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
    const newSelectedValue = getComboBoxItemFromIndex(nextSelectedIndex, this.model);

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
    ArrowUp: (event: KeyboardEvent) => this.#keyEventsNoFiltersDictionary.ArrowUp(event),

    ArrowDown: (event: KeyboardEvent) => this.#keyEventsNoFiltersDictionary.ArrowDown(event),

    Enter: (event: KeyboardEvent) => this.#checkAndEmitValueChangeWithFilters(event),

    // Same as the Enter handler
    NumpadEnter: (event: KeyboardEvent) => this.#checkAndEmitValueChangeWithFilters(event),

    Tab: (event: KeyboardEvent) => this.#checkAndEmitValueChangeWithFilters(event)
  };

  /**
   * When the combo-box is expanded, the visually selected value must change,
   * but in the interface the `value` property must only change when the
   * popover is closed.
   * This state help us to render the visually selected value, without updating
   * the `value` property in the interface.
   */
  @state() protected activeDescendant: ComboBoxItemModel | undefined;
  @Observe("activeDescendant")
  protected activeDescendantChanged() {
    // TODO: Add a e2e test for this
    if (this.activeDescendant !== undefined) {
      const selectedIndex = findSelectedIndex(this.#valueToItemInfo, this.activeDescendant);

      // Ensure the group parent is expanded if the activeDescendant is in a subgroup
      if (selectedIndex !== null && typeof selectedIndex !== "number") {
        (this.model[selectedIndex[0]] as ComboBoxItemGroup).expanded = true;
      }
    }
  }

  @state() protected expanded = false;
  @Observe("expanded")
  protected handleExpandedChange(newExpandedValue: boolean) {
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

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName: string | undefined;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * imgSrc needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback: ComboBoxImagePathCallback | undefined;

  /**
   * Specifies a set of parts to use in the Host element (`ch-combo-box-render`).
   */
  @property({ attribute: false }) hostParts: string | undefined;

  /**
   * Specifies the items of the control.
   *
   * `ComboBoxModel` is an array of `ComboBoxItemModel` entries. Each entry is
   * either a `ComboBoxItemLeaf` (a selectable item) or a `ComboBoxItemGroup` (a group header containing nested items).
   */
  @property({ attribute: false }) model: ComboBoxModel = [];
  @Observe("model")
  protected modelChanged(newModel: ComboBoxModel) {
    this.#findLargestValue(this.model);
    mapValuesToItemInfo(newModel, this.#valueToItemInfo, this.#captionToItemInfo);

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
   *
   * **Note:** Currently declared but not yet implemented. Setting this property
   * has no effect on the component behavior.
   */
  @property({ type: Boolean }) multiple: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @property({ reflect: true }) name: string | undefined;

  /**
   * A hint to the user of what can be entered in the control. Same as
   * [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)
   * attribute for `input` elements.
   */
  @property() placeholder: string;

  /**
   * Specifies the inline alignment of the popover.
   */
  @property({ attribute: "popover-inline-align" })
  popoverInlineAlign: ChPopoverAlign = "inside-start";

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @property({ type: Boolean }) readonly: boolean = false;

  /**
   * Specifies whether the control can be resized. If `true` the control can be
   * resized at runtime by dragging the edges or corners.
   */
  @property({ type: Boolean }) resizable: boolean = false;

  /**
   * This property lets you specify if the control behaves like a suggest.
   * If `true` the combo-box value will be editable and displayed items will be
   * filtered according to the input's value.
   *
   * When enabled, the `suggestDebounce` property controls how long the control
   * waits before processing input changes, and the `suggestOptions` property
   * configures filtering behavior (e.g., strict matching, case sensitivity,
   * server-side filtering).
   */
  @property({ type: Boolean }) suggest: boolean = false;
  @Observe("suggest")
  protected suggestChanged() {
    this.#scheduleFilterProcessing();
  }

  /**
   * This property lets you determine the debounce time (in ms) that the
   * control waits until it processes the changes to the filter property.
   * Consecutive changes to the `value` property between this range, reset the
   * timeout to process the value.
   * Only works if `suggest === true`.
   */
  @property({ type: Number, attribute: "suggest-debounce" })
  suggestDebounce: number = 250;
  @Observe("suggestDebounce")
  protected suggestDebounceChanged() {
    if (this.suggest) {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * This property lets you determine the options that will be applied to the
   * suggest. Available options (`ComboBoxSuggestOptions`):
   *
   *  - `alreadyProcessed` (boolean) — `true` if the model is already filtered
   *    server-side and the control should skip client-side filtering.
   *  - `autoExpand` (boolean) — expand matching groups when filtering. *(Not yet implemented.)*
   *  - `hideMatchesAndShowNonMatches` (boolean) — invert the filter: hide
   *    matches and show non-matches.
   *  - `highlightMatchedItems` (boolean) — highlight matched text in items.
   *    *(Not yet implemented.)*
   *  - `matchCase` (boolean) — make the filter case-sensitive (ignored when
   *    `regularExpression` is `true`).
   *  - `regularExpression` (boolean) — treat the filter value as a regular expression.
   *  - `renderActiveItemIconOnExpand` (boolean) — keep the selected item icon
   *    visible in the input while the dropdown is expanded in suggest mode.
   *  - `strict` (boolean) — when the popover closes, revert to the last
   *    confirmed value if the input does not match any item.
   */
  @property({ attribute: false }) suggestOptions: ComboBoxSuggestOptions = {};
  @Observe("suggestOptions")
  protected suggestOptionsChanged() {
    this.#scheduleFilterProcessing();
  }

  /**
   * Specifies the value (selected item) of the control.
   */
  @property() value: string | undefined;
  @Observe("value")
  protected valueChanged(newValue: string) {
    this.#setValueInForm(newValue);

    if (this.suggest) {
      this.#scheduleFilterProcessing();
    }
  }

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   *
   * When `suggest === true`, this event is debounced by the `suggestDebounce`
   * value (default 250 ms). When `suggest === false`, debouncing does not
   * apply and the event is emitted immediately on value change.
   */
  @Event() protected input!: EventEmitter<string>;

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
  @Event() protected change!: EventEmitter<string>;

  #findLargestValue = (model: ComboBoxModel) => {
    this.#largestValue = findComboBoxLargestValue(model);
  };

  #getActualImagePathCallback = () =>
    this.getImagePathCallback ??
    this.#resolvedImagePathCallback() ??
    DEFAULT_GET_IMAGE_PATH_CALLBACK;

  #setComboBoxIcons = () => {
    this.#itemImages = getComboBoxImages(this.model, this.#getActualImagePathCallback());
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
    this.#captionToItemInfo.get(this.value) ?? this.#valueToItemInfo.get(this.value);

  #checkAndEmitValueChangeWithNoFilter = () => {
    const activeDescendant = this.activeDescendant;

    // TODO: Should we debounce this event?
    if (activeDescendant?.value !== this.value) {
      // Clear last debounce
      clearTimeout(this.#queuedInputValueUpdate);

      this.value = this.suggest
        ? (activeDescendant.caption ?? activeDescendant.value)
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
      this.value = this.#inputRef.value?.value;
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

    this.value = this.#selectRef.value?.value;
    this.activeDescendant = this.#valueToItemInfo.get(this.activeDescendant.value)?.item;

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
      return;
    }
    // Normal case (without suggest)
    const keyboardHandler = this.#keyEventsNoFiltersDictionary[code];

    // TODO: We should consider what happens with key === "Backspace" || key === "Clear" when
    // applying type-ahead search
    if (!keyboardHandler) {
      const performTypeAhead =
        this.expanded && key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey;

      // TODO: Add e2e tests for the type-ahead feature
      if (performTypeAhead) {
        const result = this.#typeAhead.search(
          key,
          findSelectedIndex(this.#valueToItemInfo, this.activeDescendant)
        );

        if (result !== null) {
          this.activeDescendant = getComboBoxItemFromIndex(result, this.model);
        }
      }

      return;
    }
    keyboardHandler(event);

    if (!this.expanded) {
      this.#checkAndEmitValueChangeWithNoFilter();
    }
  };

  #handlePopoverClose = (event: CustomEvent<PopoverClosedInfo>) => {
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
    if (event.detail.reason !== "popover-no-longer-visible" && focusComposedPath().includes(this)) {
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
        this.value = this.#inputRef.value?.value;
        this.input.emit(this.value);
      }, this.suggestDebounce);
    } else {
      this.value = this.#inputRef.value?.value;
      this.input.emit(this.value);
    }
  };

  #displayPopover = (event: MouseEvent) => {
    const clickWasPerformedInALabel = event.detail === 0;

    // TODO: Add a unit test for this case (clicking on the popover should not
    // close the popover)
    if (clickWasPerformedInALabel || (this.expanded && popoverWasClicked(event))) {
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

    this.requestUpdate();
  };

  #handleMouseOverItem = (event: MouseEvent) => {
    const itemUIModel = getComboBoxItemFromMouseEvent(event, this.model) as
      | ComboBoxItemGroup
      | undefined;

    if (itemUIModel && itemUIModel.items == null) {
      this.activeDescendant = itemUIModel;
      this.requestUpdate();
    }
  };

  #isModelAlreadyFiltered = () => this.suggestOptions.alreadyProcessed === true;
  #shouldRenderActiveItemIcon = () =>
    !this.suggest || !this.expanded || this.suggestOptions.renderActiveItemIconOnExpand;

  #setValueInForm = (value: string) => {
    // TODO: Add a unit test for this case
    if (!this.expanded) {
      this.#lastConfirmedValue = value;
    }

    this.#syncActiveDescendant();

    // Update form value
    this.#internals.setFormValue(value);
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

  override connectedCallback() {
    super.connectedCallback();

    this.#findLargestValue(this.model);
    mapValuesToItemInfo(this.model, this.#valueToItemInfo, this.#captionToItemInfo);

    // Accessibility
    this.#setValueInForm(this.value);
    const labels = this.#internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue in dev mode
    if (DEV_MODE) {
      analyzeLabelExistence(
        this,
        "ch-combo-box-render",
        labels,
        this.#accessibleNameFromExternalLabel,
        this.accessibleName
      );
    }
  }

  override willUpdate() {
    if (this.#applyFilters) {
      this.#updateFilters(); // TODO: THERE IS A BUG IF THE COMBO-BOX STARTS WITH FILTERS APPLIED
      this.#applyFilters = false;
    }
  }

  override updated() {
    if (this.expanded) {
      const selectedElement = this.shadowRoot.querySelector(SELECTED_ITEM_SELECTOR) as
        | HTMLElement
        | undefined;

      // Don't use focus, use scrollIntoView to avoid focus stealing and race
      // conditions
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          // @ts-expect-error This property is widely supported but not in the
          // lib.dom.ts
          container: "nearest"
        });
      }
    }

    if (this.#shouldFocusTheComboBox) {
      this.#shouldFocusTheComboBox = false;
      this.focus();
    }
  }

  override render() {
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
    const inputValue = filtersAreApplied ? this.value : selectedItemInfo?.caption;

    Host(this, {
      class: {
        "ch-disabled": this.disabled,
        "ch-combo-box--normal": !filtersAreApplied,
        "ch-combo-box--suggest": filtersAreApplied,
        "ch-combo-box--expanded": this.expanded
      },
      // TODO: Add unit tests for this feature, since it breaks custom parts
      // rendered outside of the ch-combo-box-render render() method
      properties: {
        part: tokenMap({
          [currentValueMapping]: !!currentValueMapping,

          // TODO: Add a unit test for this. Should we display the placeholder
          // even if a value is set without an option that is mapped to the
          // value?
          [COMBO_BOX_HOST_PARTS.PLACEHOLDER]: !inputValue,
          [this.hostParts]: !!this.hostParts
        })
      },
      events: {
        keydown: !mobileDevice && comboBoxIsInteractive && this.#handleExpandedChangeWithKeyBoard,
        click:
          comboBoxIsInteractive && (!filtersAreApplied || !this.expanded) && this.#displayPopover
      }
    });

    if (mobileDevice) {
      return html`<select
        aria-label=${this.#accessibleNameFromExternalLabel ?? this.accessibleName ?? nothing}
        ?disabled=${this.disabled}
        @change=${!this.disabled ? this.#handleSelectChange : nothing}
        ${ref(this.#selectRef)}
      >
        ${!this.activeDescendant
          ? html`<option disabled selected value="">${this.placeholder}</option>`
          : nothing}
        ${this.model.map(item => nativeItemRender(item, this.value))}
      </select>`;
    }

    return html`
      <span class="invisible-text"> ${this.#largestValue || this.placeholder} </span>

      <div
        role="combobox"
        aria-label=${this.#accessibleNameFromExternalLabel ?? this.accessibleName ?? nothing}
        tabindex=${disableTextSelection ? "0" : nothing}
        class=${classMap({
          "input-container": true,

          // TODO: Fix disabled styling when the group parent is disabled, but the option leaf isn't.
          // Class for disabled images. Used when the combo-box or selected item are disabled
          disabled: this.disabled || currentItemInInput?.disabled,
          [startImgClasses]: !!startImgClasses
        })}
        style=${computedImage ? styleMap(computedImage.styles as any) : nothing}
      >
        <input
          aria-controls="popover"
          aria-disabled=${disableTextSelection ? "false" : nothing}
          aria-expanded=${this.expanded.toString()}
          aria-haspopup="true"
          autocomplete="off"
          class=${classMap({
            value: true,
            "value--readonly": !filtersAreApplied
          })}
          ?disabled=${this.disabled || !filtersAreApplied}
          placeholder=${this.placeholder ?? nothing}
          ?readonly=${this.readonly || !filtersAreApplied}
          .value=${inputValue ?? ""}
          @input=${filtersAreApplied && comboBoxIsInteractive
            ? this.#handleInputFilterChange
            : nothing}
          ${ref(this.#inputRef)}
        />
      </div>

      ${this.expanded && comboBoxIsInteractive
        ? html`<ch-popover
            id="popover"
            role="listbox"
            aria-hidden="false"
            part="window"
            ?actionById=${true}
            .actionElement=${this as unknown as HTMLButtonElement}
            blockAlign="outside-end"
            inlineAlign=${this.popoverInlineAlign}
            ?closeOnClickOutside=${true}
            ?show=${true}
            popover="manual"
            ?resizable=${this.resizable}
            inlineSizeMatch="action-element-as-minimum"
            overflowBehavior="add-scroll"
            positionTry="flip-block"
            @click=${this.#handlePopoverClick}
            @mouseover=${this.#handleMouseOverItem}
            @popoverClosed=${this.#handlePopoverClose}
          >
            ${this.model.map(
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
          </ch-popover>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-combo-box-render": ChComboBoxRender;
  }
}


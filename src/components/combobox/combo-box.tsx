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
  h
} from "@stencil/core";
import {
  AccessibleNameComponent,
  DisableableComponent
} from "../../common/interfaces";
import { ComboBoxItem, ComboBoxItemGroup, ComboBoxItemLeaf } from "./types";
import { isMobileDevice } from "../../common/utils";
import { KEY_CODES } from "../../common/reserverd-names";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { ChPopoverCustomEvent } from "../../components";

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
type KeyDownEvents =
  | typeof KEY_CODES.ARROW_UP
  | typeof KEY_CODES.ARROW_DOWN
  | typeof KEY_CODES.HOME
  | typeof KEY_CODES.END
  | typeof KEY_CODES.ENTER
  | typeof KEY_CODES.SPACE
  | typeof KEY_CODES.TAB;

type SelectedIndex =
  | {
      type: "not-exists";
    }
  | {
      type: "nested";
      firstLevelIndex: number;
      secondLevelIndex: number;
    }
  | {
      type: "first-level";
      firstLevelIndex: number;
    };

const SELECTED_VALUE_DOES_NOT_EXISTS: SelectedIndex = {
  type: "not-exists"
} as const;

const isValidIndex = (array: any, index: number) =>
  0 <= index && index < array.length;

const findSelectedIndex = (
  valueToItemInfo: Map<string, { caption: string; index: SelectedIndex }>,
  selectedValue: string | undefined
): SelectedIndex => {
  if (!selectedValue) {
    return SELECTED_VALUE_DOES_NOT_EXISTS;
  }

  return (
    valueToItemInfo.get(selectedValue)?.index ?? SELECTED_VALUE_DOES_NOT_EXISTS
  );
};

const findNextSelectedIndex = (
  items: ComboBoxItem[],
  currentIndex: SelectedIndex,
  increment: 1 | -1
): SelectedIndex => {
  if (currentIndex.type === "not-exists") {
    return SELECTED_VALUE_DOES_NOT_EXISTS;
  }
  const firstLevelIndex = currentIndex.firstLevelIndex;

  if (currentIndex.type === "nested") {
    let secondLevelIndex = currentIndex.secondLevelIndex + increment; // Start from the first valid index
    const firstLevelItemItems = (items[firstLevelIndex] as ComboBoxItemGroup)
      .items;

    // Search in the nested level skipping disabled items
    while (
      isValidIndex(firstLevelItemItems, secondLevelIndex) &&
      firstLevelItemItems[secondLevelIndex].disabled
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

  // Search for the next first level item that is not disabled
  while (
    isValidIndex(items, nextFirstLevelIndex) &&
    items[nextFirstLevelIndex].disabled === true
  ) {
    nextFirstLevelIndex += increment;
  }

  // With this flag, we also say that we are at the end of the combo-box
  // and there isn't any new "next value" to select
  if (!isValidIndex(items, nextFirstLevelIndex)) {
    return SELECTED_VALUE_DOES_NOT_EXISTS;
  }

  const nestedLevel = (items[nextFirstLevelIndex] as ComboBoxItemGroup).items;

  if (nestedLevel != null) {
    return findNextSelectedIndex(
      items,
      {
        type: "nested",
        firstLevelIndex: nextFirstLevelIndex,
        secondLevelIndex: increment === 1 ? -1 : nestedLevel.length // The algorithm will sum 1 (or -1) to the start index
      },
      increment
    );
  }

  return {
    type: "first-level",
    firstLevelIndex: nextFirstLevelIndex
  };
};

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

  #borderSizeRAF: SyncWithRAF | undefined;
  #resizeObserver: ResizeObserver | undefined;

  #lastMaskInlineStart = "0px";
  #lastMaskInlineEnd = "0px";
  #lastMaskBlockStart = "0px";
  #lastMaskBlockEnd = "0px";

  #valueToItemInfo: Map<string, { caption: string; index: SelectedIndex }> =
    new Map();

  /**
   * When the control is used in a desktop environment, we need to manually
   * focus the selected item when the control is expanded.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #focusSelectAfterNextRender = true;

  #selectNextIndex = (
    event: KeyboardEvent,
    currentSelectedIndex: SelectedIndex,
    increment: 1 | -1
  ) => {
    event.preventDefault(); // Stop ArrowDown key from scrolling

    const nextSelectedIndex =
      currentSelectedIndex.type === "not-exists"
        ? findNextSelectedIndex(
            this.items,
            {
              type: "first-level",
              firstLevelIndex: increment === 1 ? -1 : this.items.length
            },
            increment
          )
        : findNextSelectedIndex(this.items, currentSelectedIndex, increment);

    if (nextSelectedIndex.type === "not-exists") {
      return;
    }

    // The new selected value is either in the first level or in the group
    const newSelectedValue =
      nextSelectedIndex.type === "first-level"
        ? this.items[nextSelectedIndex.firstLevelIndex].value
        : (this.items[nextSelectedIndex.firstLevelIndex] as ComboBoxItemGroup)
            .items[nextSelectedIndex.secondLevelIndex].value;

    if (this.currentSelectedValue !== newSelectedValue) {
      this.currentSelectedValue = newSelectedValue;
      this.#focusSelectAfterNextRender = true;
    }
  };

  #keyEventsDictionary: {
    [key in KeyDownEvents]: (event: KeyboardEvent) => void;
  } = {
    ArrowUp: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.currentSelectedValue),
        -1
      ),

    ArrowDown: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        findSelectedIndex(this.#valueToItemInfo, this.currentSelectedValue),
        1
      ),

    Home: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        {
          type: "first-level",
          firstLevelIndex: -1
        }, // The algorithm will sum 1 to the start index
        1
      ),

    End: (event: KeyboardEvent) =>
      this.#selectNextIndex(
        event,
        {
          type: "first-level",
          firstLevelIndex: this.items.length
        }, // The algorithm will sum -1 to the start index
        -1
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

  // Refs
  #maskRef!: HTMLDivElement;
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
   * Specifies the items of the control
   */
  @Prop() readonly items: ComboBoxItem[] = [];
  @Watch("items")
  itemsChange(newItems: ComboBoxItem[]) {
    this.#mapValuesToItemInfo(newItems);
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
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * Specifies the value (selected item) of the control.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChange(newValue: string) {
    this.currentSelectedValue = newValue;
  }

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   */
  @Event() input: EventEmitter<string>;

  #mapValuesToItemInfo = (items: ComboBoxItem[]) => {
    this.#valueToItemInfo.clear();

    if (items == null) {
      return;
    }

    items.forEach((item, firstLevelIndex) => {
      const subItems = (item as ComboBoxItemGroup).items;

      if (subItems != null) {
        subItems.forEach((subItem, secondLevelIndex) => {
          this.#valueToItemInfo.set(subItem.value, {
            caption: subItem.caption,
            index: {
              type: "nested",
              firstLevelIndex: firstLevelIndex,
              secondLevelIndex: secondLevelIndex
            }
          });
        });
      } else {
        this.#valueToItemInfo.set(item.value, {
          caption: item.caption,
          index: {
            type: "first-level",
            firstLevelIndex: firstLevelIndex
          }
        });
      }
    });
  };

  #checkAndEmitValueChange = () => {
    if (!this.expanded && this.currentSelectedValue !== this.value) {
      this.value = this.currentSelectedValue;

      // Set form value
      this.internals.setFormValue(this.value);

      // Emit event
      this.input.emit(this.value);
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

    // Set form value
    this.internals.setFormValue(this.value);

    // Emit event
    this.input.emit(this.value);
  };

  #handleExpandedChange = (event: MouseEvent) => {
    event.stopPropagation();

    if (this.expanded) {
      // The focus must return to the Host when the popover is closed using the
      // Escape key
      this.el.focus();
    }
    this.expanded = !this.expanded;
  };

  #handleExpandedChangeWithKeyBoard = (event: KeyboardEvent) => {
    const keyboardHandler = this.#keyEventsDictionary[event.code];

    if (keyboardHandler) {
      keyboardHandler(event);
      this.#checkAndEmitValueChange();
    }
  };

  #handlePopoverClose = (event: ChPopoverCustomEvent<any>) => {
    event.stopPropagation();

    // The focus must return to the Host when the popover is closed using the
    // Escape key
    this.expanded = false;
    this.el.focus();

    this.#checkAndEmitValueChange();
  };

  #updateSelectedValue = (itemValue: string) => (event: MouseEvent) => {
    event.stopPropagation();

    this.expanded = false;
    this.currentSelectedValue = itemValue;
    this.#checkAndEmitValueChange();
  };

  #customItemRender =
    (insideAGroup: boolean, disabled: boolean | undefined) =>
    (item: ComboBoxItem, index: number) => {
      const hasStartImg = !!item.startImgSrc;
      const hasEndImg = !!item.endImgSrc;
      const hasImages = hasStartImg || hasEndImg;

      // This variable inherits the disabled state from group parents. Useful
      // to propagate the disabled state in the child buttons
      const isDisabled = disabled ?? item.disabled;

      return (item as ComboBoxItemGroup).items != null ? (
        <div
          key={item.value}
          aria-labelledby={index.toString()}
          role="group"
          class="group"
          part={`group${isDisabled ? ` ${DISABLED_PART}` : ""}`}
        >
          <span id={index.toString()} part="group__caption">
            {item.caption}
          </span>

          {(item as ComboBoxItemGroup).items.map(
            this.#customItemRender(true, isDisabled)
          )}
        </div>
      ) : (
        <button
          key={item.value}
          tabindex="-1"
          class={
            hasImages
              ? {
                  [`start-img-type--${
                    item.startImgType ?? "background"
                  } img--start`]: hasStartImg,
                  [`end-img-type--${item.endImgType ?? "background"} img--end`]:
                    hasEndImg
                }
              : undefined
          }
          part={this.#itemLeafParts(item, insideAGroup, isDisabled)}
          style={
            hasImages
              ? {
                  "--ch-combo-box-item-start-img": hasStartImg
                    ? `url("${item.startImgSrc}")`
                    : undefined,
                  "--ch-combo-box-item-end-img": hasEndImg
                    ? `url("${item.endImgSrc}")`
                    : undefined
                }
              : undefined
          }
          disabled={isDisabled}
          type="button"
          onClick={this.#updateSelectedValue(item.value)}
        >
          {item.caption}
        </button>
      );
    };

  #nativeItemRender = (item: ComboBoxItem) =>
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

  #nativeRender = () => (
    <select
      aria-label={this.accessibleName ?? this.#accessibleNameFromExternalLabel}
      disabled={this.disabled}
      onChange={this.#handleSelectChange}
      ref={el => (this.#selectRef = el)}
    >
      {this.items.map(this.#nativeItemRender)}
    </select>
  );

  connectedCallback() {
    this.#popoverId ??= `ch-combo-box-popover-${autoId++}`;

    this.internals.setFormValue(this.value);
    this.currentSelectedValue = this.value;

    const labels = this.internals.labels;

    // Get external aria-label
    if (!this.accessibleName && labels?.length > 0) {
      this.#accessibleNameFromExternalLabel = labels[0].textContent.trim();
    }

    this.#mapValuesToItemInfo(this.items);
  }

  componentDidLoad() {
    this.#setResizeObserver();
  }

  componentDidRender() {
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
    return (
      <Host
        role={!mobileDevice ? "combobox" : null}
        aria-controls={!mobileDevice ? this.#popoverId : null}
        aria-disabled={this.disabled ? "true" : null}
        aria-expanded={!mobileDevice ? this.expanded.toString() : null}
        aria-haspopup="true"
        aria-placeholder={!mobileDevice ? this.placeholder : null}
        tabindex={!mobileDevice ? "0" : null}
        class={this.disabled ? "ch-disabled" : null}
        onKeyDown={
          !mobileDevice && !this.disabled
            ? this.#handleExpandedChangeWithKeyBoard
            : null
        }
      >
        <span
          aria-hidden={!this.currentSelectedValue ? "true" : null}
          class="value"
        >
          {this.currentSelectedValue
            ? this.#valueToItemInfo.get(this.currentSelectedValue)?.caption ??
              this.placeholder
            : this.placeholder}
        </span>

        {!mobileDevice && (
          <div
            // This mask is used to capture click events that must open the
            // popover. If we capture click events in the Host, clicking external
            // label would open the combo-box's window
            aria-hidden="true"
            class="mask"
            onClick={this.#handleExpandedChange}
            ref={el => (this.#maskRef = el)}
          ></div>
        )}

        {mobileDevice
          ? this.#nativeRender()
          : this.#firstExpanded && (
              <ch-popover
                id={this.#popoverId}
                role="listbox"
                part="window"
                actionById
                actionElement={this.el as unknown as HTMLButtonElement} // This is a WA. We should remove it
                blockAlign="outside-end"
                hidden={!this.expanded}
                popover="auto"
                onPopoverClosed={this.#handlePopoverClose}
              >
                {this.items.map(this.#customItemRender(false, undefined))}
              </ch-popover>
            )}
      </Host>
    );
  }
}

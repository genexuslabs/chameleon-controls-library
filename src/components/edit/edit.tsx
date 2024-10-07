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

import {
  DISABLED_CLASS,
  EDIT_PARTS_DICTIONARY
} from "../../common/reserved-names";
import { EditInputMode, EditType } from "./types";
import {
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";
import { tokenMap, updateDirectionInImageCustomVar } from "../../common/utils";
import { getControlRegisterProperty } from "../../common/registry-properties";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });

const AUTOFILL_START_ANIMATION_NAME = "AutoFillStart";

const DATE_TYPES = ["datetime-local", "date", "time"];

const MAX_DATE_VALUE: { [key: string]: string } = {
  date: "9999-12-31",
  "datetime-local": "9999-12-31T23:59:59"
};

const MIN_DATE_VALUE: { [key: string]: string } = {
  date: "0001-01-01",
  "datetime-local": "0001-01-01T00:00:00"
};

/**
 * A wrapper for the input and textarea elements. It additionally provides:
 *  - A placeholder for `"date"`, `"datetime-local"` and `"time"` types.
 *  - An action button.
 *  - Useful style resets.
 *  - Support for picture formatting.
 *  - Support to auto grow the control when used with multiline (useful to
 *    model chat inputs).
 *  - An image which can have multiple states.
 *  - Support for debouncing the input event.
 *
 * @part date-placeholder - A placeholder displayed when the control is editable (`readonly="false"`), has no value set, and its type is `"datetime-local" | "date" | "time"`.
 * @part hidden-multiline - The auxiliary content rendered in the control to implement the auto-grow. This part only applies when `multiline="true"`.
 * @part trigger-button - The trigger button displayed on the right side of the control when `show-trigger="true"`.
 *
 * @slot trigger-content - The slot used for the content of the trigger button.
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "edit.scss",
  tag: "ch-edit"
})
export class ChEdit implements AccessibleNameComponent, DisableableComponent {
  #accessibleNameFromExternalLabel: string | undefined;
  #startImage: GxImageMultiStateStart | undefined;

  #debounceId: NodeJS.Timeout | undefined;
  #shouldComputePictureValue = false;

  // Refs
  // TODO: StencilJS issue. We have to use two refs because StencilJS does not,
  // update the ref when updating the multiline property
  #inputRef: HTMLInputElement | undefined;
  #textareaRef: HTMLTextAreaElement | undefined;

  @State() isFocusOnControl = false;

  @State() pictureValue: string;

  @AttachInternals() internals: ElementInternals;

  @Element() el!: HTMLChEditElement;

  /**
   * Determine if the gx-edit's value was auto-completed
   */
  @State() autoFilled = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * Specifies the auto-capitalization behavior. Same as [autocapitalize](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autocapitalize)
   * attribute for `input` elements. Only supported by Safari and Chrome.
   */
  // eslint-disable-next-line @stencil-community/reserved-member-names
  @Prop() readonly autocapitalize: string; // TODO: StencilJS' bug. It does not allow to specify a better type

  /**
   * This attribute indicates whether the value of the control can be
   * automatically completed by the browser. Same as [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-autocomplete)
   * attribute for `input` elements.
   */
  @Prop() readonly autocomplete: "on" | "off" = "off";

  /**
   * Specifies if the control automatically get focus when the page loads.
   */
  // eslint-disable-next-line @stencil-community/reserved-member-names
  @Prop() readonly autoFocus: boolean = false;

  /**
   * This property defines if the control size will grow automatically, to
   * adjust to its content size.
   */
  @Prop() readonly autoGrow: boolean = false;

  /**
   * This property lets you specify the label for the clear search button.
   * Important for accessibility.
   *
   * Only works if `type = "search"` and `multiline = false`.
   */
  @Prop() readonly clearSearchButtonAccessibleName: string = "Clear search";

  /**
   * Specifies a debounce for the input event.
   */
  @Prop() readonly debounce?: number = 0;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#computeImage();
  }

  /**
   * This property defines the maximum string length that the user can enter
   * into the control.
   */
  @Prop() readonly maxLength: number = undefined;

  /**
   * This attribute hints at the type of data that might be entered by the user
   * while editing the element or its contents. This allows a browser to
   * display an appropriate virtual keyboard. Only works when
   * `multiline === false`.
   */
  @Prop() readonly mode: EditInputMode | undefined;

  /**
   * Controls if the element accepts multiline text.
   */
  @Prop() readonly multiline: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * This attribute specifies a regular expression the form control's value
   * should match. Only works when `multiline === false`.
   */
  @Prop() readonly pattern: string = undefined;

  /**
   * Specifies a picture to apply for the value of the control. Only works if
   * not `multiline`.
   */
  @Prop() readonly picture?: string;
  @Watch("picture")
  pictureChanged() {
    this.#shouldComputePictureValue = true;
  }

  /**
   * Specifies the callback to execute when the picture must computed for the
   * new value.
   */
  @Prop() readonly pictureCallback?: (value: any, picture: string) => string;
  @Watch("pictureCallback")
  pictureCallbackChanged() {
    this.#shouldComputePictureValue = true;
  }

  /**
   * A hint to the user of what can be entered in the control. Same as [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)
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
   * If true, a trigger button is shown next to the edit field. The button can
   * be customized adding a child element with `slot="trigger-content"`
   * attribute to specify the content inside the trigger button.
   */
  @Prop() readonly showTrigger: boolean;

  /**
   * Specifies whether the element may be checked for spelling errors
   */
  // eslint-disable-next-line @stencil-community/reserved-member-names
  @Prop() readonly spellcheck: boolean = false;

  /**
   * Specifies the source of the start image.
   */
  @Prop() readonly startImgSrc: string;
  @Watch("startImgSrc")
  startImgSrcChanged() {
    this.#computeImage();
  }

  /**
   * Specifies the source of the start image.
   */
  @Prop() readonly startImgType: Exclude<ImageRender, "img"> = "background";

  /**
   * This attribute lets you specify the label for the trigger button.
   * Important for accessibility.
   */
  @Prop() readonly triggerButtonAccessibleName: string;

  /**
   * The type of control to render. A subset of the types supported by the `input` element is supported:
   *
   * * `"date"`
   * * `"datetime-local"`
   * * `"email"`
   * * `"file"`
   * * `"number"`
   * * `"password"`
   * * `"search"`
   * * `"tel"`
   * * `"text"`
   * * `"url"`
   */
  @Prop() readonly type: EditType = "text";

  /**
   * The initial value of the control.
   */
  @Prop({ mutable: true }) value: string;
  @Watch("value")
  valueChanged(newValue: string) {
    this.#shouldComputePictureValue = true;

    if (!this.#getInputRef()) {
      return;
    }

    /**
     * Synchronize the input value with value prop. This use case is only
     * needed when the value prop is changed outside of the component.
     * Without this verification, the following case would occur:
     *  - ValueChanging. Input ref: "X"
     *  - Render. Value prop: "X"
     *  - (Enter key event resets the value). Value prop: "" <---- The Angular's UIModel now has value = ""
     *  - ChangeEvent. Input ref: "X"
     *  Result: Angular's UIModel has value = "", but the control has value = "X"
     */
    if (this.#getInputRef().value !== this.value) {
      this.#getInputRef().value = this.value;
    }

    // Update form value
    this.internals.setFormValue(newValue);
  }

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user. Unlike the `input` event, the `change` event is not
   * necessarily fired for each change to an element's value but when the
   * control loses focus.
   * This event is _NOT_ debounced by the `debounce` property.
   */
  @Event() change: EventEmitter;

  /**
   * Fired synchronously when the value is changed.
   * This event is debounced by the `debounce` property.
   */
  @Event() input: EventEmitter<string>;

  /**
   * Fired when the trigger button is clicked.
   */
  @Event() triggerClick: EventEmitter;

  #getInputRef = () => this.#inputRef ?? this.#textareaRef;

  #computeImage = () => {
    if (!this.startImgSrc) {
      this.#startImage = null;
      return;
    }
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      this.#startImage = null;
      return;
    }
    const img = getImagePathCallback(this.startImgSrc);

    if (!img) {
      this.#startImage = null;
      return;
    }

    this.#startImage = updateDirectionInImageCustomVar(
      img,
      "start"
    ) as GxImageMultiStateStart;
  };

  #getValueFromEvent = (event: InputEvent): string =>
    (event.target as HTMLInputElement).value;

  #setValueAndEmitInputEventWithDebounce = (valueToEmit: string) => {
    clearTimeout(this.#debounceId);

    if (this.debounce > 0) {
      this.#debounceId = setTimeout(() => {
        this.value = valueToEmit;
        this.input.emit(valueToEmit);
      }, this.debounce);
    } else {
      this.value = valueToEmit;
      this.input.emit(valueToEmit);
    }
  };

  #handleAutoFill = (event: AnimationEvent) => {
    this.autoFilled = event.animationName === AUTOFILL_START_ANIMATION_NAME;
  };

  #handleChange = (event: InputEvent) => {
    this.value = this.#getValueFromEvent(event);
    this.change.emit(event);
  };

  #handleValueChanging = (event: InputEvent) => {
    event.stopPropagation();

    // Don't allow invalid values
    if (!this.#getInputRef().validity.valid) {
      this.#getInputRef().value = this.value;
      return;
    }

    this.#setValueAndEmitInputEventWithDebounce(this.#getValueFromEvent(event));
  };

  #handleTriggerClick = (event: UIEvent) => {
    if (!this.disabled) {
      event.stopPropagation();
    }
    this.triggerClick.emit(event);
  };

  #clearValue = (event: PointerEvent) => {
    event.stopPropagation();
    this.#setValueAndEmitInputEventWithDebounce("");

    requestAnimationFrame(() => this.el.focus());
  };

  // - - - - - - - - - - - - - - - - - - - - - -
  //                  Pictures
  // - - - - - - - - - - - - - - - - - - - - - -
  #hasPictureApplied = () => this.picture && !!this.pictureCallback;

  #computePictureValue(value: string | number) {
    if (this.#hasPictureApplied()) {
      this.pictureValue = this.pictureCallback(value, this.picture).trim();
    }
  }

  #showPictureOnFocus = () => {
    this.isFocusOnControl = true;
  };

  #removePictureOnBlur = () => {
    this.isFocusOnControl = false;
  };

  connectedCallback() {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty("getImagePathCallback", "ch-edit") ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#computeImage();
    this.#computePictureValue(this.value);

    this.internals.setFormValue(this.value);

    const labels = this.internals.labels;

    // Get external aria-label
    if (labels?.length > 0) {
      this.#accessibleNameFromExternalLabel = labels[0].textContent.trim();
    }
  }

  componentWillUpdate() {
    if (this.#shouldComputePictureValue) {
      this.#shouldComputePictureValue = false;
      this.#computePictureValue(this.value);
    }
  }

  componentDidLoad() {
    if (this.autoFocus) {
      this.el.focus();
    }
  }

  render() {
    const isDateType = DATE_TYPES.includes(this.type);
    const shouldDisplayPicture = this.#hasPictureApplied();
    const canAddListeners = !this.disabled && !this.readonly;

    return (
      <Host
        class={{
          "ch-edit--auto-fill": this.autoFilled,
          "ch-edit--cursor-text": !isDateType && !this.disabled,
          "ch-edit--editable-date": isDateType && !this.readonly,
          "ch-edit--multiline": this.multiline && this.autoGrow,
          "ch-edit__trigger-button-space": this.showTrigger,

          [`ch-edit-start-img-type--${this.startImgType} ch-edit-pseudo-img--start`]:
            !!this.#startImage,

          [DISABLED_CLASS]: this.disabled
        }}
        style={this.#startImage?.styles ?? undefined}
        // Alignment
        data-text-align=""
        data-valign={!this.multiline ? "" : undefined}
      >
        {this.multiline
          ? [
              <textarea
                autoFocus={this.autoFocus}
                aria-label={
                  this.#accessibleNameFromExternalLabel ||
                  this.accessibleName ||
                  null
                }
                autoCapitalize={this.autocapitalize}
                autoComplete={this.autocomplete}
                class="content autofill multiline"
                disabled={this.disabled}
                maxLength={this.maxLength}
                placeholder={this.placeholder}
                readOnly={this.readonly}
                spellcheck={this.spellcheck}
                value={this.value}
                // Event listeners
                onChange={canAddListeners && this.#handleChange}
                onInput={canAddListeners && this.#handleValueChanging}
                onAnimationStart={canAddListeners && this.#handleAutoFill}
                ref={el => (this.#textareaRef = el)}
              ></textarea>,

              // The space at the end of the value is necessary to correctly display the enters
              this.autoGrow && (
                <div class="hidden-multiline" part="hidden-multiline">
                  {this.value}{" "}
                </div>
              )
            ]
          : [
              <input
                autoFocus={this.autoFocus}
                aria-label={
                  this.#accessibleNameFromExternalLabel ||
                  this.accessibleName ||
                  null
                }
                autoCapitalize={this.autocapitalize}
                autoComplete={this.autocomplete}
                class={{
                  "content autofill": true,
                  "null-date": isDateType && !this.value
                }}
                disabled={this.disabled}
                inputMode={this.mode}
                maxLength={this.maxLength}
                max={MAX_DATE_VALUE[this.type]} // Limit the year to 4 digits
                min={MIN_DATE_VALUE[this.type]} // Extend the minimum value of the date
                pattern={this.pattern || undefined}
                placeholder={this.placeholder}
                readOnly={this.readonly}
                spellcheck={this.spellcheck}
                step={isDateType ? "1" : undefined}
                type={this.type}
                value={
                  shouldDisplayPicture && !this.isFocusOnControl
                    ? this.pictureValue
                    : this.value
                }
                // Event listeners
                onAnimationStart={canAddListeners && this.#handleAutoFill}
                onChange={canAddListeners && this.#handleChange}
                onInput={canAddListeners && this.#handleValueChanging}
                onFocus={
                  canAddListeners &&
                  shouldDisplayPicture &&
                  !this.isFocusOnControl &&
                  this.#showPictureOnFocus
                }
                onBlur={
                  canAddListeners &&
                  shouldDisplayPicture &&
                  this.isFocusOnControl &&
                  this.#removePictureOnBlur
                }
                ref={el => (this.#inputRef = el)}
              />,

              this.showTrigger && (
                <button
                  aria-label={this.triggerButtonAccessibleName}
                  class={{
                    "trigger-button": true,
                    disabled: this.disabled
                  }}
                  part="trigger-button"
                  type="button"
                  disabled={this.disabled}
                  onClick={canAddListeners && this.#handleTriggerClick}
                >
                  <slot name="trigger-content" />
                </button>
              ),

              // Implements a non-native placeholder for date types
              isDateType && !this.value && (
                <div
                  aria-hidden="true"
                  class="date-placeholder"
                  part={EDIT_PARTS_DICTIONARY.DATE_PLACEHOLDER}
                >
                  {this.placeholder}
                </div>
              ),

              this.type === "search" && !!this.value && (
                <button
                  aria-label={this.clearSearchButtonAccessibleName}
                  class="clear-button"
                  part={tokenMap({
                    [EDIT_PARTS_DICTIONARY.CLEAR_BUTTON]: true,
                    [EDIT_PARTS_DICTIONARY.DISABLED]: this.disabled
                  })}
                  type="button"
                  onClick={!this.disabled && this.#clearValue}
                ></button>
              )
            ]}
      </Host>
    );
  }
}

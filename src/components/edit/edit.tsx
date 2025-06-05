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

import type {
  AccessibleNameComponent,
  DisableableComponent
} from "../../common/interfaces";

import {
  analyzeLabelExistence,
  getElementInternalsLabel
} from "../../common/analysis/accessibility";
import { getControlRegisterProperty } from "../../common/registry-properties";
import {
  EDIT_HOST_PARTS,
  EDIT_PARTS_DICTIONARY,
  SCROLLABLE_CLASS
} from "../../common/reserved-names";
import { adoptCommonThemes } from "../../common/theme";
import type {
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../common/types";
import { tokenMap, updateDirectionInImageCustomVar } from "../../common/utils";
import type { EditInputMode, EditTranslations, EditType } from "./types";

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

const TEXTAREA_FLOATING_CLASSES = `content autofill multiline-floating ${SCROLLABLE_CLASS}`;
const TEXTAREA_INLINE_CLASSES = `content autofill multiline-inline ${SCROLLABLE_CLASS}`;

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
 *
 * @slot additional-content-before - The slot used for the additional content when `showAdditionalContentBefore === true`.
 * @slot additional-content-after - The slot used for the additional content when `showAdditionalContentAfter === true`.
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
  // update the ref when updating the multiline property or the DOM element is
  // moved
  #inputRef: HTMLInputElement | undefined;
  #textareaRef: HTMLTextAreaElement | undefined;
  #textareaInsideContainerRef: HTMLTextAreaElement | undefined;

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
  @Prop() readonly autocomplete:
    | "on"
    | "off"
    | "current-password"
    | "new-password" = "off";

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
   * Specifies a set of parts to use in the Host element (`ch-edit`).
   */
  @Prop() readonly hostParts?: string;

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
   * If `true`, a slot is rendered in the edit with `"additional-content-after"`
   * name.
   * This slot is intended to customize the internal content of the edit by
   * adding additional elements after the edit content.
   */
  @Prop() readonly showAdditionalContentAfter: boolean = false;

  /**
   * If `true`, a slot is rendered in the edit with `"additional-content-before"`
   * name.
   * This slot is intended to customize the internal content of the edit by
   * adding additional elements before the edit content.
   */
  @Prop() readonly showAdditionalContentBefore: boolean = false;

  /**
   * Specifies if the password is displayed as plain text when using
   * `type = "password"`.
   */
  @Prop({ mutable: true }) showPassword: boolean = false;

  /**
   * Specifies if the show password button is displayed.
   */
  @Prop() readonly showPasswordButton: boolean = false;

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
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations: EditTranslations = {
    accessibleName: {
      clearSearchButton: "Clear search",
      hidePasswordButton: "Hide password",
      showPasswordButton: "Show password"
    }
  };

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
   * Fired when the visibility of the password (when using `type="password"`)
   * is changed by clicking the show password button.
   *
   * The detail contains the new value of the `showPassword` property.
   */
  @Event() passwordVisibilityChange: EventEmitter<boolean>;

  #getInputRef = () =>
    this.#inputRef ?? this.#textareaRef ?? this.#textareaInsideContainerRef;

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

  #clearValue = (event: PointerEvent) => {
    event.stopPropagation();
    this.#setValueAndEmitInputEventWithDebounce("");

    requestAnimationFrame(() => this.el.focus());
  };

  #togglePasswordVisibility = (event: PointerEvent) => {
    event.stopPropagation();

    const newShowPassword = !this.showPassword;
    this.showPassword = newShowPassword;

    this.passwordVisibilityChange.emit(newShowPassword);
  };

  #hasAdditionalContent = () =>
    this.showAdditionalContentBefore || this.showAdditionalContentAfter;

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

  #renderTextarea = (canAddListeners: boolean) => (
    <textarea
      autoFocus={this.autoFocus}
      aria-label={
        this.#accessibleNameFromExternalLabel || this.accessibleName || null
      }
      autoCapitalize={this.autocapitalize}
      autoComplete={this.autocomplete}
      class={
        this.#hasAdditionalContent() && !this.autoGrow
          ? TEXTAREA_INLINE_CLASSES
          : TEXTAREA_FLOATING_CLASSES
      }
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
      ref={el =>
        // This is a WA due to a StencilJS bug not refreshing the ref when the
        // element is moved
        this.autoGrow && this.#hasAdditionalContent()
          ? (this.#textareaInsideContainerRef = el)
          : (this.#textareaRef = el)
      }
    ></textarea>
  );

  #renderTextareaWithAdditionalContent = (canAddListeners: boolean) => {
    // Floating as a "normal textarea"
    if (!this.#hasAdditionalContent()) {
      return [
        this.#renderTextarea(canAddListeners),
        this.autoGrow && (
          <div aria-hidden="true" class="hidden-multiline">
            {this.value}
          </div>
        )
      ];
    }

    // Inline case
    if (!this.autoGrow) {
      return this.#renderTextarea(canAddListeners);
    }

    // Floating inside a container to implement the Auto Grow
    return (
      <div class="multiline-container">
        {this.#renderTextarea(canAddListeners)}

        <div aria-hidden="true" class="hidden-multiline">
          {this.value}
        </div>
      </div>
    );
  };

  connectedCallback() {
    adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);

    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty("getImagePathCallback", "ch-edit") ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#computeImage();
    this.#computePictureValue(this.value);

    // Accessibility
    this.internals.setFormValue(this.value);
    const labels = this.internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this.el,
      "ch-edit",
      labels,
      this.#accessibleNameFromExternalLabel,
      this.accessibleName
    );
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

  // TODO: Remove the icon with multiline and add overflow: clip in the Host with multiline
  render() {
    const { accessibleName } = this.translations;
    const isDateType = DATE_TYPES.includes(this.type);
    const showDatePlaceholder = isDateType && this.placeholder && !this.value;
    const shouldDisplayPicture = this.#hasPictureApplied();
    const canAddListeners = !this.disabled && !this.readonly;

    const renderClearButton =
      !this.multiline && this.type === "search" && !!this.value;

    const renderShowPasswordButton =
      this.showPasswordButton && !this.multiline && this.type === "password";

    return (
      <Host
        class={{
          "ch-edit--auto-fill": this.autoFilled,
          "ch-edit--cursor-text": !isDateType && !this.disabled,
          "ch-edit--editable-date": isDateType && !this.readonly,
          "ch-edit--multiline": this.multiline && this.autoGrow,
          "ch-edit--clear-button": renderClearButton,
          "ch-edit--show-password-button": renderShowPasswordButton,

          [`ch-edit-start-img-type--${this.startImgType} ch-edit-pseudo-img--start`]:
            !this.multiline && !!this.#startImage
        }}
        // TODO: Add unit tests for this feature, since it breaks custom parts
        // rendered outside of the ch-edit render() method
        part={tokenMap({
          [EDIT_HOST_PARTS.EMPTY_VALUE]: !this.value,
          [this.hostParts]: !!this.hostParts
        })}
        style={!this.multiline ? this.#startImage?.styles ?? undefined : null}
        // Alignment
        data-text-align=""
        data-valign={!this.multiline ? "" : undefined}
      >
        {this.showAdditionalContentBefore && (
          <slot name="additional-content-before" />
        )}

        {this.multiline
          ? this.#renderTextareaWithAdditionalContent(canAddListeners)
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
                  "content input autofill": true,
                  "null-date": showDatePlaceholder
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
                type={
                  this.type === "password" && this.showPassword
                    ? "text"
                    : this.type
                }
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

              // Implements a non-native placeholder for date types. TODO: Add unit tests for this
              showDatePlaceholder && (
                <div
                  aria-hidden="true"
                  class="date-placeholder"
                  part={EDIT_PARTS_DICTIONARY.DATE_PLACEHOLDER}
                >
                  {this.placeholder}
                </div>
              )
            ]}

        {this.showAdditionalContentAfter && (
          <slot name="additional-content-after" />
        )}

        {renderClearButton && (
          <button
            aria-label={accessibleName.clearSearchButton}
            class="clear-button"
            part={tokenMap({
              [EDIT_PARTS_DICTIONARY.CLEAR_BUTTON]: true,
              [EDIT_PARTS_DICTIONARY.DISABLED]: this.disabled
            })}
            type="button"
            onClick={!this.disabled && this.#clearValue}
          ></button>
        )}

        {renderShowPasswordButton && (
          <button
            aria-label={
              this.showPassword
                ? accessibleName.hidePasswordButton
                : accessibleName.showPasswordButton
            }
            class={{
              "show-password-button": true,
              "show-password-button--hidden": !this.showPassword
            }}
            part={tokenMap({
              [EDIT_PARTS_DICTIONARY.SHOW_PASSWORD]: true,
              [EDIT_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [EDIT_PARTS_DICTIONARY.PASSWORD_DISPLAYED]: this.showPassword,
              [EDIT_PARTS_DICTIONARY.PASSWORD_HIDDEN]: !this.showPassword
            })}
            type="button"
            onClick={!this.disabled && this.#togglePasswordVisibility}
          ></button>
        )}
      </Host>
    );
  }
}

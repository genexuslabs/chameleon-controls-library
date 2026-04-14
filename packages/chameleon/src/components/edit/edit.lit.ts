import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import { IS_SERVER } from "../../development-flags";
import type {
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../typings/multi-state-images";
import { analyzeLabelExistence } from "../../utilities/analysis/accessibility";
import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";
import { Host } from "../../utilities/host/host";
import { tokenMap } from "../../utilities/mapping/token-map";
import { updateDirectionInImageCustomVar } from "../../utilities/multi-state-icons";
import { getControlRegisterProperty } from "../../utilities/register-properties/registry-properties";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import {
  EDIT_HOST_PARTS,
  EDIT_PARTS_DICTIONARY
} from "../../utilities/reserved-names/reserved-names";
import { adoptCommonThemes } from "../../utilities/theme.js";

import type { EditInputMode, EditTranslations, EditType } from "./types";
import styles from "./edit.scss?inline";

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
  shadow: { delegatesFocus: true, formAssociated: true },
  styles,
  tag: "ch-edit"
})
export class ChEdit extends KasstorElement {
  #accessibleNameFromExternalLabel: string | undefined;
  #startImage: GxImageMultiStateStart | undefined;

  #debounceId: ReturnType<typeof setTimeout> | undefined;
  #shouldComputePictureValue = false;

  #internals = this.attachInternals();

  // Refs
  #inputRef: Ref<HTMLInputElement> = createRef();
  #textareaRef: Ref<HTMLTextAreaElement> = createRef();

  // - - - - - - - - - - - - - - - - - - - - -
  //               @state (internal)
  // - - - - - - - - - - - - - - - - - - - - -

  /**
   * Determine if the ch-edit's value was auto-completed.
   */
  @state() private autoFilled = false;

  @state() private inputModeEditorDisplayed = false;

  @state() private isFocusOnControl = false;

  @state() private pictureValue: string | undefined;

  // - - - - - - - - - - - - - - - - - - - - -
  //               @property (public)
  // - - - - - - - - - - - - - - - - - - - - -

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName: string | undefined;

  /**
   * Specifies the auto-capitalization behavior. Same as [autocapitalize](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autocapitalize)
   * attribute for `input` elements. Only supported by Safari and Chrome.
   */
  @property() override autocapitalize: string = "";

  /**
   * This attribute indicates whether the value of the control can be
   * automatically completed by the browser. Same as [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-autocomplete)
   * attribute for `input` elements.
   */
  @property() autocomplete:
    | "on"
    | "off"
    | "current-password"
    | "new-password" = "off";

  /**
   * Specifies if the control automatically get focus when the page loads.
   */
  @property({ attribute: "auto-focus", type: Boolean }) autoFocus: boolean =
    false;

  /**
   * This property defines if the control size will grow automatically, to
   * adjust to its content size.
   */
  @property({ attribute: "auto-grow", type: Boolean }) autoGrow: boolean =
    false;

  /**
   * Specifies a debounce for the input event.
   */
  @property({ type: Number }) debounce: number = 0;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback:
    | ((imageSrc: string) => GxImageMultiState | undefined)
    | undefined;
  @Observe("getImagePathCallback")
  protected getImagePathCallbackChanged() {
    this.#computeImage();
  }

  /**
   * Specifies a set of parts to use in the Host element (`ch-edit`).
   */
  @property({ attribute: "host-parts" }) hostParts: string | undefined;

  /**
   * This property defines the maximum string length that the user can enter
   * into the control.
   */
  @property({ attribute: "max-length", type: Number }) maxLength:
    | number
    | undefined;

  /**
   * This attribute hints at the type of data that might be entered by the user
   * while editing the element or its contents. This allows a browser to
   * display an appropriate virtual keyboard. Only works when
   * `multiline === false`.
   */
  @property() mode: EditInputMode | undefined;

  /**
   * Controls if the element accepts multiline text.
   */
  @property({ type: Boolean }) multiline: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @property({ reflect: true }) name: string | undefined;

  /**
   * This attribute specifies a regular expression the form control's value
   * should match. Only works when `multiline === false`.
   */
  @property() pattern: string | undefined;

  /**
   * Specifies a picture to apply for the value of the control. Only works if
   * not `multiline`.
   */
  @property() picture: string | undefined;
  @Observe("picture")
  protected pictureChanged() {
    this.#shouldComputePictureValue = true;
  }

  /**
   * Specifies the callback to execute when the picture must computed for the
   * new value.
   */
  @property({ attribute: false }) pictureCallback:
    | ((value: unknown, picture: string) => string)
    | undefined;
  @Observe("pictureCallback")
  protected pictureCallbackChanged() {
    this.#shouldComputePictureValue = true;
  }

  /**
   * A hint to the user of what can be entered in the control. Same as [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)
   * attribute for `input` elements.
   */
  @property() placeholder: string | undefined;

  /**
   * Specifies whether the ch-edit should prevent the default behavior of the
   * `Enter` key when in input editor mode.
   *
   * In other words, if `true`, pressing `Enter` will not submit the form or
   * trigger the default action of the `Enter` key in an input field when the
   * user-edit is in input editor mode.
   */
  @property({ attribute: "prevent-enter-in-input-editor-mode", type: Boolean })
  preventEnterInInputEditorMode: boolean = false;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @property({ type: Boolean }) readonly: boolean = false;

  /**
   * If `true`, a slot is rendered in the edit with `"additional-content-after"`
   * name.
   * This slot is intended to customize the internal content of the edit by
   * adding additional elements after the edit content.
   */
  @property({ attribute: "show-additional-content-after", type: Boolean })
  showAdditionalContentAfter: boolean = false;

  /**
   * If `true`, a slot is rendered in the edit with `"additional-content-before"`
   * name.
   * This slot is intended to customize the internal content of the edit by
   * adding additional elements before the edit content.
   */
  @property({ attribute: "show-additional-content-before", type: Boolean })
  showAdditionalContentBefore: boolean = false;

  /**
   * Specifies if the password is displayed as plain text when using
   * `type = "password"`.
   */
  @property({ attribute: "show-password", type: Boolean }) showPassword:
    boolean = false;

  /**
   * Specifies if the show password button is displayed when using
   * `type = "password"`.
   */
  @property({ attribute: "show-password-button", type: Boolean })
  showPasswordButton: boolean = false;

  /**
   * Specifies whether the element may be checked for spelling errors.
   */
  @property({ type: Boolean }) override spellcheck: boolean = false;

  /**
   * Specifies the source of the start image.
   */
  @property({ attribute: "start-img-src" }) startImgSrc: string | undefined;
  @Observe("startImgSrc")
  protected startImgSrcChanged() {
    this.#computeImage();
  }

  /**
   * Specifies the source of the start image.
   */
  @property({ attribute: "start-img-type" }) startImgType: Exclude<
    ImageRender,
    "img"
  > = "background";

  /**
   * Specifies the literals required in the control.
   */
  @property({ attribute: false }) translations: EditTranslations = {
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
  @property() type: EditType = "text";

  /**
   * The initial value of the control.
   */
  @property() value: string | undefined;
  @Observe("value")
  protected valueChanged(newValue?: unknown) {
    this.#shouldComputePictureValue = true;

    const inputRef = this.#getInputRef();
    if (!inputRef) {
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
    if (inputRef.value !== this.value) {
      inputRef.value = this.value ?? "";
    }

    // Update form value
    this.#internals.setFormValue((newValue as string) ?? null);
  }

  // - - - - - - - - - - - - - - - - - - - - -
  //               @Event
  // - - - - - - - - - - - - - - - - - - - - -

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user. Unlike the `input` event, the `change` event is not
   * necessarily fired for each change to an element's value but when the
   * control loses focus.
   * This event is _NOT_ debounced by the `debounce` property.
   */
  @Event() protected change!: EventEmitter<Event>;

  /**
   * Fired synchronously when the value is changed.
   * This event is debounced by the `debounce` property.
   */
  @Event() protected input!: EventEmitter<string>;

  /**
   * Fired when the visibility of the password (when using `type="password"`)
   * is changed by clicking on the show password button.
   *
   * The detail contains the new value of the `showPassword` property.
   */
  @Event() protected passwordVisibilityChange!: EventEmitter<boolean>;

  // - - - - - - - - - - - - - - - - - - - - -
  //           Private methods
  // - - - - - - - - - - - - - - - - - - - - -
  #getInputRef = (): HTMLInputElement | HTMLTextAreaElement | undefined =>
    this.#inputRef.value ?? this.#textareaRef.value;

  #computeImage = () => {
    if (!this.startImgSrc) {
      this.#startImage = undefined;
      return;
    }
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      this.#startImage = undefined;
      return;
    }
    const img = getImagePathCallback(this.startImgSrc);

    if (!img) {
      this.#startImage = undefined;
      return;
    }

    this.#startImage = updateDirectionInImageCustomVar(
      img,
      "start"
    ) as GxImageMultiStateStart;
  };

  #getValueFromEvent = (event: Event): string =>
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

  #handleChange = (event: Event) => {
    this.value = this.#getValueFromEvent(event);
    this.change.emit(event);
  };

  #handleValueChanging = (event: Event) => {
    event.stopPropagation();

    const inputRef = this.#getInputRef();

    // Don't allow invalid values
    if (!inputRef || !inputRef.validity.valid) {
      if (inputRef) {
        inputRef.value = this.value ?? "";
      }
      return;
    }

    this.#setValueAndEmitInputEventWithDebounce(this.#getValueFromEvent(event));
  };

  #clearValue = (event: PointerEvent) => {
    event.stopPropagation();
    this.#setValueAndEmitInputEventWithDebounce("");

    requestAnimationFrame(() => this.focus());
  };

  #togglePasswordVisibility = (event: PointerEvent) => {
    event.stopPropagation();

    const newShowPassword = !this.showPassword;
    this.showPassword = newShowPassword;

    this.passwordVisibilityChange.emit(newShowPassword);
  };

  #hasAdditionalContent = () =>
    this.showAdditionalContentBefore || this.showAdditionalContentAfter;

  // - - - - - - - - - - - - - - - - - - - - -
  //           Input Mode Editor (IME)
  // - - - - - - - - - - - - - - - - - - - - -
  #inputModeEditorInProgress = (event: CompositionEvent) => {
    event.stopPropagation();
    this.inputModeEditorDisplayed = true;
  };

  #inputModeEditorEnded = (event: CompositionEvent) => {
    event.stopPropagation();
    this.inputModeEditorDisplayed = false;
  };

  #preventEnterOnKeyDown = (event: KeyboardEvent) => {
    // Prevent the default action of the Enter key when in input editor mode
    if (event.key === "Enter") {
      // Stop any remaining keydown listeners from being called
      event.stopPropagation();

      // Stop the form submit
      event.preventDefault();
    }
  };

  // - - - - - - - - - - - - - - - - - - - - -
  //                  Pictures
  // - - - - - - - - - - - - - - - - - - - - -
  #hasPictureApplied = () => this.picture && !!this.pictureCallback;

  #computePictureValue(value: string | number | undefined) {
    if (this.#hasPictureApplied()) {
      this.pictureValue = this.pictureCallback!(value, this.picture!).trim();
    }
  }

  #showPictureOnFocus = () => {
    this.isFocusOnControl = true;
  };

  #removePictureOnBlur = () => {
    this.isFocusOnControl = false;
  };

  // - - - - - - - - - - - - - - - - - - - - -
  //               Render helpers
  // - - - - - - - - - - - - - - - - - - - - -
  #renderTextarea = (
    canAddListeners: boolean,
    keyDownListener: ((event: KeyboardEvent) => void) | false
  ) =>
    html`<textarea
      ?autofocus=${this.autoFocus}
      aria-label=${this.#accessibleNameFromExternalLabel ||
      this.accessibleName ||
      nothing}
      autocapitalize=${this.autocapitalize || nothing}
      autocomplete=${this.autocomplete}
      class=${this.#hasAdditionalContent() && !this.autoGrow
        ? TEXTAREA_INLINE_CLASSES
        : TEXTAREA_FLOATING_CLASSES}
      ?disabled=${this.disabled}
      maxlength=${this.maxLength ?? nothing}
      placeholder=${this.placeholder ?? nothing}
      ?readonly=${this.readonly}
      .spellcheck=${this.spellcheck}
      .value=${this.value ?? ""}
      @change=${canAddListeners ? this.#handleChange : nothing}
      @input=${canAddListeners ? this.#handleValueChanging : nothing}
      @animationstart=${canAddListeners ? this.#handleAutoFill : nothing}
      @keydown=${keyDownListener || nothing}
      ${ref(this.#textareaRef)}
    ></textarea>`;

  #renderTextareaWithAdditionalContent = (
    canAddListeners: boolean,
    keyDownListener: ((event: KeyboardEvent) => void) | false
  ) => {
    // Floating as a "normal textarea"
    if (!this.#hasAdditionalContent()) {
      return html`${this.#renderTextarea(canAddListeners, keyDownListener)}
      ${this.autoGrow
        ? html`<div aria-hidden="true" class="hidden-multiline">
            ${this.value}
          </div>`
        : nothing}`;
    }

    // Inline case
    if (!this.autoGrow) {
      return this.#renderTextarea(canAddListeners, keyDownListener);
    }

    // Floating inside a container to implement the Auto Grow
    return html`<div class="multiline-container">
      ${this.#renderTextarea(canAddListeners, keyDownListener)}

      <div aria-hidden="true" class="hidden-multiline">${this.value}</div>
    </div>`;
  };

  // - - - - - - - - - - - - - - - - - - - - -
  //               Lifecycle
  // - - - - - - - - - - - - - - - - - - - - -
  override connectedCallback() {
    super.connectedCallback();

    adoptCommonThemes(this.shadowRoot!.adoptedStyleSheets);

    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty("getImagePathCallback", "ch-edit") ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    // Static host attribute
    this.dataset.textAlign = "";
  }

  protected override firstWillUpdate(): void {
    if (IS_SERVER) {
      return;
    }

    // Compute image on initial load (in case @Observe didn't fire for
    // undefined startImgSrc)
    this.#computeImage();
    this.#computePictureValue(this.value);

    // Accessibility
    this.#internals.setFormValue(this.value ?? null);
    const labels = this.#internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    // Report any accessibility issue
    analyzeLabelExistence(
      this,
      "ch-edit",
      labels,
      this.#accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

  override willUpdate(): void {
    if (this.#shouldComputePictureValue) {
      this.#shouldComputePictureValue = false;
      this.#computePictureValue(this.value);
    }
  }

  override firstUpdated(): void {
    if (this.autoFocus) {
      this.focus();
    }
  }

  // TODO: Remove the icon with multiline and add overflow: clip in the Host with multiline
  override render() {
    const { accessibleName } = this.translations;
    const isDateType = DATE_TYPES.includes(this.type);
    const showDatePlaceholder = isDateType && !!this.placeholder && !this.value;
    const shouldDisplayPicture = this.#hasPictureApplied();
    const canAddListeners = !this.disabled && !this.readonly;

    const renderClearButton =
      !this.multiline && this.type === "search" && !!this.value;

    const renderShowPasswordButton =
      this.showPasswordButton && !this.multiline && this.type === "password";

    const compositionStartListener =
      canAddListeners &&
      this.preventEnterInInputEditorMode &&
      !this.inputModeEditorDisplayed &&
      this.#inputModeEditorInProgress;

    // TODO: What happens when the input/textarea losses focus or it disabled
    // in runtime when the IME is displayed?
    // Does the compositionend event fire?
    const compositionEndListener =
      canAddListeners &&
      this.preventEnterInInputEditorMode &&
      this.inputModeEditorDisplayed &&
      this.#inputModeEditorEnded;

    const keyDownListener =
      canAddListeners &&
      this.preventEnterInInputEditorMode &&
      this.inputModeEditorDisplayed &&
      this.#preventEnterOnKeyDown;

    // Update host element
    Host(this, {
      class: {
        "ch-edit--auto-fill": this.autoFilled,
        "ch-edit--cursor-text": !isDateType && !this.disabled,
        "ch-edit--editable-date": isDateType && !this.readonly,
        "ch-edit--multiline": this.multiline && this.autoGrow,
        "ch-edit--clear-button": renderClearButton,
        "ch-edit--show-password-button": renderShowPasswordButton,
        [`ch-edit-start-img-type--${this.startImgType} ch-edit-pseudo-img--start`]:
          !this.multiline && !!this.#startImage
      },
      style:
        !this.multiline
          ? (this.#startImage?.styles as
              | { [key: string]: string | undefined }
              | undefined)
          : undefined,
      events: {
        compositionstart: compositionStartListener || undefined,
        compositionend: compositionEndListener || undefined
      }
    });

    // TODO: Add unit tests for this feature, since it breaks custom parts
    // rendered outside of the ch-edit render() method
    this.setAttribute(
      "part",
      tokenMap({
        [EDIT_HOST_PARTS.EMPTY_VALUE]: !this.value,
        [this.hostParts ?? ""]: !!this.hostParts
      })
    );

    // Conditional data-valign attribute
    if (!this.multiline) {
      this.dataset.valign = "";
    } else {
      delete this.dataset.valign;
    }

    return html`${this.showAdditionalContentBefore
        ? html`<slot name="additional-content-before"></slot>`
        : nothing}
      ${this.multiline
        ? this.#renderTextareaWithAdditionalContent(
            canAddListeners,
            keyDownListener
          )
        : html`<input
              ?autofocus=${this.autoFocus}
              aria-label=${this.#accessibleNameFromExternalLabel ||
              this.accessibleName ||
              nothing}
              autocapitalize=${this.autocapitalize || nothing}
              autocomplete=${this.autocomplete}
              class=${classMap({
                "content input autofill": true,
                "null-date": showDatePlaceholder
              })}
              ?disabled=${this.disabled}
              inputmode=${this.mode || nothing}
              maxlength=${this.maxLength ?? nothing}
              max=${MAX_DATE_VALUE[this.type] || nothing}
              min=${MIN_DATE_VALUE[this.type] || nothing}
              pattern=${this.pattern || nothing}
              placeholder=${this.placeholder ?? nothing}
              ?readonly=${this.readonly}
              .spellcheck=${this.spellcheck}
              step=${isDateType ? "1" : nothing}
              type=${this.type === "password" && this.showPassword
                ? "text"
                : this.type}
              .value=${shouldDisplayPicture && !this.isFocusOnControl
                ? this.pictureValue ?? ""
                : this.value ?? ""}
              @animationstart=${canAddListeners
                ? this.#handleAutoFill
                : nothing}
              @change=${canAddListeners ? this.#handleChange : nothing}
              @input=${canAddListeners ? this.#handleValueChanging : nothing}
              @keydown=${keyDownListener || nothing}
              @focus=${canAddListeners &&
              shouldDisplayPicture &&
              !this.isFocusOnControl
                ? this.#showPictureOnFocus
                : nothing}
              @blur=${canAddListeners &&
              shouldDisplayPicture &&
              this.isFocusOnControl
                ? this.#removePictureOnBlur
                : nothing}
              ${ref(this.#inputRef)}
            />

            ${showDatePlaceholder
              ? html`<div
                  aria-hidden="true"
                  class="date-placeholder"
                  part=${EDIT_PARTS_DICTIONARY.DATE_PLACEHOLDER}
                >
                  ${this.placeholder}
                </div>`
              : nothing}`}
      ${this.showAdditionalContentAfter
        ? html`<slot name="additional-content-after"></slot>`
        : nothing}
      ${renderClearButton
        ? html`<button
            aria-label=${accessibleName.clearSearchButton || nothing}
            class="clear-button"
            part=${tokenMap({
              [EDIT_PARTS_DICTIONARY.CLEAR_BUTTON]: true,
              [EDIT_PARTS_DICTIONARY.DISABLED]: this.disabled
            })}
            type="button"
            @click=${!this.disabled ? this.#clearValue : nothing}
          ></button>`
        : nothing}
      ${renderShowPasswordButton
        ? html`<button
            aria-label=${this.showPassword
              ? accessibleName.hidePasswordButton || nothing
              : accessibleName.showPasswordButton || nothing}
            class=${classMap({
              "show-password-button": true,
              "show-password-button--hidden": !this.showPassword
            })}
            part=${tokenMap({
              [EDIT_PARTS_DICTIONARY.SHOW_PASSWORD]: true,
              [EDIT_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [EDIT_PARTS_DICTIONARY.PASSWORD_DISPLAYED]: this.showPassword,
              [EDIT_PARTS_DICTIONARY.PASSWORD_HIDDEN]: !this.showPassword
            })}
            type="button"
            @click=${!this.disabled ? this.#togglePasswordVisibility : nothing}
          ></button>`
        : nothing}`;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChEditElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChEditElement;
  }

  /** Type of the `ch-edit`'s `change` event. */
  // prettier-ignore
  type HTMLChEditElementChangeEvent = HTMLChEditElementCustomEvent<
    HTMLChEditElementEventMap["change"]
  >;

  /** Type of the `ch-edit`'s `input` event. */
  // prettier-ignore
  type HTMLChEditElementInputEvent = HTMLChEditElementCustomEvent<
    HTMLChEditElementEventMap["input"]
  >;

  /** Type of the `ch-edit`'s `passwordVisibilityChange` event. */
  // prettier-ignore
  type HTMLChEditElementPasswordVisibilityChangeEvent = HTMLChEditElementCustomEvent<
    HTMLChEditElementEventMap["passwordVisibilityChange"]
  >;

  interface HTMLChEditElementEventMap {
    change: Event;
    input: string;
    passwordVisibilityChange: boolean;
  }

  interface HTMLChEditElementEventTypes {
    change: HTMLChEditElementChangeEvent;
    input: HTMLChEditElementInputEvent;
    passwordVisibilityChange: HTMLChEditElementPasswordVisibilityChangeEvent;
  }

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
   *
   * @fires change The `change` event is emitted when a change to the element's value is
   *   committed by the user. Unlike the `input` event, the `change` event is not
   *   necessarily fired for each change to an element's value but when the
   *   control loses focus.
   *   This event is _NOT_ debounced by the `debounce` property.
   * @fires input Fired synchronously when the value is changed.
   *   This event is debounced by the `debounce` property.
   * @fires passwordVisibilityChange Fired when the visibility of the password (when using `type="password"`)
   *   is changed by clicking on the show password button.
   *   
   *   The detail contains the new value of the `showPassword` property.
   */
  // prettier-ignore
  interface HTMLChEditElement extends ChEdit {
    // Extend the ChEdit class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChEditElementEventTypes>(type: K, listener: (this: HTMLChEditElement, ev: HTMLChEditElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChEditElementEventTypes>(type: K, listener: (this: HTMLChEditElement, ev: HTMLChEditElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-edit": HTMLChEditElement;
  }

  interface HTMLElementTagNameMap {
    "ch-edit": HTMLChEditElement;
  }
}


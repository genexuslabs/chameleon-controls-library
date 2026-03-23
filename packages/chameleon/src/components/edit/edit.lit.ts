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
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

import type { EditInputMode, EditTranslations, EditType } from "./types";
import type {
  GxImageMultiState,
  GxImageMultiStateStart,
  ImageRender
} from "../../typings/multi-state-images";
import { adoptCommonThemes } from "../../utilities/theme";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import { getControlRegisterProperty } from "../../utilities/register-properties/registry-properties";
import { updateDirectionInImageCustomVar } from "../../utilities/multi-state-icons";
import { analyzeLabelExistence } from "../../utilities/analysis/accessibility";
import { getElementInternalsLabel } from "../../utilities/analysis/get-element-internals-label";

const tokenMap = (tokens: Record<string, boolean>) =>
  Object.keys(tokens)
    .filter(key => tokens[key])
    .join(" ");

const EDIT_HOST_PARTS = {
  EMPTY_VALUE: "empty-value"
} as const;

const EDIT_PARTS_DICTIONARY = {
  CLEAR_BUTTON: "clear-button",
  DATE_PLACEHOLDER: "date-placeholder",
  DISABLED: "disabled",
  PASSWORD_DISPLAYED: "password-displayed",
  PASSWORD_HIDDEN: "password-hidden",
  SHOW_PASSWORD: "show-password"
} as const;

import type {
  AccessibleNameComponent,
  DisableableComponent
} from "../../utilities/types";

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
  tag: "ch-edit",
  shadow: { delegatesFocus: true, formAssociated: true },
  styles
})
export class ChEdit
  extends KasstorElement
  implements AccessibleNameComponent, DisableableComponent
{
  #accessibleNameFromExternalLabel: string | undefined;
  #startImage: GxImageMultiStateStart | undefined;

  #debounceId: NodeJS.Timeout | undefined;
  #shouldComputePictureValue = false;

  #inputRef: Ref<HTMLInputElement> = createRef();
  #textareaRef: Ref<HTMLTextAreaElement> = createRef();
  #textareaInsideContainerRef: Ref<HTMLTextAreaElement> = createRef();

  @state() private inputModeEditorDisplayed = false;
  @state() private isFocusOnControl = false;
  @state() private pictureValue: string;
  @state() private autoFilled = false;

  #internals: ElementInternals;

  @property({ attribute: "accessible-name" }) accessibleName: string;

  @property() autocapitalize: string;

  @property() autocomplete:
    | "on"
    | "off"
    | "current-password"
    | "new-password" = "off";

  @property({ attribute: "auto-focus", type: Boolean }) autoFocus: boolean =
    false;

  @property({ attribute: "auto-grow", type: Boolean }) autoGrow: boolean =
    false;

  @property({ type: Number }) debounce?: number = 0;

  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  @property({ attribute: false }) getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Observe("getImagePathCallback")
  protected getImagePathCallbackChanged() {
    this.#computeImage();
  }

  @property({ attribute: "host-parts" }) hostParts?: string;

  @property({ attribute: "max-length", type: Number }) maxLength:
    | number
    | undefined = undefined;

  @property() mode: EditInputMode | undefined;

  @property({ type: Boolean }) multiline: boolean = false;

  @property({ reflect: true }) name?: string;

  @property() pattern: string = undefined;

  @property() picture?: string;
  @Observe("picture")
  protected pictureChanged() {
    this.#shouldComputePictureValue = true;
  }

  @property({ attribute: false }) pictureCallback?: (
    value: any,
    picture: string
  ) => string;
  @Observe("pictureCallback")
  protected pictureCallbackChanged() {
    this.#shouldComputePictureValue = true;
  }

  @property() placeholder: string;

  @property({
    attribute: "prevent-enter-in-input-editor-mode",
    type: Boolean
  })
  preventEnterInInputEditorMode: boolean = false;

  @property({ type: Boolean }) readonly: boolean = false;

  @property({
    attribute: "show-additional-content-after",
    type: Boolean
  })
  showAdditionalContentAfter: boolean = false;

  @property({
    attribute: "show-additional-content-before",
    type: Boolean
  })
  showAdditionalContentBefore: boolean = false;

  @property({ attribute: "show-password", type: Boolean }) showPassword:
    | boolean = false;

  @property({ attribute: "show-password-button", type: Boolean })
  showPasswordButton: boolean = false;

  @property({ type: Boolean }) spellcheck: boolean = false;

  @property({ attribute: "start-img-src" }) startImgSrc: string;
  @Observe("startImgSrc")
  protected startImgSrcChanged() {
    this.#computeImage();
  }

  @property({ attribute: "start-img-type" }) startImgType: Exclude<
    ImageRender,
    "img"
  > = "background";

  @property({ attribute: false }) translations: EditTranslations = {
    accessibleName: {
      clearSearchButton: "Clear search",
      hidePasswordButton: "Hide password",
      showPasswordButton: "Show password"
    }
  };

  @property() type: EditType = "text";

  @property() value: string;
  @Observe("value")
  protected valueChanged(newValue: string) {
    this.#shouldComputePictureValue = true;

    if (!this.#getInputRef()) {
      return;
    }

    if (this.#getInputRef().value !== this.value) {
      this.#getInputRef().value = this.value;
    }

    this.#internals.setFormValue(newValue);
  }

  @Event() protected change!: EventEmitter;

  @Event() protected input!: EventEmitter<string>;

  @Event() protected passwordVisibilityChange!: EventEmitter<boolean>;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  #getInputRef = () =>
    this.#inputRef.value ??
    this.#textareaRef.value ??
    this.#textareaInsideContainerRef.value;

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

    if (!this.#getInputRef().validity.valid) {
      this.#getInputRef().value = this.value;
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

  #inputModeEditorInProgress = (event: CompositionEvent) => {
    event.stopPropagation();
    this.inputModeEditorDisplayed = true;
  };

  #inputModeEditorEnded = (event: CompositionEvent) => {
    event.stopPropagation();
    this.inputModeEditorDisplayed = false;
  };

  #preventEnterOnKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.stopPropagation();
      event.preventDefault();
    }
  };

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

  #renderTextarea = (
    canAddListeners: boolean,
    keyDownListener: ((event: KeyboardEvent) => void) | false
  ) => {
    const ariaLabel =
      this.#accessibleNameFromExternalLabel || this.accessibleName || null;

    return html`<textarea
      ?autofocus=${this.autoFocus}
      aria-label=${ifDefined(ariaLabel)}
      autocapitalize=${ifDefined(this.autocapitalize)}
      autocomplete=${this.autocomplete}
      class=${this.#hasAdditionalContent() && !this.autoGrow
        ? TEXTAREA_INLINE_CLASSES
        : TEXTAREA_FLOATING_CLASSES}
      ?disabled=${this.disabled}
      maxlength=${ifDefined(this.maxLength)}
      placeholder=${ifDefined(this.placeholder)}
      ?readonly=${this.readonly}
      ?spellcheck=${this.spellcheck}
      .value=${this.value || ""}
      @change=${canAddListeners ? this.#handleChange : nothing}
      @input=${canAddListeners ? this.#handleValueChanging : nothing}
      @animationstart=${canAddListeners ? this.#handleAutoFill : nothing}
      @keydown=${keyDownListener || nothing}
      ${ref(
        this.autoGrow && this.#hasAdditionalContent()
          ? this.#textareaInsideContainerRef
          : this.#textareaRef
      )}
    ></textarea>`;
  };

  #renderTextareaWithAdditionalContent = (
    canAddListeners: boolean,
    keyDownListener: ((event: KeyboardEvent) => void) | false
  ) => {
    if (!this.#hasAdditionalContent()) {
      return html`
        ${this.#renderTextarea(canAddListeners, keyDownListener)}
        ${this.autoGrow
          ? html`<div aria-hidden="true" class="hidden-multiline">
              ${this.value}
            </div>`
          : nothing}
      `;
    }

    if (!this.autoGrow) {
      return this.#renderTextarea(canAddListeners, keyDownListener);
    }

    return html`<div class="multiline-container">
      ${this.#renderTextarea(canAddListeners, keyDownListener)}
      <div aria-hidden="true" class="hidden-multiline">${this.value}</div>
    </div>`;
  };

  override connectedCallback() {
    super.connectedCallback();

    adoptCommonThemes(this.shadowRoot.adoptedStyleSheets);

    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty("getImagePathCallback", "ch-edit") ??
      DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#computeImage();
    this.#computePictureValue(this.value);

    this.#internals.setFormValue(this.value);
    const labels = this.#internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);

    analyzeLabelExistence(
      this,
      "ch-edit",
      labels,
      this.#accessibleNameFromExternalLabel,
      this.accessibleName
    );
  }

  override willUpdate() {
    if (this.#shouldComputePictureValue) {
      this.#shouldComputePictureValue = false;
      this.#computePictureValue(this.value);
    }
  }

  override firstUpdated() {
    if (this.autoFocus) {
      this.focus();
    }
  }

  override render() {
    const { accessibleName } = this.translations;
    const isDateType = DATE_TYPES.includes(this.type);
    const showDatePlaceholder = isDateType && this.placeholder && !this.value;
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

    const hostClasses = {
      "ch-edit--auto-fill": this.autoFilled,
      "ch-edit--cursor-text": !isDateType && !this.disabled,
      "ch-edit--editable-date": isDateType && !this.readonly,
      "ch-edit--multiline": this.multiline && this.autoGrow,
      "ch-edit--clear-button": renderClearButton,
      "ch-edit--show-password-button": renderShowPasswordButton,
      [`ch-edit-start-img-type--${this.startImgType}`]:
        !this.multiline && !!this.#startImage,
      "ch-edit-pseudo-img--start": !this.multiline && !!this.#startImage
    };

    const hostPart = tokenMap({
      [EDIT_HOST_PARTS.EMPTY_VALUE]: !this.value,
      [this.hostParts]: !!this.hostParts
    });

    const hostStyles = !this.multiline
      ? this.#startImage?.styles ?? undefined
      : null;

    Object.keys(hostClasses).forEach(key => {
      if (hostClasses[key]) {
        this.classList.add(key);
      } else {
        this.classList.remove(key);
      }
    });

    if (hostPart) {
      this.setAttribute("part", hostPart);
    }

    this.setAttribute("data-text-align", "");
    if (!this.multiline) {
      this.setAttribute("data-valign", "");
    } else {
      this.removeAttribute("data-valign");
    }

    const ariaLabel =
      this.#accessibleNameFromExternalLabel || this.accessibleName || null;

    return html`
      ${compositionStartListener
        ? html`<div
            @compositionstart=${this.#inputModeEditorInProgress}
            style="position: absolute; width: 100%; height: 100%; pointer-events: all;"
          ></div>`
        : nothing}
      ${compositionEndListener
        ? html`<div
            @compositionend=${this.#inputModeEditorEnded}
            style="position: absolute; width: 100%; height: 100%; pointer-events: all;"
          ></div>`
        : nothing}
      ${this.showAdditionalContentBefore
        ? html`<slot name="additional-content-before"></slot>`
        : nothing}
      ${this.multiline
        ? this.#renderTextareaWithAdditionalContent(
            canAddListeners,
            keyDownListener
          )
        : html`
            <input
              ?autofocus=${this.autoFocus}
              aria-label=${ifDefined(ariaLabel)}
              autocapitalize=${ifDefined(this.autocapitalize)}
              autocomplete=${this.autocomplete}
              class=${classMap({
                "content input autofill": true,
                "null-date": showDatePlaceholder
              })}
              ?disabled=${this.disabled}
              inputmode=${ifDefined(this.mode)}
              maxlength=${ifDefined(this.maxLength)}
              max=${ifDefined(MAX_DATE_VALUE[this.type])}
              min=${ifDefined(MIN_DATE_VALUE[this.type])}
              pattern=${ifDefined(this.pattern || undefined)}
              placeholder=${ifDefined(this.placeholder)}
              ?readonly=${this.readonly}
              ?spellcheck=${this.spellcheck}
              step=${ifDefined(isDateType ? "1" : undefined)}
              type=${this.type === "password" && this.showPassword
                ? "text"
                : this.type}
              .value=${shouldDisplayPicture && !this.isFocusOnControl
                ? this.pictureValue
                : this.value || ""}
              @animationstart=${canAddListeners ? this.#handleAutoFill : nothing}
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
              : nothing}
          `}
      ${this.showAdditionalContentAfter
        ? html`<slot name="additional-content-after"></slot>`
        : nothing}
      ${renderClearButton
        ? html`<button
            aria-label=${accessibleName.clearSearchButton}
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
              ? accessibleName.hidePasswordButton
              : accessibleName.showPasswordButton}
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
         : nothing}
     `;
   }
 }
 
 export interface HTMLChEditElement extends ChEdit {}
 
 declare global {
   interface HTMLElementTagNameMap {
     "ch-edit": HTMLChEditElement;
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
    change: void;
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
   * @fires change undefined
   * @fires input undefined
   * @fires passwordVisibilityChange undefined
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


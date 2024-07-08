import {
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
import { formatNumericField } from "@genexus/web-standard-functions/dist/lib-esm/numeric/formatNumericField";
import { formatNumericFieldBigNumber } from "@genexus/web-standard-functions/dist/lib-esm/bigNumber/formatNumericField";
import { GxBigNumber } from "@genexus/web-standard-functions/dist/lib-esm/types/gxbignumber";

import {
  AccessibleNameComponent,
  DisableableComponent
} from "../../common/interfaces";

import { DISABLED_CLASS } from "../../common/reserved-names";
import { EditInputMode, EditType } from "./types";

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
 *  - Useful style resets
 *  - Support to auto grow the control when used with multiline (useful to
 *    model chat inputs).
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
  // Variables calculated in componentWillLoad
  #shouldAddCursorText = false;

  // Refs
  #inputRef: HTMLInputElement | HTMLTextAreaElement = null;

  @State() isFocusOnControl = false;

  @State() pictureValue: string;

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
   * This property defines if the control size will grow automatically, to
   * adjust to its content size.
   */
  @Prop() readonly autoGrow: boolean = false;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

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
  @Prop() readonly multiline: boolean;

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
   * A hint to the user of what can be entered in the control. Same as [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)
   * attribute for `input` elements.
   */
  @Prop() readonly placeholder: string;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean;

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
  @Prop() readonly spellcheck: boolean;

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
    this.#computePictureValue(newValue);

    if (!this.#inputRef) {
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
    if (this.#inputRef.value !== this.value) {
      this.#inputRef.value = this.value;
    }
  }

  /**
   * Specifies a picture to apply for the value of the control. Only works if
   * `type === "Text"` and `mode === "numeric"`.
   */
  @Prop() readonly picture?: string;

  /**
   * The `change` event is emitted when a change to the element's value is
   * committed by the user. Unlike the `input` event, the `change` event is not
   * necessarily fired for each change to an element's value but when the
   * control loses focus.
   */
  @Event() change: EventEmitter;

  /**
   * The `input` event is fired synchronously when the value is changed.
   */
  @Event() input: EventEmitter;

  /**
   * The `gxTriggerClick` event is fired when the trigger button is clicked.
   */
  @Event() gxTriggerClick: EventEmitter;

  #getValueFromEvent = (event: InputEvent): string =>
    (event.target as HTMLInputElement).value;

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
    if (!this.#inputRef.validity.valid) {
      this.#inputRef.value = this.value;
      return;
    }

    this.value = this.#getValueFromEvent(event);
    this.input.emit(event);
  };

  #handleTriggerClick = (event: UIEvent) => {
    if (!this.disabled) {
      event.stopPropagation();
    }
    this.gxTriggerClick.emit(event);
  };

  // - - - - - - - - - - - - - - - - - - - - - -
  //                  Pictures
  // - - - - - - - - - - - - - - - - - - - - - -
  #hasPictureApplied = () =>
    this.picture &&
    this.type === "text" &&
    (this.mode === "numeric" || this.mode === "decimal");

  #computePictureValue(value: string | number) {
    if (!this.#hasPictureApplied()) {
      return;
    }

    if (typeof value === "number") {
      this.pictureValue = formatNumericField(value, this.picture).trim();
    } else {
      this.pictureValue = formatNumericFieldBigNumber(
        value as any as GxBigNumber,
        this.picture
      ).trim();
    }
  }

  #showPictureOnFocus = () => {
    this.isFocusOnControl = true;
  };

  #removePictureOnBlur = () => {
    this.isFocusOnControl = false;
  };

  connectedCallback() {
    this.#computePictureValue(this.value);
  }

  render() {
    const isDateType = DATE_TYPES.includes(this.type);
    this.#shouldAddCursorText = !isDateType;

    const shouldDisplayPicture = this.#hasPictureApplied();
    const canAddListeners = !this.disabled && !this.readonly;

    return (
      <Host
        class={{
          "ch-edit--auto-fill": this.autoFilled,
          "ch-edit--cursor-text": this.#shouldAddCursorText && !this.disabled,
          "ch-edit--editable-date": isDateType && !this.readonly,
          "ch-edit--multiline": this.multiline && this.autoGrow,
          "ch-edit__trigger-button-space": this.showTrigger,

          [DISABLED_CLASS]: this.disabled
        }}
        // Alignment
        data-text-align=""
        data-valign={!this.multiline ? "" : undefined}
      >
        {this.multiline
          ? [
              <textarea
                aria-label={this.accessibleName || undefined}
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
                onChange={canAddListeners ? this.#handleChange : null}
                onInput={canAddListeners ? this.#handleValueChanging : null}
                onAnimationStart={canAddListeners ? this.#handleAutoFill : null}
                ref={el => (this.#inputRef = el)}
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
                aria-label={this.accessibleName || undefined}
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
                pattern={this.pattern}
                placeholder={this.placeholder}
                readOnly={this.readonly}
                spellcheck={this.spellcheck}
                step={DATE_TYPES.includes(this.type) ? "1" : undefined}
                type={this.type}
                value={
                  shouldDisplayPicture && !this.isFocusOnControl
                    ? this.pictureValue
                    : this.value
                }
                // Event listeners
                onAnimationStart={canAddListeners ? this.#handleAutoFill : null}
                onChange={canAddListeners ? this.#handleChange : null}
                onInput={canAddListeners ? this.#handleValueChanging : null}
                onFocus={
                  canAddListeners &&
                  shouldDisplayPicture &&
                  !this.isFocusOnControl
                    ? this.#showPictureOnFocus
                    : null
                }
                onBlur={
                  canAddListeners &&
                  shouldDisplayPicture &&
                  this.isFocusOnControl
                    ? this.#removePictureOnBlur
                    : null
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
                  onClick={canAddListeners ? this.#handleTriggerClick : null}
                >
                  <slot name="trigger-content" />
                </button>
              ),

              // Implements a non-native placeholder for date types
              isDateType && !this.value && (
                <div
                  aria-hidden="true"
                  class="date-placeholder"
                  part="date-placeholder"
                >
                  {this.placeholder}
                </div>
              )
            ]}
      </Host>
    );
  }
}

import {
  AttachInternals,
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import {
  CHECKBOX_PARTS_DICTIONARY,
  DISABLED_CLASS
} from "../../common/reserverd-names";

import {
  AccessibleNameComponent,
  DisableableComponent,
  FormComponent
} from "../../common/interfaces";

const CHECKBOX_ID = "checkbox";

const PARTS = (checked: boolean, indeterminate: boolean, disabled: boolean) => {
  if (indeterminate) {
    return disabled
      ? `${CHECKBOX_PARTS_DICTIONARY.DISABLED} ${CHECKBOX_PARTS_DICTIONARY.INDETERMINATE}`
      : CHECKBOX_PARTS_DICTIONARY.INDETERMINATE;
  }

  const checkedValue = checked
    ? CHECKBOX_PARTS_DICTIONARY.CHECKED
    : CHECKBOX_PARTS_DICTIONARY.UNCHECKED;

  return disabled
    ? `${CHECKBOX_PARTS_DICTIONARY.DISABLED} ${checkedValue}`
    : checkedValue;
};

/**
 * @status developer-preview
 *
 * @part container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @part input - The input element that implements the interactions for the component.
 * @part option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
 * @part label - The label that is rendered when the `caption` property is not empty.
 *
 * @part checked - Present in the `input`, `option`, `label` and `container` parts when the control is checked and not indeterminate (`value` === `checkedValue` and `indeterminate !== true`).
 * @part disabled - Present in the `input`, `option`, `label` and `container` parts when the control is disabled (`disabled` === `true`).
 * @part indeterminate - Present in the `input`, `option`, `label` and `container` parts when the control is indeterminate (`indeterminate` === `true`).
 * @part unchecked - Present in the `input`, `option`, `label` and `container` parts when the control is unchecked and not indeterminate (`value` === `unCheckedValue` and `indeterminate !== true`).
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "checkbox.scss",
  tag: "ch-checkbox"
})
export class ChCheckBox
  implements AccessibleNameComponent, DisableableComponent, FormComponent
{
  #accessibleNameFromExternalLabel: string | undefined;
  #inputRef: HTMLInputElement;

  @AttachInternals() internals: ElementInternals;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * Specifies the label of the checkbox.
   */
  @Prop() readonly caption?: string;

  /**
   * The value when the checkbox is 'on'
   */
  @Prop() readonly checkedValue!: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * True to highlight control when an action is fired.
   */
  @Prop() readonly highlightable: boolean = false;

  /**
   * `true` if the control's value is indeterminate.
   */
  @Prop({ mutable: true }) indeterminate: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * The value when the switch is 'off'. If you want to not add the value when
   * the control is used in a form and it's unchecked, just let this property
   * with the default `undefined` value.
   */
  @Prop() readonly unCheckedValue?: string | undefined;

  /**
   * The value of the control.
   */
  @Prop({ mutable: true }) value?: string;
  @Watch("value")
  valueChanged(newValue: string) {
    // Update form value
    this.internals.setFormValue(newValue?.toString());
  }

  /**
   * Emitted when the element is clicked or the space key is pressed and
   * released.
   */
  @Event() click: EventEmitter;

  /**
   * The `input` event is emitted when a change to the element's value is
   * committed by the user.
   */
  @Event() input: EventEmitter;

  #stopClickPropagation = (event: UIEvent) => {
    event.stopPropagation();
  };

  #handleChange = (event: UIEvent) => {
    event.stopPropagation();

    const inputRef = event.target as HTMLInputElement;
    const checked = inputRef.checked;
    const value = checked ? this.checkedValue : this.unCheckedValue;

    this.value = value;
    inputRef.value = value; // Update input's value before emitting the event

    // When the checked value is updated by the user, the control must no
    // longer be indeterminate
    this.indeterminate = false;

    this.input.emit(event);

    if (this.highlightable) {
      this.click.emit();
    }
  };

  #handleHostClick = () => {
    this.#inputRef.click();
  };

  connectedCallback() {
    // Set initial value to unchecked if empty
    this.value ||= this.unCheckedValue;

    // Set form value
    this.internals.setFormValue(this.value?.toString());

    const labels = this.internals.labels;

    // Get external aria-label
    if (!this.accessibleName && labels?.length > 0) {
      this.#accessibleNameFromExternalLabel = labels[0].textContent.trim();
    }
  }

  render() {
    const checked = this.value === this.checkedValue;

    const additionalParts = PARTS(checked, this.indeterminate, this.disabled);

    const accessibleName =
      this.accessibleName ?? this.#accessibleNameFromExternalLabel;

    const canAddListeners = !this.disabled && !this.readonly;

    return (
      <Host
        class={{
          [DISABLED_CLASS]: this.disabled,
          "ch-checkbox--actionable":
            (!this.readonly && !this.disabled) ||
            (this.readonly && this.highlightable)
        }}
        onClick={canAddListeners ? this.#handleHostClick : null}
      >
        <div
          class="container"
          part={`${CHECKBOX_PARTS_DICTIONARY.CONTAINER} ${additionalParts}`}
        >
          <input
            id={this.caption ? CHECKBOX_ID : null}
            aria-label={
              accessibleName?.trim() !== "" && accessibleName !== this.caption
                ? accessibleName
                : null
            }
            class="input"
            part={`${CHECKBOX_PARTS_DICTIONARY.INPUT} ${additionalParts}`}
            type="checkbox"
            checked={checked}
            disabled={this.disabled || this.readonly}
            indeterminate={this.indeterminate}
            value={this.value}
            onClick={canAddListeners ? this.#stopClickPropagation : null}
            onInput={canAddListeners ? this.#handleChange : null}
            ref={el => (this.#inputRef = el)}
          />
          <div
            class={{
              option: true,
              "option--not-displayed": !checked && !this.indeterminate,
              "option--checked": checked && !this.indeterminate,
              "option--indeterminate": this.indeterminate
            }}
            part={`${CHECKBOX_PARTS_DICTIONARY.OPTION} ${additionalParts}`}
            aria-hidden="true"
          ></div>
        </div>

        {this.caption && (
          <label
            class="label"
            part={`${CHECKBOX_PARTS_DICTIONARY.LABEL} ${additionalParts}`}
            htmlFor={CHECKBOX_ID}
            onClick={canAddListeners ? this.#stopClickPropagation : null}
          >
            {this.caption}
          </label>
        )}
      </Host>
    );
  }
}

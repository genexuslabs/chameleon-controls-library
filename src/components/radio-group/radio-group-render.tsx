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
import { RADIO_ITEM_PARTS_DICTIONARY } from "../../common/reserved-names";
import { RadioGroupItemModel, RadioGroupModel } from "./types";

const PARTS = (checked: boolean, disabled: boolean) => {
  const checkedValue = checked
    ? RADIO_ITEM_PARTS_DICTIONARY.CHECKED
    : RADIO_ITEM_PARTS_DICTIONARY.UNCHECKED;

  return disabled
    ? `${RADIO_ITEM_PARTS_DICTIONARY.DISABLED} ${checkedValue}`
    : checkedValue;
};

/**
 * The `ch-radio-group-render` component renders a group of mutually exclusive radio options, allowing users to select exactly one value from a short list.
 *
 * @remarks
 * ## Features
 *  - Mutually exclusive selection from a set of options.
 *  - Horizontal or vertical layout via the `direction` property.
 *  - Individual item disabling.
 *  - Accessible labels for each option.
 *  - Form-associated via `ElementInternals`.
 *
 * ## Use when
 *  - A small, static set of options where all choices should be visible at once.
 *  - Exactly one option must be selected from the group.
 *  - The user must choose exactly one option from 2–7 mutually exclusive choices.
 *  - All options should be visible simultaneously so users can compare before deciding.
 *  - The choice is part of a form that requires a submit step.
 *
 * ## Do not use when
 *  - The option list is long or searchable — prefer `ch-combo-box-render` instead.
 *  - Multiple options can be selected — prefer `ch-checkbox` instead.
 *  - More than 7–8 options are available — prefer `ch-combo-box-render`.
 *  - The setting takes immediate effect — prefer `ch-switch`.
 *  - A single radio button is used in isolation — radio inputs must always work as a group and cannot be unchecked once selected.
 *
 * ## Accessibility
 *  - Form-associated via `ElementInternals` — participates in native form validation and submission.
 *  - Delegates focus into the shadow DOM (`delegatesFocus: true`).
 *  - The host element has `role="radiogroup"`.
 *  - Each option uses a native `<input type="radio">` with a linked `<label>`.
 *  - When no caption is provided, the radio input receives an `aria-label`.
 *  - The decorative option overlay is hidden from assistive technology with `aria-hidden`.
 *
 * @status experimental
 *
 * @part radio-item - The radio item element.
 * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".
 * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
 * @part radio__label - The label that is rendered when the `caption` property is not empty.
 *
 * @part checked - Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).
 * @part disabled - Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).
 * @part unchecked - Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "radio-group-render.scss",
  tag: "ch-radio-group-render"
})
export class ChRadioGroupRender {
  @AttachInternals() internals: ElementInternals;

  /**
   * Specifies the direction of the items.
   */
  @Prop() readonly direction: "horizontal" | "vertical" = "horizontal";

  /**
   * This attribute lets you specify if the radio-group is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property lets you define the items of the ch-radio-group-render control.
   */
  @Prop() readonly model?: RadioGroupModel;

  /**
   * The value of the control.
   */
  @Prop({ mutable: true }) value: string;
  @Watch("value")
  handleValueChange(newValue: string) {
    // Update form value
    this.internals.setFormValue(newValue);
  }

  /**
   * Fired when the selected item change. It contains the information about the
   * new selected value.
   */
  @Event() change: EventEmitter<string>;

  #handleCheckedInputChange = (value: string) => (event: InputEvent) => {
    event.stopPropagation();
    this.value = value;

    this.change.emit(value);
  };

  #itemRender = (item: RadioGroupItemModel, index: number) => {
    const checked = this.value === item.value;
    const disabled = item.disabled || this.disabled;

    const additionalParts = PARTS(checked, disabled);

    return (
      <div
        class="radio-item"
        part={`${RADIO_ITEM_PARTS_DICTIONARY.RADIO_ITEM} ${additionalParts}`}
      >
        <div
          class={{
            container: true,
            "container--checked": checked
          }}
          part={`${RADIO_ITEM_PARTS_DICTIONARY.CONTAINER} ${additionalParts}`}
        >
          <input
            id={item.caption ? `radio-item-${index}` : null}
            name="radio-group"
            aria-label={!item.caption ? item.accessibleName : null}
            class={{ input: true, "input--enabled": !disabled }}
            part={RADIO_ITEM_PARTS_DICTIONARY.INPUT}
            type="radio"
            checked={checked}
            disabled={disabled}
            value={item.value}
            onInput={this.#handleCheckedInputChange(item.value)}
          />
          <div
            class={{
              option: true,
              "option--unchecked": !checked
            }}
            part={`${RADIO_ITEM_PARTS_DICTIONARY.OPTION} ${additionalParts}`}
            aria-hidden="true"
          ></div>
        </div>

        {item.caption && (
          <label
            class={{ label: true, "label--enabled": !disabled }}
            part={`${RADIO_ITEM_PARTS_DICTIONARY.LABEL} ${additionalParts}`}
            htmlFor={`radio-item-${index}`}
          >
            {item.caption}
          </label>
        )}
      </div>
    );
  };

  connectedCallback() {
    // Set form value
    this.internals.setFormValue(this.value);
  }

  render() {
    return (
      <Host
        role="radiogroup"
        class={`ch-radio-group--direction-${this.direction}`}
      >
        {this.model?.map(this.#itemRender)}
      </Host>
    );
  }
}

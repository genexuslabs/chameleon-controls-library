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
import { RadioItem } from "./types";
import { RADIO_ITEM_PARTS_DICTIONARY } from "../../../common/reserverd-names";

const PARTS = (checked: boolean, disabled: boolean) => {
  const checkedValue = checked
    ? RADIO_ITEM_PARTS_DICTIONARY.CHECKED
    : RADIO_ITEM_PARTS_DICTIONARY.UNCHECKED;

  return disabled
    ? `${RADIO_ITEM_PARTS_DICTIONARY.DISABLED} ${checkedValue}`
    : checkedValue;
};

/**
 * The radio group control is used to render a short list of mutually exclusive options.
 *
 * It contains radio items to allow users to select one option from the list of options.
 *
 * @part radio__item - The radio item element.
 * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.
 * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".
 * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.
 * @part radio__label - The label that is rendered when the `caption` property is not empty.
 *
 * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).
 * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).
 * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).
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
   * This attribute lets you specify if the radio-group is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property lets you define the items of the ch-radio-group-render control.
   */
  @Prop() readonly items?: RadioItem[];

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

  #itemRender = (item: RadioItem, index: number) => {
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
    return <Host role="radiogroup">{this.items?.map(this.#itemRender)}</Host>;
  }
}

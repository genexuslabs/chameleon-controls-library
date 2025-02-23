import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { AccessibleNameComponent } from "../../common/interfaces";
import {
  DISABLED_CLASS,
  SWITCH_PARTS_DICTIONARY
} from "../../common/reserved-names";
import { tokenMap } from "../../common/utils";
import { getElementInternalsLabel } from "../../common/analysis/accessibility";

/**
 * @status experimental
 *
 * A switch/toggle control that enables you to select between options.
 *
 * @part track - The track of the switch element.
 * @part thumb - The thumb of the switch element.
 * @part caption - The caption (checked or unchecked) of the switch element.
 *
 * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`value` === `checkedValue`).
 * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).
 * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`value` === `unCheckedValue`).
 */
@Component({
  formAssociated: true,
  shadow: { delegatesFocus: true },
  styleUrl: "switch.scss",
  tag: "ch-switch"
})
export class ChSwitch implements AccessibleNameComponent {
  #accessibleNameFromExternalLabel: string | undefined;
  #inputRef: HTMLInputElement;

  @AttachInternals() internals: ElementInternals;

  @Element() el: HTMLChSwitchElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * Caption displayed when the switch is 'on'
   */
  @Prop() readonly checkedCaption: string;

  /**
   * The value when the switch is 'on'
   */
  @Prop() readonly checkedValue!: string;

  /**
   * This attribute allows you specify if the element is disabled.
   * If disabled, it will not trigger any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * Caption displayed when the switch is 'off'
   */
  @Prop() readonly unCheckedCaption: string;

  /**
   * The value when the switch is 'off'. If you want to not add the value when
   * the control is used in a form and it's unchecked, just let this property
   * with the default `undefined` value.
   */
  @Prop() readonly unCheckedValue: string = undefined;

  /**
   * The value of the control.
   */
  @Prop({ mutable: true }) value: string = null;
  @Watch("value")
  handleValueChange(newValue: number) {
    // Update form value
    this.internals.setFormValue(newValue?.toString());
  }

  /**
   * The 'input' event is emitted when a change to the element's value is committed by the user.
   */
  @Event() input: EventEmitter;

  #handleInput = (event: UIEvent) => {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;

    // Toggle the value property
    this.value = checked ? this.checkedValue : this.unCheckedValue;

    this.input.emit(event);
  };

  #handleClickChange = () => {
    this.#inputRef.click();
  };

  #stopClickPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  connectedCallback() {
    // Set initial value to unchecked if empty
    this.value ||= this.unCheckedValue;

    // Accessibility
    this.internals.setFormValue(this.value?.toString());
    const labels = this.internals.labels;
    this.#accessibleNameFromExternalLabel = getElementInternalsLabel(labels);
  }

  render() {
    const checked = this.value === this.checkedValue;

    return (
      <Host
        class={this.disabled ? DISABLED_CLASS : null}
        onClick={!this.disabled ? this.#handleClickChange : null}
      >
        <label
          class="wrapper-for-click-event"
          onClick={!this.disabled ? this.#stopClickPropagation : null}
        >
          <div
            class={{ track: true, "track--checked": checked }}
            part={tokenMap({
              [SWITCH_PARTS_DICTIONARY.TRACK]: true,
              [SWITCH_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [SWITCH_PARTS_DICTIONARY.CHECKED]: checked,
              [SWITCH_PARTS_DICTIONARY.UNCHECKED]: !checked
            })}
          >
            <input
              role="switch"
              aria-checked={checked ? "true" : "false"}
              aria-label={
                this.#accessibleNameFromExternalLabel ?? this.accessibleName
              }
              class={{ thumb: true, "thumb--checked": checked }}
              part={tokenMap({
                [SWITCH_PARTS_DICTIONARY.THUMB]: true,
                [SWITCH_PARTS_DICTIONARY.DISABLED]: this.disabled,
                [SWITCH_PARTS_DICTIONARY.CHECKED]: checked,
                [SWITCH_PARTS_DICTIONARY.UNCHECKED]: !checked
              })}
              checked={checked}
              disabled={this.disabled}
              type="checkbox"
              value={checked ? this.checkedValue : this.unCheckedValue}
              onInput={!this.disabled ? this.#handleInput : null}
              ref={el => (this.#inputRef = el)}
            />
          </div>

          <span
            // The values are hidden from the accessibility tree, because the
            // switch has the aria-valuetext attribute
            aria-hidden="true"
            class="caption"
            part={tokenMap({
              [SWITCH_PARTS_DICTIONARY.CAPTION]: true,
              [SWITCH_PARTS_DICTIONARY.DISABLED]: this.disabled,
              [SWITCH_PARTS_DICTIONARY.CHECKED]: checked,
              [SWITCH_PARTS_DICTIONARY.UNCHECKED]: !checked
            })}
          >
            {checked ? this.checkedCaption : this.unCheckedCaption}
          </span>
        </label>
      </Host>
    );
  }
}

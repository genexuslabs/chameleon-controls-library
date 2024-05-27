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
import { DISABLED_CLASS } from "../../common/reserverd-names";
import { tokenMap } from "../../common/utils";

/**
 * @status experimental
 *
 * A switch/toggle control that enables you to select between options.
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
              track: true,
              disabled: this.disabled,
              checked: checked,
              unchecked: !checked
            })}
          >
            <input
              role="switch"
              aria-checked={checked ? "true" : "false"}
              aria-label={
                this.accessibleName ?? this.#accessibleNameFromExternalLabel
              }
              class={{ thumb: true, "thumb--checked": checked }}
              part={tokenMap({
                thumb: true,
                disabled: this.disabled,
                checked: checked,
                unchecked: !checked
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
            part="caption"
          >
            {checked ? this.checkedCaption : this.unCheckedCaption}
          </span>
        </label>
      </Host>
    );
  }
}

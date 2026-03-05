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
import { getElementInternalsLabel } from "../../common/analysis/accessibility";
import { AccessibleNameComponent } from "../../common/interfaces";
import {
  DISABLED_CLASS,
  SWITCH_PARTS_DICTIONARY
} from "../../common/reserved-names";
import { tokenMap } from "../../common/utils";

/**
 * The `ch-switch` component is a toggle control that lets users switch between two mutually exclusive states, typically representing an on/off or enabled/disabled choice.
 *
 * @remarks
 * ## Features
 *  - Track with a sliding thumb for on/off toggling.
 *  - Optional caption that changes based on the current state.
 *  - Custom checked and unchecked values.
 *  - Form-associated via `ElementInternals`.
 *
 * ## Use when
 *  - A boolean setting, feature flag, or preference toggle is needed.
 *  - The semantics represent toggling a state on or off.
 *  - A binary system or application setting that takes effect immediately (e.g., "Enable notifications", "Dark mode").
 *  - The result is immediately visible and reversible without additional confirmation.
 *
 * ## Do not use when
 *  - Selecting an item from a list — prefer `ch-checkbox` or `ch-radio-group-render` instead.
 *  - The change requires a confirmation or save step — prefer `ch-checkbox`.
 *  - The toggle is part of a multi-field form submission — prefer `ch-checkbox`.
 *  - More than two states are needed — prefer `ch-combo-box-render`, `ch-radio-group-render`, or `ch-segmented-control-render`.
 *  - A destructive or irreversible action is triggered — always require explicit confirmation.
 *
 * ## Slots
 *  - This component does not define any slots.
 *
 * ## Accessibility
 *  - Form-associated via `ElementInternals` — participates in native form validation and submission.
 *  - Delegates focus into the shadow DOM (`delegatesFocus: true`), so focusing the host automatically focuses the internal `<input>`.
 *  - The native `<input>` element has `role="switch"` and `aria-checked` reflecting the current checked state.
 *  - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.
 *  - The decorative caption is hidden from assistive technology with `aria-hidden`.
 *  - **Keyboard interaction**: `Space` toggles the switch, `Tab` moves focus to/from the control.
 *
 * @status experimental
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
   * Caption displayed when the switch is 'on'.
   * This is purely visual — the caption element is `aria-hidden="true"`, so
   * it has no effect on assistive technology.
   */
  @Prop() readonly checkedCaption: string;

  /**
   * The value when the switch is 'on'. This property is required (no default).
   * The checked state is derived from `value === checkedValue`.
   */
  @Prop() readonly checkedValue!: string;

  /**
   * This attribute allows you specify if the element is disabled.
   * If disabled, it will not trigger any user interaction related event
   * (for example, click event). When `true`, all event handlers (click on
   * host, input on the internal input, click on the label) are suppressed,
   * and the `ch-disabled` class is added to the host element.
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property specifies the `name` of the control when used in a form.
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * Caption displayed when the switch is 'off'.
   * This is purely visual — the caption element is `aria-hidden="true"`, so
   * it has no effect on assistive technology.
   */
  @Prop() readonly unCheckedCaption: string;

  /**
   * The value when the switch is 'off'. If you want to not add the value when
   * the control is used in a form and it's unchecked, just let this property
   * with the default `undefined` value. When `undefined`, no form value is
   * submitted in the unchecked state.
   */
  @Prop() readonly unCheckedValue: string = undefined;

  /**
   * The value of the control. Mutated internally on toggle (set to
   * `checkedValue` or `unCheckedValue`). During `connectedCallback`, it is
   * initialized from `unCheckedValue` if unset. The `@Watch` handler syncs
   * the value with `ElementInternals.setFormValue()` on every change.
   */
  @Prop({ mutable: true }) value: string = null;
  @Watch("value")
  handleValueChange(newValue: number) {
    // Update form value
    this.internals.setFormValue(newValue?.toString());
  }

  /**
   * The 'input' event is emitted when a change to the element's value is
   * committed by the user. The native input event is stopped from propagating
   * and re-emitted on the host. The payload is the original `UIEvent` (not
   * the new value string).
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

    // Report any accessibility issue. // TODO: It should take into account the "caption" properties
    // analyzeLabelExistence(
    //   this.el,
    //   "ch-switch",
    //   labels,
    //   this.#accessibleNameFromExternalLabel,
    //   this.accessibleName
    // );
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

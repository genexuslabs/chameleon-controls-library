import {
  Component,
  Event,
  EventEmitter,
  Prop,
  Watch,
  Host,
  h
} from "@stencil/core";
import { DISABLED_CLASS } from "../../common/reserverd-names";

import {
  AccessibleNameComponent,
  DisableableComponent
} from "../../common/interfaces";

const CHECKBOX_ID = "checkbox";

const PARTS = (checked: boolean, indeterminate: boolean) =>
  `${checked ? " checked" : ""}${indeterminate ? " indeterminate" : ""}`;

@Component({
  shadow: true,
  styleUrl: "checkbox.scss",
  tag: "ch-checkbox"
})
export class CheckBox implements AccessibleNameComponent, DisableableComponent {
  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * Specifies the label of the checkbox.
   */
  @Prop() readonly caption: string;

  /**
   * Indicates that the control is selected by default.
   */
  @Prop({ mutable: true }) checked: boolean;

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
  @Prop() readonly indeterminate: boolean = false;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * The value when the checkbox is 'off'
   */
  @Prop() readonly unCheckedValue!: string;

  /**
   * The value of the control.
   */
  @Prop({ mutable: true }) value!: string;

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

  @Watch("value")
  protected valueChanged() {
    this.checked = this.value === this.checkedValue;
  }

  componentWillLoad() {
    this.checked = this.value === this.checkedValue;
  }

  #getValue = (checked: boolean) =>
    checked ? this.checkedValue : this.unCheckedValue;

  /**
   * Checks if it is necessary to prevent the click from bubbling
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #handleClick = (event: UIEvent) => {
    if (this.readonly || this.disabled) {
      return;
    }

    event.stopPropagation();
  };

  #handleChange = (event: UIEvent) => {
    event.stopPropagation();

    const inputRef = event.target as HTMLInputElement;
    const checked = inputRef.checked;
    const value = this.#getValue(checked);

    this.checked = checked;
    this.value = value;
    inputRef.value = value; // Update input's value before emitting the event

    this.input.emit(event);

    if (this.highlightable) {
      this.click.emit();
    }
  };

  render() {
    const additionalParts = PARTS(this.checked, this.indeterminate);

    return (
      <Host
        class={{
          [DISABLED_CLASS]: this.disabled,
          "ch-checkbox--actionable":
            (!this.readonly && !this.disabled) ||
            (this.readonly && this.highlightable)
        }}
      >
        <div
          class={{
            container: true,
            "container--checked": this.checked
          }}
          part={`container${additionalParts}`}
        >
          <input
            aria-label={
              this.accessibleName?.trim() !== "" &&
              this.accessibleName !== this.caption
                ? this.accessibleName
                : null
            }
            id={this.caption ? CHECKBOX_ID : null}
            class="input"
            part="input"
            type="checkbox"
            checked={this.checked}
            disabled={this.disabled || this.readonly}
            indeterminate={this.indeterminate}
            value={this.value}
            onClick={this.#handleClick}
            onInput={this.#handleChange}
          />
          <div
            class={{
              option: true,
              "option--checked": this.checked && !this.indeterminate,
              "option--indeterminate": this.indeterminate
            }}
            part={`option${additionalParts}`}
            aria-hidden="true"
          ></div>
        </div>

        {this.caption && (
          <label
            class="label"
            part="label"
            htmlFor={CHECKBOX_ID}
            onClick={this.#handleClick}
          >
            {this.caption}
          </label>
        )}
      </Host>
    );
  }
}

import {
  Component,
  Element,
  Host,
  Prop,
  h,
  Event,
  EventEmitter,
} from "@stencil/core";

@Component({
  tag: "ch-form-checkbox",
  styleUrl: "ch-form-checkbox.scss",
  shadow: true,
})
export class ChFormCheckbox {
  @Element() el: HTMLChFormCheckboxElement;

  //A reference to the input
  checkboxInput!: HTMLInputElement;

  /*********************************
    PROPERTIES & STATE
    *********************************/

  /**
   * The checkbox id
   */
  @Prop() checkboxId: string;

  /**
   * The presence of this attribute makes the checkbox checked by default
   */
  @Prop({ reflect: false }) checked = false;

  /**
   * The presence of this attribute makes the checkbox indeterminate
   */
  @Prop({ reflect: true }) indeterminate = false;

  /**
   * The presence of this attribute disables the checkbox
   */
  @Prop() disabled = false;

  /**
   * The checkbox label
   */
  @Prop() label: string;

  /**
   * The checkbox value
   */
  @Prop() value: string;

  /**
   * The checkbox name
   */
  @Prop() name: string;

  @Event() change: EventEmitter;

  /*********************************
    METHODS
    *********************************/

  compontentDidLoad() {
    if (this.checked && this.disabled) {
      this.checked = false;
      this.checkboxInput.removeAttribute("checked");
    }
  }

  changed() {
    this.checked = this.checkboxInput.checked;
    this.change.emit({
      "checkbox id": this.checkboxId,
      "checkbox value": this.checked,
    });
  }

  handlerOnKeyUp(event) {
    if (event.keyCode == 13) {
      //Enter key was pressed
      if (!this.checked) {
        this.el.setAttribute("checked", "true");
      } else {
        this.el.removeAttribute("checked");
      }
      this.change.emit({
        "checkbox id": this.checkboxId,
        "checkbox value": this.checked,
      });
    }
  }

  ariaChecked() {
    if (this.checked) {
      return "true";
    } else {
      return "false";
    }
  }

  handleInputClick(e) {
    e.stopPropagation();
  }

  render() {
    return (
      <Host
        role="checkbox"
        value={this.value}
        aria-checked={this.ariaChecked}
        aria-label={this.label}
      >
        <label class="label">
          <input
            ref={(el) => (this.checkboxInput = el as HTMLInputElement)}
            type="checkbox"
            checked={this.checked}
            class="input"
            id={this.checkboxId}
            name={this.name}
            value={this.value}
            disabled={this.disabled}
            onChange={this.changed.bind(this)}
            onKeyUp={this.handlerOnKeyUp.bind(this)}
            tabindex="0"
            onClick={this.handleInputClick}
          ></input>
          <span
            class={{ checkmark: true, "no-label": !this.label }}
            role="checkbox"
          ></span>
          {this.label ? this.label : null}
        </label>
      </Host>
    );
  }
}

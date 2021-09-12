import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";

@Component({
  tag: "ch-grid-select",
  styleUrl: "ch-grid-select.scss",
  shadow: true,
})
export class ChGridSelect {
  select!: HTMLSelectElement;

  @Element() el: HTMLChGridSelectElement;

  /*******************
  PROPS
  ********************/

  /**
   * The columnd id this select belongs to
   */
  @Prop() colId: string = "";

  /*******************
  EVENTS
  ********************/

  /**
   * Emmits select value
   */
  @Event() selectChanged: EventEmitter;

  /*******************
  FUNCTIONS/METHODS
  ********************/

  componentDidLoad() {
    let chGridSelectOptions = this.el.querySelectorAll("ch-grid-select-option");
    chGridSelectOptions.forEach((chGridOption) => {
      const option = document.createElement("option");
      option.innerText = chGridOption.innerText;
      this.select.append(option);
    });
  }

  selectChangedFunc() {
    this.selectChanged.emit({
      "column-id": this.colId,
      value: this.select.value,
    });
  }

  render() {
    return (
      <Host>
        <select
          ref={(el) => (this.select = el as HTMLSelectElement)}
          onChange={this.selectChangedFunc.bind(this)}
        >
          <slot></slot>
        </select>
      </Host>
    );
  }
}

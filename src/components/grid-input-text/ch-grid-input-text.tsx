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
  tag: "ch-grid-input-text",
  styleUrl: "ch-grid-input-text.scss",
  shadow: true,
})
export class ChGridInputText {
  @Element() el: HTMLChGridInputTextElement;

  /*******************
  PROPS
  ********************/

  /**
   * The columnd id this input belongs to
   */
  @Prop() colId: string = "";

  /**
   * The input placeholder
   */
  @Prop() placeholder: string = undefined;

  /*******************
  EVENTS
  ********************/

  /**
   * Emmits the input value
   */
  @Event() inputValueChanged: EventEmitter;

  /*******************
  FUNCTIONS/METHODS
  ********************/
  onInputFunc() {
    this.inputValueChanged.emit({
      "column-id": this.colId,
      value: this.el.shadowRoot.querySelector("input").value,
    });
  }

  render() {
    return (
      <Host>
        <input
          type="text"
          placeholder={this.placeholder}
          onInput={this.onInputFunc.bind(this)}
        ></input>
      </Host>
    );
  }
}

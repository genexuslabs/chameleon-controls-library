import {
  Component,
  Element,
  Host,
  h,
  Event,
  EventEmitter,
  Listen,
} from "@stencil/core";
import { ChCompA } from "../ch-comp-a/ch-comp-a";

@Component({
  tag: "ch-comp-c",
  styleUrl: "ch-comp-c.css",
  shadow: true,
})
export class ChCompC {
  @Element() el: HTMLChCompCElement;
  componentA: ChCompA;

  @Event() textChanged: EventEmitter;

  componentWillLoad() {
    this.componentA = this.el.assignedSlot["data-componentA"];
  }

  changeText() {
    this.textChanged.emit(this.componentA);
  }

  @Listen("compCtextChanged", { target: "document" })
  compCtextChangedHandler(ev) {
    if (this.componentA === ev.detail) {
      const text = this.el.shadowRoot.querySelector("#text");
      text.innerHTML = "some other text";
    }
  }

  render() {
    //console.log(this.componentA.getInfo());
    return (
      <Host>
        <slot></slot>
        <button onClick={this.changeText.bind(this)}>change text</button>
        <span id="text">some text</span>
      </Host>
    );
  }
}

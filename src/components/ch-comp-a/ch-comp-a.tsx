import {
  Component,
  Element,
  Host,
  h,
  Method,
  Listen,
  Event,
  EventEmitter,
} from "@stencil/core";

@Component({
  tag: "ch-comp-a",
  styleUrl: "ch-comp-a.css",
  shadow: true,
})
export class ChCompA {
  @Element() el: HTMLChCompAElement;

  @Method()
  async getInfo() {
    console.log("Method !!!");
  }

  @Event() compCtextChanged: EventEmitter;

  @Listen("textChanged")
  todoCompletedHandler(event) {
    this.compCtextChanged.emit(event.detail);
  }

  render() {
    return (
      <Host>
        <slot data-componentA={this.el}></slot>
      </Host>
    );
  }
}

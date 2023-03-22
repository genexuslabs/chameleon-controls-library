import { Component, Element, h } from "@stencil/core";

@Component({
  tag: "ch-step-list",
  styleUrl: "ch-step-list.scss",
  shadow: true
})
export class ChStepList {
  @Element() el: HTMLChStepListElement;
  ulStep!: HTMLElement;

  render() {
    return (
      <div class="step-container">
        <ul ref={el => (this.ulStep = el as HTMLElement)}>
          <slot></slot>
        </ul>
      </div>
    );
  }
}

import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-timer",
  shadow: true
})
export class ChTiner {
  /**
   * Sets the progress propiety to determine the progress.
   */
  @Prop() readonly progress: number = 0;

  /**
   * Sets the accesible name of the timer.
   */
  @Prop() readonly accessibleName: string = "timer";

  render() {
    const accessibilityAttributes = {
      role: "timer",
      "aria-atomic": "true",
      "aria-labelledby": this.accessibleName,
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": this.progress
    };

    return <Host {...accessibilityAttributes}>{this.progress}</Host>;
  }
}

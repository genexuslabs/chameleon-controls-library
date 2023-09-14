import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-timer",
  styleUrl: "timer.scss",
  shadow: true
})
export class ChTimer {
  /**
   * Sets the progress propiety to determine the progress.
   */
  @Prop() readonly progress: number = 0;

  /**
   * Sets the accesible name of the timer.
   */
  @Prop() readonly accessibleName: string = "timer";

  /**
   * Sets the animationTime to set the custom var for the css animation.
   */
  @Prop() readonly animationTime: number = 0;

  /**
   * Sets the presented property to handle the component presentation.
   */
  @Prop() readonly presented: boolean = false;

  render() {
    const accessibilityAttributes = {
      role: "timer",
      "aria-live": "true",
      "aria-labelledby": this.accessibleName,
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": this.progress
    };

    return (
      <Host>
        {this.presented && this.progress >= 0 && (
          <div
            {...accessibilityAttributes}
            part="indicator"
            class="indicator"
            style={{
              "--animation-time": `${this.animationTime}ms`
            }}
          ></div>
        )}
      </Host>
    );
  }
}

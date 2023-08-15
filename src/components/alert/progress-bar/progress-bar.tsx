import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-progress-bar",
  styleUrl: "progress-bar.scss",
  shadow: true
})
export class ChProgressBar {
  /**
   * Sets the progress propiety to determine the width of the bar (as a percentage)
   */
  @Prop() readonly progress: number = 100;

  /**
   * Sets the accesible name of the progress bar.
   */
  @Prop() readonly accessibleName: string = "progress";

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
      role: "progressbar",
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

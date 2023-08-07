import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-progress-bar",
  styleUrl: "progress-bar.scss",
  shadow: true
})
export class ChProgressBar {
  /**
   * Sets the progress propiety to determine the width of the bar.
   */
  @Prop() readonly progress: number = 0;

  /**
   * Sets the accesible name of the progress bar.
   */
  @Prop() readonly accessibleName: string = "progress";

  /**
   * Sets the animationTime to set the custom var for the css animation.
   */
  @Prop() readonly animationTime: number = 0;

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
        <div
          {...accessibilityAttributes}
          part="indicator"
          style={{
            width: `${this.progress}%`,
            "--animation-time": `${this.animationTime}ms`
          }}
        ></div>
      </Host>
    );
  }
}

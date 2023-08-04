import { Component, Host, h, Prop, Watch, Element } from "@stencil/core";

@Component({
  tag: "ch-progress-bar",
  styleUrl: "progress-bar.scss",
  shadow: true
})
export class ChProgressBar {
  @Element() element: HTMLChProgressBarElement;
  private el = null;

  /**
   * Sets the progress propiety and watches its changes to set the progress bar width.
   */
  @Prop() readonly progress: number = 0;
  @Watch("progress")
  progressWatcher(newValue) {
    this.el.style.width = newValue + "%";
  }

  componentDidLoad() {
    this.el = this.element.shadowRoot.getElementById("progress-bar");
  }

  render() {
    return (
      <Host>
        <div part="alert__progress-bar" id="progress-bar"></div>
      </Host>
    );
  }
}

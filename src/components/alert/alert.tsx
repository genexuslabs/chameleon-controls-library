import { Component, Host, h, Prop, Watch } from "@stencil/core";

@Component({
  tag: "ch-alert",
  styleUrl: "alert.scss",
  shadow: true
})
export class ChAlert {
  /** Sets the timer id and the desired interval */
  private timerId = null;
  timerInterval = 50;

  /**
   * Determine the accessible name of the close button.
   * Important for accessibility.
   */
  @Prop() readonly closeButtonAccessibleName: string = "Close";

  /**
   * Specifies the time (ms) for the alert to be displayed.
   * if `dismissTimeout = 0`, the alert will be always visible
   * (unless is dismissed by the closeButton).
   */
  @Prop() readonly dismissTimeout = 0;

  /**
   * Determine src of the left image.
   */
  @Prop() readonly leftImgSrc = "";

  /**
   * Determine if the element is displayed or not.
   */
  @Prop({ mutable: true }) presented = false;

  /**
   * Determine if the closeButton is displayed or not.
   */
  @Prop() readonly showCloseButton: boolean = false;

  /**
   * If dismissTimeout > 0, a progress bar is displayed at the bottom of the element
   * showing the time left for the alert to show.
   * The progress stops when the element is hovered.
   */
  @Prop() readonly showTimeoutBar: boolean = false;

  /** Closes the alert when the close button is clicked. */
  private handleAlertClose = () => {
    clearInterval(this.timerId);
    this.presented = false;
  };

  /** Countdown which initial state is dismissTimeout ms. */
  @Prop({ mutable: true }) countdown: number = this.dismissTimeout;

  /** Countdown watcher that hides the alert if the dismissTimeout is reached
   * and stops the countdown. */
  @Watch("countdown")
  countdownWatcher(newValue) {
    if (newValue === 0) {
      this.presented = false;
      clearInterval(this.timerId);
    }
  }

  /** Starts a new countdown which interval is set in timerInterval */
  private start = () => {
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.countdown -= this.timerInterval;
    }, this.timerInterval);
  };

  /** Pauses the countdown */
  private handleMouseEnter = () => {
    clearInterval(this.timerId);
  };

  /** Resumes the countdown */
  private handleMouseLeave = () => {
    this.start();
  };

  componentDidLoad() {
    if (this.presented && this.dismissTimeout !== 0) {
      this.start();
    }
  }

  render() {
    return (
      <Host
        role="alert"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        part="alert__container"
        aria-hidden={!this.presented ? "true" : "false"}
      >
        {this.presented && [
          this.leftImgSrc && (
            <img
              part="alert__img"
              src={this.leftImgSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          ),
          <div part="alert__content">
            <slot name="content"></slot>
          </div>,
          this.showCloseButton && (
            <button
              part="alert__close-button"
              type="button"
              class="close-button-img"
              aria-label={this.closeButtonAccessibleName}
              disabled={false}
              onClick={this.handleAlertClose}
            >
              <slot name="button" aria-hidden="true"></slot>
            </button>
          ),
          this.showTimeoutBar && (
            <ch-progress-bar
              exportparts="indicator"
              progress={(this.countdown / this.dismissTimeout) * 100}
              accessibleName="alert"
              class="progress-bar_container"
              animation-time={this.timerInterval}
            ></ch-progress-bar>
          )
        ]}
      </Host>
    );
  }
}

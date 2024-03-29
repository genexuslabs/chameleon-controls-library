import {
  Component,
  Host,
  h,
  Prop,
  Watch,
  Event,
  EventEmitter
} from "@stencil/core";

@Component({
  tag: "ch-alert",
  styleUrl: "alert.scss",
  shadow: true
})
export class ChAlert {
  /** Sets the timer id */
  private timerId = null;

  /** Sets the desired interval */
  @Prop() readonly timerInterval = 50;

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

  @Watch("dismissTimeout")
  timeoutWatcher(newValue) {
    if (newValue) {
      this.countdown = newValue;
      this.start();
    }
  }

  /**
   * Determine src of the left image.
   */
  @Prop() readonly leftImgSrc = "";

  /**
   * Determine if the element is displayed or not.
   */
  @Prop({ reflect: true, mutable: true }) presented = false;

  @Watch("presented")
  presentedWatcher(newValue) {
    if (newValue) {
      this.start();
    }
  }

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

  /** Toggles the Pause on Hover functionality */
  @Prop() readonly pauseOnHover: boolean = true;

  /** Closes the alert when the close button is clicked.
   * Also restarts the counter and sets its value to match dismissTimeout.
   */
  private handleAlertClose = () => {
    clearInterval(this.timerId);
    this.presented = false;
    this.close.emit();
    this.countdown = this.dismissTimeout;
  };

  /** Countdown which initial state is dismissTimeout ms. */
  @Prop({ mutable: true }) countdown: number = this.dismissTimeout;

  /** Countdown watcher that hides the alert if dismissTimeout is reached
   * and stops the countdown.
   * See handleAlertClose for more details. */
  @Watch("countdown")
  countdownWatcher(newValue) {
    if (newValue <= 0) {
      this.handleAlertClose();
    }
  }

  /** Fires close event */
  @Event() close: EventEmitter;

  /** Counter decremental function */
  private counter = () => {
    this.countdown -= this.timerInterval;
  };

  /** Starts a new countdown which interval is set in timerInterval,
   * Only if is presented, dismissTimeout is greater than 0,
   * and countdown is still running.
   */
  private start = () => {
    clearInterval(this.timerId);
    if (this.presented && this.dismissTimeout !== 0 && this.countdown >= 0) {
      this.timerId = setInterval(this.counter, this.timerInterval);
    }
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
    this.start();
  }

  render() {
    return (
      <Host
        role="alert"
        onMouseEnter={this.pauseOnHover && this.handleMouseEnter}
        onMouseLeave={this.pauseOnHover && this.handleMouseLeave}
        aria-hidden={!this.presented ? "true" : "false"}
        class={this.pauseOnHover && "pause-on-hover"}
      >
        {this.presented && [
          this.leftImgSrc && (
            <img
              part="image"
              class="image"
              src={this.leftImgSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          ),
          <div part="content" class="content">
            <slot name="content"></slot>
          </div>,
          this.showCloseButton && (
            <button
              part="close-button"
              class="close-button"
              type="button"
              aria-label={this.closeButtonAccessibleName}
              onClick={this.handleAlertClose}
            >
              <slot name="button" aria-hidden="true">
                <div aria-hidden="true" class="close-button-img"></div>
              </slot>
            </button>
          ),
          this.showTimeoutBar && (
            <ch-timer
              part="indicator-container"
              class="indicator-container"
              exportparts="indicator"
              progress={(this.countdown * 100) / this.dismissTimeout}
              accessibleName={`${this.countdown / 1000} seconds left`}
              animation-time={this.dismissTimeout}
              presented={this.presented}
            ></ch-timer>
          )
        ]}
      </Host>
    );
  }
}

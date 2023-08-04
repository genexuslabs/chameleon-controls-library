import { Component, Host, h, Prop, Listen, Watch, State } from "@stencil/core";

@Component({
  tag: "ch-alert",
  styleUrl: "alert.scss",
  shadow: true
})
export class ChAlert {
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

  /** Listens when the ch-window-close button is clicked and closes the alert. */
  @Listen("windowCloseClicked")
  windowCloseClickedHandler() {
    this.presented = false;
  }

  /** Sets the timer id and the desired interval */
  private timerId = null;
  private timerInterval = 10;

  /** Countdown which initial state is dismissTimeout ms. */
  @State() countdown: number = this.dismissTimeout;

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
    this.start();
  }

  render() {
    return (
      <Host>
        {this.presented && (
          <div
            class="alert"
            role="alert"
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            part="alert__container"
          >
            {this.leftImgSrc && (
              <ch-icon
                src={this.leftImgSrc}
                style={{
                  "--select-icon-size": "var(--icon-size)",
                  "--select-icon-color": `var(--icon-color)`
                }}
              ></ch-icon>
            )}
            <div part="alert__content">
              <slot name="content"></slot>
            </div>
            {this.showCloseButton && (
              <ch-window-close
                part="alert__close-button"
                title={this.closeButtonAccessibleName}
                disabled={false}
              >
                <slot name="button">×</slot>
              </ch-window-close>
            )}
            {this.showTimeoutBar && (
              <div class="progress-bar_container">
                <ch-progress-bar
                  progress={(this.countdown / this.dismissTimeout) * 100}
                  exportparts="alert__progress-bar"
                ></ch-progress-bar>
              </div>
            )}
          </div>
        )}
      </Host>
    );
  }
}

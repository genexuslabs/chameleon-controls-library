import {
  Component,
  Host,
  h,
  Prop,
  Watch,
  Event,
  EventEmitter,
  Element
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";

@Component({
  shadow: true,
  styleUrl: "notifications-item.scss",
  tag: "ch-notifications-item"
})
export class ChNotificationsItem implements ChComponent {
  /**
   * Used to not fire an extra event when the control is dismissed before the
   * dismiss timeout is called.
   */
  private timerId: NodeJS.Timeout;

  @Element() element: HTMLChNotificationsItemElement;

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

  private handleNotificationDismiss =
    (mustClearInterval = false) =>
    () => {
      if (mustClearInterval) {
        clearInterval(this.timerId);
      }
      this.notificationDismiss.emit(Number(this.element.id));
    };

  /** Handles the notification click */
  private handleNotificationClick =
    (mustClearInterval = false) =>
    () => {
      if (mustClearInterval) {
        clearInterval(this.timerId);
      }

      this.notificationClick.emit(Number(this.element.id));
    };

  /** Countdown which initial state is dismissTimeout ms. */
  @Prop({ mutable: true }) countdown: number = this.dismissTimeout;

  /** Countdown watcher that hides the alert if dismissTimeout is reached
   * and stops the countdown.
   * See handleNotificationDismiss for more details. */
  @Watch("countdown")
  countdownWatcher(newValue) {
    if (newValue <= 0) {
      this.handleNotificationDismiss(true)();
    }
  }

  /** the notificationClick event */
  @Event() notificationClick: EventEmitter<number>;

  /** the notificationDismiss event */
  @Event() notificationDismiss: EventEmitter<number>;

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
    if (this.dismissTimeout !== 0 && this.countdown >= 0) {
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
        aria-hidden="false"
        class={this.pauseOnHover && "pause-on-hover"}
        onClick={this.handleNotificationClick(true)}
      >
        {this.leftImgSrc && (
          <img
            part="image"
            class="image"
            src={this.leftImgSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        )}
        <div part="content" class="content">
          <slot name="content"></slot>
        </div>
        {this.showCloseButton && (
          <button
            part="close-button"
            class="close-button"
            type="button"
            aria-label={this.closeButtonAccessibleName}
            onClick={this.handleNotificationDismiss(true)}
          >
            <slot name="button" aria-hidden="true">
              <div aria-hidden="true" class="close-button-img"></div>
            </slot>
          </button>
        )}
        {this.showTimeoutBar && (
          <ch-timer
            part="indicator-container"
            class="indicator-container"
            exportparts="indicator"
            progress={(this.countdown * 100) / this.dismissTimeout}
            accessibleName={`${this.countdown / 1000} seconds left`}
            animation-time={this.dismissTimeout}
            presented={true}
          ></ch-timer>
        )}
      </Host>
    );
  }
}

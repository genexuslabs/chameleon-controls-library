import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  h
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
  private timeout: NodeJS.Timeout;

  @Element() element: HTMLChNotificationsItemElement;

  /**
   *
   */
  @Prop() readonly buttonImgSrc: string;

  /**
   *
   */
  @Prop() readonly closeButtonLabel: string;

  /**
   *
   */
  @Prop() readonly leftImgSrc: string;

  /**
   * `true` to show the close notification button
   */
  @Prop() readonly showCloseButton: boolean = true;

  /**
   *
   */
  @Prop() readonly timeToDismiss = 5000;

  /**
   *
   */
  @Event() notificationClick: EventEmitter<number>;

  /**
   *
   */
  @Event() notificationDismiss: EventEmitter<number>;

  private handleNotificationDismiss =
    (mustClearTimeout = false) =>
    () => {
      if (mustClearTimeout) {
        clearTimeout(this.timeout);
      }

      this.notificationDismiss.emit(Number(this.element.id));
    };

  private handleNotificationClick =
    (mustClearTimeout = false) =>
    () => {
      if (mustClearTimeout) {
        clearTimeout(this.timeout);
      }

      this.notificationClick.emit(Number(this.element.id));
    };

  componentDidLoad() {
    this.timeout = setTimeout(
      this.handleNotificationDismiss(false),
      this.timeToDismiss
    );
  }

  render() {
    return (
      <Host>
        <button
          class="main"
          part="notification-item__main"
          type="button"
          onClick={this.handleNotificationClick(true)}
        >
          {this.leftImgSrc && (
            <img
              aria-hidden="true"
              alt=""
              src={this.leftImgSrc}
              loading="lazy"
            />
          )}
          <slot></slot>
        </button>

        {this.showCloseButton && (
          <button
            aria-label={this.closeButtonLabel}
            class={!this.buttonImgSrc ? "close-image" : undefined}
            part="notification-item__close-button"
            type="button"
            onClick={this.handleNotificationDismiss(true)}
          >
            {this.buttonImgSrc && (
              <img
                aria-hidden="true"
                alt=""
                src={this.buttonImgSrc}
                loading="lazy"
              />
            )}
          </button>
        )}
      </Host>
    );
  }
}

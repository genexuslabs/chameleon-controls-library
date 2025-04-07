import { Component, Host, Listen, Prop, Watch, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import {
  NotificationMessageWithDelay,
  NotificationsPositions,
  NotificationsAlign
} from "./notifications-types";
import { ChWindowAlign } from "../window/ch-window";

const mapNotificationsAlignToChWindowAlign: {
  [key in NotificationsAlign]: ChWindowAlign;
} = {
  OutsideStart: "outside-start",
  Center: "center",
  OutsideEnd: "outside-end"
};

@Component({
  shadow: false,
  styleUrl: "notifications.scss",
  tag: "ch-notifications"
})
export class ChNotifications implements ChComponent {
  /**
   * `true` if the componentDidLoad lifecycle method was executed
   */
  private didLoad = false;

  /**
   * Saves the last notification ID
   */
  private lastNotificationID = 0;

  /**
   * Notifications to be shown by the component loop
   */
  private currentNotifications = new Map<
    number,
    NotificationMessageWithDelay
  >();

  /**
   * The notifications length
   */
  @State() notificationsSize = 0;

  /**
   * Delay to animate new notifications
   */
  @Prop() readonly delayToAnimateNewNotifications: number = 50;

  /**
   * The notifications prop
   */
  @Prop() readonly notifications: NotificationMessageWithDelay[] = [];

  /**
  /**
   * Specifies the position of the whole notifications section 
   * that is placed relative to the window.
   */
  @Prop() readonly position: NotificationsPositions = "Center_OutsideEnd";

  /**
   * The default dismiss timeout as group
   * if not set for each notification individually
   */
  @Prop() readonly timeToDismissNotifications: number = 5000;

  /**
   * Time type only applies for timeToDismissNotifications,
   * not for individual dismissTimeout
   */
  @Prop() readonly timeType: "Seconds" | "Milliseconds" = "Milliseconds";

  @Watch("notifications")
  handleNewNotificationsChange(
    newNotifications: NotificationMessageWithDelay[]
  ) {
    // Sometimes StencilJS calls this decorator before the component did load
    if (this.didLoad) {
      this.addNewNotifications(newNotifications);
    }
  }

  @Listen("notificationClick")
  handleNotificationClick(event: CustomEvent<number>) {
    const notification = this.currentNotifications.get(event.detail);

    if (!notification) {
      return;
    }

    if (notification.closeOnClick) {
      this.currentNotifications.delete(event.detail);

      // Trigger render
      this.notificationsSize--;
    }
  }

  @Listen("notificationDismiss")
  handleNotificationDismiss(event: CustomEvent<number>) {
    this.currentNotifications.delete(event.detail);
    // Trigger render
    this.notificationsSize--;
  }

  private addNewNotifications(notifications: NotificationMessageWithDelay[]) {
    if (!notifications) {
      return;
    }

    let delayToAnimate = 0;

    notifications.forEach(notification => {
      const notificationID = notification.Id ?? this.lastNotificationID;

      // If the notification did not have an ID, increment the counter
      if (!notification.Id) {
        this.lastNotificationID++;
      }

      notification.Id = notificationID;
      notification.delayToAnimate = delayToAnimate;
      this.currentNotifications.set(notificationID, notification);
      delayToAnimate++;
    });
  }

  private getMessages = () => [...this.currentNotifications.values()];

  private getTimeToDismiss = () =>
    this.timeType === "Seconds"
      ? this.timeToDismissNotifications * 1000
      : this.timeToDismissNotifications;

  componentWillLoad() {
    this.addNewNotifications(this.notifications);
  }

  componentDidLoad() {
    this.didLoad = true;
  }

  render() {
    const messages = this.getMessages();

    const aligns = this.position.split("_");
    const alignX = aligns[0] as NotificationsAlign;
    const alignY = aligns[1] as NotificationsAlign;

    return (
      <Host
        tabindex={messages.length > 0 ? "0" : undefined}
        role="alert"
        aria-atomic="true"
        x-align={mapNotificationsAlignToChWindowAlign[alignX]}
        y-align={mapNotificationsAlignToChWindowAlign[alignY]}
      >
        {messages.map(
          ({
            Id,
            Value,
            Class,
            delayToAnimate,
            timerInterval,
            dismissTimeout
          }) => (
            <ch-notifications-item
              id={Id.toString()}
              key={Id}
              class={Class}
              timer-interval={timerInterval}
              style={{
                "--delay-to-animate": `${
                  delayToAnimate * this.delayToAnimateNewNotifications
                }ms`
              }}
              dismiss-timeout={
                !dismissTimeout
                  ? this.getTimeToDismiss() +
                    delayToAnimate * this.delayToAnimateNewNotifications
                  : dismissTimeout
              }
              show-close-button={true}
              show-timeout-bar={true}
              pause-on-hover={true}
            >
              <div slot="content">{Value}</div>
            </ch-notifications-item>
          )
        )}
      </Host>
    );
  }
}

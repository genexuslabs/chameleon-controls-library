import { Component, Host, Listen, Prop, Watch, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { NotificationMessageWithDelay } from "./notifications-types";

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

  private lastNotificationID = 0;

  private currentNotifications = new Map<
    number,
    NotificationMessageWithDelay
  >();

  @State() notificationsSize = 0;

  /**
   *
   */
  @Prop() readonly delayToAnimateNewNotifications: number = 50;

  /**
   *
   */
  @Prop() readonly notifications: NotificationMessageWithDelay[] = [];

  /**
   *
   */
  @Prop() readonly position: "bottom-start" | "bottom-end" = "bottom-end";

  /**
   *
   */
  @Prop() readonly timeToDismissNotifications: number = 5000;

  /**
   *
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

    return (
      <Host
        tabindex={messages.length > 0 ? "0" : undefined}
        role="alert"
        aria-atomic="true"
        class={`ch-notifications-position--${this.position}`}
      >
        {messages.map(({ Id, Value, Class, delayToAnimate }) => (
          <ch-notifications-item
            id={Id.toString()}
            key={Id}
            class={Class}
            style={{
              "--delay-to-animate": `${
                delayToAnimate * this.delayToAnimateNewNotifications
              }ms`
            }}
            time-to-dismiss={
              this.getTimeToDismiss() +
              delayToAnimate * this.delayToAnimateNewNotifications
            }
            innerHTML={Value}
          ></ch-notifications-item>
        ))}
      </Host>
    );
  }
}

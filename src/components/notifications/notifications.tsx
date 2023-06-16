import { Component, Host, Listen, Prop, Watch, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { NOTIFICATION_ITEM_PARTS } from "../notifications-item/part-names";
import { NotificationMessageWithDelay } from "./notifications-types";

@Component({
  shadow: true,
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
   * A CSS class to set as the `ch-next-progress-bar` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   *
   */
  @Prop() readonly delayToAnimateNewNotifications: number = 50;

  /**
   *
   */
  @Prop() readonly notifications: string;

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
  @Prop() readonly timeType: "seconds" | "milliseconds" = "milliseconds";

  @Watch("notifications")
  handleNewNotificationsChange(newNotifications: string) {
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

  private addNewNotifications(newNotificationsJSON: string) {
    const notifications: NotificationMessageWithDelay[] =
      JSON.parse(newNotificationsJSON);

    if (notifications.length === 0) {
      return;
    }

    let delayToAnimate = 0;

    console.log("notifications", notifications);

    notifications.forEach(notification => {
      const notificationID = notification.id ?? this.lastNotificationID;

      // If the notification did not have an ID, increment the counter
      if (!notification.id) {
        this.lastNotificationID++;
      }

      notification["id"] = notificationID;
      notification["delayToAnimate"] = delayToAnimate;
      this.currentNotifications.set(notificationID, notification);

      console.log("notificationID", notificationID, notification);

      delayToAnimate++;
    });
  }

  private getMessages = () => [...this.currentNotifications.values()];

  private getTimeToDismiss = () =>
    this.timeType === "seconds"
      ? this.timeToDismissNotifications * 1000
      : this.timeToDismissNotifications;

  /**
   * If the notification item has a defined type, it renames the exported parts
   * to suffix the exported parts with the `notificationType`
   */
  private getExportParts(notificationType: string) {
    if (!notificationType) {
      return (
        NOTIFICATION_ITEM_PARTS.MAIN +
        "," +
        NOTIFICATION_ITEM_PARTS.CLOSE_BUTTON
      );
    }

    const partMain = `${NOTIFICATION_ITEM_PARTS.MAIN}:${NOTIFICATION_ITEM_PARTS.MAIN}--${notificationType}`;
    const partCloseButton = `${NOTIFICATION_ITEM_PARTS.CLOSE_BUTTON}:${NOTIFICATION_ITEM_PARTS.CLOSE_BUTTON}--${notificationType}`;

    return partMain + "," + partCloseButton;
  }

  componentWillLoad() {
    this.addNewNotifications(this.notifications);
  }

  componentDidLoad() {
    this.didLoad = true;
  }

  render() {
    const messages = this.getMessages();

    console.log("messages", messages);

    return (
      <Host
        tabindex={messages.length > 0 ? "0" : undefined}
        role="alert"
        aria-atomic="true"
        class={`ch-notifications-position--${this.position}`}
      >
        {messages.map(({ id, value, delayToAnimate, notificationType }) => (
          <ch-notifications-item
            id={id.toString()}
            key={id}
            exportparts={this.getExportParts(notificationType)}
            part={`notification-item ${notificationType}`}
            style={{
              "--delay-to-animate": `${
                delayToAnimate * this.delayToAnimateNewNotifications
              }ms`
            }}
            time-to-dismiss={
              this.getTimeToDismiss() +
              delayToAnimate * this.delayToAnimateNewNotifications
            }
          >
            {value}
          </ch-notifications-item>
        ))}
      </Host>
    );
  }
}

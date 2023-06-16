export type NotificationMessage = {
  id?: number;
  value: string;
  closeOnClick?: boolean;
  notificationType: string;
};

export type NotificationMessageWithDelay = NotificationMessage & {
  /**
   * Determine the animation delay that the new notifications will have when
   * rendered for the first time.
   */
  delayToAnimate: number;
};

export type NotificationMessage = {
  Id?: number;
  Value: string;
  Class: string;
  closeOnClick?: boolean;
};

export type NotificationMessageWithDelay = NotificationMessage & {
  /**
   * Determine the animation delay that the new notifications will have when
   * rendered for the first time.
   */
  delayToAnimate: number;
};

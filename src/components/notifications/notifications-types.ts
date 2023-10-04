export type NotificationMessage = {
  Id?: number;
  Value: string;
  Class: string;
  closeOnClick?: boolean;
  timerInterval?: number;
  delayToAnimate?: number;
  closeButtonAccessibleName?: string;
  dismissTimeout?: number;
  leftImgSrc?: string;
  showCloseButton?: boolean;
  showTimeoutBar?: boolean;
  pauseOnHover?: boolean;
};

export type NotificationMessageWithDelay = NotificationMessage & {
  /**
   * Determine the animation delay that the new notifications will have when
   * rendered for the first time.
   */
  delayToAnimate: number;
};

import { DEV_MODE } from "../development-flags";

export const isRTL = () => document.documentElement.dir === "rtl";

let RTLWatcher: MutationObserver | undefined; // Don't allocate memory until needed
let RTLSubscribers: Map<string, (rtl: boolean) => void> | undefined; // Don't allocate memory until needed

const setRTLWatcher = () => {
  if (RTLWatcher) {
    return;
  }

  RTLWatcher = new MutationObserver(() => {
    // Defensive programming. Check if there are subscribers
    if (!RTLSubscribers || RTLSubscribers.size === 0) {
      return;
    }

    const rtlDirection = isRTL();
    const subscribers = [...RTLSubscribers.values()];

    // Notify all subscribers
    for (let index = 0; index < subscribers.length; index++) {
      const subscriberCallback = subscribers[index];
      subscriberCallback(rtlDirection);
    }
  });

  // Observe the dir attribute in the document
  RTLWatcher.observe(document.documentElement, {
    attributeFilter: ["dir"]
  });
};

export const subscribeToRTLChanges = (
  subscriberId: string,
  callback: (rtl: boolean) => void
) => {
  setRTLWatcher();

  RTLSubscribers ??= new Map();
  RTLSubscribers.set(subscriberId, callback);
};

export const unsubscribeToRTLChanges = (subscriberId: string) => {
  if (!RTLSubscribers) {
    if (DEV_MODE) {
      console.warn(
        "unsubscribeToRTLChanges was called without any subscriber set."
      );
    }

    return;
  }

  RTLSubscribers.delete(subscriberId);

  // Free the memory if no subscribers remaining
  if (RTLSubscribers.size === 0) {
    RTLWatcher?.disconnect();
    RTLWatcher = undefined;
    RTLSubscribers = undefined;
  }
};

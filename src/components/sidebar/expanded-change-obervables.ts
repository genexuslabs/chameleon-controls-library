export type SubscriberInfo = {
  getSubscriberRef: () => HTMLElement;
  observerCallback: ObserverCallback;
};

export type ObserverCallback = (expanded: boolean) => void;

const DEFAULT_EXPAND_VALUE = true;

let observables: Map<string, boolean> | undefined; // Don't allocate memory until needed
let subscribers: Map<string, SubscriberInfo> | undefined; // Don't allocate memory until needed

export const addObservable = (observableId: string, expanded: boolean) => {
  observables ??= new Map();
  observables.set(observableId, expanded);
};

export const removeObservable = (observableId: string) => {
  observables.delete(observableId);
};

export const syncStateWithObservableAncestors = (subscriberId: string) => {
  // There is not any observable
  if (!observables) {
    return;
  }

  const subscriberInfo = subscribers.get(subscriberId);

  if (!subscriberInfo) {
    return;
  }

  let parentElement: Element = subscriberInfo.getSubscriberRef();

  // Travel all ancestors searching if there is an observable element
  while (
    parentElement !== document.body &&
    !observables.has(parentElement.id)
  ) {
    let nextParentElement: Element = parentElement.parentElement;

    // Check if the next parent element is a ShadowRoot
    if (
      nextParentElement === null &&
      parentElement.parentNode instanceof ShadowRoot
    ) {
      nextParentElement = parentElement.parentNode.host;
    }

    parentElement = nextParentElement;
  }

  // Expanded by default
  subscriberInfo.observerCallback(
    observables.get(parentElement.id) ?? DEFAULT_EXPAND_VALUE
  );
};

export const observableIsAncestor = (
  observableId: string,
  subscriberRef: HTMLElement
): boolean => {
  let parentElement: Element = subscriberRef;

  // Travel all ancestors searching if there is a element with the observableId
  while (parentElement !== document.body && parentElement.id !== observableId) {
    let nextParentElement: Element = parentElement.parentElement;

    // Check if the next parent element is a ShadowRoot
    if (
      nextParentElement === null &&
      parentElement.parentNode instanceof ShadowRoot
    ) {
      nextParentElement = parentElement.parentNode.host;
    }

    parentElement = nextParentElement;
  }

  return parentElement !== document.body;
};

export const subscribe = (
  subscriberId: string,
  subscriberInfo: SubscriberInfo
) => {
  subscribers ??= new Map();
  subscribers.set(subscriberId, subscriberInfo);
};

export const removeSubscription = (subscriberId: string) => {
  subscribers.delete(subscriberId);
};

export const notifySubscribers = (observableId: string, expanded: boolean) => {
  observables ??= new Map();

  // Update the state in the "observables" Set
  observables.set(observableId, expanded);

  if (!subscribers) {
    return;
  }

  // Notify all subscribers
  subscribers.forEach(subscriberInfo => {
    const subscriberRef = subscriberInfo.getSubscriberRef();

    if (observableIsAncestor(observableId, subscriberRef)) {
      subscriberInfo.observerCallback(expanded);
    }
  });
};

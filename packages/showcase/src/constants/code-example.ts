export const CODE_EXAMPLE = `import type { LitElement } from "lit";
import { DEV_MODE } from "../../development-flags";

/**
 * Symbol to store event emitter instances
 */
const EVENT_EMITTERS = Symbol("event-emitters");

export function Event<T = any>(generalOptions?: EventInit) {
  return function <ElementClass extends LitElement>(
    target: ElementClass,
    eventName: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    // If the user passes a description, it is a method which it is not allowed
    if (DEV_MODE && descriptor) {
      throw new Error("@Event can only be applied to properties, not methods");
    }

    // Define the getter for the eventName
    Object.defineProperty(target, eventName, {
      get: function (this: ElementClass) {
        this[EVENT_EMITTERS] ??= new Map(); // Lazy initialization of EventEmitter for the class

        const emitters = this[EVENT_EMITTERS] as Map<string | symbol, EventEmitter<T>>;

        if (!emitters.has(eventName)) {
          const emitter = new EventEmitter<T>(
            this,
            String(eventName),
            generalOptions
          );
          emitters.set(eventName, emitter);
        }

        return emitters.get(eventName)!;
      },
      enumerable: true,
      configurable: true
    });
  };
}`;

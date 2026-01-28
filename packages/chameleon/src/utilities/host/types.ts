/* eslint-disable @typescript-eslint/no-explicit-any */
export type HostProperties = Exclude<keyof HTMLElement, "class" | "style">;

export interface HostAttributes {
  class?: HostAttributeClass;
  style?: HostAttributeStyles;
  events?: HostAttributeEvents;
  properties?: HostAttributeProperties;
}

export type HostAttributeClass =
  | string
  | {
      [className: string]: boolean | null | undefined;
    }
  | undefined;

export type HostAttributeStyles =
  | {
      [key: string]: HostAttributeStylesValue;
    }
  | undefined;

export type HostAttributeStylesValue = string | undefined;

export type HostAttributeEvents =
  | { [name: string]: HostAttributeEventsValue | boolean | undefined | null }
  | undefined;

export type HostAttributeEventsValue = (...args: any[]) => void;

export type HostAttributeProperties =
  | { [name in HostProperties]?: HostAttributePropertiesValue }
  | undefined;

export type HostAttributePropertiesValue = any;

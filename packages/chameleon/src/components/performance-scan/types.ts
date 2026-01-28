import type { LitElement } from "lit";

export type PerformanceScanItem = {
  anchorRef: LitElement;
  anchorTagName: string;
  constructorName: string;
  changes: {
    property: PropertyKey;
    oldValue: unknown;
    newValue: unknown;
    changed: boolean;
  }[];
  timeStamp: Date;
};

export type PerformanceScanRenderedItems = Map<
  LitElement,
  {
    id: number;
    renderCount: number;
    model: PerformanceScanItem;
    removeTimeout?: NodeJS.Timeout;
  }
>;

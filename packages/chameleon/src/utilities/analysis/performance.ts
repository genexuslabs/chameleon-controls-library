import { LitElement, type PropertyValues } from "lit";
import type {
  PerformanceScanItem,
  PerformanceScanRenderedItems
} from "../../components/performance-scan/types";

let autoId = 0;
const renderedItems: PerformanceScanRenderedItems = new Map();

const REMOVE_OVERLAY_TIMEOUT = 600; // 600ms
export const PERFORMANCE_SCAN_RE_RENDER_EVENT_NAME =
  "ch-performance-scan__lit-rerender";

const updateRenderedItems = (model: PerformanceScanItem, elem: LitElement) => {
  // Skip overlay on the performance scan components
  if (
    model.anchorTagName === "ch-performance-scan" ||
    model.anchorTagName === "ch-performance-scan-item" ||
    model.anchorTagName === "ch-performance-scan-fps"
  ) {
    return;
  }

  let item = renderedItems.get(elem);

  // Create the item the first time
  if (!item) {
    item = {
      id: autoId++,
      renderCount: 0,
      model
    };
    // For some reason, we have to do this. Otherwise, the reference is
    // undefined
    item.model.anchorRef = elem;

    renderedItems.set(elem, item);
  }

  item.renderCount++;

  // Reset the timeout to remove the overlay
  if (item.removeTimeout) {
    clearTimeout(item.removeTimeout);
  }

  item.removeTimeout = setTimeout(() => {
    renderedItems.delete(elem);
    document.dispatchEvent(
      new CustomEvent(PERFORMANCE_SCAN_RE_RENDER_EVENT_NAME)
    );
  }, REMOVE_OVERLAY_TIMEOUT);

  document.dispatchEvent(
    new CustomEvent(PERFORMANCE_SCAN_RE_RENDER_EVENT_NAME)
  );
};

/**
 * Applies a monkey patch to log re-renders on Lit components.
 */
export function patchLitRenders(): PerformanceScanRenderedItems {
  // Avoid multiple monkey patches
  if (globalThis.chameleonControlsLibrary?.reports?.performance) {
    return renderedItems;
  }

  globalThis.chameleonControlsLibrary ??= {
    reports: { accessibility: false, performance: true }
  };
  globalThis.chameleonControlsLibrary.reports ??= {
    accessibility: false,
    performance: true
  };
  globalThis.chameleonControlsLibrary.reports.performance = true;

  // @ts-expect-error - update is a protected property
  const originalUpdate = LitElement.prototype.update;

  // @ts-expect-error - update is a protected property
  LitElement.prototype.update = function (
    this: LitElement,
    changedProperties: PropertyValues
  ) {
    const componentName = this.constructor.name;
    const changes: PerformanceScanItem["changes"] = [];

    for (const [name, oldValue] of changedProperties) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newValue = (this as any)[name];
      changes.push({
        property: name,
        oldValue: oldValue,
        newValue: newValue,
        changed: oldValue !== newValue
      });
    }

    updateRenderedItems(
      {
        anchorRef: this,
        constructorName: componentName,
        anchorTagName: this.tagName.toLowerCase(),
        changes: changes,
        timeStamp: new Date()
      },
      this
    );

    return originalUpdate.call(this, changedProperties);
  };

  return renderedItems;
}

import { DEV_MODE, IS_SERVER } from "../../development-flags";

export const defineChameleonReportsIfNecessary = /* @__PURE__ */ () => {
  if (DEV_MODE && !IS_SERVER) {
    globalThis.chameleonControlsLibrary ??= {
      reports: { accessibility: true }
    };
    globalThis.chameleonControlsLibrary.reports ??= { accessibility: true };
  }
};

// Side effect
if (DEV_MODE && !IS_SERVER) {
  defineChameleonReportsIfNecessary();
}

export const enableAccessibilityReports = /* @__PURE__ */ () => {
  if (DEV_MODE && !IS_SERVER) {
    globalThis.chameleonControlsLibrary!.reports!.accessibility = true;
  }
};

export const disableAccessibilityReports = /* @__PURE__ */ () => {
  if (DEV_MODE && !IS_SERVER) {
    globalThis.chameleonControlsLibrary!.reports!.accessibility = false;
  }
};

/**
 * `true` if the accessibility reports are enabled.
 */
export const checkAccessibilityReports = /* @__PURE__ */ () =>
  // Don't use a const variable to cache this lookup, because in some
  // frameworks this JS file is duplicated, and with the local variable the
  // state won't be shared across the components and the host framework.
  DEV_MODE &&
  !IS_SERVER &&
  globalThis.chameleonControlsLibrary!.reports!.accessibility;

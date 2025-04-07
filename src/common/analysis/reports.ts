export const defineChameleonReportsIfNecessary = () => {
  if (typeof window !== "undefined") {
    window.chameleonControlsLibrary ??= { reports: { accessibility: true } };
    window.chameleonControlsLibrary.reports ??= { accessibility: true };
  }
};

// Side effect
defineChameleonReportsIfNecessary();

export const enableAccessibilityReports = () => {
  window.chameleonControlsLibrary!.reports!.accessibility = true;
};

export const disableAccessibilityReports = () => {
  window.chameleonControlsLibrary!.reports!.accessibility = false;
};

/**
 * `true` if the accessibility reports are enabled.
 */
export const checkAccessibilityReports = () =>
  // Don't use a const variable to cache this lookup, because in some
  // frameworks this JS file is duplicated, and with the local variable the
  // state won't be shared across the components and the host framework.
  window.chameleonControlsLibrary!.reports!.accessibility;

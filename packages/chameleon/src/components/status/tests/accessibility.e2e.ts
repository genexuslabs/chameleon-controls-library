import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../status.lit";
import type { ChStatus } from "../status.lit";

describe("[ch-status][accessibility]", () => {
  let statusRef: ChStatus;

  beforeEach(async () => {
    render(html`<ch-status></ch-status>`);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;
  });

  afterEach(cleanup);

  it("should set role to 'status'", () => {
    expect(statusRef.getAttribute("role")).toBe("status");
  });

  it("should set aria-live to 'polite'", () => {
    expect(statusRef.getAttribute("aria-live")).toBe("polite");
  });

  it("should set aria-label when accessibleName is provided", async () => {
    cleanup();
    render(
      html`<ch-status accessible-name="Loading content"></ch-status>`
    );
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;

    expect(statusRef.ariaLabel).toBe("Loading content");
  });

  it("should not set aria-label when accessibleName is undefined", () => {
    // aria-label should be null when no accessibleName is set
    expect(statusRef.ariaLabel).toBeNull();
  });

  it("should update aria-label when accessibleName changes", async () => {
    statusRef.accessibleName = "Saving...";
    await statusRef.updateComplete;
    expect(statusRef.ariaLabel).toBe("Saving...");

    statusRef.accessibleName = "Processing...";
    await statusRef.updateComplete;
    expect(statusRef.ariaLabel).toBe("Processing...");
  });

  it("should clear aria-label when accessibleName is set to undefined", async () => {
    statusRef.accessibleName = "Loading";
    await statusRef.updateComplete;
    expect(statusRef.ariaLabel).toBe("Loading");

    statusRef.accessibleName = undefined;
    await statusRef.updateComplete;
    expect(statusRef.ariaLabel).toBeNull();
  });
});

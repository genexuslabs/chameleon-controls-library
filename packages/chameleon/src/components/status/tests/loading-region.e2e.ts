import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../status.lit";
import type { ChStatus } from "../status.lit";

describe("[ch-status][loading-region]", () => {
  let statusRef: ChStatus;
  let regionRef: HTMLDivElement;

  beforeEach(async () => {
    render(html`
      <div>
        <div id="loading-region">Content being loaded</div>
        <ch-status></ch-status>
      </div>
    `);
    statusRef = document.querySelector("ch-status")!;
    regionRef = document.querySelector("#loading-region")! as HTMLDivElement;
    await statusRef.updateComplete;
  });

  afterEach(cleanup);

  // --- Setting loadingRegionRef ---

  it("should set aria-busy='true' on the region when loadingRegionRef is set", async () => {
    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    expect(regionRef.getAttribute("aria-busy")).toBe("true");
  });

  it("should set aria-describedby on the region when loadingRegionRef is set", async () => {
    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    expect(regionRef.getAttribute("aria-describedby")).toBe(statusRef.id);
  });

  it("should use the existing element ID for aria-describedby", async () => {
    cleanup();
    render(html`
      <div>
        <div id="region">Content</div>
        <ch-status id="my-status"></ch-status>
      </div>
    `);
    statusRef = document.querySelector("ch-status")!;
    regionRef = document.querySelector("#region")! as HTMLDivElement;
    await statusRef.updateComplete;

    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    expect(regionRef.getAttribute("aria-describedby")).toBe("my-status");
  });

  it("should use the auto-generated ID when no custom ID is set", async () => {
    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    const describedBy = regionRef.getAttribute("aria-describedby")!;
    expect(describedBy).toMatch(/^ch-status-\d+$/);
    expect(describedBy).toBe(statusRef.id);
  });

  // --- Changing loadingRegionRef ---

  it("should clean up old region and set up new region when loadingRegionRef changes", async () => {
    const newRegion = document.createElement("div");
    newRegion.id = "new-region";
    document.body.appendChild(newRegion);

    // Set the initial region
    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    expect(regionRef.getAttribute("aria-busy")).toBe("true");
    expect(regionRef.hasAttribute("aria-describedby")).toBe(true);

    // Change to a new region
    statusRef.loadingRegionRef = newRegion;
    await statusRef.updateComplete;

    // Old region should be cleaned up
    expect(regionRef.hasAttribute("aria-busy")).toBe(false);
    expect(regionRef.hasAttribute("aria-describedby")).toBe(false);

    // New region should be set up
    expect(newRegion.getAttribute("aria-busy")).toBe("true");
    expect(newRegion.getAttribute("aria-describedby")).toBe(statusRef.id);

    newRegion.remove();
  });

  it("should clean up region when loadingRegionRef is set to undefined", async () => {
    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    expect(regionRef.getAttribute("aria-busy")).toBe("true");

    statusRef.loadingRegionRef = undefined;
    await statusRef.updateComplete;

    expect(regionRef.hasAttribute("aria-busy")).toBe(false);
    expect(regionRef.hasAttribute("aria-describedby")).toBe(false);
  });

  // --- Disconnect behavior ---

  it("should clean up aria attributes on the region when the status element is removed from the DOM", async () => {
    statusRef.loadingRegionRef = regionRef;
    await statusRef.updateComplete;

    expect(regionRef.getAttribute("aria-busy")).toBe("true");
    expect(regionRef.hasAttribute("aria-describedby")).toBe(true);

    // Remove the status element from the DOM
    statusRef.remove();

    expect(regionRef.hasAttribute("aria-busy")).toBe(false);
    expect(regionRef.hasAttribute("aria-describedby")).toBe(false);
  });

  // --- No loadingRegionRef ---

  it("should not set aria attributes when loadingRegionRef is not set", async () => {
    // statusRef has no loadingRegionRef set
    expect(regionRef.hasAttribute("aria-busy")).toBe(false);
    expect(regionRef.hasAttribute("aria-describedby")).toBe(false);
  });

  // --- @Observe fires before first render ---

  it("should set aria attributes on the region if loadingRegionRef is set before the component renders", async () => {
    cleanup();
    render(html`
      <div>
        <div id="pre-region">Preloaded region</div>
      </div>
    `);
    const preRegion = document.querySelector(
      "#pre-region"
    )! as HTMLDivElement;

    // Create the status element imperatively with loadingRegionRef set before
    // it connects to the DOM
    const status = document.createElement("ch-status") as ChStatus;
    status.loadingRegionRef = preRegion;
    document.body.appendChild(status);
    await status.updateComplete;

    expect(preRegion.getAttribute("aria-busy")).toBe("true");
    expect(preRegion.hasAttribute("aria-describedby")).toBe(true);

    status.remove();
  });
});

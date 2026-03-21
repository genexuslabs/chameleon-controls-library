import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../status.lit";
import type { ChStatus } from "../status.lit";

describe("[ch-status][basic]", () => {
  let statusRef: ChStatus;

  beforeEach(async () => {
    render(html`<ch-status></ch-status>`);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;
  });

  afterEach(cleanup);

  it("should have Shadow DOM", () => {
    expect(statusRef.shadowRoot).toBeTruthy();
  });

  it("should render a slot in the shadow root", () => {
    const slot = statusRef.shadowRoot!.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  it("should have 'accessibleName' property undefined by default", () => {
    expect(statusRef.accessibleName).toBeUndefined();
  });

  it("should have 'loadingRegionRef' property undefined by default", () => {
    expect(statusRef.loadingRegionRef).toBeUndefined();
  });

  it("should project slotted content", async () => {
    cleanup();
    render(html`<ch-status><span class="spinner">Loading...</span></ch-status>`);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;

    const slot = statusRef.shadowRoot!.querySelector("slot") as HTMLSlotElement;
    const assignedNodes = slot.assignedNodes({ flatten: true });
    expect(assignedNodes.length).toBeGreaterThan(0);
  });

  it("should generate a unique ID if none is set", () => {
    expect(statusRef.id).toMatch(/^ch-status-\d+$/);
  });

  it("should preserve an existing ID if one was already set", async () => {
    cleanup();
    render(html`<ch-status id="my-custom-id"></ch-status>`);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;

    expect(statusRef.id).toBe("my-custom-id");
  });
});

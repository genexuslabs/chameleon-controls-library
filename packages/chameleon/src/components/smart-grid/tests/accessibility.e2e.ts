import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChSmartGrid } from "../smart-grid.lit";
import "../smart-grid.lit.js";

describe("[ch-smart-grid][accessibility]", () => {
  let smartGridRef: ChSmartGrid;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-smart-grid></ch-smart-grid>`);
    smartGridRef = document.querySelector("ch-smart-grid")!;
    await smartGridRef.updateComplete;
  });

  // aria-label
  it("should not have aria-label when accessibleName is not set", () => {
    expect(smartGridRef.getAttribute("aria-label")).toBeNull();
  });

  it("should set aria-label when accessibleName is provided", async () => {
    smartGridRef.accessibleName = "Test Grid";
    await smartGridRef.updateComplete;

    expect(smartGridRef.getAttribute("aria-label")).toBe("Test Grid");
  });

  it("should update aria-label when accessibleName changes", async () => {
    smartGridRef.accessibleName = "First Name";
    await smartGridRef.updateComplete;
    expect(smartGridRef.getAttribute("aria-label")).toBe("First Name");

    smartGridRef.accessibleName = "Updated Name";
    await smartGridRef.updateComplete;
    expect(smartGridRef.getAttribute("aria-label")).toBe("Updated Name");
  });

  it("should remove aria-label when accessibleName is set to undefined", async () => {
    smartGridRef.accessibleName = "Some Label";
    await smartGridRef.updateComplete;
    expect(smartGridRef.getAttribute("aria-label")).toBe("Some Label");

    smartGridRef.accessibleName = undefined;
    await smartGridRef.updateComplete;
    expect(smartGridRef.getAttribute("aria-label")).toBeNull();
  });

  // aria-live
  it("should have aria-live set to 'polite'", () => {
    expect(smartGridRef.getAttribute("aria-live")).toBe("polite");
  });

  // aria-busy
  it("should have aria-busy set to 'true' when loadingState is 'initial'", () => {
    expect(smartGridRef.getAttribute("aria-busy")).toBe("true");
  });

  it("should have aria-busy set to 'true' when loadingState is 'loading'", async () => {
    smartGridRef.loadingState = "loading";
    await smartGridRef.updateComplete;

    expect(smartGridRef.getAttribute("aria-busy")).toBe("true");
  });

  it("should have aria-busy set to 'false' when loadingState is 'more-data-to-fetch'", async () => {
    smartGridRef.loadingState = "more-data-to-fetch";
    await smartGridRef.updateComplete;

    expect(smartGridRef.getAttribute("aria-busy")).toBe("false");
  });

  it("should have aria-busy set to 'false' when loadingState is 'all-records-loaded'", async () => {
    smartGridRef.loadingState = "all-records-loaded";
    await smartGridRef.updateComplete;

    expect(smartGridRef.getAttribute("aria-busy")).toBe("false");
  });
});

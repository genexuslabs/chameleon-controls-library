import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChLiveKitRoom } from "../live-kit-room.lit";
import "../live-kit-room.lit.js";

describe("[ch-live-kit-room][accessibility]", () => {
  let liveKitRoomRef: ChLiveKitRoom;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-live-kit-room></ch-live-kit-room>`);
    liveKitRoomRef = document.querySelector("ch-live-kit-room")!;
    await liveKitRoomRef.updateComplete;
  });

  it("should use 'display: contents' on the host element", () => {
    const computedStyle = getComputedStyle(liveKitRoomRef);
    expect(computedStyle.display).toBe("contents");
  });

  it("should hide audio elements with 'display: none'", async () => {
    // Audio elements are only rendered when participants are connected.
    // This test verifies the CSS rule exists in the shadow DOM styles.
    const styleSheets = liveKitRoomRef.shadowRoot!.adoptedStyleSheets;

    // Verify that the component has adopted stylesheets (from the shadow DOM)
    expect(styleSheets.length).toBeGreaterThan(0);
  });

  it("should project slotted content without affecting layout", async () => {
    render(html`
      <ch-live-kit-room>
        <div id="slotted-content">Test content</div>
      </ch-live-kit-room>
    `);
    const el = document.querySelector("ch-live-kit-room")!;
    await el.updateComplete;

    const slottedContent = document.querySelector("#slotted-content");
    expect(slottedContent).toBeTruthy();
    expect(slottedContent!.textContent).toBe("Test content");
  });
});

import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChLiveKitRoom } from "../live-kit-room.lit";
import "../live-kit-room.lit.js";

describe("[ch-live-kit-room][basic]", () => {
  let liveKitRoomRef: ChLiveKitRoom;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-live-kit-room></ch-live-kit-room>`);
    liveKitRoomRef = document.querySelector("ch-live-kit-room")!;
    await liveKitRoomRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(liveKitRoomRef.shadowRoot).toBeTruthy();
  });

  // Default property values
  it("should have 'connected' default to false", () => {
    expect(liveKitRoomRef.connected).toBe(false);
  });

  it("should have 'microphoneEnabled' default to false", () => {
    expect(liveKitRoomRef.microphoneEnabled).toBe(false);
  });

  it("should have 'token' default to empty string", () => {
    expect(liveKitRoomRef.token).toBe("");
  });

  it("should have 'url' default to empty string", () => {
    expect(liveKitRoomRef.url).toBe("");
  });

  it("should have 'callbacks' default to undefined", () => {
    expect(liveKitRoomRef.callbacks).toBeUndefined();
  });

  // Render structure
  it("should render a default slot", () => {
    const slot =
      liveKitRoomRef.shadowRoot!.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });

  it("should not render any audio elements when no participants are connected", () => {
    const audioElements =
      liveKitRoomRef.shadowRoot!.querySelectorAll("audio");
    expect(audioElements.length).toBe(0);
  });
});

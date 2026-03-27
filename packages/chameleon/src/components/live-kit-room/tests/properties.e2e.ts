import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChLiveKitRoom } from "../live-kit-room.lit";
import "../live-kit-room.lit.js";

describe("[ch-live-kit-room][properties]", () => {
  let liveKitRoomRef: ChLiveKitRoom;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-live-kit-room></ch-live-kit-room>`);
    liveKitRoomRef = document.querySelector("ch-live-kit-room")!;
    await liveKitRoomRef.updateComplete;
  });

  it("should accept 'token' property", async () => {
    liveKitRoomRef.token = "test-token-123";
    await liveKitRoomRef.updateComplete;
    expect(liveKitRoomRef.token).toBe("test-token-123");
  });

  it("should accept 'url' property", async () => {
    liveKitRoomRef.url = "wss://example.livekit.cloud";
    await liveKitRoomRef.updateComplete;
    expect(liveKitRoomRef.url).toBe("wss://example.livekit.cloud");
  });

  it("should accept 'microphoneEnabled' property", async () => {
    liveKitRoomRef.microphoneEnabled = true;
    await liveKitRoomRef.updateComplete;
    expect(liveKitRoomRef.microphoneEnabled).toBe(true);
  });

  it("should accept 'connected' property", async () => {
    // Note: We only verify the property is accepted without actually
    // connecting, since connecting requires a real LiveKit server
    expect(liveKitRoomRef.connected).toBe(false);
  });

  it("should accept 'callbacks' property", async () => {
    const callbacks = {
      activeSpeakersChanged: () => {},
      updateTranscriptions: () => {}
    };
    liveKitRoomRef.callbacks = callbacks;
    await liveKitRoomRef.updateComplete;
    expect(liveKitRoomRef.callbacks).toBe(callbacks);
  });

  it("should reflect 'token' attribute to property", async () => {
    render(
      html`<ch-live-kit-room token="attr-token"></ch-live-kit-room>`
    );
    const el = document.querySelector("ch-live-kit-room")!;
    await el.updateComplete;
    expect(el.token).toBe("attr-token");
  });

  it("should reflect 'url' attribute to property", async () => {
    render(
      html`<ch-live-kit-room url="wss://test.example.com"></ch-live-kit-room>`
    );
    const el = document.querySelector("ch-live-kit-room")!;
    await el.updateComplete;
    expect(el.url).toBe("wss://test.example.com");
  });
});

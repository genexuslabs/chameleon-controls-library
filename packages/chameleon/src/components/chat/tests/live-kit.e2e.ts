import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChat } from "../chat.lit";
import "../chat.lit.js";

describe("[ch-chat][live-kit]", () => {
  let chatRef: ChChat;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-chat></ch-chat>`);
    chatRef = document.querySelector("ch-chat")!;
    await chatRef.updateComplete;
  });

  it("should not render ch-live-kit-room by default", () => {
    const liveKitRoom = chatRef.shadowRoot!.querySelector("ch-live-kit-room");
    expect(liveKitRoom).toBeNull();
  });

  it("should not render ch-live-kit-room when liveMode is true but no configuration is provided", async () => {
    chatRef.liveMode = true;
    await chatRef.updateComplete;

    const liveKitRoom = chatRef.shadowRoot!.querySelector("ch-live-kit-room");
    expect(liveKitRoom).toBeNull();
  });

  it("should not render ch-live-kit-room when liveMode is true but token is empty", async () => {
    chatRef.liveMode = true;
    chatRef.liveModeConfiguration = { url: "wss://example.com", token: "" };
    await chatRef.updateComplete;

    const liveKitRoom = chatRef.shadowRoot!.querySelector("ch-live-kit-room");
    expect(liveKitRoom).toBeNull();
  });

  it("should not render ch-live-kit-room when liveMode is true but url is empty", async () => {
    chatRef.liveMode = true;
    chatRef.liveModeConfiguration = { url: "", token: "some-token" };
    await chatRef.updateComplete;

    const liveKitRoom = chatRef.shadowRoot!.querySelector("ch-live-kit-room");
    expect(liveKitRoom).toBeNull();
  });

  it("should render ch-live-kit-room when liveMode is true and valid configuration is provided", async () => {
    chatRef.liveMode = true;
    chatRef.liveModeConfiguration = {
      url: "wss://example.com",
      token: "valid-token"
    };
    await chatRef.updateComplete;

    const liveKitRoom = chatRef.shadowRoot!.querySelector("ch-live-kit-room");
    expect(liveKitRoom).toBeTruthy();
  });

  it("should pass the correct properties to ch-live-kit-room", async () => {
    chatRef.liveMode = true;
    chatRef.liveModeConfiguration = {
      url: "wss://example.com",
      token: "valid-token",
      localParticipant: { microphoneEnabled: false }
    };
    await chatRef.updateComplete;

    const liveKitRoom = chatRef.shadowRoot!.querySelector(
      "ch-live-kit-room"
    ) as HTMLChLiveKitRoomElement;
    expect(liveKitRoom).toBeTruthy();
    expect(liveKitRoom.token).toBe("valid-token");
    expect(liveKitRoom.url).toBe("wss://example.com");
    expect(liveKitRoom.microphoneEnabled).toBe(false);
  });

  it("should disable the send-input when liveMode is displayed", async () => {
    chatRef.liveMode = true;
    chatRef.liveModeConfiguration = {
      url: "wss://example.com",
      token: "valid-token"
    };
    await chatRef.updateComplete;

    const editRef = chatRef.shadowRoot!.querySelector(
      "ch-edit"
    ) as HTMLChEditElement;
    expect(editRef.disabled).toBe(true);
  });

  it("should disable the send-button when liveMode is displayed", async () => {
    chatRef.liveMode = true;
    chatRef.liveModeConfiguration = {
      url: "wss://example.com",
      token: "valid-token"
    };
    await chatRef.updateComplete;

    const sendButton = chatRef.shadowRoot!.querySelector(
      '[part="send-button"]'
    ) as HTMLButtonElement;
    if (sendButton) {
      expect(sendButton.disabled).toBe(true);
    }
  });
});

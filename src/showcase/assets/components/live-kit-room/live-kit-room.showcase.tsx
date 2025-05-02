import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { liveKitCallbacks } from "./callbacks";
import { renderShowcaseProperties, updateShowcase } from "../utils";

const state: Partial<HTMLChLiveKitRoomElement> = {};

const handleConnect = () => {
  if (state.url !== "" && state.token !== "") {
    state.connected = true;
    updateShowcase();
  }
};

const handleDisconnect = () => {
  state.connected = false;
  updateShowcase();
};

const handleMute = () => {
  state.microphoneEnabled = false;
  updateShowcase();
};

const handleUnmute = () => {
  state.microphoneEnabled = true;
  updateShowcase();
};

const render = () => (
  <div class="tab-test-main-wrapper">
    <ch-live-kit-room
      callbacks={liveKitCallbacks}
      connected={state.connected}
      microphoneEnabled={state.microphoneEnabled}
      url={state.url}
      token={state.token}
    >
      <div class="button-container" part="button-container">
        {state.connected && state.microphoneEnabled && (
          <button class="button-primary" onClick={handleMute}>
            Mute
          </button>
        )}

        {state.connected && !state.microphoneEnabled && (
          <button class="button-primary" onClick={handleUnmute}>
            Unmute
          </button>
        )}

        {state.connected && (
          <button class="button-primary" onClick={handleDisconnect}>
            Disconnect
          </button>
        )}

        {!state.connected && (
          <button class="button-primary" onClick={handleConnect}>
            Connect
          </button>
        )}
      </div>
    </ch-live-kit-room>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChLiveKitRoomElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "url",
          caption: "Url",
          value: "",
          render: "input",
          type: "string"
        },
        {
          id: "token",
          caption: "Token",
          value: "",
          render: "input",
          type: "string"
        },
        {
          id: "connected",
          caption: "Connected",
          value: false,
          render: "checkbox",
          type: "boolean"
        },
        {
          id: "microphoneEnabled",
          caption: "Microphone Enabled",
          value: false,
          render: "checkbox",
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChLiveKitRoomElement>[] =
  [
    { name: "url", fixed: true, value: "", type: "string" },
    { name: "token", fixed: true, value: "", type: "string" },
    { name: "connected", defaultValue: false, type: "boolean" },
    {
      name: "microphoneEnabled",
      defaultValue: true,
      type: "boolean"
    }
  ];

export const liveKitRoomShowcaseStory: ShowcaseStory<HTMLChLiveKitRoomElement> =
  {
    properties: showcaseRenderProperties,
    markupWithoutUIModel: {
      react: () => `<ChLiveKitRoom${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}
          ></ChLiveKitRoom>`,

      stencil: () => `<ch-live-kit-room${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}
            ></ch-live-kit-room>`
    },
    render: render,
    state: state
  };

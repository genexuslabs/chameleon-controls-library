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
  state.micEnable = false;
  updateShowcase();
};

const handleUnmute = () => {
  state.micEnable = true;
  updateShowcase();
};

const render = () => (
  <div class="tab-test-main-wrapper">
    <ch-live-kit-room
      callbacks={liveKitCallbacks}
      connected={state.connected}
      micEnable={state.micEnable}
      url={state.url}
      token={state.token}
    >
      <div class="button-container" part="button-container">
        {state.connected && state.micEnable && (
          <button
            aria-label="Mute"
            title="Mute"
            class="button-primary"
            part="mute-button"
            disabled={false}
            type="button"
            onClick={handleMute}
          >
            Mute
          </button>
        )}

        {state.connected && !state.micEnable && (
          <button
            aria-label="Unmute"
            title="Unmute"
            class="button-primary"
            part="unmute-button"
            disabled={false}
            type="button"
            onClick={handleUnmute}
          >
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
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChLiveKitRoomElement>[] =
  [
    { name: "url", fixed: true, value: "", type: "string" },
    { name: "token", fixed: true, value: "", type: "string" }
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

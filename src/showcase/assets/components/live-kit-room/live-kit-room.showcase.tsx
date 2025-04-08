import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { liveKitCallbacks } from "./callbacks";

const state: Partial<HTMLChLiveKitRoomElement> = {};

const render = () => (
  <div class="tab-test-main-wrapper">
    <ch-live-kit-room callbacks={liveKitCallbacks}></ch-live-kit-room>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChLiveKitRoomElement> =
  [];

export const liveKitRoomShowcaseStory: ShowcaseStory<HTMLChLiveKitRoomElement> =
  {
    properties: showcaseRenderProperties,
    render: render,
    state: state
  };

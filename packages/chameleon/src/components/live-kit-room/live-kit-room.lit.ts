import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { Participant, RemoteParticipant, Room, Track } from "livekit-client";
import { removeIndex } from "../../utilities/array.js";
import { Host } from "../../utilities/host/host.js";
import { connectToRoom } from "./connect.js";
import type { LiveKitCallbacks } from "./types.js";

import styles from "./live-kit-room.scss?inline";

/**
 * The `ch-live-kit-room` component integrates with the LiveKit real-time communication platform to establish audio room connections and manage remote participants.
 *
 * @remarks
 * ## Features
 *  - Room lifecycle management: connect, disconnect, and track remote participants via the `livekit-client` SDK.
 *  - Automatic attachment of remote audio tracks to dynamically rendered `<audio>` elements in the shadow DOM.
 *  - Local microphone toggle support via the `microphoneEnabled` property.
 *  - Callbacks for transcription updates, active speaker changes, mute/unmute, and connection quality via the `callbacks` property.
 *  - Renders a default `<slot>` for projecting custom UI (e.g., transcription display, controls).
 *
 * ## Use when
 *  - Building voice-enabled conversational experiences with LiveKit.
 *  - Adding real-time audio communication to a `ch-chat` component.
 *
 * ## Do not use when
 *  - You need a full video conferencing UI — use a dedicated LiveKit UI framework instead.
 *  - Video tracks are required — this component only handles audio tracks.
 *
 * ## Accessibility
 *  - The rendered `<audio>` elements are hidden (`display: none`) and play automatically when remote tracks are attached. No keyboard interaction is required for audio playback.
 *  - The host uses `display: contents`, so it does not affect the layout of slotted content.
 *
 * @slot - Default slot. Projects custom content (e.g., control buttons, transcription UI) within the component's shadow root.
 *
 * @status experimental
 */
@Component({
  tag: "ch-live-kit-room",
  styles,
  shadow: {}
})
export class ChLiveKitRoom extends KasstorElement {
  #currentRoom!: Room;

  #participants: {
    participant: Participant | RemoteParticipant;
    ref: Ref<HTMLAudioElement>;
    shouldUpdate?: boolean;
  }[] = [];

  /**
   * Specifies the callback handlers for room events. Includes:
   *  - `activeSpeakersChanged`: called when the list of active speakers changes.
   *  - `updateTranscriptions`: called when transcription segments are received.
   *  - `muteMic` / `unmuteMic`: called when the local microphone is muted/unmuted.
   *  - `connectionEvents`: sub-callbacks for track mute/unmute, speaking state, and connection quality changes.
   *
   * When `undefined`, no callbacks are invoked. This property is read during
   * `connect()` — changing it after connection has no effect until the next
   * reconnection.
   */
  @property({ attribute: false }) callbacks?: LiveKitCallbacks | undefined;

  /**
   * Controls the connection state of the LiveKit room. Set to `true` to
   * connect using the current `url` and `token`; set to `false` to disconnect.
   *
   * When toggled to `true`, the component calls `connectToRoom()` and begins
   * tracking remote participants. When toggled to `false`, the room is
   * disconnected and audio tracks are detached.
   */
  @property({ type: Boolean }) connected: boolean = false;
  @Observe("connected")
  protected connectedPropertyChanged() {
    if (this.connected) {
      this.#connect();
    } else {
      this.#disconnectRoom();
    }
  }

  /**
   * Controls whether the local participant's microphone is enabled. When
   * `true`, the local participant publishes audio; when `false`, the mic is
   * muted. This property is only effective while `connected` is `true`.
   *
   * Toggling this property immediately enables or disables the local
   * microphone track.
   */
  @property({ type: Boolean, attribute: "microphone-enabled" })
  microphoneEnabled: boolean = false;
  @Observe("microphoneEnabled")
  protected microphoneEnabledChanged() {
    if (this.connected) {
      this.#toggleLocalParticipantMic();
    }
  }

  /**
   * Specifies the LiveKit access token used to authenticate and connect to
   * the room. The token encodes the participant identity, room name, and
   * permissions. Must be set before `connected` is toggled to `true`.
   *
   * Changing this value while connected does not trigger a reconnection —
   * disconnect and reconnect to use a new token.
   */
  @property() token: string = "";

  /**
   * Specifies the WebSocket URL of the LiveKit server (e.g.,
   * `"wss://my-livekit-server.example.com"`). Must be set before `connected`
   * is toggled to `true`.
   *
   * Changing this value while connected does not trigger a reconnection —
   * disconnect and reconnect to use a new URL.
   */
  @property() url: string = "";

  /**
   * Internal counter to trigger re-renders when participants change.
   */
  @state() private _participantVersion = 0;

  #addOrRemoveParticipant = (
    participant: Participant,
    action: "add" | "remove"
  ) => {
    const participantIndex = this.#findParticipantIndex(participant);

    if (action === "add") {
      if (participantIndex === -1) {
        this.#participants.push({
          participant,
          ref: createRef<HTMLAudioElement>(),
          shouldUpdate: true
        });
      } else {
        this.#participants[participantIndex].shouldUpdate = true;
      }
    } else {
      removeIndex(this.#participants, participantIndex);
    }

    this._participantVersion++;
  };

  #connect = () =>
    connectToRoom(
      this.url,
      this.token,
      this.#addOrRemoveParticipant,
      this.callbacks
    ).then(room => {
      this.#currentRoom = room;
      this.#toggleLocalParticipantMic();
    });

  #disconnectRoom = () => {
    if (this.#currentRoom) {
      this.#currentRoom.disconnect();
    }
  };

  #findParticipantIndex = (participant: Participant) =>
    this.#participants.findIndex(
      p => p.participant.identity === participant.identity
    );

  #toggleLocalParticipantMic = () =>
    this.#currentRoom?.localParticipant.setMicrophoneEnabled(
      this.microphoneEnabled
    );

  override connectedCallback() {
    super.connectedCallback();

    if (this.connected) {
      this.#connect();
    }
  }

  override updated() {
    this.#participants.forEach(participant => {
      if (participant.shouldUpdate) {
        participant.shouldUpdate = false;

        if (!participant.participant.isLocal) {
          if (participant.participant instanceof RemoteParticipant) {
            participant.participant.setVolume(1);
          }

          const micPub = participant.participant.getTrackPublication(
            Track.Source.Microphone
          );
          micPub?.audioTrack?.attach(participant.ref.value as HTMLMediaElement);
        }
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    if (this.connected) {
      this.#disconnectRoom();
    }
  }

  override render() {
    Host(this, {});

    return html`<slot></slot>${this.#participants.map(
      participant =>
        html`<audio ${ref(participant.ref)}></audio>`
    )}`;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChLiveKitRoomElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChLiveKitRoomElement;
  }

  /**
   * The `ch-live-kit-room` component integrates with the LiveKit real-time communication platform to establish audio room connections and manage remote participants.
   *
   * @remarks
   * ## Features
   *  - Room lifecycle management: connect, disconnect, and track remote participants via the `livekit-client` SDK.
   *  - Automatic attachment of remote audio tracks to dynamically rendered `<audio>` elements in the shadow DOM.
   *  - Local microphone toggle support via the `microphoneEnabled` property.
   *  - Callbacks for transcription updates, active speaker changes, mute/unmute, and connection quality via the `callbacks` property.
   *  - Renders a default `<slot>` for projecting custom UI (e.g., transcription display, controls).
   *
   * ## Use when
   *  - Building voice-enabled conversational experiences with LiveKit.
   *  - Adding real-time audio communication to a `ch-chat` component.
   *
   * ## Do not use when
   *  - You need a full video conferencing UI — use a dedicated LiveKit UI framework instead.
   *  - Video tracks are required — this component only handles audio tracks.
   *
   * ## Accessibility
   *  - The rendered `<audio>` elements are hidden (`display: none`) and play automatically when remote tracks are attached. No keyboard interaction is required for audio playback.
   *  - The host uses `display: contents`, so it does not affect the layout of slotted content.
   *
   * @slot - Default slot. Projects custom content (e.g., control buttons, transcription UI) within the component's shadow root.
   *
   * @status experimental
   */// prettier-ignore
  interface HTMLChLiveKitRoomElement extends ChLiveKitRoom {
    // Extend the ChLiveKitRoom class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-live-kit-room": HTMLChLiveKitRoomElement;
  }

  interface HTMLElementTagNameMap {
    "ch-live-kit-room": HTMLChLiveKitRoomElement;
  }
}


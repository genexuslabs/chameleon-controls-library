import {
  Component,
  Element,
  Host,
  Prop,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import { Participant, RemoteParticipant, Room, Track } from "livekit-client";
import { removeElement } from "../../common/array";
import { connectToRoom } from "./connect";
import { LiveKitCallbacks } from "./types";

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
  styleUrl: "live-kit-room.scss",
  shadow: true
})
export class ChLiveKitRoom {
  @Element() el!: HTMLChLiveKitRoomElement;

  #currentRoom: Room;

  #participants: {
    participant: Participant | RemoteParticipant;
    ref?: HTMLAudioElement;
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
  @Prop() readonly callbacks?: LiveKitCallbacks | undefined;

  /**
   * Controls the connection state of the LiveKit room. Set to `true` to
   * connect using the current `url` and `token`; set to `false` to disconnect.
   *
   * When toggled to `true`, the component calls `connectToRoom()` and begins
   * tracking remote participants. When toggled to `false`, the room is
   * disconnected and audio tracks are detached.
   */
  @Prop() readonly connected: boolean = false;

  @Watch("connected")
  connectedChanged() {
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
  @Prop() readonly microphoneEnabled: boolean = false;

  @Watch("microphoneEnabled")
  microphoneEnabledChanged() {
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
  @Prop() readonly token: string = "";

  /**
   * Specifies the WebSocket URL of the LiveKit server (e.g.,
   * `"wss://my-livekit-server.example.com"`). Must be set before `connected`
   * is toggled to `true`.
   *
   * Changing this value while connected does not trigger a reconnection —
   * disconnect and reconnect to use a new URL.
   */
  @Prop() readonly url: string = "";

  #addOrRemoveParticipant = (
    participant: Participant,
    action: "add" | "remove"
  ) => {
    const participantIndex = this.#findParticipantIndex(participant);

    if (action === "add") {
      if (participantIndex === -1) {
        this.#participants.push({ participant, shouldUpdate: true });
      } else {
        this.#participants[participantIndex].shouldUpdate = true;
      }
    } else {
      removeElement(this.#participants, participantIndex);
    }

    forceUpdate(this);
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

  connectedCallback() {
    if (this.connected) {
      this.#connect();
    }
  }

  componentDidRender() {
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
          micPub?.audioTrack?.attach(participant.ref);
        }
      }
    });
  }

  disconnectedCallback() {
    if (this.connected) {
      this.#disconnectRoom();
    }
  }

  render() {
    return (
      <Host>
        <slot />
        {this.#participants.map(participant => (
          <audio
            key={participant.participant.identity}
            ref={el => (participant.ref = el)}
          />
        ))}
      </Host>
    );
  }
}

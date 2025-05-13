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
   * Specifies the callbacks required in the control.
   */
  @Prop() readonly callbacks?: LiveKitCallbacks | undefined;

  /**
   * Specifies the room state.
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
   * Specifies the microphone state.
   */
  @Prop() readonly microphoneEnabled: boolean = false;

  @Watch("microphoneEnabled")
  microphoneEnabledChanged() {
    if (this.connected) {
      this.#toggleLocalParticipantMic();
    }
  }

  /**
   * Specifies the token to connect to the room
   */
  @Prop() readonly token: string = "";

  /**
   * Specifies the url to connect to the room
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
      this.callbacks.updateTranscriptions
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

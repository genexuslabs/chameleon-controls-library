import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Watch,
  forceUpdate
} from "@stencil/core";
import { LiveKitCallbacks } from "./types";
import { connectToRoom } from "./connect";
import { Participant, RemoteParticipant, Room, Track } from "livekit-client";
import { removeElement } from "../../common/array";

/**
 * TODO.
 */
@Component({
  tag: "ch-live-kit-room",
  styleUrl: "live-kit-room.scss",
  shadow: true
})
export class ChLiveKitRoom {
  @Element() el!: HTMLChLiveKitRoomElement;

  #participants: {
    participant: Participant | RemoteParticipant;
    ref?: HTMLAudioElement;
    shouldUpdate?: boolean;
  }[] = [];

  #currentRoom: Room;

  /**
   * Specifies the callbacks required in the control.
   */
  @Prop() readonly callbacks?: LiveKitCallbacks | undefined;

  /**
   * TODO
   */
  @Prop() readonly url: string = "";

  /**
   * TODO
   */
  @Prop() readonly token: string = "";

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
   * Specifies the room state.
   */
  @Prop() readonly micEnable: boolean = false;

  @Watch("micEnable")
  micEnableChanged() {
    if (this.connected) {
      if (this.micEnable) {
        this.#muteMic();
      } else {
        this.#unmuteMic();
      }
    }
  }

  #connect = () => {
    connectToRoom(
      this.url,
      this.token,
      this.#addOrRemoveParticipant,
      this.callbacks.updateTranscriptions
    ).then(room => {
      this.#currentRoom = room;
    });
  };

  #disconnectRoom = () => {
    if (this.#currentRoom) {
      this.#currentRoom.disconnect();
    }
  };

  #findParticipantIndex = (participant: Participant) =>
    this.#participants.findIndex(
      p => p.participant.identity === participant.identity
    );

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

  #muteMic = () => {
    this.#currentRoom?.localParticipant.setMicrophoneEnabled(false);
  };

  #unmuteMic = () => {
    this.#currentRoom?.localParticipant.setMicrophoneEnabled(true);
  };

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

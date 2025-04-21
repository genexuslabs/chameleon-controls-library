import {
  Participant,
  ParticipantEvent,
  Room,
  RoomEvent,
  TranscriptionSegment
} from "livekit-client";
import { AddOrRemoveType } from "./types";

function participantConnected(
  participant: Participant,
  addOrRemoveParticipant: AddOrRemoveType
) {
  participant.on(ParticipantEvent.IsSpeakingChanged, () => {
    addOrRemoveParticipant(participant, "add");
  });
}

export const connectToRoom = async (
  url: string,
  token: string,
  addOrRemoveParticipant: AddOrRemoveType,
  updateTranscriptions?: (segments: TranscriptionSegment[]) => void
) => {
  // creates a new room with options
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
    audioOutput: {
      deviceId: "default"
    },
    publishDefaults: {
      simulcast: true,
      scalabilityMode: "L3T3_KEY"
    }
  });

  // pre-warm connection, this can be called as early as your page is loaded
  room.prepareConnection(url, token);

  room
    .on(RoomEvent.ParticipantConnected, (participant: Participant) => {
      participantConnected(participant, addOrRemoveParticipant);
    })
    .on(RoomEvent.ParticipantDisconnected, participant =>
      addOrRemoveParticipant(participant, "remove")
    )
    .on(RoomEvent.LocalTrackPublished, () => {
      addOrRemoveParticipant(room.localParticipant, "add");
      participantConnected(room.localParticipant, addOrRemoveParticipant);
    })
    .on(RoomEvent.TranscriptionReceived, (segments: TranscriptionSegment[]) => {
      if (updateTranscriptions) {
        updateTranscriptions(segments);
      }
    });

  // connect to room
  await room.connect(url, token);

  room.remoteParticipants.forEach(participant => {
    participantConnected(participant, addOrRemoveParticipant);
  });
  participantConnected(room.localParticipant, addOrRemoveParticipant);

  room.localParticipant.setMicrophoneEnabled(true);

  return room;
};

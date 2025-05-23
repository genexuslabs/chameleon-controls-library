import {
  Participant,
  ParticipantEvent,
  Room,
  RoomEvent,
  TrackPublication,
  TranscriptionSegment
} from "livekit-client";
import { AddOrRemoveType, LiveKitCallbacks } from "./types";

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
  callbacks?: LiveKitCallbacks
) => {
  // Creates a new room with options
  const room = new Room();

  // Pre-warm connection, this can be called as early as your page is loaded
  room.prepareConnection(url, token);

  room
    .on(RoomEvent.ParticipantConnected, (participant: Participant) => {
      participantConnected(participant, addOrRemoveParticipant);
    })
    .on(RoomEvent.ParticipantDisconnected, participant =>
      addOrRemoveParticipant(participant, "remove")
    )
    .on(
      RoomEvent.ActiveSpeakersChanged,
      participants =>
        callbacks?.activeSpeakersChanged &&
        callbacks.activeSpeakersChanged(participants)
    )
    .on(RoomEvent.LocalTrackPublished, () => {
      addOrRemoveParticipant(room.localParticipant, "add");
      participantConnected(room.localParticipant, addOrRemoveParticipant);
    })
    .on(
      RoomEvent.TranscriptionReceived,
      (
        segments: TranscriptionSegment[],
        participant?: Participant,
        publication?: TrackPublication
      ) => {
        if (callbacks?.updateTranscriptions) {
          callbacks.updateTranscriptions(segments, participant, publication);
        }
      }
    );

  // Connect to room
  await room.connect(url, token);

  room.remoteParticipants.forEach(participant => {
    participantConnected(participant, addOrRemoveParticipant);
  });
  participantConnected(room.localParticipant, addOrRemoveParticipant);

  return room;
};

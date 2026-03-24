import {
  ConnectionQuality,
  Participant,
  TrackPublication,
  TranscriptionSegment
} from "livekit-client";

export type LiveKitCallbacks = {
  /**
   * Active speakers changed. List of speakers are ordered by their audio level.
   * Loudest speakers first. This will include the LocalParticipant too.
   *
   * Speaker updates are sent only to the publishing participant and their subscribers.
   */
  activeSpeakersChanged?: (participant: Participant[]) => void;

  connectionEvents?: LiveKitConnectionListener;

  muteMic?: () => void;

  unmuteMic?: () => void;

  updateTranscriptions?: (
    segments: TranscriptionSegment[],
    participant?: Participant,
    publication?: TrackPublication
  ) => void;
};

export type LiveKitConnectionListener = {
  trackMuted?: (
    participant: Participant,
    publication: TrackPublication
  ) => void;
  trackUnmuted?: (
    participant: Participant,
    publication: TrackPublication
  ) => void;
  isSpeakingChanged?: (participant: Participant, speaking: boolean) => void;
  connectionQualityChanged?: (
    participant: Participant,
    connectionQuality: ConnectionQuality
  ) => void;
};

export type AddOrRemoveType = (
  participant: Participant,
  action: "add" | "remove"
) => void;

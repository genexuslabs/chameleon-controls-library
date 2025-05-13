import {
  ConnectionQuality,
  Participant,
  TrackPublication,
  TranscriptionSegment
} from "livekit-client";

export type LiveKitCallbacks = {
  muteMic?: () => void;
  unmuteMic?: () => void;
  connectionEvents?: LiveKitConnectionListener;
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

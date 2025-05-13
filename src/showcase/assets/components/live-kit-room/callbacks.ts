import { TranscriptionSegment } from "livekit-client";
import { LiveKitCallbacks } from "../../../../components";

export const liveKitCallbacks: LiveKitCallbacks = {
  updateTranscriptions: (segments: TranscriptionSegment[]) => {
    console.log(JSON.stringify(segments, undefined, 2));
  }
};

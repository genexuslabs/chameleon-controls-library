import type { TranscriptionSegment } from "livekit-client";
import { ChatMessageByRole } from "./types";

const getAssistantMessageByTranscription = (
  transcription: TranscriptionSegment
): ChatMessageByRole<"assistant"> => ({
  id: transcription.id,
  content: transcription.text,
  role: "assistant",
  status: transcription.final ? "complete" : "streaming"
});

const getUserMessageByTranscription = (
  transcription: TranscriptionSegment
): ChatMessageByRole<"user"> => ({
  id: transcription.id,
  content: transcription.text,
  role: "user"
});

export const mergeSortedArrays = (liveKitMessages: {
  user: Map<string, TranscriptionSegment>;
  assistant: Map<string, TranscriptionSegment>;
}) => {
  const result: ChatMessageByRole<"user" | "assistant">[] = [];
  const assistantMessages = [...liveKitMessages.assistant.values()];
  const userMessages = [...liveKitMessages.user.values()];

  let assistantIndex = 0;
  let userIndex = 0;

  // Merge sort
  while (
    userIndex < userMessages.length &&
    assistantIndex < assistantMessages.length
  ) {
    result.push(
      userMessages[userIndex].firstReceivedTime <=
        assistantMessages[assistantIndex].firstReceivedTime
        ? getUserMessageByTranscription(userMessages[userIndex++])
        : getAssistantMessageByTranscription(
            assistantMessages[assistantIndex++]
          )
    );
  }

  // Add any remaining elements that are sorted
  return result.concat(
    userMessages.slice(userIndex).map(getUserMessageByTranscription),
    assistantMessages
      .slice(assistantIndex)
      .map(getAssistantMessageByTranscription)
  );
};

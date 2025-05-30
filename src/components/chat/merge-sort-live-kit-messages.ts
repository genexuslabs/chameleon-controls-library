import type { TranscriptionSegment } from "livekit-client";
import { ChatMessageByRole } from "./types";

const getAssistantMessageByTranscription = (
  transcription: TranscriptionSegment
): ChatMessageByRole<"assistant"> => ({
  id: transcription.id,
  content: transcription.text,
  role: "assistant",
  status: transcription.final ? "complete" : "streaming",
  transcribed: true
});

const getUserMessageByTranscription = (
  transcription: TranscriptionSegment
): ChatMessageByRole<"user"> => ({
  id: transcription.id,
  content: transcription.text,
  role: "user",
  transcribed: true
});

export const mergeSortedArrays = (liveKitMessages: {
  user: Map<string, TranscriptionSegment>;
  assistant: Map<string, TranscriptionSegment>;
}) => {
  const sortedMessages: ChatMessageByRole<"user" | "assistant">[] = [];
  const assistantMessages = [...liveKitMessages.assistant.values()];
  const userMessages = [...liveKitMessages.user.values()];

  let assistantIndex = 0;
  let userIndex = 0;

  // Merge sort
  while (
    userIndex < userMessages.length &&
    assistantIndex < assistantMessages.length
  ) {
    sortedMessages.push(
      userMessages[userIndex].firstReceivedTime <=
        assistantMessages[assistantIndex].firstReceivedTime
        ? getUserMessageByTranscription(userMessages[userIndex++])
        : getAssistantMessageByTranscription(
            assistantMessages[assistantIndex++]
          )
    );
  }

  // Add any remaining elements that are sorted
  sortedMessages.push(
    ...userMessages.slice(userIndex).map(getUserMessageByTranscription)
  );
  sortedMessages.push(
    ...assistantMessages
      .slice(assistantIndex)
      .map(getAssistantMessageByTranscription)
  );

  if (sortedMessages.length <= 1) {
    return sortedMessages;
  }

  const messagesCollapsed: ChatMessageByRole<"user" | "assistant">[] = [
    sortedMessages[0]
  ];

  // Try to combine sequential messages, because in some occasions the
  // transcription is separated into multiple messages.
  for (let index = 1; index < sortedMessages.length; index++) {
    const message = sortedMessages[index];
    const lastCollapsedMessage = messagesCollapsed.at(-1);

    // Messages have the same role, we can try to merge the content of them
    if (lastCollapsedMessage.role === message.role) {
      lastCollapsedMessage.content += ("\n" + message.content) as string;

      if (message.role === "assistant") {
        (lastCollapsedMessage as ChatMessageByRole<"assistant">).status =
          message.status;
      }
    }
    // Messages have different role, we can't merge the content of them
    else {
      messagesCollapsed.push(message);
    }
  }

  return messagesCollapsed;
};

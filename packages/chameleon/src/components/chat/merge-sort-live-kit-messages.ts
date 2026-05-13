import type { TranscriptionSegment } from "livekit-client";
import type {
  AGUIAssistantMessage,
  AGUIUserMessage
} from "./typesAGUI.js";

const getAssistantMessageByTranscription = (
  transcription: TranscriptionSegment
): AGUIAssistantMessage => ({
  id: transcription.id,
  role: "assistant",
  content: transcription.text
});

const getUserMessageByTranscription = (
  transcription: TranscriptionSegment
): AGUIUserMessage => ({
  id: transcription.id,
  role: "user",
  content: transcription.text
});

export const mergeSortedArrays = (liveKitMessages: {
  user: Map<string, TranscriptionSegment>;
  assistant: Map<string, TranscriptionSegment>;
}) => {
  const sortedMessages: (AGUIUserMessage | AGUIAssistantMessage)[] = [];
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

  const messagesCollapsed: (AGUIUserMessage | AGUIAssistantMessage)[] = [
    sortedMessages[0]
  ];

  // Try to combine sequential messages, because in some occasions the
  // transcription is separated into multiple messages.
  for (let index = 1; index < sortedMessages.length; index++) {
    const message = sortedMessages[index];
    const lastCollapsedMessage = messagesCollapsed.at(-1)!;

    // Messages have the same role, we can try to merge the content of them.
    // Both user and assistant carry string content here (live transcription
    // is always plain text), so concatenation is safe.
    if (lastCollapsedMessage.role === message.role) {
      const oldText =
        typeof lastCollapsedMessage.content === "string"
          ? lastCollapsedMessage.content
          : "";
      const newText =
        typeof message.content === "string" ? message.content : "";
      lastCollapsedMessage.content = oldText + "\n" + newText;
    }
    // Messages have different role, we can't merge the content of them
    else {
      messagesCollapsed.push(message);
    }
  }

  return messagesCollapsed;
};

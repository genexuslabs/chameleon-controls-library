# ch-chat - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Sending Messages and Streaming Responses](#sending-messages-and-streaming-responses)
- [Send Container Layout](#send-container-layout)
- [Live Mode (Voice Conversations)](#live-mode-voice-conversations)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A minimal chat interface with a text input, a send button, and a callback that receives the full conversation whenever the user sends a message.

### HTML

```html
<ch-chat id="my-chat" loading-state="all-records-loaded"></ch-chat>
```

### JavaScript

```javascript
const chat = document.querySelector("#my-chat");

// Provide the callbacks object. At minimum, sendChatMessages is required.
chat.callbacks = {
  sendChatMessages: messages => {
    console.log("Full conversation:", messages);
    // Forward the conversation to your API and handle the response
  }
};

// Optionally set custom translations / accessible labels
chat.translations = {
  accessibleName: {
    clearChat: "Clear chat",
    sendButton: "Send",
    sendInput: "Message",
    stopResponseButton: "Stop generating answer"
  },
  placeholder: {
    sendInput: "Ask me a question..."
  },
  text: {
    copyCodeButton: "Copy code",
    copyMessageContent: "Copy",
    processing: "Processing...",
    sourceFiles: "Source files:"
  }
};
```

### Key Points

- `loadingState` controls the initial appearance of the chat. Set it to `"all-records-loaded"` once the initial data is ready; otherwise the chat shows the `loading-chat` slot content.
- The `callbacks.sendChatMessages` function receives the **entire** `items` array (the full conversation history), not just the latest message.
- The user can send a message by pressing **Enter** (without Shift) or by clicking the send button. **Shift+Enter** inserts a newline instead.
- While `waitingResponse` is `true`, user-initiated sends are silently blocked, but the input remains editable so the user can compose the next message.
- Setting `disabled` to `true` prevents all interactions, including typing and sending.

## Sending Messages and Streaming Responses

The chat provides programmatic methods for adding and updating messages. This is the typical pattern for streaming an assistant response token by token.

### HTML

```html
<ch-chat id="stream-chat" loading-state="all-records-loaded"></ch-chat>
```

### JavaScript

```javascript
const chat = document.querySelector("#stream-chat");

chat.callbacks = {
  sendChatMessages: async messages => {
    // Set waiting state to prevent duplicate sends
    chat.waitingResponse = true;

    // Add an empty assistant message that will be streamed into
    await chat.addNewMessage({
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "",
      status: "streaming"
    });

    // Simulate streaming tokens from an API
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      // Append the new chunk to the last message
      await chat.updateLastMessage(
        { role: "assistant", content: chunk },
        "concat"
      );
    }

    // Mark the response as complete
    await chat.updateLastMessage(
      { role: "assistant", content: "", status: "complete" },
      "concat"
    );

    chat.waitingResponse = false;
  },

  // Provide a stopResponse callback to show the stop button
  stopResponse: async () => {
    // Abort your API call here
    chat.waitingResponse = false;
  }
};
```

### Key Points

- `addNewMessage` appends a single message to the conversation and triggers a re-render. Use it to insert the initial assistant placeholder before streaming begins.
- `updateLastMessage` and `updateChatMessage` accept a `mode` parameter: `"concat"` appends content to the existing message, while `"replace"` overwrites it entirely.
- When `callbacks.stopResponse` is defined and `waitingResponse` is `true`, the send button is automatically replaced with a stop-response button (unless you explicitly place `"stop-response-button"` in the `sendContainerLayout`).
- The `status` field on assistant messages (`"waiting"`, `"streaming"`, `"complete"`) drives the internal processing animation. A message with `status: "waiting"` shows an animated ellipsis.

## Send Container Layout

The `sendContainerLayout` property gives full control over where the send button, stop-response button, and any custom slotted elements appear relative to the text input.

### HTML

```html
<ch-chat id="layout-chat" loading-state="all-records-loaded">
  <!-- Custom slotted button matched by its slot name -->
  <button slot="attach-files-button" type="button">
    Attach
  </button>
</ch-chat>
```

### JavaScript

```javascript
const chat = document.querySelector("#layout-chat");

// Place an "attach" button before the input and the send button after it
chat.sendContainerLayout = {
  sendInputBefore: ["attach-files-button"],
  sendInputAfter: ["send-button"]
};

chat.callbacks = {
  sendChatMessages: messages => {
    console.log("Messages:", messages);
  },
  getChatMessageFiles: () => {
    // Return File objects that the user selected through your custom UI
    return selectedFiles;
  }
};
```

### Key Points

- There are four positions for placing elements: `sendContainerBefore`, `sendInputBefore`, `sendInputAfter`, and `sendContainerAfter`. Each accepts an array of element names.
- The reserved names `"send-button"` and `"stop-response-button"` are rendered internally by the component. All other names become `<slot>` elements -- provide a matching `slot="<name>"` attribute on your projected element.
- If `"send-button"` is not placed in any position, it will not be rendered at all.
- If `"stop-response-button"` is **not** placed explicitly, the component will automatically replace the send button with the stop-response button when `waitingResponse` is `true` and `callbacks.stopResponse` is defined.
- The `getChatMessageFiles` callback lets you implement your own file-picker UI. The component calls it before sending to collect attached files.

## Live Mode (Voice Conversations)

When `liveMode` is enabled, the text input is disabled and the chat starts a voice session through the built-in `ch-live-kit-room` integration. The transcribed conversation appears as messages in real time.

### HTML

```html
<ch-chat
  id="voice-chat"
  live-mode="true"
  loading-state="all-records-loaded"
></ch-chat>
```

### JavaScript

```javascript
const chat = document.querySelector("#voice-chat");

// A valid LiveKit token and server URL are required
chat.liveModeConfiguration = {
  url: "wss://your-livekit-server.example.com",
  token: "eyJhbGciOiJIUzI1...",
  localParticipant: {
    microphoneEnabled: true // default is true
  }
};

chat.callbacks = {
  sendChatMessages: messages => {
    console.log("Transcribed conversation:", messages);
  },
  liveMode: {
    activeSpeakersChanged: participant => {
      console.log("Active speaker:", participant);
    }
  }
};

// When ending live mode, transcriptions are pushed to the items array
function endVoiceSession() {
  chat.liveMode = false;
}
```

### Key Points

- Both `liveModeConfiguration.url` and `liveModeConfiguration.token` must be set for the LiveKit room to connect. Without them, live mode will not activate even if `liveMode` is `true`.
- While `liveMode` is active the send button and text input are disabled. Users can only communicate via voice.
- When `liveMode` is toggled back to `false`, the accumulated transcription segments are merged into the `items` array, preserving chronological order.
- The `localParticipant.microphoneEnabled` option controls whether the microphone starts active (`true` by default).

## Do's and Don'ts

### Do

- Set `callbacks`, `items`, `renderItem`, `sendContainerLayout`, and `translations` via JavaScript property assignment -- these are complex object types that cannot be expressed as HTML attributes.
- Always provide a `callbacks.sendChatMessages` function; it is the primary way the component communicates new user messages to your application.
- Set `loadingState` to `"all-records-loaded"` once you have finished loading the initial conversation so the chat transitions from the loading slot to the message view.
- Use the `userMessageAdded` event to synchronize cleanup of custom file-attachment UI with the chat's internal input clearing.
- Use `sendChatMessage()` when you need to send a message programmatically while still executing the same validation and callback pipeline as user-initiated sends.
- Provide accessible labels via the `translations` property for the send button, send input, and stop-response button.

### Don't

- Don't mutate the `items` array directly -- use the provided methods (`addNewMessage`, `updateLastMessage`, `updateChatMessage`) to ensure the virtual scroller stays in sync.
- Don't set `waitingResponse` to `true` indefinitely without providing a `stopResponse` callback; doing so locks the user out of sending messages with no way to recover.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to inject content into the chat -- use slots (`empty-chat`, `loading-chat`, `additional-content`) and the `renderItem` property instead.
- Don't forget to set `loadingState` -- leaving it at the default `"initial"` will keep the chat in its loading state permanently.

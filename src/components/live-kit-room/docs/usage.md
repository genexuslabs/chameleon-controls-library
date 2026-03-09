# ch-live-kit-room - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Toggle Microphone](#toggle-microphone)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates connecting to a LiveKit audio room and handling remote participants.

### HTML

```html
<ch-live-kit-room id="room">
  <div class="room-controls">
    <button id="connect-btn">Connect</button>
    <button id="disconnect-btn" disabled>Disconnect</button>
  </div>
</ch-live-kit-room>
```

### JavaScript

```js
const room = document.getElementById("room");
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");

// Configure the LiveKit server URL and access token
room.url = "wss://my-livekit-server.example.com";
room.token = "eyJhbGciOiJIUzI1NiIs..."; // JWT access token

// Set up event callbacks
room.callbacks = {
  activeSpeakersChanged: (speakers) => {
    console.log("Active speakers:", speakers.map(s => s.identity));
  },
  updateTranscriptions: (segments) => {
    segments.forEach(segment => {
      console.log(`${segment.participantIdentity}: ${segment.text}`);
    });
  }
};

// Connect
connectBtn.addEventListener("click", () => {
  room.connected = true;
  connectBtn.disabled = true;
  disconnectBtn.disabled = false;
});

// Disconnect
disconnectBtn.addEventListener("click", () => {
  room.connected = false;
  connectBtn.disabled = false;
  disconnectBtn.disabled = true;
});
```

### Key Points

- The `url` property specifies the WebSocket URL of the LiveKit server (e.g., `"wss://my-livekit-server.example.com"`).
- The `token` property specifies the JWT access token encoding participant identity, room name, and permissions.
- Both `url` and `token` must be set before toggling `connected` to `true`.
- The `connected` property controls the connection lifecycle. Set to `true` to connect, `false` to disconnect.
- Remote audio tracks are automatically attached to hidden `<audio>` elements in the shadow DOM and play immediately.
- The `callbacks` property accepts an object with handlers for `activeSpeakersChanged`, `updateTranscriptions`, and connection events.
- Changing `url` or `token` while connected does not trigger a reconnection. Disconnect and reconnect to use new values.

## Toggle Microphone

Demonstrates enabling and disabling the local participant's microphone during an active LiveKit session.

### HTML

```html
<ch-live-kit-room id="room">
  <div class="controls">
    <button id="mic-toggle">Unmute</button>
  </div>
</ch-live-kit-room>
```

### JavaScript

```js
const room = document.getElementById("room");
const micToggle = document.getElementById("mic-toggle");

// Configure connection
room.url = "wss://my-livekit-server.example.com";
room.token = "eyJhbGciOiJIUzI1NiIs...";

// Set up mute/unmute callbacks
room.callbacks = {
  muteMic: () => {
    micToggle.textContent = "Unmute";
    console.log("Microphone muted");
  },
  unmuteMic: () => {
    micToggle.textContent = "Mute";
    console.log("Microphone unmuted");
  }
};

// Connect with microphone initially disabled
room.connected = true;
room.microphoneEnabled = false;

// Toggle microphone
micToggle.addEventListener("click", () => {
  room.microphoneEnabled = !room.microphoneEnabled;
});
```

### Key Points

- The `microphoneEnabled` property controls whether the local participant's microphone is active. Defaults to `false`.
- Toggling `microphoneEnabled` at runtime immediately enables or disables the local microphone track.
- The property is only effective while `connected` is `true`. Setting it while disconnected has no immediate effect; the value is applied on the next connection.
- The `callbacks.muteMic` and `callbacks.unmuteMic` handlers are called when the microphone state changes, enabling UI synchronization.
- The `callbacks` property must be set before connecting. Changing it after connection has no effect until the next reconnection.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

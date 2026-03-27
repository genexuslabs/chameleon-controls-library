# `ch-live-kit-room`

<p>The <code>ch-live-kit-room</code> component integrates with the LiveKit real-time communication platform to establish audio room connections and manage remote participants.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `callbacks:  LiveKitCallbacks | undefined`

<p>Specifies the callback handlers for room events. Includes:</p>
<ul>
<li><code>activeSpeakersChanged</code>: called when the list of active speakers changes.</li>
<li><code>updateTranscriptions</code>: called when transcription segments are received.</li>
<li><code>muteMic</code> / <code>unmuteMic</code>: called when the local microphone is muted/unmuted.</li>
<li><code>connectionEvents</code>: sub-callbacks for track mute/unmute, speaking state, and connection quality changes.</li>
</ul>
<p>When <code>undefined</code>, no callbacks are invoked. This property is read during
<code>connect()</code> — changing it after connection has no effect until the next
reconnection.</p>

**Default**: <code>undefined</code>

---

### `connected:  boolean`

<p>Controls the connection state of the LiveKit room. Set to <code>true</code> to
connect using the current <code>url</code> and <code>token</code>; set to <code>false</code> to disconnect.</p>
<p>When toggled to <code>true</code>, the component calls <code>connectToRoom()</code> and begins
tracking remote participants. When toggled to <code>false</code>, the room is
disconnected and audio tracks are detached.</p>

**Attribute**: <code>connected</code>

**Default**: <code>false</code>

---

### `microphoneEnabled:  boolean`

<p>Controls whether the local participant's microphone is enabled. When
<code>true</code>, the local participant publishes audio; when <code>false</code>, the mic is
muted. This property is only effective while <code>connected</code> is <code>true</code>.</p>
<p>Toggling this property immediately enables or disables the local
microphone track.</p>

**Attribute**: <code>microphone-enabled</code>

**Default**: <code>false</code>

---

### `token:  string`

<p>Specifies the LiveKit access token used to authenticate and connect to
the room. The token encodes the participant identity, room name, and
permissions. Must be set before <code>connected</code> is toggled to <code>true</code>.</p>
<p>Changing this value while connected does not trigger a reconnection —
disconnect and reconnect to use a new token.</p>

**Attribute**: <code>token</code>

**Default**: <code>""</code>

---

### `url:  string`

<p>Specifies the WebSocket URL of the LiveKit server (e.g.,
<code>&quot;wss://my-livekit-server.example.com&quot;</code>). Must be set before <code>connected</code>
is toggled to <code>true</code>.</p>
<p>Changing this value while connected does not trigger a reconnection —
disconnect and reconnect to use a new URL.</p>

**Attribute**: <code>url</code>

**Default**: <code>""</code>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `- Default slot. Projects custom content (e.g., control buttons, transcription UI) within the component's shadow root.`
</details>

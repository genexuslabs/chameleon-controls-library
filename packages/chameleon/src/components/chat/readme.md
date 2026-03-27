# `ch-chat`

<p>The <code>ch-chat</code> component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `autoScroll:  "never" | "at-scroll-end"`

<p>Specifies how the scroll position will be adjusted when the chat messages
are updated with the methods <code>addNewMessage</code>, <code>updateChatMessage</code> or
<code>updateLastMessage</code>.</p>
<ul>
<li>
<p>&quot;at-scroll-end&quot;: If the scroll is positioned at the end of the content,
the chat will maintain the scroll at the end while the content of the
messages is being updated.</p>
</li>
<li>
<p>&quot;never&quot;: The scroll position won't be adjusted when the content of the
messages is being updated.</p>
</li>
</ul>

**Attribute**: <code>auto-scroll</code>

**Default**: <code>"at-scroll-end"</code>

---

### `callbacks:  ChatCallbacks | undefined`

<p>Specifies the callbacks required in the control.</p>

**Default**: <code>undefined</code>

---

### `disabled:  boolean`

<p>Specifies if all interactions are disabled</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `items:  ChatMessage[]`

<p>Specifies the items that the chat will display.</p>

**Default**: <code>[]</code>

---

### `liveMode:  boolean`

<p>Specifies if the live mode is set.</p>
<p>When this mode is enabled, the chat will disable sending messages by user
interactions and the only way to send messages will be throughout the
voice. The user will have to enable the microphone input in their Operative
System and it will voice chat with the remote participants.</p>
<p>When any participant speaks, the transcribed conversation will be displayed
as new messages in the chat (<code>items</code> property).</p>
<p>When the <code>liveMode</code> ends, the transcribed conversation will be pushed
to the <code>items</code> of the chat.</p>

**Attribute**: <code>live-mode</code>

**Default**: <code>false</code>

---

### `liveModeConfiguration:  ChatLiveModeConfiguration | undefined`

<p>Specifies the live mode configuration. The <code>token</code> and <code>url</code> are required
to enable the <code>liveMode</code>.</p>

**Default**: <code>undefined</code>

---

### `loadingState:  SmartGridDataState`

<p>Specifies if the chat is waiting for the data to be loaded.</p>

**Default**: <code>"initial"</code>

---

### `markdownTheme:  string | null`

<p>Specifies the theme to be used for rendering the markdown.
If <code>null</code>, no theme will be applied.</p>

**Attribute**: <code>markdown-theme</code>

**Default**: <code>"ch-markdown-viewer"</code>

---

### `newUserMessageAlignment:  "start" | "end"`

<p>Specifies how the messages added by the user interaction will be aligned
in the chat.</p>
<p>If <code>newUserMessageAlignment === &quot;start&quot;</code> the chat will reserve the
necessary space to visualize the message at the start of the content
viewport if the content is not large enough.
This behavior is the same as the Monaco editor does for reserving space
when visualizing the last lines positioned at the top of the editor.</p>

**Attribute**: <code>new-user-message-alignment</code>

**Default**: <code>"end"</code>

---

### `newUserMessageScrollBehavior:  Exclude<ScrollBehavior, "auto">`

<p>Specifies how the chat will scroll to the position of the messages added
by user interaction.</p>

**Attribute**: <code>new-user-message-scroll-behavior</code>

**Default**: <code>"instant"</code>

---

### `renderItem: ChatMessageRenderByItem | ChatMessageRenderBySections | undefined`

<p>This property allows us to implement custom rendering of chat items.</p>
<p>This works by providing a custom render of the cell content in two
possible ways:</p>
<ol>
<li>
<p>Replacing the render of the entire cell with a function of the
message model.</p>
</li>
<li>
<p>Replacing the render of specific parts of the message by providing an
object with the specific renders of the message sections (<code>codeBlock</code>,
<code>contentBefore</code>, <code>content</code>, <code>contentAfter</code>, <code>files</code> and/or
<code>messageStructure</code>).</p>
</li>
</ol>

**Default**: <code>undefined</code>

---

### `sendButtonDisabled:  boolean`

<p><code>true</code> to disable the send-button element.</p>

**Attribute**: <code>send-button-disabled</code>

**Default**: <code>false</code>

---

### `sendInputDisabled:  boolean`

<p><code>true</code> to disable the send-input element.</p>

**Attribute**: <code>send-input-disabled</code>

**Default**: <code>false</code>

---

### `showAdditionalContent:  boolean`

<p><code>true</code> to render a slot named &quot;additional-content&quot; to project elements
between the &quot;content&quot; slot (grid messages) and the &quot;send-container&quot; slot.</p>
<p>This slot can only be rendered if loadingState !== &quot;initial&quot; and
(loadingState !== &quot;all-records-loaded&quot; &amp;&amp; items.length &gt; 0).</p>

**Attribute**: <code>show-additional-content</code>

**Default**: <code>false</code>

---

### `sendContainerLayout:  ChatSendContainerLayout`

<p>Specifies the position of the elements in the <code>send-container</code> part.
There are four positions for distributing elements:</p>
<ul>
<li><code>sendContainerBefore</code>: Before the contents of the <code>send-container</code> part.</li>
<li><code>sendInputBefore</code>: Before the contents of the <code>send-input</code> part.</li>
<li><code>sendInputAfter</code>: After the contents of the <code>send-input</code> part.</li>
<li><code>sendContainerAfter</code>: After the contents of the <code>send-container</code> part.</li>
</ul>
<p>At each position you can specify reserved elements, such as the
<code>send-button</code> and <code>stop-response-button</code>, but can also be specified
non-reserved elements, which will be projected as content slots.</p>
<p>If the reserved <code>stop-response-button</code> element is not specified anywhere,
the send button will be replaced with the stop-response button
when <code>waitingResponse = true</code> and the <code>stopResponse</code> callback is specified.</p>
<p>If the <code>send-button</code> is not specified in any position, it won't be
rendered in the <code>ch-chat</code>.</p>

**Default**: <code>{
    sendContainerAfter: ["send-button"]
  }</code>

---

### `theme:  ThemeModel | undefined`

<p>Specifies the theme to be used for rendering the chat.
If <code>undefined</code>, no theme will be applied.</p>

**Default**: <code>undefined</code>

---

### `translations:  ChatTranslations`

<p>Specifies the literals required in the control.</p>

**Default**: <code>{
    accessibleName: {
      clearChat: "Clear chat",
      copyMessageContent: "Copy message content",
      downloadCodeButton: "Download code",
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
  }</code>

---

### `virtualScrollerBufferSize:  number`

<p>Specifies the number of elements to be rendered above and below the
virtual scroll.</p>

**Attribute**: <code>virtual-scroller-buffer-size</code>

**Default**: <code>5</code>

---

### `waitingResponse:  boolean`

<p><code>true</code> if the <code>ch-chat</code> is waiting for a response from the server. If so,
the <code>sendChatMessages</code> won't be executed when the user tries to send a new
message. Although, the <code>send-input</code> and <code>send-button</code> won't be disabled,
so the user can interact with the chat.</p>

**Attribute**: <code>waiting-response</code>

**Default**: <code>false</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `userMessageAdded: ChatMessageByRole&lt;"user"&gt;`

<p>Fired when a new user message is added in the chat via user interaction.</p>
<p>Since developers can define their own render for file attachment, this
event serves to synchronize the cleanup of the <code>send-input</code> with the
cleanup of the custom file attachment, or or even blocking user
interactions before the <code>sendChatMessages</code> callback is executed.</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `addNewMessage: (message: ChatMessage) => void`

<p>Add a new message at the end of the record, performing a re-render.</p>

---

### `focusChatInput: () => void`

<p>Focus the chat input</p>

---

### `setChatInputMessage: (text: string) => void`

<p>Set the text for the chat input</p>

---

### `sendChatMessage: (content: ChatMessageUser | undefined, files: File[]) => void`

<p>Send the current message of the ch-chat's <code>send-input</code> element. This
method executes the same callbacks and interoperates with the same
features as if the message were sent through user interaction. The only
things to keep in mind are the following:</p>
<ul>
<li>
<p>If the <code>content</code> parameter is provided, it will be used in replacement
of the input content.</p>
</li>
<li>
<p>If the <code>files</code> parameter is provided, the <code>getChatMessageFiles</code>
callback won't be executed to get the current files of the chat.</p>
</li>
</ul>
<p>Whether or not the <code>content</code> parameter is provided, the content of the
<code>send-input</code> element will be cleared.</p>

---

### `updateChatMessage: (messageIndex: number, message: ChatMessageByRoleNoId<"system" | "assistant">, mode: "concat" | "replace") => void`

<p>Given the id of the message, it updates the content of the indexed message.</p>

---

### `updateLastMessage: (message: ChatMessageByRoleNoId<"system" | "assistant">, mode: "concat" | "replace") => void`

<p>Update the content of the last message, performing a re-render.</p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `empty-chat`

<p>Displayed when all records are loaded but there are no messages.</p>

---

### `loading-chat`

<p>Displayed while the chat is in the initial loading state.</p>

---

### `additional-content`

<p>Projected between the messages area and the send container. Rendered when <code>showAdditionalContent</code> is <code>true</code> and the chat is not in initial or empty state.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `messages-container`

<p>The scrollable container that holds the chat messages.</p>

---

### `send-container`

<p>The bottom area containing the input and action buttons.</p>

---

### `send-container-before`

<p>Region before the send input within the send container. Rendered when <code>sendContainerLayout.sendContainerBefore</code> is defined.</p>

---

### `send-container-after`

<p>Region after the send input within the send container. Rendered when <code>sendContainerLayout.sendContainerAfter</code> is defined.</p>

---

### `send-input-before`

<p>Region before the text input inside the edit control. Rendered when <code>sendContainerLayout.sendInputBefore</code> is defined.</p>

---

### `send-input-after`

<p>Region after the text input inside the edit control. Rendered when <code>sendContainerLayout.sendInputAfter</code> is defined.</p>

---

### `send-button`

<p>The button that sends the current message.</p>

---

### `stop-response-button`

<p>The button that stops the assistant's response generation. Rendered when <code>waitingResponse</code> is <code>true</code> and a <code>stopResponse</code> callback is provided.</p>
</details>

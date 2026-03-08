# ch-chat: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Chat with messages](#case-1-chat-with-messages)
  - [Case 2: Initial loading state](#case-2-initial-loading-state)
  - [Layout elements inside send-container / send-input slots](#layout-elements-inside-send-container-send-input-slots)

## Shadow Parts

| Part                      | Description                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `"messages-container"`    | The scrollable container that holds the chat messages.                                                                                          |
| `"send-button"`           | The button that sends the current message.                                                                                                      |
| `"send-container"`        | The bottom area containing the input and action buttons.                                                                                        |
| `"send-container-after"`  | Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined.                       |
| `"send-container-before"` | Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined.                     |
| `"send-input-after"`      | Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined.                             |
| `"send-input-before"`     | Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined.                           |
| `"stop-response-button"`  | The button that stops the assistant's response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided. |

## Shadow DOM Layout

## Case 1: Chat with messages

```
<ch-chat>
  | #shadow-root
  | <!-- when theme -->
  | <ch-theme></ch-theme>
  |
  | <ch-smart-grid>
  |   | #shadow-root
  |   | <ch-infinite-scroll position="top">
  |   |   | #shadow-root
  |   |   | <!-- when loadingState === "loading" -->
  |   |   | <slot />
  |   | </ch-infinite-scroll>
  |   | <slot name="grid-content" />
  |
  |   <ch-virtual-scroller slot="grid-content" part="messages-container">
  |     | #shadow-root
  |     | <slot />
  |
  |     <ch-chat-lit>
  |       | #shadow-root
  |       | <!-- Rendered messages -->
  |     </ch-chat-lit>
  |   </ch-virtual-scroller>
  | </ch-smart-grid>
  |
  | <!-- when showAdditionalContent -->
  | <slot name="additional-content" />
  |
  | <div part="send-container">
  |   <!-- when sendContainerBefore layout elements -->
  |   <div part="send-container-before">
  |     <!-- Layout elements such as send-button, stop-response-button -->
  |   </div>
  |
  |   <ch-edit part="send-input" multiline>
  |     | #shadow-root
  |     | <!-- when showAdditionalContentBefore -->
  |     | <slot name="additional-content-before" />
  |     | <textarea />
  |     | <!-- when showAdditionalContentAfter -->
  |     | <slot name="additional-content-after" />
  |
  |     <!-- when sendInputBefore layout elements -->
  |     <div part="send-input-before" slot="additional-content-before"></div>
  |     <!-- when sendInputAfter layout elements -->
  |     <div part="send-input-after" slot="additional-content-after"></div>
  |   </ch-edit>
  |
  |   <!-- when sendContainerAfter layout elements -->
  |   <div part="send-container-after">
  |     <!-- Layout elements such as send-button, stop-response-button -->
  |   </div>
  | </div>
  |
  | <!-- when liveMode -->
  | <ch-live-kit-room>
  |   | #shadow-root
  |   | <slot />
  | </ch-live-kit-room>
</ch-chat>
```

## Case 2: Initial loading state

```
<ch-chat>
  | #shadow-root
  | <!-- when theme -->
  | <ch-theme></ch-theme>
  |
  | <slot name="loading-chat" />
  |
  | <div part="send-container">
  |   <ch-edit part="send-input" multiline disabled>
  |     | #shadow-root
  |     | <textarea />
  |   </ch-edit>
  | </div>
</ch-chat>
```

## Layout elements inside send-container / send-input slots

```
<!-- send-button -->
<button part="send-button"></button>

<!-- stop-response-button (when waitingResponse) -->
<button part="stop-response-button"></button>
```

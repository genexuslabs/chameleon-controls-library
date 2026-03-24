# ch-chat: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Chat with messages](#case-1-chat-with-messages)
  - [Case 2: Initial loading state](#case-2-initial-loading-state)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

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

## Styling Recipes

### Branded Send Container

Style the bottom send bar with brand colors and spacing.

```css
ch-chat::part(send-container) {
  background-color: var(--brand-surface, #f0f4ff);
  border-block-start: 1px solid var(--brand-border, #c0c8e0);
  padding: 12px 16px;
  gap: 8px;
}

ch-chat::part(send-button) {
  background-color: var(--brand-primary, #3366cc);
  color: #fff;
  border-radius: 6px;
  padding: 8px 16px;
}

ch-chat::part(send-button):hover {
  background-color: var(--brand-primary-hover, #264d99);
}
```

### Rounded Input with Padding

Give the send input a rounded, padded appearance.

```css
ch-chat::part(send-input) {
  border: 1px solid #ccc;
  border-radius: 20px;
  padding-inline: 16px;
  padding-block: 8px;
  background-color: #fff;
}

ch-chat::part(send-input):focus-within {
  border-color: var(--brand-primary, #3366cc);
  outline: 2px solid rgba(51, 102, 204, 0.25);
}
```

### Full-height Chat with Constrained Width

Set the chat to fill the viewport height while constraining its inline size.

```css
ch-chat {
  block-size: 100dvh;
  max-inline-size: 720px;
  margin-inline: auto;
  background-color: #fafafa;
}
```

## Anti-patterns

### 1. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-chat::part(send-container) > button {
  color: blue;
}

/* CORRECT - target the part directly */
ch-chat::part(send-button) {
  color: blue;
}
```

### 2. Styling the `messages-container` with fixed height

```css
/* INCORRECT - the host uses a CSS grid layout to distribute space
   between the messages area and the send container; setting a fixed
   height on the messages-container breaks the grid sizing */
ch-chat::part(messages-container) {
  height: 400px;
}

/* CORRECT - set the height on the host element and let the grid
   distribute space automatically */
ch-chat {
  block-size: 100dvh;
}
```

### 3. Hiding the send container with `display: none`

```css
/* INCORRECT - the send-container is part of the host's grid layout;
   hiding it collapses a grid row and may leave empty space */
ch-chat::part(send-container) {
  display: none;
}

/* CORRECT - use the sendButtonDisabled and sendInputDisabled properties
   to disable interaction, or remove the send-button from the
   sendContainerLayout to hide it */
```

```js
chat.sendButtonDisabled = true;
chat.sendInputDisabled = true;
```

### 4. Overriding `display: grid` on the host

```css
/* INCORRECT - the host relies on a grid template with specific row
   definitions; changing it will break the messages / send-container
   split layout */
ch-chat {
  display: flex;
  flex-direction: column;
}

/* CORRECT - the host is already display: grid with
   grid-template-rows: 1fr max-content; use padding, gap, or
   background on the host for visual adjustments */
ch-chat {
  padding: 8px;
  background-color: #f5f5f5;
}
```

## Do's and Don'ts

### Do

- Set the chat's height on the host element (e.g., `ch-chat { block-size: 100dvh; }`) and let the internal grid distribute space between messages and the send container.
- Use `::part(send-container)` for layout properties like `padding`, `gap`, and `background` on the bottom bar.
- Use `::part(send-button)` and `::part(stop-response-button)` to style the action buttons, including hover and focus states.
- Use `::part(messages-container)` for padding and background on the scrollable message area.
- Test styling changes across all component states: initial loading, empty chat, messages loaded, and waiting-response.

### Don't

- Don't chain `::part()` selectors -- use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override the host's `display: grid` or `grid-template-rows` -- the component depends on these for its internal layout.
- Don't override internal CSS custom properties that are not documented.

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

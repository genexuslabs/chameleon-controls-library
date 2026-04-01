# `ch-reasoning`

<p>The <code>ch-reasoning</code> component displays AI reasoning content in a collapsible accordion, automatically opening during streaming and closing when finished. It features a pulse animation during the thinking state and a typewriter effect for streaming text content.</p>

## Features

- **Automatic streaming behavior**: Opens automatically when `isStreaming` is true, closes when done
- **Pulse animation**: Visual "thinking" indicator with customizable pulse animation
- **Typewriter effect**: Text streams character-by-character for a natural feel
- **Customizable messages**: Configure "Thinking..." and "Thought for X seconds" messages
- **White-label design**: Minimal styles, fully customizable via CSS parts and custom properties
- **Built on ch-accordion-render**: Leverages existing Chameleon accordion component

## Use when

- Displaying AI reasoning steps or chain-of-thought processes
- Showing streaming content that should be progressively revealed
- Providing visual feedback during AI model processing
- Organizing collapsible AI-generated content

## Do not use when

- Content is static and doesn't require streaming effects
- Multiple reasoning steps need to be shown simultaneously (use multiple instances instead)
- You need a multi-item accordion (use `ch-accordion-render` directly)

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `content: string`

<p>The reasoning text content to display. When streaming, text will be revealed character-by-character.</p>

**Default**: `""`

---

### `isStreaming: boolean`

<p>Controls the streaming state. When <code>true</code>, shows pulse animation on trigger and enables typewriter effect. Automatically opens the accordion.</p>

**Attribute**: <code>is-streaming</code>

**Default**: `false`

---

### `duration: number`

<p>Duration in seconds that the reasoning took. Used in the thought message template (e.g., "Thought for 4 seconds").</p>

**Default**: `0`

---

### `thinkingMessage: string`

<p>Custom message displayed in the accordion trigger while <code>isStreaming</code> is true.</p>

**Attribute**: <code>thinking-message</code>

**Default**: `"Thinking..."`

---

### `thoughtMessage: string`

<p>Custom template message displayed in the accordion trigger after streaming completes. Use <code>{duration}</code> placeholder to insert the duration value.</p>

**Attribute**: <code>thought-message</code>

**Default**: `"Thought for {duration} seconds"`

---

### `open: boolean`

<p>Controls whether the accordion is expanded or collapsed. Can be used for manual control.</p>

**Default**: `false`

</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `openChange: ReasoningItemExpandedChangeEvent`

<p>Fired when the accordion is expanded or collapsed. The payload is <code>{ expanded: boolean }</code>.</p>

</details>

<details open>
  <summary>
  
  ## CSS Custom Properties
  </summary>
  
### `--ch-reasoning-pulse-duration`

<p>Specifies the duration of the pulse animation displayed during streaming/thinking state.</p>

**Default**: `1.5s`

---

### `--ch-reasoning-pulse-opacity-min`

<p>Specifies the minimum opacity value for the pulse animation.</p>

**Default**: `0.5`

---

### `--ch-reasoning-pulse-opacity-max`

<p>Specifies the maximum opacity value for the pulse animation.</p>

**Default**: `1`

### Customizing Animations

```css
/* Faster, more subtle pulse */
ch-reasoning {
  --ch-reasoning-pulse-duration: 0.8s;
  --ch-reasoning-pulse-opacity-min: 0.7;
  --ch-reasoning-pulse-opacity-max: 1;
}

/* Slower, more dramatic pulse */
ch-reasoning {
  --ch-reasoning-pulse-duration: 2.5s;
  --ch-reasoning-pulse-opacity-min: 0.3;
  --ch-reasoning-pulse-opacity-max: 1;
}
```

</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>

The component exposes all parts from the internal `ch-accordion-render` component for external styling:

- `header` - The clickable trigger button of the accordion
- `section` - The collapsible content section containing the reasoning text
- `panel` - The outer container wrapping the accordion
- `disabled` - Applied to header, panel, and section when disabled
- `expanded` - Applied to header, panel, and section when expanded
- `collapsed` - Applied to header, panel, and section when collapsed

### Styling with CSS Parts

```css
/* Style the header trigger */
ch-reasoning::part(header) {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
}

/* Style the content section */
ch-reasoning::part(section) {
  padding: 1rem;
  background-color: white;
}

/* Style when expanded */
ch-reasoning::part(header expanded) {
  background-color: #e0e0e0;
}
```

</details>

## Accessibility

- Uses `ch-accordion-render` internally, inheriting all its accessibility features
- Proper ARIA attributes for collapsible content
- Keyboard navigation support
- Screen reader friendly

## Examples

### Basic usage

```html
<ch-reasoning
  content="This is the reasoning content"
  duration="4"
></ch-reasoning>
```

### Streaming state

```html
<ch-reasoning
  is-streaming
  content="Analyzing the problem step by step..."
  thinking-message="AI is thinking..."
></ch-reasoning>
```

### Custom messages

```html
<ch-reasoning
  content="Final reasoning result"
  duration="3"
  thought-message="Completed in {duration}s"
></ch-reasoning>
```

## Status

**experimental**

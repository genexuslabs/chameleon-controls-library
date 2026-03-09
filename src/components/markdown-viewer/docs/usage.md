# ch-markdown-viewer - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Code Blocks](#code-blocks)
- [Streaming Indicator](#streaming-indicator)
- [Theme Integration](#theme-integration)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates rendering a simple Markdown string as rich HTML with GFM support.

### HTML

```html
<ch-markdown-viewer
  id="md-viewer"
  value="# Welcome

This is a **bold** statement and this is *italic*.

### JavaScript

```js
const viewer = document.querySelector("#md-viewer");

// Update the markdown content dynamically
viewer.value = `# Updated Content

The markdown viewer re-parses and re-renders on every \`value\` change.

1. First item
2. Second item
3. Third item
`;
```

### Key Points

- The `value` property accepts a Markdown string. When changed at runtime, the entire content is re-parsed and re-rendered.
- GitHub Flavored Markdown (GFM) is supported out of the box, including tables, strikethrough, task lists, and autolinks.
- The component renders semantic HTML elements (headings, lists, tables, blockquotes) that are natively accessible to assistive technologies.
- When `value` is `undefined` or empty, the component renders nothing.
- If parsing fails, the error is logged to the console and the previously rendered content is preserved.

## Code Blocks

Demonstrates Markdown content that includes fenced code blocks with syntax highlighting.

### HTML

```html
<ch-markdown-viewer
  id="md-code"
  value="# Code Examples

### JavaScript

```js
const viewer = document.querySelector("#md-code");

// Provide a custom code block renderer
viewer.renderCode = (code, language, showIndicator) => {
  // Return a custom Lit TemplateResult for code blocks
  // This example adds a copy button header
  return html`
    <div class="code-block-container">
      <div class="code-block-header">
        <span>${language}</span>
        <button @click=${() => navigator.clipboard.writeText(code)}>Copy</button>
      </div>
      <ch-code language="${language}" value="${code}"></ch-code>
    </div>
  `;
};
```

### Key Points

- Fenced code blocks (triple backticks with a language identifier) are automatically rendered using `ch-code` with syntax highlighting.
- Language grammars are loaded on demand at runtime, supporting all highlight.js languages.
- The `renderCode` property allows replacing the default code block renderer with a custom function that returns a Lit `TemplateResult`.
- Code blocks inside the markdown viewer inherit the streaming indicator properties (`--ch-markdown-viewer-indicator-color`, etc.) from the parent.
- The default code renderer uses `ch-code` internally, so all `ch-code` CSS custom properties for token colors can be set on the `ch-markdown-viewer` host.

## Streaming Indicator

Demonstrates the streaming indicator for real-time AI-generated content, where Markdown is received incrementally.

### HTML

```html
<ch-markdown-viewer
  id="streaming-viewer"
  show-indicator
></ch-markdown-viewer>

<button id="start-btn">Start Streaming</button>
<button id="stop-btn">Stop Streaming</button>
```

### JavaScript

```js
const viewer = document.querySelector("#streaming-viewer");
let streamInterval = null;

// Simulate an AI streaming response
const fullResponse = `# Analysis Results

Based on the data provided, here are the key findings:

### Key Points

- Setting `show-indicator` to `true` displays a blinking cursor-like indicator after the last rendered element.
- The indicator automatically positions itself at the end of the deepest nested element in the rendered Markdown.
- Customize the indicator's appearance using `--ch-markdown-viewer-indicator-color`, `--ch-markdown-viewer-inline-size`, and `--ch-markdown-viewer-block-size`.
- The indicator works seamlessly with code blocks: when streaming is active inside a fenced code block, the indicator appears at the end of the code content via the inner `ch-code` component.
- Set `show-indicator` to `false` when streaming is complete to remove the blinking cursor.

## Theme Integration

Demonstrates using the built-in theme system and preventing flash of unstyled content.

### HTML

```html
<!-- With default theme -->
<ch-markdown-viewer
  id="themed-viewer"
  theme="ch-markdown-viewer"
  avoid-flash-of-unstyled-content
  value="# Themed Content

This markdown is rendered with the **default theme** applied.

### JavaScript

```js
const viewer = document.querySelector("#themed-viewer");

// Change the theme at runtime
viewer.theme = "my-other-theme";

// Disable theming entirely
viewer.theme = undefined;

// Enable raw HTML rendering in the markdown
viewer.rawHtml = true;
viewer.value = `# HTML Support

<div style="padding: 16px; background: #f0f0f0; border-radius: 4px;">
  <strong>This is raw HTML</strong> rendered inside the markdown.
</div>
`;

// Add custom extensions for additional syntax
viewer.extensions = [myCustomExtension];
```

### Key Points

- The `theme` property specifies the theme model name. When set, a `ch-theme` element is rendered inside the shadow DOM to load the theme stylesheet.
- Setting `avoid-flash-of-unstyled-content` to `true` visually hides the content until the theme stylesheet has loaded, preventing a flash of unstyled content (FOUC). Only takes effect when `theme` is set.
- When `theme` is `undefined`, no theme element is rendered and only the component's base styles apply.
- The `raw-html` property enables rendering of raw HTML blocks in the Markdown source. When `false` (default), HTML blocks are ignored.
- Custom extensions can be provided via the `extensions` property to add new syntax (tokenizer), AST mappings, and Lit renders.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

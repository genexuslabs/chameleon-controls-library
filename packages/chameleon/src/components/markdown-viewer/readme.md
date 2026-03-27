# `ch-markdown-viewer`

<p>The <code>ch-markdown-viewer</code> component renders Markdown content as rich HTML with GFM support, code highlighting, math rendering, and streaming indicators.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `avoidFlashOfUnstyledContent:  boolean`

<p>When <code>true</code>, visually hides the contents of the root node until the
theme stylesheet has loaded, preventing a flash of unstyled content.
Only takes effect when the <code>theme</code> property is set; otherwise this
property has no visible effect.</p>

**Attribute**: <code>avoid-flash-of-unstyled-content</code>

**Default**: <code>false</code>

---

### `extensions:  MarkdownViewerExtension<object>[] | undefined`

<p>Specifies an array of custom extensions to extend and customize the
rendered markdown language.
There a 3 things needed to implement an extension:</p>
<ul>
<li>A tokenizer (the heavy part of the extension).</li>
<li>A mapping between the custom token to the custom mdast nodes (pretty straightforward).</li>
<li>A render of the custom mdast nodes in Lit's <code>TemplateResult</code> (pretty straightforward).</li>
</ul>
<p>You can see an <a href="./examples/index.ts">example here</a>, which turns syntax like
<code>Some text [[ Value ]]</code> to:</p>

**Default**: <code>undefined</code>

---

### `rawHtml:  boolean`

<p>When <code>true</code>, raw HTML blocks in the Markdown source are rendered as
actual HTML elements (with sanitization). When <code>false</code>, HTML blocks
are ignored and not rendered.</p>
<p>Note: in the current version, <code>allowDangerousHtml</code> is always <code>true</code>
internally, so this flag controls whether HTML is passed through to
the rendered output.</p>

**Attribute**: <code>raw-html</code>

**Default**: <code>false</code>

---

### `renderCode:  MarkdownViewerCodeRender | undefined`

<p>Allows custom rendering of code blocks (fenced code).
When <code>undefined</code>, the default code renderer (which uses <code>ch-code</code>) is
used. Provide a custom function to render code blocks with a different
component or UI (e.g., adding copy buttons, line numbers, etc.).</p>

**Default**: <code>undefined</code>

---

### `showIndicator:  boolean`

<p>When <code>true</code>, a blinking cursor-like indicator is displayed after the
last rendered element. Useful for streaming scenarios where Markdown
content is being generated in real time (e.g., AI chat responses).</p>
<p>The indicator's appearance is controlled by the CSS custom properties
<code>--ch-markdown-viewer-indicator-color</code>, <code>--ch-markdown-viewer-inline-size</code>,
and <code>--ch-markdown-viewer-block-size</code>.</p>

**Attribute**: <code>show-indicator</code>

**Default**: <code>false</code>

---

### `theme:  ThemeModel | undefined`

<p>Specifies the theme model name to be used for rendering the control.
When set, a <code>ch-theme</code> element is rendered to load the theme stylesheet.
If <code>undefined</code>, no theme will be applied.</p>
<p>Works together with <code>avoidFlashOfUnstyledContent</code> to prevent unstyled
content from being visible before the theme loads.</p>

**Default**: <code>"ch-markdown-viewer"</code>

---

### `value:  string | undefined`

<p>Specifies the Markdown string to parse and render.
When <code>undefined</code> or empty, the component renders nothing.
If parsing fails, the error is logged to the console and the
previously rendered content is preserved.</p>

**Default**: <code>undefined</code>
</details>

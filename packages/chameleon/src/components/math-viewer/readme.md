# `ch-math-viewer`

<p>The <code>ch-math-viewer</code> component renders LaTeX math expressions as accessible, high-quality typeset mathematics using <a href="https://katex.org/">KaTeX</a>.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `displayMode: "block" | "inline"`

<p>Specifies whether to render the math in block or inline mode.</p>
<ul>
<li><code>&quot;block&quot;</code>: Renders display-style math (centered, larger, with vertical
spacing). The host element uses <code>display: block</code>.</li>
<li><code>&quot;inline&quot;</code>: Renders inline math that flows with surrounding text. The
host element uses <code>display: inline-block</code>.</li>
</ul>
<p>This property is reflected as an HTML attribute, enabling CSS selectors
like <code>:host([display-mode=&quot;inline&quot;])</code> for layout customization.</p>
<p>Individual math blocks in the <code>value</code> string may auto-detect as
block-style if they start with <code>\\[</code>, <code>$$</code>, <code>\\begin</code>, or contain
alignment operators (<code>&amp;=</code>, <code>^</code>), overriding this setting for that block.</p>

**Attribute**: <code>display-mode</code>

**Default**: <code>"block"</code>

---

### `value:  string | undefined`

<p>Specifies the LaTeX math string to render.
Multiple math blocks can be separated by blank lines (double newlines);
each block is rendered independently.</p>
<p>Delimiters (<code>$$</code>, <code>\[...\]</code>, <code>\(...\)</code>, <code>$...$</code>) are automatically
stripped before passing to KaTeX. When <code>undefined</code> or empty, the
component renders nothing.</p>

**Attribute**: <code>value</code>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `error`

<p>A <code>&lt;span&gt;</code> rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via <code>aria-description</code> and <code>title</code>.</p>
</details>

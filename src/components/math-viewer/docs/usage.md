# ch-math-viewer - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Display Mode](#display-mode)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates rendering a simple LaTeX math expression as typeset mathematics.

### HTML

```html
<!-- Quadratic formula -->
<ch-math-viewer
  value="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
></ch-math-viewer>

<!-- Euler's identity -->
<ch-math-viewer
  value="e^{i\pi} + 1 = 0"
></ch-math-viewer>

<!-- Summation notation -->
<ch-math-viewer
  value="\sum_{i=1}^{n} i = \frac{n(n+1)}{2}"
></ch-math-viewer>

<!-- Multi-paragraph math (blocks separated by blank lines) -->
<ch-math-viewer
  id="multi-block"
></ch-math-viewer>
```

### JavaScript

```js
const viewer = document.querySelector("#multi-block");

// Multiple math blocks separated by blank lines are rendered independently
viewer.value = `\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}

\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}`;
```

### Key Points

- The `value` property accepts LaTeX math syntax. Delimiters (`$$`, `\[...\]`, `\(...\)`, `$...$`) are automatically stripped before rendering.
- Multiple math blocks can be separated by blank lines (double newlines); each block is rendered independently.
- KaTeX renders both HTML and MathML output, so screen readers can read mathematical expressions natively.
- If a LaTeX expression fails to parse, the raw source text is rendered in a `<span part="error">` with the error message in `aria-description` and `title`.
- The `value` property is runtime-changeable; changing it triggers a full re-parse and re-render.

## Display Mode

Demonstrates the difference between block (display) and inline rendering modes.

### HTML

```html
<h2>Block Mode (default)</h2>
<p>The following equation is rendered as a centered block:</p>

<ch-math-viewer
  display-mode="block"
  value="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}"
></ch-math-viewer>

<h2>Inline Mode</h2>
<p>
  Einstein's famous equation
  <ch-math-viewer
    display-mode="inline"
    value="E = mc^2"
  ></ch-math-viewer>
  shows the equivalence of mass and energy. The Pythagorean theorem
  <ch-math-viewer
    display-mode="inline"
    value="a^2 + b^2 = c^2"
  ></ch-math-viewer>
  relates the sides of a right triangle.
</p>

<h2>Auto-detection</h2>
<p>Expressions starting with <code>\[</code>, <code>$$</code>, or <code>\begin</code> are auto-detected as block-style regardless of the <code>displayMode</code> property:</p>

<ch-math-viewer
  display-mode="inline"
  value="\begin{aligned}
    f(x) &= x^2 + 2x + 1 \\
         &= (x + 1)^2
  \end{aligned}"
></ch-math-viewer>
```

### JavaScript

```js
// Toggle display mode at runtime
const mathViewer = document.querySelector("ch-math-viewer");
mathViewer.displayMode = "inline"; // or "block"
```

### Key Points

- `display-mode="block"` (default) renders display-style math: centered, larger, with vertical spacing. The host element uses `display: block`.
- `display-mode="inline"` renders inline math that flows with surrounding text. The host element uses `display: inline-block`.
- The `display-mode` attribute is reflected on the host element, enabling CSS selectors like `ch-math-viewer[display-mode="inline"]`.
- Individual math blocks may auto-detect as block-style if they start with `\[`, `$$`, `\begin`, or contain alignment operators (`&=`, `^`), overriding the component-level setting for that block.
- For mixed content (text with inline equations), place `ch-math-viewer` elements with `display-mode="inline"` inside paragraph elements.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

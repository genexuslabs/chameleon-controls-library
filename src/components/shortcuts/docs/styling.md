# ch-shortcuts: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part      | Description                                                                    |
| --------- | ------------------------------------------------------------------------------ |
| `"key"`   | Each individual `<kbd>` element representing a single key in the shortcut.     |
| `"plus"`  | The "+" separator rendered between keys in a combination (e.g., Ctrl **+** S). |
| `"slash"` | The "/" separator rendered between alternative keys in a shortcut definition.  |

## Shadow DOM Layout

The component's host uses `display: contents`, meaning it does not generate a
box of its own. When the trigger key is pressed and hints are visible, the
component renders one `ch-window` per shortcut target:

```
<ch-shortcuts>
  | #shadow-root (shadow)
  |
  | <!-- Rendered for each shortcut whose selector matches a visible element -->
  | <ch-window
  |     container="<target-element>"
  |     exportparts="mask:element, main:tooltip"
  |     x-align="outside-end"
  |     y-align="inside-start">
  |   <kbd part="key">Ctrl</kbd>
  |   <span part="plus">+</span>
  |   <kbd part="key">S</kbd>
  | </ch-window>
  |
  | <!-- Alternative keys use the slash separator -->
  | <ch-window ...>
  |   <kbd part="key">Alt</kbd>
  |   <span part="plus">+</span>
  |   <kbd part="key">N</kbd>
  |   <span part="slash">/</span>
  |   <kbd part="key">M</kbd>
  | </ch-window>
</ch-shortcuts>
```

## Styling Recipes

### Dark-themed shortcut badges

Style the key badges and tooltip container for a dark UI theme:

```css
ch-shortcuts::part(tooltip) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

ch-shortcuts::part(key) {
  display: inline-block;
  padding: 2px 6px;
  font-family: inherit;
  font-size: 0.75rem;
  color: #f0f0f0;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
}

ch-shortcuts::part(plus),
ch-shortcuts::part(slash) {
  color: #888;
  font-size: 0.7rem;
}
```

### Highlighting the target element

Use the `element` exported part to draw attention to the element each shortcut
applies to while hints are visible:

```css
ch-shortcuts::part(element) {
  outline: 2px solid highlight;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Pill-shaped key badges with accent color

Render key hints as rounded pills with your application's accent color:

```css
ch-shortcuts::part(key) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 1.5em;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  background-color: var(--accent-color, #0078d4);
  border-radius: 999px;
}

ch-shortcuts::part(plus),
ch-shortcuts::part(slash) {
  color: var(--accent-color, #0078d4);
  margin-inline: 2px;
}
```

## Anti-patterns

### 1. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported by the CSS spec */
ch-shortcuts::part(tooltip) > kbd {
  color: red;
}

/* CORRECT - target the part directly */
ch-shortcuts::part(key) {
  color: red;
}
```

### 2. Styling the host with `display` other than `contents`

```css
/* INCORRECT - the component uses display: contents so it does not
   create its own box; changing this breaks tooltip positioning */
ch-shortcuts {
  display: block;
  position: relative;
}

/* CORRECT - leave the host display alone and style individual parts */
ch-shortcuts::part(tooltip) {
  background-color: white;
  border-radius: 6px;
}
```

### 3. Trying to style `<kbd>` elements via tag name

```css
/* INCORRECT - shadow DOM encapsulation prevents this from reaching
   elements inside the shadow root */
ch-shortcuts kbd {
  font-weight: bold;
}

/* CORRECT - use the exported shadow part */
ch-shortcuts::part(key) {
  font-weight: bold;
}
```

### 4. Setting dimensions on the tooltip part without `display`

```css
/* INCORRECT - the tooltip part may not have a box model that
   responds to width/height without an explicit display value */
ch-shortcuts::part(tooltip) {
  width: 120px;
}

/* CORRECT - set display to flex or block, then apply sizing */
ch-shortcuts::part(tooltip) {
  display: flex;
  min-inline-size: 120px;
}
```

## Do's and Don'ts

### Do

- Use `::part(key)` for all key-badge styling (color, background, font, border,
  padding).
- Use `::part(tooltip)` to control the overall tooltip container layout
  (`display: flex`, padding, background, border-radius).
- Use `::part(element)` to highlight target elements (outline, box-shadow) so
  users can see which element each shortcut applies to.
- Use class selectors on the host (e.g., `.my-shortcuts::part(key)`) instead of
  bare tag names for specificity and maintainability.

### Don't

- Don't chain `::part()` selectors -- use `exportparts` if you need to forward
  parts up another shadow boundary.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.)
  with `::part()`.
- Don't override `display` on the `:host` -- the component relies on
  `display: contents` for correct rendering.

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

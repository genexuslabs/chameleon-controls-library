# ch-switch: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part          | Description                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `"caption"`   | The caption (checked or unchecked) of the switch element.                                                         |
| `"checked"`   | Present in the `track`, `thumb` and `caption` parts when the control is checked (`value` === `checkedValue`).     |
| `"disabled"`  | Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).         |
| `"thumb"`     | The thumb of the switch element.                                                                                  |
| `"track"`     | The track of the switch element.                                                                                  |
| `"unchecked"` | Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`value` === `unCheckedValue`). |

## CSS Custom Properties

| Name                                            | Description                                                                                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-switch-thumb-size`                        | Specifies the size of the thumb. @default clamp(8px, 1em, 24px)                                                                   |
| `--ch-switch-thumb__checked-background-color`   | Specifies the background color of the thumb when the control is checked. @default currentColor                                    |
| `--ch-switch-thumb__state-transition-duration`  | Specifies the transition duration of the thumb when switching between states. @default 0ms                                        |
| `--ch-switch-thumb__unchecked-background-color` | Specifies the background color of the thumb when the control is unchecked. @default #b2b2b2                                       |
| `--ch-switch-track-block-size`                  | Specifies the block size of the track. @default clamp(3px, 0.5em, 16px)                                                           |
| `--ch-switch-track-inline-size`                 | Specifies the inline size of the track. @default clamp(3px, 0.5em, 16px)                                                          |
| `--ch-switch-track__checked-background-color`   | Specifies the background color of the track when the control is checked. @default color-mix(in srgb, currentColor 35%, #b2b2b2)   |
| `--ch-switch-track__unchecked-background-color` | Specifies the background color of the track when the control is unchecked. @default color-mix(in srgb, currentColor 35%, #b2b2b2) |

## Shadow DOM Layout

## Case 1: Default

```
<ch-switch>
  | #shadow-root
  | <label>
  |   <div part="track [checked | unchecked] [disabled]">
  |     <input part="thumb [checked | unchecked] [disabled]" type="checkbox" role="switch" />
  |   </div>
  |   <span part="caption [checked | unchecked] [disabled]">
  |     Caption text
  |   </span>
  | </label>
</ch-switch>
```

## Styling Recipes

### Smooth Animated Toggle

Add a sliding animation when the thumb moves between states.

```css
ch-switch {
  --ch-switch-thumb__state-transition-duration: 200ms;
}
```

### iOS-style Switch

Create a pill-shaped switch with a large, rounded track.

```css
ch-switch {
  --ch-switch-thumb-size: 28px;
  --ch-switch-track-inline-size: 52px;
  --ch-switch-track-block-size: 28px;
  --ch-switch-thumb__checked-background-color: #fff;
  --ch-switch-thumb__unchecked-background-color: #fff;
  --ch-switch-track__checked-background-color: #34c759;
  --ch-switch-track__unchecked-background-color: #e9e9eb;
  --ch-switch-thumb__state-transition-duration: 200ms;
}

ch-switch::part(thumb) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
```

### Focus Ring

Add a visible focus indicator for accessibility.

```css
ch-switch::part(thumb):focus-visible {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}
```

### Caption Color by State

Change the caption text color depending on whether the switch is on or off.

```css
ch-switch::part(caption checked) {
  color: #0078d4;
  font-weight: 600;
}

ch-switch::part(caption unchecked) {
  color: #666;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors on the host do not reflect internal checked state */
ch-switch[value="on"]::part(track) {
  background-color: green;
}

/* CORRECT - use state parts */
ch-switch::part(track checked) {
  background-color: green;
}
```

### 2. Trying to style the thumb with combinators

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-switch::part(track) > input {
  background-color: white;
}

/* CORRECT - target the thumb part directly */
ch-switch::part(thumb checked) {
  background-color: white;
}
```

### 3. Chaining ::part() through nested shadows

```css
/* INCORRECT - cannot chain ::part() selectors */
ch-theme::part(switch)::part(track) {
  background: red;
}

/* CORRECT - style the component directly */
ch-switch::part(track) {
  background: red;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-switch__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-switch::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

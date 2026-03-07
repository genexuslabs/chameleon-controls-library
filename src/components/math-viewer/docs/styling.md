# ch-math-viewer: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Successfully rendered blocks](#case-1-successfully-rendered-blocks)
  - [Case 2: Block with error](#case-2-block-with-error)

## Shadow Parts

| Part      | Description                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"error"` | A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`. |

## Shadow DOM Layout

## Case 1: Successfully rendered blocks

```
<ch-math-viewer>
  | #shadow-root
  | <!-- for each block in renderedBlocks -->
  | <div><!-- rendered KaTeX HTML --></div>
</ch-math-viewer>
```

## Case 2: Block with error

```
<ch-math-viewer>
  | #shadow-root
  | <!-- for each block in renderedBlocks -->
  | <span part="error" title="error message">
  |   Raw expression text
  | </span>
</ch-math-viewer>
```

# ch-markdown-viewer: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With value](#case-1-with-value)
  - [Case 2: No value](#case-2-no-value)

## Shadow DOM Layout

## Case 1: With value

```
<ch-markdown-viewer>
  | #shadow-root
  | <!-- when theme -->
  | <ch-theme></ch-theme>
  |
  | <ch-markdown-viewer-lit>
  |   | #shadow-root
  |   | ...rendered markdown HTML...
  | </ch-markdown-viewer-lit>
</ch-markdown-viewer>
```

## Case 2: No value

```
<ch-markdown-viewer>
  | #shadow-root
  | (empty)
</ch-markdown-viewer>
```

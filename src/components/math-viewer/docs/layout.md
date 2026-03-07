# ch-math-viewer: Shadow DOM layout

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

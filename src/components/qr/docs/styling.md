# ch-qr: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With value](#case-1-with-value)
  - [Case 2: No value](#case-2-no-value)

## Shadow DOM Layout

## Case 1: With value

```
<ch-qr role="img">
  | #shadow-root
  | <div>
  |   <!-- Canvas appended via componentDidRender -->
  | </div>
</ch-qr>
```

## Case 2: No value

```
<ch-qr>
  | #shadow-root
  | (empty)
</ch-qr>
```

# ch-qr: Shadow DOM layout

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

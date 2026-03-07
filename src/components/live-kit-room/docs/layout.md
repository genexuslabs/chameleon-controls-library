# ch-live-kit-room: Shadow DOM layout

## Case 1: Default

```
<ch-live-kit-room>
  | #shadow-root
  | <slot />
  | <!-- for each participant in participants -->
  | <audio></audio>
</ch-live-kit-room>
```

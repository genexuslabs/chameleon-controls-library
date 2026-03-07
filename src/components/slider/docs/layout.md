# ch-slider: Shadow DOM layout

## Case 1: Default

```
<ch-slider>
  | #shadow-root
  | <div class="position-absolute-wrapper">
  |   <input type="range" />
  |   <div part="track [disabled]">
  |     <div part="track__selected [disabled]"></div>
  |     <div part="track__unselected [disabled]"></div>
  |   </div>
  |   <div part="thumb [disabled]"></div>
  | </div>
</ch-slider>
```

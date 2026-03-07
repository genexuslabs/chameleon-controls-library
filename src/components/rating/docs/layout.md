# ch-rating: Shadow DOM layout

## Case 1: Default

```
<ch-rating>
  | #shadow-root
  | <div part="stars-container">
  |   <!-- for each star in maxValue -->
  |   <div part="star-container [selected | unselected | partial-selected]">
  |     <div part="star [selected | unselected | partial-selected]"></div>
  |     <input type="radio" />
  |   </div>
  | </div>
</ch-rating>
```

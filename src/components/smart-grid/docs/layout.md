# ch-smart-grid: Shadow DOM layout

## Case 1: With records and inverse loading

```
<ch-smart-grid>
  | #shadow-root
  | <ch-infinite-scroll position="top">
  |   | #shadow-root
  |   | <!-- when loadingState === "loading" -->
  |   | <slot />
  | </ch-infinite-scroll>
  | <slot name="grid-content" />
</ch-smart-grid>
```

## Case 2: With records and data provider (bottom loading)

```
<ch-smart-grid>
  | #shadow-root
  | <slot name="grid-content" />
  | <ch-infinite-scroll>
  |   | #shadow-root
  |   | <!-- when loadingState === "loading" -->
  |   | <slot />
  | </ch-infinite-scroll>
</ch-smart-grid>
```

## Case 3: Initial loading

```
<ch-smart-grid>
  | #shadow-root
  | <slot name="grid-initial-loading-placeholder" />
</ch-smart-grid>
```

## Case 4: Empty (no records, loaded)

```
<ch-smart-grid>
  | #shadow-root
  | <slot name="grid-content-empty" />
</ch-smart-grid>
```

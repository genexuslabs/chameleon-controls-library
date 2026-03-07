# ch-smart-grid: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With records and inverse loading](#case-1-with-records-and-inverse-loading)
  - [Case 2: With records and data provider (bottom loading)](#case-2-with-records-and-data-provider-bottom-loading)
  - [Case 3: Initial loading](#case-3-initial-loading)
  - [Case 4: Empty (no records, loaded)](#case-4-empty-no-records-loaded)

## Shadow DOM Layout

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

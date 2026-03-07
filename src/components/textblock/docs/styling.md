# ch-textblock: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Auto-grow mode](#case-1-auto-grow-mode)
  - [Case 2: No auto-grow, text format](#case-2-no-auto-grow-text-format)
  - [Case 3: No auto-grow, HTML format](#case-3-no-auto-grow-html-format)

## Shadow DOM Layout

## Case 1: Auto-grow mode

```
<ch-textblock role="paragraph | heading">
  | #shadow-root
  | Caption text or <slot />
</ch-textblock>
```

## Case 2: No auto-grow, text format

```
<ch-textblock role="paragraph | heading">
  | #shadow-root
  | <div class="line-measure"></div>
  | <div class="content">
  |   Caption text
  | </div>
</ch-textblock>
```

## Case 3: No auto-grow, HTML format

```
<ch-textblock role="paragraph | heading">
  | #shadow-root
  | <div class="line-measure"></div>
  | <div class="html-content">
  |   <slot />
  | </div>
</ch-textblock>
```

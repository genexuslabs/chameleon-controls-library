# ch-textblock: Shadow DOM layout

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

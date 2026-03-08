# Shadow DOM Layout Syntax

Each component has a `docs/styling.md` file that includes a Shadow DOM Layout section describing its shadow DOM structure using an ASCII-tree notation.
This document explains the syntax conventions used in those sections.

---

## File structure

The Shadow DOM Layout section in `styling.md` contains one or more **Cases**. Each case represents a significant rendering variant
(e.g. expanded vs collapsed, desktop vs mobile).

```markdown
# ch-component-name: Shadow DOM layout

## Case 1: Short description

​`
<ch-component-name>
  | #shadow-root
  | ...
</ch-component-name>
​`

## Case 2: Another variant

...
```

---

## Tree notation

Elements inside the shadow DOM are prefixed with `|` to denote they live inside
a shadow root. Nesting is expressed by indentation **after** the `|`:

```
<ch-example>
  | #shadow-root
  | <div>
  |   <span>Hello</span>
  | </div>
</ch-example>
```

When a child component has its own shadow DOM, an additional level of `|` is
introduced:

```
<ch-parent>
  | #shadow-root
  | <ch-child>
  |   | #shadow-root
  |   | <div>Internal</div>
  | </ch-child>
</ch-parent>
```

---

## `part` attribute notation

### Static parts

Always present on the element:

```
<div part="header"></div>
```

### Conditional parts — `[part]`

Applied based on a runtime condition. Enclosed in square brackets:

```
<div part="tab [disabled]"></div>
```

### Mutually exclusive parts — `[a | b]`

Only one of the listed values is active at a time:

```
<div part="panel [expanded | collapsed]"></div>
```

### Dynamic / interpolated parts — `{expression}`

The value comes from a runtime variable (model item id, language, etc.):

```
<div part="{item.id} header [disabled]"></div>
<pre part="code {language}"></pre>
```

### Conditional dynamic parts — `[{expression}]`

When a dynamic value is also conditional (only present under certain
circumstances), it is enclosed in square brackets just like any other
conditional part:

```
<button part="button [disabled] [{parts}]"></button>
```

Read as: the button always has `button`; optionally `disabled`; and optionally
a set of custom parts provided by the consumer through a `parts` property. The
`{parts}` value is a variable that the item's model passes along and the
component forwards as additional part names.

### Combined example

All notations can appear together in a single `part` attribute:

```
<button part="{item.id} tab [selected | not-selected] [disabled]"></button>
```

Read as: the button always has `{item.id}` and `tab`; it also receives either
`selected` or `not-selected`; and optionally `disabled`.

---

## Conditional rendering — `<!-- when -->`, `<!-- else -->`

Elements that are rendered only under certain conditions are preceded by a
`<!-- when condition -->` comment:

```
| <!-- when showHeader -->
| <header part="header">
|   <slot name="header" />
| </header>
```

For if/else branches, use `<!-- else -->` or `<!-- else (description) -->`:

```
| <!-- when editing -->
| <input part="item__edit-caption" />
| <!-- else -->
| Caption text
```

For if/else-if chains, use `<!-- else when condition -->`:

```
| <!-- when editing -->
| <ch-edit part="item__edit-caption"></ch-edit>
| <!-- else when caption -->
| <span part="item__caption">Caption text</span>
```

For mutually exclusive rendering variants that coexist in the same layout
diagram (e.g. a button **or** a link, depending on the item type), use
`<!-- else -->` with a descriptive label:

```
| <!-- when item.link -->
| <a part="item__action item__link">...</a>
| <!-- else (button) -->
| <button part="item__action item__button">...</button>
```

---

## Iteration — `<!-- for each -->`

When an element is rendered once per item in a collection, it is preceded by a
`<!-- for each {item} in {collection} -->` comment. The element shown below the
comment represents **one instance**:

```
| <!-- for each item in model -->
| <div part="{item.id} panel [expanded | collapsed]">
|   <slot name="{item.id}" />
| </div>
```

Without this marker, every element in the diagram is assumed to be **static**
(rendered exactly once).

---

## Slots

Slots are shown explicitly with their `name` attribute (or without it for the
default slot):

```
| <slot />
| <slot name="header" />
| <slot name="{item.id}" />
```

---

## Sub-components with shadow DOM

When a component renders a child that has its own shadow DOM, the child's
internal structure is **expanded inline** with an additional pipe level:

```
| <ch-child part="child-part">
|   | #shadow-root
|   | <div part="inner-a"></div>
|   | <div part="inner-b"></div>
| </ch-child>
```

### Part resolution for nested shadow DOM

Parts on inner elements are shown with their **final resolved names** — the
names accessible via `::part()` from the outermost consumer's perspective.
The `exportparts` attribute itself is **never shown** in diagrams; it is an
implementation detail.

Resolution rules:

- If a parent does **not** export a part, **omit** that part from the inner
  element in the diagram.
- If a parent renames a part via `exportparts` (e.g. `container:item__checkbox-container`),
  show the **renamed** name.
- If multiple shadow boundaries rename the same part, show the name from the
  **outermost** rename.

Example — `ch-tree-view-item` renders a `ch-checkbox` whose original parts
(`container`, `input`, `option`) are renamed via `exportparts` to
`item__checkbox-container`, `item__checkbox-input`, `item__checkbox-option`.
The diagram shows the full nesting with the resolved names:

```
<ch-tree-view-render>
  | #shadow-root
  | <ch-tree-view-item part="item">
  |   | #shadow-root
  |   | <button part="item__header">
  |   |   <ch-checkbox part="item__checkbox [checked | unchecked | indeterminate] [disabled]">
  |   |     | #shadow-root
  |   |     | <div part="item__checkbox-container">
  |   |     |   <input part="item__checkbox-input" type="checkbox" />
  |   |     |   <div part="item__checkbox-option"></div>
  |   |     | </div>
  |   |   </ch-checkbox>
  |   | </button>
  | </ch-tree-view-item>
</ch-tree-view-render>
```

### Light DOM exception

Elements projected via `<slot>` are in light DOM — their parts are directly
accessible without `exportparts`. The part resolution algorithm above only
applies to elements rendered inside shadow DOM.

### Always expand inline

Sub-component shadow DOM internals are **always expanded inline**. Cross-
references to other layout files (e.g. `<!-- See ch-X layout -->`) are not used,
because when a sub-component is consumed as a child, its parts are often renamed
via `exportparts`, making a reference to the original layout incorrect.

---

## Descriptive comments

Plain HTML comments (without `when`, `else`, or `for each`) are informational
labels that describe a section of the layout:

```
| <!-- Separator (between items) -->
| <hr part="separator" />
```

These have no semantic effect on the diagram; they exist only to aid
readability.


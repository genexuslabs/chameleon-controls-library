# Shadow DOM Layout Syntax

Each component has a `docs/styling.md` file that includes a Shadow DOM Layout section describing its shadow DOM structure using an ASCII-tree notation. This document explains the syntax conventions used in those sections.

---

## File structure

The Shadow DOM Layout section in `styling.md` contains one or more **Cases**. Each case represents a significant rendering variant (e.g. expanded vs collapsed, desktop vs mobile).

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

Elements inside the shadow DOM are prefixed with `|` to denote they live inside a shadow root. Nesting is expressed by indentation **after** the `|`:

```
<ch-example>
  | #shadow-root
  | <div>
  |   <span>Hello</span>
  | </div>
</ch-example>
```

When a child component has its own shadow DOM, an additional level of `|` is introduced:

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

When a dynamic value is also conditional (only present under certain circumstances), it is enclosed in square brackets just like any other conditional part:

```
<button part="button [disabled] [{parts}]"></button>
```

Read as: the button always has `button`; optionally `disabled`; and optionally a set of custom parts provided by the consumer through a `parts` property. The `{parts}` value is a variable that the item's model passes along and the component forwards as additional part names.

### Combined example

All notations can appear together in a single `part` attribute:

```
<button part="{item.id} tab [selected | not-selected] [disabled]"></button>
```

Read as: the button always has `{item.id}` and `tab`; it also receives either `selected` or `not-selected`; and optionally `disabled`.

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

For mutually exclusive rendering variants that coexist in the same layout diagram (e.g. a button **or** a link, depending on the item type), use
`<!-- else -->` with a descriptive label:

```
| <!-- when item.link -->
| <a part="item__action item__link">...</a>
| <!-- else (button) -->
| <button part="item__action item__button">...</button>
```

---

## Iteration — `<!-- for each -->`

When an element is rendered once per item in a collection, it is preceded by a `<!-- for each {item} in {collection} -->` comment. The element shown below the comment represents **one instance**:

```
| <!-- for each item in model -->
| <div part="{item.id} panel [expanded | collapsed]">
|   <slot name="{item.id}" />
| </div>
```

Without this marker, every element in the diagram is assumed to be **static** (rendered exactly once).

---

## Slots and content projection

### Slot declarations

Slots are shown explicitly with their `name` attribute (or without it for the
default slot):

```
| <slot />
| <slot name="header" />
| <slot name="{item.id}" />
```

### How content projection is shown in diagrams

When a component renders a child that has its own shadow DOM, the diagram shows both the child's **shadow tree** (its internal structure) and its **projected content** (light DOM children the parent passes in). The key visual distinction is the pipe level (`|`):

- **Shadow tree elements** have one more `|` level than the host tag.
- **Projected content** shares the same `|` level as the host tag, because it belongs to the parent's shadow DOM — not to the child's.

An empty blank line separates the shadow tree from the projected content for readability.

#### Default slot projection

Content placed inside a component without a `slot` attribute is projected into the child's default `<slot />`:

```
<ch-action-menu-render>
  | #shadow-root
  | <button part="expandable-button [expanded | collapsed] [disabled]">
  |   | #shadow-root             ← button's own shadow (if any)
  |   | ...
  |
  |   <slot />                   ← button's default slot
  | </button>
  | <ch-popover part="window">
  |   | #shadow-root
  |   | <slot />                 ← ch-popover's default slot (receives the items below)
  |
  |   <!-- for each item in model -->
  |   <ch-action-menu>           ← projected into ch-popover's <slot />
  |     | #shadow-root
  |     | ...
  |   </ch-action-menu>
  | </ch-popover>
</ch-action-menu-render>
```

In this example, `<ch-popover>` declares `<slot />` inside its shadow root.
The `<ch-action-menu>` elements are light DOM children of `<ch-popover>` — they are written by the **parent** component (`ch-action-menu-render`) and projected into that default slot. Notice they sit at the same `|` level as the `<ch-popover>` tag itself, not at the `|   |` level of the popover's shadow root.

#### Named slot projection

When a child component has named slots, the projected content includes a `slot="name"` attribute to indicate which slot receives it:

```
<ch-popover>
  | #shadow-root
  | <div part="header">
  |   <slot name="header" />     ← receives elements with slot="header"
  | </div>
  | <slot />                     ← receives elements without slot attribute
</ch-popover>
```

Elements projected into a named slot would show `slot="header"` in the diagram. Elements without a `slot` attribute land in the default `<slot />`.

#### Reading the pipe levels

A quick rule of thumb for identifying what lives where:

| Pipe level relative to host      | Meaning                                     |
| -------------------------------- | ------------------------------------------- |
| `\|   \| ...` (one level deeper) | Inside the host's **shadow DOM**            |
| `\|   ...` (same level as host)  | **Light DOM** content projected into a slot |

The blank line between the shadow root's `<slot />` and the projected children is a visual separator — it is not required by the parser but is a convention used in all layout files for clarity.

---

## Sub-components with shadow DOM

When a component renders a child that has its own shadow DOM, the child's internal structure is **expanded inline** with an additional pipe level:

```
| <ch-child part="child-part">
|   | #shadow-root
|   | <div part="inner-a"></div>
|   | <div part="inner-b"></div>
| </ch-child>
```

### Part resolution for nested shadow DOM

Parts on inner elements are shown with their **final resolved names** — the names accessible via `::part()` from the outermost consumer's perspective.
The `exportparts` attribute itself is **never shown** in diagrams; it is an implementation detail.

Resolution rules:

- If a parent does **not** export a part, **omit** that part from the inner element in the diagram.
- If a parent renames a part via `exportparts` (e.g. `container:item__checkbox-container`), show the **renamed** name.
- If multiple shadow boundaries rename the same part, show the name from the **outermost** rename.

Example — `ch-tree-view-item` renders a `ch-checkbox` whose original parts (`container`, `input`, `option`) are renamed via `exportparts` to `item__checkbox-container`, `item__checkbox-input`, `item__checkbox-option`. The diagram shows the full nesting with the resolved names:

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

Elements projected via `<slot>` are in light DOM — their parts are directly accessible without `exportparts`. The part resolution algorithm above only applies to elements rendered inside shadow DOM.

### Always expand inline

Sub-component shadow DOM internals are **always expanded inline**. Cross-references to other layout files (e.g. `<!-- See ch-X layout -->`) are not used, because when a sub-component is consumed as a child, its parts are often renamed via `exportparts`, making a reference to the original layout incorrect.

---

## Descriptive comments

Plain HTML comments (without `when`, `else`, or `for each`) are informational labels that describe a section of the layout:

```
| <!-- Separator (between items) -->
| <hr part="separator" />
```

These have no semantic effect on the diagram; they exist only to aid readability.

---

## Accessibility attributes — `role`, `aria-*`

### `id` attribute

The `id` attribute is shown in the element's tag when it is referenced by an ARIA relationship attribute (`aria-controls`, `aria-labelledby`, `aria-describedby`, etc.) on another element. This makes it clear which element the relationship points to:

```
| <h2 id="heading" part="caption">Caption text</h2>
| <button id="{item.id}" role="tab" aria-controls="panel-{item.id}" part="tab"></button>
| <div id="panel-{item.id}" role="tabpanel" aria-labelledby="{item.id}" part="panel"></div>
```

In the SVG diagram, `id` appears inside the floating tag pill:
`<h2 id="heading">`, `<div id="panel-{item.id}" role="tabpanel">`.

Only include `id` when it participates in an ARIA relationship. Omit it for elements whose `id` is purely internal (e.g. used only by JavaScript logic).

### `role` attribute

The `role` attribute is shown directly in the element's tag, just like `id` and `slot`:

```
| <div role="tablist" part="tablist"></div>
| <button role="tab" part="tab [selected]"></button>
```

In the SVG diagram, `role` appears inside the floating tag pill: `<div role="tablist">`.

### `aria-*` attributes

ARIA attributes describe the accessible state and relationships of elements. They are shown as regular HTML attributes on the element:

```
| <button id="{item.id}" role="tab" aria-selected="true" aria-controls="panel-{item.id}" part="tab"></button>
| <div id="panel-{item.id}" role="tabpanel" aria-labelledby="{item.id}" part="panel"></div>
```

In the SVG diagram, `aria-*` attributes are displayed as a separate annotation line (in blue italic) below the part names.

### Dynamic ARIA values — `{expression}`

When an ARIA value comes from a runtime variable, use the same `{expression}` syntax as dynamic parts:

```
| <button role="tab" aria-controls="{item.id}-panel" part="{item.id} tab [selected]"></button>
```

### Boolean ARIA attributes

Boolean ARIA attributes (like `aria-expanded`, `aria-disabled`) that toggle at runtime should show their "truthy" value:

```
| <button aria-expanded="true" part="header [expanded | collapsed]"></button>
```

### Conditional ARIA attributes

ARIA attributes that are only present under certain conditions follow the same `<!-- when -->` pattern as conditional rendering:

```
| <!-- when hasPopup -->
| <button aria-haspopup="dialog" part="trigger"></button>
```


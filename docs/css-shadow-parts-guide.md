# CSS Shadow Parts — Best Practices Guide

This guide covers how to style Chameleon web components from the outside using CSS Shadow Parts (`::part()`), CSS custom properties, and the `exportparts` mechanism.

## Table of contents

1. [What are Shadow Parts?](#what-are-shadow-parts)
2. [Finding available parts](#finding-available-parts)
3. [Rules and limitations](#rules-and-limitations)
   - [Allowed pseudo-classes](#allowed-pseudo-classes)
   - [Allowed pseudo-elements](#allowed-pseudo-elements)
   - [Forbidden: Structural pseudo-classes](#forbidden-structural-pseudo-classes)
   - [Cannot chain `::part()` twice](#cannot-chain-part-twice)
   - [Cannot place operators after `::part()`](#cannot-place-operators-after-part)
   - [Cannot use attribute selectors inside `::part()`](#cannot-use-attribute-selectors-inside-part)
4. [The state parts pattern](#the-state-parts-pattern-chameleon-convention)
5. [Do NOT use the tag name as a selector](#do-not-use-the-tag-name-as-a-selector)
6. [Attribute selectors on the host — last resort](#attribute-selectors-on-the-host--last-resort)
7. [The `exportparts` mechanism](#the-exportparts-mechanism)
8. [Specificity of `::part()` selectors](#specificity-of-part-selectors)
9. [Quick reference](#quick-reference)
10. [Anti-patterns summary](#anti-patterns-summary)
11. [Part names are space-delimited](#part-names-are-space-delimited)
12. [General Do's and Don'ts](#general-dos-and-donts)
13. [Pre-publish checklist](#pre-publish-checklist)

## What are Shadow Parts?

Shadow Parts are named elements inside a web component's Shadow DOM that the component author exposes for external styling. They are the **only** way to target specific internal elements from outside the shadow boundary.

```css
/* Target the "header" part of a component styled with the "accordion" class */
.accordion::part(header) {
  font-weight: bold;
}
```

## Finding available parts

Every Chameleon component documents its parts in the **Shadow Parts** table of its `readme.md`. You can also check the component's JSDoc `@part` tags in the `.tsx` source file.

Parts fall into two categories:

1. **Structural parts** — Always present on a specific DOM element (e.g., `container`, `input`, `label`).
2. **State parts** — Conditionally added to structural parts based on component state (e.g., `expanded`, `disabled`, `checked`).

---

## Rules and limitations

### Allowed pseudo-classes

You can append **non-structural** (user-action / UI-state) pseudo-classes to `::part()`:

```css
ch-edit::part(input):hover { border-color: blue; }
ch-edit::part(input):focus { outline: 2px solid blue; }
ch-edit::part(input):focus-visible { outline: 2px solid blue; }
ch-edit::part(input):active { background: #f0f0f0; }
ch-edit::part(input):focus-within { border-color: blue; }
```

> **Important**: `:disabled` and `:checked` only work on native form elements (`<input>`, `<button>`, `<select>`, etc.). They do **not** apply to `<div>` or other non-form parts — even if the component is disabled or checked. For example, `ch-checkbox::part(option)` is a decorative `<div>`, so `::part(option):checked` never matches. Use **state parts** instead:
>
> ```css
> /* INCORRECT — option is a <div>, :checked never matches */
> ch-checkbox::part(option):checked { background: green; }
>
> /* CORRECT — use the state part intersection */
> ch-checkbox::part(option checked) { background: green; }
> ```

### Allowed pseudo-elements

You can append standard pseudo-elements after `::part()`:

```css
.accordion::part(header)::before {
  content: "→ ";
}

.edit::part(input)::placeholder {
  color: gray;
  font-style: italic;
}

.accordion::part(header)::after {
  content: "▾";
}
```

### Forbidden: Structural pseudo-classes

Structural pseudo-classes are **not supported** because they would require evaluating the internal shadow tree structure, violating encapsulation:

```css
/* ALL OF THESE SILENTLY MATCH NOTHING */
ch-accordion-render::part(panel):first-child { }   /* NO */
ch-accordion-render::part(panel):last-child { }    /* NO */
ch-accordion-render::part(panel):nth-child(2) { }  /* NO */
ch-accordion-render::part(panel):nth-of-type(1) { } /* NO */
ch-accordion-render::part(panel):empty { }          /* NO */
ch-accordion-render::part(panel):only-child { }     /* NO */
```

> There is **no error** — the rule is simply ignored. This is a common source of confusion.

### Cannot chain `::part()` twice

You **cannot** pierce through nested shadow roots with consecutive `::part()` selectors:

```css
/* INVALID — matches nothing, ever */
ch-flexible-layout-render::part(tab-bar)::part(tab) { }
```

The CSS Shadow Parts spec explicitly forbids this to prevent exposing internal structural information. If a component needs to expose inner parts, it must use `exportparts` (see below).

### Cannot place operators after `::part()`

The operators ` `, `>`, `+`, and `~` after `::part()` do not work:

```css
/* ALL INVALID */
ch-accordion-render::part(section) .content { }    /* descendant */
ch-accordion-render::part(section) > .child { }    /* child */
ch-accordion-render::part(panel) + .sibling { }    /* adjacent */
ch-accordion-render::part(panel) ~ .sibling { }    /* general sibling */
```

The `::part()` selector terminates at the matched element — you cannot traverse into or around it.

### Cannot use attribute selectors inside `::part()`

The `::part()` function only accepts plain CSS identifiers:

```css
/* ALL INVALID */
ch-accordion-render::part(header[aria-expanded="true"]) { }  /* NO */
ch-accordion-render::part(.active) { }                       /* NO */
ch-accordion-render::part(#my-id) { }                        /* NO */
```

---

## The state parts pattern (Chameleon convention)

Instead of attribute selectors, Chameleon components expose **state parts** — additional part names that are dynamically added to elements based on component state.

### How it works

When an accordion item is expanded, its elements receive both the structural part AND the state part:

```html
<!-- Internal shadow DOM (you don't write this — the component does) -->
<div part="panel expanded">...</div>
<button part="header expanded">...</button>
```

### Using state parts with intersection selectors

List multiple part names inside `::part()` to target elements that have **all** of them simultaneously:

```css
/* Only matches headers that are expanded */
.accordion::part(header expanded) {
  background-color: var(--accent-color);
}

/* Only matches headers that are collapsed */
.accordion::part(header collapsed) {
  opacity: 0.8;
}

/* Only matches disabled headers */
.accordion::part(header disabled) {
  pointer-events: none;
  opacity: 0.4;
}
```

> Order does not matter: `::part(header expanded)` and `::part(expanded header)` are equivalent.

### Common Chameleon state parts

| State Part | Meaning | Used by |
|---|---|---|
| `checked` | Item is selected/on | checkbox, switch, radio-group |
| `unchecked` | Item is deselected/off | checkbox, switch, radio-group |
| `disabled` | Item is disabled | Most interactive components |
| `expanded` | Item is open/expanded | accordion, tree-view, combo-box |
| `collapsed` | Item is closed/collapsed | accordion, tree-view, combo-box |
| `selected` | Item is selected | action-list, navigation-list, tab, tree-view |
| `not-selected` | Item is not selected | action-list, navigation-list, tab, tree-view |
| `indeterminate` | Tri-state checkbox | checkbox |
| `dragging` | Item is being dragged | tab, tree-view, flexible-layout |

---

## Do NOT use the tag name as a selector

Avoid using the custom element tag name as a selector — whether for host styles or for scoping `::part()` rules:

```css
/* AVOID — tag name locks styles to one component type, prevents variants */
ch-accordion-render { }
ch-accordion-render::part(header) { }
body > main > ch-accordion-render::part(header) { }

/* PREFER — use a class on the host */
.accordion-filled::part(header) { }
.accordion-outlined::part(header) { }
```

Using a class instead of the tag name lets you define multiple independent visual variants of the same component on the same page, and makes styles portable across component types that share the same visual language.

---

## Attribute selectors on the host — last resort

Attribute selectors **do work on the host element itself** (not inside the shadow), but only for properties that are **reflected** to HTML attributes. In Stencil, a property is reflected when declared with `@Prop({ reflect: true })`.

```css
/* Works IF "disabled" is a reflected property */
ch-checkbox[disabled] {
  opacity: 0.5;
}
```

**When to use attribute selectors:**
- Only as a **last resort** when no state part exists for the condition you need
- Only when the property is reflected (native types: `string`, `number`, `boolean`)
- If the property is NOT reflected, the host application must set the HTML attribute manually instead of setting the JS property

**When NOT to use attribute selectors:**
- If a state part already exists for that state (prefer `::part(option disabled)` over `ch-checkbox[disabled]::part(option)`)
- For complex types (objects, arrays) — these are never reflected to attributes

---

## The `exportparts` mechanism

### The problem

`::part()` only reaches **one shadow level deep**. If component A contains component B (each with their own shadow root), the outer document cannot style B's parts directly.

### How `exportparts` solves this

The intermediate component re-exports inner parts via the `exportparts` HTML attribute:

```html
<!-- Inside ch-flexible-layout-render's shadow template -->
<ch-tab-render exportparts="tab, selected, not-selected, dragging"></ch-tab-render>
```

Now the outer document can target those parts using a class on the host:

```css
.flexible-layout::part(tab selected) {
  font-weight: bold;
}
```

### Renaming on export

Parts can be renamed during export to avoid naming conflicts:

```html
<ch-checkbox exportparts="input:item__checkbox-input, option:item__checkbox-option">
</ch-checkbox>
```

```css
.action-list::part(item__checkbox-option checked) { }
```

### Key limitations

1. **No wildcard exports** — `exportparts="*"` is invalid. Every part must be listed explicitly.
2. **Manual at every level** — Each intermediate shadow host must re-export. There is no automatic transitive propagation.
3. **Silent failures** — Misspelled or omitted parts simply match nothing, with no error.
4. **One-way only** — Parts flow outward (toward the outer DOM), never inward.

---

## Specificity of `::part()` selectors

The `::part()` pseudo-element contributes one pseudo-element unit to specificity:

```css
::part(header)                    /* (0, 0, 1) */
.accordion::part(header)          /* (0, 1, 1) */
.accordion.my-variant::part(header) /* (0, 2, 1) */
.accordion::part(header):hover    /* (0, 2, 1) */
```

> The identifiers inside `::part(header expanded)` contribute **zero specificity**. Using `::part(tab active)` is no more specific than `::part(tab)`.

---

## Quick reference

| Feature | Supported? | Notes |
|---|---|---|
| `:hover`, `:focus`, `:active` | Yes | Non-structural pseudo-classes |
| `:focus-visible`, `:focus-within` | Yes | |
| `:disabled`, `:checked` | Partial | Only on form-element parts (e.g., `input`). Do not work on `<div>` parts — use state parts instead |
| `:first-child`, `:nth-child()`, `:empty` | **No** | Structural — silently ignored |
| `::before`, `::after` | Yes | Append after `::part()` |
| `::placeholder` | Yes | Append after `::part()` |
| `::-webkit-scrollbar` | **No** | Vendor-prefixed — not supported |
| Chaining `::part()::part()` | **No** | Spec-prohibited |
| Operators after `::part()` (` > + ~`) | **No** | Descendant, child, adjacent, sibling — all forbidden |
| Attribute selectors inside `::part()` | **No** | Only `<ident>+` accepted |
| Multiple part names (intersection) | Yes | `::part(a b)` = both required |
| `exportparts` renaming | Yes | `internal:external` syntax |
| `exportparts="*"` wildcard | **No** | Explicitly invalid |
| Browser support | All modern | Chrome 73+, Firefox 72+, Safari 13.1+ |

---

## Anti-patterns summary

```css
/* 1. DO NOT use structural pseudo-classes */
.my-list::part(item):first-child { }          /* silently ignored */

/* 2. DO NOT chain ::part() */
.my-panel::part(button)::part(label) { }      /* never matches */

/* 3. DO NOT place operators after ::part() */
.my-card::part(body) > .child { }             /* doesn't work */

/* 4. DO NOT use attribute selectors inside ::part() */
.my-tabs::part(tab[aria-selected="true"]) { } /* invalid syntax */

/* 5. DO NOT use the tag name as a selector */
ch-accordion-render::part(header) { }         /* use a class instead */

/* 6. DO NOT use :checked/:disabled on non-form-element parts */
.my-checkbox::part(option):checked { }        /* option is a <div>, never matches */

/* 7. DO NOT assume exportparts="*" works */
<x-inner exportparts="*"></x-inner>           /* invalid */
```

```css
/* CORRECT equivalents */
.my-list::part(item first) { }                /* use state part */
.my-panel::part(button-label) { }             /* use exportparts + flat name */
.my-card::part(body-child) { }                /* expose as separate part */
.accordion::part(header expanded) { }         /* class on host + intersection selector */
.my-checkbox::part(option checked) { }        /* state part instead of :checked */
```

## Part names are space-delimited

In HTML, multiple part names are separated by **spaces** (not commas):

```html
<!-- Correct -->
<div part="tab active selected"></div>

<!-- Incorrect -->
<div part="tab,active,selected"></div>
```

In CSS, `::part(tab active)` is an **intersection** (both required), not a union. To style elements that have *either* name, use separate rules:

```css
.my-tabs::part(tab) { /* base styles */ }
.my-tabs::part(active) { /* active-only styles */ }
```

---

## General Do's and Don'ts

### Do

- **Prefer CSS custom properties over `::part()` when possible.** Custom properties cross shadow boundaries naturally, are easier to maintain, and are the component author's intended styling API.
- **Use class selectors on the host element, never tag names.** Classes enable multiple visual variants of the same component and decouple styles from implementation details.
- **Use state part intersections for conditional styling.** Write `::part(header expanded)` instead of relying on attribute selectors or `:checked`/`:disabled` pseudo-classes on non-form parts.
- **Verify part names against the component's documentation.** Misspelled parts silently match nothing — always check the Shadow Parts table in the component's `styling.md` or `readme.md`.
- **Scope styles with specific class names.** Use `.my-accordion::part(header)` rather than a bare `::part(header)` to avoid unintended matches across components.
- **Test styles in all supported states.** Check hover, focus, disabled, expanded/collapsed, checked/unchecked, and indeterminate states where applicable.

### Don't

- **Don't chain `::part()` selectors.** `::part(a)::part(b)` never matches. Use `exportparts` on intermediate components instead.
- **Don't use combinators after `::part()`.** Descendant (` `), child (`>`), adjacent (`+`), and sibling (`~`) selectors after `::part()` are not supported.
- **Don't use structural pseudo-classes with `::part()`.** `:first-child`, `:nth-child()`, `:last-child`, `:empty`, and similar selectors are silently ignored.
- **Don't use `:checked` or `:disabled` on non-form-element parts.** These pseudo-classes only work on native `<input>`, `<button>`, `<select>` elements. Use state parts instead.
- **Don't set internal CSS custom properties.** Only set properties documented with `@prop` in the component's SCSS. Internal variables are implementation details and may change without notice.
- **Don't use `exportparts="*"`.** Wildcard exports are invalid. Every part must be listed explicitly by name.

---

## Pre-publish checklist

Use this checklist before shipping CSS that styles Chameleon components.

- [ ] **No tag names as selectors** — All rules use a class on the host (`.my-variant::part(...)`) instead of the component tag name (`ch-accordion-render::part(...)`).
- [ ] **No chained `::part()`** — There are no selectors of the form `::part(a)::part(b)`. Use `exportparts` on the intermediate component instead.
- [ ] **No operators after `::part()`** — There are no descendant (` `), child (`>`), adjacent (`+`), or sibling (`~`) operators after a `::part()` selector.
- [ ] **No attribute selectors inside `::part()`** — `::part()` contains only plain identifiers, never `[attr]`, `.class`, or `#id`.
- [ ] **No structural pseudo-classes on parts** — Rules do not use `:first-child`, `:last-child`, `:nth-child()`, `:nth-of-type()`, `:empty`, `:only-child`, etc. after `::part()`.
- [ ] **`:disabled` / `:checked` only on form-element parts** — These pseudo-classes are not applied to `<div>` or other non-form parts. State parts (e.g., `::part(option checked)`) are used instead.
- [ ] **State parts preferred over attribute selectors** — When a state part exists for a condition (e.g., `disabled`, `checked`, `expanded`), it is used instead of an attribute selector on the host.
- [ ] **Attribute selectors only on reflected properties** — Any host attribute selector (e.g., `[disabled]`) targets a property declared with `@Prop({ reflect: true })`.
- [ ] **No `exportparts="*"`** — Every re-exported part is listed explicitly by name.
- [ ] **Part names verified** — All part names used in CSS exist in the component's documented parts (check `readme.md` or `@part` JSDoc tags).
- [ ] **Internal CSS custom properties not set** — Only CSS custom properties documented with `@prop` in the component's `.scss` are assigned from outside. Internal vars (without `@prop`) are not touched.

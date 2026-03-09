# ch-action-menu-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Nested Sub-Menus](#nested-sub-menus)
- [Menu Positioning](#menu-positioning)
- [Menu with Icons](#menu-with-icons)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple dropdown menu with button items.

### HTML

```html
<ch-action-menu-render
  button-accessible-name="File actions"
>
  Actions &#9662;
</ch-action-menu-render>
```

### JavaScript

```js
const menu = document.querySelector("ch-action-menu-render");

menu.model = [
  { caption: "Edit", type: "actionable" },
  { caption: "Duplicate", type: "actionable" },
  { type: "separator" },
  { caption: "Delete", type: "actionable" }
];

menu.addEventListener("buttonClick", (event) => {
  const item = event.detail;
  console.log("Action:", item.caption);
});
```

### Key Points

- The default slot provides the content of the trigger button. Use text, icons, or both.
- The `buttonAccessibleName` property is important for accessibility: it sets the `aria-label` on the trigger button.
- The `model` property accepts an array of `ActionMenuItemModel` objects. Items with `type: "actionable"` render as buttons; `type: "separator"` renders a horizontal divider.
- The `buttonClick` event fires when a leaf button item is clicked. Its `detail` contains the full item model.
- The dropdown auto-closes when a leaf item is clicked or when clicking outside the menu.

## Nested Sub-Menus

Demonstrates a dropdown menu with deeply nested sub-menus.

### HTML

```html
<ch-action-menu-render
  button-accessible-name="Insert"
>
  Insert &#9662;
</ch-action-menu-render>
```

### JavaScript

```js
const menu = document.querySelector("ch-action-menu-render");

menu.model = [
  { caption: "Text", type: "actionable" },
  {
    caption: "Image",
    type: "actionable",
    items: [
      { caption: "From file...", type: "actionable" },
      { caption: "From URL...", type: "actionable" },
      { caption: "From clipboard", type: "actionable" }
    ]
  },
  {
    caption: "Table",
    type: "actionable",
    items: [
      { caption: "2x2", type: "actionable" },
      { caption: "3x3", type: "actionable" },
      {
        caption: "Custom...",
        type: "actionable",
        items: [
          { caption: "Rows and columns", type: "actionable" },
          { caption: "From template", type: "actionable" }
        ]
      }
    ]
  },
  { type: "separator" },
  { caption: "Horizontal line", type: "actionable" }
];

menu.addEventListener("buttonClick", (event) => {
  console.log("Insert:", event.detail.caption);
});
```

### Key Points

- Add an `items` array to any actionable item to create a sub-menu. Nesting can go to any depth.
- Sub-menus expand on mouse hover and collapse when the mouse leaves.
- Keyboard navigation: ArrowRight opens a sub-menu, ArrowLeft closes it, ArrowUp/ArrowDown navigate within a level.
- The `expandedItemChange` event fires whenever a sub-menu opens or closes, providing the item and its new `expanded` state.

## Menu Positioning

Demonstrates different alignment options for the dropdown menu relative to its trigger button.

### HTML

```html
<!-- Default: below the button, centered horizontally -->
<ch-action-menu-render
  button-accessible-name="Default positioning"
  block-align="outside-end"
  inline-align="center"
>
  Default &#9662;
</ch-action-menu-render>

<!-- Right-aligned, below the button -->
<ch-action-menu-render
  button-accessible-name="Right aligned"
  block-align="outside-end"
  inline-align="inside-end"
>
  Right &#9662;
</ch-action-menu-render>

<!-- Dropdown opens above the button -->
<ch-action-menu-render
  button-accessible-name="Above"
  block-align="outside-start"
  inline-align="center"
>
  Above &#9662;
</ch-action-menu-render>

<!-- With overflow protection -->
<ch-action-menu-render
  button-accessible-name="Auto-flip"
  block-align="outside-end"
  inline-align="inside-start"
  position-try="flip-block"
>
  Auto-flip &#9662;
</ch-action-menu-render>
```

### JavaScript

```js
// All menus share the same model
document.querySelectorAll("ch-action-menu-render").forEach(menu => {
  menu.model = [
    { caption: "Option A", type: "actionable" },
    { caption: "Option B", type: "actionable" },
    { caption: "Option C", type: "actionable" }
  ];
});
```

### Key Points

- `blockAlign` controls the vertical position: `"outside-end"` (below), `"outside-start"` (above), `"inside-start"`, `"center"`, `"inside-end"`.
- `inlineAlign` controls the horizontal position: `"inside-start"` (left-aligned), `"center"`, `"inside-end"` (right-aligned), `"outside-start"`, `"outside-end"`.
- Set `positionTry="flip-block"` to automatically flip the menu to the opposite side when it would overflow the viewport.
- Sub-menus default to `itemsInlineAlign="outside-end"` (opening to the right), configurable per-item via `itemsInlineAlign` and `itemsBlockAlign`.

## Menu with Icons

Demonstrates menu items with start images and keyboard shortcuts.

### HTML

```html
<ch-action-menu-render
  button-accessible-name="Edit menu"
>
  Edit &#9662;
</ch-action-menu-render>
```

### JavaScript

```js
const menu = document.querySelector("ch-action-menu-render");

menu.model = [
  {
    caption: "Cut",
    type: "actionable",
    shortcut: "Ctrl+X",
    startImgSrc: "url('icons/cut.svg')",
    startImgType: "background"
  },
  {
    caption: "Copy",
    type: "actionable",
    shortcut: "Ctrl+C",
    startImgSrc: "url('icons/copy.svg')",
    startImgType: "background"
  },
  {
    caption: "Paste",
    type: "actionable",
    shortcut: "Ctrl+V",
    startImgSrc: "url('icons/paste.svg')",
    startImgType: "background"
  },
  { type: "separator" },
  {
    caption: "Select All",
    type: "actionable",
    shortcut: "Ctrl+A"
  }
];

menu.addEventListener("buttonClick", (event) => {
  console.log("Action:", event.detail.caption);
});
```

### Key Points

- Set `startImgSrc` and `startImgType` on an item to render an icon at the start of the menu row. Use `endImgSrc`/`endImgType` for icons at the end.
- The `shortcut` property renders a keyboard shortcut label at the trailing edge of the row. This is purely visual; you must implement the actual keyboard shortcut handler separately.
- Control icon sizes with `--ch-action-menu-item__image-size` and `--ch-action-menu-item__background-image-size`.
- Items can also be hyperlinks by providing a `link` property with a `url`. In that case, `hyperlinkClick` fires instead of `buttonClick`.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't place a `<button>` inside the default slot — the trigger is already rendered as a `<button>` internally, so nesting another `<button>` produces invalid HTML and breaks accessibility. Use a `<span>`, `<div>`, or plain text instead.
- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

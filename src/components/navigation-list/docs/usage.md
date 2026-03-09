# ch-navigation-list-render - Usage

## Table of Contents

- [Sizing Behavior](#sizing-behavior)
- [Basic Usage](#basic-usage)
- [Nested Navigation](#nested-navigation)
- [Navigation with Icons](#navigation-with-icons)
- [Selected Link Styling](#selected-link-styling)
- [Do's and Don'ts](#dos-and-donts)

> **Sizing behavior:** `ch-navigation-list-render` uses `contain: strict` when `autoGrow = false` (the default), which means it does **not** contribute to its parent's intrinsic size. The parent must establish its own size through layout. If the parent has no size, the component will be invisible.
>
> Set `autoGrow` to `true` to let the component size to its content, or place the component inside a grid or flex container that already has a defined size:
>
> ```css
> /* Recommended: parent establishes its own size via layout */
> .my-layout {
>   display: grid;
>   grid-template-rows: auto 1fr; /* component goes in the 1fr row */
> }
> ```

## Basic Usage

Demonstrates a simple navigation list with flat hyperlink items.

### HTML

```html
<ch-navigation-list-render
  selected-link-indicator
></ch-navigation-list-render>
```

### JavaScript

```js
const navList = document.querySelector("ch-navigation-list-render");

navList.model = [
  { id: "home", caption: "Home", link: { url: "/home" } },
  { id: "projects", caption: "Projects", link: { url: "/projects" } },
  { id: "settings", caption: "Settings", link: { url: "/settings" } }
];

navList.selectedLink = { id: "home", link: { url: "/home" } };

navList.addEventListener("hyperlinkClick", (event) => {
  event.preventDefault();
  const { item } = event.detail;
  console.log("Navigate to:", item.link.url);
  navList.selectedLink = { id: item.id, link: item.link };
});
```

### Key Points

- The `model` property accepts an array of `NavigationListItemModel` objects, each with an `id`, `caption`, and optional `link`.
- Set `selectedLink` to highlight the currently active navigation item.
- The `selectedLinkIndicator` attribute renders a visual indicator next to the active item.
- Listen to `hyperlinkClick` and call `event.preventDefault()` to handle client-side routing instead of native navigation.

## Nested Navigation

Demonstrates a navigation list with expandable sub-items to represent hierarchical sections.

### HTML

```html
<ch-navigation-list-render
  expandable-button="decorative"
  expandable-button-position="start"
  selected-link-indicator
></ch-navigation-list-render>
```

### JavaScript

```js
const navList = document.querySelector("ch-navigation-list-render");

navList.model = [
  { id: "home", caption: "Home", link: { url: "/home" } },
  {
    id: "products",
    caption: "Products",
    expanded: true,
    items: [
      { id: "catalog", caption: "Catalog", link: { url: "/products/catalog" } },
      { id: "pricing", caption: "Pricing", link: { url: "/products/pricing" } }
    ]
  },
  {
    id: "support",
    caption: "Support",
    expanded: false,
    items: [
      { id: "docs", caption: "Documentation", link: { url: "/support/docs" } },
      { id: "contact", caption: "Contact Us", link: { url: "/support/contact" } }
    ]
  }
];
```

### Key Points

- Nest items by providing an `items` array on a parent item. Any nesting depth is supported.
- The `expanded` property on a parent item controls whether its children are initially visible.
- `expandableButton="decorative"` shows a visual expand/collapse indicator but the entire row is the click target.
- `expandableButtonPosition` controls whether the expand icon appears at `"start"` or `"end"` of the row.
- Clicking a parent item toggles its `expanded` state automatically.

## Navigation with Icons

Demonstrates navigation items with start images (icons) displayed alongside the caption.

### HTML

```html
<ch-navigation-list-render
  selected-link-indicator
></ch-navigation-list-render>
```

### JavaScript

```js
const navList = document.querySelector("ch-navigation-list-render");

navList.model = [
  {
    id: "dashboard",
    caption: "Dashboard",
    link: { url: "/dashboard" },
    startImgSrc: "url('icons/dashboard.svg')",
    startImgType: "background"
  },
  {
    id: "analytics",
    caption: "Analytics",
    link: { url: "/analytics" },
    startImgSrc: "url('icons/analytics.svg')",
    startImgType: "background"
  },
  {
    id: "users",
    caption: "Users",
    link: { url: "/users" },
    startImgSrc: "url('icons/users.svg')",
    startImgType: "background"
  }
];
```

### Key Points

- Set `startImgSrc` on each item to display an icon before the caption.
- Use `startImgType: "background"` for CSS background images (most common). This expects a `url()` value.
- Control the icon box size with `--ch-navigation-list-item__image-size` and the actual image size with `--ch-navigation-list-item__background-image-size`.
- Adjust spacing between the icon and caption with `--ch-navigation-list-item-gap`.

## Selected Link Styling

Demonstrates how to style the selected link indicator and synchronize it with client-side routing.

### HTML

```html
<ch-navigation-list-render
  selected-link-indicator
  expand-selected-link
></ch-navigation-list-render>
```

### JavaScript

```js
const navList = document.querySelector("ch-navigation-list-render");

navList.model = [
  { id: "overview", caption: "Overview", link: { url: "/overview" } },
  {
    id: "reports",
    caption: "Reports",
    expanded: false,
    items: [
      { id: "monthly", caption: "Monthly", link: { url: "/reports/monthly" } },
      { id: "annual", caption: "Annual", link: { url: "/reports/annual" } }
    ]
  }
];

// Programmatically select a nested link — ancestors will auto-expand
navList.selectedLink = { id: "monthly", link: { url: "/reports/monthly" } };

navList.addEventListener("hyperlinkClick", (event) => {
  event.preventDefault();
  const { item } = event.detail;
  history.pushState(null, "", item.link.url);
  navList.selectedLink = { id: item.id, link: item.link };
});
```

### Key Points

- `selectedLinkIndicator` renders a visual bar next to the active item. Style it with `::part(indicator)`.
- `expandSelectedLink` automatically expands ancestor items when `selectedLink` is programmatically set to a nested item.
- Use `::part(item__link selected)` and `::part(item__link not-selected)` to differentiate between active and inactive links.
- Combine with `history.pushState` for SPA routing while keeping the navigation state in sync.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

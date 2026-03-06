# Icons and Images Implementation Guide

Choosing the right technique to display an icon or image depends on one key question: **does the image carry semantic meaning, or is it purely decorative?** This distinction drives every implementation decision — from which HTML element to use, to how the image interacts with the accessibility tree.

## Table of Contents

- [Semantic Images](#semantic-images)
  - [Implementation](#implementation)
  - [`loading` attribute](#loading-attribute)
  - [`decoding` attribute](#decoding-attribute)
- [Decorative Images](#decorative-images)
  - [Option A: CSS pseudo-element (recommended for icons)](#option-a-css-pseudo-element-recommended-for-icons)
  - [Option B: Element with `background-image`](#option-b-element-with-background-image)
  - [Option C: `<img>` with empty `alt`](#option-c-img-with-empty-alt)
- [Image Formats](#image-formats)
- [Image Sizing](#image-sizing)
  - [Why it matters](#why-it-matters)
  - [How to define the size](#how-to-define-the-size)
- [CSS `mask-image` for Monochromatic Icons](#css-mask-image-for-monochromatic-icons)
  - [How it works](#how-it-works)
  - [Key properties](#key-properties)
  - [Browser support](#browser-support)
  - [Single-color limitation (and why it is an advantage)](#single-color-limitation-and-why-it-is-an-advantage)
  - [`background-image` vs `mask-image`](#background-image-vs-mask-image)
- [Responsive Images with `<picture>`](#responsive-images-with-picture)
  - [Key attributes on `<source>`](#key-attributes-on-source)
  - [Example: responsive logo with format negotiation](#example-responsive-logo-with-format-negotiation)
  - [Example: art direction (different crops)](#example-art-direction-different-crops)
  - [Best practices](#best-practices)
- [Avoid Inlining SVG Directly in the DOM](#avoid-inlining-svg-directly-in-the-dom)
- [Chameleon: The `ch-image` Component](#chameleon-the-ch-image-component)
  - [Key properties](#key-properties-1)
  - [Rendering modes](#rendering-modes)
  - [`getImagePathCallback` (optional)](#getimagepathcallback-optional)
  - [Multi-state icons](#multi-state-icons)
  - [Example](#example)
- [Chameleon: `startImgSrc` / `endImgSrc` in Components](#chameleon-startimgsrc--endimgsrc-in-components)
- [Chameleon: Global Icon Resolution with the Registry](#chameleon-global-icon-resolution-with-the-registry)

## Semantic Images

A semantic image conveys meaning that a user (or screen reader) needs to understand the page. Examples: a company logo, a product photo, a chart, or any image whose absence would reduce the content's meaning.

### Implementation

Use the `<img>` tag with a descriptive `alt` attribute:

```html
<img
  src="assets/company-logo.svg"
  alt="Acme Corp"
  loading="eager"
  decoding="sync"
/>
```

### `loading` attribute

| Value   | Use when                                                                                                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eager` | The image is a company logo in the header, a hero image, or any element of high importance for the initial page load. This is the **default value** — when the attribute is omitted, the browser loads the image immediately. |
| `lazy`  | The image is below the fold or not critical for the first render. The browser defers fetching until it approaches the viewport, which saves bandwidth and speeds up the initial load.                                         |

> **Recommendation:** When in doubt, use `loading="lazy"`. Most images in an application are not critical for the initial render, and lazy loading saves bandwidth and improves load times. Reserve `loading="eager"` (or simply omit the attribute) only for images that are essential in the first paint — such as a company logo in the header or a hero banner.

### `decoding` attribute

The `decoding` attribute hints to the browser **how** to decode the image once it has been fetched. It is independent from `loading`, which controls **when** the image is fetched.

| Value   | Behavior                                                                                                       | Use when                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `sync`  | Decoding blocks rendering — the image appears together with surrounding content, with no flash of empty space. | Above-the-fold images, hero banners, logos — anywhere a blank placeholder flash would be jarring. |
| `async` | Decoding happens off the main thread. The browser continues rendering and paints the image when ready.         | Below-the-fold images, carousels, galleries — anywhere a brief placeholder is acceptable.         |
| `auto`  | The browser decides. Behavior varies across browsers and versions.                                             | When you have no specific requirement. This is the default when the attribute is omitted.         |

Common pairings:

```html
<!-- Above the fold: fetch immediately, decode synchronously -->
<img src="hero.jpg" alt="..." loading="eager" decoding="sync" />

<!-- Below the fold: defer fetch, decode asynchronously -->
<img src="photo.jpg" alt="..." loading="lazy" decoding="async" />
```

> **Note:** `loading` and `fetchpriority` have a much greater impact on Core Web Vitals (especially LCP) than `decoding`. Treat `decoding` as a fine-tuning hint, not a primary performance lever.

## Decorative Images

A decorative image exists only to embellish the UI — its absence would not change the content's meaning. Most icons in an application fall into this category.

There are three approaches, listed from lightest to heaviest:

### Option A: CSS pseudo-element (recommended for icons)

The lightest approach. A `::before` or `::after` pseudo-element does not create a real DOM node, making it significantly cheaper to render than an `<img>` tag or even a `<div>`.

```css
.icon-settings::before {
  content: "";
  display: inline-block;
  width: 24px;
  height: 24px;
  background: no-repeat center / contain url("assets/icons/settings.svg");
}
```

> **Caveat:** The pseudo-element inherits layout constraints from its parent. Make sure the parent element's `display`, `position`, and overflow properties allow the pseudo-element to render at the intended size and position.

### Option B: Element with `background-image`

Use when you need a real DOM element (e.g., for JavaScript event handling or complex positioning):

```html
<div class="decorative-banner" aria-hidden="true"></div>
```

```css
.decorative-banner {
  background: no-repeat center / cover url("assets/banner.webp");
  width: 100%;
  height: 200px;
}
```

### Option C: `<img>` with empty `alt`

Use only when the image format or tooling requires an `<img>` tag:

```html
<img
  src="assets/divider.png"
  alt=""
  aria-hidden="true"
  loading="lazy"
  decoding="async"
/>
```

The empty `alt=""` prevents web crawlers from indexing and searching the image. The `aria-hidden="true"` removes the image from the accessibility tree, making it invisible to screen readers.

## Image Formats

| Format         | Type       | Typical usage                                                                                                                    |
| -------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PNG, WebP, JPG | Rasterized | Photos, screenshots, complex graphics. More likely to be semantic, though not always.                                            |
| SVG            | Vector     | Icons, logos, illustrations. Scales to any resolution. More likely to be decorative, though logos often need semantic treatment. |

A common case: a company logo is created as SVG for resolution independence, but because it is a logo it should be semantic (`<img>` with a meaningful `alt`). Conversely, many rasterized images are exported in PNG/WebP simply because that is the only available format, even though they are purely decorative.

## Image Sizing

All images and icons should have a **defined size**. Without explicit dimensions, images can stretch beyond their intended size, overflow their parent container, and cause layout shifts during loading.

### Why it matters

- **Prevents stretching:** An image without constraints will render at its intrinsic size, which may be larger than intended.
- **Prevents overflow:** Without a defined size, large images can break out of their parent container.
- **Avoids CLS (Cumulative Layout Shift):** When the browser doesn't know the image dimensions before loading, the layout shifts once the image arrives. This degrades both Core Web Vitals scores and the user experience.
- **Improves performance:** Both initial load and runtime benefit from stable, predictable layouts.

### How to define the size

There are several ways to ensure an image has a defined size:

1. **Explicit dimensions on the element** — Use `inline-size` / `block-size` (or `width` / `height`) in CSS, or the `width` and `height` HTML attributes on `<img>`:

   ```css
   .icon {
     inline-size: 24px;
     block-size: 24px;
   }
   ```

   ```html
   <img src="photo.jpg" alt="..." width="800" height="600" />
   ```

2. **Parent layout constraints** — If the image is inside a flex or grid container that defines the item's size, the image inherits those constraints. Make sure the image respects them (e.g., via `max-inline-size: 100%`).

3. **CSS custom properties** — When using `ch-image`, the component exposes `--ch-image-background-size` for controlling the rendered size of the icon within the element.

> **Rule of thumb:** If you can't immediately tell what size an image will render at by looking at the code, add explicit dimensions.

## CSS `mask-image` for Monochromatic Icons

When an icon is monochromatic and needs to adapt its color dynamically (e.g., based on theme, color scheme, pseudo-state, or inherited text color), `mask-image` is the ideal technique.

### How it works

The SVG acts as a **stencil**: its opaque pixels reveal the element's `background-color`, and its transparent pixels hide it. The icon itself carries no color — the color comes entirely from CSS.

```css
.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: currentColor; /* inherits text color */

  -webkit-mask: no-repeat center / contain url("assets/icons/settings.svg");
  mask: no-repeat center / contain url("assets/icons/settings.svg");
}
```

### Key properties

| Property        | Description                                           | Typical value                   |
| --------------- | ----------------------------------------------------- | ------------------------------- |
| `mask-image`    | The mask source (SVG, image, or gradient)             | `url("icon.svg")`               |
| `mask-size`     | Size of the mask layer (works like `background-size`) | `contain`, `cover`, `24px 24px` |
| `mask-repeat`   | Whether the mask repeats                              | `no-repeat`                     |
| `mask-position` | Position within the element                           | `center`                        |

### Browser support

CSS Masks are **Baseline Newly Available** (~96% global coverage). However, **always include the `-webkit-` prefix** alongside the unprefixed version for Safari and older WebKit/Blink browsers:

```css
.icon {
  -webkit-mask-image: url("icon.svg");
  mask-image: url("icon.svg");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}
```

Or use the shorthand:

```css
.icon {
  -webkit-mask: no-repeat center / contain url("icon.svg");
  mask: no-repeat center / contain url("icon.svg");
}
```

### Single-color limitation (and why it is an advantage)

The mask technique only supports **one color** — the element's `background-color`. This is a limitation for multi-color images, but it is a powerful advantage for icon systems:

- **Theming:** Change `background-color` or `color` (via `currentColor`) and the icon updates automatically.
- **Pseudo-states:** No need to swap image files for hover, focus, or active states — just change the color.
- **Dark/light mode:** The icon adapts to the color scheme via CSS variables or `currentColor`.
- **No extra assets:** One SVG file serves all color variants.

### `background-image` vs `mask-image`

| Aspect                  | `background-image`         | `mask-image`                                 |
| ----------------------- | -------------------------- | -------------------------------------------- |
| Color source            | Embedded in the image file | `background-color` of the element            |
| Multi-color support     | Yes                        | No (single color only)                       |
| Runtime color change    | Must swap image file       | Change `background-color` or `color`         |
| Theming / dynamic color | Difficult                  | Trivial with CSS variables or `currentColor` |
| Use case                | Full-color images, photos  | Monochromatic icons, themeable icons         |

## Responsive Images with `<picture>`

When an image must change based on screen size, pixel density, or format support, the `<picture>` element provides art direction and format negotiation.

### How it works

The browser evaluates each `<source>` in document order and picks the **first match**. If none match, it uses the `<img>` fallback.

### Key attributes on `<source>`

| Attribute | Purpose                                                         | Example                           |
| --------- | --------------------------------------------------------------- | --------------------------------- |
| `media`   | Media condition for art direction                               | `(min-width: 768px)`              |
| `srcset`  | Image candidates with width (`w`) or density (`x`) descriptors  | `logo.png 1x, logo@2x.png 2x`     |
| `type`    | MIME type for format negotiation                                | `image/avif`, `image/webp`        |
| `sizes`   | How wide the image will display (required with `w` descriptors) | `(max-width: 600px) 400px, 800px` |

### Example: responsive logo with format negotiation

```html
<picture class="logo">
  <!-- Modern format for desktop -->
  <source
    media="(min-width: 768.1px)"
    srcset="assets/logo-desktop.avif"
    type="image/avif"
  />
  <source
    media="(min-width: 768.1px)"
    srcset="assets/logo-desktop.webp"
    type="image/webp"
  />
  <source media="(min-width: 768.1px)" srcset="assets/logo-desktop.png" />

  <!-- Modern format for mobile -->
  <source srcset="assets/logo-mobile.avif" type="image/avif" />
  <source srcset="assets/logo-mobile.webp" type="image/webp" />

  <!-- Fallback -->
  <img
    src="assets/logo-mobile.png"
    alt="Company Logo"
    loading="eager"
    decoding="sync"
    width="200"
    height="60"
  />
</picture>
```

### Example: art direction (different crops)

```html
<picture>
  <!-- Wide landscape crop for desktop -->
  <source media="(min-width: 1024px)" srcset="hero-wide.jpg" />

  <!-- Square crop for tablet -->
  <source media="(min-width: 600px)" srcset="hero-square.jpg" />

  <!-- Tall portrait crop for mobile -->
  <img
    src="hero-portrait.jpg"
    alt="Hero image"
    loading="eager"
    decoding="sync"
  />
</picture>
```

### Best practices

- Always include `<img>` as the last child — it is mandatory and serves as the universal fallback.
- Set `alt`, `width`, `height`, `loading`, and `decoding` on `<img>`, not on `<picture>` or `<source>`.
- Order `<source>` elements from most specific to least specific — the browser picks the first match.
- List modern formats first (AVIF → WebP → JPEG/PNG) when using `type`.
- Use `sizes` alongside `w` descriptors so the browser can choose the right image before layout.
- Use `<picture>` for art direction or format negotiation. For simple resolution switching, prefer `<img srcset sizes>` directly.

## Avoid Inlining SVG Directly in the DOM

Rendering an SVG by embedding its markup directly in the HTML (i.e., placing `<svg>` elements in the DOM) is **not recommended**. The browser must parse, layout, and paint every SVG node as a DOM element, which is significantly more expensive than rendering an image via `background-image`, `mask-image`, or `<img>`.

**Always prefer:**

1. `background-image` or `mask-image` — for decorative icons.
2. `<img>` — for semantic images.
3. `ch-image` — for Chameleon design system icons (see below).

**Exceptions where inline SVG is acceptable:**

- The SVG uses **CSS custom properties** defined in the DOM (e.g., `fill: var(--icon-color)`), and these cannot be applied through other means.
- The SVG elements need to be **animated via DOM manipulation** (e.g., SMIL or JavaScript-driven animations on individual paths).

In these cases, inline SVG is justified because the functionality requires DOM access.

## Chameleon: The `ch-image` Component

Chameleon provides the `ch-image` component for rendering decorative icons with built-in multi-state support (base, hover, active, focus, disabled).

### Key properties

| Property               | Type                                 | Description                                                                   |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| `src`                  | `string`                             | The image source key or path. Resolved by `getImagePathCallback` if provided. |
| `type`                 | `"background" \| "mask"`             | Rendering mode. Default: `"background"`.                                      |
| `getImagePathCallback` | `(src: string) => GxImageMultiState` | Callback that resolves the `src` into state-variant URLs.                     |
| `disabled`             | `boolean`                            | Whether the icon should render in its disabled state.                         |

### Rendering modes

- **`"background"`**: Renders the image as-is using `background-image`. Supports full-color images.
- **`"mask"`**: Renders the icon using `mask-image` with `background-color: currentColor`. The icon becomes monochromatic and inherits the text color, making it ideal for themeable icon systems.

### `getImagePathCallback` (optional)

The `getImagePathCallback` is **not mandatory**. Without it, `src` is used directly as the image path — you can pass a full URL or file path and it will work as-is.

When provided, the callback resolves a short key (e.g., `"settings"`) into a `GxImageMultiState` object, which is its main value: it masks the underlying file path and enables multi-state icon support. This is especially useful when building a design system where icon paths follow a convention that shouldn't be exposed to consumers.

A common pattern is to implement a fallback in the resolver: if the key is not found in the design system's icon set, return the raw `src` as the `base` path. This way, custom icons outside the design system can still be used by passing a full path:

```typescript
const myResolver = (src: string): GxImageMultiState => {
  const designSystemIcon = designSystemIcons[src];

  // If the icon is in the design system, return its multi-state paths
  if (designSystemIcon) {
    return designSystemIcon;
  }

  // Otherwise, treat src as a direct path (supports custom icons)
  return { base: src };
};
```

### Multi-state icons

The `GxImageMultiState` object represents the different visual states of an icon:

```typescript
interface GxImageMultiState {
  base: string; // Default state
  hover?: string; // On hover
  active?: string; // On click/press
  focus?: string; // On focus
  disabled?: string; // When disabled
  selected?: string; // When selected
}
```

The component tracks the parent element's state via a `data-ch-image` attribute and swaps images through CSS custom properties.

### Example

```html
<ch-image
  src="settings"
  type="mask"
  getImagePathCallback="{myResolver}"
></ch-image>
```

```typescript
const myResolver = (src: string): GxImageMultiState => ({
  base: `assets/icons/${src}.svg`,
  hover: `assets/icons/${src}-hover.svg`,
  disabled: `assets/icons/${src}-disabled.svg`
});
```

## Chameleon: `startImgSrc` / `endImgSrc` in Components

Many Chameleon components support icon rendering in their item models through `startImgSrc` and `endImgSrc` properties:

```typescript
// Example: ComboBox item model
const item: ComboBoxItemModel = {
  caption: "Settings",
  startImgSrc: "settings-icon",
  startImgType: "mask", // "background" | "mask"
  endImgSrc: "arrow-right",
  endImgType: "background"
};
```

- **`start`** icons appear at the leading edge of the item (typically left in LTR layouts).
- **`end`** icons appear at the trailing edge.
- Each direction supports its own `type` (`"background"` or `"mask"`).

The component resolves these through its `getImagePathCallback`, which can be set per-instance or globally via the registry. Some components (like `ch-accordion-render`) only support `start`; others (like `ch-combo-box-render`) support both `start` and `end`.

## Chameleon: Global Icon Resolution with the Registry

Instead of binding `getImagePathCallback` to every component instance, Chameleon's **registry system** lets you register a resolver globally. This is especially recommended when building a design system on top of Chameleon.

See the full documentation in [Registry Property System](registry.md).

Quick example:

```typescript
import { registryProperty } from "@genexus/chameleon-controls-library/dist/collection/index";

// Register a global resolver for all components
registryProperty("getImagePathCallback", {
  "ch-accordion-render": src => ({ base: `icons/${src}.svg` }),
  "ch-combo-box-render": (item, direction) => ({
    base: `icons/${
      item[direction === "start" ? "startImgSrc" : "endImgSrc"]
    }.svg`
  }),
  "ch-image": src => ({ base: `icons/${src}.svg` })
  // ... other components
});
```

This removes the need to pass `getImagePathCallback` as a prop on every component instance, centralizes icon resolution logic, and allows using simple icon keys (e.g., `"settings"`) instead of full file paths.


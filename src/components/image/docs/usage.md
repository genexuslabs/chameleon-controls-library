# ch-image - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Mask Mode with currentColor](#mask-mode-with-currentcolor)
- [Hover, Active, and Disabled States](#hover-active-and-disabled-states)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a basic icon rendered as a background image inside a button.

### HTML

```html
<button id="settings-btn">
  <ch-image src="settings"></ch-image>
  Settings
</button>
```

### JavaScript

```js
const imageEl = document.querySelector("ch-image");

// Provide a callback that resolves image names to multi-state CSS custom properties
imageEl.getImagePathCallback = (imageSrc) => {
  const basePath = `/assets/icons/${imageSrc}`;
  return {
    base: `url("${basePath}.svg")`,
    hover: `url("${basePath}-hover.svg")`,
    active: `url("${basePath}-active.svg")`,
    disabled: `url("${basePath}-disabled.svg")`
  };
};
```

### Key Points

- The `src` property provides an identifier string that is passed to `getImagePathCallback` to resolve multi-state image URLs.
- The default rendering mode (`type="background"`) displays the image as a CSS `background-image`.
- The component automatically sets a `data-ch-image` attribute on its parent element (or the element specified by `containerRef`), enabling CSS-driven state transitions for hover, active, and focus.
- The component is always `aria-hidden="true"` because it is decorative. Meaningful images should use a native `<img>` element.

## Mask Mode with currentColor

Demonstrates using `type="mask"` so the icon inherits the parent's text color.

### HTML

```html
<button class="primary-btn">
  <ch-image src="check" type="mask"></ch-image>
  Confirm
</button>

<button class="danger-btn">
  <ch-image src="trash" type="mask"></ch-image>
  Delete
</button>
```

### Key Points

- When `type="mask"`, the image is rendered as a CSS `mask-image` with `background-color: currentColor`.
- The icon color automatically matches the parent element's `color` property, making it ideal for monochrome icons that need to adapt to different themes or button states.
- This mode works best with single-color SVG icons. Multi-color images will be rendered as a solid silhouette.
- All multi-state behavior (hover, active, focus, disabled) works the same as in background mode.

## Hover, Active, and Disabled States

Demonstrates how `ch-image` automatically changes its appearance based on the interactive state of its parent container.

### HTML

```html
<button id="action-btn">
  <ch-image src="star" id="star-icon"></ch-image>
  Favorite
</button>

<button id="disabled-btn" disabled>
  <ch-image src="star" disabled></ch-image>
  Favorite (disabled)
</button>
```

### JavaScript

```js
const icon = document.getElementById("star-icon");

icon.getImagePathCallback = (imageSrc) => ({
  base: `url("/icons/${imageSrc}.svg")`,
  hover: `url("/icons/${imageSrc}-hover.svg")`,
  active: `url("/icons/${imageSrc}-active.svg")`,
  focus: `url("/icons/${imageSrc}-focus.svg")`,
  disabled: `url("/icons/${imageSrc}-disabled.svg")`
});
```

### Key Points

- The component sets a `data-ch-image` attribute on the resolved container element. The built-in CSS uses `[data-ch-image]:hover`, `[data-ch-image]:active`, and `[data-ch-image]:focus` selectors to switch the displayed image.
- When the `disabled` property is `true`, the component uses the `--ch-start-img--disabled` custom property (falling back to `--ch-start-img--base`) and suppresses hover/active/focus state changes.
- The `containerRef` property can be changed at runtime. The `data-ch-image` attribute is moved from the old container to the new one.
- If `containerRef` is not set, the direct parent element (`parentElement`) is used as the container.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

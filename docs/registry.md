# Registry Property System

Chameleon's registry property system provides a way to set configuration callbacks **globally** on `window.chameleonControlsLibrary`, so that every component can read them without requiring per-instance prop binding.

## Table of Contents

- [Why use the registry](#why-use-the-registry)
- [API](#api)
  - [`registryProperty(propertyName, value)`](#registrypropertyypropertyname-value)
  - [`registryControlProperty(propertyName, controlName, value)`](#registrycontrolpropertypropertyname-controlname-value)
  - [`getControlRegisterProperty(propertyName, controlName)`](#getcontrolregisterpropertypropertyname-controlname)
- [How components consume registry values](#how-components-consume-registry-values)
- [Supported components](#supported-components)
- [Complete example](#complete-example)
- [Recommendation for design systems](#recommendation-for-design-systems)

## Why use the registry

When building a design system on top of Chameleon, you typically want all components to resolve icons the same way. Without the registry, you would need to pass `getImagePathCallback` as a prop on every single component instance:

```html
<!-- Without registry: repetitive prop binding -->
<ch-accordion-render getImagePathCallback="{myResolver}"></ch-accordion-render>
<ch-tree-view-render getImagePathCallback="{myResolver}"></ch-tree-view-render>
<ch-combo-box-render getImagePathCallback="{myResolver}"></ch-combo-box-render>
<ch-image getImagePathCallback="{myResolver}"></ch-image>
<!-- ... every component, every time -->
```

With the registry, you register the resolver **once** at application startup and every component picks it up automatically:

```typescript
import { registryProperty } from "@genexus/chameleon-controls-library/dist/collection/index";

registryProperty("getImagePathCallback", {
  "ch-accordion-render": myAccordionResolver,
  "ch-tree-view-render": myTreeResolver,
  "ch-combo-box-render": myComboResolver,
  "ch-image": myImageResolver
  // ...
});
```

## API

### `registryProperty(propertyName, value)`

Sets the entire callback map for a property across all controls at once.

```typescript
import { registryProperty } from "@genexus/chameleon-controls-library/dist/collection/index";

registryProperty("getImagePathCallback", {
  "ch-image": src => ({ base: `icons/${src}.svg` }),
  "ch-accordion-render": src => ({ base: `icons/${src}.svg` })
  // ...
});
```

**Parameters:**

| Parameter      | Type                                    | Description                                               |
| -------------- | --------------------------------------- | --------------------------------------------------------- |
| `propertyName` | `"getImagePathCallback"`                | The registry property name.                               |
| `value`        | `Partial<RegistryGetImagePathCallback>` | An object mapping component tag names to their callbacks. |

### `registryControlProperty(propertyName, controlName, value)`

Sets a callback for a **specific control** without overwriting the entire map. Useful for registering or updating resolvers incrementally.

```typescript
import { registryControlProperty } from "@genexus/chameleon-controls-library/dist/collection/index";

registryControlProperty("getImagePathCallback", "ch-image", src => ({
  base: `icons/${src}.svg`
}));
```

**Parameters:**

| Parameter      | Type                        | Description                                               |
| -------------- | --------------------------- | --------------------------------------------------------- |
| `propertyName` | `"getImagePathCallback"`    | The registry property name.                               |
| `controlName`  | Component tag name          | The specific component to configure (e.g., `"ch-image"`). |
| `value`        | Component-specific callback | The callback function for that component.                 |

### `getControlRegisterProperty(propertyName, controlName)`

Reads the registered callback for a specific component. This function is used **internally** by Chameleon components — you typically do not need to call it directly.

```typescript
import { getControlRegisterProperty } from "@genexus/chameleon-controls-library/dist/collection/index";

const resolver = getControlRegisterProperty("getImagePathCallback", "ch-image");
```

## How components consume registry values

Each component reads the registry **once** during its `connectedCallback` (lazy initialization):

```typescript
// Internal component code (simplified)
let REGISTRY_CALLBACK;

connectedCallback() {
  REGISTRY_CALLBACK ??= getControlRegisterProperty(
    "getImagePathCallback",
    "ch-image"
  );
}
```

When resolving an icon, the **instance prop takes priority** over the registry:

```typescript
const callback = this.getImagePathCallback ?? REGISTRY_CALLBACK;
const image = callback?.(src);
```

This means you can still override the global resolver on specific instances when needed:

```html
<!-- Uses the global registry resolver -->
<ch-image src="settings"></ch-image>

<!-- Overrides with a custom resolver for this instance -->
<ch-image src="settings" getImagePathCallback="{customResolver}"></ch-image>
```

## Supported components

The following components support `getImagePathCallback` via the registry:

| Component                   | Callback signature                                                            |
| --------------------------- | ----------------------------------------------------------------------------- |
| `ch-accordion-render`       | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-action-list-render`     | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-action-menu-render`     | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-checkbox`               | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-combo-box-render`       | `(item: ComboBoxItemModel, direction: "start" \| "end") => GxImageMultiState` |
| `ch-edit`                   | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-image`                  | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-navigation-list-render` | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-tab-render`             | `(imgSrc: string) => GxImageMultiState`                                       |
| `ch-tree-view-render`       | `(imgSrc: string) => GxImageMultiState`                                       |

> **Note:** `ch-combo-box-render` has a different callback signature — it receives the full item model and the icon direction (`"start"` or `"end"`) instead of just the source string.

## Complete example

```typescript
import {
  registryProperty,
  type GxImageMultiState
} from "@genexus/chameleon-controls-library/dist/collection/index";

// Define an icon resolver that maps simple keys to file paths
const iconResolver = (src: string): GxImageMultiState | undefined => {
  if (!src) return undefined;

  return {
    base: `assets/icons/${src}.svg`,
    hover: `assets/icons/${src}-hover.svg`,
    active: `assets/icons/${src}-active.svg`,
    disabled: `assets/icons/${src}-disabled.svg`
  };
};

// A more complete resolver for combo-box that handles both directions
const comboBoxResolver = (
  item: { startImgSrc?: string; endImgSrc?: string },
  direction: "start" | "end"
): GxImageMultiState | undefined => {
  const src = direction === "start" ? item.startImgSrc : item.endImgSrc;
  return iconResolver(src);
};

// Register globally at application startup
registryProperty("getImagePathCallback", {
  "ch-accordion-render": iconResolver,
  "ch-action-list-render": iconResolver,
  "ch-action-menu-render": iconResolver,
  "ch-checkbox": iconResolver,
  "ch-combo-box-render": comboBoxResolver,
  "ch-edit": iconResolver,
  "ch-image": iconResolver,
  "ch-navigation-list-render": iconResolver,
  "ch-tab-render": iconResolver,
  "ch-tree-view-render": iconResolver
});
```

After this registration, all components automatically resolve icon keys:

```html
<!-- The "settings" key is resolved to "assets/icons/settings.svg" etc. -->
<ch-image src="settings" type="mask"></ch-image>
```

```typescript
// Item models use simple keys instead of full paths
const items = [
  { caption: "Home", startImgSrc: "home", startImgType: "mask" },
  { caption: "Settings", startImgSrc: "settings", startImgType: "mask" }
];
```

## Recommendation for design systems

If you are building a design system on top of Chameleon, **using the registry is strongly recommended** when your components use icons. It provides:

1. **Simplified source values** — Use short keys like `"settings"` instead of full paths like `"assets/icons/light/settings-24x24.svg"`.
2. **Centralized resolution logic** — Change icon paths, naming conventions, or CDN URLs in one place.
3. **Automatic multi-state support** — The resolver can generate hover, active, focus, and disabled variants from a single key.
4. **No prop threading** — Components throughout the application resolve icons without explicit prop binding.

The registry is not mandatory — you can always pass `getImagePathCallback` as an instance prop, or skip it entirely and pass full icon paths directly. But for any application with more than a handful of icon-bearing components, the registry significantly reduces boilerplate and improves maintainability.

> **Tip:** A good pattern for resolvers is to fall back to the raw `src` when the key is not found in the design system's icon set. This allows custom icons outside the design system to work by simply passing a full path as the source:
>
> ```typescript
> const resolver = (src: string) => {
>   const dsIcon = designSystemIcons[src];
>   return dsIcon ?? { base: src };
> };
> ```


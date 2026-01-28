# Changes brought by Chameleon 7

## General

- Support for SSR in all components? `ADD EXPLANATION......`

- Faster re-rendering (add benchmarks)

- Reduced memory consumption (add benchmarks)

- Faster initial load? (add benchmarks)

- Reduced core bundle size (add comparison)

- All external dependencies that components uses for their implementation are now marked as external. This further improves the possibilities to reduce the JS bundle size of the applications that uses Chameleon, as more code can be reused in the application, since the dependencies code can be shared outside of Chameleon. Example:

  - Chameleon uses [micromark](https://github.com/micromark/micromark) for parsing the markdown.

  - Prior to Chameleon 7, the micromark code was bundled directly into the `ch-markdown-viewer` component, so if you were using micromark in your application and the `ch-markdown-viewer` component, all the JavaScript of micromark was duplicated.

  - Now, it decoupled from the `ch-markdown-viewer` component, so it no longer will be duplicated.

- New way to distribute the code (browser development, browser production, node development and node production). `COMPLETE............`

- New development warnings:

  - `COMPLETE............`

- A new way to use custom elements:

  - Now you can import the custom elements you need for your application, instead of using the defineCustomElements function.

- The accessibility checker is no longer part of the production code. In other words, you no longer need to disable it for distribution builds.

- More unit tests!!! `COMPLETE............`

- Improved support for RTL. (Now it works even if the `dir="rtl"` is not set directly into the `html` tag). `COMPLETE............`

  - `ch-navigation-list-render`
  - `ch-sidebar`

- All components that have support for the multi state images now uses under the hood the ch-image component. `IMPLEMENT THIS AND ADD EXPLANATION......`

- Improved type safety. Chameleon now uses strict TypeScript, which aligns with the best practices of the TypeScript world.

- Improvements for RTL. Now RTL works at any level of the DOM, not only setting dir="rtl" in the html tag. `COMPLETE WITH COMPONENTS THAT WERE FIXED/IMPROVED............`

## Showcase

- Improved the SEO in the showcase, since it's now fully Server Side Rendered. Prior to Chameleon 7 is was purely built with Client Side Rendering.

- Improved routing `COMPLETE............`

## Components

### ch-checkbox

`EXPLAIN HOW IT WORKS NOW............`

- Fix: The `disabled` property is now reflected as a HTML attribute. This allows to use the CSS selector `ch-checkbox:disabled`, and when disabled the `FormData` of forms won't include the entry for the `ch-checkbox`.

- Fix (a11y): The `ch-checkbox` was not correctly displayed in the accessibility tree when it was not checked.

- Feat: Added the `checked` property.

- Feat: The `input` event can now be prevented by calling `event.defaultPrevent()`.

- Perf: Each `ch-checkbox` now has 1 less event listeners attached if they are used without a external label (a `<label>` tag outside of the `ch-checkbox`). Since this is the recommended way, because the `ch-checkbox` already has the `caption` property to render a label positioned after the option (for accessibility recommendations `ADD THE LINK FOR THIS............`), in the majority of the cases the it will have `ch-checkbox` only one listener from now on.

- Perf: Each `ch-checkbox` now renders with 1 less DOM node, that means, it's even more lighter! `IMPROVE EXPLANATION............`

### ch-code

- A11y: Reduced the flickering on the initial load, since in the initial render the component now renders the code block visually hidden and without waiting for the lazy language to be downloaded. When the JavaScript for the language is downloaded, the code block is highlighted and the visibility is restored. `IMPROVE EXPLANATION AND CHECK IF THIS IS ACCOMPLISHED......`

### ch-progress

- Fix: Setting the `name` attribute no longer throws a static type error.

### ch-radio-group-render

- Fix: The `disabled` property is now reflected as a HTML attribute. This allows to use the CSS selector `ch-radio-group-render:disabled`, and when disabled the `FormData` of forms won't include the entry for the `ch-radio-group-render`.

- Fix: Setting the `name` attribute no longer throws a static type error.

### ch-sidebar

- Feat: Added the `expandButtonPosition` property.

### ch-slider

`EXPLAIN HOW IT WORKS NOW............`

- Fix: When using the component in forms, the value were not correctly set if the `value` property was not between the `minValue` and `maxValue`.

- Fix: Setting the `name` attribute no longer throws a static type error.

- Perf: Each `ch-switch` now has 2 less event listeners attached, that means, it only has one listener from now on.

### ch-switch

- Fix: The `disabled` property is now reflected as a HTML attribute. This allows to use the CSS selector `ch-switch:disabled`, and when disabled the `FormData` of forms won't include the entry for the `ch-switch`.

- Feat: Added the `checked` property.

- Feat: Added support for the `readonly` property.

- Feat: The `input` event now emits in its detail the new `checked` state of the switch.

- Feat: The `input` event can now be prevented by calling `event.defaultPrevent()`.

## Breaking changes

### General

- The accessibility checker functions are no longer exported, since the checker is only available for development mode. When building for production, all the code for the accessibility checker is removed from the JS files.

  You can safely remove this code:

  ```diff
  - import { disableAccessibilityReports } from "@genexus/chameleon-controls-library/dist/collection";
  -
  - disableAccessibilityReports();
  ```

- Removed all deprecated components:
  | Removed | Migration |
  | ------- | --------- |
  | `ch-accordion` | Use the `ch-accordion-render` |
  | `ch-form-checkbox` | Use the `ch-checkbox` |
  | `ch-grid` and all `ch-grid-*` elements | Use the `ch-tabular-grid` and all `ch-tabular-grid-*` elements |
  | `ch-icon` | Try to use a `background-image` or `-webkit-mask` in a `::before` or `::after` pseudo-element. If that not cover your case, use the `ch-image` |
  | `ch-select` and `ch-select-item` | Use the `ch-combo-box-render` |
  | `ch-sidebar-menu`, `ch-sidebar-menu-list` and `ch-sidebar-menu-list-item` | Use the `ch-sidebar` and `ch-navigation-list-render` |
  | `ch-step-list` and `ch-step-list-item` | `COMPLETE............` |
  | `ch-style` | Use the `ch-theme` |
  | `ch-suggest` | Use the `ch-combo-box-render` with `suggest = true` |
  | `ch-tree` and `ch-tree-item` | Use the `ch-tree-view-render` |
  | `ch-window` | Use the `ch-popover` |

### ch-checkbox

- Removed `highligtable` property. `ADD EXPLANATION...... (include the removal of the click event)`.

- The `value` property is now `"on"` by default, instead of `null`.

- Removed the `checkedValue` and `unCheckedValue` properties. Use the new checked property. `ADD EXPLANATION......`.

- Renamed the class from `ChCheckBox` to `ChCheckbox`.

- Removed `option` part. `ADD EXPLANATION...... (it is a ::after now)`.

- Removed the `--ch-checkbox__option-size` custom var. `COMPLETE............`

- Updated the default value of the `--ch-checkbox__option-image-size` custom var from `100%` to `50%`.

### ch-code

- It now uses SkikiJS for highlighting the code and the customization is different. `COMPLETE............`

### ch-navigation-list-render

- The `renderItem` property now must return a Lit's `TemplateResult`.

- Removed the `gxImageConstructor`, `gxSettings` and `useGxRender` (`COMPLETE............`) properties. `ADD EXPLANATION......`

### ch-switch

- The `value` property is now `"on"` by default, instead of `null`.

- Removed the `checkedValue` and `unCheckedValue` properties. Use the new checked property. `ADD EXPLANATION......`.

- `Add the remaining breaking changes.....`

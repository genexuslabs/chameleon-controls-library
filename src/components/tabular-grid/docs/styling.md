# ch-grid: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)

## Shadow Parts

| Part                                 | Description                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `"footer"`                           | The footer section rendered below the grid body.                          |
| `"header"`                           | The header section rendered above the grid body.                          |
| `"main"`                             | The main scrollable section containing the grid columns, rows, and cells. |
| `"settings-caption"`                 | The caption/title text in the settings panel header.                      |
| `"settings-close"`                   | The close button in the settings panel.                                   |
| `"settings-columns"`                 | The column visibility list inside the settings panel.                     |
| `"settings-columns-item"`            | An individual column entry in the settings column list.                   |
| `"settings-columns-label"`           | The label for a column entry in the settings panel.                       |
| `"settings-columns-visible"`         | The visibility toggle for a column in the settings panel.                 |
| `"settings-columns-visible-checked"` | The visibility toggle when the column is visible.                         |
| `"settings-footer"`                  | The footer area of the settings panel.                                    |
| `"settings-header"`                  | The header area of the settings panel.                                    |
| `"settings-main"`                    | The main content area of the settings panel.                              |
| `"settings-mask"`                    | The backdrop overlay displayed behind the settings panel.                 |
| `"settings-window"`                  | The settings panel window container.                                      |

## Shadow DOM Layout

## Case 1: Default

```
<ch-tabular-grid>
  | #shadow-root
  | <header part="header">
  |   <slot name="header" />
  | </header>
  |
  | <section part="main">
  |   <slot />
  | </section>
  |
  | <aside>
  |   <ch-tabular-grid-settings>
  |     | #shadow-root
  |     | <ch-window>
  |     |   | #shadow-root
  |     |   | <div part="settings-mask"></div>
  |     |   | <div part="settings-window">
  |     |   |   <div part="settings-header">
  |     |   |     <span part="settings-caption"></span>
  |     |   |     <button part="settings-close"></button>
  |     |   |   </div>
  |     |   |   <div part="settings-main">
  |     |   |     <slot />
  |     |   |   </div>
  |     |   |   <div part="settings-footer">
  |     |   |     <slot name="footer" />
  |     |   |   </div>
  |     |   | </div>
  |     | </ch-window>
  |
  |     <slot name="settings">
  |       <ch-tabular-grid-settings-columns part="settings-columns">
  |         | #shadow-root
  |         | <ul>
  |         |   <!-- for each column in columns -->
  |         |   <li part="settings-columns-item">
  |         |     <label part="settings-columns-label">
  |         |       <input part="settings-columns-visible [settings-columns-visible-checked]" type="checkbox" />
  |         |       Column name
  |         |     </label>
  |         |   </li>
  |         | </ul>
  |       </ch-tabular-grid-settings-columns>
  |     </slot>
  |   </ch-tabular-grid-settings>
  |   <slot name="column-display" />
  |   <slot name="row-actions" />
  | </aside>
  |
  | <footer part="footer">
  |   <slot name="footer" />
  | </footer>
</ch-tabular-grid>
```

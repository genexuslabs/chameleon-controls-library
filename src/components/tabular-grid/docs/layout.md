# ch-tabular-grid: Shadow DOM layout

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

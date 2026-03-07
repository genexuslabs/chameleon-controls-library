# ch-paginator-render: Shadow DOM layout

## Case 1: Full layout (all controls)

Controls rendered depend on the `controlsOrder` property. Each control is optional.

```
<ch-paginator-render>
  | #shadow-root
  |
  | <!-- items-per-page control -->
  | <form part="items-per-page">
  |   <label part="items-per-page__label">Items per page</label>
  |   <ch-combo-box-render part="items-per-page__combo-box" exportparts="expandable,group,group__header,group__header-caption,group__content,item,section,window,disabled,expanded,collapsed,nested,selected">
  |     | #shadow-root
  |     | <span class="invisible-text"></span>
  |     | <div role="combobox">
  |     |   <input />
  |     | </div>
  |     | <ch-popover role="listbox" part="window">
  |     |   | #shadow-root
  |     |   | <slot />
  |     |
  |     |   <!-- for each item in model -->
  |     |   <button role="option" part="{item.value} item [nested] [disabled] [selected]">
  |     |     Caption text
  |     |   </button>
  |     | </ch-popover>
  |   </ch-combo-box-render>
  | </form>
  |
  | <!-- items-per-page-info control -->
  | <div part="items-per-page-info">
  |   <span part="items-per-page-info__text">Showing 1-10 of 100</span>
  | </div>
  |
  | <!-- first button -->
  | <button part="first__button [disabled]"></button>
  |
  | <!-- prev button -->
  | <button part="prev__button [disabled]"></button>
  |
  | <!-- pages navigation -->
  | <nav part="pages">
  |   <ol>
  |     <!-- for each page in pagesRange -->
  |     <li>
  |       <button part="page [selected | not-selected]">1</button>
  |     </li>
  |     <!-- Ellipsis -->
  |     <li>
  |       <span part="page ellipsis">...</span>
  |     </li>
  |   </ol>
  | </nav>
  |
  | <!-- next button -->
  | <button part="next__button [disabled]"></button>
  |
  | <!-- last button -->
  | <button part="last__button [disabled]"></button>
  |
  | <!-- navigation-info control -->
  | <div part="navigation-info">
  |   <span part="navigation-info__text">Page 1 of 10</span>
  | </div>
  |
  | <!-- go-to control -->
  | <div part="go-to">
  |   <label part="go-to__label">Go to</label>
  |   <input part="go-to__input" type="number" />
  |   <span>of 10</span>
  | </div>
</ch-paginator-render>
```

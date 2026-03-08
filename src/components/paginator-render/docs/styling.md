# ch-paginator-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Full layout (all controls)](#case-1-full-layout-all-controls)

## Shadow Parts

| Part                          | Description                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `"disabled"`                  | Applied to navigation buttons when they are disabled (e.g. "first" on page 1).     |
| `"ellipsis"`                  | Applied to ellipsis elements within the page navigation.                           |
| `"first__button"`             | The "first page" navigation button.                                                |
| `"go-to"`                     | Container for the "go to page" control.                                            |
| `"go-to__input"`              | The numeric input for jumping to a specific page.                                  |
| `"go-to__label"`              | Label for the "go to page" input.                                                  |
| `"items-per-page"`            | Container for the items-per-page selector control.                                 |
| `"items-per-page-info"`       | Container for the items-per-page informational text.                               |
| `"items-per-page-info__text"` | The text span showing the current item range (e.g. "Showing 1 - 10 of 100 items"). |
| `"items-per-page__combo-box"` | The combo-box used to select items per page.                                       |
| `"items-per-page__label"`     | Label text for the items-per-page selector.                                        |
| `"last__button"`              | The "last page" navigation button.                                                 |
| `"navigation-info"`           | Container for the page navigation informational text.                              |
| `"navigation-info__text"`     | The text span showing the current page info (e.g. "Showing 3 of 10 pages").        |
| `"next__button"`              | The "next page" navigation button.                                                 |
| `"not-selected"`              | Applied to page elements that are not selected.                                    |
| `"page"`                      | An individual page button, anchor, or ellipsis element.                            |
| `"pages"`                     | Container wrapping the page number navigation controls.                            |
| `"prev__button"`              | The "previous page" navigation button.                                             |
| `"selected"`                  | Applied to the currently selected page element.                                    |

## Shadow DOM Layout

## Case 1: Full layout (all controls)

Controls rendered depend on the `controlsOrder` property. Each control is optional.

```
<ch-paginator-render>
  | #shadow-root
  |
  | <!-- items-per-page control -->
  | <form part="items-per-page">
  |   <label part="items-per-page__label">Items per page</label>
  |   <ch-combo-box-render part="items-per-page__combo-box">
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

# F-13: Internationalization

Internationalization (i18n) ensures the tabular grid can be used effectively across languages, scripts, and regional conventions. This feature category covers localized UI strings, right-to-left layout support, locale-aware data formatting, and pre-built multi-language packs.

Internationalization applies to all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) uniformly, as all variants share the same header chrome, pagination controls, filter UI, empty-state messages, and formatting pipeline.

> **Foundations**: This feature builds on the CSS subgrid layout model defined in [FD-01](../01-foundations/01-layout-model.md). CSS logical properties (`inline-start`, `inline-end`, `block-start`, `block-end`) used throughout the layout model ensure that the grid adapts to writing direction changes without JavaScript layout recalculation. The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md) defines baseline ARIA structure that MUST remain correct regardless of locale or direction.

> **Design principle**: Internationalization is not an overlay -- it is woven into every visual and interactive aspect of the grid. Every feature specification in this document that references text, alignment, position, or formatting MUST be interpreted through the lens of the active locale and direction.

---

## 13.1 Localized UI Strings [P0]

**Description**: All built-in UI text rendered by the grid -- including filter labels, column menu items, pagination controls, sort action labels, "No rows to display" empty-state messages, loading indicators, selection count labels, group headers, accessibility announcements, and tooltip text -- MUST be translatable by the developer. The grid accepts a locale object (string dictionary) that maps string keys to localized values, replacing every default English string.

**Applies to**: All variants

**Use Cases**
- UC-1: A developer building an application for the Japanese market provides a locale object that translates "No rows to display" to the appropriate Japanese string, "Filter..." placeholder text to its Japanese equivalent, and all column menu labels to Japanese.
- UC-2: A multilingual SaaS platform switches the grid's UI language at runtime when the user changes their language preference in settings, without reloading the page.
- UC-3: A developer uses string interpolation tokens in localized strings (e.g., "Showing {start}-{end} of {total} rows") to adapt pagination labels to different grammatical structures across languages.

**Conditions of Use**
- The grid MUST accept an optional `localization` property containing a key-value dictionary of UI strings.
- When a `localization` object is provided, the grid MUST use the provided strings in place of all corresponding default (English) strings.
- Keys not present in the provided dictionary MUST fall back to the built-in English defaults.

**Behavioral Requirements**
- BR-1: The grid MUST define a `GridLocalization` interface (or equivalent TypeScript type) that enumerates every localizable string key. The interface MUST be exported as part of the public API so developers can discover all available keys.
- BR-2: Every built-in UI string rendered by the grid MUST be represented by a key in the `GridLocalization` interface. No user-visible string SHALL be hardcoded without a corresponding localization key.
- BR-3: String values MUST support interpolation tokens using curly-brace syntax (e.g., `{count}`, `{columnName}`, `{start}`, `{end}`, `{total}`). The grid MUST replace tokens with the appropriate runtime values before rendering.
- BR-4: The grid MUST accept updates to the `localization` property at runtime. When the property changes, all visible UI strings MUST update immediately without requiring a full re-render or data reload.
- BR-5: Localized strings MUST be applied to all screen reader announcements emitted via live regions (`role="status"`, `aria-live="polite"`). Announcements such as "Sorted by {columnName}, ascending" MUST use the localized template, not the English default.
- BR-6: The grid MUST provide a complete default English locale object that serves as both the fallback and a reference implementation for translators.
- BR-7: The `GridLocalization` interface MUST include, at minimum, keys for the following categories: filter UI labels and placeholders, column menu action labels (sort, pin, hide, auto-size, etc.), pagination labels (page size, page navigation, row counts), empty-state messages ("No rows to display", "No results match your filter"), loading indicator text, selection count labels ("{count} rows selected"), group header templates ("{groupColumn}: {groupValue} ({count})"), sort action labels, accessibility announcements (sort changed, filter applied, selection changed), and validation/error messages.
- BR-8: The grid MUST NOT perform locale detection automatically. The developer is responsible for determining the user's preferred language and providing the appropriate `localization` object. This avoids implicit behavior and gives the developer full control.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Additional localizable strings for pivot-specific UI: measure aggregation labels ("Sum of {measure}", "Count of {measure}"), dimension level headers, and "Grand Total" / "Subtotal" labels. |
| Gantt Chart | Additional localizable strings for timeline labels (month names, day abbreviations), milestone tooltips, and dependency type labels. |
| Tree Grid | Additional localizable strings for expand/collapse actions ("Expand row", "Collapse row") used in accessibility announcements. |

**CSS Subgrid Implications**

None. Localized strings are content within existing grid cells and chrome elements. Different string lengths may affect column auto-sizing (F-09.7), but this is handled by the existing layout model.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Localized strings do not introduce new keyboard interactions. | N/A |

**Accessibility**
- **ARIA**: All `aria-label`, `aria-description`, and `aria-roledescription` values that include user-visible text MUST use localized strings. For example, the filter input's `aria-label` MUST use the localized "Filter {columnName}" string, not a hardcoded English equivalent.
- **Screen Reader**: All live region announcements MUST use localized string templates. SR: "{localized sort announcement}", SR: "{localized filter announcement}", SR: "{localized selection count}".
- **WCAG**: 3.1.1 (Language of Page) -- the grid's rendered text MUST be consistent with the page's declared language (`lang` attribute). 3.1.2 (Language of Parts) -- if the grid's locale differs from the page's `lang`, the grid's root element SHOULD carry its own `lang` attribute matching the locale of the provided strings.
- **Visual**: Localized strings MUST NOT be truncated without an accessible alternative (tooltip or `aria-label` with the full text). If a localized string is longer than the available space, the grid MUST apply text overflow with ellipsis and provide the full text via a tooltip (F-01.5 overflow behavior).

**Chameleon 6 Status**: Existed. Chameleon 6 provides a `GridLocalization` interface with key-value pairs for UI strings. The interface is passed as a property to the grid component. Chameleon 7 carries forward and extends the interface with additional keys for new features (multi-sort priority labels, advanced filter operators, pivot aggregation labels) and adds interpolation token support.

**Interactions**
- F-02 (Sorting): sort-related labels and announcements use localized strings.
- F-03 (Filtering): filter input placeholders, operator labels, and "no results" messages use localized strings.
- F-04 (Grouping): group header templates use localized strings with interpolation tokens.
- F-08 (Selection): selection count announcements use localized strings.
- F-09.9 (Column Menu): all menu item labels use localized strings.
- F-10 (Row Management): "No rows to display" empty-state message uses localized string.
- F-13.4 (Multi-Language Packs): packs provide pre-built `GridLocalization` objects.
- F-14 (Keyboard Navigation): keyboard shortcut descriptions in any help UI use localized strings.
- F-16 (Context Menus): all context menu labels use localized strings.

---

## 13.2 RTL Layout [P0]

**Description**: The grid fully supports right-to-left (RTL) writing direction for languages such as Arabic, Hebrew, Persian, and Urdu. When the grid operates in RTL mode, the entire layout mirrors: column order renders right-to-left, text alignment defaults to right-aligned, scroll direction reverses, sticky-positioned frozen columns anchor to the right edge, icon placement flips, resize handles move to the opposite edge, and all interactive affordances respect the mirrored layout. The implementation relies on CSS logical properties and the `direction: rtl` CSS property, ensuring that a single codebase handles both LTR and RTL without JavaScript layout branching.

**Applies to**: All variants

**Use Cases**
- UC-1: An Arabic-speaking user views a Data Grid. Column 1 appears at the right edge of the grid, text is right-aligned by default, and horizontal scrolling moves content from left to right (revealing later columns to the left).
- UC-2: A Hebrew-speaking user interacts with frozen columns in a Tree Grid. The frozen columns are pinned to the right edge (inline-start in RTL), and the scroll region extends to the left.
- UC-3: A developer toggles the direction at runtime (e.g., for a language switcher) and the grid re-layouts without data loss or state reset.

**Conditions of Use**
- The grid MUST inherit its writing direction from the closest ancestor element with a `dir` attribute, or from the `direction` CSS property on the grid's host element.
- The grid MAY accept an explicit `dir` property on its host element to override the inherited direction.
- When no `dir` attribute or `direction` CSS property is specified, the grid MUST default to LTR.

**Behavioral Requirements**
- BR-1: The grid MUST use CSS logical properties exclusively for all directional layout. Specifically: `inline-start` / `inline-end` instead of `left` / `right` for positioning, `padding-inline-start` / `padding-inline-end` instead of `padding-left` / `padding-right`, `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right`, `border-inline-start` / `border-inline-end` instead of `border-left` / `border-right`, and `inset-inline-start` / `inset-inline-end` instead of `left` / `right` in positioned elements.
- BR-2: When `direction: rtl` is active, the visual column order MUST reverse. The first column in the column definition array MUST render at the right edge of the grid. The subgrid inherits direction from the host element, so CSS `direction: rtl` on the grid host reverses the flow of `grid-template-columns` tracks automatically.
- BR-3: Frozen columns (pinned to "start") MUST anchor to the right edge in RTL mode via `position: sticky` with `inset-inline-start: 0`. Columns pinned to "end" MUST anchor to the left edge. The `sticky` offset MUST use logical properties to avoid separate LTR/RTL codepaths.
- BR-4: Horizontal scrollbar behavior MUST adapt to RTL: the scrollbar's starting position is at the right edge, and scrolling moves the viewport to the left to reveal additional columns.
- BR-5: Column resize handles MUST appear at the inline-end edge of each column header. In RTL mode, this is the LEFT edge of the header cell (the opposite of LTR).
- BR-6: Sort indicator icons MUST be positioned at the inline-end edge of the column header text. In RTL, this places the icon to the LEFT of the header label.
- BR-7: Tree Grid indentation MUST use `padding-inline-start`, which automatically applies to the right side in RTL, maintaining correct visual nesting.
- BR-8: Text alignment MUST default to `text-align: start`, which resolves to right-aligned in RTL and left-aligned in LTR. Developers MAY override alignment per column; override values SHOULD also use logical keywords (`start`, `end`) rather than physical (`left`, `right`).
- BR-9: The grid MUST support runtime direction changes. When the `dir` attribute or `direction` CSS property changes, the grid MUST re-layout immediately. Active sort state, selection state, scroll position (in logical terms), and edit state MUST be preserved across direction changes.
- BR-10: All icons with directional semantics (expand/collapse carets, sort arrows, navigation arrows, pagination arrows) MUST mirror in RTL. Non-directional icons (checkboxes, filter funnels, drag handles) MUST NOT mirror.
- BR-11: Drag-and-drop operations (column reorder, row drag) MUST respect RTL direction. Drop indicators and insertion markers MUST appear at the correct inline position.
- BR-12: The grid MUST NOT use the CSS `transform: scaleX(-1)` technique to mirror the layout. This approach produces inaccessible text rendering (mirrored glyphs) and breaks selection, copy, and assistive technology interaction.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Gantt Chart | The task list region appears at the inline-start edge (right in RTL). The timeline region extends toward inline-end (left in RTL). Timeline rendering (bars, dependencies, milestones) flows right-to-left chronologically, or the developer MAY configure the timeline to maintain left-to-right chronological flow regardless of direction (configurable). |
| Pivot Table | Row dimension headers appear at the inline-start edge (right in RTL). Value columns flow toward inline-end. Multi-level column headers maintain their hierarchical structure with mirrored alignment. |

**CSS Subgrid Implications**

CSS `direction: rtl` on the grid host element reverses the flow direction of the `grid-template-columns` tracks. Because every row uses `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1` (per [FD-01](../01-foundations/01-layout-model.md)), all rows inherit the reversed track direction automatically. No per-row JavaScript adjustment is needed. Frozen columns using `position: sticky` with `inset-inline-start` values adapt automatically when direction changes. This is a key benefit of the CSS-driven layout model.

**Editability Interaction**
- Tab order during cell editing (per [FD-03](../01-foundations/03-editability-model.md)) MUST follow reading order, which reverses in RTL: Tab moves to the NEXT cell in reading order (left in RTL), Shift+Tab moves to the PREVIOUS cell (right in RTL).
- Text input within editors MUST respect the cell's text direction. Cells containing RTL text MUST have `dir="rtl"` on the input/textarea element. Mixed-direction content (BiDi) SHOULD be supported via the Unicode Bidirectional Algorithm (no grid-specific handling required beyond correct `dir` attributes).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| ArrowLeft | Move focus to the NEXT column (inline-end direction) in RTL; move to the PREVIOUS column in LTR | Navigation Mode |
| ArrowRight | Move focus to the PREVIOUS column (inline-start direction) in RTL; move to the NEXT column in LTR | Navigation Mode |
| Home | Move focus to the first column in reading order (rightmost in RTL) | Navigation Mode |
| End | Move focus to the last column in reading order (leftmost in RTL) | Navigation Mode |
| Tab (in Edit Mode) | Move to the next editable cell in reading order (leftward in RTL) | Edit Mode |
| Shift+Tab (in Edit Mode) | Move to the previous editable cell in reading order (rightward in RTL) | Edit Mode |

**Accessibility**
- **ARIA**: The grid's root element MUST carry a `dir` attribute matching the active writing direction. Screen readers use this attribute to interpret the grid's spatial layout. `aria-colindex` values MUST remain logical (column 1 is always the first column in the definition, regardless of visual position), ensuring programmatic consistency.
- **Screen Reader**: Spatial navigation announcements (e.g., "Column 3 of 8") MUST remain consistent regardless of direction. Screen readers handle directional interpretation based on the `dir` attribute; the grid MUST NOT alter column index numbering for RTL.
- **WCAG**: 1.3.2 (Meaningful Sequence) -- the DOM order MUST match the logical reading order. In RTL, the DOM order of columns remains the same (column 1 first in DOM), and CSS `direction: rtl` handles the visual reversal. 1.4.12 (Text Spacing) -- text spacing adjustments MUST work correctly in both LTR and RTL. 2.4.3 (Focus Order) -- focus order follows the logical DOM order, which screen readers interpret based on `dir`.
- **Visual**: All directional visual cues (borders, shadows indicating frozen column edges, scroll fade indicators) MUST flip for RTL. The frozen column shadow (indicating scrollable content beneath) MUST appear on the inline-end edge of the frozen region.

**Chameleon 6 Status**: Partially existed. Chameleon 6 components use a shared RTL watcher utility (`rtl-watcher.ts`) that detects the `dir` attribute on ancestor elements. However, RTL support in the tabular grid is incomplete -- some layout properties use physical values (`left`/`right`) rather than logical properties. Chameleon 7 mandates full logical-property adoption and complete RTL support for all grid features.

**Interactions**
- F-01 (Data Display): text alignment defaults to `start`, adapting to direction.
- F-02.8 (Sort Indicators): icon position flips to inline-end in RTL.
- F-06 (Tree/Hierarchical): indentation uses `padding-inline-start`, auto-adapting.
- F-07 (Cell Editing): Tab/Shift+Tab order reverses in RTL.
- F-08 (Selection): range selection drag direction adapts to RTL; range highlighting renders correctly.
- F-09 (Column Management): resize handles, reorder drag, and column menus flip positions.
- F-11 (Virtualization): horizontal virtualization scroll direction adapts.
- F-13.1 (Localized UI Strings): RTL languages typically require localized strings in addition to layout mirroring.
- F-14 (Keyboard Navigation): ArrowLeft/ArrowRight semantics swap in RTL.
- FD-01 (Layout Model): CSS `direction` property drives subgrid track flow reversal.

---

## 13.3 Locale-Aware Formatting [P0]

**Description**: The grid formats data values (numbers, dates, currencies, percentages) according to the user's locale conventions using the standard `Intl.NumberFormat` and `Intl.DateTimeFormat` APIs. This ensures that thousand separators, decimal marks, date component ordering, currency symbols and placement, and percentage formatting all match regional expectations. Formatting is applied via the column's data type and an optional format configuration, with the grid-level locale serving as the default.

**Applies to**: All variants

**Use Cases**
- UC-1: A German user views a financial Data Grid. The number 1234567.89 displays as "1.234.567,89" (period as thousand separator, comma as decimal mark) instead of the English "1,234,567.89".
- UC-2: A user in the United Kingdom sees dates formatted as "15/03/2024" (DD/MM/YYYY), while a user in the United States sees the same date as "03/15/2024" (MM/DD/YYYY).
- UC-3: A Japanese user views currency values formatted as "JPY 1,234" with the currency code preceding the number and no decimal places, while a US user sees "$1,234.00".
- UC-4: A Pivot Table displays aggregated percentage values formatted according to the French locale: "85,5 %" (comma decimal, space before percent sign).

**Conditions of Use**
- The grid MUST accept a `locale` property (BCP 47 language tag string, e.g., `"en-US"`, `"de-DE"`, `"ja-JP"`) that specifies the default formatting locale.
- When no `locale` is provided, the grid MUST default to `navigator.language` (the browser's preferred language).
- Individual columns MAY override the grid-level locale with a column-level `locale` property for mixed-locale scenarios (e.g., a column of Japanese Yen values in an otherwise English grid).

**Behavioral Requirements**
- BR-1: For columns with `dataType: "number"`, the grid's default formatter MUST use `Intl.NumberFormat` with the active locale. The formatter MUST apply the locale's thousand separator, decimal mark, and digit grouping conventions.
- BR-2: For columns with `dataType: "datetime"`, the grid's default formatter MUST use `Intl.DateTimeFormat` with the active locale. The formatter MUST apply the locale's date component ordering (e.g., DMY vs MDY vs YMD), month/day name translations, and time format (12-hour vs 24-hour).
- BR-3: The column definition MUST accept an optional `formatOptions` property that maps directly to the options parameter of `Intl.NumberFormat` or `Intl.DateTimeFormat` (e.g., `{ style: "currency", currency: "EUR" }`, `{ dateStyle: "medium", timeStyle: "short" }`). This gives developers fine-grained control over formatting without requiring custom formatters.
- BR-4: When a column has both a `formatOptions` property and a custom `cellFormatter` function (F-01.3), the custom formatter MUST take precedence. The `formatOptions` property provides a declarative shorthand; custom formatters allow arbitrary logic.
- BR-5: `Intl.NumberFormat` and `Intl.DateTimeFormat` instances MUST be cached per unique combination of locale and format options. Constructing `Intl` formatter objects is expensive; the grid MUST NOT create new instances on every cell render.
- BR-6: For columns with `dataType: "number"` and a `formatOptions` specifying `style: "currency"`, the grid MUST format the value using `Intl.NumberFormat` with the specified `currency` code. The currency symbol placement (prefix, suffix), spacing, and decimal precision MUST follow the locale's conventions.
- BR-7: For columns with `dataType: "number"` and a `formatOptions` specifying `style: "percent"`, the grid MUST format the value using `Intl.NumberFormat` with `style: "percent"`. The raw value MUST be treated as a proportion (e.g., 0.855 renders as "85.5%" in `en-US` or "85,5 %" in `fr-FR`).
- BR-8: The `locale` property MUST be changeable at runtime. When the locale changes, all visible formatted values MUST update immediately. The grid MUST invalidate cached `Intl` formatter instances for the previous locale.
- BR-9: Boolean columns MUST NOT be affected by locale-aware formatting (booleans are rendered as checkboxes or custom renderers, not locale-sensitive text).
- BR-10: The formatted display value MUST be used for rendering, export (F-12), clipboard copy (unless raw value export is configured), and tooltip display. Sorting and filtering MUST operate on the raw value by default (see F-02.7 for sort-by-display-value opt-in).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Aggregated value cells (sums, averages, counts) MUST be formatted using the same locale and format options as their source value column. "Grand Total" and "Subtotal" rows MUST use consistent formatting. |
| Gantt Chart | Timeline axis labels (month names, day names, date formats) MUST use `Intl.DateTimeFormat` with the active locale. Duration values SHOULD use locale-appropriate number formatting. |

**CSS Subgrid Implications**

Formatted strings may have different character widths across locales (e.g., "1.234.567,89" is one character longer than "1,234,567.89"). Auto-sized columns (F-09.7) MUST account for the formatted string width, not the raw value width. The subgrid layout itself is unaffected -- formatted strings are content within cells.

**Editability Interaction**
- When a cell enters Edit Mode (per [FD-03](../01-foundations/03-editability-model.md)), the editor SHOULD display the raw value (or a locale-appropriate editable representation), not the fully formatted display string. For example, a number editor should allow the user to type digits with the locale's decimal separator, but MUST NOT include thousand separators in the editable input (they cause parsing ambiguity).
- Date editors MUST respect the locale's date component ordering in their input fields or picker UI.
- The committed value from the editor MUST be a typed value (number, Date, ISO string), not a formatted string. Parsing locale-formatted input back to a typed value MUST use locale-aware parsing logic.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Locale-aware formatting does not introduce new keyboard interactions. | N/A |

**Accessibility**
- **ARIA**: Formatted values rendered in cells are the accessible content by default (screen readers read the cell's text content). Formatted numbers, dates, and currencies MUST produce screen-reader-friendly output. `Intl.NumberFormat` and `Intl.DateTimeFormat` produce strings that screen readers can interpret correctly for the specified locale.
- **Screen Reader**: When a cell contains a formatted value, the screen reader MUST read the formatted string. For currency values, this includes the currency symbol and number (e.g., "$1,234.00" is read as "one thousand two hundred thirty-four dollars" by most screen readers in en-US locale).
- **WCAG**: 3.1.1 (Language of Page) -- formatted values MUST match the declared locale. If the grid uses `locale: "de-DE"` but the page `lang` is `"en"`, the developer SHOULD set a `lang="de"` attribute on the grid's host element so assistive technology interprets number/date formats correctly. 1.3.1 (Info and Relationships) -- the `dataType` and format semantics MUST be programmatically determinable (the cell value is typed, not just a display string).
- **Visual**: Formatted values MUST be fully visible or accessible via overflow tooltip (F-01.5). Truncated formatted values (e.g., a long currency string clipped to "$1,234...") MUST reveal the full formatted value on hover/focus via tooltip.

**Chameleon 6 Status**: Partially existed. Chameleon 6 column model includes `dataType` ("string", "number", "boolean", "datetime") and the grid's `cellFormatter` callback enables custom formatting, but the grid does not provide built-in `Intl`-based formatting tied to a locale property. Developers must implement locale-aware formatting manually via custom formatters. Chameleon 7 introduces a declarative `locale` property and `formatOptions` per column, with built-in `Intl.NumberFormat` / `Intl.DateTimeFormat` integration.

**Interactions**
- F-01.3 (Cell Formatters): custom formatters override locale-aware default formatting.
- F-02.6 (Locale-Aware Sort): the sort locale SHOULD align with the formatting locale by default.
- F-02.7 (Sort by Display Value): when enabled, sorting uses the formatted (locale-specific) string.
- F-03 (Filtering): filter value comparison uses raw values by default; filter UI input fields SHOULD accept locale-formatted input.
- F-04 (Grouping): group header aggregation values use locale-aware formatting.
- F-07 (Cell Editing): editors parse locale-formatted input back to typed values.
- F-09.7 (Auto-Size Columns): auto-sizing MUST measure formatted string widths, which vary by locale.
- F-12 (Export): exported data MAY use raw values or formatted values depending on configuration.
- F-13.1 (Localized UI Strings): the formatting locale and the UI string locale are independent but typically aligned.

---

## 13.4 Multi-Language Packs [P1]

**Description**: The grid provides pre-built translation packs for common languages, each containing a complete `GridLocalization` object ready for use. Language packs eliminate the need for developers to manually translate every UI string key, accelerating international deployment. Packs are distributed as importable modules (tree-shakeable), so applications only bundle the languages they need.

**Applies to**: All variants

**Use Cases**
- UC-1: A developer building a product for the Spanish market imports the `es` language pack and passes it as the `localization` property, immediately getting a fully translated grid UI without manual translation work.
- UC-2: A SaaS platform supports 12 languages. The developer imports language packs for all 12 and dynamically switches based on user preference. Each pack is a separate module, so bundlers include only the packs that are actually imported.
- UC-3: A developer needs a Simplified Chinese translation but wants to override two specific strings (e.g., a domain-specific "No results" message). The developer spreads the `zh-CN` pack and overrides individual keys.

**Conditions of Use**
- Language packs are an optional dependency. The grid MUST function correctly with only the built-in English defaults if no pack is provided.
- Each language pack MUST be importable as a standalone ES module (e.g., `import { es } from "chameleon/i18n/es"`).
- Language packs MUST be fully typed against the `GridLocalization` interface to ensure compile-time completeness checking.

**Behavioral Requirements**
- BR-1: The grid distribution MUST include language packs for at least the following languages at launch: English (en, built-in default), Spanish (es), French (fr), German (de), Portuguese (pt), Italian (it), Japanese (ja), Simplified Chinese (zh-CN), Traditional Chinese (zh-TW), Korean (ko), Arabic (ar), and Hebrew (he).
- BR-2: Each language pack MUST be a complete implementation of the `GridLocalization` interface. Partial packs (with missing keys) MUST NOT be shipped. This ensures developers do not encounter untranslated strings at runtime.
- BR-3: Language packs MUST be distributed as separate ES module files (one per language) to enable tree-shaking. Importing a single language pack MUST NOT pull in all other packs.
- BR-4: Each language pack MUST include correctly interpolated tokens (e.g., `{count}`, `{columnName}`) matching the positions defined in the `GridLocalization` interface. Token positions MAY differ from English to accommodate grammatical differences (e.g., the count may appear before or after the noun depending on the language).
- BR-5: Developers MUST be able to extend or override individual keys in a language pack by spreading the pack object and replacing specific entries: `{ ...esPack, noRowsMessage: "Custom message" }`. The `GridLocalization` type MUST support this pattern (plain object, not a class).
- BR-6: Language packs for RTL languages (Arabic, Hebrew) MUST NOT include direction information. Direction is controlled via the `dir` attribute (F-13.2), not via the language pack. The pack provides only translated strings.
- BR-7: The grid repository MUST include a validation script or test that verifies every language pack contains all keys defined in the `GridLocalization` interface and that all interpolation tokens are preserved. This prevents regressions when new localizable strings are added.
- BR-8: Language packs SHOULD follow the BCP 47 naming convention for module identifiers (e.g., `es`, `fr`, `de`, `pt-BR`, `zh-CN`). Regional variants (e.g., `es-MX` vs `es-ES`) MAY be provided where translations meaningfully differ.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Language packs MUST include translations for pivot-specific strings (aggregation labels, dimension headers, total/subtotal labels). |
| Gantt Chart | Language packs MUST include translations for Gantt-specific strings (timeline scale labels, dependency type names, milestone labels). |

**CSS Subgrid Implications**

None. Language packs are pure data (string dictionaries); they have no layout implications.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Language packs do not introduce keyboard interactions. | N/A |

**Accessibility**
- **ARIA**: Language packs that include ARIA-related strings (e.g., `aria-label` values, live region announcement templates) MUST provide accurate translations that convey the same semantic meaning as the English originals. Translators MUST NOT omit or simplify accessibility-critical strings.
- **Screen Reader**: Translated screen reader announcements MUST be grammatically correct in the target language. Awkward or incorrect translations degrade the assistive technology experience. The validation test (BR-7) SHOULD include a human review step for accessibility strings in each language.
- **WCAG**: 3.1.1 (Language of Page) -- when a language pack is active, the grid's host element SHOULD carry a `lang` attribute matching the pack's BCP 47 tag (e.g., `lang="es"`) if it differs from the page's `lang`. This ensures assistive technology uses the correct pronunciation rules for the translated strings.
- **Visual**: No additional visual requirements. Language packs affect text content only.

**Chameleon 6 Status**: New. Chameleon 6 provides the `GridLocalization` interface but does not ship pre-built language packs. Developers must create their own translations from scratch. Chameleon 7 introduces bundled language packs as a convenience feature.

**Interactions**
- F-13.1 (Localized UI Strings): language packs ARE `GridLocalization` objects -- they plug directly into the `localization` property.
- F-13.2 (RTL Layout): RTL language packs (Arabic, Hebrew) are used alongside RTL direction configuration but do not control direction themselves.
- F-13.3 (Locale-Aware Formatting): language packs control UI strings; the `locale` property controls data formatting. They are complementary but independent.

---

## Cross-Cutting Concerns

### Internationalization and Filtering

Filter UIs (F-03) MUST use localized strings for all labels, placeholders, and operator names. Filter comparison logic MUST use raw values (not formatted strings) for numeric and date comparisons. String filters SHOULD use `Intl.Collator` with the configured locale for case-insensitive and accent-insensitive matching (aligned with F-02.6 locale-aware sort).

### Internationalization and Export

Export operations (F-12) MUST support both raw-value export and formatted-value export. When formatted-value export is selected, the exported data MUST use the same locale-aware formatting applied in the grid's display. Column headers in exported files MUST use the developer-provided `headerName` (which may already be in the target language), not localized UI chrome strings.

### Internationalization and State Persistence

Saved grid state (F-21) MUST NOT include the locale or localization object. Locale is a runtime configuration that depends on the current user's preference, not a persisted grid state. Restoring state MUST NOT override the active locale.

### Internationalization and Server-Side Operations

In server-side mode (F-20), formatting is applied client-side after data arrives from the server. The server provides raw values; the grid's locale and format settings transform them for display. The server does not need to know the client's locale for data formatting purposes. However, locale-aware sorting delegated to the server (F-02.6 + F-20) requires the client to send the active locale as part of the sort request parameters.

### Internationalization and Theming

Theme definitions (F-15) MUST NOT hardcode directional values. All theme CSS MUST use logical properties. When a theme includes text content (rare but possible in pseudo-element content), it MUST be localizable or use universal symbols.

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| IR-01 | The grid MUST define and export a `GridLocalization` interface enumerating all localizable string keys. | MUST | F-13.1 |
| IR-02 | Every built-in UI string SHALL have a corresponding key in the `GridLocalization` interface. | SHALL | F-13.1 |
| IR-03 | Localized strings MUST support interpolation tokens using `{key}` syntax. | MUST | F-13.1 |
| IR-04 | The `localization` property MUST be updatable at runtime with immediate effect. | MUST | F-13.1 |
| IR-05 | Screen reader announcements MUST use localized string templates. | MUST | F-13.1 |
| IR-06 | The grid MUST use CSS logical properties exclusively for directional layout. | MUST | F-13.2 |
| IR-07 | CSS `direction: rtl` on the host MUST reverse visual column order via subgrid inheritance. | MUST | F-13.2 |
| IR-08 | Frozen columns MUST use `inset-inline-start` / `inset-inline-end` for sticky positioning. | MUST | F-13.2 |
| IR-09 | Keyboard ArrowLeft/ArrowRight semantics MUST swap in RTL mode. | MUST | F-13.2 |
| IR-10 | The grid MUST support runtime direction changes without state loss. | MUST | F-13.2 |
| IR-11 | Directional icons MUST mirror in RTL; non-directional icons MUST NOT mirror. | MUST | F-13.2 |
| IR-12 | The grid MUST NOT use `transform: scaleX(-1)` for RTL mirroring. | MUST | F-13.2 |
| IR-13 | Number formatting MUST use `Intl.NumberFormat` with the active locale by default. | MUST | F-13.3 |
| IR-14 | Date formatting MUST use `Intl.DateTimeFormat` with the active locale by default. | MUST | F-13.3 |
| IR-15 | `Intl` formatter instances MUST be cached per unique locale + options combination. | MUST | F-13.3 |
| IR-16 | The `locale` property MUST be changeable at runtime with immediate re-formatting. | MUST | F-13.3 |
| IR-17 | Formatted display values MUST be used for rendering; sorting/filtering MUST default to raw values. | MUST | F-13.3 |
| IR-18 | Language packs MUST be distributed as separate tree-shakeable ES modules. | MUST | F-13.4 |
| IR-19 | Each language pack MUST fully implement the `GridLocalization` interface (no missing keys). | MUST | F-13.4 |
| IR-20 | Language packs MUST preserve all interpolation tokens from the interface definition. | MUST | F-13.4 |
| IR-21 | A validation test MUST verify language pack completeness and token preservation. | MUST | F-13.4 |
| IR-22 | Tab order in Edit Mode MUST follow reading order, reversing in RTL. | MUST | F-13.2 |
| IR-23 | Tree Grid indentation MUST use `padding-inline-start` for automatic RTL adaptation. | MUST | F-13.2 |
| IR-24 | Column `formatOptions` MUST map to `Intl.NumberFormat` / `Intl.DateTimeFormat` options. | MUST | F-13.3 |
| IR-25 | Date/number editors MUST parse locale-formatted input back to typed values. | MUST | F-13.3 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout, logical properties, sticky positioning | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant-specific behavior matrix | [FD-02: Variant Model](../01-foundations/02-variant-model.md) |
| Edit mode tab order, editor value contract | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| ARIA structure, live regions, focus management | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Data display, cell formatters, overflow handling | F-01: Data Display & Rendering |
| Locale-aware sorting, sort indicators in RTL | F-02: Sorting |
| Filter UI labels, locale-aware filter matching | F-03: Filtering |
| Group header templates with interpolation | F-04: Grouping & Aggregation |
| Tree indentation with logical properties | F-06: Tree / Hierarchical |
| Editor locale-aware input parsing | F-07: Cell Editing |
| Selection range rendering in RTL | F-08: Selection |
| Column management (resize handles, menus) in RTL | F-09: Column Management |
| Virtualization (scroll direction in RTL) | F-11: Virtualization & Performance |
| Export with locale-formatted values | F-12: Export |
| Keyboard navigation (arrow key swap in RTL) | F-14: Keyboard Navigation |
| Theming with logical properties | F-15: Theming & Styling |
| Context menu labels, localized | F-16: Context Menus |
| Server-side locale-aware sort delegation | F-20: Server-Side Operations |
| State persistence (locale excluded from state) | F-21: State Persistence & Responsive |

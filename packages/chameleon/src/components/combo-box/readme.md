# `ch-combo-box-render`

<p>The <code>ch-combo-box-render</code> component is a feature-rich combo box that combines an input field with a popover-based dropdown list for selecting values.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `getImagePathCallback:  ComboBoxImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
imgSrc needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `hostParts:  string | undefined`

<p>Specifies a set of parts to use in the Host element (<code>ch-combo-box-render</code>).</p>

**Default**: <code>undefined</code>

---

### `model:  ComboBoxModel`

<p>Specifies the items of the control.</p>
<p><code>ComboBoxModel</code> is an array of <code>ComboBoxItemModel</code> entries. Each entry is
either a <code>ComboBoxItemLeaf</code> (a selectable item) or a <code>ComboBoxItemGroup</code> (a group header containing nested items).</p>

**Default**: <code>[]</code>

---

### `multiple:  boolean`

<p>This attribute indicates that multiple options can be selected in the list.
If it is not specified, then only one option can be selected at a time.
When multiple is specified, the control will show a scrolling list box
instead of a single line dropdown.</p>
<p><strong>Note:</strong> Currently declared but not yet implemented. Setting this property
has no effect on the component behavior.</p>

**Attribute**: <code>multiple</code>

**Default**: <code>false</code>

---

### `name:  string | undefined`

<p>This property specifies the <code>name</code> of the control when used in a form.</p>

**Attribute**: <code>name</code>

**Default**: <code>undefined</code>

---

### `placeholder:  string`

<p>A hint to the user of what can be entered in the control. Same as
<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder">placeholder</a>
attribute for <code>input</code> elements.</p>

**Attribute**: <code>placeholder</code>

**Default**: <code>undefined</code>

---

### `popoverInlineAlign:  ChPopoverAlign`

<p>Specifies the inline alignment of the popover.</p>

**Attribute**: <code>popover-inline-align</code>

**Default**: <code>"inside-start"</code>

---

### `readonly:  boolean`

<p>This attribute indicates that the user cannot modify the value of the control.
Same as <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly">readonly</a>
attribute for <code>input</code> elements.</p>

**Attribute**: <code>readonly</code>

**Default**: <code>false</code>

---

### `resizable:  boolean`

<p>Specifies whether the control can be resized. If <code>true</code> the control can be
resized at runtime by dragging the edges or corners.</p>

**Attribute**: <code>resizable</code>

**Default**: <code>false</code>

---

### `suggest:  boolean`

<p>This property lets you specify if the control behaves like a suggest.
If <code>true</code> the combo-box value will be editable and displayed items will be
filtered according to the input's value.</p>
<p>When enabled, the <code>suggestDebounce</code> property controls how long the control
waits before processing input changes, and the <code>suggestOptions</code> property
configures filtering behavior (e.g., strict matching, case sensitivity,
server-side filtering).</p>

**Attribute**: <code>suggest</code>

**Default**: <code>false</code>

---

### `suggestDebounce:  number`

<p>This property lets you determine the debounce time (in ms) that the
control waits until it processes the changes to the filter property.
Consecutive changes to the <code>value</code> property between this range, reset the
timeout to process the value.
Only works if <code>suggest === true</code>.</p>

**Attribute**: <code>suggest-debounce</code>

**Default**: <code>250</code>

---

### `suggestOptions:  ComboBoxSuggestOptions`

<p>This property lets you determine the options that will be applied to the
suggest. Available options (<code>ComboBoxSuggestOptions</code>):</p>
<ul>
<li><code>alreadyProcessed</code> (boolean) — <code>true</code> if the model is already filtered
server-side and the control should skip client-side filtering.</li>
<li><code>autoExpand</code> (boolean) — expand matching groups when filtering. <em>(Not yet implemented.)</em></li>
<li><code>hideMatchesAndShowNonMatches</code> (boolean) — invert the filter: hide
matches and show non-matches.</li>
<li><code>highlightMatchedItems</code> (boolean) — highlight matched text in items.
<em>(Not yet implemented.)</em></li>
<li><code>matchCase</code> (boolean) — make the filter case-sensitive (ignored when
<code>regularExpression</code> is <code>true</code>).</li>
<li><code>regularExpression</code> (boolean) — treat the filter value as a regular expression.</li>
<li><code>renderActiveItemIconOnExpand</code> (boolean) — keep the selected item icon
visible in the input while the dropdown is expanded in suggest mode.</li>
<li><code>strict</code> (boolean) — when the popover closes, revert to the last
confirmed value if the input does not match any item.</li>
</ul>

**Default**: <code>{}</code>

---

### `value:  string | undefined`

<p>Specifies the value (selected item) of the control.</p>

**Attribute**: <code>value</code>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `input: string`

<p>The <code>input</code> event is emitted when a change to the element's value is
committed by the user.</p>
<p>When <code>suggest === true</code>, this event is debounced by the <code>suggestDebounce</code>
value (default 250 ms). When <code>suggest === false</code>, debouncing does not
apply and the event is emitted immediately on value change.</p>

---

### `change: string`

<p>The <code>change</code> event is emitted when a change to the element's value is
committed by the user.</p>
<ul>
<li>
<p>In normal mode (suggest = false), it is emitted after each input event.</p>
</li>
<li>
<p>In suggest mode (suggest = true), it is emitted after the popover is closed
and a new value is committed by the user.</p>
</li>
</ul>
<p>This event is NOT debounced by the <code>suggestDebounce</code> value.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `window`

<p>The popover element that contains the dropdown list of items.</p>

---

### `expandable`

<p>Applied to group headers that can be expanded or collapsed.</p>

---

### `group`

<p>Applied to each item group container.</p>

---

### `group__header`

<p>The header element of an item group.</p>

---

### `group__header-caption`

<p>The caption text inside a group header.</p>

---

### `group__content`

<p>The container that wraps the child items of a group.</p>

---

### `item`

<p>Applied to each selectable leaf item in the list.</p>

---

### `section`

<p>Applied to section containers in the dropdown.</p>

---

### `disabled`

<p>State part applied to disabled items, groups, group headers, and expandable headers.</p>

---

### `expanded`

<p>State part applied to expanded group headers and expandable buttons.</p>

---

### `collapsed`

<p>State part applied to collapsed group headers and expandable buttons.</p>

---

### `nested`

<p>State part applied to items that are nested inside a group.</p>

---

### `selected`

<p>State part applied to the currently selected item.</p>

---

### `ch-combo-box-render--placeholder`

<p>Present on the host when no item is selected and the placeholder text is displayed.</p>
</details>

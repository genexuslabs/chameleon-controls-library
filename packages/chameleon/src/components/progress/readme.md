# `ch-progress`

<p>The ch-progress is an element that displays the progress status for tasks
that take a long time.</p>
<p>It implements all accessibility behaviors for determinate and indeterminate
progress. It also supports referencing a region to describe its progress.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName: string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `accessibleValueText: string | undefined`

<p>Assistive technologies often present the <code>value</code> as a percentage. If this
would not be accurate use this property to make the progress bar value
understandable.</p>

**Attribute**: <code>accessible-value-text</code>

**Default**: <code>undefined</code>

---

### `indeterminate:  boolean`

<p>Specifies whether the progress is indeterminate or not. In other words, it
indicates that an activity is ongoing with no indication of how long it is
expected to take.</p>
<p>If <code>true</code>, the <code>max</code>, <code>min</code> and <code>value</code> properties won't be taken into
account.</p>

**Attribute**: <code>indeterminate</code>

**Default**: <code>false</code>

---

### `max:  number`

<p>Specifies the maximum value of progress. In other words, how much work the
task indicated by the progress component requires.</p>
<p>This property is not used if indeterminate === true.</p>

**Attribute**: <code>max</code>

**Default**: <code>DEFAULT_MAX_VALUE</code>

---

### `min:  number`

<p>Specifies the minimum value of progress.</p>
<p>This property is not used if indeterminate === true.</p>

**Attribute**: <code>min</code>

**Default**: <code>DEFAULT_MIN_VALUE</code>

---

### `name:  string | undefined`

<p>Specifies the <code>name</code> of the component when used in a form.</p>

**Attribute**: <code>name</code>

**Default**: <code>undefined</code>

---

### `renderType:  "custom" | string`

<p>This property specifies how the progress will be render.</p>
<ul>
<li><code>&quot;custom&quot;</code>: Useful for making custom renders of the progress. The
control doesn't render anything and only projects the content of the
default slot. Besides that, all specified properties are still used to
implement the control's accessibility.</li>
</ul>

**Attribute**: <code>render-type</code>

**Default**: <code>"custom"</code>

---

### `loadingRegionRef:  HTMLElement | undefined`

<p>If the control is describing the loading progress of a particular region
of a page, set this property with the reference of the loading region.
This will set the <code>aria-describedby</code> and <code>aria-busy</code> attributes on the
loading region to improve the accessibility while the control is in
progress.</p>
<p>When the control detects that is no longer in progress (aka it is removed
from the DOM or value === maxValue with indeterminate === false), it will
remove the <code>aria-busy</code> attribute and update (or remove if necessary) the
<code>aria-describedby</code> attribute.</p>
<p>If an ID is set prior to the control's first render, the control will use
this ID for the <code>aria-describedby</code>. Otherwise, the control will compute a
unique ID for this matter.</p>
<p><strong>Important</strong>: If you are using Shadow DOM, take into account that the
<code>loadingRegionRef</code> must be in the same Shadow Tree as this control.
Otherwise, the <code>aria-describedby</code> binding won't work, since the control ID
is not visible for the <code>loadingRegionRef</code>.</p>

**Default**: <code>undefined</code>

---

### `value:  number`

<p>Specifies the current value of the component. In other words, how much of
the task that has been completed.</p>
<p>This property is not used if indeterminate === true.</p>

**Attribute**: <code>value</code>

**Default**: <code>DEFAULT_MIN_VALUE</code>
</details>

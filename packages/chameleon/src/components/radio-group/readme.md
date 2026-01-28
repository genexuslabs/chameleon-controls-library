# `ch-radio-group-render`

<p>The radio group control is used to render a short list of mutually exclusive options.</p>
<p>It contains radio items to allow users to select one option from the list of options.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `direction:  "horizontal" | "vertical"`

<p>Specifies the direction of the items.</p>

**Attribute**: <code>direction</code>

**Default**: <code>"horizontal"</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the radio-group is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `model:  RadioGroupModel | undefined`

<p>This property lets you define the items of the ch-radio-group-render control.</p>

**Default**: <code>undefined</code>

---

### `name:  string | undefined`

<p>Specifies the <code>name</code> of the component when used in a form.</p>

**Attribute**: <code>name</code>

**Default**: <code>undefined</code>

---

### `value:  string | undefined`

<p>The value of the control.</p>

**Attribute**: <code>value</code>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `change: string`

<p>Fired when the selected item change. It contains the information about the
new selected value.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `radio__item`

<p>The radio item element.</p>

---

### `radio__container`

<p>The container that serves as a wrapper for the <code>input</code> and the <code>option</code> parts.</p>

---

### `radio__input`

<p>The invisible input element that implements the interactions for the component. This part must be kept &quot;invisible&quot;.</p>

---

### `radio__option`

<p>The actual &quot;input&quot; that is rendered above the <code>input</code> part. This part has <code>position: absolute</code> and <code>pointer-events: none</code>.</p>

---

### `radio__label`

<p>The label that is rendered when the <code>caption</code> property is not empty.</p>

---

### `checked`

<p>Present in the <code>radio__item</code>, <code>radio__option</code>, <code>radio__label</code> and <code>radio__container</code> parts when the control is checked (<code>checked</code> === <code>true</code>).</p>

---

### `disabled`

<p>Present in the <code>radio__item</code>, <code>radio__option</code>, <code>radio__label</code> and <code>radio__container</code> parts when the control is disabled (<code>disabled</code> === <code>true</code>).</p>

---

### `unchecked`

<p>Present in the <code>radio__item</code>, <code>radio__option</code>, <code>radio__label</code> and <code>radio__container</code> parts when the control is not checked (<code>checked</code> !== <code>true</code>).</p>
</details>

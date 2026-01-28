# `ch-slider`

<p>The slider control is a input where the user selects a value from within a given range.</p>

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

### `disabled:  boolean`

<p>This attribute allows you specify if the element is disabled.
If disabled, it will not trigger any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `maxValue:  number`

<p>This attribute lets you specify maximum value of the slider.</p>

**Attribute**: <code>maxvalue</code>

**Default**: <code>5</code>

---

### `minValue:  number`

<p>This attribute lets you specify minimum value of the slider.</p>

**Attribute**: <code>minvalue</code>

**Default**: <code>0</code>

---

### `name:  string | undefined`

<p>Specifies the <code>name</code> of the component when used in a form.</p>

**Attribute**: <code>name</code>

**Default**: <code>undefined</code>

---

### `showValue:  boolean`

<p>This attribute lets you indicate whether the control should display a
bubble with the current value upon interaction.</p>

**Attribute**: <code>showvalue</code>

**Default**: <code>false</code>

---

### `step:  number`

<p>This attribute lets you specify the step of the slider.</p>
<p>This attribute is useful when the values of the slider can only take some
discrete values. For example, if valid values are <code>[10, 20, 30]</code> set the
<code>minValue</code> to <code>10</code>, the maxValue to <code>30</code>, and the step to <code>10</code>. If the
step is <code>0</code>, the any intermediate value is valid.</p>

**Attribute**: <code>step</code>

**Default**: <code>1</code>

---

### `value:  number`

<p>The value of the control.</p>

**Attribute**: <code>value</code>

**Default**: <code>0</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `change: number`

<p>The <code>change</code> event is emitted when a change to the element's value is
committed by the user.</p>

---

### `input: number`

<p>The <code>input</code> event is fired synchronously when the value is changed.</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `createPepe: () => void`

---

### `createPepe2: () => string`

---

### `createPaa: (param1: string, param2: string) => string`

<p>asdasd</p>
<p>asdasd123123
asd.1.23--</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `track`

<p>The track of the slider element.</p>

---

### `thumb`

<p>The thumb of the slider element.</p>

---

### `track__selected`

<p>Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.</p>

---

### `track__unselected`

<p>Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value.</p>

---

### `disabled`

<p>Present in all parts when the control is disabled (<code>disabled</code> === <code>true</code>).</p>
</details>

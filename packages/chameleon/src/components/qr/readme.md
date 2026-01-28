# `ch-qr`

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

### `background:  string`

<p>The background color of the render QR. If not specified, &quot;transparent&quot;
will be used.</p>

**Attribute**: <code>background</code>

**Default**: <code>"white"</code>

---

### `errorCorrectionLevel:  ErrorCorrectionLevel`

<p>The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR
code for error correction respectively. So on one hand the code will get
bigger but chances are also higher that it will be read without errors
later on. This value is by default High (H).</p>

**Attribute**: <code>error-correction-level</code>

**Default**: <code>"High"</code>

---

### `fill:  string`

<p>What color you want your QR code to be.</p>

**Attribute**: <code>fill</code>

**Default**: <code>"black"</code>

---

### `radius:  number`

<p>Defines how round the blocks should be. Numbers from 0 (squares) to 0.5
(maximum round) are supported.</p>

**Attribute**: <code>radius</code>

**Default**: <code>0</code>

---

### `size:  number`

<p>The total size of the final QR code in pixels.</p>

**Attribute**: <code>size</code>

**Default**: <code>128</code>

---

### `value:  string | undefined`

<p>Any kind of text, also links, email addresses, any thing.</p>

**Attribute**: <code>value</code>

**Default**: <code>undefined</code>
</details>

# `ch-infinite-scroll`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `autoScroll: "never" | "at-scroll-end"`

<p>Specifies how the scroll position will be adjusted when the content size
changes when using <code>position = &quot;bottom&quot;</code>.</p>
<ul>
<li>
<p>&quot;at-scroll-end&quot;: If the scroll is positioned at the end of the content,
the infinite-scroll will maintain the scroll at the end while the
content size changes.</p>
</li>
<li>
<p>&quot;never&quot;: The scroll position won't be adjusted when the content size
changes.</p>
</li>
</ul>

**Attribute**: <code>auto-scroll</code>

**Default**: <code>"at-scroll-end"</code>

---

### `dataProvider: boolean`

<p><code>true</code> if the infinite scroll is used in a grid that has data provider.
This attribute determine the utility of the infinite scroll, because in
certain configurations the infinite scroll can be used only to implement
the inverse loading utility.</p>

**Attribute**: <code>data-provider</code>

**Default**: <code>false</code>

---

### `disabled:  boolean`

<p>Specifies if the infinite scroll is disabled. When disabled, the infinite
scroll won't fire any event when reaching the threshold.
The <code>dataProvider</code> property can be <code>true</code> and this property can be <code>false</code>
at the same time, meaning that the infinite scroll is disabled, but if the
control has <code>inverseLoading</code>, the <code>dataProvider</code> property will re-position
the scrollbar when new content is added to the grid.</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `infiniteThresholdReachedCallback:  () => void`

<p>This callback will be called every time the <code>threshold</code> is reached.</p>
<p>When the threshold is met and this callback is executed, the internal
<code>loadingState</code> will be changed to <code>&quot;loading&quot;</code> and the user has to keep in
sync the <code>loadingState</code> of the component with the real state of the data.</p>

**Default**: <code>undefined</code>

---

### `loadingState:  SmartGridDataState`

<p>If <code>&quot;more-data-to-fetch&quot;</code>, the infinite scroll will execute the
<code>infiniteThresholdReachedCallback</code> when the <code>threshold</code> is met. When the
threshold is met, the internal <code>loadingState</code> will be changed to
<code>&quot;loading&quot;</code> and the user has to keep in sync the <code>loadingState</code> of the
component with the real state of the data.</p>
<p>Set this to <code>&quot;all-records-loaded&quot;</code> to disable the infinite scroll from
actively trying to receive new data while reaching the threshold. This is
useful when it is known that there is no more data that can be added, and
the infinite scroll is no longer needed.</p>

**Attribute**: <code>loading-state</code>

**Default**: <code>undefined</code>

---

### `position:  "top" | "bottom"`

<p>The position of the infinite scroll element.
The value can be either <code>top</code> or <code>bottom</code>. When <code>position === &quot;top&quot;</code>, the
control also implements inverse loading.</p>

**Attribute**: <code>position</code>

**Default**: <code>"bottom"</code>

---

### `threshold:  string`

<p>The threshold distance from the bottom of the content to call the
<code>infinite</code> output event when scrolled.
The threshold value can be either a percent, or in pixels. For example,
use the value of <code>10%</code> for the <code>infinite</code> output event to get called when
the user has scrolled 10% from the bottom of the page. Use the value
<code>100px</code> when the scroll is within 100 pixels from the bottom of the page.</p>

**Attribute**: <code>threshold</code>

**Default**: <code>"150px"</code>
</details>

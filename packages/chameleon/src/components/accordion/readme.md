# `ch-accordion-render`

<p>The <code>ch-accordion-render</code> component displays a vertical stack of collapsible panels, each with a clickable header that toggles the visibility of its associated content section.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `disabled:  boolean`

<p>This attribute lets you specify if all accordions are disabled.
If disabled, accordions will not fire any user interaction related event
(for example, <code>expandedChange</code> event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `expandableButtonPosition:  "start" | "end"`

<p>Specifies the position of the expandable button (chevron) in the header
of the panels. <code>&quot;start&quot;</code> places the chevron at the inline-start edge of
the header, while <code>&quot;end&quot;</code> places it at the inline-end edge.</p>

**Attribute**: <code>expandable-button-position</code>

**Default**: <code>"end"</code>

---

### `getImagePathCallback:  GetImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
<code>startImgSrc</code> needs to be resolved. The resolution follows a fallback
chain: per-instance callback → global registry signal → <code>undefined</code>.</p>

**Default**: <code>undefined</code>

---

### `model:  AccordionModel | undefined`

<p>Specifies the items of the control. Each entry is an
<code>AccordionItemModel</code> with at least <code>id</code>, <code>caption</code>, and <code>expanded</code>.
The component mutates <code>item.expanded</code> directly on these model objects
when the user toggles a panel.</p>

**Default**: <code>undefined</code>

---

### `singleItemExpanded:  boolean`

<p>If <code>true</code> only one item will be expanded at the same time.</p>

**Attribute**: <code>single-item-expanded</code>

**Default**: <code>false</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `expandedChange: AccordionItemExpandedChangeEvent`

<p>Fired when an item is expanded or collapsed. The payload is
<code>{ id: string; expanded: boolean }</code>. In <code>singleItemExpanded</code> mode,
multiple events fire: one for each auto-collapsed item (with
<code>expanded: false</code>) followed by one for the newly expanded item.</p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `{item.headerSlotId}`

<p>Named slot projected inside the <code>header</code> button for custom header content. Rendered when the item defines a <code>headerSlotId</code>.</p>

---

### `{item.id}`

<p>Named slot projected inside the <code>section</code> for each item's collapsible body content.</p>
</details>

<details open>
  <summary>
  
  ## CSS Custom Vars
  </summary>
  
### `--ch-accordion__chevron-size = #{$default-decorative-image-size}`

<p>Specifies the box size of the chevron.</p>

---

### `--ch-accordion__chevron-image-size = 100%`

<p>Specifies the image size of the chevron.</p>

---

### `--ch-accordion__chevron-color = currentColor`

<p>Specifies the color of the chevron.</p>

---

### `--ch-accordion-expand-collapse-duration = 0ms`

<p>Specifies duration of the expand and collapse animation.</p>

---

### `--ch-accordion-expand-collapse-timing-function = linear`

<p>Specifies timing function of the expand and collapse animation.</p>

---

### `--ch-accordion__header-background-image = #{$expandable-icon}`

<p>Specifies the background image used for the expandable chevron in the header.</p>
</details>

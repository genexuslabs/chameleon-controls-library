# `ch-action-menu-render`

<p>The <code>ch-action-menu-render</code> component renders a dropdown menu triggered by an expandable button, supporting deeply nested sub-menus and full keyboard accessibility.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `buttonAccessibleName:  string | undefined`

<p>This attribute lets you specify the label for the first expandable button.
Important for accessibility. This property is practically required: without
it the trigger button has no accessible name, making the menu unusable for
screen-reader users.</p>

**Attribute**: <code>button-accessible-name</code>

**Default**: <code>undefined</code>

---

### `blockAlign:  ChPopoverAlign`

<p>Specifies the block alignment of the dropdown menu that is placed
relative to the expandable button. Valid values are <code>&quot;inside-start&quot;</code>,
<code>&quot;center&quot;</code>, <code>&quot;inside-end&quot;</code>, <code>&quot;outside-start&quot;</code>, and <code>&quot;outside-end&quot;</code>.</p>

**Attribute**: <code>block-align</code>

**Default**: <code>"outside-end"</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `expanded:  boolean`

<p>Controls the visibility of the dropdown menu. Set to <code>true</code> to open the
dropdown and <code>false</code> to close it.</p>

**Attribute**: <code>expanded</code>

**Default**: <code>false</code>

---

### `getImagePathCallback:  ActionMenuImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc or endImgSrc (of an item) needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `inlineAlign:  ChPopoverAlign`

<p>Specifies the inline alignment of the dropdown section that is placed
relative to the expandable button. Valid values are <code>&quot;inside-start&quot;</code>,
<code>&quot;center&quot;</code>, <code>&quot;inside-end&quot;</code>, <code>&quot;outside-start&quot;</code>, and <code>&quot;outside-end&quot;</code>.</p>

**Attribute**: <code>inline-align</code>

**Default**: <code>"center"</code>

---

### `model:  ActionMenuModel | undefined`

<p>This property lets you define the model of the control.</p>

**Default**: <code>undefined</code>

---

### `positionTry:  "flip-block" | "flip-inline" | "none"`

<p>Specifies an alternative position to try when the popover overflows the
window.</p>

**Attribute**: <code>position-try</code>

**Default**: <code>"none"</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `buttonClick: ActionMenuItemActionableModel`

<p>Fired when a button is clicked.
This event can be prevented.</p>

---

### `expandedChange: boolean`

<p>Fired when the visibility of the main dropdown is changed.</p>

---

### `expandedItemChange: ActionMenuExpandedChangeEvent`

<p>Fired when the visibility of a dropdown item is changed.</p>

---

### `hyperlinkClick: ActionMenuHyperlinkClickEvent`

<p>Fired when an hyperlink is clicked.
This event can be prevented, but the dropdown will be closed in any case
(prevented or not).</p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `- Default slot projected inside the expandable button. Use it to provide the button label or icon.`

---

### `{name}`

<p>Named slots matching each item of <code>type: &quot;slot&quot;</code> in the model. Use them to inject custom content at specific positions in the menu.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `expandable-button`

<p>The top-level button that toggles the dropdown. Also receives the <code>expanded</code>, <code>collapsed</code>, and <code>disabled</code> state parts.</p>

---

### `window`

<p>The popover container that holds the dropdown menu items.</p>

---

### `action`

<p>The clickable row element for each menu item.</p>

---

### `button`

<p>A <code>&lt;button&gt;</code>-type action row. Receives <code>expandable</code>, <code>expanded</code>, <code>collapsed</code>, and <code>disabled</code> state parts.</p>

---

### `link`

<p>An <code>&lt;a&gt;</code>-type action row.</p>

---

### `content`

<p>The content area inside each action row (caption + optional icon).</p>

---

### `shortcut`

<p>The keyboard shortcut label rendered at the end of an action row.</p>

---

### `separator`

<p>A horizontal divider rendered for items of <code>type: &quot;separator&quot;</code>.</p>

---

### `expandable`

<p>Present in the <code>button</code> part when the item has sub-items.</p>

---

### `expanded`

<p>Present in the <code>button</code> part when the item's sub-menu is open.</p>

---

### `collapsed`

<p>Present in the <code>button</code> part when the item's sub-menu is closed.</p>

---

### `disabled`

<p>Present in the <code>button</code> part when the item is disabled.</p>
</details>

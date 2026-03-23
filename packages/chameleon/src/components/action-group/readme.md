# `ch-action-group-render`

<p>The <code>ch-action-group-render</code> component displays a horizontal group of actionable items that adapts to the available space by collapsing overflowing items into a &quot;more actions&quot; dropdown menu.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `getImagePathCallback:  ActionMenuImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc or endImgSrc (of an item) needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `itemsOverflowBehavior:  ItemsOverflowBehavior`

<p>This attribute determines how items behave when the content of the ActionGroup overflows horizontal. This property is needed
to make the control responsive to changes in the width of the container of ActionGroup.</p>
<p>| Value                 | Details                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| <code>add-scroll</code>          | The items of the ActionGroup that overflow horizontally are shown by means of a scroll.          |
| <code>multiline</code>           | The ActionGroup items that overflow horizontally are shown in a second line of the control.      |
| <code>responsive-collapse</code> | The Action Group items, when they start to overflow the control, are placed in the More Actions. |</p>

**Attribute**: <code>items-overflow-behavior</code>

**Default**: <code>"responsive-collapse"</code>

---

### `model:  ActionGroupModel | undefined`

<p>This property lets you define the model of the ch-action-group control.</p>

**Default**: <code>undefined</code>

---

### `moreActionsAccessibleName:  string`

<p>This property lets you specify the label for the more actions button.
Important for accessibility.</p>

**Attribute**: <code>more-actions-accessible-name</code>

**Default**: <code>"Show more actions"</code>

---

### `moreActionsBlockAlign:  ChPopoverAlign`

<p>Specifies the block alignment of the more actions dropdown that is
placed relative to the &quot;more actions&quot; button.</p>

**Attribute**: <code>more-actions-block-align</code>

**Default**: <code>"outside-end"</code>

---

### `moreActionsCaption:  string | undefined`

<p>This attribute lets you specify the caption for the more actions button.</p>

**Attribute**: <code>more-actions-caption</code>

**Default**: <code>undefined</code>

---

### `moreActionsInlineAlign:  ChPopoverAlign`

<p>Specifies the inline alignment of the more actions dropdown that is
placed relative to the &quot;more actions&quot; button.</p>

**Attribute**: <code>more-actions-inline-align</code>

**Default**: <code>"inside-start"</code>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `{name}`

<p>Named slots matching each item of <code>type: &quot;slot&quot;</code> in the model. These slots allow projecting custom content for individual action items and are forwarded into the overflow menu when the item collapses.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `separator`

<p>A horizontal divider rendered for items of <code>type: &quot;separator&quot;</code>. Also receives the item's <code>id</code> and custom <code>parts</code> if defined.</p>

---

### `vertical`

<p>Present on <code>separator</code> items.</p>
</details>

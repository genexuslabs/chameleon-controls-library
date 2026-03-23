# `ch-action-list-render`

<p>The <code>ch-action-list-render</code> component renders an interactive list of actionable items driven by a declarative model.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `checkbox:  boolean`

<p>Set this attribute if you want display a checkbox in all items by default.</p>

**Attribute**: <code>checkbox</code>

**Default**: <code>false</code>

---

### `checked:  boolean`

<p>Set this attribute if you want the checkbox to be checked in all items by
default.
Only works if <code>checkbox = true</code></p>

**Attribute**: <code>checked</code>

**Default**: <code>false</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if all items are disabled.
If disabled, action list items will not fire any user interaction related
event (for example, <code>selectedItemsChange</code> event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `editableItems:  boolean`

<p>This attribute lets you specify if the edit operation is enabled in all
items by default. If <code>true</code>, the items can edit its caption in place.
Note: the default value is <code>true</code>, so items are editable unless
explicitly disabled.</p>

**Attribute**: <code>editable-items</code>

**Default**: <code>DEFAULT_EDITABLE_ITEMS_VALUE</code>

---

### `fixItemCallback: ((itemInfo: ActionListItemActionable, newFixedValue: boolean) => Promise<boolean>) | undefined`

<p>Callback that is executed when and item requests to be fixed/unfixed.
If the callback is not defined, the item will be fixed/unfixed without
further confirmation.</p>

**Default**: <code>undefined</code>

---

### `getImagePathCallback: ActionListImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
imgSrc needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `model:  ActionListModel`

<p>This property lets you define the model of the control. The model is an
array of <code>ActionListItemModel</code> objects. Each item has a <code>type</code>
(<code>&quot;actionable&quot;</code>, <code>&quot;group&quot;</code>, or <code>&quot;separator&quot;</code>), an <code>id</code>, a <code>caption</code>,
and optional properties such as <code>selected</code>, <code>disabled</code>, <code>fixed</code>, <code>order</code>,
and nested <code>items</code> (for groups).</p>

**Default**: <code>[]</code>

---

### `modifyItemCaptionCallback: ((actionListItemId: string, newCaption: string) => Promise<void>) | undefined`

<p>Callback that is executed when a item request to modify its caption.</p>

**Default**: <code>undefined</code>

---

### `renderItem: ((itemModel: ActionListItemModel, actionListRenderState: ChActionListRender, disabled?: boolean, nested?: boolean, nestedExpandable?: boolean) => TemplateResult | typeof nothing) | undefined`

<p>This property allows us to implement custom rendering of action-list items.</p>

**Default**: <code>undefined</code>

---

### `removeItemCallback: ((itemInfo: ActionListItemActionable) => Promise<boolean>) | undefined`

<p>Callback that is executed when and item requests to be removed.
If the callback is not defined, the item will be removed without further
confirmation.</p>

**Default**: <code>undefined</code>

---

### `selection:  "single" | "multiple" | "none"`

<p>Specifies the type of selection implemented by the control.</p>
<ul>
<li><code>&quot;none&quot;</code>: No selection; item clicks fire the <code>itemClick</code> event.</li>
<li><code>&quot;single&quot;</code>: Only one item can be selected at a time.</li>
<li><code>&quot;multiple&quot;</code>: Multiple items can be selected using modifier-key clicks.</li>
</ul>

**Attribute**: <code>selection</code>

**Default**: <code>"none"</code>

---

### `sortItemsCallback: (subModel: ActionListModel) => void`

<p>Callback that is executed when the action-list model is changed to order its items.</p>

**Default**: <code>defaultSortItemsCallback</code>

---

### `translations:  ActionListTranslations`

<p>Specifies the literals required for the control.</p>

**Default**: <code>actionListDefaultTranslations</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `selectedItemsChange: ActionListItemModelExtended[]`

<p>Fired when the selected items change and <code>selection !== &quot;none&quot;</code></p>

---

### `itemClick: ActionListItemModelExtended`

<p>Fired when an item is clicked and <code>selection === &quot;none&quot;</code>.
Applies for items that have <code>type === &quot;actionable&quot;</code> or
(<code>type === &quot;group&quot;</code> and <code>expandable === true</code>)</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `addItem: (itemInfo: ActionListItemModel, groupParentId: string) => void`

<p>Adds an item in the control.</p>
<p>If the item already exists, the operation is canceled.</p>
<p>If the <code>groupParentId</code> property is specified the item is added in the
group determined by <code>groupParentId</code>. It only works if the item to add
has <code>type === &quot;actionable&quot;</code></p>

---

### `getItemsInfo: (itemsId: string[]) => ActionListItemModelExtended[]`

<p>Given a list of ids, it returns an array of the items that exists in the
given list.</p>

---

### `removeItem: (itemId: string) => void`

<p>Remove the item and all its descendants from the control.</p>

---

### `updateItemProperties: (itemId: string, properties: Partial<ActionListItemModel> & { type: ActionListItemType }) => void`

<p>Given an itemId and the properties to update, it updates the properties
of the items in the list.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `separator`

<p>A horizontal divider rendered between items when the model contains an item of <code>type: &quot;separator&quot;</code>.</p>

---

### `item__action`

<p>The clickable row element for each actionable item.</p>

---

### `item__caption`

<p>The text caption inside an actionable item.</p>

---

### `item__checkbox`

<p>The checkbox element rendered when <code>checkbox</code> is <code>true</code>.</p>

---

### `group__action`

<p>The clickable header row for a group item.</p>

---

### `group__caption`

<p>The text caption inside a group header.</p>

---

### `group__expandable`

<p>The expandable/collapsible container for a group's children.</p>

---

### `disabled`

<p>Present in the <code>item__action</code>, <code>item__caption</code>, <code>group__action</code>, and <code>group__caption</code> parts when the item is disabled.</p>

---

### `expanded`

<p>Present in the <code>group__expandable</code> part when the group is expanded.</p>

---

### `collapsed`

<p>Present in the <code>group__expandable</code> part when the group is collapsed.</p>

---

### `selected`

<p>Present in the <code>item__action</code> and <code>group__action</code> parts when the item is selected.</p>

---

### `not-selected`

<p>Present in the <code>item__action</code> and <code>group__action</code> parts when the item is not selected.</p>
</details>

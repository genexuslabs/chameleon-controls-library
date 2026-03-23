# `ch-popover`

<p>The <code>ch-popover</code> component renders a positioned overlay container anchored to a reference element using the native Popover API and <code>position: fixed</code>.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `actionById:  boolean`

<p><code>true</code> if the <code>actionElement</code> binds the ch-popover using an external ID.
If so, the <code>popoverTargetElement</code> property won't be configured in the
action element.</p>

**Attribute**: <code>actionbyid</code>

**Default**: <code>false</code>

---

### `actionElement:  PopoverActionElement`

<p>Specifies a reference of the action that controls the popover control.</p>

**Attribute**: <code>actionelement</code>

**Default**: <code>undefined</code>

---

### `allowDrag:  "box" | "header" | "no"`

<p>Specifies the drag behavior of the popover.
If <code>allowDrag === &quot;header&quot;</code>, a slot with the <code>&quot;header&quot;</code> name will be
available to place the header content.</p>

**Attribute**: <code>allow-drag</code>

**Default**: <code>"no"</code>

---

### `blockAlign:  ChPopoverAlign`

<p>Specifies the block alignment of the popover relative to its action
element. Valid values: <code>&quot;outside-start&quot;</code>, <code>&quot;inside-start&quot;</code>, <code>&quot;center&quot;</code>,
<code>&quot;inside-end&quot;</code>, <code>&quot;outside-end&quot;</code>.</p>

**Attribute**: <code>block-align</code>

**Default**: <code>"center"</code>

---

### `blockSizeMatch:  ChPopoverSizeMatch`

<p>Specifies how the popover adapts its block size.</p>
<ul>
<li>&quot;content&quot;: The block size of the control will be determined by its
content block size.</li>
<li>&quot;action-element&quot;: The block size of the control will match the block
size of the <code>actionElement</code>.</li>
<li>&quot;action-element-as-minimum&quot;: The minimum block size of the control
will match the block size of the <code>actionElement</code>.</li>
</ul>
<p>If the control is resized at runtime, only the &quot;action-element-as-minimum&quot;
value will still work.</p>

**Attribute**: <code>block-size-match</code>

**Default**: <code>"content"</code>

---

### `closeOnClickOutside:  boolean`

<p>This property only applies for <code>&quot;manual&quot;</code> mode. In native popovers, when
using <code>&quot;manual&quot;</code> mode the popover doesn't close when clicking outside the
control. This property allows to close the popover when clicking outside
in <code>&quot;manual&quot;</code> mode.
With this, the popover will close if the click is triggered on any other
element than the popover and the <code>actionElement</code>. It will also close if
the &quot;Escape&quot; key is pressed.</p>

**Attribute**: <code>close-on-click-outside</code>

**Default**: <code>false</code>

---

### `firstLayer:  boolean`

<p><code>true</code> if the popover is not stacked inside another top layer (e.g., not
nested within another popover). When <code>true</code>, a CSS class is temporarily
applied to prevent initial positioning flickering while the popover
calculates its alignment.</p>

**Attribute**: <code>first-layer</code>

**Default**: <code>true</code>

---

### `inlineAlign:  ChPopoverAlign`

<p>Specifies the inline alignment of the popover relative to its action
element. Valid values: <code>&quot;outside-start&quot;</code>, <code>&quot;inside-start&quot;</code>, <code>&quot;center&quot;</code>,
<code>&quot;inside-end&quot;</code>, <code>&quot;outside-end&quot;</code>.</p>

**Attribute**: <code>inline-align</code>

**Default**: <code>"center"</code>

---

### `inlineSizeMatch:  ChPopoverSizeMatch`

<p>Specifies how the popover adapts its inline size.</p>
<ul>
<li>&quot;content&quot;: The inline size of the control will be determined by its
content inline size.</li>
<li>&quot;action-element&quot;: The inline size of the control will match the inline
size of the <code>actionElement</code>.</li>
<li>&quot;action-element-as-minimum&quot;: The minimum inline size of the control
will match the inline size of the <code>actionElement</code>.</li>
</ul>
<p>If the control is resized at runtime, only the &quot;action-element-as-minimum&quot;
value will still work.</p>

**Attribute**: <code>inline-size-match</code>

**Default**: <code>"content"</code>

---

### `mode:  "auto" | "manual"`

<p>Popovers that have the <code>&quot;auto&quot;</code> state can be &quot;light dismissed&quot; by
selecting outside the popover area, and generally only allow one popover
to be displayed on-screen at a time. By contrast, <code>&quot;manual&quot;</code> popovers must
always be explicitly hidden, but allow for use cases such as nested
popovers in menus.</p>

**Attribute**: <code>popover</code>

**Default**: <code>"auto"</code>

---

### `overflowBehavior:  "overflow" | "add-scroll"`

<p>Specifies how the popover behaves when the content overflows the window
size.</p>
<ul>
<li>&quot;overflow&quot;: The control won't implement any behavior if the content overflows.</li>
<li>&quot;add-scroll&quot;: The control will place a scroll if the content overflows.</li>
</ul>

**Attribute**: <code>overflow-behavior</code>

**Default**: <code>"overflow"</code>

---

### `positionTry:  "flip-block" | "flip-inline" | "none"`

<p>Specifies an alternative position to try when the control overflows the
window.</p>

**Attribute**: <code>position-try</code>

**Default**: <code>"none"</code>

---

### `resizable:  boolean`

<p>Specifies whether the control can be resized. If <code>true</code> the control can be
resized at runtime by dragging the edges or corners.</p>

**Attribute**: <code>resizable</code>

**Default**: <code>false</code>

---

### `show:  boolean`

<p>Specifies whether the popover is hidden or visible.</p>

**Attribute**: <code>show</code>

**Default**: <code>false</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `popoverOpened: void`

<p>Emitted when the popover is opened by an user interaction.</p>
<p>This event can be prevented (<code>preventDefault()</code>), interrupting the
ch-popover's opening.</p>

---

### `popoverClosed: PopoverClosedInfo`

<p>Emitted when the popover is closed by an user interaction.</p>
<p>This event can be prevented (<code>preventDefault()</code>), interrupting the
<code>ch-popover</code>'s closing.</p>
<p>The <code>reason</code> property of the event provides more information about
the cause of the closing:</p>
<ul>
<li>
<p><code>&quot;click-outside&quot;</code>: The popover is being closed because the user clicked
outside the popover when using <code>closeOnClickOutside === true</code> and
<code>mode === &quot;manual&quot;</code>.</p>
</li>
<li>
<p><code>&quot;escape-key&quot;</code>: The popover is being closed because the user pressed the
&quot;Escape&quot; key when using <code>closeOnClickOutside === true</code> and
<code>mode === &quot;manual&quot;</code>.</p>
</li>
<li>
<p><code>&quot;popover-no-longer-visible&quot;</code>: The popover is being closed because it
is no longer visible.</p>
</li>
<li>
<p><code>&quot;toggle&quot;</code>: The popover is being closed by the native toggle behavior
of popover. It can be produced by the user clicking the <code>actionElement</code>,
pressing the &quot;Enter&quot; or &quot;Space&quot; keys on the <code>actionElement</code>, pressing
the &quot;Escape&quot; key or other. Used when <code>mode === &quot;auto&quot;</code>.</p>
</li>
</ul>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `header`

<p>Content projected into the header area. Rendered when <code>allowDrag === &quot;header&quot;</code>.</p>

---

### `- Default slot. The main content of the popover.`
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `header`

<p>A draggable header area rendered when <code>allowDrag === &quot;header&quot;</code>. Projects the &quot;header&quot; slot.</p>
</details>

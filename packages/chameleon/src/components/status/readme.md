# `ch-status`

<p>The <code>ch-status</code> component provides a lightweight loading indicator that communicates an ongoing process to both visual users and assistive technologies.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName: string | undefined`

<p>Specifies a short string that authors associate with an element
to provide users of assistive technologies with a label for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `loadingRegionRef:  HTMLElement | undefined`

<p>If the control is describing the loading progress of a particular region
of a page, set this property with the reference of the loading region.
This will set the <code>aria-describedby</code> and <code>aria-busy</code> attributes on the
loading region to improve accessibility while the control is in rendered.</p>
<p>When the control detects that is no longer rendered (aka it is removed
from the DOM), it will remove the <code>aria-busy</code> attribute and the
<code>aria-describedby</code> attribute.</p>
<p><strong>Note</strong>: Setting this prop overwrites any existing <code>aria-describedby</code>
value on the referenced element — it replaces rather than appends.</p>
<p>If an ID is set prior to the component's first render, the ch-status will use
this ID for the <code>aria-describedby</code>. Otherwise, the ch-status will compute a
unique ID for this matter.</p>
<p><strong>Important</strong>: If you are using Shadow DOM, take into account that the
<code>loadingRegionRef</code> must be in the same Shadow Tree as the ch-status.
Otherwise, the <code>aria-describedby</code> binding won't work, since the control ID
is not visible for the <code>loadingRegionRef</code>.</p>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `- Default slot. Use it to project custom visual content such as a spinner icon or loading text. Content changes trigger polite `aria-live` announcements to assistive technologies.`
</details>

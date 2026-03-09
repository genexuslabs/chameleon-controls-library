# ch-popover - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Aligned Popover](#aligned-popover)
- [Responsive Popover](#responsive-popover)
- [Popover with Action Group](#popover-with-action-group)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple popover anchored below a trigger button.

### HTML

```html
<button id="trigger-btn">Open Menu</button>

<ch-popover
  id="my-popover"
  block-align="outside-end"
  inline-align="inside-start"
  show="false"
>
  <ul>
    <li>Option A</li>
    <li>Option B</li>
    <li>Option C</li>
  </ul>
</ch-popover>
```

### JavaScript

```js
const popover = document.getElementById("my-popover");
const trigger = document.getElementById("trigger-btn");

// Set the action element so the popover knows where to anchor
popover.actionElement = trigger;

trigger.addEventListener("click", () => {
  popover.show = !popover.show;
});

popover.addEventListener("popoverClosed", (event) => {
  console.log("Popover closed, reason:", event.detail.reason);
});
```

### Key Points

- The `actionElement` property tells the popover which element to anchor to. It must be set programmatically (it is not an HTML attribute).
- `block-align="outside-end"` positions the popover below the trigger, and `inline-align="inside-start"` aligns it to the start edge.
- In `"auto"` mode (the default), clicking outside the popover or pressing Escape automatically closes it.
- The `popoverClosed` event provides a `reason` in its detail (`"toggle"`, `"click-outside"`, `"escape-key"`, or `"popover-no-longer-visible"`).

## Aligned Popover

Demonstrates different block and inline alignment combinations.

### HTML

```html
<button id="btn-below">Below (default)</button>
<ch-popover id="popover-below" block-align="outside-end" inline-align="center">
  <p>Centered below the trigger.</p>
</ch-popover>

<button id="btn-right">To the right</button>
<ch-popover id="popover-right" block-align="center" inline-align="outside-end">
  <p>Centered to the right of the trigger.</p>
</ch-popover>

<button id="btn-above">Above</button>
<ch-popover id="popover-above" block-align="outside-start" inline-align="center">
  <p>Centered above the trigger.</p>
</ch-popover>
```

### JavaScript

```js
function setupPopover(buttonId, popoverId) {
  const btn = document.getElementById(buttonId);
  const popover = document.getElementById(popoverId);
  popover.actionElement = btn;

  btn.addEventListener("click", () => {
    popover.show = !popover.show;
  });
}

setupPopover("btn-below", "popover-below");
setupPopover("btn-right", "popover-right");
setupPopover("btn-above", "popover-above");
```

### Key Points

- `blockAlign` controls the vertical position relative to the action element: `"outside-start"` (above), `"inside-start"`, `"center"`, `"inside-end"`, `"outside-end"` (below).
- `inlineAlign` controls the horizontal position: `"outside-start"` (left of), `"inside-start"`, `"center"`, `"inside-end"`, `"outside-end"` (right of).
- Use `--ch-popover-separation-x` and `--ch-popover-separation-y` to add spacing between the action element and the popover.
- All alignment values work correctly in RTL layouts.

## Responsive Popover

Demonstrates a popover that flips its position when it would overflow the viewport.

### HTML

```html
<button id="trigger-btn" style="position: fixed; bottom: 16px; left: 16px;">
  Open Popover
</button>

<ch-popover
  id="my-popover"
  block-align="outside-end"
  inline-align="inside-start"
  position-try="flip-block"
  show="false"
  style="
    --ch-popover-inline-size: 240px;
    --ch-popover-separation-y: 4px;
  "
>
  <p>This popover flips above the button if there is not enough space below.</p>
</ch-popover>
```

### JavaScript

```js
const popover = document.getElementById("my-popover");
const trigger = document.getElementById("trigger-btn");

popover.actionElement = trigger;

trigger.addEventListener("click", () => {
  popover.show = !popover.show;
});
```

### Key Points

- `position-try="flip-block"` flips the popover to the opposite side along the block axis (e.g., from below to above) when it would overflow the viewport.
- `position-try="flip-inline"` does the same along the inline axis (e.g., from right to left).
- `overflow-behavior="add-scroll"` is an alternative strategy that adds a scrollbar instead of flipping.
- The popover re-evaluates its position on scroll and window resize events automatically.

## Popover with Action Group

Demonstrates a popover containing a list of action items, such as a context menu or overflow menu.

### HTML

```html
<button id="more-btn" aria-haspopup="true">More actions</button>

<ch-popover
  id="actions-popover"
  block-align="outside-end"
  inline-align="inside-start"
  show="false"
  style="
    --ch-popover-inline-size: 200px;
    --ch-popover-separation-y: 4px;
  "
>
  <div role="menu">
    <button role="menuitem" class="action-item">Edit</button>
    <button role="menuitem" class="action-item">Duplicate</button>
    <button role="menuitem" class="action-item">Archive</button>
    <hr />
    <button role="menuitem" class="action-item danger">Delete</button>
  </div>
</ch-popover>
```

### JavaScript

```js
const popover = document.getElementById("actions-popover");
const moreBtn = document.getElementById("more-btn");

popover.actionElement = moreBtn;

moreBtn.addEventListener("click", () => {
  popover.show = !popover.show;
});

// Close the popover when an action is clicked
popover.addEventListener("click", (event) => {
  const item = event.target.closest("[role='menuitem']");
  if (item) {
    console.log("Action selected:", item.textContent);
    popover.show = false;
  }
});
```

### Key Points

- Add `aria-haspopup="true"` on the trigger button to indicate that it opens a popup menu.
- Use `role="menu"` on the container and `role="menuitem"` on each action for proper accessibility semantics.
- In `"auto"` mode, the popover closes automatically when clicking outside. Actions inside the popover should also close it explicitly by setting `show = false`.
- For nested menus, use `mode="manual"` and `close-on-click-outside="true"` to prevent parent popovers from closing when a child opens.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

# ch-dialog - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Draggable Dialog](#draggable-dialog)
- [Resizable Dialog](#resizable-dialog)
- [Dialog with Form](#dialog-with-form)
- [Confirmation Dialog](#confirmation-dialog)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple modal dialog with a header, body content, and a close button.

### HTML

```html
<ch-dialog
  caption="Welcome"
  show-header="true"
  closable="true"
  show="true"
>
  <p>This is a basic modal dialog with default centered positioning.</p>
</ch-dialog>
```

### JavaScript

```js
const dialog = document.querySelector("ch-dialog");

dialog.addEventListener("dialogClosed", () => {
  console.log("Dialog was closed");
});

// Open the dialog programmatically
function openDialog() {
  dialog.show = true;
}
```

### Key Points

- The dialog opens as a modal by default (`modal` defaults to `true`), which means it traps focus and renders above the rest of the page.
- Setting `show-header="true"` renders the built-in header with a caption and close button.
- When `closable` is `true`, the user can dismiss the dialog via the close button, the Escape key, or clicking outside the dialog.
- The `dialogClosed` event fires when the dialog is closed by user interaction. Call `preventDefault()` on the event to block the close.

## Draggable Dialog

Demonstrates a dialog that the user can drag to reposition on screen.

### HTML

```html
<ch-dialog
  caption="Draggable Panel"
  show-header="true"
  closable="true"
  allow-drag="header"
  show="true"
>
  <p>Drag the header bar to move this dialog around the screen.</p>
</ch-dialog>
```

### JavaScript

```js
const dialog = document.querySelector("ch-dialog");

dialog.addEventListener("dialogClosed", () => {
  console.log("Draggable dialog closed");
});
```

### Key Points

- `allow-drag="header"` restricts dragging to the header area. The user grabs the header to move the dialog.
- `allow-drag="box"` allows dragging from anywhere inside the dialog, including the content area.
- During drag, the component adds `pointer-events: none` and `user-select: none` to slotted content to prevent accidental selections or clicks.
- The drag offset is tracked via CSS custom properties (`--ch-dialog-dragged-x`, `--ch-dialog-dragged-y`) and persists until the dialog is closed.
- RTL layouts are fully supported; the drag direction adjusts automatically.

## Resizable Dialog

Demonstrates a dialog that users can resize by dragging its edges or corners.

### HTML

```html
<ch-dialog
  caption="Resizable Panel"
  show-header="true"
  closable="true"
  resizable="true"
  show="true"
  style="
    --ch-dialog-inline-size: 500px;
    --ch-dialog-block-size: 350px;
    --ch-dialog-min-inline-size: 300px;
    --ch-dialog-min-block-size: 200px;
    --ch-dialog-max-inline-size: 900px;
    --ch-dialog-max-block-size: 600px;
  "
>
  <p>Drag the edges or corners of this dialog to resize it.</p>
</ch-dialog>
```

### JavaScript

```js
const dialog = document.querySelector("ch-dialog");

dialog.addEventListener("dialogClosed", () => {
  console.log("Resizable dialog closed");
});
```

### Key Points

- Set `resizable="true"` to enable resize handles on all four edges and four corners.
- Resize handles are invisible overlays rendered inside the shadow DOM; their grab area is controlled by `--ch-dialog-resize-threshold` (default `8px`).
- Use `--ch-dialog-min-*` and `--ch-dialog-max-*` custom properties to constrain the resize bounds.
- Set `adjust-position-after-resize="true"` if you want the dialog to re-center after a resize operation finishes. By default, the dialog stays at its resized position.
- The resize cursor is applied globally to the document body during the operation for a smooth experience.

## Dialog with Form

Demonstrates a dialog containing a form, with action buttons in the footer.

### HTML

```html
<ch-dialog
  caption="Edit Profile"
  show-header="true"
  show-footer="true"
  closable="true"
  show="true"
  style="--ch-dialog-inline-size: 450px;"
>
  <form id="profile-form">
    <label>
      Name
      <input type="text" name="name" required />
    </label>
    <label>
      Email
      <input type="email" name="email" required />
    </label>
  </form>

  <div slot="footer">
    <button type="button" id="cancel-btn">Cancel</button>
    <button type="submit" form="profile-form">Save</button>
  </div>
</ch-dialog>
```

### JavaScript

```js
const dialog = document.querySelector("ch-dialog");
const form = document.getElementById("profile-form");
const cancelBtn = document.getElementById("cancel-btn");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  console.log("Name:", data.get("name"));
  console.log("Email:", data.get("email"));
  dialog.show = false;
});

cancelBtn.addEventListener("click", () => {
  dialog.show = false;
});
```

### Key Points

- `show-footer="true"` enables the footer slot, where you can place action buttons like Cancel and Save.
- Use the `slot="footer"` attribute on a container element to project content into the footer area.
- The `form` attribute on the submit button links it to the form by ID, allowing the button to live outside the `<form>` tag.
- Closing the dialog programmatically (`dialog.show = false`) does not fire the `dialogClosed` event; that event only fires on user-initiated closes.

## Confirmation Dialog

Demonstrates a confirmation dialog pattern that prevents accidental dismissal.

### HTML

```html
<ch-dialog
  id="confirm-dialog"
  caption="Delete Item"
  show-header="true"
  show-footer="true"
  closable="true"
  show="false"
  style="--ch-dialog-inline-size: 400px;"
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>

  <div slot="footer">
    <button type="button" id="cancel-btn">Cancel</button>
    <button type="button" id="confirm-btn">Delete</button>
  </div>
</ch-dialog>
```

### JavaScript

```js
const dialog = document.getElementById("confirm-dialog");
const cancelBtn = document.getElementById("cancel-btn");
const confirmBtn = document.getElementById("confirm-btn");

// Open the confirmation dialog
function showConfirmation() {
  dialog.show = true;
}

cancelBtn.addEventListener("click", () => {
  dialog.show = false;
});

confirmBtn.addEventListener("click", () => {
  console.log("Item deleted");
  dialog.show = false;
});

// Optional: prevent accidental close and require explicit button click
dialog.addEventListener("dialogClosed", (event) => {
  event.preventDefault();
});
```

### Key Points

- Call `event.preventDefault()` on the `dialogClosed` event to block the dialog from closing when the user presses Escape or clicks outside. This forces them to use the explicit Cancel or Delete buttons.
- Set `closable="false"` as an alternative approach to completely remove the close button and disable Escape/outside-click dismissal.
- The dialog starts hidden (`show="false"`) and is opened programmatically by setting `show = true`.
- Multiple modal dialogs can be stacked; only the topmost one responds to outside clicks and Escape.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.

### Don't

- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

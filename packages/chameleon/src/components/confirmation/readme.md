# `ch-confirmation`

<p>The <code>ch-confirmation</code> component manages approval workflows with four distinct states: pending approval request, approval responded, output denied, and output available. It provides a white-label interface that can be styled entirely through CSS parts.</p>

## Overview

The confirmation component displays conditional messages and action buttons based on the current workflow state. In the `approval-requested` state, it shows approve/reject buttons. In other states, it displays the appropriate status message without action buttons.

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName: string | undefined`

<p>Specifies the accessible name for the component when no title is provided. Used for <code>aria-label</code> when there is no title to reference with <code>aria-labelledby</code>.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `approval: ConfirmationApproval | undefined`

<p>The approval object containing the approval context. Should include an <code>id</code> property that identifies the approval process. This <code>id</code> is included in emitted events.</p>

**Type**: <code>{ id?: string; approved?: boolean }</code>

**Default**: <code>undefined</code>

---

### `state: ConfirmationState`

<p>Specifies the current state of the confirmation workflow. Determines which message is displayed and whether action buttons are shown.</p>

**Possible values**:
- <code>"approval-requested"</code>: Shows request message with approve/reject buttons
- <code>"approval-responded"</code>: Shows accepted message (no buttons)
- <code>"output-denied"</code>: Shows rejected message (no buttons)
- <code>"output-available"</code>: Shows accepted message (no buttons)

**Attribute**: <code>state</code>

**Default**: <code>"approval-requested"</code>

---

### `title: string | undefined`

<p>Optional title displayed at the top of the confirmation alert. When provided, the component uses <code>aria-labelledby</code> to reference this title for accessibility.</p>

**Attribute**: <code>title</code>

**Default**: <code>undefined</code>

---

### `requestMessage: string | undefined`

<p>The message displayed when the state is <code>"approval-requested"</code>. This message is shown alongside the approve and reject buttons.</p>

**Attribute**: <code>request-message</code>

**Default**: <code>undefined</code>

---

### `acceptedMessage: string | undefined`

<p>The message displayed when the state is <code>"approval-responded"</code> or <code>"output-available"</code>. This message confirms that the request was approved.</p>

**Attribute**: <code>accepted-message</code>

**Default**: <code>undefined</code>

---

### `rejectedMessage: string | undefined`

<p>The message displayed when the state is <code>"output-denied"</code>. This message indicates that the request was rejected.</p>

**Attribute**: <code>rejected-message</code>

**Default**: <code>undefined</code>

---

### `approveButtonLabel: string | undefined`

<p>Customizes the label for the approve button. Useful for internationalization. The label is also used as the button's <code>aria-label</code>.</p>

**Attribute**: <code>approve-button-label</code>

**Default**: <code>"Approve"</code>

---

### `rejectButtonLabel: string | undefined`

<p>Customizes the label for the reject button. Useful for internationalization. The label is also used as the button's <code>aria-label</code>.</p>

**Attribute**: <code>reject-button-label</code>

**Default**: <code>"Reject"</code>

</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `approve: ConfirmationApproveEvent`

<p>Fired when the user clicks the approve button (only available in <code>"approval-requested"</code> state). The event detail contains <code>{ approvalId?: string }</code> where <code>approvalId</code> is the <code>id</code> from the <code>approval</code> property.</p>

**Payload**: <code>{ approvalId?: string }</code>

**Example**:
```javascript
confirmationElement.addEventListener('approve', (event) => {
  console.log('Approval ID:', event.detail.approvalId);
  // Handle approval logic
});
```

---

### `reject: ConfirmationRejectEvent`

<p>Fired when the user clicks the reject button (only available in <code>"approval-requested"</code> state). The event detail contains <code>{ approvalId?: string }</code> where <code>approvalId</code> is the <code>id</code> from the <code>approval</code> property.</p>

**Payload**: <code>{ approvalId?: string }</code>

**Example**:
```javascript
confirmationElement.addEventListener('reject', (event) => {
  console.log('Approval ID:', event.detail.approvalId);
  // Handle rejection logic
});
```

</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>

The component exposes the following CSS parts for complete styling control:

### Static Parts

### `container`

<p>The main wrapper element. Also includes state-specific parts (see below).</p>

**Usage**:
```css
ch-confirmation::part(container) {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 1.5rem;
  border-radius: 8px;
}
```

---

### `title`

<p>The title element (only present when <code>title</code> property is set).</p>

**Usage**:
```css
ch-confirmation::part(title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}
```

---

### `message`

<p>The message container that displays the current state message.</p>

**Usage**:
```css
ch-confirmation::part(message) {
  color: #555;
  font-size: 1rem;
}
```

---

### `actions`

<p>The container for action buttons (only present in <code>"approval-requested"</code> state).</p>

**Usage**:
```css
ch-confirmation::part(actions) {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
```

---

### `button-approve`

<p>The approve button (only present in <code>"approval-requested"</code> state).</p>

**Usage**:
```css
ch-confirmation::part(button-approve) {
  background: #28a745;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
}
```

---

### `button-reject`

<p>The reject button (only present in <code>"approval-requested"</code> state).</p>

**Usage**:
```css
ch-confirmation::part(button-reject) {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
}
```

---

### State-specific Parts (on container)

The container element includes additional parts based on the current state:

- <code>approval-requested</code>: Present when state is <code>"approval-requested"</code>
- <code>approval-responded</code>: Present when state is <code>"approval-responded"</code>
- <code>output-denied</code>: Present when state is <code>"output-denied"</code>
- <code>output-available</code>: Present when state is <code>"output-available"</code>

**Usage**:
```css
/* Style container differently based on state */
ch-confirmation::part(container approval-requested) {
  background: #fff3cd;
  border-color: #ffc107;
}

ch-confirmation::part(container approval-responded),
ch-confirmation::part(container output-available) {
  background: #d4edda;
  border-color: #28a745;
}

ch-confirmation::part(container output-denied) {
  background: #f8d7da;
  border-color: #dc3545;
}
```

</details>

<details open>
  <summary>
  
  ## CSS Custom Properties
  </summary>

### `--ch-confirmation-gap`

<p>Specifies the gap between elements (title, message, actions) inside the container.</p>

**Default**: <code>0.75rem</code>

**Usage**:
```css
ch-confirmation {
  --ch-confirmation-gap: 1rem;
}
```

---

### `--ch-confirmation-padding`

<p>Specifies the padding of the main container.</p>

**Default**: <code>1rem</code>

**Usage**:
```css
ch-confirmation {
  --ch-confirmation-padding: 1.5rem;
}
```

---

### `--ch-confirmation-actions-gap`

<p>Specifies the gap between the approve and reject buttons.</p>

**Default**: <code>0.5rem</code>

**Usage**:
```css
ch-confirmation {
  --ch-confirmation-actions-gap: 0.75rem;
}
```

</details>

<details open>
  <summary>
  
  ## Usage Examples
  </summary>

### Basic Usage - Approval Requested

```html
<ch-confirmation
  state="approval-requested"
  title="Approval Required"
  request-message="Do you approve this action?"
  accepted-message="Action approved!"
  rejected-message="Action rejected."
></ch-confirmation>

<script>
  const confirmation = document.querySelector('ch-confirmation');
  
  confirmation.addEventListener('approve', (event) => {
    console.log('Approved:', event.detail);
    // Update state to show approval
    confirmation.setAttribute('state', 'approval-responded');
  });
  
  confirmation.addEventListener('reject', (event) => {
    console.log('Rejected:', event.detail);
    // Update state to show rejection
    confirmation.setAttribute('state', 'output-denied');
  });
</script>
```

---

### With Approval ID

```html
<ch-confirmation
  id="my-confirmation"
  state="approval-requested"
  request-message="Approve this document for publication?"
></ch-confirmation>

<script>
  const confirmation = document.getElementById('my-confirmation');
  
  // Set approval object with ID
  confirmation.approval = { id: 'doc-12345' };
  
  confirmation.addEventListener('approve', (event) => {
    // event.detail.approvalId will be 'doc-12345'
    fetch('/api/approve', {
      method: 'POST',
      body: JSON.stringify({ id: event.detail.approvalId })
    });
  });
</script>
```

---

### Internationalization

```html
<ch-confirmation
  state="approval-requested"
  title="Confirmación Requerida"
  request-message="¿Deseas aprobar esta acción?"
  accepted-message="¡Acción aprobada!"
  rejected-message="Acción rechazada."
  approve-button-label="Aprobar"
  reject-button-label="Rechazar"
></ch-confirmation>
```

---

### Approved State (No Buttons)

```html
<ch-confirmation
  state="approval-responded"
  title="✓ Approved"
  accepted-message="Your request has been approved and is being processed."
></ch-confirmation>
```

---

### Rejected State (No Buttons)

```html
<ch-confirmation
  state="output-denied"
  title="✗ Rejected"
  rejected-message="Your request was rejected. Please review and resubmit."
></ch-confirmation>
```

---

### Complete Workflow Example

```javascript
// Create confirmation component
const confirmation = document.createElement('ch-confirmation');
confirmation.state = 'approval-requested';
confirmation.title = 'Document Approval';
confirmation.requestMessage = 'Approve this document?';
confirmation.acceptedMessage = 'Document approved successfully!';
confirmation.rejectedMessage = 'Document approval was rejected.';
confirmation.approval = { id: 'doc-456' };

// Handle approve
confirmation.addEventListener('approve', async (event) => {
  try {
    // Call API
    await fetch(`/api/documents/${event.detail.approvalId}/approve`, {
      method: 'POST'
    });
    
    // Update state on success
    confirmation.state = 'approval-responded';
  } catch (error) {
    console.error('Approval failed:', error);
  }
});

// Handle reject
confirmation.addEventListener('reject', async (event) => {
  try {
    // Call API
    await fetch(`/api/documents/${event.detail.approvalId}/reject`, {
      method: 'POST'
    });
    
    // Update state on success
    confirmation.state = 'output-denied';
  } catch (error) {
    console.error('Rejection failed:', error);
  }
});

document.body.appendChild(confirmation);
```

</details>

<details open>
  <summary>
  
  ## Accessibility
  </summary>

The component implements the following accessibility features:

- **ARIA Role**: The component has <code>role="alert"</code> to indicate important, time-sensitive information.
- **Live Region**: <code>aria-live="polite"</code> announces state changes to assistive technologies non-intrusively.
- **Accessible Name**: Uses <code>aria-labelledby</code> when a title is provided, or <code>aria-label</code> when <code>accessibleName</code> is set.
- **Button Labels**: Both approve and reject buttons have descriptive <code>aria-label</code> attributes that match their visible text.
- **Keyboard Support**: All interactive elements (buttons) are keyboard accessible.

### Accessibility Best Practices

1. **Always provide meaningful messages**: Set <code>requestMessage</code>, <code>acceptedMessage</code>, and <code>rejectedMessage</code> with clear, descriptive text.

2. **Use title or accessibleName**: Provide a <code>title</code> property for visual users and an <code>accessibleName</code> for screen reader users when no title is appropriate.

3. **Customize button labels**: Use <code>approveButtonLabel</code> and <code>rejectButtonLabel</code> to provide context-specific action names (e.g., "Publish", "Reject Publication" instead of generic "Approve"/"Reject").

4. **Handle focus**: When the state changes, consider managing focus appropriately in your application.

</details>

<details open>
  <summary>
  
  ## Design Considerations
  </summary>

### White-Label Design

The component is intentionally white-label, providing only the minimal layout structure. All visual styling (colors, typography, borders, shadows, etc.) should be applied via CSS parts.

### No Slots

This component does **not** use slots. All content is configured through properties:
- Messages via <code>requestMessage</code>, <code>acceptedMessage</code>, <code>rejectedMessage</code>
- Title via <code>title</code>
- Button labels via <code>approveButtonLabel</code>, <code>rejectButtonLabel</code>

### State Management

The component is **stateless** from the application perspective. It renders based on the current <code>state</code> property but does not manage state transitions internally. Your application code is responsible for:
1. Listening to <code>approve</code> and <code>reject</code> events
2. Performing backend operations (API calls, etc.)
3. Updating the <code>state</code> property to reflect the new workflow state

This design keeps the component flexible and allows it to integrate with any state management approach.

</details>

## Related Components

- [`ch-alert`](../alert/readme.md): For displaying non-interactive alerts
- [`ch-dialog`](../dialog/readme.md): For modal dialogs with custom content
- [`ch-action-list`](../action-list/readme.md): For displaying lists of actions

## Browser Support

This component is built with Lit and supports all modern browsers that support Web Components:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

*For interactive examples, see [docs/index.html](./docs/index.html)*

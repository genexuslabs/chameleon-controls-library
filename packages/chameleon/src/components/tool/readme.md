# ch-tool Component

The `ch-tool` component displays AI tool invocation details with collapsible interface, state management, and approval workflow support.

## Features

- ✅ **Collapsible Interface**: Uses `ch-accordion` for smooth expand/collapse animations
- ✅ **State Management**: Visual feedback for 7 different tool states (pending, running, awaiting approval, etc.)
- ✅ **Approval Workflow**: Integrated `ch-confirmation` for user approval/rejection
- ✅ **Syntax Highlighting**: JSON input/output displayed with `ch-code` component
- ✅ **White-label Design**: Fully customizable via CSS parts and custom properties
- ✅ **Event Driven**: Emits events for approve, reject, and accordion state changes
- ✅ **TypeScript Support**: Comprehensive type definitions

## Installation

```typescript
import "@chameleon/ch-tool";
```

## Basic Usage

```html
<ch-tool id="myTool"></ch-tool>

<script>
  const tool = document.getElementById("myTool");
  tool.toolName = "web_search";
  tool.state = "output-available";
  tool.input = {
    query: "latest AI research papers",
    maxResults: 10
  };
  tool.output = {
    results: [
      { title: "Paper 1", url: "https://..." },
      { title: "Paper 2", url: "https://..." }
    ]
  };
</script>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `toolName` | `string` | `""` | The name of the tool being invoked |
| `type` | `string` | `""` | Tool type metadata (e.g., "function", "action") |
| `state` | `ToolState` | `"input-available"` | Current execution state of the tool |
| `input` | `ToolInput \| null` | `null` | Input parameters object passed to the tool |
| `output` | `ToolOutput \| null` | `null` | Output result (object or string) from the tool |
| `errorText` | `string` | `""` | Error message displayed when state is "output-error" |
| `defaultOpen` | `boolean` | `false` | Whether the accordion should be expanded by default |
| `toolCallId` | `string` | `""` | Unique identifier for this tool invocation |
| `approvalMessage` | `string` | `"This action requires approval..."` | Message shown during approval request |
| `acceptedMessage` | `string` | `"Action approved"` | Message shown when user approves |
| `rejectedMessage` | `string` | `"Action rejected"` | Message shown when user rejects |

## Types

### ToolState

```typescript
type ToolState =
  | "input-streaming"     // Receiving input parameters (Pending)
  | "input-available"     // Input ready, executing (Running)
  | "approval-requested"  // Waiting for user approval (Awaiting Approval)
  | "approval-responded"  // User responded to approval (Responded)
  | "output-available"    // Execution completed successfully (Completed)
  | "output-error"        // Execution failed with error (Error)
  | "output-denied";      // User denied execution (Denied)
```

### ToolInput

```typescript
type ToolInput = Record<string, unknown>;
```

### ToolOutput

```typescript
type ToolOutput = Record<string, unknown> | string;
```

## Events

| Event | Type | Description |
|-------|------|-------------|
| `approve` | `CustomEvent<{ toolCallId: string }>` | Fired when user approves the tool execution |
| `reject` | `CustomEvent<{ toolCallId: string }>` | Fired when user rejects the tool execution |
| `expandedChange` | `CustomEvent<{ expanded: boolean }>` | Fired when accordion expanded state changes |

## State Management

The component displays different UI based on the current state:

### 1. Pending State (input-streaming)

Tool is receiving input parameters but hasn't started execution yet.

```html
<ch-tool id="pendingTool"></ch-tool>

<script>
  const tool = document.getElementById("pendingTool");
  tool.toolName = "api_request";
  tool.state = "input-streaming";
  tool.input = { url: "https://api.example.com/data" };
</script>
```

**Badge displayed**: "Pending"

### 2. Running State (input-available)

Tool has received all input parameters and is currently executing.

```html
<ch-tool id="runningTool"></ch-tool>

<script>
  const tool = document.getElementById("runningTool");
  tool.toolName = "database_query";
  tool.state = "input-available";
  tool.input = { sql: "SELECT * FROM users" };
</script>
```

**Badge displayed**: "Running"

### 3. Awaiting Approval State (approval-requested)

Tool requires user approval before executing (dangerous operations).

```html
<ch-tool id="approvalTool"></ch-tool>

<script>
  const tool = document.getElementById("approvalTool");
  tool.toolName = "execute_command";
  tool.state = "approval-requested";
  tool.toolCallId = "call-123";
  tool.input = { command: "rm -rf /tmp/cache/*" };
  tool.approvalMessage = "This will delete all cached files. Proceed?";
  
  // Listen to approval events
  tool.addEventListener("approve", (e) => {
    console.log("Approved:", e.detail.toolCallId);
    // Change state after approval
    tool.state = "approval-responded";
  });
  
  tool.addEventListener("reject", (e) => {
    console.log("Rejected:", e.detail.toolCallId);
    // Change state after rejection
    tool.state = "output-denied";
  });
</script>
```

**Badge displayed**: "Awaiting Approval"  
**UI**: Shows `ch-confirmation` component with Approve/Reject buttons

### 4. Responded State (approval-responded)

User has responded to the approval request.

```html
<ch-tool id="respondedTool"></ch-tool>

<script>
  const tool = document.getElementById("respondedTool");
  tool.toolName = "system_backup";
  tool.state = "approval-responded";
  tool.input = { source: "/var/www", destination: "/backups" };
</script>
```

**Badge displayed**: "Responded"

### 5. Completed State (output-available)

Tool execution completed successfully with output results.

```html
<ch-tool id="completedTool"></ch-tool>

<script>
  const tool = document.getElementById("completedTool");
  tool.toolName = "web_search";
  tool.state = "output-available";
  tool.input = { query: "AI research" };
  tool.output = {
    results: [
      { title: "Paper 1", url: "https://..." },
      { title: "Paper 2", url: "https://..." }
    ],
    total: 2
  };
</script>
```

**Badge displayed**: "Completed"  
**UI**: Shows both input parameters and output results with JSON syntax highlighting

### 6. Error State (output-error)

Tool execution failed with an error message.

```html
<ch-tool id="errorTool"></ch-tool>

<script>
  const tool = document.getElementById("errorTool");
  tool.toolName = "file_operations";
  tool.state = "output-error";
  tool.input = { operation: "delete", path: "/protected/file.txt" };
  tool.errorText = "Permission denied: insufficient privileges";
</script>
```

**Badge displayed**: "Error"  
**UI**: Shows error message in monospace font with red color

### 7. Denied State (output-denied)

User denied the tool execution.

```html
<ch-tool id="deniedTool"></ch-tool>

<script>
  const tool = document.getElementById("deniedTool");
  tool.toolName = "data_export";
  tool.state = "output-denied";
  tool.input = { format: "csv", records: 10000 };
  tool.errorText = "Export denied by user";
</script>
```

**Badge displayed**: "Denied"

## Customization with CSS Parts

All major elements expose CSS parts for styling:

```css
/* Customize the header badge */
ch-tool::part(header-badge) {
  font-weight: bold;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
}

/* Style the tool name */
ch-tool::part(tool-name) {
  color: #0066cc;
  font-weight: 600;
  font-size: 1.1rem;
}

/* State-specific badge styling */
ch-tool::part(state-output-available) {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

ch-tool::part(state-output-error) {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* Customize sections */
ch-tool::part(parameters-section) {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

ch-tool::part(result-section) {
  background: #ecfdf5;
  padding: 1rem;
  border-radius: 8px;
}
```

### Available CSS Parts

- `container` - The root container element
- `header-badge` - The state badge in the header
- `tool-name` - The tool name text element
- `parameters-section` - The input parameters section container
- `parameters-title` - The "Parameters" section title
- `result-section` - The output result section container
- `result-title` - The "Result" section title
- `error-section` - The error message section container
- `error-title` - The "Error" section title
- `confirmation-wrapper` - The ch-confirmation component wrapper
- `state-input-streaming` - State-specific part for pending state
- `state-input-available` - State-specific part for running state
- `state-approval-requested` - State-specific part for awaiting approval state
- `state-approval-responded` - State-specific part for responded state
- `state-output-available` - State-specific part for completed state
- `state-output-error` - State-specific part for error state
- `state-output-denied` - State-specific part for denied state

## CSS Custom Properties

Fine-tune the appearance using CSS variables:

```css
ch-tool {
  /* Spacing */
  --ch-tool-gap: 1rem;
  --ch-tool-section-gap: 0.5rem;
  --ch-tool-header-gap: 0.5rem;
  
  /* Badge styling */
  --ch-tool-badge-padding: 0.25rem 0.5rem;
  --ch-tool-badge-border-radius: 0.25rem;
  --ch-tool-badge-font-size: 0.75rem;
  
  /* Badge colors - Pending state */
  --ch-tool-badge-pending-bg: #f3f4f6;
  --ch-tool-badge-pending-color: #6b7280;
  
  /* Badge colors - Running state */
  --ch-tool-badge-running-bg: #dbeafe;
  --ch-tool-badge-running-color: #1e40af;
  
  /* Badge colors - Awaiting Approval state */
  --ch-tool-badge-awaiting-approval-bg: #fef3c7;
  --ch-tool-badge-awaiting-approval-color: #92400e;
  
  /* Badge colors - Responded state */
  --ch-tool-badge-responded-bg: #e0e7ff;
  --ch-tool-badge-responded-color: #3730a3;
  
  /* Badge colors - Completed state */
  --ch-tool-badge-completed-bg: #d1fae5;
  --ch-tool-badge-completed-color: #065f46;
  
  /* Badge colors - Error state */
  --ch-tool-badge-error-bg: #fee2e2;
  --ch-tool-badge-error-color: #991b1b;
  
  /* Badge colors - Denied state */
  --ch-tool-badge-denied-bg: #fce7f3;
  --ch-tool-badge-denied-color: #9f1239;
  
  /* Tool name styling */
  --ch-tool-name-font-weight: 500;
  --ch-tool-name-font-size: 1rem;
  --ch-tool-name-color: inherit;
  
  /* Section title styling */
  --ch-tool-section-title-font-weight: 600;
  --ch-tool-section-title-font-size: 0.875rem;
  --ch-tool-section-title-color: inherit;
  
  /* Error text styling */
  --ch-tool-error-font-family: monospace;
  --ch-tool-error-font-size: 0.875rem;
  --ch-tool-error-color: #991b1b;
}
```

## Advanced Examples

### Complete Approval Workflow

```html
<ch-tool id="approvalWorkflow"></ch-tool>

<script>
  const tool = document.getElementById("approvalWorkflow");
  
  // Initial setup
  tool.toolName = "delete_database";
  tool.state = "approval-requested";
  tool.toolCallId = "call-dangerous-123";
  tool.input = {
    database: "production",
    confirm: true
  };
  tool.approvalMessage = "⚠️ This will permanently delete the production database. Are you absolutely sure?";
  tool.acceptedMessage = "Database deletion approved. Proceeding...";
  tool.rejectedMessage = "Database deletion cancelled. No changes made.";
  
  // Handle approval
  tool.addEventListener("approve", async (e) => {
    console.log("User approved:", e.detail.toolCallId);
    
    // Update to responded state
    tool.state = "approval-responded";
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update to completed state with output
    tool.state = "output-available";
    tool.output = {
      success: true,
      deletedRecords: 150000,
      timestamp: new Date().toISOString()
    };
  });
  
  // Handle rejection
  tool.addEventListener("reject", (e) => {
    console.log("User rejected:", e.detail.toolCallId);
    
    // Update to denied state
    tool.state = "output-denied";
    tool.errorText = "Operation cancelled by user";
  });
</script>
```

### Dynamic State Transitions

```html
<ch-tool id="dynamicTool"></ch-tool>

<script>
  const tool = document.getElementById("dynamicTool");
  
  // Simulate tool execution lifecycle
  async function executeTool() {
    // Step 1: Pending (receiving input)
    tool.toolName = "api_request";
    tool.state = "input-streaming";
    tool.input = { url: "https://api.example.com/data" };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Running (executing)
    tool.state = "input-available";
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Completed (with output)
    tool.state = "output-available";
    tool.output = {
      status: 200,
      data: { results: [1, 2, 3] }
    };
  }
  
  executeTool();
</script>
```

### Custom Themed Tool

```html
<style>
  .custom-theme {
    --ch-tool-badge-padding: 0.5rem 1rem;
    --ch-tool-badge-border-radius: 12px;
    --ch-tool-badge-completed-bg: #10b981;
    --ch-tool-badge-completed-color: white;
    --ch-tool-badge-error-bg: #ef4444;
    --ch-tool-badge-error-color: white;
    --ch-tool-gap: 1.5rem;
  }
  
  .custom-theme::part(header-badge) {
    font-weight: 700;
    letter-spacing: 0.05em;
  }
  
  .custom-theme::part(tool-name) {
    color: #0066cc;
    font-size: 1.2rem;
  }
</style>

<ch-tool id="themedTool" class="custom-theme" defaultOpen></ch-tool>

<script>
  const tool = document.getElementById("themedTool");
  tool.toolName = "machine_learning_inference";
  tool.state = "output-available";
  tool.input = {
    model: "gpt-4",
    prompt: "Explain quantum computing"
  };
  tool.output = {
    response: "Quantum computing uses quantum mechanics...",
    tokensUsed: 342
  };
</script>
```

### Event Tracking

```html
<ch-tool id="trackedTool"></ch-tool>

<script>
  const tool = document.getElementById("trackedTool");
  
  // Track approval events
  tool.addEventListener("approve", (e) => {
    analytics.track("Tool Approved", {
      toolCallId: e.detail.toolCallId,
      toolName: tool.toolName
    });
  });
  
  // Track rejection events
  tool.addEventListener("reject", (e) => {
    analytics.track("Tool Rejected", {
      toolCallId: e.detail.toolCallId,
      toolName: tool.toolName
    });
  });
  
  // Track accordion interactions
  tool.addEventListener("expandedChange", (e) => {
    analytics.track("Tool Accordion Toggled", {
      expanded: e.detail.expanded,
      toolName: tool.toolName
    });
  });
</script>
```

## Accessibility

- Collapsible behavior uses `ch-accordion` with proper ARIA attributes
- Approval workflow uses `ch-confirmation` with accessible buttons
- Keyboard navigation fully supported (Tab, Enter, Space)
- Screen reader friendly with semantic HTML and proper labels
- Focus management handled by underlying Chameleon components

## Integration with AI Systems

The `ch-tool` component is designed for AI agent systems that invoke tools:

```typescript
// Example: Tool execution in an AI agent system
interface ToolCall {
  id: string;
  name: string;
  state: ToolState;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  error?: string;
}

function renderToolCall(toolCall: ToolCall) {
  const toolElement = document.createElement("ch-tool");
  toolElement.toolName = toolCall.name;
  toolElement.toolCallId = toolCall.id;
  toolElement.state = toolCall.state;
  toolElement.input = toolCall.input || null;
  toolElement.output = toolCall.output || null;
  toolElement.errorText = toolCall.error || "";
  
  // Handle approval workflow
  if (toolCall.requiresApproval) {
    toolElement.addEventListener("approve", async (e) => {
      await approveToolExecution(toolCall.id);
    });
    
    toolElement.addEventListener("reject", async (e) => {
      await rejectToolExecution(toolCall.id);
    });
  }
  
  return toolElement;
}
```

## Browser Support

Works in all modern browsers that support:
- Web Components (Custom Elements v1)
- ES2020+
- CSS Grid and Flexbox
- Shadow DOM

## Related Components

- `ch-accordion` - Used internally for collapsible interface
- `ch-code` - Used for JSON syntax highlighting of input/output
- `ch-confirmation` - Used for approval workflow

## License

See the main library LICENSE file.

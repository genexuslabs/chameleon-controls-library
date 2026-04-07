# ch-plan Component

The `ch-plan` component displays AI-generated execution plans with streaming support and shimmer loading states.

## Features

- ✅ **Collapsible Content**: Uses `ch-accordion` for smooth expand/collapse animations
- ✅ **Streaming Support**: Real-time content loading with shimmer placeholders
- ✅ **Smooth Transitions**: Fade-in animations when content appears or changes
- ✅ **White-label Design**: Fully customizable via CSS parts and custom properties
- ✅ **Semantic HTML**: Proper structure with accessible markup
- ✅ **TypeScript Support**: Comprehensive type definitions
- ✅ **Status Indicators**: Visual feedback for step status (pending, in-progress, completed, failed)

## Installation

```typescript
import "@chameleon/ch-plan";
```

## Basic Usage

```html
<ch-plan id="myPlan"></ch-plan>

<script>
  const plan = document.getElementById("myPlan");
  plan.title = "Project Roadmap";
  plan.description = "Complete project implementation plan";
  plan.steps = [
    {
      id: "1",
      title: "Research Phase",
      description: "Gather requirements and analyze options",
      subtasks: ["User interviews", "Market analysis", "Technical feasibility"],
      status: "completed"
    },
    {
      id: "2",
      title: "Development Phase",
      subtasks: ["Setup environment", "Implement features", "Write tests"],
      status: "in-progress"
    }
  ];
</script>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `""` | The main title of the plan |
| `description` | `string` | `undefined` | Optional description providing context |
| `steps` | `PlanStepModel[]` | `[]` | Array of steps that make up the plan |
| `isStreaming` | `boolean` | `false` | Whether content is currently being streamed |
| `defaultOpen` | `boolean` | `false` | Whether the plan should be expanded by default |

## Types

### PlanStepModel

```typescript
type PlanStepModel = {
  id: string;
  title: string;
  description?: string;
  subtasks?: string[];
  status?: "pending" | "in-progress" | "completed" | "failed";
};
```

## Events

| Event | Type | Description |
|-------|------|-------------|
| `expandedChange` | `CustomEvent<{ expanded: boolean }>` | Fired when the plan's expanded state changes |

## Streaming Support

The component supports real-time streaming of content with smooth transitions:

```html
<ch-plan id="streamingPlan" isStreaming></ch-plan>

<script>
  const plan = document.getElementById("streamingPlan");
  
  // Initially empty with shimmer placeholders
  plan.title = "";
  plan.steps = [];
  
  // Simulate progressive loading
  setTimeout(() => {
    plan.title = "AI Analysis Results";
    plan.description = "Comprehensive analysis of the codebase";
  }, 500);
  
  setTimeout(() => {
    plan.steps = [
      { id: "1", title: "Code Quality Analysis", status: "completed" }
    ];
  }, 1000);
  
  setTimeout(() => {
    plan.steps = [
      ...plan.steps,
      { id: "2", title: "Security Audit", status: "in-progress" }
    ];
  }, 1500);
  
  setTimeout(() => {
    plan.isStreaming = false; // Stop showing shimmer
  }, 2000);
</script>
```

### Streaming Behavior

- **When `isStreaming=true` and no content**: Shows shimmer placeholders for all content
- **When `isStreaming=true` with partial content**: Shows loaded content + shimmer for upcoming content
- **Smooth transitions**: All content fades in smoothly when appearing or changing
- **Progressive loading**: Steps can be added incrementally while streaming

## Customization with CSS Parts

All major elements expose CSS parts for styling:

```css
/* Customize the plan title */
ch-plan::part(title) {
  color: #0066cc;
  font-size: 1.5rem;
}

/* Style individual steps */
ch-plan::part(step) {
  padding: 1rem;
  background: #f0f8ff;
  border-left: 3px solid #0066cc;
}

/* Style completed steps differently */
ch-plan::part(step-completed) {
  opacity: 0.6;
  background: #e8f5e9;
}

/* Customize subtasks */
ch-plan::part(substep) {
  color: #666;
  font-style: italic;
}

/* Customize shimmer appearance */
ch-plan::part(shimmer) {
  background: linear-gradient(90deg, #e0e0e0, #f0f0f0, #e0e0e0);
}
```

### Available CSS Parts

- `plan` - The root container
- `header` - The header section with title and description
- `title` - The plan title element
- `description` - The plan description element
- `content` - The main content area containing steps
- `step` - A single step container
- `step-title` - The title of a step
- `step-description` - The description of a step
- `substep` - A subtask item within a step
- `shimmer` - Applied to shimmer loading placeholders

## CSS Custom Properties

Fine-tune the appearance using CSS variables:

```css
ch-plan {
  /* Spacing */
  --ch-plan-header-gap: 0.5rem;
  --ch-plan-steps-gap: 1rem;
  --ch-plan-step-gap: 0.5rem;
  
  /* Typography */
  --ch-plan-title-font-size: 1.25rem;
  --ch-plan-title-font-weight: 600;
  --ch-plan-step-title-font-size: 1rem;
  
  /* Shimmer */
  --ch-plan-shimmer-color-start: #f0f0f0;
  --ch-plan-shimmer-color-middle: #e0e0e0;
  --ch-plan-shimmer-color-end: #f0f0f0;
  --ch-plan-shimmer-duration: 1.5s;
  --ch-plan-shimmer-border-radius: 0.25rem;
  
  /* Transitions */
  --ch-plan-fade-duration: 0.3s;
  --ch-plan-fade-translate: 8px;
  
  /* Status styling */
  --ch-plan-step-completed-opacity: 0.7;
  --ch-plan-step-failed-color: #d32f2f;
}
```

## Accessibility

- Collapsible behavior uses `ch-accordion` with proper ARIA attributes
- Semantic HTML structure with appropriate heading levels
- Keyboard navigation fully supported
- Screen reader friendly with proper labels

## Examples

### Pre-expanded Plan

```html
<ch-plan id="expandedPlan" defaultOpen></ch-plan>
```

### Plan with Status Indicators

```html
<ch-plan id="statusPlan"></ch-plan>

<script>
  const plan = document.getElementById("statusPlan");
  plan.title = "Deployment Checklist";
  plan.steps = [
    { 
      id: "1", 
      title: "Pre-deployment checks", 
      status: "completed",
      subtasks: ["Run tests", "Update docs"]
    },
    { 
      id: "2", 
      title: "Deploy to staging", 
      status: "in-progress",
      subtasks: ["Build application", "Deploy to server"]
    },
    { 
      id: "3", 
      title: "Deploy to production", 
      status: "pending" 
    }
  ];
</script>
```

### Event Handling

```html
<ch-plan id="eventPlan"></ch-plan>

<script>
  const plan = document.getElementById("eventPlan");
  
  plan.addEventListener("expandedChange", (e) => {
    console.log("Plan expanded:", e.detail.expanded);
    
    // Track analytics
    if (e.detail.expanded) {
      analytics.track("Plan Expanded");
    }
  });
</script>
```

## Browser Support

Works in all modern browsers that support:
- Web Components (Custom Elements v1)
- ES2020+
- CSS Grid and Flexbox

## License

See the main library LICENSE file.

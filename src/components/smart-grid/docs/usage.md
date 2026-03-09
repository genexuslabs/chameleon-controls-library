# ch-smart-grid - Usage

## Table of Contents

- [Sizing Behavior](#sizing-behavior)
- [Basic Usage](#basic-usage)
- [Inverse Loading](#inverse-loading)
- [Custom Data Provider](#custom-data-provider)
- [Do's and Don'ts](#dos-and-donts)

> **Sizing behavior:** `ch-smart-grid` uses `contain: strict` when `autoGrow = false` (the default), which means it does **not** contribute to its parent's intrinsic size. The parent must establish its own size through layout. If the parent has no size, the component will be invisible.
>
> Set `autoGrow` to `true` to let the component size to its content, or place the component inside a grid or flex container that already has a defined size:
>
> ```css
> /* Recommended: parent establishes its own size via layout */
> .my-layout {
>   display: grid;
>   grid-template-rows: auto 1fr; /* component goes in the 1fr row */
> }
> ```

## Basic Usage

Demonstrates a simple infinite-scroll list that loads data progressively from a data source.

### HTML

```html
<ch-smart-grid
  id="basic-smart-grid"
  accessible-name="Recent articles"
  items-count="0"
  data-provider
  threshold="100px"
  style="height: 400px;"
>
  <div slot="grid-initial-loading-placeholder">
    Loading articles...
  </div>

  <div slot="grid-content" id="grid-content"></div>

  <div slot="grid-content-empty">
    No articles found.
  </div>
</ch-smart-grid>
```

### JavaScript

```js
const grid = document.querySelector("#basic-smart-grid");
const content = document.querySelector("#grid-content");
let page = 0;

// Simulate fetching data from an API
async function fetchArticles(pageNumber) {
  // Replace with your actual API call
  return new Array(20).fill(null).map((_, i) => ({
    id: pageNumber * 20 + i,
    title: `Article ${pageNumber * 20 + i + 1}`,
    summary: "Lorem ipsum dolor sit amet..."
  }));
}

async function loadPage() {
  const articles = await fetchArticles(page);
  page++;

  articles.forEach(article => {
    const cell = document.createElement("ch-smart-grid-cell");
    cell.setAttribute("cell-id", `article-${article.id}`);
    cell.innerHTML = `<strong>${article.title}</strong><p>${article.summary}</p>`;
    content.appendChild(cell);
  });

  grid.itemsCount = content.children.length;
  grid.loadingState = "loaded";
}

// Initial load
loadPage();

// Load more when the scroll threshold is reached
grid.addEventListener("infiniteThresholdReached", async () => {
  await loadPage();
});
```

### Key Points

- Set `data-provider` to enable infinite scrolling with a `ch-infinite-scroll` element rendered internally.
- The `threshold` property controls how close to the edge the user must scroll before `infiniteThresholdReached` fires (e.g., `"100px"` or `"10%"`).
- The `loadingState` property has three values: `"initial"` (shows placeholder), `"loading"` (shows spinner), and `"loaded"` (shows content).
- The `items-count` property must be updated whenever the data set changes to trigger proper rendering of content vs. empty slots.
- The `accessible-name` property maps to `aria-label` on the host, and `aria-live="polite"` announces content changes.

## Inverse Loading

Demonstrates a chat-like interface where content loads from the bottom up, with older messages loaded at the top via infinite scroll.

### HTML

```html
<ch-smart-grid
  id="chat-grid"
  accessible-name="Chat messages"
  items-count="0"
  data-provider
  inverse-loading
  auto-scroll="at-scroll-end"
  threshold="50px"
  style="height: 500px;"
>
  <div slot="grid-initial-loading-placeholder">
    Loading conversation...
  </div>

  <div slot="grid-content" id="chat-content"></div>

  <div slot="grid-content-empty">
    No messages yet. Start the conversation!
  </div>
</ch-smart-grid>
```

### JavaScript

```js
const grid = document.querySelector("#chat-grid");
const content = document.querySelector("#chat-content");
let oldestMessageId = 100;

// Simulate fetching older messages
async function fetchOlderMessages() {
  const messages = [];
  for (let i = 0; i < 15; i++) {
    oldestMessageId--;
    messages.push({
      id: oldestMessageId,
      sender: oldestMessageId % 2 === 0 ? "Alice" : "Bob",
      text: `Message #${oldestMessageId}`,
      time: new Date(Date.now() - oldestMessageId * 60000).toLocaleTimeString()
    });
  }
  return messages.reverse();
}

async function loadOlderMessages() {
  const messages = await fetchOlderMessages();

  // Prepend older messages at the top
  const fragment = document.createDocumentFragment();
  messages.forEach(msg => {
    const cell = document.createElement("ch-smart-grid-cell");
    cell.setAttribute("cell-id", `msg-${msg.id}`);
    cell.innerHTML = `<b>${msg.sender}</b> <small>${msg.time}</small><p>${msg.text}</p>`;
    fragment.appendChild(cell);
  });
  content.prepend(fragment);

  grid.itemsCount = content.children.length;
  grid.loadingState = "loaded";
}

// Initial load
loadOlderMessages();

// Load older messages when scrolling to the top
grid.addEventListener("infiniteThresholdReached", async () => {
  await loadOlderMessages();
});
```

### Key Points

- Setting `inverse-loading` places the infinite-scroll trigger at the top of the grid and aligns content to the bottom.
- The `auto-scroll` property controls scroll behavior when new content is added: `"at-scroll-end"` keeps the scroll at the bottom when the user is already there; `"never"` does not adjust the scroll position.
- Content is prepended (not appended) to the `grid-content` slot so older messages appear above newer ones.
- The component automatically manages scroll position to prevent layout shifts (CLS) during async loads, using `overflow-anchor: none` and internal position tracking.
- Set `autoGrow` to `true` if you want the grid to expand to fit all content instead of being a fixed-height scrollable area.

## Custom Data Provider

Demonstrates using the data provider pattern with a virtual scroller for efficiently rendering very large datasets.

### HTML

```html
<ch-smart-grid
  id="provider-grid"
  accessible-name="Log entries"
  items-count="0"
  data-provider
  threshold="200px"
  style="height: 600px;"
>
  <div slot="grid-initial-loading-placeholder">
    <div class="loading-spinner">Fetching log entries...</div>
  </div>

  <div slot="grid-content">
    <ch-virtual-scroller id="scroller">
    </ch-virtual-scroller>
  </div>

  <div slot="grid-content-empty">
    No log entries available.
  </div>
</ch-smart-grid>
```

### JavaScript

```js
const grid = document.querySelector("#provider-grid");
const scroller = document.querySelector("#scroller");
let totalLoaded = 0;
const PAGE_SIZE = 50;

// Simulate an API that returns log entries
async function fetchLogs(offset, limit) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return new Array(limit).fill(null).map((_, i) => ({
    id: offset + i,
    timestamp: new Date(Date.now() - (offset + i) * 1000).toISOString(),
    level: ["INFO", "WARN", "ERROR"][Math.floor(Math.random() * 3)],
    message: `Log entry #${offset + i + 1}: Operation completed`
  }));
}

async function loadNextPage() {
  const logs = await fetchLogs(totalLoaded, PAGE_SIZE);
  totalLoaded += logs.length;

  logs.forEach(log => {
    const cell = document.createElement("ch-smart-grid-cell");
    cell.setAttribute("cell-id", `log-${log.id}`);
    cell.innerHTML = `
      <span class="timestamp">${log.timestamp}</span>
      <span class="level level--${log.level.toLowerCase()}">${log.level}</span>
      <span class="message">${log.message}</span>
    `;
    scroller.appendChild(cell);
  });

  grid.itemsCount = totalLoaded;
  grid.loadingState = "loaded";
}

// Initial load
loadNextPage();

// Load more when threshold is reached
grid.addEventListener("infiniteThresholdReached", async () => {
  await loadNextPage();
});

// Scroll a specific cell to the top using the anchor method
async function scrollToEntry(cellId) {
  await grid.scrollEndContentToPosition(cellId, {
    position: "start",
    behavior: "smooth"
  });
}
```

### Key Points

- The `data-provider` property enables the infinite-scroll mechanism. The grid sets `loadingState` to `"loading"` automatically before emitting `infiniteThresholdReached`.
- The consumer must set `loadingState` back to `"loaded"` after data is fetched and appended, which re-enables the scroll threshold.
- Combining `ch-smart-grid` with `ch-virtual-scroller` enables rendering only visible items in the viewport, which is essential for datasets with thousands of entries.
- The `scrollEndContentToPosition` method anchors a specific cell at the top or end of the viewport, with the component automatically reserving space below the last cell when using `position: "start"`.
- Call `removeScrollEndContentReference()` to clear the anchor and the reserved space.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.

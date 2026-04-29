import type { SmartGridDataState } from "../../infinite-scroll/types";
import type { ChatMessage } from "../types";

export const LONG_STRING =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione eveniet error temporibus officia, facilis ducimus doloremque. Odit, vel reiciendis nihil dicta officiis facere itaque necessitatibus molestias incidunt perferendis ea eos?";

export const EMPTY_ITEMS = [];
export const ONE_ITEM: ChatMessage[] = [{ id: "1", role: "assistant", content: "1" }];
export const TEN_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING }
];

export const FIFTEEN_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING },
  { id: "11", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "12", role: "error", content: "Content 12" + LONG_STRING },
  { id: "13", role: "system", content: "Content 13" + LONG_STRING },
  { id: "14", role: "user", content: "Content 14" + LONG_STRING },
  { id: "15", role: "assistant", content: "Content 15" + LONG_STRING }
];

export const TWENTY_ITEMS = [
  { id: "1", role: "assistant", content: "Content 1" + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING },
  { id: "11", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "12", role: "error", content: "Content 12" + LONG_STRING },
  { id: "13", role: "system", content: "Content 13" + LONG_STRING },
  { id: "14", role: "user", content: "Content 14" + LONG_STRING },
  { id: "15", role: "assistant", content: "Content 15" + LONG_STRING },
  { id: "16", role: "error", content: "Content 16" + LONG_STRING },
  { id: "17", role: "system", content: "Content 17" + LONG_STRING },
  { id: "18", role: "user", content: "Content 18" + LONG_STRING },
  { id: "19", role: "assistant", content: "Content 19" + LONG_STRING },
  { id: "20", role: "assistant", content: "Content 20" + LONG_STRING }
] as const satisfies ChatMessage[];

export const TWENTY_FIVE_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1" + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING },
  { id: "11", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "12", role: "error", content: "Content 12" + LONG_STRING },
  { id: "13", role: "system", content: "Content 13" + LONG_STRING },
  { id: "14", role: "user", content: "Content 14" + LONG_STRING },
  { id: "15", role: "assistant", content: "Content 15" + LONG_STRING },
  { id: "16", role: "error", content: "Content 16" + LONG_STRING },
  { id: "17", role: "system", content: "Content 17" + LONG_STRING },
  { id: "18", role: "user", content: "Content 18" + LONG_STRING },
  { id: "19", role: "assistant", content: "Content 19" + LONG_STRING },
  { id: "20", role: "error", content: "Content 20" + LONG_STRING },
  { id: "21", role: "system", content: "Content 21" + LONG_STRING },
  { id: "22", role: "user", content: "Content 22" + LONG_STRING },
  { id: "23", role: "assistant", content: "Content 23" + LONG_STRING },
  { id: "24", role: "error", content: "Content 24" + LONG_STRING },
  { id: "25", role: "system", content: "Content 25" + LONG_STRING }
];

export const LOADING_STATE_VALUES: SmartGridDataState[] = [
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];

// Example messages with tool and chain-of-thought
export const MESSAGES_WITH_TOOL_AND_CHAIN_OF_THOUGHT: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Can you search for information about web components?"
  },
  {
    id: "2",
    role: "assistant",
    content: {
      message: "Let me search for that information.",
      tool: {
        toolName: "search_documentation",
        type: "search",
        state: "success",
        input: {
          query: "web components",
          filter: "documentation"
        },
        output: {
          results: [
            "Web Components are a set of web platform APIs",
            "They allow you to create reusable custom elements",
            "Shadow DOM provides encapsulation"
          ]
        },
        defaultOpen: true
      }
    }
  },
  {
    id: "3",
    role: "user",
    content: "Can you explain how you found that information?"
  },
  {
    id: "4",
    role: "assistant",
    content: {
      message: "Here's my reasoning process:",
      chainOfThought: {
        steps: [
          {
            id: "step-1",
            label: "Parse user query",
            description: "Extract keywords and intent from the user's question",
            status: "complete"
          },
          {
            id: "step-2",
            label: "Search knowledge base",
            description: "Query documentation and resources for relevant information",
            status: "complete"
          },
          {
            id: "step-3",
            label: "Filter and rank results",
            description: "Evaluate search results for relevance and accuracy",
            status: "active"
          },
          {
            id: "step-4",
            label: "Synthesize response",
            description: "Combine findings into a coherent answer",
            status: "pending"
          }
        ],
        searchResults: [
          {
            id: "result-1",
            url: "https://developer.mozilla.org/en-US/docs/Web/Web_Components",
            label: "MDN Web Components Guide"
          },
          {
            id: "result-2",
            url: "https://web.dev/web-components/",
            label: "Web.dev Web Components"
          }
        ],
        images: [
          {
            id: "img-1",
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect fill='%23e8f4f8' width='300' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23333'%3EWeb Components Architecture%3C/text%3E%3C/svg%3E",
            alt: "Web Components Architecture",
            caption: "Components consist of Custom Elements, Shadow DOM, and HTML Templates"
          }
        ],
        defaultOpen: true
      }
    }
  }
];


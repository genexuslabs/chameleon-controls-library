import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./tool-showcase.scss?inline";
import type {
  ChatCallbacks,
  ChatMessageRenderBySections
} from "../../../src/components/chat/internal/renders/types.js";
import type { AGUIMessage } from "../../../src/components/chat/typesAGUI.js";
import type { ChatTranslations } from "../../../src/components/chat/translations.js";
import type { ToolInput, ToolState } from "../../../src/components/tool/types.js";
import "../../../src/components/chat/chat.lit.js";
import "../../../src/components/tool/tool.lit.js";

/**
 * Tool call IDs that should render expanded by default. AG-UI's
 * `AGUIToolCall` / `AGUIToolMessage` carry no per-call open flag, so the
 * showcase decides the open policy at the render layer.
 */
const TOOL_CALLS_OPEN_BY_DEFAULT = new Set<string>(["call-getWeather-1"]);

const parseToolArgs = (args: string): ToolInput | undefined => {
  if (!args) return undefined;
  try {
    return JSON.parse(args) as ToolInput;
  } catch {
    return undefined;
  }
};

const deriveToolState = (
  result: { error?: string } | undefined
): ToolState =>
  result === undefined
    ? "input-available"
    : result.error !== undefined
    ? "output-error"
    : "output-available";

@Component({
  styles,
  tag: "showcase-tool-styling"
})
export class ShowcaseToolStyling extends KasstorElement {
  @state() private chatItems: AGUIMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Can you search for the latest AI trends and summarize them?"
    },
    {
      id: "2",
      role: "assistant",
      content: "I'll search for the latest AI trends for you.",
      toolCalls: [
        {
          id: "call-webSearch-1",
          type: "function",
          function: {
            name: "webSearch",
            arguments: JSON.stringify({
              query: "latest AI trends 2026",
              maxResults: 10,
              filters: ["news", "technology"]
            })
          }
        }
      ]
    },
    {
      id: "2-tool",
      role: "tool",
      toolCallId: "call-webSearch-1",
      content: JSON.stringify({
        results: [
          {
            title: "AI Agents Revolutionize Software Development",
            url: "https://example.com/ai-agents",
            snippet:
              "AI-powered coding assistants are transforming how developers work..."
          },
          {
            title: "Multimodal AI Models Breakthrough",
            url: "https://example.com/multimodal",
            snippet:
              "New models can understand and generate text, images, and audio..."
          },
          {
            title: "Enterprise AI Adoption Accelerates",
            url: "https://example.com/enterprise-ai",
            snippet:
              "Companies are deploying AI at scale for business automation..."
          }
        ],
        totalResults: 10
      })
    },
    {
      id: "3",
      role: "assistant",
      content:
        "Based on the search results, here are the latest AI trends:\n\n1. **AI Agents** are revolutionizing software development with intelligent coding assistants\n2. **Multimodal AI Models** can now understand and generate multiple types of content\n3. **Enterprise AI Adoption** is accelerating with focus on practical business applications"
    },
    {
      id: "4",
      role: "user",
      content: "Can you also check the weather in San Francisco?"
    },
    {
      id: "5",
      role: "assistant",
      content: "I'll fetch the current weather for San Francisco:",
      toolCalls: [
        {
          id: "call-getWeather-1",
          type: "function",
          function: {
            name: "getWeather",
            arguments: JSON.stringify({
              location: "San Francisco, CA",
              units: "fahrenheit"
            })
          }
        }
      ]
    },
    {
      id: "5-tool",
      role: "tool",
      toolCallId: "call-getWeather-1",
      content: JSON.stringify({
        temperature: 62,
        condition: "Partly Cloudy",
        humidity: 65,
        windSpeed: 12,
        forecast: "Mild temperatures with occasional clouds throughout the day"
      })
    },
    {
      id: "6",
      role: "assistant",
      content:
        "The weather in San Francisco is currently 62°F and partly cloudy. It's a pleasant day with mild temperatures!"
    }
  ];

  private chatTranslations: ChatTranslations = {
    accessibleName: {
      clearChat: "Clear chat",
      copyMessageContent: "Copy message content",
      downloadCodeButton: "Download code",
      sendButton: "Send message",
      sendInput: "Message input",
      stopResponseButton: "Stop generating answer"
    },
    placeholder: {
      sendInput: "Ask me anything..."
    },
    text: {
      copyCodeButton: "Copy code",
      copyMessageContent: "Copy",
      processing: "Processing...",
      sendButton: "↑",
      sourceFiles: "Source files:",
      stopResponseButton: "Stop"
    }
  };

  private chatCallbacks: ChatCallbacks = {
    sendChatMessages: (messages: AGUIMessage[]) => {
      console.log("Messages sent:", messages);

      this.chatItems = messages;

      // Simulate assistant response with a tool after a delay
      setTimeout(() => {
        const baseId = Date.now() + 1;
        const callId = `call-executeTask-${baseId}`;
        const lastUser = [...messages]
          .reverse()
          .find(m => m.role === "user");
        const taskInput =
          lastUser && typeof lastUser.content === "string"
            ? lastUser.content
            : "demo task";

        this.chatItems = [
          ...this.chatItems,
          {
            id: baseId.toString(),
            role: "assistant",
            content: "Let me help you with that:",
            toolCalls: [
              {
                id: callId,
                type: "function",
                function: {
                  name: "executeTask",
                  arguments: JSON.stringify({
                    task: taskInput,
                    priority: "high"
                  })
                }
              }
            ]
          },
          {
            id: `${baseId}-tool`,
            role: "tool",
            toolCallId: callId,
            content: JSON.stringify({
              status: "completed",
              result:
                "Task executed successfully. This is a demo response showing how tools can be integrated in chat conversations.",
              timestamp: new Date().toISOString()
            })
          }
        ];
      }, 1000);
    },

    stopResponse: async () => {
      console.log("Stop response requested");
    }
  };

  // Custom render: opens only the tool calls listed in
  // TOOL_CALLS_OPEN_BY_DEFAULT, keeping the rest collapsed.
  private chatRenderItem: ChatMessageRenderBySections = {
    tool: (toolCall, toolResult) => html`<ch-tool
      class="tool-container"
      part="tool-container"
      .toolName=${toolCall.function.name}
      .type=${toolCall.type}
      .state=${deriveToolState(toolResult)}
      .input=${parseToolArgs(toolCall.function.arguments)}
      .output=${toolResult?.content}
      .errorText=${toolResult?.error}
      .defaultOpen=${TOOL_CALLS_OPEN_BY_DEFAULT.has(toolCall.id)}
    ></ch-tool>`
  };

  override render() {
    return html`
      <div class="tool-showcase-container">
        <div class="showcase-header">
          <h1>Chat with Tool Component</h1>
          <p>
            Demonstrating the ch-tool component within chat interfaces, showing
            how AI agents invoke external functions and display results inline
            in conversations.
          </p>
        </div>

        <div class="chat-wrapper">
          <ch-chat
            .items=${this.chatItems}
            .callbacks=${this.chatCallbacks}
            .translations=${this.chatTranslations}
            .loadingState=${"all-records-loaded"}
            .renderItem=${this.chatRenderItem}
            .sendContainerLayout=${{
              sendContainerAfter: ["send-button"]
            }}
            class="styled-tool-chat"
          ></ch-chat>
        </div>

        <div class="showcase-footer">
          <h2>Styling Features</h2>
          <ul>
            <li>Tool component with clean, collapsible card design</li>
            <li>
              State-based badges with color-coded indicators (Pending, Running,
              Completed, Error)
            </li>
            <li>Syntax-highlighted JSON display for inputs and outputs</li>
            <li>Smooth accordion animations for expand/collapse</li>
            <li>Integrated approval workflow buttons when needed</li>
            <li>All styling achieved using CSS Shadow Parts</li>
          </ul>

          <h2>CSS Shadow Parts Used</h2>
          <ul>
            <li>
              <code>::part(container)</code> - Styles the main tool container
            </li>
            <li>
              <code>::part(header)</code> - Styles the tool header area
            </li>
            <li>
              <code>::part(header-badge)</code> - Styles the state indicator
              badge
            </li>
            <li>
              <code>::part(tool-name)</code> - Styles the tool name text
            </li>
            <li>
              <code>::part(content)</code> - Styles the expandable content area
            </li>
            <li>
              <code>::part(parameters-section)</code> - Styles the input
              parameters section
            </li>
            <li>
              <code>::part(parameters-title)</code> - Styles the "Parameters"
              title
            </li>
            <li>
              <code>::part(result-section)</code> - Styles the output results
              section
            </li>
            <li>
              <code>::part(result-title)</code> - Styles the "Result" title
            </li>
            <li>
              <code>::part(error-section)</code> - Styles the error message
              section
            </li>
            <li>
              <code>::part(confirmation-wrapper)</code> - Styles the approval
              confirmation container
            </li>
            <li>
              <code>::part(state-*)</code> - State-specific parts (e.g.,
              state-output-available, state-input-streaming)
            </li>
          </ul>

          <h2>Tool States</h2>
          <ul>
            <li>
              <code>input-streaming</code> - Tool is waiting for input
              parameters (badge: "Pending")
            </li>
            <li>
              <code>input-available</code> - Tool has input and is executing
              (badge: "Running")
            </li>
            <li>
              <code>approval-requested</code> - Tool requires user approval
              before execution
            </li>
            <li>
              <code>approval-responded</code> - User has approved the execution
            </li>
            <li>
              <code>output-available</code> - Tool completed successfully with
              results (badge: "Completed")
            </li>
            <li>
              <code>output-error</code> - Tool execution failed with an error
              (badge: "Error")
            </li>
            <li>
              <code>output-denied</code> - User rejected the tool execution
            </li>
          </ul>

          <h2>Use Cases</h2>
          <ul>
            <li>AI agent tool invocation in conversational interfaces</li>
            <li>External API calls with request/response tracking</li>
            <li>Command execution with approval workflows</li>
            <li>Database queries with results visualization</li>
            <li>File system operations with safety checks</li>
            <li>Integration with third-party services</li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-tool-styling": ShowcaseToolStyling;
  }
}

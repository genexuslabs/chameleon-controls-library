import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./reasoning-chat-showcase.scss?inline";
import type {
  ChatCallbacks,
  ChatMessage,
  ChatTranslations
} from "../../../src/components/chat/types.js";
import "../../../src/components/chat/chat.lit.js";

@Component({
  styles,
  tag: "showcase-reasoning-chat-styling"
})
export class ShowcaseReasoningChatStyling extends KasstorElement {
  @state() private chatItems: ChatMessage[] = [
    {
      id: "1",
      role: "user",
      content: "What's the best approach to optimize this database query?"
    },
    {
      id: "2",
      role: "assistant",
      content: {
        message: "Based on my analysis, I recommend adding a composite index. Here's why:",
        reasoning: {
          content: `Let me think through this step by step:

1. **Query Pattern Analysis**: The query filters on \`user_id\` and \`created_at\`, then sorts by \`created_at DESC\`.

2. **Current Performance**: Without an index, this requires a full table scan (O(n) complexity).

3. **Index Consideration**: A composite index on \`(user_id, created_at)\` would:
   - Allow direct lookup by user_id (O(log n))
   - Enable efficient range scan on created_at
   - Avoid sorting overhead since data is already ordered

4. **Trade-offs**:
   - Pros: 100-1000x faster for this query pattern
   - Cons: ~10% slower writes, additional 5-10MB disk space

5. **Conclusion**: The read performance gain far outweighs the minor write penalty for this use case.`,
          isStreaming: true,
          thinkingMessage: "Analyzing query patterns...",
          thoughtMessageTemplate: "Analyzed in {duration}s",
          streamingSpeedMs: 10
        }
      }
    },
    {
      id: "3",
      role: "user",
      content: "Can you show me how to create that index?"
    },
    {
      id: "4",
      role: "assistant",
      content: {
        message: "Here's the SQL command to create the composite index:",
        reasoning: {
          content: `Considering the best practices for index creation:

1. **Naming Convention**: Use descriptive names that indicate the columns involved
2. **Column Order**: Place the equality filter (user_id) before the range filter (created_at)
3. **Index Type**: B-tree is optimal for this combination of equality and range queries
4. **Concurrent Creation**: Use CONCURRENTLY to avoid locking the table during creation`,
          isStreaming: true,
          thinkingMessage: "Formulating index creation strategy...",
          thoughtMessageTemplate: "Thought for {duration}s",
          streamingSpeedMs: 15
        }
      }
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
      sendButton: "\u2191",
      sourceFiles: "Source files:",
      stopResponseButton: "Stop"
    }
  };

  private chatCallbacks: ChatCallbacks = {
    onSendMessage: async (message: string) => {
      console.log("Message sent:", message);

      // Add user message
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "user",
          content: message
        }
      ];

      // Simulate assistant response with reasoning after a delay
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: {
              message: "That's an interesting question! Let me think about it carefully.",
              reasoning: {
                content:
                  "This query requires careful analysis of multiple perspectives. I'm considering the technical aspects, practical implications, and potential edge cases. The solution should be both elegant and robust.",
                isStreaming: true,
                thinkingMessage: "Thinking...",
                thoughtMessageTemplate: "Thought for {duration}s",
                streamingSpeedMs: 12
              }
            }
          }
        ];
      }, 1000);
    },

    onStopResponse: () => {
      console.log("Stop response requested");
    }
  };

  render() {
    return html`
      <div class="reasoning-showcase-container">
        <div class="showcase-header">
          <h1>Reasoning Component in Chat</h1>
          <p>
            Demonstrating the ch-reasoning component within the chat interface,
            styled to match modern AI chat experiences
          </p>
        </div>

        <div class="chat-wrapper">
          <ch-chat
            .items=${this.chatItems}
            .callbacks=${this.chatCallbacks}
            .translations=${this.chatTranslations}
            .loadingState=${"loaded"}
            .sendContainerLayout=${{
              sendContainerAfter: ["send-button"]
            }}
            class="styled-reasoning-chat"
          ></ch-chat>
        </div>

        <div class="showcase-footer">
          <h2>Styling Features</h2>
          <ul>
            <li>Reasoning component styled with subtle backgrounds and borders</li>
            <li>Collapsible accordion for showing/hiding reasoning details</li>
            <li>Clean, minimal design matching modern AI interfaces</li>
            <li>Smooth animations and transitions</li>
            <li>
              All styling achieved using CSS Shadow Parts and custom properties
            </li>
          </ul>

          <h2>CSS Shadow Parts Used</h2>
          <ul>
            <li>
              <code>::part(header)</code> - Styles the clickable reasoning
              trigger
            </li>
            <li>
              <code>::part(section)</code> - Styles the collapsible reasoning
              content
            </li>
            <li>
              <code>::part(panel)</code> - Styles the outer reasoning container
            </li>
            <li>
              <code>::part(expanded)</code> and <code>::part(collapsed)</code> -
              Styles for different accordion states
            </li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-reasoning-chat-styling": ShowcaseReasoningChatStyling;
  }
}

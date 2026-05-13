import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./confirmation-showcase.scss?inline";
import type { ChatCallbacks } from "../../../src/components/chat/internal/renders/types.js";
import type { AGUIMessage } from "../../../src/components/chat/typesAGUI.js";
import type { ChatTranslations } from "../../../src/components/chat/translations.js";
import "../../../src/components/chat/chat.lit.js";
import "../../../src/components/confirmation/confirmation.lit.js";

@Component({
  styles,
  tag: "showcase-confirmation-styling"
})
export class ShowcaseConfirmationStyling extends KasstorElement {
  @state() private chatItems: AGUIMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Can you delete all the temporary files in my project?"
    },
    {
      id: "2-confirmation",
      role: "activity",
      activityType: "confirmation",
      content: {
        state: "approval-requested",
        approval: {
          id: "delete-temp-files-001"
        },
        title: "Delete temporary files",
        requestMessage:
          "I found 127 temporary files (45 MB total). Do you want me to delete them?"
      }
    },
    {
      id: "4-confirmation",
      role: "activity",
      activityType: "confirmation",
      content: {
        state: "approval-responded",
        approval: {
          id: "delete-temp-files-001"
        },
        title: "Delete temporary files",
        acceptedMessage: "Approval granted — deletion in progress..."
      }
    },
    {
      id: "5",
      role: "assistant",
      content:
        "Successfully deleted 127 temporary files and freed 45 MB of disk space!"
    },
    {
      id: "6",
      role: "user",
      content: "Can you also reset my database to the initial state?"
    },
    {
      id: "7-confirmation",
      role: "activity",
      activityType: "confirmation",
      content: {
        state: "approval-requested",
        approval: {
          id: "reset-database-001"
        },
        title: "⚠️ Reset database",
        requestMessage:
          "This is a destructive action — all current data will be erased and replaced with the initial seed. This cannot be undone. Are you sure you want to proceed?"
      }
    },
    {
      id: "9-confirmation",
      role: "activity",
      activityType: "confirmation",
      content: {
        state: "output-denied",
        approval: {
          id: "reset-database-001"
        },
        title: "Reset database",
        rejectedMessage: "Action cancelled — no changes were made."
      }
    },
    {
      id: "10",
      role: "assistant",
      content:
        "Good choice! Your database data is safe. Is there anything else I can help you with?"
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
      sendInput: "What would you like me to do?"
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

      // Simulate assistant response with a confirmation after a delay
      setTimeout(() => {
        const baseId = Date.now() + 1;
        this.chatItems = [
          ...this.chatItems,
          {
            id: baseId.toString(),
            role: "assistant",
            content: "I need your permission to proceed:"
          },
          {
            id: `${baseId}-confirmation`,
            role: "activity",
            activityType: "confirmation",
            content: {
              state: "approval-requested",
              approval: {
                id: `execute-action-${baseId}`
              }
            }
          }
        ];
      }, 1000);
    },

    stopResponse: async () => {
      console.log("Stop response requested");
    }
  };

  // Handle approve action — flip the matching confirmation activity to
  // "approval-responded".
  private handleApprove = (messageId: string) => {
    console.log("Approve clicked for message:", messageId);

    const messageIndex = this.chatItems.findIndex(item => item.id === messageId);
    if (messageIndex === -1) return;

    const message = this.chatItems[messageIndex];
    if (message.role !== "activity" || message.activityType !== "confirmation") {
      return;
    }

    const updatedItems = [...this.chatItems];
    updatedItems[messageIndex] = {
      ...message,
      content: {
        ...message.content,
        state: "approval-responded"
      }
    };

    this.chatItems = updatedItems;

    // Follow-up assistant message — the user's decision is already captured
    // by the confirmation state flip; no synthetic user message is needed.
    setTimeout(() => {
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "✅ Action completed successfully! The operation has been executed as requested."
        }
      ];
    }, 500);
  };

  // Handle reject action — flip the matching confirmation activity to
  // "output-denied".
  private handleReject = (messageId: string) => {
    console.log("Reject clicked for message:", messageId);

    const messageIndex = this.chatItems.findIndex(item => item.id === messageId);
    if (messageIndex === -1) return;

    const message = this.chatItems[messageIndex];
    if (message.role !== "activity" || message.activityType !== "confirmation") {
      return;
    }

    const updatedItems = [...this.chatItems];
    updatedItems[messageIndex] = {
      ...message,
      content: {
        ...message.content,
        state: "output-denied"
      }
    };

    this.chatItems = updatedItems;

    setTimeout(() => {
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Understood. The action has been cancelled. Your data remains unchanged."
        }
      ];
    }, 500);
  };

  override firstUpdated() {
    this.addEventListener("approve", ((event: CustomEvent) => {
      console.log("Approve event caught:", event);
      const messageWithConfirmation = this.chatItems.find(
        item =>
          item.role === "activity" &&
          item.activityType === "confirmation" &&
          (item.content as { state?: string })?.state === "approval-requested"
      );
      if (messageWithConfirmation) {
        this.handleApprove(messageWithConfirmation.id);
      }
    }) as EventListener);

    this.addEventListener("reject", ((event: CustomEvent) => {
      console.log("Reject event caught:", event);
      const messageWithConfirmation = this.chatItems.find(
        item =>
          item.role === "activity" &&
          item.activityType === "confirmation" &&
          (item.content as { state?: string })?.state === "approval-requested"
      );
      if (messageWithConfirmation) {
        this.handleReject(messageWithConfirmation.id);
      }
    }) as EventListener);
  }

  override render() {
    return html`
      <div class="confirmation-showcase-container">
        <div class="showcase-header">
          <h1>Chat with Confirmation Component</h1>
          <p>
            Demonstrating the ch-confirmation component within chat interfaces,
            showing how AI agents request user approval for sensitive or
            destructive actions.
          </p>
        </div>

        <div class="chat-wrapper">
          <ch-chat
            .items=${this.chatItems}
            .callbacks=${this.chatCallbacks}
            .translations=${this.chatTranslations}
            .loadingState=${"all-records-loaded"}
            .sendContainerLayout=${{
              sendContainerAfter: ["send-button"]
            }}
            class="styled-confirmation-chat"
          ></ch-chat>
        </div>

        <div class="showcase-footer">
          <h2>Styling Features</h2>
          <ul>
            <li>Confirmation component with clean, card-based design</li>
            <li>
              Color-coded buttons: approve (green gradient) and reject (neutral
              gray)
            </li>
            <li>State-specific messages for different approval states</li>
            <li>Smooth transitions between states</li>
            <li>Clear visual hierarchy with title and message separation</li>
            <li>All styling achieved using CSS Shadow Parts</li>
          </ul>

          <h2>CSS Shadow Parts Used</h2>
          <ul>
            <li>
              <code>::part(container)</code> - Styles the main confirmation
              container
            </li>
            <li>
              <code>::part(title)</code> - Styles the confirmation title
            </li>
            <li>
              <code>::part(message)</code> - Styles the message text
            </li>
            <li>
              <code>::part(actions)</code> - Styles the action buttons container
            </li>
            <li>
              <code>::part(button-approve)</code> - Styles the approve button
            </li>
            <li>
              <code>::part(button-reject)</code> - Styles the reject button
            </li>
            <li>
              <code>::part(state-approval-requested)</code> - State-specific
              styling for approval requests
            </li>
            <li>
              <code>::part(state-approval-responded)</code> - State-specific
              styling for approved actions
            </li>
            <li>
              <code>::part(state-output-denied)</code> - State-specific styling
              for rejected actions
            </li>
            <li>
              <code>::part(state-output-available)</code> - State-specific
              styling for completed actions
            </li>
          </ul>

          <h2>Confirmation States</h2>
          <ul>
            <li>
              <code>approval-requested</code> - Waiting for user approval,
              displays buttons
            </li>
            <li>
              <code>approval-responded</code> - User has approved, shows
              acceptance message
            </li>
            <li>
              <code>output-denied</code> - User has rejected, shows rejection
              message
            </li>
            <li>
              <code>output-available</code> - Action completed successfully
            </li>
          </ul>

          <h2>Use Cases</h2>
          <ul>
            <li>Destructive action confirmations (delete, reset, drop tables)</li>
            <li>AI agent requesting permission to execute tools</li>
            <li>File system operations requiring user approval</li>
            <li>Database modifications with safety checks</li>
            <li>Sensitive operations in conversational AI interfaces</li>
            <li>Multi-step approval workflows with state tracking</li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-confirmation-styling": ShowcaseConfirmationStyling;
  }
}

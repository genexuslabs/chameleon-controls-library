import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./confirmation-showcase.scss?inline";
import type {
  ChatCallbacks,
  ChatMessage,
  ChatTranslations
} from "../../../src/components/chat/types.js";
import type { ConfirmationModel } from "../../../src/components/confirmation/types.js";
import "../../../src/components/chat/chat.lit.js";
import "../../../src/components/confirmation/confirmation.lit.js";

@Component({
  styles,
  tag: "showcase-confirmation-styling"
})
export class ShowcaseConfirmationStyling extends KasstorElement {
  @state() private chatItems: ChatMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Can you delete all the temporary files in my project?"
    },
    {
      id: "2",
      role: "assistant",
      content: {
        message: "I found 127 temporary files. I need your permission to delete them:",
        confirmation: {
          title: "Delete Temporary Files?",
          state: "approval-requested",
          requestMessage:
            "This will permanently delete 127 temporary files (about 45 MB). This action cannot be undone.",
          approveButtonLabel: "Delete Files",
          rejectButtonLabel: "Cancel"
        } as ConfirmationModel
      }
    },
    {
      id: "3",
      role: "user",
      content: "Yes, please delete them."
    },
    {
      id: "4",
      role: "assistant",
      content: {
        message: "",
        confirmation: {
          title: "Delete Temporary Files?",
          state: "approval-responded",
          acceptedMessage: "Deletion approved. Removing temporary files..."
        } as ConfirmationModel
      }
    },
    {
      id: "5",
      role: "assistant",
      content: "Successfully deleted 127 temporary files and freed 45 MB of disk space!"
    },
    {
      id: "6",
      role: "user",
      content: "Can you also reset my database to the initial state?"
    },
    {
      id: "7",
      role: "assistant",
      content: {
        message: "⚠️ This is a destructive action. Here's what will happen:",
        confirmation: {
          title: "⚠️ Reset Database?",
          state: "approval-requested",
          requestMessage:
            "This will DROP all tables and recreate them with seed data. All current data will be permanently lost. This action cannot be undone.",
          approveButtonLabel: "Yes, Reset Database",
          rejectButtonLabel: "No, Keep Current Data"
        } as ConfirmationModel
      }
    },
    {
      id: "8",
      role: "user",
      content: "No, don't do that. I need to keep my data."
    },
    {
      id: "9",
      role: "assistant",
      content: {
        message: "",
        confirmation: {
          title: "⚠️ Reset Database?",
          state: "output-denied",
          rejectedMessage:
            "Database reset was cancelled. Your data remains safe and unchanged."
        } as ConfirmationModel
      }
    },
    {
      id: "10",
      role: "assistant",
      content: "Good choice! Your database data is safe. Is there anything else I can help you with?"
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

      // Simulate assistant response with a confirmation after a delay
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: {
              message: "I need your permission to proceed:",
              confirmation: {
                title: "Execute Action?",
                state: "approval-requested",
                requestMessage:
                  "This action requires your confirmation. Do you want to proceed with this request?",
                approveButtonLabel: "Approve",
                rejectButtonLabel: "Reject"
              } as ConfirmationModel
            }
          }
        ];
      }, 1000);
    },

    onStopResponse: () => {
      console.log("Stop response requested");
    }
  };

  // Handle approve action
  private handleApprove = (messageId: string) => {
    console.log("Approve clicked for message:", messageId);

    // Find the message with confirmation
    const messageIndex = this.chatItems.findIndex((item) => item.id === messageId);
    if (messageIndex === -1) return;

    const message = this.chatItems[messageIndex];
    if (typeof message.content !== "object" || !message.content.confirmation) return;

    // Update the confirmation state to approval-responded
    const updatedItems = [...this.chatItems];
    updatedItems[messageIndex] = {
      ...message,
      content: {
        ...message.content,
        confirmation: {
          ...message.content.confirmation,
          state: "approval-responded",
          acceptedMessage: "Approval granted. Executing the action..."
        }
      }
    };

    this.chatItems = updatedItems;

    // Add user confirmation message
    setTimeout(() => {
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "user",
          content: "Yes, please proceed."
        }
      ];

      // Add assistant success message
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "✅ Action completed successfully! The operation has been executed as requested."
          }
        ];
      }, 500);
    }, 300);
  };

  // Handle reject action
  private handleReject = (messageId: string) => {
    console.log("Reject clicked for message:", messageId);

    // Find the message with confirmation
    const messageIndex = this.chatItems.findIndex((item) => item.id === messageId);
    if (messageIndex === -1) return;

    const message = this.chatItems[messageIndex];
    if (typeof message.content !== "object" || !message.content.confirmation) return;

    // Update the confirmation state to output-denied
    const updatedItems = [...this.chatItems];
    updatedItems[messageIndex] = {
      ...message,
      content: {
        ...message.content,
        confirmation: {
          ...message.content.confirmation,
          state: "output-denied",
          rejectedMessage: "Action cancelled. The operation will not be executed."
        }
      }
    };

    this.chatItems = updatedItems;

    // Add user rejection message
    setTimeout(() => {
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "user",
          content: "No, please cancel that."
        }
      ];

      // Add assistant acknowledgment message
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Understood. The action has been cancelled. Your data remains unchanged."
          }
        ];
      }, 500);
    }, 300);
  };

  override firstUpdated() {
    // Listen to approve/reject events from ch-confirmation components
    this.addEventListener("approve", ((event: CustomEvent) => {
      console.log("Approve event caught:", event);
      // Find the message that contains this confirmation
      // We need to find which message has state "approval-requested"
      const messageWithConfirmation = this.chatItems.find(
        (item) =>
          typeof item.content === "object" &&
          item.content.confirmation?.state === "approval-requested"
      );
      if (messageWithConfirmation) {
        this.handleApprove(messageWithConfirmation.id);
      }
    }) as EventListener);

    this.addEventListener("reject", ((event: CustomEvent) => {
      console.log("Reject event caught:", event);
      // Find the message that contains this confirmation
      const messageWithConfirmation = this.chatItems.find(
        (item) =>
          typeof item.content === "object" &&
          item.content.confirmation?.state === "approval-requested"
      );
      if (messageWithConfirmation) {
        this.handleReject(messageWithConfirmation.id);
      }
    }) as EventListener);
  }

  render() {
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
            .loadingState=${"loaded"}
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

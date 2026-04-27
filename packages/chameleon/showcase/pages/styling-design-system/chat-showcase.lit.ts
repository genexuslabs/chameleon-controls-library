import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./chat-showcase.scss?inline";
import type {
  ChatCallbacks,
  ChatMessage,
  ChatTranslations
} from "../../../src/components/chat/types.js";
import type { ConfirmationModel } from "../../../src/components/confirmation/types.js";
import "../../../src/components/chat/chat.lit.js";

@Component({
  styles,
  tag: "showcase-chat-styling"
})
export class ShowcaseChatStyling extends KasstorElement {
  @state() private chatItems: ChatMessage[] = [
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you with various tasks, answer questions, and have conversations. What would you like to know?",
      metadata: {}
    },
    {
      id: "2",
      role: "user",
      content: "Can you help me understand how to style the chat component?",
      metadata: {}
    },
    {
      id: "3",
      role: "assistant",
      content:
        "Of course! The ch-chat component is white-label and highly customizable using CSS shadow parts. You can style the messages container, input area, send button, and more. Each part gives you full control over the appearance.",
      metadata: {}
    },

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
      sendInput: "What would you like to know?"
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
          content: message,
          metadata: {}
        }
      ];

      // Simulate assistant response after a delay
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "This is a demo response. In a real application, this would be connected to an AI service or backend API. The styling you see here is achieved purely through CSS shadow parts!",
            metadata: {}
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

    const messageIndex = this.chatItems.findIndex((item) => item.id === messageId);
    if (messageIndex === -1) return;

    const message = this.chatItems[messageIndex];
    if (typeof message.content !== "object" || !message.content.confirmation) return;

    const updatedItems = [...this.chatItems];
    updatedItems[messageIndex] = {
      ...message,
      content: {
        ...message.content,
        confirmation: {
          ...message.content.confirmation,
          state: "approval-responded",
          acceptedMessage: "Approval granted! Executing the operation..."
        } as ConfirmationModel
      }
    };

    this.chatItems = updatedItems;

    setTimeout(() => {
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "user",
          content: "Yes, go ahead!",
          metadata: {}
        }
      ];

      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Perfect! The operation has been completed successfully. Everything is working as expected.",
            metadata: {}
          }
        ];
      }, 500);
    }, 300);
  };

  // Handle reject action
  private handleReject = (messageId: string) => {
    console.log("Reject clicked for message:", messageId);

    const messageIndex = this.chatItems.findIndex((item) => item.id === messageId);
    if (messageIndex === -1) return;

    const message = this.chatItems[messageIndex];
    if (typeof message.content !== "object" || !message.content.confirmation) return;

    const updatedItems = [...this.chatItems];
    updatedItems[messageIndex] = {
      ...message,
      content: {
        ...message.content,
        confirmation: {
          ...message.content.confirmation,
          state: "output-denied",
          rejectedMessage: "Operation cancelled. No changes were made."
        } as ConfirmationModel
      }
    };

    this.chatItems = updatedItems;

    setTimeout(() => {
      this.chatItems = [
        ...this.chatItems,
        {
          id: Date.now().toString(),
          role: "user",
          content: "No, please don't do that.",
          metadata: {}
        }
      ];

      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Understood. The operation has been cancelled. No changes have been made to your data.",
            metadata: {}
          }
        ];
      }, 500);
    }, 300);
  };

  override firstUpdated() {
    this.addEventListener("approve", ((event: CustomEvent) => {
      console.log("Approve event caught:", event);
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
      <div class="chat-showcase-container">
        <div class="showcase-header">
          <h1>Chat Component Styling</h1>
          <p>
            Demonstrating how to style the white-label ch-chat component using
            CSS shadow parts for a modern AI chat interface.
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
            class="styled-chat"
          ></ch-chat>
        </div>

        <div class="showcase-footer">
          <h2>Styling Features</h2>
          <ul>
            <li>Clean, minimalist design inspired by modern AI interfaces</li>
            <li>Customized input with rounded corners and focus states</li>
            <li>Icon-based send button positioned inside the input</li>
            <li>
              Styled confirmation buttons with gradient approve button and
              outlined reject button
            </li>
            <li>State-based styling for confirmation alerts</li>
            <li>Proper spacing and typography throughout</li>
            <li>Light color palette for better readability</li>
            <li>
              All styling achieved using CSS Shadow Parts (no JavaScript
              modifications)
            </li>
            <li>Interactive confirmation with automatic responses</li>
          </ul>

          <h2>CSS Shadow Parts Used</h2>
          <ul>
            <li>
              <code>::part(messages-container)</code> - Styles the scrollable
              message area
            </li>
            <li>
              <code>::part(send-container)</code> - Styles the bottom input bar
            </li>
            <li>
              <code>::part(send-input)</code> - Styles the text input (ch-edit
              host)
            </li>
            <li>
              <code>::part(send-input-after)</code> - Styles the region after
              the input (contains send button)
            </li>
            <li>
              <code>::part(send-button)</code> - Styles the send icon button
            </li>
            <li>
              <code>::part(confirmation-container)</code> - Styles the
              confirmation alert container
            </li>
          </ul>

          <h2>Confirmation Component Parts</h2>
          <ul>
            <li>
              <code>ch-confirmation::part(title)</code> - Styles the
              confirmation title
            </li>
            <li>
              <code>ch-confirmation::part(message)</code> - Styles the
              confirmation message text
            </li>
            <li>
              <code>ch-confirmation::part(actions)</code> - Styles the buttons
              container
            </li>
            <li>
              <code>ch-confirmation::part(button-approve)</code> - Styles the
              approve button (green gradient)
            </li>
            <li>
              <code>ch-confirmation::part(button-reject)</code> - Styles the
              reject button (red outlined)
            </li>
            <li>
              <code>ch-confirmation::part(container)</code> - State-based
              styling with parts like approval-requested, approval-responded,
              etc.
            </li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-chat-styling": ShowcaseChatStyling;
  }
}

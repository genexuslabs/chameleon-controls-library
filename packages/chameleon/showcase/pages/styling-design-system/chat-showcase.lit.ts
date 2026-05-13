import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./chat-showcase.scss?inline";
import type { ChatCallbacks } from "../../../src/components/chat/internal/renders/types.js";
import type { AGUIMessage } from "../../../src/components/chat/typesAGUI.js";
import type { ChatTranslations } from "../../../src/components/chat/translations.js";
import "../../../src/components/chat/chat.lit.js";

@Component({
  styles,
  tag: "showcase-chat-styling"
})
export class ShowcaseChatStyling extends KasstorElement {
  @state() private chatItems: AGUIMessage[] = [
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you with various tasks, answer questions, and have conversations. What would you like to know?"
    },
    {
      id: "2",
      role: "user",
      content: "Can you help me understand how to style the chat component?"
    },
    {
      id: "3",
      role: "assistant",
      content:
        "Of course! The ch-chat component is white-label and highly customizable using CSS shadow parts. You can style the messages container, input area, send button, and more. Each part gives you full control over the appearance."
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
      sendInput: "What would you like to know?"
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

      // Simulate assistant response after a delay
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "This is a demo response. In a real application, this would be connected to an AI service or backend API. The styling you see here is achieved purely through CSS shadow parts!"
          }
        ];
      }, 1000);
    },

    stopResponse: async () => {
      console.log("Stop response requested");
    }
  };

  // Handle approve action — locates the active confirmation activity message
  // and flips its state. Confirmation activities are now separate AG-UI
  // messages with role: "activity" and activityType: "confirmation".
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
            "Perfect! The operation has been completed successfully. Everything is working as expected."
        }
      ];
    }, 500);
  };

  // Handle reject action — flips the confirmation activity to output-denied.
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
            "Understood. The operation has been cancelled. No changes have been made to your data."
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
            .loadingState=${"all-records-loaded"}
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

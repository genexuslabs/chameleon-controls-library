import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import styles from "./showcase-chat.scss?inline";
import "../../../src/components/chat/chat.lit";

@Component({
  styles,
  tag: "showcase-chat"
})
export class ShowcaseChat extends KasstorElement {
  #chatRef = createRef<HTMLChChatElement>();

  override connectedCallback() {
    super.connectedCallback();
  }

  override firstUpdated() {
    const chat = this.#chatRef.value;
    if (!chat) return;

    const messages = [
      {
        id: "1",
        role: "system" as const,
        content: "You are a helpful AI assistant."
      },
      {
        id: "2",
        role: "assistant" as const,
        content: "👋 Hello! I'm ready to help you. Try sending a message!",
        status: "complete" as const
      }
    ];

    chat.items = messages;
    chat.loadingState = "all-records-loaded";
    chat.newUserMessageAlignment = "end";

    chat.callbacks = {
      sendChatMessages: (messages) => {
        console.log("📤 Sending:", messages);
        
        setTimeout(() => {
          const lastMessage = messages[messages.length - 1];
          chat.addNewMessage({
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `You said: "${lastMessage.content}". This is a simulated response with **markdown** support!`,
            status: "complete"
          });
        }, 500);
      },
      
      validateSendChatMessage: (message) => {
        return message.content && message.content.trim() !== "";
      }
    };
  }

  override render() {
    return html`
      <div style="display: flex; flex-direction: column; height: 100vh; width: 100%; box-sizing: border-box;">
        <div style="padding: 20px;">
          <h1>Chat Component Demo</h1>
        </div>
        <ch-chat
          ${ref(this.#chatRef)}
          style="flex: 1; min-height: 0; border: 2px solid #e0e0e0; border-radius: 8px; margin: 0 20px 20px 20px; background: white;"
        >
          <!-- Opcional: descomentar para personalizar el botón -->
          <!-- <span slot="send-button-content">📤</span> -->
        </ch-chat>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-chat": ShowcaseChat;
  }
}

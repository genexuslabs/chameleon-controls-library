import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { state } from "lit/decorators/state.js";

import styles from "./showcase-chat.scss?inline";
import "../../../src/components/chat/chat.lit";
import type { ChatMessage } from "../../../src/components/chat/types";

@Component({
  styles,
  tag: "showcase-chat2"
})
export class ShowcaseChat2 extends KasstorElement {
  #chatRef = createRef<HTMLChChatElement>();
  #stopStreamingFlag = false;
  #currentPage = 0;
  #hasMoreData = true;
  #selectedFiles: File[] = [];

  @state() waitingResponse = false;
  @state() showAdditionalContent = false;
  @state() alignment: "start" | "end" = "end";
  @state() sendButtonDisabled = false;
  @state() sendInputDisabled = false;

  override connectedCallback() {
    super.connectedCallback();
  }

  override firstUpdated() {
    const chat = this.#chatRef.value;
    if (!chat) return;

    const messages: ChatMessage[] = [
      {
        id: "system-1",
        role: "system",
        content: "You are a helpful AI assistant with access to multiple media types and streaming capabilities."
      },
      {
        id: "assistant-welcome",
        role: "assistant",
        content: `# 🎉 Complete Chat Component Showcase

Welcome! This demo shows **ALL** features of the \`ch-chat\` component.

## 📋 What You'll See Below:
- ✅ Text messages with **markdown**
- ✅ Messages with images, videos, audio
- ✅ Messages with PDF documents
- ✅ Code blocks with syntax highlighting
- ✅ Messages with sources/metadata
- ✅ Streaming responses
- ✅ File uploads
- ✅ Error states

Scroll down to see examples! 👇`,
        status: "complete"
      },
      {
        id: "user-1",
        role: "user",
        content: "Can you show me some examples with images?"
      },
      {
        id: "assistant-images",
        role: "assistant",
        content: {
          message: `# 📸 Images in Chat

Here are some example images displayed in the chat:`,
          files: [
            {
              url: "https://picsum.photos/seed/demo1/600/400",
              mimeType: "image/jpeg",
              alternativeText: "Beautiful landscape with mountains",
              caption: "landscape.jpg"
            },
            {
              url: "https://picsum.photos/seed/demo2/400/400",
              mimeType: "image/png",
              alternativeText: "Abstract pattern",
              caption: "pattern.png"
            },
            {
              url: "https://picsum.photos/seed/demo3/800/400",
              mimeType: "image/webp",
              alternativeText: "City skyline",
              caption: "city.webp"
            }
          ]
        },
        status: "complete"
      },
      {
        id: "user-2",
        role: "user",
        content: {
          message: "I also want to share an image!",
          files: [
            {
              url: "https://picsum.photos/seed/user1/500/500",
              mimeType: "image/jpeg",
              alternativeText: "User uploaded image",
              caption: "my-photo.jpg"
            }
          ]
        }
      },
      {
        id: "assistant-videos",
        role: "assistant",
        content: {
          message: `# 🎥 Video Support

The chat can also display video files:`,
          files: [
            {
              url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              mimeType: "video/mp4",
              caption: "big_buck_bunny.mp4",
              accessibleName: "Big Buck Bunny sample video - Animated short film"
            }
          ]
        },
        status: "complete"
      },
      {
        id: "user-3",
        role: "user",
        content: "What about audio files?"
      },
      {
        id: "assistant-audio",
        role: "assistant",
        content: {
          message: `# 🎵 Audio Files

Here's an example with audio:`,
          files: [
            {
              url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
              mimeType: "audio/mpeg",
              caption: "sample-audio.mp3",
              accessibleName: "Sample music track"
            }
          ]
        },
        status: "complete"
      },
      {
        id: "user-4",
        role: "user",
        content: "Can you handle documents like PDFs?"
      },
      {
        id: "assistant-docs",
        role: "assistant",
        content: {
          message: `# 📄 Documents Support

Yes! Here are some document examples:`,
          files: [
            {
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              mimeType: "application/pdf",
              caption: "report.pdf"
            },
            {
              url: "https://example.com/document.docx",
              mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              caption: "document.docx"
            },
            {
              url: "https://example.com/spreadsheet.xlsx",
              mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              caption: "data.xlsx"
            }
          ]
        },
        status: "complete"
      },
      {
        id: "user-5",
        role: "user",
        content: "Show me a message with code"
      },
      {
        id: "assistant-code",
        role: "assistant",
        content: `# 💻 Code Examples

Here's how code blocks look in the chat:

\`\`\`typescript
import { Component } from "@genexus/kasstor-core";

@Component({
  tag: "my-chat",
  styles: styles
})
export class MyChat extends KasstorElement {
  #chatRef = createRef<HTMLChChatElement>();

  async sendMessage(content: string) {
    await this.#chatRef.value?.sendChatMessage({
      id: \`msg-\${Date.now()}\`,
      role: "user",
      content: content
    });
  }
}
\`\`\`

\`\`\`javascript
// Simple JavaScript example
const chat = document.querySelector('ch-chat');
chat.addNewMessage({
  id: 'msg-1',
  role: 'assistant',
  content: 'Hello World!'
});
\`\`\`

\`\`\`css
/* Styling example */
ch-chat {
  --chat-background: #ffffff;
  --chat-user-message-bg: #007bff;
  --chat-assistant-message-bg: #f1f1f1;
}
\`\`\``,
        status: "complete"
      },
      {
        id: "user-6",
        role: "user",
        content: "Can you show messages with sources?"
      },
      {
        id: "assistant-sources",
        role: "assistant",
        content: {
          message: `# 📚 Messages with Sources

This message includes source references:

According to the documentation, the chat component supports virtual scrolling for optimal performance with large message histories. It also includes built-in markdown rendering and file attachment capabilities.`,
          sources: [
            {
              caption: "Chat Component Documentation",
              url: "https://example.com/docs/chat"
            },
            {
              caption: "API Reference",
              url: "https://example.com/api/ch-chat",
              accessibleName: "API Reference for ch-chat component"
            },
            {
              caption: "GitHub Repository",
              url: "https://github.com/example/chameleon"
            }
          ]
        },
        status: "complete"
      },
      {
        id: "user-7",
        role: "user",
        content: "What about mixing files and sources?"
      },
      {
        id: "assistant-mixed",
        role: "assistant",
        content: {
          message: `# 🎨 Mixed Content

This message has **both** files and sources:`,
          files: [
            {
              url: "https://picsum.photos/seed/mixed1/600/400",
              mimeType: "image/jpeg",
              caption: "diagram.jpg",
              alternativeText: "Architecture diagram"
            },
            {
              url: "https://example.com/presentation.pdf",
              mimeType: "application/pdf",
              caption: "slides.pdf"
            }
          ],
          sources: [
            {
              caption: "Design Guidelines",
              url: "https://example.com/design"
            },
            {
              caption: "Best Practices",
              url: "https://example.com/practices"
            }
          ]
        },
        status: "complete"
      },
      {
        id: "user-8",
        role: "user",
        content: "Show me a long message to test scrolling"
      },
      {
        id: "assistant-long",
        role: "assistant",
        content: `# 📜 Long Message Example

This is a longer message to demonstrate auto-scrolling behavior and how the chat handles extensive content.

## Section 1: Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Section 2: Features
- **Virtual Scrolling**: Efficiently handles thousands of messages
- **Auto-scroll**: Automatically scrolls to new messages
- **Markdown Support**: Full GitHub-flavored markdown
- **File Attachments**: Images, videos, audio, documents
- **Streaming**: Real-time response streaming
- **Customization**: Flexible layouts and styling

## Section 3: Implementation Details
The component uses \`ch-virtual-scroller\` internally to render only visible messages, improving performance dramatically. The buffer size can be configured via the \`virtualScrollerBufferSize\` property.

## Section 4: Code Integration
Integration is simple:

1. Import the component
2. Set up callbacks
3. Configure properties
4. Start chatting!

## Section 5: Advanced Features
For advanced use cases, you can:
- Customize message rendering with \`renderItem\`
- Add custom layout elements with \`sendContainerLayout\`
- Implement file uploads with \`uploadFile\` callback
- Stream responses with \`updateLastMessage\`
- Validate messages with \`validateSendChatMessage\`

## Section 6: Conclusion
The chat component is production-ready and highly customizable! 🚀`,
        status: "complete"
      },
      {
        id: "assistant-waiting-demo",
        role: "assistant",
        content: "This message is in 'waiting' state (notice the styling difference)...",
        status: "waiting"
      },
      {
        id: "user-9",
        role: "user",
        content: "What interactive features can I test?"
      },
      {
        id: "assistant-interactive",
        role: "assistant",
        content: `# 🎮 Interactive Features to Test

Try these actions:

## 📤 Send Messages
Just type in the input below and press Enter or click Send!

## 🎬 Streaming Response
Type: **"stream"** to see a real-time streaming response with a stop button.

## 📁 File Upload
Type: **"upload"** then click the "Upload Test File" button to simulate file upload with progress.

## ❌ Validation
Type: **"error"** to see message validation in action (it will be rejected).

## 🔄 Message Updates  
Type: **"update"** to see progressive message updates.

## 🎯 Multiple Files
Type: **"multifile"** to receive a message with many different file types at once.

## 🔝 Infinite Scroll
Scroll up to load older messages (simulated pagination).

## 🎨 Layout Changes
Use the control buttons at the top to:
- Toggle alignment (start/end)
- Enable/disable additional content slot
- Enable/disable send button
- Add programmatic messages

Try them all! 🚀`,
        status: "complete"
      }
    ];

    chat.items = messages;
    chat.loadingState = "more-data-to-fetch";
    chat.newUserMessageAlignment = this.alignment;
    chat.newUserMessageScrollBehavior = "smooth";
    chat.autoScroll = "at-scroll-end";
    chat.virtualScrollerBufferSize = 5;
    chat.markdownTheme = "ch-markdown-viewer";
    chat.sendButtonDisabled = this.sendButtonDisabled;
    chat.sendInputDisabled = this.sendInputDisabled;
    chat.showAdditionalContent = this.showAdditionalContent;

    chat.sendContainerLayout = {
      sendContainerAfter: ["send-button"]
    };

    chat.callbacks = {
      sendChatMessages: async (messages) => {
        console.log("📤 Sending messages:", messages);
        
        const lastMessage = messages[messages.length - 1];
        const userContent = typeof lastMessage.content === "string" 
          ? lastMessage.content 
          : lastMessage.content.message || "";

        const lowerContent = userContent.toLowerCase().trim();

        if (lowerContent === "stream") {
          this.#simulateStreamingResponse(chat);
        } else if (lowerContent === "upload") {
          this.#showUploadDemo(chat);
        } else if (lowerContent === "update") {
          this.#demonstrateUpdates(chat);
        } else if (lowerContent === "multifile") {
          this.#respondWithMultipleFiles(chat);
        } else {
          this.#respondNormally(chat, userContent);
        }
      },

      validateSendChatMessage: (message, files) => {
        const content = typeof message.content === "string" 
          ? message.content 
          : message.content?.message || "";
        
        if (content.toLowerCase().trim() === "error") {
          console.error("❌ Validation failed: 'error' keyword detected");
          
          setTimeout(() => {
            chat.addNewMessage({
              id: `error-${Date.now()}`,
              role: "error",
              content: "❌ **Validation Error**: Messages containing the word 'error' are not allowed. This demonstrates the `validateSendChatMessage` callback."
            });
          }, 300);
          
          return false;
        }
        
        if (!content || content.trim() === "") {
          return false;
        }
        
        return true;
      },

      getChatMessageFiles: () => {
        const files = [...this.#selectedFiles];
        this.#selectedFiles = [];
        return files;
      },

      uploadFile: async (file) => {
        console.log("📁 Uploading file:", file.name);
        
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.2) {
              resolve({
                url: URL.createObjectURL(file),
                mimeType: file.type as any,
                caption: file.name,
                uploadState: "uploaded"
              });
            } else {
              reject(new Error("Upload failed (simulated)"));
            }
          }, 2000);
        });
      },

      stopResponse: () => {
        console.log("🛑 Stop response requested");
        this.#stopStreamingFlag = true;
        chat.waitingResponse = false;
        this.waitingResponse = false;
      }
    };
  }

  #simulateStreamingResponse(chat: HTMLChChatElement) {
    this.#stopStreamingFlag = false;
    chat.waitingResponse = true;
    this.waitingResponse = true;

    const fullText = `# 🎬 Streaming Response Demo

I'm simulating a **real-time streaming response** like you'd get from OpenAI, Anthropic, or other LLM APIs!

## How it works:
1. ⏳ \`waitingResponse\` is set to \`true\`
2. 🛑 The **stop button** appears automatically (try it!)
3. 🔄 \`updateLastMessage()\` is called repeatedly
4. ➕ Content is added with \`mode: "concat"\`
5. ✋ You can interrupt the stream anytime

## Use cases:
- Real-time AI chat responses
- Live transcription
- Gradual content loading
- Progressive updates

## Technical details:
\`\`\`typescript
// Streaming implementation
chat.waitingResponse = true;

chat.addNewMessage({
  id: 'stream-1',
  role: 'assistant',
  content: '',
  status: 'waiting'
});

// Then progressively update:
chat.updateLastMessage({
  role: 'assistant',
  content: 'new chunk ',
  status: 'waiting'
}, 'concat'); // 👈 concat mode!
\`\`\`

Notice how the text appears **word by word** and the chat **auto-scrolls** to keep the latest content visible! 

This is the **final chunk** of the streaming response. When this completes, the status will change to "complete" and the stop button will disappear. 🎉`;

    const assistantId = `assistant-streaming-${Date.now()}`;
    
    chat.addNewMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      status: "waiting"
    });

    const words = fullText.split(" ");
    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (this.#stopStreamingFlag || currentIndex >= words.length) {
        clearInterval(streamInterval);
        chat.waitingResponse = false;
        this.waitingResponse = false;
        
        const messages = chat.items;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.status = "complete";
          chat.requestUpdate();
        }
        
        if (this.#stopStreamingFlag) {
          chat.addNewMessage({
            id: `assistant-stopped-${Date.now()}`,
            role: "assistant",
            content: "⚠️ **Stream stopped by user.** This demonstrates the `stopResponse` callback working correctly!",
            status: "complete"
          });
        }
        return;
      }

      const chunk = words[currentIndex] + " ";
      currentIndex++;

      chat.updateLastMessage(
        {
          role: "assistant",
          content: chunk,
          status: currentIndex >= words.length ? "complete" : "waiting"
        },
        "concat"
      );
    }, 80);
  }

  #showUploadDemo(chat: HTMLChChatElement) {
    setTimeout(() => {
      chat.addNewMessage({
        id: `assistant-upload-${Date.now()}`,
        role: "assistant",
        content: `# 📤 File Upload Demo

Click the **"📎 Upload Test File"** button below to simulate uploading a file.

You'll see:
1. File in "in-progress" state
2. Loading indicator
3. File becomes "uploaded" after 2 seconds
4. Or fails (20% chance) to test error handling

The \`uploadFile\` callback is called and returns a Promise that resolves when upload completes!`,
        status: "complete"
      });
    }, 300);
  }

  #demonstrateUpdates(chat: HTMLChChatElement) {
    chat.addNewMessage({
      id: `assistant-update-${Date.now()}`,
      role: "assistant",
      content: "**Step 1/4**: Starting progressive update demo...",
      status: "waiting"
    });

    setTimeout(() => {
      chat.updateLastMessage(
        {
          role: "assistant",
          content: "\n\n**Step 2/4**: Adding more content using `updateLastMessage` with `concat` mode...",
          status: "waiting"
        },
        "concat"
      );
    }, 1000);

    setTimeout(() => {
      chat.updateLastMessage(
        {
          role: "assistant",
          content: "\n\n**Step 3/4**: Almost there! This is useful for:\n- Progressive loading\n- Partial results\n- Status updates",
          status: "waiting"
        },
        "concat"
      );
    }, 2000);

    setTimeout(() => {
      chat.updateLastMessage(
        {
          role: "assistant",
          content: "\n\n**Step 4/4**: ✅ **Complete!**\n\nYou can also use `updateChatMessage(index, message, mode)` to update any message by index, not just the last one!",
          status: "complete"
        },
        "concat"
      );
    }, 3000);
  }

  #respondWithMultipleFiles(chat: HTMLChChatElement) {
    setTimeout(() => {
      chat.addNewMessage({
        id: `assistant-multifile-${Date.now()}`,
        role: "assistant",
        content: {
          message: `# 🗂️ Multiple Files Example

Here's a message with **many different file types** all at once:`,
          files: [
            {
              url: "https://picsum.photos/seed/multi1/400/300",
              mimeType: "image/jpeg",
              caption: "photo1.jpg",
              alternativeText: "First image"
            },
            {
              url: "https://picsum.photos/seed/multi2/400/300",
              mimeType: "image/png",
              caption: "photo2.png",
              alternativeText: "Second image"
            },
            {
              url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              mimeType: "video/mp4",
              caption: "video.mp4",
              accessibleName: "Sample video file"
            },
            {
              url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
              mimeType: "audio/mpeg",
              caption: "audio.mp3",
              accessibleName: "Sample audio file"
            },
            {
              url: "https://example.com/report.pdf",
              mimeType: "application/pdf",
              caption: "report.pdf"
            },
            {
              url: "https://example.com/data.json",
              mimeType: "application/json",
              caption: "data.json"
            }
          ],
          sources: [
            {
              caption: "Media Gallery Source",
              url: "https://example.com/gallery"
            },
            {
              caption: "Documentation",
              url: "https://example.com/docs"
            }
          ]
        },
        status: "complete"
      });
    }, 500);
  }

  #respondNormally(chat: HTMLChChatElement, userContent: string) {
    const responses = [
      `You said: **"${userContent}"**

This is a normal response with markdown formatting! Try these commands:
- \`stream\` - See streaming demo
- \`upload\` - Test file upload
- \`update\` - See progressive updates  
- \`multifile\` - Receive multiple files
- \`error\` - Test validation`,

      `Got it! 🎯

Your message: *"${userContent}"*

Here's a **list**:
1. First item with *emphasis*
2. Second item with **bold**
3. Third item with \`code\`

And a quote:
> "${userContent}" - You, just now`,

      `Message received: "${userContent}"

\`\`\`javascript
// Here's how to send this programmatically:
chat.sendChatMessage({
  id: 'msg-' + Date.now(),
  role: 'user',
  content: "${userContent}"
});
\`\`\`

Try the interactive commands! 🚀`,

      `# Response to: "${userContent}"

## Analysis
Your message contains ${userContent.length} characters and ${userContent.split(' ').length} words.

## Suggestions
- Try **"stream"** for streaming demo
- Try **"upload"** for file upload
- Try **"multifile"** for multiple files

## Markdown Features
- **Bold text**
- *Italic text*
- \`Inline code\`
- [Links](https://example.com)
- Lists and more!`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      chat.addNewMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: randomResponse,
        status: "complete"
      });
    }, 500);
  }

  #handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.#selectedFiles = Array.from(input.files);
      
      const chat = this.#chatRef.value;
      if (chat) {
        const fileNames = this.#selectedFiles.map(f => f.name).join(", ");
        chat.setChatInputMessage(`Uploading: ${fileNames}`);
        
        setTimeout(() => {
          chat.sendChatMessage();
        }, 100);
      }
      
      input.value = "";
    }
  };

  #handleClearChat = () => {
    const chat = this.#chatRef.value;
    if (!chat) return;

    if (confirm("Clear all messages and reset demo?")) {
      chat.items = [];
      chat.loadingState = "all-records-loaded";
      this.#currentPage = 0;
      this.#hasMoreData = true;
      
      setTimeout(() => {
        this.firstUpdated();
      }, 100);
    }
  };

  #handleAddProgrammaticMessage = () => {
    const chat = this.#chatRef.value;
    if (!chat) return;

    chat.addNewMessage({
      id: `programmatic-${Date.now()}`,
      role: "assistant",
      content: `🤖 **Programmatic Message**

This was added using \`chat.addNewMessage()\` method at ${new Date().toLocaleTimeString()}.

You can also use:
- \`chat.updateLastMessage()\` to update last message
- \`chat.updateChatMessage(index)\` to update any message  
- \`chat.sendChatMessage()\` to send programmatically
- \`chat.setChatInputMessage()\` to set input text
- \`chat.focusChatInput()\` to focus the input`,
      status: "complete"
    });
  };

  #handleToggleAlignment = () => {
    const chat = this.#chatRef.value;
    if (!chat) return;

    this.alignment = this.alignment === "end" ? "start" : "end";
    chat.newUserMessageAlignment = this.alignment;
    console.log("📍 Changed alignment to:", this.alignment);
  };

  #handleToggleAdditionalContent = () => {
    const chat = this.#chatRef.value;
    if (!chat) return;

    this.showAdditionalContent = !this.showAdditionalContent;
    chat.showAdditionalContent = this.showAdditionalContent;
    console.log("➕ Additional content:", this.showAdditionalContent);
  };

  #handleToggleSendButton = () => {
    const chat = this.#chatRef.value;
    if (!chat) return;

    this.sendButtonDisabled = !this.sendButtonDisabled;
    chat.sendButtonDisabled = this.sendButtonDisabled;
    console.log("🔘 Send button disabled:", this.sendButtonDisabled);
  };

  #handleToggleInput = () => {
    const chat = this.#chatRef.value;
    if (!chat) return;

    this.sendInputDisabled = !this.sendInputDisabled;
    chat.sendInputDisabled = this.sendInputDisabled;
    console.log("⌨️ Input disabled:", this.sendInputDisabled);
  };

  override render() {
    return html`
      <div style="display: flex; flex-direction: column; height: 100vh; width: 100%; box-sizing: border-box;">
        <div style="padding: 20px; border-bottom: 2px solid #e0e0e0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h1 style="margin: 0 0 10px 0; font-size: 28px;">🚀 Complete ch-chat Showcase</h1>
          <p style="margin: 0 0 15px 0; opacity: 0.9;">
            Demonstrating ALL features: streaming, files, validation, infinite scroll, and more!
          </p>
          
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button 
              @click=${this.#handleAddProgrammaticMessage}
              style="padding: 8px 16px; cursor: pointer; border: 2px solid white; background: rgba(255,255,255,0.2); color: white; border-radius: 4px; font-weight: 600; backdrop-filter: blur(10px);"
              title="Add a message programmatically using addNewMessage()"
            >
              ➕ Add Message
            </button>
            
            <button 
              @click=${this.#handleToggleAlignment}
              style="padding: 8px 16px; cursor: pointer; border: 2px solid white; background: rgba(255,255,255,0.2); color: white; border-radius: 4px; font-weight: 600;"
              title="Toggle newUserMessageAlignment between 'start' and 'end'"
            >
              ↔️ Align: ${this.alignment}
            </button>
            
            <button 
              @click=${this.#handleToggleAdditionalContent}
              style="padding: 8px 16px; cursor: pointer; border: 2px solid white; background: rgba(255,255,255,0.2); color: white; border-radius: 4px; font-weight: 600;"
              title="Toggle showAdditionalContent slot"
            >
              ${this.showAdditionalContent ? "✅" : "⬜"} Additional Slot
            </button>

            <button 
              @click=${this.#handleToggleSendButton}
              style="padding: 8px 16px; cursor: pointer; border: 2px solid white; background: rgba(255,255,255,0.2); color: white; border-radius: 4px; font-weight: 600;"
              title="Toggle sendButtonDisabled"
            >
              ${this.sendButtonDisabled ? "🔒" : "🔓"} Send Button
            </button>

            <button 
              @click=${this.#handleToggleInput}
              style="padding: 8px 16px; cursor: pointer; border: 2px solid white; background: rgba(255,255,255,0.2); color: white; border-radius: 4px; font-weight: 600;"
              title="Toggle sendInputDisabled"
            >
              ${this.sendInputDisabled ? "🔒" : "🔓"} Input
            </button>
            
            <label style="padding: 8px 16px; cursor: pointer; border: 2px solid white; background: rgba(255,255,255,0.2); color: white; border-radius: 4px; font-weight: 600;">
              📎 Upload Test File
              <input 
                type="file" 
                multiple
                @change=${this.#handleFileSelect}
                style="display: none;"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />
            </label>
            
            <button 
              @click=${this.#handleClearChat}
              style="padding: 8px 16px; cursor: pointer; border: 2px solid #ff6b6b; background: rgba(255,107,107,0.2); color: white; border-radius: 4px; font-weight: 600;"
              title="Clear all messages and reset"
            >
              🗑️ Clear & Reset
            </button>
          </div>

          ${this.waitingResponse ? html`
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,193,7,0.3); border-radius: 4px; border: 2px solid rgba(255,193,7,0.6);">
              ⚡ <strong>Streaming in progress...</strong> The stop button should be visible below!
            </div>
          ` : nothing}
        </div>

        <ch-chat
          ${ref(this.#chatRef)}
          style="flex: 1; min-height: 0; margin: 0; background: #f5f5f5;"
        >
          <div slot="empty-chat" style="padding: 60px 20px; text-align: center; color: #999;">
            <h2 style="font-size: 48px; margin: 0 0 20px 0;">💬</h2>
            <h3 style="margin: 0 0 10px 0;">No messages yet</h3>
            <p style="margin: 0;">Send a message to start the conversation!</p>
          </div>

          <div slot="loading-chat" style="padding: 60px 20px; text-align: center;">
            <h2 style="font-size: 48px; margin: 0 0 20px 0;">⏳</h2>
            <h3 style="margin: 0 0 10px 0;">Loading chat...</h3>
            <p style="margin: 0; color: #666;">Please wait while messages are being loaded...</p>
          </div>

          ${this.showAdditionalContent ? html`
            <div slot="additional-content" style="padding: 15px; background: #fff3cd; border-top: 2px solid #ffc107; border-bottom: 2px solid #ffc107;">
              <strong>📌 Additional Content Slot</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px;">
                This is the "additional-content" slot - perfect for announcements, warnings, or contextual information!
              </p>
            </div>
          ` : nothing}
        </ch-chat>

        <div style="padding: 10px 20px; background: #f8f9fa; border-top: 1px solid #dee2e6; font-size: 12px; color: #666;">
          <strong>💡 Tips:</strong>
          Type "stream" for streaming • "upload" for files • "multifile" for multiple files • "update" for progressive updates • "error" for validation • Scroll up to load older messages
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-chat2": ShowcaseChat2;
  }
}

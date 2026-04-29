import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./chain-of-thought-showcase.scss?inline";
import type {
  ChatCallbacks,
  ChatMessage,
  ChatTranslations
} from "../../../src/components/chat/types.js";
import type { ChainOfThoughtModel } from "../../../src/components/chain-of-thought/types.js";
import "../../../src/components/chat/chat.lit.js";
import "../../../src/components/chain-of-thought/chain-of-thought.lit.js";

@Component({
  styles,
  tag: "showcase-chain-of-thought-styling"
})
export class ShowcaseChainOfThoughtStyling extends KasstorElement {
  @state() private chatItems: ChatMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Can you find information about Hayden Bleasel?"
    },
    {
      id: "2",
      role: "assistant",
      content: {
        message: "I'll search for Hayden Bleasel's profile information for you.",
        chainOfThought: {
          headerIcon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/%3E%3Cpath d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/%3E%3Cpath d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/%3E%3Cpath d="M17.599 6.5a3 3 0 0 0 .399-1.375"/%3E%3Cpath d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/%3E%3Cpath d="M3.477 10.896a4 4 0 0 1 .585-.396"/%3E%3Cpath d="M19.938 10.5a4 4 0 0 1 .585.396"/%3E%3Cpath d="M6 18a4 4 0 0 1-1.967-.516"/%3E%3Cpath d="M19.967 17.484A4 4 0 0 1 18 18"/%3E%3C/svg%3E',
          steps: [
            {
              id: "step-1",
              label: "Searching for profiles for Hayden Bleasel",
              status: "complete",
              icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
              searchResults: [
                {
                  id: "r1",
                  url: "https://www.x.com",
                  label: "www.x.com"
                },
                {
                  id: "r2",
                  url: "https://www.instagram.com",
                  label: "www.instagram.com"
                },
                {
                  id: "r3",
                  url: "https://www.github.com",
                  label: "www.github.com"
                },
                {
                  id: "r4",
                  url: "https://www.github.com",
                  label: "www.github.com"
                },
                {
                  id: "r5",
                  url: "https://www.dribbble.com",
                  label: "www.dribbble.com"
                }
              ]
            },
            {
              id: "step-2",
              label: "Found the profile photo for Hayden Bleasel",
              status: "complete",
              icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
              images: [
                {
                  id: "img-1",
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23f3f4f6' rx='4'/%3E%3Ccircle cx='64' cy='50' r='24' fill='%239ca3af'/%3E%3Ccircle cx='56' cy='44' r='4' fill='%23ffffff'/%3E%3Ccircle cx='72' cy='44' r='4' fill='%23ffffff'/%3E%3Cpath d='M 50 62 Q 64 72 78 62' stroke='%23ffffff' stroke-width='2' fill='none'/%3E%3Ccircle cx='64' cy='100' r='30' fill='%239ca3af'/%3E%3C/svg%3E",
                  alt: "Hayden Bleasel's profile photo",
                  caption: "Hayden Bleasel's profile photo from x.com, showing a Ghibli-style man."
                }
              ]
            },
            {
              id: "step-3",
              label: "Hayden Bleasel is an Australian product designer, software engineer, and founder. He is currently based in the United States working for Vercel, an American cloud application company.",
              status: "complete",
              icon: html`<span style="display: inline-block; width: 16px; height: 16px; text-align: center; line-height: 16px; font-size: 16px; font-weight: bold; color: #6b7280;">•</span>`
            },
            {
              id: "step-4",
              label: "Searching for recent work…",
              status: "active",
              icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
              searchResults: [
                {
                  id: "result-1",
                  url: "https://github.com/haydenbleasel",
                  label: "github.com/haydenbleasel"
                },
                {
                  id: "result-2",
                  url: "https://vercel.com/blog",
                  label: "vercel.com/blog"
                },
                {
                  id: "result-3",
                  url: "https://dribbble.com/haydenbleasel",
                  label: "dribbble.com/haydenbleasel"
                }
              ]
            }
          ],
          defaultOpen: true
        } as ChainOfThoughtModel
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

      // Simulate assistant response with chain of thought
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: {
              message: "Let me process your request:",
              chainOfThought: {
                steps: [
                  {
                    id: "s1",
                    label: "Understanding your request...",
                    status: "complete"
                  },
                  {
                    id: "s2",
                    label: "Gathering relevant information...",
                    status: "active"
                  }
                ],
                searchResults: [
                  {
                    id: "demo-r1",
                    url: "https://example.com",
                    label: "www.example.com"
                  }
                ],
                defaultOpen: true
              } as ChainOfThoughtModel
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
      <div class="chain-of-thought-showcase-container">
        <div class="showcase-header">
          <h1>Chat with Chain of Thought Component</h1>
          <p>
            Demonstrating the ch-chain-of-thought component within chat
            interfaces, showing how AI agents visualize their reasoning process
            with structured steps, search results, and supporting images.
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
            class="styled-chain-of-thought-chat"
          ></ch-chat>
        </div>

        <div class="showcase-footer">
          <h2>Styling Features</h2>
          <ul>
            <li>Clean, minimal design with no borders on main container</li>
            <li>Collapsible header with brain icon and chevron indicator</li>
            <li>Step-by-step reasoning with icon indicators (magnifying glass, image icon)</li>
            <li>Search results displayed as rounded pill tags with light gray background</li>
            <li>Image container with light gray background and centered photo</li>
            <li>Image captions in smaller, muted gray text</li>
            <li>Descriptive bullet lists with custom bullet styling</li>
            <li>All styling achieved using CSS Shadow Parts</li>
          </ul>

          <h2>CSS Shadow Parts Used</h2>
          <ul>
            <li>
              <code>::part(container)</code> - Styles the main chain-of-thought
              container
            </li>
            <li>
              <code>::part(header)</code> - Styles the header with brain icon
              and title
            </li>
            <li>
              <code>::part(header-icon)</code> - Styles the brain icon
            </li>
            <li>
              <code>::part(header-title)</code> - Styles the "Chain of Thought"
              title text
            </li>
            <li>
              <code>::part(header-chevron)</code> - Styles the expand/collapse chevron
            </li>
            <li>
              <code>::part(content)</code> - Styles the expandable content area
            </li>
            <li>
              <code>::part(step)</code> - Styles each reasoning step line
            </li>
            <li>
              <code>::part(step-icon)</code> - Styles the icon for each step
            </li>
            <li>
              <code>::part(step-label)</code> - Styles the step label text
            </li>
            <li>
              <code>::part(search-results)</code> - Styles the search results
              container
            </li>
            <li>
              <code>::part(search-result-tag)</code> - Styles individual result
              pill tags
            </li>
            <li>
              <code>::part(images-section)</code> - Styles the images container
            </li>
            <li>
              <code>::part(image-container)</code> - Styles the light gray image wrapper
            </li>
            <li>
              <code>::part(image)</code> - Styles the actual image element
            </li>
            <li>
              <code>::part(image-caption)</code> - Styles the image caption text
            </li>
            <li>
              <code>::part(bullet-list)</code> - Styles descriptive bullet lists
            </li>
          </ul>

          <h2>Step States</h2>
          <ul>
            <li>
              <code>complete</code> - Step has been completed (shows search or image icon)
            </li>
            <li>
              <code>active</code> - Step is currently being processed (shows search icon)
            </li>
            <li>
              <code>pending</code> - Step is waiting to be executed (muted appearance)
            </li>
          </ul>

          <h2>Use Cases</h2>
          <ul>
            <li>AI agent reasoning visualization in conversational interfaces</li>
            <li>Multi-step research and information gathering processes</li>
            <li>Profile and entity lookup with supporting evidence</li>
            <li>Educational tools showing problem-solving approaches</li>
            <li>Search result aggregation and presentation</li>
            <li>Data enrichment workflows with image and metadata display</li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-chain-of-thought-styling": ShowcaseChainOfThoughtStyling;
  }
}

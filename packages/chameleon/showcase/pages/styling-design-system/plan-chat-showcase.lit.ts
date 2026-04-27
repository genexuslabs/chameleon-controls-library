import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import styles from "./plan-chat-showcase.scss?inline";
import type {
  ChatCallbacks,
  ChatMessage,
  ChatTranslations
} from "../../../src/components/chat/types.js";
import type { PlanModel } from "../../../src/components/plan/types.js";
import "../../../src/components/chat/chat.lit.js";
import "../../../src/components/plan/plan.lit.js";

@Component({
  styles,
  tag: "showcase-plan-chat-styling"
})
export class ShowcasePlanChatStyling extends KasstorElement {
  @state() private chatItems: ChatMessage[] = [
    {
      id: "1",
      role: "user",
      content: "I need to build a new authentication system for our web app. Can you help me plan this?"
    },
    {
      id: "2",
      role: "assistant",
      content: {
        message: "I'll help you create a comprehensive plan for building an authentication system. Here's what I suggest:",
        plan: {
          title: "Authentication System Implementation",
          description: "A step-by-step plan to build a secure authentication system with modern best practices",
          defaultOpen: true,
          isStreaming: false,
          steps: [
            {
              id: "step-1",
              title: "Set up authentication infrastructure",
              description: "Configure the core authentication system and security framework",
              status: "completed",
              subtasks: [
                "Install and configure authentication library (e.g., Passport.js, NextAuth)",
                "Set up secure session management",
                "Configure environment variables for secrets"
              ]
            },
            {
              id: "step-2",
              title: "Implement user registration",
              description: "Create user registration flow with validation",
              status: "in-progress",
              subtasks: [
                "Design user registration form with email and password",
                "Add client-side validation",
                "Implement password hashing (bcrypt or argon2)",
                "Create user database schema",
                "Send verification email"
              ]
            },
            {
              id: "step-3",
              title: "Build login functionality",
              description: "Create secure login mechanism with rate limiting",
              status: "pending",
              subtasks: [
                "Design login UI",
                "Implement login endpoint",
                "Add rate limiting to prevent brute force",
                "Set up JWT or session tokens",
                "Implement remember me functionality"
              ]
            },
            {
              id: "step-4",
              title: "Add password reset flow",
              description: "Enable users to securely reset forgotten passwords",
              status: "pending",
              subtasks: [
                "Create forgot password form",
                "Generate secure reset tokens",
                "Send password reset emails",
                "Implement reset password page",
                "Add token expiration logic"
              ]
            },
            {
              id: "step-5",
              title: "Implement multi-factor authentication (MFA)",
              description: "Add an extra layer of security with 2FA/MFA",
              status: "pending",
              subtasks: [
                "Choose MFA method (TOTP, SMS, or email)",
                "Integrate authenticator app support",
                "Create MFA setup flow",
                "Add backup codes generation",
                "Implement MFA verification during login"
              ]
            },
            {
              id: "step-6",
              title: "Security hardening and testing",
              description: "Ensure the system is secure and meets best practices",
              status: "pending",
              subtasks: [
                "Implement CSRF protection",
                "Add input sanitization",
                "Set up security headers (CSP, HSTS)",
                "Perform security audit",
                "Write integration tests for auth flows"
              ]
            }
          ],
          actions: [
            {
              id: "approve",
              label: "Approve Plan",
              primary: true
            },
            {
              id: "modify",
              label: "Request Changes"
            }
          ]
        } as PlanModel
      }
    },
    {
      id: "3",
      role: "user",
      content: "That looks great! Can you also plan how to add social login?"
    },
    {
      id: "4",
      role: "assistant",
      content: {
        message: "Absolutely! Here's a plan for integrating social authentication providers:",
        plan: {
          title: "Social Login Integration",
          description: "Add OAuth authentication for popular social platforms",
          defaultOpen: true,
          isStreaming: false,
          steps: [
            {
              id: "social-1",
              title: "Set up OAuth configuration",
              description: "Register apps with OAuth providers and configure credentials",
              status: "pending",
              subtasks: [
                "Create Google OAuth app in Google Cloud Console",
                "Register GitHub OAuth application",
                "Set up Facebook App for authentication",
                "Configure OAuth redirect URLs",
                "Store client IDs and secrets securely"
              ]
            },
            {
              id: "social-2",
              title: "Implement OAuth flow",
              description: "Build the OAuth authentication flow for each provider",
              status: "pending",
              subtasks: [
                "Add OAuth strategy to authentication library",
                "Create OAuth callback endpoints",
                "Handle OAuth state parameter for security",
                "Map OAuth profile data to user schema"
              ]
            },
            {
              id: "social-3",
              title: "Link social accounts to existing users",
              description: "Allow users to connect multiple login methods",
              status: "pending",
              subtasks: [
                "Create account linking UI in user settings",
                "Implement account connection logic",
                "Handle edge cases (email already exists)",
                "Add ability to unlink social accounts"
              ]
            }
          ],
          actions: [
            {
              id: "start",
              label: "Start Implementation",
              primary: true
            }
          ]
        } as PlanModel
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
      sendInput: "Describe what you want to build..."
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

      // Simulate assistant response with a plan after a delay
      setTimeout(() => {
        this.chatItems = [
          ...this.chatItems,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: {
              message: "Here's a plan to help you with that:",
              plan: {
                title: "Custom Implementation Plan",
                description: "Tailored plan based on your requirements",
                defaultOpen: true,
                isStreaming: false,
                steps: [
                  {
                    id: "custom-1",
                    title: "Research and planning",
                    description: "Gather requirements and design the solution",
                    status: "pending",
                    subtasks: [
                      "Define project requirements",
                      "Research best practices and tools",
                      "Create technical specification"
                    ]
                  },
                  {
                    id: "custom-2",
                    title: "Implementation",
                    description: "Build the solution following the specification",
                    status: "pending",
                    subtasks: [
                      "Set up development environment",
                      "Implement core functionality",
                      "Add error handling"
                    ]
                  },
                  {
                    id: "custom-3",
                    title: "Testing and deployment",
                    description: "Ensure quality and deploy to production",
                    status: "pending",
                    subtasks: [
                      "Write unit and integration tests",
                      "Perform quality assurance",
                      "Deploy to production environment"
                    ]
                  }
                ],
                actions: [
                  {
                    id: "approve",
                    label: "Approve",
                    primary: true
                  },
                  {
                    id: "edit",
                    label: "Edit Plan"
                  }
                ]
              } as PlanModel
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
      <div class="plan-showcase-container">
        <div class="showcase-header">
          <h1>Chat with Plan Component</h1>
          <p>
            Demonstrating the ch-plan component within chat interfaces, styled
            to match modern AI planning experiences
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
            class="styled-plan-chat"
          ></ch-chat>
        </div>

        <div class="showcase-footer">
          <h2>Styling Features</h2>
          <ul>
            <li>Plan component with clean, card-based design</li>
            <li>Collapsible accordion interface for plan steps</li>
            <li>Status indicators for each step (pending, in-progress, completed, failed)</li>
            <li>Action buttons in the plan footer</li>
            <li>Smooth animations and transitions</li>
            <li>All styling achieved using CSS Shadow Parts</li>
          </ul>

          <h2>CSS Shadow Parts Used</h2>
          <ul>
            <li>
              <code>::part(plan)</code> - Styles the root plan container
            </li>
            <li>
              <code>::part(header)</code> - Styles the plan header with title
            </li>
            <li>
              <code>::part(title)</code> - Styles the plan title
            </li>
            <li>
              <code>::part(description)</code> - Styles the plan description
            </li>
            <li>
              <code>::part(content)</code> - Styles the main content area
            </li>
            <li>
              <code>::part(step)</code> - Styles individual step containers
            </li>
            <li>
              <code>::part(step-title)</code> - Styles step titles
            </li>
            <li>
              <code>::part(substep)</code> - Styles subtask items
            </li>
            <li>
              <code>::part(footer)</code> - Styles the plan footer
            </li>
            <li>
              <code>::part(action)</code> - Styles action buttons
            </li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-plan-chat-styling": ShowcasePlanChatStyling;
  }
}

import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-chat", {
  autoScroll: "at-scroll-end",
  callbacks: undefined,
  disabled: false,
  generatingResponse: false,
  items: [],
  loadingState: "initial",
  markdownTheme: "ch-markdown-viewer",
  newUserMessageAlignment: "end",
  newUserMessageScrollBehavior: "instant",
  showAdditionalContent: false,
  theme: undefined,
  translations: {
    accessibleName: {
      clearChat: "Clear chat",
      copyMessageContent: "Copy message content",
      downloadCodeButton: "Download code",
      sendButton: "Send",
      sendInput: "Message",
      stopGeneratingAnswerButton: "Stop generating answer"
    },
    placeholder: {
      sendInput: "Ask me a question..."
    },
    text: {
      copyCodeButton: "Copy code",
      copyMessageContent: "Copy",
      processing: `Processing...`,
      sourceFiles: "Source files:",
      stopGeneratingAnswerButton: "Stop generating answer"
    }
  }
});

describe("[ch-chat][basic]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-chat></ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
  });

  it("should have Shadow DOM", () => expect(chatRef.shadowRoot).toBeTruthy());
});

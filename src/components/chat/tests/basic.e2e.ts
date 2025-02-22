import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-chat", {
  callbacks: undefined,
  disabled: false,
  generatingResponse: false,
  hyperlinkToDownloadFile: undefined,
  imageUpload: false,
  isMobile: false,
  items: [],
  loadingState: "initial",
  markdownTheme: "ch-markdown-viewer",
  renderCode: undefined,
  showAdditionalContent: false,
  theme: undefined,
  translations: {
    accessibleName: {
      clearChat: "Clear chat",
      copyResponseButton: "Copy assistant response",
      downloadCodeButton: "Download code",
      imagePicker: "Select images",
      removeUploadedImage: "Remove uploaded image",
      sendButton: "Send",
      sendInput: "Message",
      stopGeneratingAnswerButton: "Stop generating answer"
    },
    placeholder: {
      sendInput: "Ask me a question..."
    },
    text: {
      copyCodeButton: "Copy code",
      processing: `Processing...`,
      sourceFiles: "Source files:"
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

import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

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

  const testDefault = (
    propertyName: string,
    propertyValue: any,
    propertyValueDescription: string
  ) =>
    it(`the "${propertyName}" property should be ${
      typeof propertyValue === "string"
        ? `"${propertyValueDescription}"`
        : propertyValueDescription
    } by default`, async () => {
      expect(await chatRef.getProperty(propertyName)).toEqual(propertyValue);
    });

  it("should have Shadow DOM", async () => {
    expect(chatRef.shadowRoot).toBeTruthy();
  });

  testDefault("callbacks", undefined, "undefined");
  testDefault("disabled", false, "false");
  testDefault("generatingResponse", false, "false");
  testDefault("imageUpload", false, "false");
  testDefault("isMobile", false, "false");
  testDefault("items", [], "[]");
  testDefault("loadingState", "initial", "initial");
  testDefault("markdownTheme", "ch-markdown-viewer", "ch-markdown-viewer");
  testDefault("showAdditionalContent", false, "false");
  testDefault(
    "translations",
    {
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
    },
    "(object with translations)"
  );
  testDefault("renderCode", undefined, "undefined");
  testDefault("renderItem", undefined, "undefined");
});

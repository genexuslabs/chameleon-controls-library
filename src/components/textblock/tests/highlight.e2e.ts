import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const HIGHLIGHTED_PART = (content: string) =>
  `<span part="highlighted">${content}</span>`;

const performTest = (autoGrow: boolean) =>
  describe(`[ch-textblock][highlight][${
    autoGrow ? "with autoGrow" : "without autoGrow"
  }]`, () => {
    let page: E2EPage;
    let textBlockRef: E2EElement;

    const TEXT_CONTENT_WITH_HIGHLIGHT = (content: string) =>
      autoGrow
        ? `<p>${content}</p>`
        : `<div class="line-measure">A</div><p class="content">${content}</p>`;

    const TEXT_CONTENT_WITHOUT_HIGHLIGHT = (content: string) =>
      autoGrow
        ? content
        : `<div class="line-measure">A</div><p class="content">${content}</p>`;

    const HTML_CONTENT = autoGrow
      ? "<slot></slot>"
      : '<div class="line-measure">A</div><div class="html-content"><slot></slot></div>';

    beforeEach(async () => {
      page = await newE2EPage({
        html: autoGrow
          ? `<ch-textblock auto-grow></ch-textblock>`
          : `<ch-textblock></ch-textblock>`,
        failOnConsoleError: true
      });
      textBlockRef = await page.find("ch-textblock");
    });

    const getTextBlockRenderedContent = async () =>
      (await page.find("ch-textblock")).shadowRoot.innerHTML;

    const testHighlight = (
      caption: string,
      highlightPattern: string,
      result: string
    ) =>
      it(`should properly highlight "${caption}" with the pattern "${highlightPattern}"`, async () => {
        textBlockRef.setProperty("caption", caption);
        textBlockRef.setProperty("highlightPattern", highlightPattern);
        await page.waitForChanges();

        expect(await getTextBlockRenderedContent()).toBe(
          TEXT_CONTENT_WITH_HIGHLIGHT(result)
        );
      });

    it.todo("should re-use the DOM instead of recreating it on every change");

    it(`should not highlight if the pattern is "" (empty string)`, async () => {
      textBlockRef.setProperty("caption", "something");
      textBlockRef.setProperty("highlightPattern", "");
      await page.waitForChanges();

      expect(await getTextBlockRenderedContent()).toBe(
        TEXT_CONTENT_WITHOUT_HIGHLIGHT("something")
      );
    });

    it(`should not highlight if the pattern is undefined`, async () => {
      textBlockRef.setProperty("caption", "something");
      textBlockRef.setProperty("highlightPattern", undefined);
      await page.waitForChanges();

      expect(await getTextBlockRenderedContent()).toBe(
        TEXT_CONTENT_WITHOUT_HIGHLIGHT("something")
      );
    });

    it(`should not highlight if the pattern is null`, async () => {
      textBlockRef.setProperty("caption", "something");
      textBlockRef.setProperty("highlightPattern", null);
      await page.waitForChanges();

      expect(await getTextBlockRenderedContent()).toBe(
        TEXT_CONTENT_WITHOUT_HIGHLIGHT("something")
      );
    });

    it(`should not highlight if format = "HTML"`, async () => {
      textBlockRef.setProperty("caption", "something");
      textBlockRef.setProperty("highlightPattern", "th");
      textBlockRef.setProperty("format", "HTML");
      await page.waitForChanges();

      expect(await getTextBlockRenderedContent()).toBe(HTML_CONTENT);
    });

    testHighlight(
      "hello world",
      "llo",
      "he" + HIGHLIGHTED_PART("llo") + " world"
    );

    testHighlight("hello world", "llo.", "hello world");
    testHighlight(
      "hello world",
      "hello ",
      HIGHLIGHTED_PART("hello ") + "world"
    );

    // TODO: Analyze with this fails
    // testHighlight("hello world", " ", "hello" + HIGHLIGHTED_PART(" ") + "world");

    testHighlight("hello world", "world", "hello " + HIGHLIGHTED_PART("world"));
    testHighlight("hello world", "ld", "hello wor" + HIGHLIGHTED_PART("ld"));
    testHighlight(
      "hello world",
      "l",
      "he" +
        HIGHLIGHTED_PART("l") +
        HIGHLIGHTED_PART("l") +
        "o wor" +
        HIGHLIGHTED_PART("l") +
        "d"
    );

    testHighlight(
      `Lorem ipsum dolor sit amet consectetur adipisicing elit.
Lorem ipsum dolor sit amet consectetur adipisicing elit.`,
      "sit",
      "Lorem ipsum dolor " +
        HIGHLIGHTED_PART("sit") +
        " amet consectetur adipisicing elit." +
        "\nLorem ipsum dolor " +
        HIGHLIGHTED_PART("sit") +
        " amet consectetur adipisicing elit."
    );
  });

performTest(false);
performTest(true);

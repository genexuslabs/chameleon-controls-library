import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-edit][default]", () => {
  let page: E2EPage;
  let editRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: `<ch-edit></ch-edit>`
    });
    editRef = await page.find("ch-edit");
  });

  it("should have a shadowRoot", () => {
    expect(editRef.shadowRoot).not.toBeNull();
  });

  it("should render an input element by default", async () => {
    const inputRef = await page.find("ch-edit >>> input");
    const textareaRef = await page.find("ch-edit >>> textarea");

    expect(inputRef).toBeTruthy();
    expect(textareaRef).toBeNull();
  });

  it("should have multiline = false by default", async () => {
    expect(await editRef.getProperty("multiline")).toBe(false);
  });

  it("should have readonly = false by default", async () => {
    expect(await editRef.getProperty("readonly")).toBe(false);
  });

  it("should have spellcheck = false by default", async () => {
    expect(await editRef.getProperty("spellcheck")).toBe(false);
  });

  it("should render an input element when multiline = false", async () => {
    await page.setContent(`<ch-edit multiline="false"></ch-edit>`);
    await page.waitForChanges();
    const inputRef = await page.find("ch-edit >>> input");
    const textareaRef = await page.find("ch-edit >>> textarea");

    expect(inputRef).toBeTruthy();
    expect(textareaRef).toBeNull();
  });

  it("should render a textarea element when multiline = true", async () => {
    await page.setContent(`<ch-edit multiline="true"></ch-edit>`);
    await page.waitForChanges();
    const inputRef = await page.find("ch-edit >>> input");
    const textareaRef = await page.find("ch-edit >>> textarea");

    expect(inputRef).toBeNull();
    expect(textareaRef).toBeTruthy();
  });

  it("should switch between the input and textarea when updating the multiline property at runtime", async () => {
    let inputRef = await page.find("ch-edit >>> input");
    let textareaRef = await page.find("ch-edit >>> textarea");
    expect(inputRef).toBeTruthy();
    expect(textareaRef).toBeNull();

    await editRef.setProperty("multiline", true);
    await page.waitForChanges();
    inputRef = await page.find("ch-edit >>> input");
    textareaRef = await page.find("ch-edit >>> textarea");

    expect(inputRef).toBeNull();
    expect(textareaRef).toBeTruthy();

    await editRef.setProperty("multiline", false);
    await page.waitForChanges();
    inputRef = await page.find("ch-edit >>> input");
    textareaRef = await page.find("ch-edit >>> textarea");

    expect(inputRef).toBeTruthy();
    expect(textareaRef).toBeNull();
  });

  it("should not expose a part attribute the inner input element (multiline = false)", async () => {
    const inputRef = await page.find("ch-edit >>> input");
    expect(inputRef).toEqualAttribute("part", null);
  });

  it("should not expose a part attribute the inner textarea element (multiline = true)", async () => {
    await page.setContent(`<ch-edit multiline></ch-edit>`);
    await page.waitForChanges();

    const textareaRef = await page.find("ch-edit >>> textarea");
    expect(textareaRef).toEqualAttribute("part", null);
  });

  it("should stretch the input to the container size", async () => {
    await page.setContent(`
      <div style="inline-size: 300px">
        <ch-edit></ch-edit>
      <div>`);
    await page.waitForChanges();
    editRef = await page.find("ch-edit");
    const inputRef = await page.find("ch-edit >>> input");

    const editComputedStyle = await editRef.getComputedStyle();
    const inputComputedStyle = await inputRef.getComputedStyle();

    expect(inputComputedStyle.width).toBe(editComputedStyle.width);
  });

  it("should stretch the textarea to the container size", async () => {
    await page.setContent(`
      <div style="inline-size: 300px">
        <ch-edit multiline></ch-edit>
      <div>`);
    await page.waitForChanges();
    editRef = await page.find("ch-edit");
    const textareaRef = await page.find("ch-edit >>> textarea");

    const editComputedStyle = await editRef.getComputedStyle();
    const textareaComputedStyle = await textareaRef.getComputedStyle();

    expect(textareaComputedStyle.width).toBe(editComputedStyle.width);
  });

  it("[StencilJS issue] should not throw error when typing in the textarea after updating the multiline at runtime", async () => {
    await editRef.setProperty("multiline", true);
    await page.waitForChanges();
    const textareaRef = await page.find("ch-edit >>> textarea");
    await textareaRef.press("h");
    await textareaRef.press("e");
    await textareaRef.press("l");
    await textareaRef.press("l");
    await textareaRef.press("o");

    await editRef.setProperty("multiline", false);
    await page.waitForChanges();
    const inputRef = await page.find("ch-edit >>> input");
    await inputRef.press(" ");
    await inputRef.press("w");
    await inputRef.press("o");
    await inputRef.press("r");
    await inputRef.press("l");
    await inputRef.press("d");
  });

  it("should have the right size the startImgSrc ", async () => {
    await page.setContent(
      `<ch-edit start-img-src="var(something)" style="--ch-edit__image-size: 16px"></ch-edit>`
    );
    await page.waitForChanges();
    const imageComputedStyle = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector("ch-edit"), "::before")
          .inlineSize
    );
    await page.waitForChanges();

    expect(imageComputedStyle).toBe("16px");
  });
});

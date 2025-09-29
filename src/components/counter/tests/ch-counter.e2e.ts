import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-counter", {
  initialValue: ""
});

describe("[ch-counter][basic]", () => {
  let page: E2EPage;
  let counterRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-counter></ch-counter>`,
      failOnConsoleError: true
    });

    counterRef = await page.find("ch-counter");
  });

  it("should have Shadow DOM", () =>
    expect(counterRef.shadowRoot).toBeTruthy());

  it("should render without counter display when no ch-edit is present", async () => {
    const counterContainer = await page.find(
      "ch-counter >>> [part='counter-container']"
    );
    expect(counterContainer).toBeNull();
  });

  it("should render without counter display when ch-edit has no maxLength", async () => {
    await page.setContent(`
      <ch-counter>
        <ch-edit></ch-edit>
      </ch-counter>
    `);
    await page.waitForChanges();

    const counterContainer = await page.find(
      "ch-counter >>> [part='counter-container']"
    );
    expect(counterContainer).toBeNull();
  });
});

describe("[ch-counter][functionality]", () => {
  let page: E2EPage;
  let counterRef: E2EElement;
  let inputRef: E2EElement;
  let editRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
        <ch-counter>
          <ch-edit max-length="100" ></ch-edit>
        </ch-counter>
      `,
      failOnConsoleError: true
    });

    counterRef = await page.find("ch-counter");
    inputRef = await page.find("ch-edit >>> input");
    editRef = await page.find("ch-edit");
  });

  it("should display counter when ch-edit has maxLength", async () => {
    const counterContainer = await page.find(
      "ch-counter >>> [part='counter-container']"
    );
    const counterText = await page.find("ch-counter >>> [part='counter-text']");

    expect(counterContainer).toBeTruthy();
    expect(counterText).toBeTruthy();
    expect(await counterText.textContent).toBe("0 / 100");
  });

  it("should update counter when typing in ch-edit", async () => {
    inputRef.press("H");
    inputRef.press("e");
    inputRef.press("l");
    inputRef.press("l");
    inputRef.press("o");
    inputRef.press(" ");
    inputRef.press("W");
    inputRef.press("o");
    inputRef.press("r");
    inputRef.press("l");
    inputRef.press("d");
    await page.waitForChanges();

    const counterText = await page.find("ch-counter >>> [part='counter-text']");
    expect(await counterText.textContent).toBe("11 / 100");
  });

  it("should show warning state when approaching limit", async () => {
    const longText = "a".repeat(81);
    await inputRef.type(longText);
    await page.waitForChanges();

    const counterText = await page.find("ch-counter >>> [part='counter-text']");
    expect(await counterText.textContent).toBe("81 / 100");
    expect(await counterText.getAttribute("class")).toContain(
      "counter-warning"
    );
  });

  it("should show error state when at limit", async () => {
    const longText = "a".repeat(100);
    await inputRef.type(longText);
    await page.waitForChanges();

    const counterText = await page.find("ch-counter >>> [part='counter-text']");
    expect(await counterText.textContent).toBe("100 / 100");
    expect(await counterText.getAttribute("class")).toContain("counter-error");
  });

  it("should show error state when exceeding limit", async () => {
    const longText = "a".repeat(105);
    await inputRef.type(longText);
    await page.waitForChanges();

    const counterText = await page.find("ch-counter >>> [part='counter-text']");
    expect(await counterText.textContent).toBe("100 / 100");
    expect(await counterText.getAttribute("class")).toContain("counter-error");
  });

  it("should handle initial value correctly", async () => {
    await page.setContent(`
      <ch-counter initial-value="Initial text">
        <ch-edit max-length="100"></ch-edit>
      </ch-counter>
    `);
    await page.waitForChanges();

    const counterText = await page.find("ch-counter >>> [part='counter-text']");
    expect(await counterText.textContent).toBe("12 / 100");
  });

  it("should update counter when initial value changes", async () => {
    await counterRef.setProperty("initialValue", "Updated text");
    await page.waitForChanges();

    const counterText = await page.find("ch-counter >>> [part='counter-text']");
    expect(await counterText.textContent).toBe("12 / 100");
  });

  it("should work with multiline ch-edit", async () => {
    await page.setContent(`
      <ch-counter>
        <ch-edit multiline max-length="50"></ch-edit>
      </ch-counter>
    `);
    await page.waitForChanges();

    const textarea = await page.find("ch-edit >>> textarea");
    const counterText = await page.find("ch-counter >>> [part='counter-text']");

    expect(counterText).toBeTruthy();
    expect(await counterText.textContent).toBe("0 / 50");

    await textarea.type("Multiline text\nwith newlines");
    await page.waitForChanges();

    const counterTextUpdated = await page.find(
      "ch-counter >>> [part='counter-text']"
    );
    expect(await counterTextUpdated.textContent).toBe("28 / 50");
  });
});
